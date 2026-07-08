import { useSyncExternalStore } from 'react'
import { sound } from './sound'

export function useSound() {
  const sfxMuted = useSyncExternalStore(sound.subscribe, () => sound.sfxMuted)

  return {
    sfxMuted,
    toggleSfx: () => sound.toggleSfx(),
  }
}
