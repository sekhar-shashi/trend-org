import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  callback= (arr) => this.appService.writeTofile(arr);
  @Get()
  async getData() {
     await this.appService.downloadS3();
  }
}
