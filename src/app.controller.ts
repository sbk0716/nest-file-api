import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  StreamableFile,
  Response,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { AppService } from './app.service';
import { SampleDto } from './sample.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  sayHello() {
    return this.appService.getHello();
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('file')
  uploadFile(
    @Response({ passthrough: true }) res,
    @Body() body: SampleDto,
    @UploadedFile() file: Express.Multer.File,
  ) : StreamableFile {
    console.info('+++ body +++')
    console.info(body)
    console.info('+++ file +++')
    console.info(file)
    console.info('+++ file info +++')
    console.info(file.fieldname)
    console.info(file.originalname)
    console.info(file.mimetype)
    console.info(file.size)
    console.info('+++ file info +++')
    // const contentDisposition = 'inline'
    const contentDisposition = `attachment; filename="${file.originalname}"`
    console.info(contentDisposition)
    res.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': contentDisposition,
    });
    const streamableFile = new StreamableFile(file.buffer);
    return streamableFile
  }
}
