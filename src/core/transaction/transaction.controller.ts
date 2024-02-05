import { Body, Controller,Post,Get,Param,Headers,Logger,Header,ValidationPipe  } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { InformationCard} from '../entities';
import { InformationCardDTO } from './transaction.types';




@Controller()
export class TransactionController{
  constructor(private readonly transactionService: TransactionService) {}


  @Post('/tokens')
  
  createTransaction(@Body(new ValidationPipe({ transform: true })) informationCard: InformationCardDTO, @Headers() headers) {
    return this.transactionService.signin(informationCard,headers.token);
  }

  @Get('/target/:token')
  @Header('content-type', 'application/json')
  getTransaction(@Param('token') token: string) {
    return this.transactionService.getTransaction(token);
  }
}
