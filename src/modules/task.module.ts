import { taskProviders } from "src/providers/task.providers";
import { DatabaseModule } from "./db.module";
import { TaskService } from "src/domain/services/task.service";
import {Module} from "@nestjs/common";
import { TaskController } from "src/infra/controllers/task.controller";

@Module({
    imports:[DatabaseModule],
    controllers:[TaskController],
    providers: [...taskProviders,TaskService],
  })
  export class TaskModule {}