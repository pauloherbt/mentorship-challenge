import { TaskEntity } from "src/domain/entities/task.entity";
import { DataSource } from "typeorm";

export const taskProviders = [
    {
      provide: 'TASK_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(TaskEntity),
      inject: ['DATA_SOURCE'],
    },
  ];