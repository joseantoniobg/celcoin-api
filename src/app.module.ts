import { Module } from '@nestjs/common';
import { typeOrmConfig } from './celcoin/config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillPaymentsModule } from './celcoin/bill-payments/bill-payments.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), 
            ConfigModule.forRoot(), BillPaymentsModule]
})
export class AppModule {}
