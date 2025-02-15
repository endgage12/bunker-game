import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import type { Player } from '@/types/playerType'
import type { Card } from '@/types/cardType'

export const useRoomStore = defineStore('roomStore', () => {
  const username = useStorage('my-username', '')
  const uuid = useStorage<string>('my-uuid', '')
  const players = ref<Player[]>([])
  const isStartedGame = ref<boolean>(false)
  const isEndedGame = ref<boolean>(false)
  const isFocused = ref<boolean>(false)

  const currentPlayer = computed<Player>({
    get: () => players.value?.find((p) => p.id === uuid.value) || ({} as Player),
    set: (newValue) => {
      const fU = players.value?.findIndex((p) => p.id === uuid.value)
      players.value[fU] = newValue
    },
  })

  return { currentPlayer, username, players, isStartedGame, isEndedGame, isFocused, uuid }
})
