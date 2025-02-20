import type { Player } from './playerType'
import type { Disaster } from '@/types/disasterType.ts'

export interface Room {
  roomId: string
  isStarted: boolean
  isEnded: boolean
  idPlayerInFocus: string
  gamePhase: string
  chatGptData: string
  disaster: Disaster
  players: Player[]
}
