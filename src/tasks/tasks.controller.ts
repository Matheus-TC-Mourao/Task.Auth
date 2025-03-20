import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { RequestUser } from 'src/interfaces/request-user.interface';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { TasksQueryDto } from './dto/task-query.dto';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private logger: Logger,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req: RequestUser, @Query() query: TasksQueryDto) {
    this.logger.log(
      'info',
      `Buscando tarefa para o usuário: ${req.user.userId}`,
    );

    const task = await this.tasksService.findAll(req.user.userId, query);

    this.logger.log('info', 'Tarefas encontradas com sucesso');
    return task;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: RequestUser) {
    this.logger.log(
      'info',
      `Buscando tarefa para o usuário: ${req.user.userId}`,
    );

    const task = await this.tasksService.findOne(id, req.user.userId);

    this.logger.log('info', `Tarefa encontrada com sucesso: ${task.id}`);
    return task;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: RequestUser,
  ) {
    this.logger.log(
      'info',
      `Criando tarefa para o usuário: ${req.user.userId}`,
    );
    const task = await this.tasksService.create(createTaskDto, req.user.userId);
    this.logger.log('info', `Tarefa criada com sucesso : ${task.id}`);
    return task;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: RequestUser,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    this.logger.log(
      'info',
      `Atualizando tarefa para o usuário: ${req.user.userId}`,
    );
    const task = await this.tasksService.update(
      id,
      req.user.userId,
      updateTaskDto,
    );
    this.logger.log('info', `Tarefa atualizada com sucesso: ${task.id}`);
    return task;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: RequestUser) {
    this.logger.log(
      'info',
      `Deletando tarefa para o usuário: ${req.user.userId}`,
    );
    const task = await this.tasksService.delete(id, req.user.userId);
    this.logger.log('info', `Tarefa deletada com sucesso: ${task.id}`);
    return task;
  }
}
