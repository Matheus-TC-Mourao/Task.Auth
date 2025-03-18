import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.task.findMany({ where: { userId } });
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
