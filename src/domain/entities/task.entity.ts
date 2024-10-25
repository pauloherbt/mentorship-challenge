import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TaskStatus } from '../enums/task-status';
import { UserEntity } from './user.entity';

@Entity({name:'tasks'})
export class TaskEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column()
    title: string;
    @Column()
    description: string;
    @Column({type:'enum',enum:TaskStatus})
    status: TaskStatus;
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
    @ManyToOne(() => UserEntity, user => user.tasks)
    @JoinColumn({ name: 'createdBy' })
    createdBy: UserEntity;
}