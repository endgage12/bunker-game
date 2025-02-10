import { Card } from '../modules/game/game.service';

export interface Player {
  id: string;
  username: string;
  card: Card[];
  isHost: boolean;
  isKicked: boolean;
  vote?: string;
  kickVotes: number;
  ready: boolean;
}
