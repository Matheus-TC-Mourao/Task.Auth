import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { RequestUser } from 'src/interfaces/request-user.interface';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req: RequestUser) {
    return this.tasksService.findAll(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: RequestUser) {
    return this.tasksService.findOne(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: RequestUser,
  ) {
    return this.tasksService.create(createTaskDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: RequestUser,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, req.user.userId, updateTaskDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: RequestUser) {
    return this.tasksService.delete(id, req.user.userId);
  }
}
