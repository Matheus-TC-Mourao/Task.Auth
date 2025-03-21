import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from '../tasks.controller';
import { TasksService } from '../tasks.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TaskStatus } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTask = {
    id: 'task-uuid',
    title: 'Test Task',
    description: 'Test Description',
    status: 'PENDING',
    due_date: new Date(),
    userId: 'user-uuid',
  };

  const mockLogger = {
    log: jest.fn(),
  };

  const tasksServiceMock = {
    create: jest.fn().mockResolvedValue(mockTask),
    findAll: jest.fn().mockResolvedValue({
      data: [mockTask],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    }),
    findOne: jest.fn().mockResolvedValue(mockTask),
    update: jest.fn().mockResolvedValue({ ...mockTask, title: 'Updated Task' }),
    delete: jest.fn().mockResolvedValue(mockTask),
  };

  const mockRequest = {
    user: { userId: 'user-uuid' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: TasksService, useValue: tasksServiceMock },
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return tasks', async () => {
      const query = { page: 1, limit: 10 };
      const result = await controller.findAll(mockRequest as any, query);
      expect(result).toEqual({
        data: [mockTask],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return a task', async () => {
      const result = await controller.findOne('task-uuid', mockRequest as any);
      expect(result).toEqual(mockTask);
    });
  });

  describe('create', () => {
    it('should create a task', async () => {
      const createTaskDto = {
        title: 'New Task',
        description: 'Task description',
        status: TaskStatus.PENDING,
        due_date: new Date(),
      };
      const result = await controller.create(createTaskDto, mockRequest as any);
      expect(result).toEqual(mockTask);
      expect(tasksServiceMock.create).toHaveBeenCalledWith(
        createTaskDto,
        'user-uuid',
      );
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto = {
        title: 'Updated Task',
        description: 'Updated',
        status: TaskStatus.IN_PROGRESS,
      };
      const result = await controller.update(
        'task-uuid',
        mockRequest as any,
        updateTaskDto,
      );
      expect(result.title).toEqual('Updated Task');
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      const result = await controller.delete('task-uuid', mockRequest as any);
      expect(result).toEqual(mockTask);
    });
  });
});
