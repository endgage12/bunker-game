import { io, Socket } from 'socket.io-client'
import axios from 'axios'
import { useRoomStore } from '@/stores/roomStore.ts'
import { useRoute } from 'vue-router'
import type { Player } from '@/types/playerType.ts'
import type { Room } from '@/types/roomType.ts'
import type { Card } from '@/types/cardType.ts'

interface RoomList {
  roomId: string
  players: Player[]
}

class SocketService {
  private socket: Socket
  private roomList: Array<number> = []
  private roomStore: ReturnType<typeof useRoomStore> | null = null
  constructor() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.socket = null
    this.roomList = []
  }

  init() {
    this.roomStore = useRoomStore()
    const route = useRoute()
    this.socket = io('http://localhost:3000', {
      auth: {
        roomId: route.params?.roomId,
        username: this.roomStore.username,
        uuid: this.roomStore.uuid,
      },
    })

    // Обработчики ошибок
    this.socket.on('connect_error', (err) => {
      console.error('Connection error:', err)
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  }

  // Создание комнаты
  createRoom(playerName: string) {
    return new Promise((resolve, reject) => {
      this.socket.emit('createRoom', playerName, async (response: object) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (response.roomId) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          this.roomList = this.roomList ? [...this.roomList, response.roomId] : [response.roomId]
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          await axios.post('http://localhost:3000/room/create', { roomId: response.roomId })
          resolve(response)
        } else {
          reject(new Error('Failed to create room'))
        }
      })
    })
  }

  // Присоединение к комнате
  joinRoom(roomId: string, username: string) {
    this.socket.emit('joinRoom', { roomId, username })
  }

  changePlayerReady(roomId: string, player: object) {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      this.socket.emit('changePlayerReady', { roomId, player }, (response) => {
        console.log(response, !response || Array.isArray(response))
        if (!response || !Array.isArray(response)) reject(new Error(response.error))

        resolve(response)
      })
    })
  }

  // Слушатели событий
  onGameStateUpdate(callback: never) {
    this.socket.on('gameState', callback)
  }

  onPlayerJoined(callback: (room: Room) => void) {
    this.socket.on('playerJoined', callback)
  }

  onPlayerChangeStatus(callback: (room: Room) => void) {
    this.socket.on('playerChangeStatus', callback)
  }
  onGameStarted(callback: (room: Room) => void) {
    this.socket.on('gameStarted', callback)
  }

  onCardUpdated(callback: (room: Room) => void) {
    this.socket.on('onCardUpdated', callback)
  }

  onGetRooms(callback: (room: RoomList[]) => void) {
    this.socket.on('onGetRooms', callback)
  }

  onGetMyCard(callback: (cards: Card[]) => void) {
    this.socket.on('onGetMyCard', callback)
  }

  // Отправка действий
  startGame() {
    this.socket.emit('startGame')
  }

  updateCard(uuid: string, newData: Card) {
    this.socket.emit('updateCard', { uuid, newData })
  }

  getRooms() {
    this.socket.emit('getRooms')
  }

  revealCard(cardType: string) {
    this.socket.emit('revealCard', {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      roomId: this.roomId,
      cardType,
    })
  }

  submitVote(playerId: string) {
    this.socket.emit('submitVote', {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      roomId: this.roomId,
      votedPlayerId: playerId,
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
    }
  }
}

export default new SocketService()
