import { Req, Res, Controller, Post, Get, Param, StreamableFile, Response,  HttpException, HttpStatus } from '@nestjs/common';
import { S3Service } from './s3.service';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileUploadDto } from './dto/file-upload.dto';
import { FastifyRequest, FastifyReply } from 'fastify'
import { v4 as uuidv4 } from 'uuid';
import { MultipartFile } from 'fastify-multipart';
import * as AWS from 'aws-sdk';

@ApiTags('File operations')
@ApiSecurity('access-key_for_rest-api')
@Controller('s3')
export class S3Controller {
  constructor(private s3Service: S3Service) {}

  @Get('/download-file/:fileName')
  @ApiOperation({
    summary: 'Execute TaskController.downloadFile()',
    description: 'file download',
  })
  @ApiResponse({
    status: 200,
    description: 'You have successfully downloaded a file.',
  })
  async downloadFile(
    @Response({ passthrough: true }) res: FastifyReply,
    @Param('fileName') fileName: string
    ): Promise<StreamableFile> {
    const { contentType, streamableFile } = await this.s3Service.downloadFile(fileName)
    const uuid = uuidv4()

    res.headers({
      'Content-Type': `${contentType}`,
      'Content-Disposition': `attachment; filename="${uuid}"`,
    });
    return streamableFile
  }

  @Post('/upload-file')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Execute TaskController.uploadFile()',
    description: 'file upload',
  })
  @ApiResponse({
    status: 200,
    description: 'You have successfully uploaded a file.',
  })
  @ApiBody({
    description: 'file object',
    type: FileUploadDto,
  })
  async uploadFile(@Req() req: FastifyRequest): Promise<AWS.S3.ManagedUpload.SendData> {
    // Check request is multipart
    if (!req.isMultipart()) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error:  'Request is not multipart',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const data: MultipartFile = await req.file()
    console.log('!!+++++++++++++++++++++++++++++++++++')
    console.log(data)
    console.log(data.fieldname)
    console.log(data.filename)
    console.log(data.encoding)
    console.log(data.mimetype)
    console.log(data.fields)
    console.log('!!+++++++++++++++++++++++++++++++++++')
    const sendData = await this.s3Service.uploadFile(data)
    console.log('sendData=', sendData)
    return sendData
  }
}
