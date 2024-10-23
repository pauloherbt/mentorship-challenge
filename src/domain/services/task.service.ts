import { Inject, Injectable } from '@nestjs/common';
import { TaskModel } from '../models/task';
import { ObjectLiteral, Repository } from 'typeorm';
import { TaskEntity } from '../entities/task.entity';
import { TaskStatus } from '../enums/task-status';

@Injectable()
export class TaskService {

  constructor(
    @Inject('TASK_REPOSITORY')
    private taskRepository:Repository<TaskEntity>){}
  
  private convertTaskEntityToTaskModel(task:TaskEntity):TaskModel{
    return {
      id:task.id,
      title:task.title,
      description:task.description,
      status: task.status,
      created_At:task.createdAt,
      updated_At: task.updatedAt
    };
  }

  async getAll(): Promise<TaskModel[]> {
    const tasks = await this.taskRepository.find();
    return tasks.map(this.convertTaskEntityToTaskModel);
  }

  async getById(id:string):Promise<TaskModel | {} >  {
    const taskData = await this.taskRepository.findOne({where:{id}});
    if(!taskData){
      return {};
    }
    return this.convertTaskEntityToTaskModel(taskData);
  }

  async create(task:TaskModel):Promise<ObjectLiteral>{
    return (await this.taskRepository.insert(task)).identifiers[0];
  }

  async update(id:string,task:TaskModel){
    await this.taskRepository.update({id},task);
  }

}