import type { Player } from './playerType'

export interface Room {
  roomId: string
  isStarted: boolean
  idPlayerInFocus: string
  gamePhase: string
  players: Player[]
}
