import { Injectable, HttpService, Inject, BadRequestException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CelcoinApiBillPaymentAuthorizeDto } from './dto/celcoin-api.billpayment.authorize.dto';
import { ConfigType } from '@nestjs/config';
import celcoinApiConfig from '../config/celcoin-api.config';
import { InjectRepository } from '@nestjs/typeorm';
import { CelcoinApiBillPaymentsRepository } from './celcoin-api.bill-payments.repository';
import { CelCoinAuthDto } from '../auth/dto/celcoin.auth.dto';
import { CelcoinApiAuthService } from '../auth/celcoin-api.auth.service';
import { getDateFromStringDDMMYYYY, getDateNow, getDateFromStringISO, getNumbersFromString } from '../../helpers/helper.functions';
import { PerformPaymentControllerDto } from './dto/celcoin-api.billpayment.perform-controller.dto';
import { PerformBillPaymentDto } from './dto/celcoin-api.billpayment.perform.dto';
import { CelcoinApiBillPaymentsStatusRepository } from './celcoin-api.bill-payments-status.repository';
import { CelCoinApiException } from '../exceptions/celcoin-api.exception';
import { PaymentException } from '../exceptions/payment.exception';
import { BarCodeDto } from './dto/celcoin-api.billpayment.barcode.dto';
import { BillDataDto } from './dto/celcoin-api.billpayment.billdata.dto';
import { PaymentDestination } from './celcoin-api.bill-payments.destination.enum';

@Injectable()
export class CelcoinApiBillPaymentsService {
    constructor(private httpService: HttpService, 
        private celcoinApiAuthService: CelcoinApiAuthService,        
        @Inject(celcoinApiConfig.KEY)
        private readonly celCoinApiConfiguration: ConfigType<typeof celcoinApiConfig>,
        @InjectRepository(CelcoinApiBillPaymentsRepository)
        private readonly celcoinApiBillPaymentsRepository: CelcoinApiBillPaymentsRepository,
        @InjectRepository(CelcoinApiBillPaymentsStatusRepository)
        private readonly celcoinBillPaymentsStatus: CelcoinApiBillPaymentsStatusRepository,
        ){}

    private logger = new Logger('PaymentAuthorizations');

    async getPaymentAuthorization(celcoinAuthDto: CelCoinAuthDto, 
        celcoinApiBillPaymentAuthorizeDto: CelcoinApiBillPaymentAuthorizeDto): Promise<any> {
        try {

            const urlEndPoint = this.celCoinApiConfiguration.services_endpoints.authorize_billpayment_url;
            const tokenData = await this.celcoinApiAuthService.getAuthToken(celcoinAuthDto);

            try {
                var newPayment = await this.celcoinApiBillPaymentsRepository.saveNewPendingPayment(celcoinApiBillPaymentAuthorizeDto);
                celcoinApiBillPaymentAuthorizeDto.externalNSU = newPayment.id;
            } catch (error) {
                throw new UnauthorizedException(error, 'Error when trying to save the new payment to db. Verify db avalaibility, its entitys and credentials');
            }

            this.logger.debug(`Will call CelCoin API to authorize a new payment`);

            try {
                var response = await this.httpService.post(urlEndPoint, 
                    celcoinApiBillPaymentAuthorizeDto, {
                    headers: { 'Content-Type': 'application/json',
                                'Authorization': `Bearer ${tokenData.token}` },
                }).toPromise();
            } catch (error) {
                throw new CelCoinApiException(`[${error.status}] Authorize a new Payment`);
            }

            if (response.status != 200) {
                throw new BadRequestException(response.data);
            }

            this.logger.debug(`Response Data: ${JSON.stringify(response.data)}`);

            if (response.data.errorCode !== '000') {
                newPayment.cancelledAt = getDateNow();
            }
            
            let paymentData;

            if (response.data.registerData) {
                paymentData = response.data.registerData;
            } else {
                paymentData = response.data;
            }

            newPayment.assignor = response.data.assignor;
            newPayment.documentRecipient = paymentData.documentRecipient;
            newPayment.documentPayer = paymentData.documentPayer;
            newPayment.payDueDate = getDateFromStringISO(paymentData.payDueDate);
            newPayment.dueDate = getDateFromStringISO(response.data.dueDate);
            if (!newPayment.dueDate){
                newPayment.dueDate = newPayment.payDueDate;
            }
            newPayment.settleDate = getDateFromStringDDMMYYYY(response.data.settleDate);
            newPayment.nextBusinessDay =  getDateFromStringISO(paymentData.nextBusinessDay);
            newPayment.dueDateRegister =  getDateFromStringISO(paymentData.dueDateRegister);
            newPayment.allowChangeValue = paymentData.allowChangeValue;
            newPayment.recipient = paymentData.recipient;
            newPayment.payer = paymentData.payer;
            newPayment.discountValue = paymentData.discountValue;
            newPayment.interestValueCalculated = paymentData.interestValueCalculated;
            newPayment.maxValue = paymentData.maxValue;
            newPayment.minValue = paymentData.minValue;
            newPayment.fineValueCalculated = paymentData.fineValueCalculated;
            newPayment.originalValue = paymentData.originalValue;
            newPayment.totalUpdated = paymentData.totalUpdated;
            newPayment.totalWithDiscount = paymentData.totalWithDiscount;
            newPayment.totalWithAdditional = paymentData.totalWithAdditional;
            newPayment.endHour = response.data.endHour;
            newPayment.initeHour = response.data.initeHour;
            newPayment.nextSettle = response.data.nextSettle;
            newPayment.digitable = response.data.digitable;
            newPayment.transactionId = response.data.transactionId;
            newPayment.type = response.data.type;
            newPayment.value = response.data.value;

            newPayment.processedAt = new Date(Date.now());

            await this.celcoinBillPaymentsStatus.saveNewStatus(newPayment, response.data.errorCode, response.data.message, response.data.status);

            newPayment = await this.celcoinApiBillPaymentsRepository.updatePayment(newPayment);
            
            return newPayment;

        } catch (error) {
            throw error;
        }
    }

