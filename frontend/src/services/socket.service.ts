import { io, Socket } from 'socket.io-client'
import axios from 'axios'
import { useRoomStore } from '@/stores/roomStore.ts'
import { useRoute } from 'vue-router'
import type { Player } from '@/types/playerType.ts'
import type { Room } from '@/types/roomType.ts'
import type { Card } from '@/types/cardType.ts'

class SocketService {
  private socket: Socket | null
  private roomList: string[] = []
  private roomStore: ReturnType<typeof useRoomStore> | null = null
  constructor() {
    this.socket = null
    this.roomList = []
  }

  init() {
    const apiURL: string = import.meta.env.VITE_APP_API_URL
    this.roomStore = useRoomStore()
    const route = useRoute()
    this.socket = io(apiURL, {
      auth: {
        roomId: route.params?.roomId,
        username: this.roomStore.username,
        uuid: this.roomStore.uuid,
      },
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  }

  createRoom(playerName: string) {
    if (!this.socket) return

    this.socket.emit('createRoom', playerName, (response: Room) => {
      this.roomList = this.roomList ? [...this.roomList, response.roomId] : [response.roomId]
    })
    this.getRooms()
  }

  joinRoom(roomId: string, username: string) {
    if (!this.socket) return
    this.socket.emit('joinRoom', { roomId, username })
  }

  voteForKick(playerId: string) {
    if (!this.socket) return
    this.socket.emit('voteForKick', { playerId })
  }

  // Слушатели событий
  onRoomDataUpdated(callback: (room: Room) => void) {
    if (!this.socket) return
    this.socket.on('onRoomDataUpdated', callback)
  }

  onGetRooms(callback: (room: Room[]) => void) {
    if (!this.socket) return
    this.socket.on('onGetRooms', callback)
  }

  onGetMyCard(callback: (cards: Card[]) => void) {
    if (!this.socket) return
    this.socket.on('onGetMyCard', callback)
  }

  // Отправка действий
  startGame() {
    if (!this.socket) return
    this.socket.emit('startGame')
  }

  updateCard(uuid: string, newData: Card) {
    if (!this.socket) return
    this.socket.emit('updateCard', { uuid, newData })
  }

  getRooms() {
    if (!this.socket) return
    this.socket.emit('getRooms')
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
    }
  }
}

export default new SocketService()
