import { Module } from '@nestjs/common';
import { TaskController } from '../infra/controllers/task.controller';
import { TaskService } from '../domain/services/task.service';
import { TaskModule } from './task.module';

@Module({
  imports: [TaskModule],
})
export class AppModule { }
