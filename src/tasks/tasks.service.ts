import { Injectable, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/user.entity';
import { Logger } from '@nestjs/common';

// Service 主要處理商業邏輯的操作
// 透過注入依賴的方式讓 Controller 和其他 Service 可以使用。
// According to new version of Nestjs/TypeORM documentation
// We don't need a file tasks.repository.ts
// We can use directly in tasks.service.ts
@Injectable()
export class TasksService {
    private logger = new Logger('Task Service', {timestamp: true});
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
    ){}

    async getTask(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
        const { status, search } = filterDto;
        const query = this.tasksRepository.createQueryBuilder('task');
        query.where({ user });

        if (status) {
            query.andWhere('task.status = :status', { status });
        }

        if (search) {
            query.andWhere (
                '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE Lower(:search))', // LIKE mean partial match
                { search: `%${search}%`},
            );
        }

        try {
            const tasks = await query.getMany();
            return tasks;
        } catch (error) {
            this.logger.error(
                `Failed to get tasks for user ${user.username}
                Filters: ${JSON.stringify(filterDto)}`, error.stack 
            );
            throw new InternalServerErrorException();
        }
    }

    async getTaskById(id: string, user: User): Promise<Task> {
        const found = await this.tasksRepository.findOneBy({ id: id, user: user });

        if (!found) {
            throw new NotFoundException(`Task ID "${id}" NOT FOUND`);
        }

        return found;
    }

    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> { 
        const { title, description } = createTaskDto;
        const task = this.tasksRepository.create({
            title,
            description,
            status: TaskStatus.OPEN,
            user
        });

        await this.tasksRepository.save(task);
        return task;
    }

    async deleteTask(id: string, user: User): Promise<void> {
        const res = await this.tasksRepository.delete({ id, user });
        
        if (res.affected === 0) {
            throw new NotFoundException(`Task id ${id} NOT FOUND`)
        }
    }

    async updateTaskStatus(id: string, status: TaskStatus, user: User): Promise<Task> {
        const task = await this.getTaskById(id, user);
        task.status = status;
        await this.tasksRepository.save(task);
        return task
    }
}
