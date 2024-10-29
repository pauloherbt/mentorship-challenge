import { Test } from "@nestjs/testing";
import { TaskService } from "../../../src/domain/services/task.service";
import { DeleteResult, InsertResult, Repository, UpdateResult } from "typeorm";
import { faker } from "@faker-js/faker";
import { NotFoundException } from "@nestjs/common";
import { paginate, PaginateQuery } from "nestjs-paginate";
import { TaskEntity } from "../../../src/domain/entities/task.entity";
import { UserEntity } from "../../../src/domain/entities/user.entity";
import { TaskStatus } from "../../../src/domain/enums/task-status";
import exp from "constants";

jest.mock('nestjs-paginate', () => {
  return {
    ...jest.requireActual('nestjs-paginate'),
    paginate: jest.fn()
  }
})
describe('TaskService', () => {

  let service: TaskService;
  let repository: Repository<TaskEntity>;

  const mockRepository = {
    findOne: jest.fn(),
    insert: jest.fn(),
    existsBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
  }

  const mockUser: UserEntity = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    createdAt: new Date(),
    updatedAt: new Date(),
    tasks: [],
  }

  const mockTask: TaskEntity = {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    description: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(Object.values(TaskStatus)) as TaskStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: mockUser,
  }

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [TaskService],
    }).useMocker(
      (token) => {
        if (token === "TASK_REPOSITORY") {
          return mockRepository;
        }
      })
      .compile();
    repository = module.get<Repository<TaskEntity>>("TASK_REPOSITORY");
    service = module.get<TaskService>(TaskService);
  });

  describe('getById', () => {
    it('should return {} if task doesnt exists', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      const result = await service.getById(faker.string.uuid());
      expect(result).toEqual({});
    });

    it('should return task data if task exists', async () => {
      const id = mockTask.id;
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockTask);

      const result = await service.getById(id);
      expect(result).toEqual(mockTask);
    });
  })
  describe('create', () => {
    it('should create a new task', async () => {
      const task = {
        title: mockTask.title,
        description: mockTask.description,
        status: mockTask.status
      }
      const insertResult: InsertResult = {
        identifiers: [['id', mockTask.id]],
        generatedMaps: [],
        raw: [],
      }
      const spy = jest.spyOn(repository, 'insert').mockResolvedValue(insertResult);
      const result = await service.create(task);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(task);
      expect(result).toContain(mockTask.id);
    })
  })
  describe('update', () => {
    it('should throw error if task doesnt exist', async () => {
      const id = faker.string.uuid();
      const spy = jest.spyOn(repository, 'existsBy').mockResolvedValue(false);
      const spyUpdate = jest.spyOn(repository, 'update');
      await expect(service.update(id, mockTask)).rejects.toThrow(NotFoundException);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith({ id });
      expect(spyUpdate).not.toHaveBeenCalled();
    })
    it('should update a task', async () => {
      const id = mockTask.id;
      const task = {
        title: 'new title',
        description: mockTask.description,
        status: mockTask.status
      }
      const repositoryOutput: UpdateResult = {
        raw: [],
        generatedMaps: [],
        affected: 1
      }
      jest.spyOn(repository,'existsBy').mockResolvedValue(true);
      const spy = jest.spyOn(repository, 'update').mockResolvedValue(repositoryOutput);
      await service.update(id, task);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith({ id }, task);
    })
  })

  describe('delete', () => {
    it('should throw error if task doesnt exist', async () => {
      const id = faker.string.uuid();
      const spy = jest.spyOn(repository, 'existsBy').mockResolvedValue(false);
      const spyDel = jest.spyOn(repository, 'delete');
      await expect(service.delete(id)).rejects.toThrow(NotFoundException);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith({ id });
      expect(spyDel).not.toHaveBeenCalled();
    })
    it('should delete a task', async () => {
      const id = mockTask.id;
      const repositoryOutput: DeleteResult = {
        raw: [],
        affected: 1
      }
      jest.spyOn(repository,'existsBy').mockResolvedValue(true);
      const spy = jest.spyOn(repository, 'delete').mockResolvedValue(repositoryOutput);
      await expect(service.delete(id)).resolves.not.toThrow();
      expect(spy).toHaveBeenCalledTimes(1);
    })
  })
  describe('getAll', () => {
    it('should return all tasks', async () => {
      const query: PaginateQuery = {
        path: 'tasks',
      };
      (paginate as jest.Mock).mockResolvedValue({
        data: [mockTask]
      });
      const spy = jest.spyOn(repository, 'find').mockResolvedValue([mockTask]);
      const result = await service.getAll(query);
      expect(spy).not.toHaveBeenCalled();
      expect(result).toEqual({ data: [mockTask] });
    })
  })
})