import { HttpModule, Module } from '@nestjs/common';
import { CelcoinApiAuthModule } from './celcoin/celcoin-api/auth/celcoin-api.auth.module';
import { typeOrmConfig } from './celcoin/celcoin-api/config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), 
            CelcoinApiAuthModule]
})
export class AppModule {}
