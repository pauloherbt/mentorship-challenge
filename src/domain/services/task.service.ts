import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TaskModel } from '../models/task';
import { ObjectLiteral, Repository } from 'typeorm';
import { TaskEntity} from '../entities/task.entity';
import { FilterOperator, paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class TaskService {

  constructor(
    @Inject('TASK_REPOSITORY')
    private taskRepository:Repository<TaskEntity>){}
  
  async getAll(query:PaginateQuery): Promise<Paginated<TaskEntity>> {
    return await paginate(query,this.taskRepository,{
      sortableColumns: ['status'],
      defaultSortBy:[['status','ASC']],
      maxLimit:15,
      filterableColumns:{
        'status':[FilterOperator.EQ]
      },
      relativePath:true,
    })
  }

  async getById(id:string):Promise<TaskEntity | {} >  {
    const taskData = await this.taskRepository.findOne({where:{id}});
    if(!taskData){
      return {};
    }
    return taskData;
  }

  async create(task:TaskModel):Promise<ObjectLiteral>{
    return (await this.taskRepository.insert(task)).identifiers[0];
  }

  async update(id:string,task:TaskModel):Promise<void>{
    if(!await this.taskRepository.existsBy({id})){
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    await this.taskRepository.update({id},task);
  }

  async delete(id:string):Promise<void>{
    if(!await this.taskRepository.existsBy({id})){
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    await this.taskRepository.delete({id});
  }
}