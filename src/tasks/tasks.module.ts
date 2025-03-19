import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [PrismaModule, WinstonModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
