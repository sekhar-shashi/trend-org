// Imports

import { Injectable } from '@nestjs/common';
import path = require('path');
import * as fs from 'fs';
import * as AWS  from 'aws-sdk';
import { KMS } from 'aws-sdk';
import { Utils } from './utils'


AWS.config.update({ region:'ap-southeast-2' });
// this is temp sts token
const param = {
  'accessKeyId':'',
  'sessionToken':'',
  'secretAccessKey':'',
}

const util = new Utils();

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: 'Welcome to download-files-s3!' };
  }
  /**
 * Encrypt
 */
 async encryptFile(inputPath = `${path.join(__dirname , 'array.txt')}`){
  const kms = new KMS(param);

  const secret = await util.getTextFile(inputPath);
 
  const opt = {
    Plaintext: secret,
    KeyId: `arn of KMS key secret`,
  };
  const { CiphertextBlob } = await kms.encrypt(opt).promise();
  console.log('success after kms encryption', CiphertextBlob)

  // store encrypted data 
   util.writeFile(CiphertextBlob);
}
  // save to disk
  writeTofile(arr, fileName = 'array.txt') {
    // write
    console.log('inside write', arr)
    const file = fs.createWriteStream(path.join(__dirname , fileName));
    file.on('error', function(err) { console.log('error at file write', err) });
    arr.forEach(function(v) { file.write(v + '\n'); });
    file.end();
  }

  async downloadS3(inputParam = param) {
    const BUCKET = 'test-bucket-dir';
    const s3 = new AWS.S3(inputParam);
    const params = {
      Bucket: BUCKET
    }
    const arr = [];
      console.log('download s3 called')
      await s3.listObjects(params, async (err, data) => {
      if (err)
        return console.log(err);
      // create download dir if not exist
      const currPath = util.checkDir();
        console.log('shashi', data);
      await Promise.all(data.Contents.map(async (fileObj) => {
        const key = fileObj.Key;
        console.log('Downloading: ' + key);

        const fileParams = {
          Bucket: BUCKET,
          Key: key
        };
        // ignore folder to be downloaded
        if (fileObj.Size != 0) {
          // eslint-disable-next-line no-useless-catch
          // create dir if required.
          const keySplit = key.split(`/`);
          for (let i = 0; i < keySplit.length - 1; i++) {
            util.checkDir(currPath + '/' + keySplit[i]);
          }
          const file = fs.createWriteStream(path.join(__dirname, `download`, `${key}`));
          s3.getObject(fileParams).createReadStream().pipe(file);
          arr.push(key);
        }
      }));
    }).promise();
    return arr;
  }
}
