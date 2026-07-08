// Web Audio chiptune engine — no audio assets, oscillators only.
// AudioContext is created/resumed exclusively inside user-gesture handlers
// (browser autoplay policy); hover blips silently no-op until unlocked.

type Listener = () => void

const SFX_KEY = 'sfx-muted'

class SoundEngine {
  private ctx: AudioContext | null = null
  private listeners = new Set<Listener>()

  sfxMuted = localStorage.getItem(SFX_KEY) === 'true'

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
}

export const sound = new SoundEngine()
