import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksQuery } from 'src/interfaces/tasks-query.interface';
import { Prisma, TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: TasksQuery) {
    const { status, search, page, limit } = query;
    const skip = (page - 1) * limit;

    const filters: Prisma.TaskWhereInput = {};

    if (status) {
      filters.status = status as TaskStatus;
    }

    if (search) {
      filters.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const whereCondition: Prisma.TaskWhereInput = { userId, ...filters };

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      skip,
      take: limit,
    });

    const total = await this.prisma.task.count({ where: whereCondition });

    return {
      data: tasks,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task com id ${id} não encontrada`);
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('Acesso negado!');
    }

    return task;
  }

  async create(createTaskDto: CreateTaskDto, userId: string) {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status,
        due_date: createTaskDto.due_date,
        userId,
      },
    });
  }

  async update(id: string, userId: string, updateTaskDto: UpdateTaskDto) {
    await this.findOne(id, userId);
    return this.prisma.task.update({
      where: { id },
      data: { ...updateTaskDto },
    });
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.task.delete({ where: { id } });
  }
}
