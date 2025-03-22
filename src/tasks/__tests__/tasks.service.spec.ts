import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../tasks.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TaskStatus, Task } from '@prisma/client';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

describe('TasksService', () => {
  let service: TasksService;
  let prismaService: PrismaService;

  const mockTask: Task = {
    id: 'task-uuid',
    title: 'Test Task',
    description: 'Test Description',
    status: 'PENDING',
    due_date: new Date(),
    userId: 'user-uuid',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const tasksServiceMock = {
    findMany: jest.fn().mockResolvedValue([mockTask]),
    findUnique: jest.fn().mockResolvedValue(mockTask),
    create: jest.fn().mockResolvedValue(mockTask),
    update: jest.fn().mockResolvedValue(mockTask),
    delete: jest.fn().mockResolvedValue(mockTask),
    count: jest.fn().mockResolvedValue(1),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: {
            task: tasksServiceMock,
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of tasks', async () => {
      const query = { page: 1, limit: 10 };

      const findManySpy = jest
        .spyOn(prismaService.task, 'findMany')
        .mockResolvedValue([mockTask]);

      const result = await service.findAll(mockTask.userId, query);

      expect(result).toEqual({
        data: [mockTask],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
      expect(findManySpy).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a task if exists and belongs to user', async () => {
      jest.spyOn(prismaService.task, 'findUnique').mockResolvedValue(mockTask);

      const result = await service.findOne('task-uuid', 'user-uuid');
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      jest
        .spyOn(prismaService.task, 'findUnique')
        .mockResolvedValue(null as unknown as typeof mockTask);

      await expect(
        service.findOne('non-existing-id', 'user-uuid'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if task does not belong to user', async () => {
      const anotherTask = {
        ...mockTask,
        userId: 'another-user-uuid',
      };
      jest
        .spyOn(prismaService.task, 'findUnique')
        .mockResolvedValue(anotherTask);

      await expect(service.findOne('task-uuid', 'user-uuid')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('should create a task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test description',
        status: TaskStatus.PENDING,
        due_date: new Date(),
      };

      const createSpy = jest
        .spyOn(prismaService.task, 'create')
        .mockResolvedValue(mockTask);

      const result = await service.create(createTaskDto, 'user-uuid');
      expect(result).toEqual(mockTask);
      expect(createSpy).toHaveBeenCalledWith({
        data: { ...createTaskDto, userId: 'user-uuid' },
      });
    });
  });

  describe('update', () => {
    it('should update a task if valid', async () => {
      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockTask);
      const updateSpy = jest
        .spyOn(prismaService.task, 'update')
        .mockResolvedValue({ ...mockTask, title: 'Updated Task' });

      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        description: 'Updated description',
        status: TaskStatus.IN_PROGRESS,
      };
      const result = await service.update(
        'task-uuid',
        'user-uuid',
        updateTaskDto,
      );
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'task-uuid' },
        data: { ...updateTaskDto },
      });
      expect(result).toEqual({ ...mockTask, title: 'Updated Task' });

      findOneSpy.mockRestore();
      updateSpy.mockRestore();
    });
  });

  describe('delete', () => {
    it('should delete a task if valid', async () => {
      const findOndeSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockTask);
      const deleteSpy = jest
        .spyOn(prismaService.task, 'delete')
        .mockResolvedValue(mockTask);

      const result = await service.delete('task-uuid', 'user-uuid');

      expect(deleteSpy).toHaveBeenCalledWith({
        where: { id: 'task-uuid' },
      });
      expect(result).toEqual(mockTask);

      findOndeSpy.mockRestore();
      deleteSpy.mockRestore();
    });
  });
});
