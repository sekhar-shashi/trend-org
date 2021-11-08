import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  callback= (arr) => this.appService.writeTofile(arr);
  @Get()
  async getData() {
    const x = await this.appService.downloadS3();
    
    await this.appService.encryptString();
  }
}
