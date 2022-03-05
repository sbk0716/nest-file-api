import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { S3Module } from './s3/s3.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [S3Module],
})
export class AppModule {}
