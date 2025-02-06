import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

interface Card {
  title: string
  isRevealed: boolean
  value: string
}

interface Player {
  id: string
  username: string
  ready: boolean
  card: Card[]
}

export const useRoomStore = defineStore('roomStore', () => {
  const username = useStorage('my-username', '')
  const uuid = useStorage<string>('my-uuid', '')
  const players = ref<Player[]>()
  const isStartedGame = ref<boolean>(false)

  const currentPlayer = computed<Player>({
    get: () => currentPlayer.value,
    set: (newValue) => {
      currentPlayer.value = newValue
    },
  })

  return { currentPlayer, username, players, isStartedGame, uuid }
})
