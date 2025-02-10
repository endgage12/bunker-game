import type { Player } from './playerType'

export interface Room {
  isStarted: boolean
  players: Player[]
}
