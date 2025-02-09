import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  players: string;

  @Column({ nullable: true })
  cards: string;

  @Column({ nullable: true, unique: true })
  roomId: string;

  @Column({ nullable: true })
  revealedCards: string;

  @Column({ nullable: true })
  currentRound: number;

  @Column()
  dateCreated: Date;

  @Column({ default: false })
  gameStarted: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isEnded: boolean;
}
