import { Module } from '@nestjs/common';
import { Task } from './task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  // forFeature告訴nest.js在typeorm要存取相關的entity
  imports: [TypeOrmModule.forFeature([Task]),AuthModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
