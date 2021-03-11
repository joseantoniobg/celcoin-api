import { Injectable, HttpService, Inject, Logger, BadRequestException } from '@nestjs/common';
import { CelcoinApiAuthService } from '../../auth/celcoin-api.auth.service';
import { ConfigType } from '@nestjs/config';
import celcoinApiConfig from '../../config/celcoin-api.config';
import { InjectRepository } from '@nestjs/typeorm';
import { CelcoinApiBillPaymentsStatusRepository } from '../celcoin-api.bill-payments-status.repository';
import { CelcoinApiBillPaymentsRepository } from '../celcoin-api.bill-payments.repository';
import { PerformPaymentControllerDto } from '../dto/celcoin-api.billpayment.perform-controller.dto';
import { getCelcoinAuthData, savePaymentStatus, throwError } from '../../helpers/celcoin-api.helpers';
import { DbNotFoundException, CelCoinApiException } from '../../exceptions/exception';
import { IBillData } from '../interfaces/celcoin-api.bill-apyments.bill-data.interface';
import { IBarCode } from '../interfaces/celcoin-api.bill-payments.barcode.interface';
import { IPerformBillPayment } from '../interfaces/celcoin-api.bill-payments.perform.interface';
import { getNumbersFromString, getDateNow } from '../../../helpers/helper.functions';

@Injectable()
export class CelcoinPerformPaymentService {

    constructor(private httpService: HttpService, 
        private celcoinApiAuthService: CelcoinApiAuthService,        
        @Inject(celcoinApiConfig.KEY)
        private readonly celCoinApiConfiguration: ConfigType<typeof celcoinApiConfig>,
        @InjectRepository(CelcoinApiBillPaymentsRepository)
        private readonly celcoinApiBillPaymentsRepository: CelcoinApiBillPaymentsRepository,
        @InjectRepository(CelcoinApiBillPaymentsStatusRepository)
        private readonly celcoinBillPaymentsStatus: CelcoinApiBillPaymentsStatusRepository,
        ){}

    async performPayment (paymentData: PerformPaymentControllerDto, logger: Logger): Promise<any> {
        try{

            const urlEndPoint = this.celCoinApiConfiguration.services_endpoints.perform_billpyment_url;
            const celcoinAuthDto = getCelcoinAuthData();
            const tokenData = await this.celcoinApiAuthService.getAuthToken(celcoinAuthDto);
            var payment = await this.celcoinApiBillPaymentsRepository.findPaymentById(paymentData.id);

            if (!payment) {
                throw new DbNotFoundException('Perform Payment', '020', 'Payment id not found');
            }

            payment.value = paymentData.value;
            payment.clientPayer = paymentData.cpfCnpj;
            
            //const performPaymentData = new PerformBillPaymentDto();

            const billData = <IBillData>{ value: payment.value, 
                                        originalValue: payment.originalValue, 
                                        valueWithAdditional: payment.totalWithDiscount, 
                                        valueWithDiscount: payment.totalWithDiscount };

            const barCode = <IBarCode>{ type: payment.type, digitable: payment.digitable, barCode: payment.barCode };

            const performPaymentData = <IPerformBillPayment>{
                                                                externalNSU: payment.id, 
                                                                externalTerminal: payment.externalTerminal,
                                                                cpfCnpj: getNumbersFromString(paymentData.cpfCnpj),
                                                                billData, 
                                                                barCode,
                                                                dueDate: payment.dueDate,
                                                                transactionIdAuthorize: payment.transactionId,
                                                            };

            logger.debug(`Will call CelCoin API to perform the previously authorized payment`);

                var response = await this.httpService.post(urlEndPoint, 
                    performPaymentData, {
                    headers: { 'Content-Type': 'application/json',
                                'Authorization': `Bearer ${tokenData.token}` },
                }).toPromise().catch(async error => {
                    if (error.response.data.errorCode) {
                        savePaymentStatus (payment, 
                            error.response.data.errorCode,
                            error.response.data.message,
                            error.response.data.status,
                            this.celcoinBillPaymentsStatus,
                            `Perform Payment`,
                        );
                    }
                    throw new CelCoinApiException('Perform Payment - Unhanded Error', '001', JSON.stringify(error.response.data));
                });
            
            payment.isExpired = response.data.isExpired;
            payment.authentication = response.data.authentication;
            payment.completeAuthenticationBlock = response.data.authenticationAPI.BlocoCompleto;
            payment.receiptFormatted = response.data.receipt.receiptformatted;
            payment.performTransactionId = response.data.transactionId;
            payment.performedAt = getDateNow();

            savePaymentStatus(payment, 
                response.data.errorCode,
                response.data.message,
                response.data.status, 
                this.celcoinBillPaymentsStatus
            );

            payment = await this.celcoinApiBillPaymentsRepository.updatePayment(payment);

            return payment;
        } catch (error) {
            throwError (error, 'Perform Payment - Unhanded Error', '020');   
        }
    }
    

}
