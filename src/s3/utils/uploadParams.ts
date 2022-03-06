import { IsString, IsNotEmpty } from 'class-validator';

interface IS3File {
  name: string;
  data: any;
}

export class UploadParams {
  @IsNotEmpty()
  file: IS3File;

  @IsNotEmpty()
  @IsString()
  prefix: string;

  @IsNotEmpty()
  @IsString()
  bucketName: string;
}
