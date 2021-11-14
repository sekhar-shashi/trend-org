import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}  
  @Get()
  async getData() {
     const arr = await this.appService.downloadS3();
     console.log('arrr', arr);
     this.appService.writeTofile(arr);
     console.log('write done');
     await this.appService.encryptFile();
     console.log('encrypt done done');
  }
}
