// Imports

import { Injectable } from '@nestjs/common';
import path = require('path');
import * as fs from 'fs';
import * as AWS  from 'aws-sdk';
import { KMS } from 'aws-sdk';


AWS.config.update({ region:'ap-southeast-2' });
// this is temp sts token
const param = {
  'accessKeyId':'ASIAUFYLYDQLQ7REWJNB',
  'sessionToken':'FwoGZXIvYXdzECYaDCY5LPjp6TO50xQhpiL6AfJWUI0ioqZJheN9xTPyb7of1G6FOTJscnWu8XGXBfDv9moCASjB3ALHNbStJ2Be4+5M1hCMC8vewUH2mXlt31FZ5h2t4414ruqemnzKkUKpVB2dVya2zUBJw5xkBeo62GliqhLyrfH3hhSw5Sh3GVrVNO8e9y921w12+FOzDZSVLYKOvzISPl9xFmLg5fI/iB/epUqsnVzBhuEIBpAusNdKwSdIB9l3Ckcdl/kDOrBVAdTgJVK28H2/NGW2jYfPr92IB3cV7gWgkSb6DeHZhrRDCJBmmYJJ5ckLhbH4f/Q2FfiYlg4mt57nPR8NFXCeXh6hcKbnfQ5zEFoo/7+kjAYyK0GzXq9caUn3jZIPFO6IAogOB1ez4dqHGd9F64rDwZbggpPzrjjd5/Yzlwg=',
  'secretAccessKey':'PrPmvR8MYkm5eS5IT9Jhw+y3RjBi7PQp6k3FFnmq',
  //'AWS_SECURITY_TOKEN':'FwoGZXIvYXdzEAgaDKyf94xML2P29lcE1iL6ARBxjl+PD8Tdo3N2A3yaswjcTbt7/d7so803J7smFbwCdKFsyUh+ip9I5OcNLxI2XVkQpMRNGuvHw5bgovQwT3awf+8u3U9aAEmGqfTDLHfHuG2H2DIFmCcCAAHSQFTx2nlE1i6ZuG03mBjOlScyJc7mv5wGJA8KwaoB00EO5nZv+JJ/xhBLD9Kg42Nhe2VS38YrlU0zSuc6V1VbvAm7g27R1SjFVSf3Doy3e27DWhxng5xRQcnIE6iXMECGu0MKt0y29woUgqPxoijNfanLuQZSgR4iLnqakF6RQEQBhuqD+9pbyO36NkyydvmCqNnBpcaqGMi0+rHxjoQom/SdjAYyK2DbSJXUTGSp2/QCttigtiaCjMSed1BbYd1iMGT/pplnGVuO+fT2IELrIog='
}
// declaration section 
const kms = new KMS(param);
const BUCKET = 'test-bucket-dir';
AWS.config.update(param);
const s3 = new AWS.S3(param);
const params = {
	Bucket: BUCKET
}

// check if dir exist 
const checkDir= (element = 'download') =>{
  const dir = path.join(__dirname ,element);

  if (!fs.existsSync(dir)){
    console.log('dir created')
      fs.mkdirSync(dir);
  }
  return element;
}

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: 'Welcome to download-files-s3!' };
  }
  /**
 * Encrypt
 */
 async encryptString(){
  const secret = fs.readFileSync(`${path.join(__dirname , 'array.txt')}`)
  const opt = {
    Plaintext: secret,
    KeyId: `arn:aws:kms:ap-southeast-2:287250586647:key/c6e5db0a-3fee-4408-ba96-07db5efd4a1d`,
  };
  const { CiphertextBlob } = await kms.encrypt(opt).promise();
  console.log('success after kms encryption')

  // store encrypted data 
  fs.writeFile(`${path.join(__dirname , 'result.encrypted.txt')}`, CiphertextBlob.toString('base64'), err => {
    if (err) throw err;
    console.log('File successfully written to disk');
    });    
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

  async downloadS3() {
    const arr = [];
    
      s3.listObjects(params, async(err, data) =>{
      if (err) return console.log(err);
       // create download dir if not exist
      const currPath = checkDir();
    
       Promise.all(data.Contents.map(async(fileObj) =>{
          const key = fileObj.Key;
          console.log('Downloading: ' + key);
      
          const fileParams = {
            Bucket: BUCKET,
            Key: key
          }
          // ignore folder to be downloaded
          if(fileObj.Size !=0){
            // eslint-disable-next-line no-useless-catch
              // create dir if required.
            const keySplit = key.split(`/`);
            for(let i = 0; i < keySplit.length -1; i++) {
              checkDir(currPath +'/' + keySplit[i]);
            }
            const file = fs.createWriteStream(path.join(__dirname ,`download`, `${key}`));
           s3.getObject(fileParams).createReadStream().pipe(file);
           arr.push(key);
          }
        }));
        this.writeTofile(arr);
        await this.encryptString();
    });
  }
}
