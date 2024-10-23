import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { TaskStatus } from 'src/domain/enums/task-status';
import { TaskModel } from 'src/domain/models/task';
import { TaskService } from 'src/domain/services/task.service';
import { z } from 'zod';

@Controller("/tasks")
export class TaskController {

  constructor(private readonly taskService: TaskService) { }

  @Get()
  getAll(): Promise<TaskModel[]> {
    return this.taskService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      return await this.taskService.getById(id);
    }
    catch (error) {
      return {
        error: error.message
      }
    }
  }

  private validateInput(input: TaskModel): TaskModel {
    const object = z.object({
      title: z.string(),
      description: z.string(),
      status: z.nativeEnum(TaskStatus)
    });
    const result = object.safeParse(input);
    if (result.error) {
      throw result.error;
    }
    return result.data;
  }

  @Post()
  async create(@Body() input: TaskModel) {

    try {
      const task = this.validateInput(input);
      return await this.taskService.create(task);
    }
    catch (error) {
      return {
        error: error.message
      }
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() input: TaskModel) {
    try {
      const task = this.validateInput(input);
      return await this.taskService.update(id, task);
    }
    catch (error) {
      return {
        error: error.message
      }
    }
  }
}
