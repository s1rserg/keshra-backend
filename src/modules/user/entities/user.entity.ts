import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Nullable } from '@common/types';

@Entity('users', { orderBy: { username: 'ASC' } })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'varchar', length: 50 })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  name: Nullable<string>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  surname: Nullable<string>;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  username: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
