import type { Player } from './playerType'

export interface Room {
  isStarted: boolean
  idPlayerInFocus: string
  players: Player[]
}
