import { Repository, EntityRepository } from 'typeorm';
import { CelcoinPayments } from './entities/celcoin-api.billpayments.entity';
import { CelcoinApiBillPaymentAuthorizeDto } from './dto/celcoin-api.billpayment.authorize.dto';
import { getDateNow, getDateFromStringISO, getDateFromStringDDMMYYYY } from '../../helpers/helper.functions';
import { DbException } from '../exceptions/exception';

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
            throw new DbException('save a new payment', '002', JSON.stringify(error));
        }
    }

    setPaymentProperties (newPayment: CelcoinPayments, dataRespose: any): CelcoinPayments {
        
        let paymentData;

        if (dataRespose.registerData) {
            paymentData = dataRespose.registerData;
        } else {
            paymentData = dataRespose;
        }

        newPayment.assignor = dataRespose.assignor;
        newPayment.documentRecipient = paymentData.documentRecipient;
        newPayment.documentPayer = paymentData.documentPayer;
        newPayment.payDueDate = getDateFromStringISO(paymentData.payDueDate);
        newPayment.dueDate = getDateFromStringISO(dataRespose.dueDate) || newPayment.payDueDate || getDateNow();
        newPayment.settleDate = getDateFromStringDDMMYYYY(dataRespose.settleDate);
        newPayment.nextBusinessDay =  getDateFromStringISO(paymentData.nextBusinessDay);
        newPayment.dueDateRegister =  getDateFromStringISO(paymentData.dueDateRegister);
        newPayment.allowChangeValue = paymentData.allowChangeValue;
        newPayment.recipient = paymentData.recipient;
        newPayment.payer = paymentData.payer;
        newPayment.discountValue = paymentData.discountValue || 0;
        newPayment.interestValueCalculated = paymentData.interestValueCalculated || 0;
        newPayment.maxValue = paymentData.maxValue;
        newPayment.minValue = paymentData.minValue;
        newPayment.fineValueCalculated = paymentData.fineValueCalculated;
        newPayment.originalValue = paymentData.originalValue || paymentData.value;
        newPayment.totalUpdated = paymentData.totalUpdated;
        newPayment.totalWithDiscount = paymentData.totalWithDiscount || 0;
        newPayment.totalWithAdditional = paymentData.totalWithAdditional || 0;
        newPayment.endHour = dataRespose.endHour;
        newPayment.initeHour = dataRespose.initeHour;
        newPayment.nextSettle = dataRespose.nextSettle;
        newPayment.digitable = dataRespose.digitable;
        newPayment.transactionId = dataRespose.transactionId;
        newPayment.type = dataRespose.type;
        newPayment.value = dataRespose.value;

        newPayment.processedAt = getDateNow();

        return newPayment;
    }

    async updatePayment(celcoinPayment: CelcoinPayments): Promise<CelcoinPayments> {
        try {
            return celcoinPayment.save();
        } catch (error) {
            throw new DbException('update a new payment', '002', JSON.stringify(error));
        }
    }

    async findPaymentById(id: number): Promise<CelcoinPayments> {
        try {
            return this.findOne({ id });
        } catch (error) {
            throw new DbException('find a payment by its id', '002', JSON.stringify(error));
        }
    }

}