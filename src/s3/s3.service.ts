import { Injectable, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import {
  HttpException, 
  BadRequestException, 
} from '@nestjs/common';
import { AppResponseDto } from './dto/app-response.dto';
// import { fileTypeFromFile } from 'file-type';
const mime = require('mime-types')

// Below modules are needed for file processing
import * as fs from 'fs';
import stream = require('stream');
import * as util from 'util';
import { FastifyRequest, FastifyReply } from 'fastify'

@Injectable()
export class S3Service {
  async downloadFile(fileName): Promise<{ contentType:string, streamableFile: StreamableFile }> {
    // // uploads/sample.png
    const contentType = mime.lookup(`uploads/${fileName}`)
    console.log(contentType);
    const file = createReadStream(`uploads/${fileName}`);
    const streamableFile = new StreamableFile(file)
    return {
      contentType,
      streamableFile
    };
  }
  // upload file
  async uploadFile(req: FastifyRequest, res: FastifyReply): Promise<any> {
    // Check request is multipart
    if (!req.isMultipart()) {
      res.send(new BadRequestException(
        new AppResponseDto(400, undefined, 'Request is not multipart'),
      ))
      return 
    }
    const mp = await req.multipart(this.handler, onEnd);
    // for key value pairs in request
    mp.on('field', function(key: any, value: any) {
      console.log('form-data', key, value);
    });
    // Uploading finished
    async function onEnd(err: any) {
      if (err) {
        res.send(new HttpException('Internal server error', 500))
        return 
      }
      res.code(200).send(new AppResponseDto(200, undefined, 'Data uploaded successfully'))
    }
  }
  // Save files in directory
  async handler(field: string, file: any, filename: string, encoding: string, mimetype: string): Promise<void> {
    const pipeline = util.promisify(stream.pipeline);
    const writeStream = fs.createWriteStream(`uploads/${filename}`); // File path
    try {
      await pipeline(file, writeStream);
      console.info('Save files in uploads directory!!!')
    } catch (err) {
      console.error('Pipeline failed', err);
    }
  }
}
