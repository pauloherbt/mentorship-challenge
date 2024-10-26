import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Post, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { TaskEntity } from '../../domain/entities/task.entity';
import { TaskStatus } from '../../domain/enums/task-status';
import { TaskModel } from '../../domain/models/task';
import { TaskService } from '../../domain/services/task.service';
import { z } from 'zod';

@Controller("/tasks")
export class TaskController {

  constructor(private readonly taskService: TaskService) { }

  @Get()
  getAll(@Paginate() query:PaginateQuery): Promise<Paginated<TaskEntity>> {
    return this.taskService.getAll(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<TaskEntity | {} | { error: string }> {
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
      title: z.string().min(1),
      description: z.string().min(1),
      status: z.nativeEnum(TaskStatus)
    });
    const result = object.safeParse(input);
    if (result.error) {
      throw new BadRequestException(result.error.format());
    }
    return result.data;
  }

  @Post()
  async create(@Body() input: TaskModel, @Res() res: Response):Promise<Response<any, Record<string, any>>> {
    try {
      const task = this.validateInput(input);
      const result = await this.taskService.create(task);
      return res.status(HttpStatus.CREATED).json(result);
    }
    catch (error) {
      if (error instanceof BadRequestException) {
        const errMsg = {
          error: error.getResponse(),
        }
        return res.status(HttpStatus.BAD_REQUEST).json(errMsg);
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: error.message,
      });
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() input: TaskModel, @Res() res:Response) {
    try {
      const task = this.validateInput(input);
      await this.taskService.update(id, task);
      return res.status(HttpStatus.NO_CONTENT).json();
    }
    catch (error) {
      if (error instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: error.getResponse(),
        });
      }
      if(error instanceof NotFoundException){
        return res.status(HttpStatus.NOT_FOUND).json({
          error: error.message,
        });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: error.message,
      });
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res:Response) {
    try {
      await this.taskService.delete(id);
      return res.status(HttpStatus.NO_CONTENT).json();
    }
    catch (error) {
      if(error instanceof NotFoundException){
        return res.status(HttpStatus.NOT_FOUND).json({
          error: error.message,
        });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: error.message,
      });
      
    }
  }
}
