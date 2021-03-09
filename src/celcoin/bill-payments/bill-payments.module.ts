import { Module, HttpModule } from '@nestjs/common';
import { CelcoinApiAuthModule } from '../auth/celcoin-api.auth.module';
import { CelcoinApiBillPaymentsService } from './celcoin-api.bill-payments.service';
import { ConfigModule } from '@nestjs/config';
import celcoinApiConfig from '../config/celcoin-api.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillPaymentsController } from './celcoin-api.bill-payments.controller';
import { CelcoinApiBillPaymentsRepository } from './celcoin-api.bill-payments.repository';
import { CelcoinApiBillPaymentsStatusRepository } from './celcoin-api.bill-payments-status.repository';

@Module({
    imports: [ConfigModule.forFeature(celcoinApiConfig),
              TypeOrmModule.forFeature([CelcoinApiBillPaymentsRepository, CelcoinApiBillPaymentsStatusRepository]),  
              CelcoinApiAuthModule,
              HttpModule],
    controllers: [BillPaymentsController],
    providers: [CelcoinApiBillPaymentsService]
})
export class BillPaymentsModule {}
