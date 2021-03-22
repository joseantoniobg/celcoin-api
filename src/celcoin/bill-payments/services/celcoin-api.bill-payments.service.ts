import { Injectable, Logger } from '@nestjs/common';
import { CelcoinApiBillPaymentAuthorizeDto } from '../dto/celcoin-api.billpayment.authorize.dto';
import { PerformPaymentControllerDto } from '../dto/celcoin-api.billpayment.perform-controller.dto';
import { PaymentDestination } from '../celcoin-api.bill-payments.destination.enum';
import { CelcoinAuthorizePaymentService } from './celcoin-api.bill-payments.authorize-payment.service';
import { CelcoinPerformPaymentService } from './celcoin-api.bill-payments.perform-payment.service';
import { CelcoinEndPaymentService } from './celcoin-api.bill-payments.end-payment.service';
import { CelcoinSchedulePaymentService } from './celcoin-api.bill-payments.schedule-payment.service';
import { ScheduleBillPaymentDto } from '../dto/celcoin-api.billpayments.schedule.dto';
import { EndPaymentResponse } from '../responses/celcoin-api.bill-payments.EndPaymentResponse';
import { PerformPaymentResponse } from '../responses/celcoin-api.bill-payments.PerformPaymentResponse';
import { SchedulePaymentResponse } from '../responses/celcoin-api.bill-payments.SchedulePaymentResponse';
import { AuthorizePaymentResponse } from '../responses/celcoin-api.bill-payments.AuthorizePaymentResponse';

@Injectable()
export class CelcoinApiBillPaymentsService {
  constructor(
    private readonly authorizePaymentService: CelcoinAuthorizePaymentService,
    private readonly schedulePaymentService: CelcoinSchedulePaymentService,
    private readonly performPaymentService: CelcoinPerformPaymentService,
    private readonly endPaymentService: CelcoinEndPaymentService,
  ) {}

  async getPaymentAuthorization(
    celcoinApiBillPaymentAuthorizeDto: CelcoinApiBillPaymentAuthorizeDto,
  ): Promise<AuthorizePaymentResponse> {
    return this.authorizePaymentService.getPaymentAuthorization(
      celcoinApiBillPaymentAuthorizeDto,
      new Logger('Celcoin Authorize Payment'),
    );
  }

  async schedulePayment(
    celcoinScheduleBillPaymentDto: ScheduleBillPaymentDto,
  ): Promise<SchedulePaymentResponse> {
    return this.schedulePaymentService.schedulePayment(
      celcoinScheduleBillPaymentDto,
    );
  }

  async performPayment(
    paymentData: PerformPaymentControllerDto,
  ): Promise<PerformPaymentResponse> {
    return this.performPaymentService.performPayment(
      paymentData,
      new Logger('Celcoin Perform Payment'),
    );
  }

  async endPayment(
    id: number,
    paymentDestination: PaymentDestination,
  ): Promise<EndPaymentResponse> {
    return this.endPaymentService.endPayment(
      id,
      paymentDestination,
      new Logger('Celcoin End Payment'),
    );
  }
}
