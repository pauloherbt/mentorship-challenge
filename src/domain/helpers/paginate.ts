import { FilterOperator, PaginateConfig } from 'nestjs-paginate';
import { TaskEntity } from '../entities/task.entity';

const PAGINATE_CONFIG: PaginateConfig<TaskEntity> = {
  sortableColumns: ['status'],
  defaultSortBy: [['status', 'ASC']],
  maxLimit: 15,
  filterableColumns: {
    status: [FilterOperator.EQ],
  },
  relativePath: true,
};
export { PAGINATE_CONFIG };
