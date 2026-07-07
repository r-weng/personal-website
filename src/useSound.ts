import { useSyncExternalStore } from 'react'
import { sound } from './sound'

export function useSound() {
  const sfxMuted = useSyncExternalStore(sound.subscribe, () => sound.sfxMuted)
  const musicOn = useSyncExternalStore(sound.subscribe, () => sound.musicOn)

  return {
    sfxMuted,
    musicOn,
    toggleSfx: () => sound.toggleSfx(),
    toggleMusic: () => sound.toggleMusic(),
  }
}
