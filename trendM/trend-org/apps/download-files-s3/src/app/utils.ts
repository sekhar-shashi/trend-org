import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import path = require('path');

@Injectable()
export class Utils {
     checkDir= (element = 'download') =>{
        const dir = path.join(__dirname ,element);
      
        if (!fs.existsSync(dir)){
          console.log('dir created')
            fs.mkdirSync(dir);
        }
        return element;
      }
       getTextFile = (filePath) => {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, (err, data) => {
                if(err) reject(err);
                else {
                    resolve(data); 
                }
            });
        })
      }
       writeFile =(blob, file = 'result.encrypted.txt',) => {
        const buffer = Buffer.from(blob, 'base64'); // decode
        return new Promise((resolve, reject) => {
          fs.writeFile(`${path.join(__dirname , file)}`, buffer, (err) => 
          {
            if (err) reject(err);
            console.log('File successfully written to disk');
          })    
        })
      }
}
