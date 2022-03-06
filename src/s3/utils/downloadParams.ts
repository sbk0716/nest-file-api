import { IsString, IsNotEmpty } from 'class-validator';

export class DownloadParams {
  @IsNotEmpty()
  @IsString()
  filePath: string;

  @IsNotEmpty()
  @IsString()
  bucketName: string;
}
