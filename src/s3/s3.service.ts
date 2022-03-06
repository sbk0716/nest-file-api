import { createReadStream } from 'fs';
import {
  Injectable,
  HttpException, 
  StreamableFile,
  BadRequestException, 
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AppResponseDto } from './dto/app-response.dto';
const mime = require('mime-types')
import * as fs from 'fs';

import * as AWS from 'aws-sdk';
// import { commonConfig } from '../configs/common';
import { DownloadParams } from './utils/downloadParams';
import { UploadParams } from './utils/uploadParams';
import { FastifyRequest, FastifyReply } from 'fastify'

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class S3Service {
  async downloadFile(fileName): Promise<{ contentType:string, streamableFile: StreamableFile }> {
    const bucketName = process.env.BUCKET_NAME || 'gw-report-export'
    const key = `test/${fileName}`
    const config = { region: process.env.REGION };
    if (process.env.NODE_ENV === 'development') {
      config['accessKeyId'] = process.env.ACCESS_KEY_ID;
      config['secretAccessKey'] = process.env.SECRET_ACCESS_KEY;
    }
    const s3 = new AWS.S3();
    const getParams = {
      Bucket: bucketName,
      Key: key,
    };
    // const s3Object: AWS.S3.GetObjectOutput = await s3
    //   .getObject(getParams)
    //   .promise()
    //   .catch((err) => {
    //     Logger.error(`[ERROR] - ${err?.message}`);
    //     throw new HttpException(
    //       {
    //         status: HttpStatus.INTERNAL_SERVER_ERROR,
    //         error: `${err?.message}`,
    //       },
    //       HttpStatus.INTERNAL_SERVER_ERROR,
    //     );
    //   });
    // if (s3Object?.ContentLength === 0) {
    //   Logger.error(
    //     `[ERROR] - ContentLength is zero! [ContentLength: ${s3Object?.ContentLength}]`,
    //   );
    //   throw new HttpException(
    //     {
    //       status: HttpStatus.BAD_REQUEST,
    //       error: `ContentLength is zero! [ContentLength: ${s3Object?.ContentLength}]`,
    //     },
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    const stream = s3.getObject(getParams).createReadStream();
    console.log(stream)
    const templatePath = `.tmp/${fileName}`;
    // create a write stream with the path including file name and its extension that you want to store the file in your directory.
    const ostream = fs.createWriteStream(templatePath);
    // using node.js pipe method to pipe the writestream
    stream.pipe(ostream);
    await _sleep(5000);
    // uploads/sample.png
    const contentType = mime.lookup(`.tmp/${fileName}`)
    console.log(contentType);
    const file = createReadStream(`.tmp/${fileName}`);
    const streamableFile = new StreamableFile(file)
    return {
      contentType,
      streamableFile
    };
    // const str = s3Object.Body.toString('utf-8');
    // // console.log(str)
    // const contentType = s3Object.ContentType
    // console.log(contentType)
    // const buffer = Buffer.from(str, "utf-8");
    // console.log(buffer)
    // const contentType = s3Object.ContentType
    // const templatePath = `.tmp/${fileName}`;
    // fs.writeFileSync(templatePath, str);
    // const file = createReadStream(`.tmp/${fileName}`);
    // const contentType = mime.lookup(`.tmp/${fileName}`)
    // const contentType = mime.lookup(`.tmp/${fileName}`)
    // const file = fs.createReadStream(`.tmp/${fileName}`);
    // console.log(contentType);
    // console.log('++++++++++++++++++++++++++++++++++++++=');
    // const streamableFile = new StreamableFile(file)
    // console.log(streamableFile)
    // return {
    //   contentType,
    //   streamableFile
    // };
  }
  // async downloadFile(fileName): Promise<{ contentType:string, streamableFile: StreamableFile }> {
  //   // uploads/sample.png
  //   const contentType = mime.lookup(`uploads/${fileName}`)
  //   console.log(contentType);
  //   const file = createReadStream(`uploads/${fileName}`);
  //   const streamableFile = new StreamableFile(file)
  //   return {
  //     contentType,
  //     streamableFile
  //   };
  // }
  // upload file
  async uploadFile(req: FastifyRequest, reply: FastifyReply): Promise<any> {
    // Check request is multipart
    if (!req.isMultipart()) {
      reply.send(new BadRequestException(
        new AppResponseDto(400, undefined, 'Request is not multipart'),
      ))
      return 
    }
    const data = await req.file()
    console.log('!!+++++++++++++++++++++++++++++++++++')
    console.log(data)
    console.log(data.fieldname)
    console.log(data.filename)
    console.log(data.encoding)
    console.log(data.mimetype)
    console.log(data.fields)
    console.log('!!+++++++++++++++++++++++++++++++++++')
    const buffer = await data.toBuffer()
    console.log(buffer)
    const bucketName = process.env.BUCKET_NAME || 'gw-report-export'
    const key = `test/${data.filename}`
    const uploadParams = {
      Bucket: bucketName,
      Body: buffer,
      Key: key,
      ContentType: data.mimetype,
    };
    const config = { region: process.env.REGION };
    if (process.env.NODE_ENV === 'development') {
      config['accessKeyId'] = process.env.ACCESS_KEY_ID;
      config['secretAccessKey'] = process.env.SECRET_ACCESS_KEY;
    }
    AWS.config.update(config);
    const sendData = await new AWS.S3.ManagedUpload({
      params: uploadParams,
    })
      .promise()
      .catch((err) => {
        Logger.error(`[ERROR] - ${err?.message}`);
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: `${err?.message}`,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
    Logger.log(`[INFO] - sendData.Key is ${sendData?.Key}`);
    reply.code(200).send(new AppResponseDto(200, undefined, 'Data uploaded successfully'))
    return sendData;
  }
  // async s3upload(params: UploadParams): Promise<AWS.S3.ManagedUpload.SendData> {
  //   const { file, bucketName, prefix } = params;
  //   const key = `${prefix || ''}/${file.name}`;
  //   const buffer = Buffer.from(file.data);
  //   const uploadParams = {
  //     Bucket: bucketName,
  //     Body: buffer,
  //     Key: key,
  //   };
  //   const config = { region: commonConfig.REGION };
  //   if (commonConfig.NODE_ENV === 'development') {
  //     config['accessKeyId'] = process.env.ACCESS_KEY_ID;
  //     config['secretAccessKey'] = process.env.SECRET_ACCESS_KEY;
  //   }
  //   AWS.config.update(config);
  //   const sendData = await new AWS.S3.ManagedUpload({
  //     params: uploadParams,
  //   })
  //     .promise()
  //     .catch((err) => {
  //       Logger.error(`[ERROR] - ${err?.message}`);
  //       throw new HttpException(
  //         {
  //           status: HttpStatus.INTERNAL_SERVER_ERROR,
  //           error: `${err?.message}`,
  //         },
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     });
  //   Logger.log(`[INFO] - sendData.Key is ${sendData?.Key}`);
  //   return sendData;
  // }

  // async s3download(params: DownloadParams): Promise<AWS.S3.GetObjectOutput> {
  //   const { filePath, bucketName } = params;
  //   const config = { region: commonConfig.REGION };
  //   if (commonConfig.NODE_ENV === 'development') {
  //     config['accessKeyId'] = process.env.ACCESS_KEY_ID;
  //     config['secretAccessKey'] = process.env.SECRET_ACCESS_KEY;
  //   }
  //   AWS.config.update(config);
  //   const s3 = new AWS.S3();
  //   const getParams = {
  //     Bucket: bucketName,
  //     Key: filePath,
  //   };
  //   const s3Object = await s3
  //     .getObject(getParams)
  //     .promise()
  //     .catch((err) => {
  //       Logger.error(`[ERROR] - ${err?.message}`);
  //       throw new HttpException(
  //         {
  //           status: HttpStatus.INTERNAL_SERVER_ERROR,
  //           error: `${err?.message}`,
  //         },
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     });
  //   if (s3Object?.ContentLength === 0) {
  //     Logger.error(
  //       `[ERROR] - ContentLength is zero! [ContentLength: ${s3Object?.ContentLength}]`,
  //     );
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.BAD_REQUEST,
  //         error: `ContentLength is zero! [ContentLength: ${s3Object?.ContentLength}]`,
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   return s3Object;
  // }

  // async getSignedUrl(params: DownloadParams): Promise<string> {
  //   const { filePath, bucketName } = params;
  //   const config = { region: commonConfig.REGION };
  //   if (commonConfig.NODE_ENV === 'development') {
  //     config['accessKeyId'] = process.env.ACCESS_KEY_ID;
  //     config['secretAccessKey'] = process.env.SECRET_ACCESS_KEY;
  //   }
  //   AWS.config.update(config);
  //   const s3 = new AWS.S3();
  //   const operation = 'getObject';
  //   const getParams = {
  //     Bucket: bucketName,
  //     Key: filePath,
  //     Expires: 300,
  //   };
  //   const url = await s3.getSignedUrlPromise(operation, getParams);
  //   Logger.log(`[INFO] - The URL is ${url}`);
  //   return url;
  // }
}
