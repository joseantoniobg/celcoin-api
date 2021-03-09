import { Module, HttpModule } from '@nestjs/common';
import { CelcoinApiAuthController } from './celcoin-api.auth.controller';
import { CelcoinApiAuthService } from './celcoin-api.auth.service';
import { CelcoinAuthRepository } from './celcoin-api.auth.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import celcoinApiConfig from '../config/celcoin-api.config';
import { CelCoinAuthDto } from './dto/celcoin.auth.dto';

@Module({
    imports: [TypeOrmModule.forFeature([CelcoinAuthRepository]), 
              HttpModule,
              ConfigModule.forFeature(celcoinApiConfig),
            ],
    controllers: [CelcoinApiAuthController],
    providers: [CelcoinApiAuthService, CelCoinAuthDto],
    exports: [CelcoinApiAuthService, CelCoinAuthDto]
})
export class CelcoinApiAuthModule {}
