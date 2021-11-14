import { Test, TestingModule } from '@nestjs/testing';
import * as AWSMock from 'aws-sdk-mock';
import * as AWS  from 'aws-sdk';
import path = require('path');
import fs = require("fs");
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;
  let app :TestingModule;
  let s3;
  AWSMock.setSDKInstance(AWS);


  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
    const fileObject = Buffer.from('content');
    s3 = {
        getObject: jest.fn().mockResolvedValue(fileObject),
        listObjects: jest.fn().mockResolvedValue(
          {Contents: [{'Key':'someKey'}]}
        )
      };
    AWSMock.mock("S3", "listObjects", s3.listObjects);
    AWSMock.mock("S3", "getObject", s3.getObject);
  });

  afterAll(() =>{
    AWSMock.restore('S3');
  })
 
  describe('check few util method', () => {
    
    it('should return "Welcome to download-files-s3!"', () => {
      expect(service.getData()).toEqual({
        message: 'Welcome to download-files-s3!',
      });
    });

    it('S3 download listObject check', async() => {
      AWSMock.mock('S3', 'getObject', function (params, callback){
        console.log('------------- IT WORKS ------------');
        console.log(params);
        // console.log(process.env.S3_BUCKET);
         expect(params.Bucket === 'test-bucket-dir');
         expect(params.Key === 'someKey');
        callback(null, '');
      })
      await service.downloadS3(); // This is the function that uses the copyObject method    sinon.assert.calledOnce(AWSMock.S3);
      expect(s3.listObjects).toBeCalledWith(
        expect.objectContaining({
          Bucket: "test-bucket-dir"
        }),
        expect.any(Function)
      );
      
      });
      it('S3 download list object thorw error if wrong bucket is passed', async() => {
        await service.downloadS3(); // This is the function that uses the copyObject method    sinon.assert.calledOnce(AWSMock.S3);
        expect(s3.listObjects).toBeCalledWith(
          expect.not.objectContaining({
            Bucket: "test-bucket-dir1"
          }),
          expect.any(Function)
        );
        });

        it('KMS mock encrypt and check write file', async() => {
          AWSMock.mock('KMS', 'encrypt', function (params, callback){
            console.log('------------- IT WORKS ------------');
            console.log(params);
            // console.log(process.env.S3_BUCKET);
             expect(params.Bucket === 'test-bucket-dir');
             expect(params.Key === 'someKey');
             callback(null, {CiphertextBlob: Buffer.from(JSON.stringify('hello shashi'))});
          });
          const writeFileMock = jest.fn();

          jest.spyOn(fs, 'writeFile').mockImplementation(writeFileMock);

          await service.encryptFile(`${path.join(__dirname , './fixture/text1.txt')}`);
        
          expect(writeFileMock).toHaveBeenCalledTimes(1);
          });

          it('KMS mock encrypt and check write file should not be greater then 1', async() => {
            AWSMock.mock('KMS', 'encrypt', function (params, callback){
              console.log('------------- IT WORKS ------------');
              console.log(params);
              // console.log(process.env.S3_BUCKET);
               expect(params.Bucket === 'test-bucket-dir');
               expect(params.Key === 'someKey');
               callback(null, {CiphertextBlob: Buffer.from(JSON.stringify('hello shashi'))});
            });
            const writeFileMock = jest.fn();
  
            jest.spyOn(fs, 'writeFile').mockImplementation(writeFileMock);
  
            await service.encryptFile(`${path.join(__dirname , './fixture/text1.txt')}`);
          
            expect(writeFileMock).not.toHaveBeenCalledTimes(2);
            });
    }) 
});


