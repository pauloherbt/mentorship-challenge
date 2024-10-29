import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskStatus } from '../enums/task-status';
import { UserEntity } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'tasks' })
export class TaskEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ApiProperty()
  @Column()
  title: string;
  @ApiProperty()
  @Column()
  description: string;
  @ApiProperty()
  @Column({ type: 'enum', enum: TaskStatus })
  status: TaskStatus;
  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
  @ApiProperty()
  @ManyToOne(() => UserEntity, (user) => user.tasks, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  createdBy: UserEntity;
}
