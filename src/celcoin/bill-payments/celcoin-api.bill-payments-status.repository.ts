import { Repository, EntityRepository } from 'typeorm';
import { CelcoinPayments } from './entities/celcoin-api.billpayments.entity';
import { BillPaymentStatus } from './entities/celcoin-api.billpaymentstatus.entity';
import { DbException } from '../exceptions/exception';
import {
  CELCOINAPI_DB_EXCEPTION_SAVE_PAYMENT_STATUS,
  CELCOINAPI_DB_EXCEPTION_GET_STATUS_BY_ID,
} from './constants/error.constants';

@EntityRepository(BillPaymentStatus)
export class CelcoinApiBillPaymentsStatusRepository extends Repository<BillPaymentStatus> {
  async saveNewStatus(
    payment: CelcoinPayments,
    errorCode: string,
    message: string,
    status: string,
  ): Promise<BillPaymentStatus> {
    try {
      const newStatus = this.create();
      newStatus.payment = payment;
      newStatus.errorCode = errorCode;
      newStatus.message = message;
      newStatus.status = status;
      return this.save(newStatus);
    } catch (error) {
      throw new DbException(
        CELCOINAPI_DB_EXCEPTION_SAVE_PAYMENT_STATUS.performedAction,
        CELCOINAPI_DB_EXCEPTION_SAVE_PAYMENT_STATUS.errorCode,
        JSON.stringify(error),
      );
    }
  }

  async findStatusById(id: number): Promise<BillPaymentStatus> {
    try {
      return this.findOne({ id });
    } catch (error) {
      throw new DbException(
        CELCOINAPI_DB_EXCEPTION_GET_STATUS_BY_ID.performedAction,
        CELCOINAPI_DB_EXCEPTION_SAVE_PAYMENT_STATUS.errorCode,
        JSON.stringify(error),
      );
    }
  }
}
