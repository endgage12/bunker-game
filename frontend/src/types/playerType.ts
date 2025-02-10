import type { Card } from './cardType'

export interface Player {
  id: string
  username: string
  ready: boolean
  kickVotes: number
  card: Card[]
}
