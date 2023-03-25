import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { Logger } from '@nestjs/common';

// 控制器，從 Module 被呼叫，並擁有基本路由設定
// 主要負責接收 client 端的 requests 以及 response。
@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
    private logger = new Logger('Task Controller');
    constructor(private taskService: TasksService) { }

    @Get()
    getTasks(
        @Query() filterDto: GetTasksFilterDto, 
        @GetUser() user: User
    ): Promise<Task[]> {
        this.logger.verbose(`!!! User "${user.username}" GET All tasks, Filters: ${JSON.stringify(filterDto)}`)
        return this.taskService.getTask(filterDto, user);
    }

    @Get('/:id')
    getTaskById(@Param('id') id: string, @GetUser() user: User): Promise<Task> {
        return this.taskService.getTaskById(id, user);
    }

    @Post()
    createTask(
        @Body() createTaskDto: CreateTaskDto,
        @GetUser() user: User
    ): Promise<Task> {
        return this.taskService.createTask(createTaskDto, user);
    }

    @Delete('/:id')
    deleteTask(@Param('id') id: string, @GetUser() user: User): Promise<void> {
        return this.taskService.deleteTask(id, user);
    }

    @Patch('/:id/status')
    updateTaskStatus(
        @Param('id') id: string,
        @Body() updateTaskStatusDto: UpdateTaskStatusDto,
        @GetUser() user: User
    ): Promise<Task> {
        const { status } = updateTaskStatusDto;
        return this.taskService.updateTaskStatus(id, status, user);
    }
}
