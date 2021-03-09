import { HttpModule, Module } from '@nestjs/common';
import { CelcoinApiAuthModule } from './celcoin/auth/celcoin-api.auth.module';
import { typeOrmConfig } from './celcoin/config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillPaymentsModule } from './celcoin/bill-payments/bill-payments.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), 
            CelcoinApiAuthModule, BillPaymentsModule]
})
export class AppModule {}
