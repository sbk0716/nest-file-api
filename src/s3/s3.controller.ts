import { Req, Res, Controller, Post, Get, Param, StreamableFile, Response} from '@nestjs/common';
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
    @Response({ passthrough: true }) res,
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
  async uploadFile(@Req() req: FastifyRequest, @Res() res: FastifyReply): Promise<any> {
    return this.s3Service.uploadFile(req, res)
  }
}
