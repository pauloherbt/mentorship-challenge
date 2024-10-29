import { taskProviders } from '../providers/task.providers';
import { DatabaseModule } from './db.module';
import { TaskService } from '../domain/services/task.service';
import { Module } from '@nestjs/common';
import { TaskController } from '../infra/controllers/task.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [TaskController],
  providers: [...taskProviders, TaskService],
})
export class TaskModule {}
