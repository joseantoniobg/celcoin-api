import { Injectable } from '@nestjs/common';
import { CelcoinApiBillPaymentsRepository } from '../celcoin-api.bill-payments.repository';
import { ScheduleBillPaymentDto } from '../dto/celcoin-api.billpayments.schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DbNotFoundException } from '../../exceptions/exception';
import { SchedulePaymentResponse } from '../responses/celcoin-api.bill-payments.SchedulePaymentResponse';
import { throwError } from '../../helpers/celcoin-api.helpers';
import {
  CELCOINAPI_DB_NOT_FOUND_PAYMENT_ID_SCHEDULE_PAYMENT,
  CELCOINAPI_SCHEDULE_PAYMENT_UNHANDED_ERROR,
} from '../constants/error.constants';

@Injectable()
export class CelcoinSchedulePaymentService {
  constructor(
    @InjectRepository(CelcoinApiBillPaymentsRepository)
    private readonly celcoinBillPaymentsRepository: CelcoinApiBillPaymentsRepository,
  ) {}

  async schedulePayment(
    scheduleBillPaymentDto: ScheduleBillPaymentDto,
  ): Promise<SchedulePaymentResponse> {
    try {
      const payment = await this.celcoinBillPaymentsRepository.findPaymentById(
        scheduleBillPaymentDto.id,
      );

      if (!payment) {
        throw new DbNotFoundException(
          CELCOINAPI_DB_NOT_FOUND_PAYMENT_ID_SCHEDULE_PAYMENT.performedAction,
          CELCOINAPI_DB_NOT_FOUND_PAYMENT_ID_SCHEDULE_PAYMENT.errorCode,
          CELCOINAPI_DB_NOT_FOUND_PAYMENT_ID_SCHEDULE_PAYMENT.errorDescription,
        );
      }

      payment.paymentDate = scheduleBillPaymentDto.paymentDate;
      payment.isScheduled = true;

      await this.celcoinBillPaymentsRepository.updatePayment(payment);

      const response = new SchedulePaymentResponse();
      response.id = payment.id;
      response.paymentDate = payment.paymentDate;

      return response;
    } catch (error) {
      if (error.response.error.exception !== undefined) {
        throw error;
      } else {
        throwError(
          error,
          CELCOINAPI_SCHEDULE_PAYMENT_UNHANDED_ERROR.performedAction,
          CELCOINAPI_SCHEDULE_PAYMENT_UNHANDED_ERROR.errorCode,
        );
      }
    }
  }
}
