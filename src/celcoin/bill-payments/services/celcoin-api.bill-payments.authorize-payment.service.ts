import { Injectable, HttpService, Inject, Logger } from '@nestjs/common';
import { CelcoinApiAuthService } from '../../auth/celcoin-api.auth.service';
import { ConfigType } from '@nestjs/config';
import celcoinApiConfig from '../../config/celcoin-api.config';
import { InjectRepository } from '@nestjs/typeorm';
import { CelcoinApiBillPaymentsRepository } from '../celcoin-api.bill-payments.repository';
import { CelcoinApiBillPaymentAuthorizeDto } from '../dto/celcoin-api.billpayment.authorize.dto';
import {
  CelCoinApiException,
  PaymentException,
} from '../../exceptions/exception';
import {
  getCelcoinAuthData,
  throwError,
} from '../../helpers/celcoin-api.helpers';
import { CelcoinApiBillPaymentsStatusRepository } from '../celcoin-api.bill-payments-status.repository';
import { getInterfaceObject } from '../../../helpers/helper.functions';
import { AuthorizePaymentResponse } from '../responses/celcoin-api.bill-payments.AuthorizePaymentResponse';

@Injectable()
export class CelcoinAuthorizePaymentService {
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

  async getPaymentAuthorization(
    celcoinApiBillPaymentAuthorizeDto: CelcoinApiBillPaymentAuthorizeDto,
    logger: Logger,
  ): Promise<AuthorizePaymentResponse> {
    try {
      const urlEndPoint = this.celCoinApiConfiguration.services_endpoints
        .authorize_billpayment_url;
      const celcoinAuthDto = getCelcoinAuthData();
      const tokenData = await this.celcoinApiAuthService.getAuthToken(
        celcoinAuthDto,
      );

      let newPayment = await this.celcoinApiBillPaymentsRepository.saveNewPendingPayment(
        celcoinApiBillPaymentAuthorizeDto,
      );
      celcoinApiBillPaymentAuthorizeDto.externalNSU = newPayment.id;

      logger.debug(`Will call CelCoin API to authorize a new payment`);

      const response = await this.httpService
        .post(urlEndPoint, celcoinApiBillPaymentAuthorizeDto, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenData.token}`,
          },
        })
        .toPromise()
        .catch(async (error) => {
          logger.debug(`Error Response Data: ${JSON.stringify(error)}`);
          if (error.response.data.errorCode !== undefined) {
            logger.error(`Will save the error from CelCoin`);
            await this.celcoinBillPaymentsStatus.saveNewStatus(
              newPayment,
              error.response.data.errorCode,
              error.response.data.message,
              error.response.data.status,
            );

            throw new PaymentException(
              'Authorize Payment',
              '001',
              JSON.stringify(error.response.data),
            );
          }
          throw new CelCoinApiException(
            'Authorize Payment - Unhanded Celcoin API Error',
            '001',
            JSON.stringify(error.response.data),
          );
        });

      logger.debug(`Response Data: ${JSON.stringify(response.data)}`);

      newPayment = this.celcoinApiBillPaymentsRepository.setPaymentProperties(
        newPayment,
        response.data,
      );

      await this.celcoinBillPaymentsStatus.saveNewStatus(
        newPayment,
        response.data.errorCode,
        response.data.message,
        response.data.status,
      );

      newPayment = await this.celcoinApiBillPaymentsRepository.updatePayment(
        newPayment,
      );

      let authorizeResponse: AuthorizePaymentResponse = getInterfaceObject(
        newPayment,
        new AuthorizePaymentResponse(),
      );

      return authorizeResponse;
    } catch (error) {
      logger.error(`General Error: ${JSON.stringify(error)}`);
      if (typeof error.response.error.exception !== undefined) {
        throw error;
      } else {
        throwError(error, 'Authorize Payment - Unhanded Error', '010');
      }
    }
  }
}
