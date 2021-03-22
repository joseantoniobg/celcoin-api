import { Test, TestingModule } from '@nestjs/testing';
import { CelcoinAuthorizePaymentService } from './celcoin-api.bill-payments.authorize-payment.service';
import { HttpService, Logger, HttpModule } from '@nestjs/common';
import { CelcoinApiAuthService } from '../../auth/celcoin-api.auth.service';
import { CelcoinApiBillPaymentsRepository } from '../celcoin-api.bill-payments.repository';
import { CelcoinApiBillPaymentsStatusRepository } from '../celcoin-api.bill-payments-status.repository';
import { ConfigModule, ConfigType } from '@nestjs/config';
import celcoinApiConfig from '../../config/celcoin-api.config';
import { CelcoinApiBillPaymentAuthorizeDto } from '../dto/celcoin-api.billpayment.authorize.dto';
import { CelCoinAuthDto } from '../../auth/dto/celcoin.auth.dto';
import { AuthorizePaymentResponse } from '../responses/celcoin-api.bill-payments.AuthorizePaymentResponse';
import { BarCodeDto } from '../dto/celcoin-api.billpayment.barcode.dto';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import * as functionHelpers from '../../../helpers/helper.functions';
import { DbNotFoundException } from '../../exceptions/exception';
import {
  CelCoinApiException,
  PaymentException,
} from '../../exceptions/exception';

const mockAuthService = () => ({
  getAuthToken: jest.fn(),
});

const mockPaymentRepository = () => ({
  saveNewPendingPayment: jest.fn(),
  setPaymentProperties: jest.fn(),
  updatePayment: jest.fn(),
});

const mockPaymentStatusRepository = () => ({
  saveNewStatus: jest.fn(),
});

