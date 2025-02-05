import { io, Socket } from 'socket.io-client'
import axios from 'axios'

interface Player {
  id: string
  name: string
  ready: boolean
}

interface Room {
  players: Player[]
}

class SocketService {
  private socket: Socket
  private roomList: Array<number> = []
  constructor() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.socket = null
    this.roomList = []
  }

  init() {
    this.socket = io('http://localhost:3000', {
      auth: { roomId: 'HYI' },
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
  joinRoom(roomId: string, playerName: string) {
    return new Promise((resolve, reject) => {
      this.socket.emit('joinRoom', { roomId, playerName }, (response: object) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (response.players) {
          // this.roomList = [...this.roomList, roomId]
          resolve(response)
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          reject(new Error(response.error || 'Failed to join room'))
        }
      })
    })
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

  onPlayerJoined(callback: (room: Room) => Room) {
    this.socket.on('playerJoined', callback)
  }

  onPlayerChangeStatus(callback: (next: Player) => void) {
    this.socket.on('playerChangeStatus', callback)
  }

  onCardRevealed(callback: never) {
    this.socket.on('cardRevealed', callback)
  }

  onGameStarted(callback: never) {
    this.socket.on('gameStarted', callback)
  }

  // Отправка действий
  startGame() {
    this.socket.emit('startGame')
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
