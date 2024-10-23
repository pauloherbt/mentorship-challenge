import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TaskModule } from './task.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true,
    cache:true,
  }),TaskModule],
})
export class AppModule { }
