import {
  Injectable,
  HttpException, 
  StreamableFile,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as stream from 'stream';
import * as fs from 'fs';
import * as AWS from 'aws-sdk';
import * as mime from 'mime-types';
import { MultipartFile } from 'fastify-multipart';

@Injectable()
export class S3Service {
  async downloadFile(fileName: string): Promise<{ contentType: string, streamableFile: StreamableFile }> {
    const bucketName = process.env.BUCKET_NAME || 'gw-report-export'
    /**
     * @todo
     */
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
    /**
     * @see https://dev.to/ldsrogan/aws-sdk-with-javascript-download-file-from-s3-el2
     */
    const request = s3.getObject(getParams)
    const srcStream = request.createReadStream()
    const templatePath = `.tmp/${fileName}`;
    const dstStream = fs.createWriteStream(templatePath);

    /**
     * fileWrite
     * @param src 
     * @param dst 
     */
    const fileWrite = async (src: stream.Readable, dst: fs.WriteStream) => {
      let count = 0;
      let total = 0
      for await (const chunk of src) {
        count++;
        total += chunk.length;
        // console.log(chunk.toString("utf8"));
        // The writable.write() method writes some data to the stream
        dst.write(chunk)
      }
      console.log(`${count}回に分けて取得しました`);
      console.log(`合計${total}byte取得しました`);
    }

    // execute fileWrite
    await fileWrite(srcStream, dstStream).catch((e) => {
      console.error('[ERROR]execute fileWrite')
      console.error(e)
    });
    if (!mime.lookup(`.tmp/${fileName}`)) {
      return
    }
    const mimeType = mime.lookup(`.tmp/${fileName}`)
    const contentType = mimeType ? mimeType : 'text/plain'
    console.log('contentType=', contentType);
    const file = fs.createReadStream(`.tmp/${fileName}`);
    const streamableFile = new StreamableFile(file)
    return {
      contentType,
      streamableFile
    };
  }

  // upload file
  async uploadFile(data: MultipartFile): Promise<AWS.S3.ManagedUpload.SendData> {
    const buffer = await data.toBuffer()
    console.log('+++++++++++++++++++++++++++++++++++')
    console.log(buffer)
    console.log('+++++++++++++++++++++++++++++++++++')
    const bucketName = process.env.BUCKET_NAME || 'gw-report-export'
    /**
     * @todo
     */
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
    return sendData;
  }
}
