// Web Audio chiptune engine — no audio assets, oscillators only.
// AudioContext is created/resumed exclusively inside user-gesture handlers
// (browser autoplay policy); hover blips silently no-op until unlocked.

type Listener = () => void

const SFX_KEY = 'sfx-muted'
const MUSIC_KEY = 'music-on'

class SoundEngine {
  private ctx: AudioContext | null = null
  private musicGain: GainNode | null = null
  private musicTimer: number | null = null
  private nextNoteTime = 0
  private noteIndex = 0
  private listeners = new Set<Listener>()

  sfxMuted = localStorage.getItem(SFX_KEY) === 'true'
  musicOn = false // never auto-starts; user must toggle each visit

  subscribe = (fn: Listener) => {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private notify() {
    this.listeners.forEach((fn) => fn())
  }

  /** Create/resume the AudioContext. Call ONLY from a user gesture. */
  private ensureCtx(): AudioContext | null {
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctx) return null
      this.ctx = new Ctx()
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    startOffset = 0,
    freqEnd?: number,
  ) {
    const ctx = this.ctx
    if (!ctx || ctx.state !== 'running' || this.sfxMuted) return
    const t = ctx.currentTime + startOffset
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    if (freqEnd) osc.frequency.linearRampToValueAtTime(freqEnd, t + dur)
    gain.gain.setValueAtTime(vol, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + dur + 0.02)
    osc.onended = () => {
      osc.disconnect()
      gain.disconnect()
    }
  }

  /** Hover blip — no-ops until a click has unlocked the context. */
  blip() {
    this.tone(660, 0.04, 'triangle', 0.04)
  }

  /** Click confirm — two-note square arpeggio. Unlocks context. */
  confirm() {
    this.ensureCtx()
    this.tone(523, 0.07, 'square', 0.06)
    this.tone(784, 0.09, 'square', 0.06, 0.07)
  }

  /** Bunny chirp. Unlocks context. */
  chirp() {
    this.ensureCtx()
    this.tone(1200, 0.09, 'square', 0.06, 0, 1800)
  }

  /** Lamp on/off power blips. Unlocks context. */
  power(on: boolean) {
    this.ensureCtx()
    if (on) {
      this.tone(220, 0.06, 'square', 0.06)
      this.tone(440, 0.08, 'square', 0.06, 0.06)
    } else {
      this.tone(440, 0.06, 'square', 0.06)
      this.tone(220, 0.08, 'square', 0.06, 0.06)
    }
  }

  toggleSfx() {
    this.sfxMuted = !this.sfxMuted
    localStorage.setItem(SFX_KEY, String(this.sfxMuted))
    if (!this.sfxMuted) this.confirm()
    this.notify()
  }

  // ── Music: 4-bar chiptune loop, lookahead scheduler ──────────────────────

  // ~104 BPM, 8th notes. 0 = rest. Frequencies in Hz.
  private static LEAD = [
    523, 0, 659, 523, 784, 0, 659, 0,
    523, 0, 659, 784, 880, 0, 784, 659,
    587, 0, 698, 587, 880, 0, 698, 0,
    784, 659, 523, 0, 659, 0, 523, 0,
  ]
  private static BASS = [
    131, 0, 131, 0, 165, 0, 165, 0,
    131, 0, 131, 0, 196, 0, 196, 0,
    147, 0, 147, 0, 175, 0, 175, 0,
    196, 0, 165, 0, 131, 0, 131, 0,
  ]
  private static STEP = 60 / 104 / 2 // 8th note duration

  private scheduleNote(index: number, time: number) {
    const ctx = this.ctx
    if (!ctx || !this.musicGain) return
    const lead = SoundEngine.LEAD[index % SoundEngine.LEAD.length]
    const bass = SoundEngine.BASS[index % SoundEngine.BASS.length]
    const play = (freq: number, type: OscillatorType, vol: number) => {
      if (!freq) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, time)
      gain.gain.setValueAtTime(vol, time)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + SoundEngine.STEP * 0.9)
      osc.connect(gain).connect(this.musicGain as GainNode)
      osc.start(time)
      osc.stop(time + SoundEngine.STEP)
      osc.onended = () => {
        osc.disconnect()
        gain.disconnect()
      }
    }
    play(lead, 'square', 0.5)
    play(bass, 'triangle', 0.7)
  }

  /** Toggle background music. Call ONLY from a user gesture. */
  toggleMusic() {
    if (this.musicOn) {
      this.stopMusic()
    } else {
      const ctx = this.ensureCtx()
      if (!ctx) return
      this.musicGain = ctx.createGain()
      this.musicGain.gain.value = 0.05
      this.musicGain.connect(ctx.destination)
      this.noteIndex = 0
      this.nextNoteTime = ctx.currentTime + 0.1
      this.musicTimer = window.setInterval(() => {
        while (this.nextNoteTime < (this.ctx as AudioContext).currentTime + 0.1) {
          this.scheduleNote(this.noteIndex, this.nextNoteTime)
          this.nextNoteTime += SoundEngine.STEP
          this.noteIndex++
        }
      }, 25)
      this.musicOn = true
    }
    localStorage.setItem(MUSIC_KEY, String(this.musicOn))
    this.notify()
  }

  private stopMusic() {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer)
      this.musicTimer = null
    }
    this.musicGain?.disconnect()
    this.musicGain = null
    this.musicOn = false
  }
}

export const sound = new SoundEngine()
