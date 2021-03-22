import { Injectable } from '@nestjs/common';
import { CelcoinApiBillPaymentsRepository } from '../celcoin-api.bill-payments.repository';
import { ScheduleBillPaymentDto } from '../dto/celcoin-api.billpayments.schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DbNotFoundException } from '../../exceptions/exception';
import { SchedulePaymentResponse } from '../responses/celcoin-api.bill-payments.SchedulePaymentResponse';
import { throwError } from '../../helpers/celcoin-api.helpers';

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
          'Schedule Payment',
          '020',
          'Payment ID not found',
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
        throwError(error, 'Schedule Payment - Unhanded Error', '030');
      }
    }
  }
}
