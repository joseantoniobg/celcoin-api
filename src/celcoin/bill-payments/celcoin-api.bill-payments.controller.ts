import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CelcoinApiBillPaymentsService } from './celcoin-api.bill-payments.service';
import { CelcoinApiBillPaymentAuthorizeDto } from './dto/celcoin-api.billpayment.authorize.dto';
import { CelCoinAuthDto } from '../auth/dto/celcoin.auth.dto';
import { ApiResponse } from '@nestjs/swagger';
import { PerformPaymentControllerDto } from './dto/celcoin-api.billpayment.perform-controller.dto';
import { PaymentDestination } from './celcoin-api.bill-payments.destination.enum';
import { PaymentDestinationPipe } from './pipes/celcoin-api.payment-destination.pipe';

@Controller('bill-payments')
export class BillPaymentsController {
    constructor(private billpaymentsService: CelcoinApiBillPaymentsService){}

    @Post('/authorize')
    @ApiResponse({ status: 200, description: 'returns the authorization to perform a payment and its data' })
    @UsePipes(new ValidationPipe({ transform: true }))
    authorizePayment(
        @Body(ValidationPipe) celcoinApiBillPaymentAuthorizeDto: CelcoinApiBillPaymentAuthorizeDto,
        @Body(ValidationPipe) celcoinAuthDto: CelCoinAuthDto,
        ) {
            return this.billpaymentsService.getPaymentAuthorization(celcoinAuthDto, celcoinApiBillPaymentAuthorizeDto);
    }

    @Post('/perform')
    @ApiResponse({ status: 200, description: 'performs the payment itself' })
    @UsePipes(new ValidationPipe({ transform: true }))
    performPayment(
        @Body(ValidationPipe) celcoinPaymentData: PerformPaymentControllerDto,
        @Body(ValidationPipe) celcoinAuthDto: CelCoinAuthDto,
        ) {
            return this.billpaymentsService.performPayment(celcoinAuthDto, celcoinPaymentData);
    }

    @Post('/end')
    @ApiResponse({ status: 200, description: 'ends the payment itself by confirming or cancelling it' })
    @UsePipes(new ValidationPipe({ transform: true }))
    confirmPayment(
        @Body(ValidationPipe) celcoinAuthDto: CelCoinAuthDto,
        @Body('id', ValidationPipe) id: number,
        @Body('paymentDestination', PaymentDestinationPipe) paymentDestination: PaymentDestination,
        ) {
            return this.billpaymentsService.endPayment(celcoinAuthDto, id, paymentDestination);
    }
}
