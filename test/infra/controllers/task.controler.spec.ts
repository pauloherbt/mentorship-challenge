import { TaskService } from "../../../src/domain/services/task.service"
import { TaskController } from "../../../src/infra/controllers/task.controller"
import { Test } from "@nestjs/testing"
import { faker } from "@faker-js/faker/.";
import { TaskEntity } from "../../../src/domain/entities/task.entity";
import { UserEntity } from "../../../src/domain/entities/user.entity";
import { TaskStatus } from "../../../src/domain/enums/task-status";
import { Paginated, PaginateQuery } from "nestjs-paginate";
import { ObjectLiteral } from "typeorm";
import { Response } from "express";
import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException } from "@nestjs/common";

describe('TaskController', () => {

    let taskService: TaskService;
    let taskController: TaskController;

    const response: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
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
        status: faker.helpers.arrayElement(Object.values(TaskStatus)
            .filter((value) => typeof value === 'number')) as TaskStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: mockUser,
    }

    const mockTaskService = {
        getAll: jest.fn(),
        getById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    }
    beforeAll(async () => {
        const module = await Test.createTestingModule({
            controllers: [TaskController],
        }).useMocker((token) => {
            if (token === TaskService) {
                return mockTaskService;
            }
        })
            .compile();
        taskService = module.get<TaskService>(TaskService);
        taskController = module.get(TaskController);
    })
    afterEach(() => {
        jest.clearAllMocks();
    })

    describe('getAll', () => {
        it('should return all tasks', async () => {
            const query: PaginateQuery = { path: 'tasks', };
            const mockResult: Paginated<TaskEntity> = {
                data: [mockTask, { ...mockTask, id: faker.string.uuid() }],
                links: { current: '' },
                meta: { currentPage: 1, search: '', select: [], searchBy: [], sortBy: [], itemsPerPage: 10, totalItems: 2, totalPages: 1 }
            }
            jest.spyOn(taskService, 'getAll').mockResolvedValue(mockResult);
            const result = await taskController.getAll(query);
            expect(result.data).toEqual(mockResult.data);
            expect(result).toEqual(mockResult);
        })
    })
    describe('getById', () => {
        it('should return task data if task exists', async () => {
            const id = mockTask.id;
            jest.spyOn(taskService, 'getById').mockResolvedValue(mockTask);
            const result = await taskController.getById(id);
            expect(result).toEqual(mockTask);
        });

        it('should return {} if task doesnt exists', async () => {
            const id = faker.string.uuid();
            jest.spyOn(taskService, 'getById').mockResolvedValue({});
            const result = await taskController.getById(id);
            expect(result).toEqual({});
        });
        it('should throw badRequestException if id is invalid', async () => {
            const id = faker.string.alpha();
            const spy = jest.spyOn(taskService, 'getById');
            await expect(taskController.getById(id)).rejects.toThrow(BadRequestException);
            expect(spy).not.toHaveBeenCalled();
        })

    })
    describe('create', () => {
        it('should create a new task', async () => {
            const task = {
                title: mockTask.title,
                description: mockTask.description,
                status: mockTask.status
            }
            const insertResult: ObjectLiteral = {
                id: mockTask.id
            }

            const spy = jest.spyOn(taskService, 'create').mockResolvedValue(insertResult);
            await taskController.create(task, response as Response);
            expect(spy).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);
            expect(response.json).toHaveBeenCalledWith({
                id: mockTask.id
            })
        })
        it('should throw BadRequestException if title is empty', async () => {
            const task = {
                title: '',
                description: mockTask.description,
                status: mockTask.status
            }

            await taskController.create(task, response as Response);
            expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
            expect(response.json).toHaveBeenCalledWith({
                error: expect.any(Object)
            })
        })
        it('should throw InternalServerErrorException if error', async () => {

            const spy = jest.spyOn(taskService, 'create')
                .mockRejectedValue(new InternalServerErrorException());
            await taskController.create(mockTask, response as Response);
            expect(spy).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(response.json).toHaveBeenCalledWith({
                error: expect.any(String)
            })
        })

    })
    describe('update', () => {
        it('should update a task', async () => {
            const id = mockTask.id;
            const task = {
                title: 'new title',
                description: mockTask.description,
                status: mockTask.status
            }

            const spy = jest.spyOn(taskService, 'update').mockResolvedValue();
            await taskController.update(id, task, response as Response);
            expect(spy).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
            expect(response.json).toHaveBeenCalledWith()
        })

        it('should throw NotFoundException if task doesnt exists', async () => {
            const id = faker.string.uuid();

            const spy = jest.spyOn(taskService, 'update')
                .mockRejectedValue(new NotFoundException(`Task with id ${id} not found`));
            await taskController.update(id, { ...mockTask }, response as Response);
            expect(spy).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(response.json).toHaveBeenCalledWith({
                error: expect.stringContaining(`Task with id ${id} not found`)
            })
        })
        it('should throw BadRequestException if title is empty', async () => {
            const id = mockTask.id;
            const task = {
                title: '',
                description: mockTask.description,
                status: mockTask.status
            }

            await taskController.update(id, task, response as Response);
            expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
            expect(response.json).toHaveBeenCalledWith({
                error: expect.any(Object)
            })
        })
        it('Should throw internal server if error', async () => {
            const id = mockTask.id;
            const task = {
                title: 'new title',
                description: mockTask.description,
                status: mockTask.status
            }

            const spy = jest.spyOn(taskService, 'update')
                .mockRejectedValue(new InternalServerErrorException());
            await taskController.update(id, task, response as Response);
            expect(spy).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(response.json).toHaveBeenCalledWith({
                error: expect.any(String)
            })
        })
    })
    describe('delete', () => {
        it('should delete a task', async () => {
            const id = mockTask.id;

            const spy = jest.spyOn(taskService, 'delete').mockResolvedValue();
            await taskController.delete(id, response as Response);
            expect(spy).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
            expect(response.json).toHaveBeenCalledWith()
        })

        it('should throw NotFoundException if task doesnt exists', async () => {
            const id = faker.string.uuid();

            const spy = jest.spyOn(taskService, 'delete')
                .mockRejectedValue(new NotFoundException(`Task with id ${id} not found`));
            await taskController.delete(id, response as Response);
            expect(spy).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(response.json).toHaveBeenCalledWith({
                error: expect.stringContaining(`Task with id ${id} not found`)
            })
        })
        it('Should throw internal server if error', async () => {
            const id = mockTask.id;

            const spy = jest.spyOn(taskService, 'delete')
                .mockRejectedValue(new Error());
            await taskController.delete(id, response as Response);
            expect(spy).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(response.json).toHaveBeenCalledWith({
                error: expect.any(String)
            })
        })
    })
})