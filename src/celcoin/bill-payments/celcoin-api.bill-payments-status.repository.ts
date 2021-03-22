import { Repository, EntityRepository } from 'typeorm';
import { CelcoinPayments } from './entities/celcoin-api.billpayments.entity';
import { BillPaymentStatus } from './entities/celcoin-api.billpaymentstatus.entity';
import { DbException } from '../exceptions/exception';

@EntityRepository(BillPaymentStatus)
export class CelcoinApiBillPaymentsStatusRepository extends Repository<BillPaymentStatus> {

    async saveNewStatus (payment: CelcoinPayments, errorCode: string, message: string, status: string): Promise<BillPaymentStatus> {
        
        try {
            const newStatus = this.create();
            newStatus.payment = payment;
            newStatus.errorCode = errorCode;
            newStatus.message = message;
            newStatus.status = status;
            return this.save(newStatus);
        } catch (error) {
            throw new DbException('save a new payment status', '002', JSON.stringify(error));
        }
        
    }

    async findStatusById(id: number): Promise<BillPaymentStatus> {
        try {
             return this.findOne({ id });
        } catch (error) {
            throw new DbException('get the status by its id', '002', JSON.stringify(error));
        }
    }

}