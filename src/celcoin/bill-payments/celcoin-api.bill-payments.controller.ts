import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CelcoinApiBillPaymentsService } from './services/celcoin-api.bill-payments.service';
import { CelcoinApiBillPaymentAuthorizeDto } from './dto/celcoin-api.billpayment.authorize.dto';
import { ApiResponse } from '@nestjs/swagger';
import { PerformPaymentControllerDto } from './dto/celcoin-api.billpayment.perform-controller.dto';
import { PaymentDestination } from './celcoin-api.bill-payments.destination.enum';
import { PaymentDestinationPipe } from './pipes/celcoin-api.payment-destination.pipe';
import { ScheduleBillPaymentDto } from './dto/celcoin-api.billpayments.schedule.dto';

@Controller('bill-payments')
export class BillPaymentsController {
  constructor(private billpaymentsService: CelcoinApiBillPaymentsService) {}

  @Post('/authorize')
  @ApiResponse({
    status: 200,
    description: 'returns the authorization to perform a payment and its data',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  authorizePayment(
    @Body(ValidationPipe)
    celcoinApiBillPaymentAuthorizeDto: CelcoinApiBillPaymentAuthorizeDto,
  ) {
    return this.billpaymentsService.getPaymentAuthorization(
      celcoinApiBillPaymentAuthorizeDto,
    );
  }

  @Post('/schedule')
  @ApiResponse({
    status: 200,
    description: 'schedules a payment for a future payment',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  schedulePayment(
    @Body(ValidationPipe) celcoinSchedulePaymentDto: ScheduleBillPaymentDto,
  ) {
    return this.billpaymentsService.schedulePayment(celcoinSchedulePaymentDto);
  }

  @Post('/perform')
  @ApiResponse({ status: 200, description: 'performs the payment itself' })
  @UsePipes(new ValidationPipe({ transform: true }))
  performPayment(
    @Body(ValidationPipe) celcoinPaymentData: PerformPaymentControllerDto,
  ) {
    return this.billpaymentsService.performPayment(celcoinPaymentData);
  }

  @Post('/end')
  @ApiResponse({
    status: 200,
    description: 'ends the payment itself by confirming or cancelling it',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  confirmPayment(
    @Body('id', ValidationPipe) id: number,
    @Body('paymentDestination', PaymentDestinationPipe)
    paymentDestination: PaymentDestination,
  ) {
    return this.billpaymentsService.endPayment(id, paymentDestination);
  }
}
