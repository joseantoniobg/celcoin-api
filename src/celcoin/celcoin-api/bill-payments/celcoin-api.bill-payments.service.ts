import { Injectable, HttpService } from '@nestjs/common';
import { CelcoinApiBillPaymentAuthorizeDto } from './dto/celcoin-api.billpayment.authorize.dto';

@Injectable()
export class BillPaymentsService {
    constructor(httpService: HttpService){}

    async authorizePayment(authPaymentDto: CelcoinApiBillPaymentAuthorizeDto){
        
    }
}
