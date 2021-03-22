import { Test, TestingModule } from '@nestjs/testing';
import { Logger, HttpModule, HttpService } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import celcoinApiConfig from '../../config/celcoin-api.config';
import { CelcoinApiAuthService } from '../../auth/celcoin-api.auth.service';
import { CelcoinApiBillPaymentsRepository } from '../celcoin-api.bill-payments.repository';
import { CelcoinApiBillPaymentsStatusRepository } from '../celcoin-api.bill-payments-status.repository';
import * as functionHelpers from '../../../helpers/helper.functions';
import { CelCoinAuthDto } from '../../auth/dto/celcoin.auth.dto';
import { EndPaymentResponse } from '../responses/celcoin-api.bill-payments.EndPaymentResponse';
import { AxiosResponse } from 'axios';
import { CelcoinEndPaymentService } from './celcoin-api.bill-payments.end-payment.service';
import { PaymentDestination } from '../celcoin-api.bill-payments.destination.enum';
import { of, throwError } from 'rxjs';
import { CelcoinApiBillPaymentAuthorizeDto } from '../dto/celcoin-api.billpayment.authorize.dto';
import { DbNotFoundException } from '../../exceptions/exception';
import {
  PaymentException,
  CelCoinApiException,
} from '../../exceptions/exception';

const mockAuthService = () => ({
  getAuthToken: jest.fn(),
});

const mockPaymentRepository = () => ({
  findPaymentById: jest.fn(),
  setPaymentProperties: jest.fn(),
  updatePayment: jest.fn(),
});

const mockPaymentStatusRepository = () => ({
  saveNewStatus: jest.fn(),
});

describe('EndPaymentService', () => {
  let httpService;
  let authService;
  let paymentRepository;
  let paymentStatusRepository;
  let service;
  let celCoinApiConfiguration;
  let celcoinAuthData;
  let logger: Logger;

  describe('call Celcoin API to finalize the payment', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          HttpModule,
          ConfigModule.forFeature(celcoinApiConfig),
          ConfigModule.forRoot(),
        ],
        providers: [
          CelcoinEndPaymentService,
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

      service = await module.get<CelcoinEndPaymentService>(
        CelcoinEndPaymentService,
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

      logger = new Logger('CelcoinPayments');

      celcoinAuthData = new CelCoinAuthDto();
      celcoinAuthData.client_id = process.env.CELCOIN_CLIENT_ID;
      celcoinAuthData.client_secret = process.env.CELCOIN_CLIENT_SECRET;
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('Should finalize the payment by its ID', async () => {
      authService.getAuthToken.mockResolvedValue(celcoinAuthData);
      paymentRepository.findPaymentById.mockResolvedValue({
        performTransactionId: 12345,
      });

      expect(paymentRepository.findPaymentById).not.toHaveBeenCalled();
      expect(paymentRepository.updatePayment).not.toHaveBeenCalled();
      expect(authService.getAuthToken).not.toHaveBeenCalled();

      const dataRe = new EndPaymentResponse();

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

      jest.spyOn(httpService, 'put').mockImplementationOnce(() => of(response));

      await service
        .endPayment(1, PaymentDestination.CONFIRM, logger)
        .then((res) => {
          expect(res instanceof EndPaymentResponse).toBe(true);
          expect(res).toEqual(dataRe);
        });

      expect(authService.getAuthToken).toHaveBeenCalledWith(celcoinAuthData);
      expect(paymentRepository.updatePayment).toHaveBeenCalled();
      expect(paymentStatusRepository.saveNewStatus).toHaveBeenCalled();
      expect(mockGetInterfaceObject).toHaveBeenCalled();
    });

    it('Should throw a DBNotFoundException Error when payment is not found by id', async () => {
      authService.getAuthToken.mockResolvedValue(celcoinAuthData);
      paymentRepository.findPaymentById.mockResolvedValue(undefined);

      await expect(
        service.endPayment(1, PaymentDestination.CONFIRM, logger),
      ).rejects.toThrow(
        new DbNotFoundException(
          `CONFIRM Payment`,
          '020',
          'Payment id not found',
        ),
      );
    });

    it('Should throw a PaymentException Error due to a Celcoin business logic error response', async () => {
      authService.getAuthToken.mockResolvedValue(celcoinAuthData);
      paymentRepository.findPaymentById.mockResolvedValue({
        performTransactionId: 12345,
      });

      const dataResp = {
        errorCode: '999',
        message: 'Pagamento ja realizado',
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
        .spyOn(httpService, 'put')
        .mockImplementation(() => throwError(error));

      await expect(
        service.endPayment(1, PaymentDestination.CONFIRM, logger),
      ).rejects.toThrow(
        new PaymentException(
          `CONFIRM Payment`,
          '001',
          JSON.stringify(error.response.data),
        ),
      );
    });

    it('Should throw a CelcoinException Error due to a Celcoin non expected response', async () => {
      authService.getAuthToken.mockResolvedValue(celcoinAuthData);
      paymentRepository.findPaymentById.mockResolvedValue({
        performTransactionId: 12345,
      });

      const dataResp = {
        message: 'Random Celcoin Error',
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
        .spyOn(httpService, 'put')
        .mockImplementation(() => throwError(error));

      await expect(
        service.endPayment(1, PaymentDestination.CONFIRM, logger),
      ).rejects.toThrow(
        new CelCoinApiException(
          `CONFIRM Payment`,
          '001',
          JSON.stringify(error.response.data),
        ),
      );
    });
  });
});
