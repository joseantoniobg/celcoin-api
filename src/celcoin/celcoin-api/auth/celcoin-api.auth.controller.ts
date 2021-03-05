import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CelcoinApiAuthService } from './celcoin-api.auth.service';
import { CelCoinAuthDto } from './dto/celcoin.auth.dto';

@Controller('celcoin-api')
export class CelcoinApiAuthController {
    constructor(private celcoinApiService: CelcoinApiAuthService) {}

    @Post('/token')
    @UsePipes(new ValidationPipe({ transform: true }))
    getAuthToken(@Body(ValidationPipe) celCoinAuthDto: CelCoinAuthDto) {
        return this.celcoinApiService.getAuthToken(celCoinAuthDto);
    }
}
