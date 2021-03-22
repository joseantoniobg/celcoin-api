import { Injectable, HttpService, Inject, Logger } from '@nestjs/common';
import { CelcoinApiAuthService } from '../../auth/celcoin-api.auth.service';
import celcoinApiConfig from '../../config/celcoin-api.config';
import { InjectRepository } from '@nestjs/typeorm';
import { CelcoinApiBillPaymentsStatusRepository } from '../celcoin-api.bill-payments-status.repository';
import { CelcoinApiBillPaymentsRepository } from '../celcoin-api.bill-payments.repository';
import { PaymentDestination } from '../celcoin-api.bill-payments.destination.enum';
import { ConfigType } from '@nestjs/config';
import {
  getCelcoinAuthData,
  throwError,
} from '../../helpers/celcoin-api.helpers';
import {
  DbNotFoundException,
  CelCoinApiException,
  PaymentException,
} from '../../exceptions/exception';
import {
  getDateNow,
  getInterfaceObject,
} from '../../../helpers/helper.functions';
import { EndPaymentResponse } from '../responses/celcoin-api.bill-payments.EndPaymentResponse';

@Injectable()
export class CelcoinEndPaymentService {
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

  async endPayment(
    id: number,
    paymentDestination: PaymentDestination,
    logger: Logger,
  ): Promise<EndPaymentResponse> {
    try {
      const celcoinAuthDto = getCelcoinAuthData();
      const tokenData = await this.celcoinApiAuthService.getAuthToken(
        celcoinAuthDto,
      );
      var payment = await this.celcoinApiBillPaymentsRepository.findPaymentById(
        id,
      );

      if (!payment) {
        throw new DbNotFoundException(
          `${paymentDestination} Payment`,
          '020',
          'Payment id not found',
        );
      }

      var urlEndPoint =
        paymentDestination === PaymentDestination.CONFIRM
          ? this.celCoinApiConfiguration.services_endpoints
              .confirm_billpayment_url
          : this.celCoinApiConfiguration.services_endpoints
              .cancel_billpayment_url;

      urlEndPoint = urlEndPoint.replace(
        '{transactionId}',
        payment.performTransactionId.toString(),
      );

      var response = await this.httpService
        .put(
          urlEndPoint,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenData.token}`,
            },
          },
        )
        .toPromise()
        .catch(async (error) => {
          if (error.response.data.errorCode !== undefined) {
            await this.celcoinBillPaymentsStatus.saveNewStatus(
              payment,
              error.response.data.errorCode,
              error.response.data.message,
              error.response.data.status,
            );

            throw new PaymentException(
              `${paymentDestination} Payment`,
              '001',
              JSON.stringify(error.response.data),
            );
          }
          throw new CelCoinApiException(
            `${paymentDestination} Payment - Unhanded Error`,
            '001',
            JSON.stringify(error.response.data),
          );
        });

      this.celcoinBillPaymentsStatus.saveNewStatus(
        payment,
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

      let endPaymentResponse: EndPaymentResponse = getInterfaceObject(
        response.data,
        new EndPaymentResponse(),
      );

      return endPaymentResponse;
    } catch (error) {
      if (error.response.error.exception !== undefined) {
        throw error;
      } else {
        throwError(error, 'End Payment - Unhanded Error', '030');
      }
    }
  }
}
