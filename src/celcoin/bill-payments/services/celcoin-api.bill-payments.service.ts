import { Injectable, Logger } from '@nestjs/common';
import { CelcoinApiBillPaymentAuthorizeDto } from '../dto/celcoin-api.billpayment.authorize.dto';
import { PerformPaymentControllerDto } from '../dto/celcoin-api.billpayment.perform-controller.dto';
import { PaymentDestination } from '../celcoin-api.bill-payments.destination.enum';
import { CelcoinAuthorizePaymentService } from './celcoin-api.bill-payments.authorize-payment.service';
import { CelcoinPerformPaymentService } from './celcoin-api.bill-payments.perform-payment.service';
import { CelcoinEndPaymentService } from './celcoin-api.bill-payments.end-payment.service';

@Injectable()
export class CelcoinApiBillPaymentsService {
    constructor(private readonly authorizePaymentService: CelcoinAuthorizePaymentService,
        private readonly performPaymentService: CelcoinPerformPaymentService,
        private readonly endPaymentService: CelcoinEndPaymentService,
        ){}

    private logger = new Logger('PaymentAuthorizations');

    async getPaymentAuthorization(celcoinApiBillPaymentAuthorizeDto: CelcoinApiBillPaymentAuthorizeDto): Promise<any> {
        return this.authorizePaymentService.getPaymentAuthorization(celcoinApiBillPaymentAuthorizeDto, this.logger);
    }

    async performPayment (paymentData: PerformPaymentControllerDto): Promise<any> {
        return this.performPaymentService.performPayment(paymentData, this.logger);
    }

    async endPayment(id: number, paymentDestination:  PaymentDestination): Promise<any> {
        return this.endPaymentService.endPayment(id, paymentDestination, this.logger);
    }
}
