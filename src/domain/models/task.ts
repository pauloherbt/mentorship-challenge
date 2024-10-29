import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../enums/task-status';

export class TaskModel {
  id?: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
  @ApiProperty({ enum: [0, 1, 2] })
  status: TaskStatus;
  created_At?: Date;
  updated_At?: Date;
}
