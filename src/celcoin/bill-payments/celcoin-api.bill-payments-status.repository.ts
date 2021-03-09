import { Repository, EntityRepository } from 'typeorm';
import { CelcoinPayments } from './entities/celcoin-api.billpayments.entity';
import { CelcoinApiBillPaymentAuthorizeDto } from './dto/celcoin-api.billpayment.authorize.dto';
import { getDateNow } from '../../helpers/helper.functions';
import { BillPaymentStatus } from './entities/celcoin-api.billpaymentstatus.entity';
import { DbException } from '../exceptions/db.exception';

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
            throw new DbException('Save a new Payment Status');
        }
        
    }

    async findStatusById(id: number): Promise<BillPaymentStatus> {
        try {
             return this.findOne({ id });
        } catch (error) {
            throw new DbException('get an Status by its ID');
        }
    }

}