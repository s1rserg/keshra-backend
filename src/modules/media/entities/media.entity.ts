import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Nullable } from '@common/types';

@Entity('media')
export class MediaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'asset_id', type: 'varchar', length: 255 })
  assetId: string;

  @Column({ name: 'public_id', type: 'varchar', length: 255 })
  publicId: string;

  @Column({ type: 'varchar', length: 20 })
  format: string;

  @Column({ name: 'resource_type', type: 'varchar', length: 50 })
  resourceType: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'bigint' })
  bytes: number;

  @Column({ type: 'int' })
  width: number;

  @Column({ type: 'int' })
  height: number;

  @Column({ name: 'asset_folder', type: 'varchar', length: 255, nullable: true })
  assetFolder: Nullable<string>;

  @Column({ name: 'display_name', type: 'varchar', length: 255 })
  displayName: string;

  @Column({ name: 'secure_url', type: 'varchar', length: 500 })
  secureUrl: string;

  @CreateDateColumn({ name: 'record_created_at', type: 'timestamptz' })
  recordCreatedAt: Date;

  @UpdateDateColumn({ name: 'record_updated_at', type: 'timestamptz' })
  recordUpdatedAt: Date;
}
