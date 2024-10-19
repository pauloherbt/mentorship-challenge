import { Inject, Injectable } from '@nestjs/common';
import { TaskModel } from '../models/task';
import { Repository } from 'typeorm';
import { TaskEntity } from '../entities/task.entity';
import { title } from 'process';
import { TaskStatus } from '../enums/task-status';

@Injectable()
export class TaskService {

  constructor(
    @Inject('TASK_REPOSITORY')
    private taskRepository:Repository<TaskEntity>){}
  
  convertTaskEntityToTaskModel(task:TaskEntity):TaskModel{
    return {
      id:task.id,
      title:task.title,
      description:task.description,
      status: TaskStatus[task.status]
    };
  }
  async getAll(): Promise<TaskModel[]> {
    const tasks = await this.taskRepository.find();
    return tasks.map(this.convertTaskEntityToTaskModel);
  }

}