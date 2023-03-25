import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TasksModule,
    TypeOrmModule.forRoot({ // 使用 TypeOrmModule.forRoot() 去抓取 ormconfig.json 設定
      type: 'postgres',
      host: 'localhost',
      port: 5455,
      username: 'postgres',
      password: 'a12345',
      database: 'task-management',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
  ],
})
export class AppModule {}