describe('AuthorizePaymentService', () => {
  let httpService;
  let authService;
  let paymentRepository;
  let paymentStatusRepository;
  let service;
  let celCoinApiConfiguration;
  let celcoinBillPayment;
  let celcoinAuthData;
  let logger: Logger;

  describe('call Celcoin API to get a authorization to the a new payment', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          HttpModule,
          ConfigModule.forFeature(celcoinApiConfig),
          ConfigModule.forRoot(),
        ],
        providers: [
          CelcoinAuthorizePaymentService,
          { provide: CelcoinApiAuthService, useFactory: mockAuthService },
          {
            provide: CelcoinApiBillPaymentsRepository,
            useFactory: mockPaymentRepository,
          },
          {
            provide: CelcoinApiBillPaymentsStatusRepository,
            useFactory: mockPaymentStatusRepository,
          },
        ],
      }).compile();

      service = await module.get<CelcoinAuthorizePaymentService>(
        CelcoinAuthorizePaymentService,
      );
      httpService = await module.get<HttpService>(HttpService);
      authService = await module.get<CelcoinApiAuthService>(
        CelcoinApiAuthService,
      );
      paymentRepository = await module.get<CelcoinApiBillPaymentsRepository>(
        CelcoinApiBillPaymentsRepository,
      );
      paymentStatusRepository = await module.get<CelcoinApiBillPaymentsStatusRepository>(
        CelcoinApiBillPaymentsStatusRepository,
      );
      celCoinApiConfiguration = await module.get<
        ConfigType<typeof celcoinApiConfig>
      >(celcoinApiConfig.KEY);

      celcoinBillPayment = new CelcoinApiBillPaymentAuthorizeDto();
      (celcoinBillPayment.externalTerminal = 'Terminal'),
        (celcoinBillPayment.externalNSU = undefined);
      celcoinBillPayment.id = 1;
      const barCode = new BarCodeDto();
      barCode.digitable = 'test';
      barCode.barCode = 'test';
      celcoinBillPayment.barCode = barCode;

      logger = new Logger('CelcoinPayments');

      celcoinAuthData = new CelCoinAuthDto();
      celcoinAuthData.client_id = process.env.CELCOIN_CLIENT_ID;
      celcoinAuthData.client_secret = process.env.CELCOIN_CLIENT_SECRET;
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('Should get a payment authorization due to its digitable and bar code', async () => {
      paymentRepository.saveNewPendingPayment.mockResolvedValue(
        celcoinBillPayment,
      );
      authService.getAuthToken.mockResolvedValue(celcoinAuthData);

      expect(paymentRepository.saveNewPendingPayment).not.toHaveBeenCalled();
      expect(paymentRepository.setPaymentProperties).not.toHaveBeenCalled();
      expect(paymentRepository.updatePayment).not.toHaveBeenCalled();
      expect(authService.getAuthToken).not.toHaveBeenCalled();

      const dataRe = new AuthorizePaymentResponse();

      const response: AxiosResponse<any> = {
        data: dataRe,
        headers: {},
        config: { url: 'http://localhost:3000/mockUrl' },
        status: 200,
        statusText: 'OK',
      };

      const mockGetInterfaceObject = await jest.spyOn(
        functionHelpers,
        'getInterfaceObject',
      );

      expect(mockGetInterfaceObject).not.toHaveBeenCalled();
      expect(paymentStatusRepository.saveNewStatus).not.toHaveBeenCalled();

      jest
        .spyOn(httpService, 'post')
        .mockImplementationOnce(() => of(response));

      await service
        .getPaymentAuthorization(celcoinBillPayment, logger)
        .then((res) => {
          expect(res instanceof AuthorizePaymentResponse).toBe(true);
          expect(res).toEqual(dataRe);
        });

      expect(paymentRepository.saveNewPendingPayment).toHaveBeenCalledWith(
        celcoinBillPayment,
      );
      expect(paymentRepository.setPaymentProperties).toHaveBeenLastCalledWith(
        celcoinBillPayment,
        response.data,
      );
      expect(authService.getAuthToken).toHaveBeenCalledWith(celcoinAuthData);
      expect(paymentRepository.updatePayment).toHaveBeenCalled();
      expect(paymentStatusRepository.saveNewStatus).toHaveBeenCalled();
      expect(mockGetInterfaceObject).toHaveBeenCalled();
    });

    it("should throw an Payment Error Exception when CelCoin don't process the payment and returns an business logic error", async () => {
      paymentRepository.saveNewPendingPayment.mockResolvedValue(
        celcoinBillPayment,
      );
      authService.getAuthToken.mockResolvedValue(celcoinAuthData);

      const dataResp = {
        errorCode: '999',
        message: 'Erro na conversao de Codigo de Barras para Linha Digitavel',
      };

      const error = {
        response: {
          data: dataResp,
          headers: {},
          config: { url: 'http://localhost:3000/mockUrl' },
          status: 400,
          statusText: 'Bad Request',
        },
      };

      jest
        .spyOn(httpService, 'post')
        .mockImplementation(() => throwError(error));

      await expect(
        service.getPaymentAuthorization(celcoinBillPayment, logger),
      ).rejects.toThrow(
        new PaymentException(
          'Authorize Payment - Unhanded Celcoin API Error',
          '001',
          JSON.stringify(error.response.data),
        ),
      );
    });

    it("should throw an Celcoin Error Exception when CelCoin don't process the payment and returns a not expected response, or service is down", async () => {
      paymentRepository.saveNewPendingPayment.mockResolvedValue(
        celcoinBillPayment,
      );
      authService.getAuthToken.mockResolvedValue(celcoinAuthData);

      const dataResp = {
        message: 'Random celcoin error',
      };

      const error = {
        response: {
          data: dataResp,
          headers: {},
          config: { url: 'http://localhost:3000/mockUrl' },
          status: 503,
          statusText: 'Bad Request',
        },
      };

      jest
        .spyOn(httpService, 'post')
        .mockImplementation(() => throwError(error));

      await expect(
        service.getPaymentAuthorization(celcoinBillPayment, logger),
      ).rejects.toThrow(
        new CelCoinApiException(
          'Authorize Payment - Unhanded Celcoin API Error',
          '001',
          JSON.stringify(error.response.data),
        ),
      );
    });
  });
});
