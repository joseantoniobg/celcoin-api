import { Repository, EntityRepository } from 'typeorm';
import { CelcoinPayments } from './entities/celcoin-api.billpayments.entity';
import { CelcoinApiBillPaymentAuthorizeDto } from './dto/celcoin-api.billpayment.authorize.dto';
import { getDateNow } from '../../helpers/helper.functions';
import { DbException } from '../exceptions/db.exception';

@EntityRepository(CelcoinPayments)
export class CelcoinApiBillPaymentsRepository extends Repository<CelcoinPayments> {

    async saveNewPendingPayment (celcoinApiBillPaymentAuthorizeDto: CelcoinApiBillPaymentAuthorizeDto): Promise<CelcoinPayments> {
        try {
            const { externalTerminal } = celcoinApiBillPaymentAuthorizeDto;
            const { type, digitable, barCode } = celcoinApiBillPaymentAuthorizeDto.barCode;
            const payment = this.create();
            payment.createdAt = getDateNow();
            payment.externalTerminal = externalTerminal;
            payment.type = type;
            payment.barCode = barCode;
            payment.digitable = digitable;
            return this.save(payment);
        } catch (error) {
            throw new DbException('save a new payment');
        }
    }

    async updatePayment(celcoinPayment: CelcoinPayments): Promise<CelcoinPayments> {
        try {
            return celcoinPayment.save();
        } catch (error) {
            throw new DbException('update a new payment');
        }
    }

    async findPaymentById(id: number): Promise<CelcoinPayments> {
        try {
            return this.findOne({ id });
        } catch (error) {
            throw new DbException('find a payment by its id');
        }
    }

}