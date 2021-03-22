import { Injectable, HttpService, Inject, Logger } from '@nestjs/common';
import { CelcoinApiAuthService } from '../../auth/celcoin-api.auth.service';
import { ConfigType } from '@nestjs/config';
import celcoinApiConfig from '../../config/celcoin-api.config';
import { InjectRepository } from '@nestjs/typeorm';
import { CelcoinApiBillPaymentsRepository } from '../celcoin-api.bill-payments.repository';
import { CelcoinApiBillPaymentAuthorizeDto } from '../dto/celcoin-api.billpayment.authorize.dto';
import { CelCoinApiException } from '../../exceptions/exception';
import {
  getCelcoinAuthData,
  savePaymentStatus,
  throwError,
} from '../../helpers/celcoin-api.helpers';
import { CelcoinApiBillPaymentsStatusRepository } from '../celcoin-api.bill-payments-status.repository';
import {
  getFormattedObject,
  getInterfaceObject,
} from '../../../helpers/helper.functions';
import { AuthorizePaymentResponse } from '../responses/celcoin-api.bill-payments.AuthorizePaymentResponse';
import {
  CELCOINAPI_AUTOHRIZE_PAYMENT_ERROR,
  CELCOINAPI_AUTHORIZE_PAYMENT_UNHANDED_ERROR,
} from '../constants/error.constants';

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

      var newPayment = await this.celcoinApiBillPaymentsRepository.saveNewPendingPayment(
        celcoinApiBillPaymentAuthorizeDto,
      );
      celcoinApiBillPaymentAuthorizeDto.externalNSU = newPayment.id;

      logger.debug(`Will call CelCoin API to authorize a new payment`);

      var response = await this.httpService
        .post(urlEndPoint, celcoinApiBillPaymentAuthorizeDto, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenData.token}`,
          },
        })
        .toPromise()
        .catch(async (error) => {
          if (error.response.data.errorCode) {
            await savePaymentStatus(
              newPayment,
              error.response.data.errorCode,
              error.response.data.message,
              error.response.data.status,
              this.celcoinBillPaymentsStatus,
              'Authorize Payment',
            );
          }
          throw new CelCoinApiException(
            CELCOINAPI_AUTOHRIZE_PAYMENT_ERROR.performedAction,
            CELCOINAPI_AUTOHRIZE_PAYMENT_ERROR.errorCode,
            JSON.stringify(error.response.data),
          );
        });

      logger.debug(`Response Data: ${JSON.stringify(response.data)}`);

      newPayment = this.celcoinApiBillPaymentsRepository.setPaymentProperties(
        newPayment,
        response.data,
      );

      await savePaymentStatus(
        newPayment,
        response.data.errorCode,
        response.data.message,
        response.data.status,
        this.celcoinBillPaymentsStatus,
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
      if (error.response.error.exception) {
        throw error;
      } else {
        throwError(
          error,
          CELCOINAPI_AUTHORIZE_PAYMENT_UNHANDED_ERROR.performedAction,
          CELCOINAPI_AUTHORIZE_PAYMENT_UNHANDED_ERROR.errorCode,
        );
      }
    }
  }
}
