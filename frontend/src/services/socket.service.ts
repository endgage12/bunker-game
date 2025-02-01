// src/services/socket.service.js
import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket
  private roomId: null
  constructor() {
    this.socket = null
    this.roomId = null
  }

  init() {
    this.socket = io('http://localhost:3000')

    // Обработчики ошибок
    this.socket.on('connect_error', (err) => {
      console.error('Connection error:', err)
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  }

  // Создание комнаты
  createRoom(playerName) {
    return new Promise((resolve, reject) => {
      this.socket.emit('createRoom', playerName, (response) => {
        if (response.roomId) {
          this.roomId = response.roomId
          resolve(response)
        } else {
          reject(new Error('Failed to create room'))
        }
      })
    })
  }

  // Присоединение к комнате
  joinRoom(roomId, playerName) {
    return new Promise((resolve, reject) => {
      this.socket.emit('joinRoom', { roomId, playerName }, (response) => {
        if (response.players) {
          this.roomId = roomId
          resolve(response)
        } else {
          reject(new Error(response.error || 'Failed to join room'))
        }
      })
    })
  }

  // Слушатели событий
  onGameStateUpdate(callback) {
    this.socket.on('gameState', callback)
  }

  onPlayerJoined(callback) {
    this.socket.on('playerJoined', callback)
  }

  onCardRevealed(callback) {
    this.socket.on('cardRevealed', callback)
  }

  // Отправка действий
  startGame() {
    this.socket.emit('startGame', this.roomId)
  }

  revealCard(cardType) {
    this.socket.emit('revealCard', {
      roomId: this.roomId,
      cardType,
    })
  }

  submitVote(playerId) {
    this.socket.emit('submitVote', {
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
