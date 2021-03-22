import {
  Injectable,
  HttpService,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { CelcoinApiAuthService } from '../../auth/celcoin-api.auth.service';
import { ConfigType } from '@nestjs/config';
import celcoinApiConfig from '../../config/celcoin-api.config';
import { InjectRepository } from '@nestjs/typeorm';
import { CelcoinApiBillPaymentsStatusRepository } from '../celcoin-api.bill-payments-status.repository';
import { CelcoinApiBillPaymentsRepository } from '../celcoin-api.bill-payments.repository';
import { PerformPaymentControllerDto } from '../dto/celcoin-api.billpayment.perform-controller.dto';
import {
  getCelcoinAuthData,
  savePaymentStatus,
  throwError,
} from '../../helpers/celcoin-api.helpers';
import {
  DbNotFoundException,
  CelCoinApiException,
} from '../../exceptions/exception';
import { IBillData } from '../interfaces/celcoin-api.bill-apyments.bill-data.interface';
import { IBarCode } from '../interfaces/celcoin-api.bill-payments.barcode.interface';
import { IPerformBillPayment } from '../interfaces/celcoin-api.bill-payments.perform.interface';
import {
  getNumbersFromString,
  getDateNow,
  getInterfaceObject,
} from '../../../helpers/helper.functions';
import { PerformPaymentResponse } from '../responses/celcoin-api.bill-payments.PerformPaymentResponse';
import { CELCOINAPI_DB_NOT_FOUND_PAYMENT_ID_PERFORM_PAYMENT } from '../constants/error.constants';
import {
  CELCOINAPI_PERFORM_PAYMENT_ERROR,
  CELCOINAPI_PERFORM_PAYMENT_UNHANDED_ERROR,
} from '../constants/error.constants';

@Injectable()
export class CelcoinPerformPaymentService {
  constructor(
    private httpService: HttpService,
    private celcoinApiAuthService: CelcoinApiAuthService,
    @Inject(celcoinApiConfig.KEY)
    private readonly celCoinApiConfiguration: ConfigType<
      typeof celcoinApiConfig
    >,
    @InjectRepository(CelcoinApiBillPaymentsRepository)
    private readonly celcoinApiBillPaymentsRepository: CelcoinApiBillPaymentsRepository,
    @InjectRepository(CelcoinApiBillPaymentsStatusRepository)
    private readonly celcoinBillPaymentsStatus: CelcoinApiBillPaymentsStatusRepository,
  ) {}

  async performPayment(
    paymentData: PerformPaymentControllerDto,
    logger: Logger,
  ): Promise<PerformPaymentResponse> {
    try {
      const urlEndPoint = this.celCoinApiConfiguration.services_endpoints
        .perform_billpyment_url;
      const celcoinAuthDto = getCelcoinAuthData();
      const tokenData = await this.celcoinApiAuthService.getAuthToken(
        celcoinAuthDto,
      );
      var payment = await this.celcoinApiBillPaymentsRepository.findPaymentById(
        paymentData.id,
      );

      if (!payment) {
        throw new DbNotFoundException(
          CELCOINAPI_DB_NOT_FOUND_PAYMENT_ID_PERFORM_PAYMENT.performedAction,
          CELCOINAPI_DB_NOT_FOUND_PAYMENT_ID_PERFORM_PAYMENT.errorCode,
          CELCOINAPI_DB_NOT_FOUND_PAYMENT_ID_PERFORM_PAYMENT.errorDescription,
        );
      }

      payment.value = paymentData.value;
      payment.clientPayer = paymentData.cpfCnpj;

      //const performPaymentData = new PerformBillPaymentDto();

      const billData = <IBillData>{
        value: payment.value,
        originalValue: payment.originalValue,
        valueWithAdditional: payment.totalWithDiscount,
        valueWithDiscount: payment.totalWithDiscount,
      };

      const barCode = <IBarCode>{
        type: payment.type,
        digitable: payment.digitable,
        barCode: payment.barCode,
      };

      const performPaymentData = <IPerformBillPayment>{
        externalNSU: payment.id,
        externalTerminal: payment.externalTerminal,
        cpfCnpj: getNumbersFromString(paymentData.cpfCnpj),
        billData,
        barCode,
        dueDate: payment.dueDate,
        transactionIdAuthorize: payment.transactionId,
      };

      logger.debug(
        `Will call CelCoin API to perform the previously authorized payment`,
      );

      var response = await this.httpService
        .post(urlEndPoint, performPaymentData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenData.token}`,
          },
        })
        .toPromise()
        .catch(async (error) => {
          if (error.response.data.errorCode) {
            savePaymentStatus(
              payment,
              error.response.data.errorCode,
              error.response.data.message,
              error.response.data.status,
              this.celcoinBillPaymentsStatus,
              `Perform Payment`,
            );
          }
          throw new CelCoinApiException(
            CELCOINAPI_PERFORM_PAYMENT_ERROR.performedAction,
            CELCOINAPI_PERFORM_PAYMENT_ERROR.errorCode,
            JSON.stringify(error.response.data),
          );
        });

      payment.isExpired = response.data.isExpired;
      payment.authentication = response.data.authentication;
      payment.completeAuthenticationBlock =
        response.data.authenticationAPI.BlocoCompleto;
      payment.receiptFormatted = response.data.receipt.receiptformatted;
      payment.performTransactionId = response.data.transactionId;
      payment.performedAt = getDateNow();

      savePaymentStatus(
        payment,
        response.data.errorCode,
        response.data.message,
        response.data.status,
        this.celcoinBillPaymentsStatus,
      );

      payment = await this.celcoinApiBillPaymentsRepository.updatePayment(
        payment,
      );

      let performPaymentResponse: PerformPaymentResponse = getInterfaceObject(
        payment,
        new PerformPaymentResponse(),
      );

      return performPaymentResponse;
    } catch (error) {
      if (error.response.error.exception) {
        throw error;
      } else {
        throwError(
          error,
          CELCOINAPI_PERFORM_PAYMENT_UNHANDED_ERROR.performedAction,
          CELCOINAPI_PERFORM_PAYMENT_UNHANDED_ERROR.errorCode,
        );
      }
    }
  }
}
