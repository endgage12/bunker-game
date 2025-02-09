import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column({ default: true })
  isActive: boolean;
}
