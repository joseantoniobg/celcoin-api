import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { CelcoinApiAuthService } from './celcoin-api.auth.service';
import { CelCoinAuthDto } from './dto/celcoin.auth.dto';
import { of } from 'rxjs';

@Controller('celcoin-api')
export class CelcoinApiAuthController {
    constructor(private celcoinApiService: CelcoinApiAuthService) {}

    @Post('/token')
    @ApiResponse({ status: 200, description: 'returns the token valid for a certain amount of time' })
    @UsePipes(new ValidationPipe({ transform: true }))
    getAuthToken(@Body(ValidationPipe) celCoinAuthDto: CelCoinAuthDto) {
        return this.celcoinApiService.getAuthToken(celCoinAuthDto);
    }
}
