import {
  ApiProperty,
} from '@nestjs/swagger';

// export class FileUploadDto {
//   @ApiProperty({ type: 'string', format: 'binary' })
//   uploadFile: any;
// }
export class FileUploadDto {
  @ApiProperty({
    type: ['file'],
    required: true,
    name: 'uploadFiles',
  })
  uploadFiles: any;
}