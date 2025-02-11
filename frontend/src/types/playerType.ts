import type { Card } from './cardType'

export interface Player {
  id: string
  username: string
  card: Card[]
  isHost: boolean
  isKicked: boolean
  vote?: string
  kickVotes: number
  ready: boolean
}