    async performPayment (celcoinAuthDto: CelCoinAuthDto, paymentData: PerformPaymentControllerDto): Promise<any> {

        const urlEndPoint = this.celCoinApiConfiguration.services_endpoints.perform_billpyment_url;
        const tokenData = await this.celcoinApiAuthService.getAuthToken(celcoinAuthDto);
        var payment = await this.celcoinApiBillPaymentsRepository.findPaymentById(paymentData.id);

        if (!payment) {
            throw new NotFoundException('Payment id not found');
        }

        payment.value = paymentData.value;
        payment.clientPayer = paymentData.cpfCnpj;
        
        const performPaymentData = new PerformBillPaymentDto();

        performPaymentData.externalNSU = payment.id;
        performPaymentData.cpfCnpj = getNumbersFromString(paymentData.cpfCnpj);
        performPaymentData.externalTerminal = payment.externalTerminal;
        performPaymentData.transactionIdAuthorize = payment.transactionId;
        performPaymentData.dueDate = payment.dueDate;
        performPaymentData.barCode = new BarCodeDto();
        performPaymentData.barCode.barCode = payment.barCode;
        performPaymentData.barCode.digitable = payment.digitable;
        performPaymentData.barCode.type = payment.type;
        performPaymentData.billData = new BillDataDto();
        performPaymentData.billData.originalValue = payment.originalValue;
        performPaymentData.billData.value = paymentData.value;
        performPaymentData.billData.valueWithAdditional = payment.totalWithAdditional;
        performPaymentData.billData.valueWithDiscount = payment.totalWithDiscount;

        this.logger.debug(`Will call CelCoin API to perform the previously authorized payment`);

        try {
            var response = await this.httpService.post(urlEndPoint, 
                performPaymentData, {
                headers: { 'Content-Type': 'application/json',
                            'Authorization': `Bearer ${tokenData.token}` },
            }).toPromise();
        } catch (error) {
            throw new CelCoinApiException(`[${error.status}] Perform the payment`);
        }

        this.logger.debug(response.data.errorCode);

        if (response.data.errorCode !== '000') {
            this.celcoinBillPaymentsStatus.saveNewStatus(payment, 
                                                         response.data.errorCode,
                                                         response.data.message,
                                                         response.data.status, 
                                                        );
            throw new PaymentException(`Perform payment: [${response.data.errorCode}] - ${response.data.message}`);
        }
        
        payment.isExpired = response.data.isExpired;
        payment.authentication = response.data.authentication;
        payment.completeAuthenticationBlock = response.data.authenticationAPI.BlocoCompleto;
        payment.receiptFormatted = response.data.receipt.receiptformatted;
        payment.performTransactionId = response.data.transactionId;
        payment.performedAt = getDateNow();

        this.celcoinBillPaymentsStatus.saveNewStatus(payment, 
            response.data.errorCode,
            response.data.message,
            response.data.status, 
           );

        payment = await this.celcoinApiBillPaymentsRepository.updatePayment(payment);

        if (response.status != 200) {
            throw new BadRequestException(response.data);
        }

        return payment;
    }

    async endPayment(celcoinAuthDto: CelCoinAuthDto, id: number, paymentDestination:  PaymentDestination): Promise<any> {
        
        const tokenData = await this.celcoinApiAuthService.getAuthToken(celcoinAuthDto);
        var payment = await this.celcoinApiBillPaymentsRepository.findPaymentById(id);

        if (!payment) {
            throw new NotFoundException('Payment id not found');
        }

        var urlEndPoint = paymentDestination === PaymentDestination.CONFIRM ? this.celCoinApiConfiguration.services_endpoints.confirm_billpayment_url :
                                                                              this.celCoinApiConfiguration.services_endpoints.cancel_billpayment_url;
        
        urlEndPoint = urlEndPoint.replace('{transactionId}', payment.performTransactionId.toString());

        try {
            var response = await this.httpService.put(urlEndPoint, 
                {}, {
                headers: { 'Content-Type': 'application/json',
                            'Authorization': `Bearer ${tokenData.token}` },
            }).toPromise();
        } catch (error) {
            throw new CelCoinApiException(`[${error.statusCode}] Confirms the Payment`);
        }

        if (response.status != 200) {
            throw new BadRequestException(response.data);
        }

        this.celcoinBillPaymentsStatus.saveNewStatus(payment, 
            response.data.errorCode,
            response.data.message,
            response.data.status, 
           );

        if (paymentDestination === PaymentDestination.CONFIRM) {
            payment.confirmedAt = getDateNow();
        } else if (paymentDestination === PaymentDestination.CANCEL) {
            payment.cancelledAt = getDateNow();
        }

        this.celcoinApiBillPaymentsRepository.updatePayment(payment);

        const status = {
            errorCode: response.data.errorCode,
            message: response.data.message,
            status: response.data.status,
        };

        return status;

    }
}
