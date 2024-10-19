import { Controller, Get } from '@nestjs/common';
import { TaskModel } from 'src/domain/models/task';
import { TaskService } from 'src/domain/services/task.service';

@Controller("/tasks")
export class TaskController {
  
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async getAll(): Promise<TaskModel[]> {
    return await this.taskService.getAll();
  }
}
