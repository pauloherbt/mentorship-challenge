import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiOkPaginatedResponse,
  Paginate,
  Paginated,
  PaginatedSwaggerDocs,
  PaginateQuery,
} from 'nestjs-paginate';
import { TaskEntity } from '../../domain/entities/task.entity';
import { TaskStatus } from '../../domain/enums/task-status';
import { TaskModel } from '../../domain/models/task';
import { TaskService } from '../../domain/services/task.service';
import { z } from 'zod';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PAGINATE_CONFIG } from '../../domain/helpers/paginate';

@Controller('/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOperation({ summary: 'get tasks paginated' })
  @ApiOkResponse({ description: 'operation success' })
  @PaginatedSwaggerDocs(TaskEntity, PAGINATE_CONFIG)
  getAll(@Paginate() query: PaginateQuery): Promise<Paginated<TaskEntity>> {
    return this.taskService.getAll(query);
  }

  private validateParam(id: string) {
    const inputSchema = z.string().uuid().safeParse(id);
    if (inputSchema.error) {
      throw new BadRequestException(inputSchema.error.format());
    }
  }
  @Get(':id')
  @ApiOperation({ summary: 'get a task by id' })
  @ApiBadRequestResponse({ description: 'invalid id type' })
  @ApiOkResponse({ description: 'operation success' })
  @ApiResponse({ type: TaskEntity })
  async getById(
    @Param('id') id: string,
  ): Promise<TaskEntity | {} | { error: string }> {
    this.validateParam(id);
    return await this.taskService.getById(id);
  }

  private validateInput(input: TaskModel): TaskModel {
    const object = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      status: z.nativeEnum(TaskStatus),
    });
    const result = object.safeParse(input);
    if (result.error) {
      throw new BadRequestException(result.error.format());
    }
    return result.data;
  }

  @Post()
  @ApiOperation({ summary: 'Create a task' })
  @ApiBadRequestResponse({ description: 'invalid input data' })
  @ApiCreatedResponse({ description: 'task created' })
  async create(
    @Body() input: TaskModel,
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>>> {
    try {
      const task = this.validateInput(input);
      const result = await this.taskService.create(task);
      return res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      if (error instanceof BadRequestException) {
        const errMsg = {
          error: error.getResponse(),
        };
        return res.status(HttpStatus.BAD_REQUEST).json(errMsg);
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: error.message,
      });
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'update a task' })
  @ApiBadRequestResponse({ description: 'invalid input data' })
  @ApiNoContentResponse({ description: 'task updated' })
  async update(
    @Param('id') id: string,
    @Body() input: TaskModel,
    @Res() res: Response,
  ) {
    this.validateParam(id);
    const task = this.validateInput(input);
    try {
      await this.taskService.update(id, task);
      return res.status(HttpStatus.NO_CONTENT).json();
    } catch (error) {
      if (error instanceof NotFoundException) {
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
  @ApiOperation({ summary: 'delete a task' })
  @ApiNotFoundResponse({ description: 'task not found' })
  @ApiNoContentResponse({ description: 'task deleted' })
  async delete(@Param('id') id: string, @Res() res: Response) {
    this.validateParam(id);
    try {
      await this.taskService.delete(id);
      return res.status(HttpStatus.NO_CONTENT).json();
    } catch (error) {
      if (error instanceof NotFoundException) {
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
