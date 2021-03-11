import { Module, HttpModule } from '@nestjs/common';
import { CelcoinApiAuthModule } from '../auth/celcoin-api.auth.module';
import { CelcoinApiBillPaymentsService } from './services/celcoin-api.bill-payments.service';
import { ConfigModule } from '@nestjs/config';
import celcoinApiConfig from '../config/celcoin-api.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillPaymentsController } from './celcoin-api.bill-payments.controller';
import { CelcoinApiBillPaymentsRepository } from './celcoin-api.bill-payments.repository';
import { CelcoinApiBillPaymentsStatusRepository } from './celcoin-api.bill-payments-status.repository';
import { CelcoinAuthorizePaymentService } from './services/celcoin-api.bill-payments.authorize-payment.service';
import { CelcoinEndPaymentService } from './services/celcoin-api.bill-payments.end-payment.service';
import { CelcoinPerformPaymentService } from './services/celcoin-api.bill-payments.perform-payment.service';

@Module({
    imports: [ConfigModule.forFeature(celcoinApiConfig),
              ConfigModule.forRoot(),
              TypeOrmModule.forFeature([CelcoinApiBillPaymentsRepository, CelcoinApiBillPaymentsStatusRepository]),  
              CelcoinApiAuthModule,
              HttpModule],
    controllers: [BillPaymentsController],
    providers: [CelcoinApiBillPaymentsService, CelcoinPerformPaymentService, CelcoinAuthorizePaymentService, CelcoinEndPaymentService]
})
export class BillPaymentsModule {}
