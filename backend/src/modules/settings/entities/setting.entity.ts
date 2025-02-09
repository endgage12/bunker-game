import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: null })
  type_id: number;

  @Column({ nullable: false })
  title: string;

  @Column()
  value: string;

  @Column({ default: true })
  isActive: boolean;
}
