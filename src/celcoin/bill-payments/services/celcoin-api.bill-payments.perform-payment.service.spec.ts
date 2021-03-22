import { Test, TestingModule } from '@nestjs/testing';
import { Logger, HttpModule, HttpService } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import celcoinApiConfig from '../../config/celcoin-api.config';
import { CelcoinPerformPaymentService } from './celcoin-api.bill-payments.perform-payment.service';
import { CelcoinApiAuthService } from '../../auth/celcoin-api.auth.service';
import { CelcoinApiBillPaymentsRepository } from '../celcoin-api.bill-payments.repository';
import { CelcoinApiBillPaymentsStatusRepository } from '../celcoin-api.bill-payments-status.repository';
import * as functionHelpers from '../../../helpers/helper.functions';
import { CelCoinAuthDto } from '../../auth/dto/celcoin.auth.dto';
import { PerformPaymentControllerDto } from '../dto/celcoin-api.billpayment.perform-controller.dto';
import { PerformPaymentResponse } from '../responses/celcoin-api.bill-payments.PerformPaymentResponse';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { PaymentException } from '../../exceptions/exception';
import {
  CelCoinApiException,
  DbNotFoundException,
} from '../../exceptions/exception';

const mockAuthService = () => ({
  getAuthToken: jest.fn(),
});

const mockPaymentRepository = () => ({
  findPaymentById: jest.fn(),
  updatePayment: jest.fn(),
});

const mockPaymentStatusRepository = () => ({
  saveNewStatus: jest.fn(),
});

describe('PerformPaymentService', () => {
  let httpService;
  let authService;
  let paymentRepository;
  let paymentStatusRepository;
  let service;
  let celCoinApiConfiguration;
  let celcoinBillPayment;
  let celcoinAuthData;
  let logger: Logger;

  describe('call Celcoin API to actually do the payment', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          HttpModule,
          ConfigModule.forFeature(celcoinApiConfig),
          ConfigModule.forRoot(),
        ],
        providers: [
          CelcoinPerformPaymentService,
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

      service = await module.get<CelcoinPerformPaymentService>(
        CelcoinPerformPaymentService,
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

      celcoinBillPayment = new PerformPaymentControllerDto();
      celcoinBillPayment.id = 1;
      celcoinBillPayment.cpfCnpj = '000.000.000-00';
      celcoinBillPayment.valor = 100;

      logger = new Logger('CelcoinPayments');

      celcoinAuthData = new CelCoinAuthDto();
      celcoinAuthData.client_id = process.env.CELCOIN_CLIENT_ID;
      celcoinAuthData.client_secret = process.env.CELCOIN_CLIENT_SECRET;
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('Should perform the payment by its ID', async () => {
      paymentRepository.findPaymentById.mockResolvedValue(celcoinBillPayment);
      authService.getAuthToken.mockResolvedValue(celcoinAuthData);

      expect(paymentRepository.findPaymentById).not.toHaveBeenCalled();
      expect(paymentStatusRepository.saveNewStatus).not.toHaveBeenCalled();
      expect(paymentRepository.updatePayment).not.toHaveBeenCalled();
      expect(authService.getAuthToken).not.toHaveBeenCalled();

      const dataRe = {
        ...new PerformPaymentResponse(),
        authenticationAPI: {
          BlocoCompleto: '',
        },
        receipt: {
          receiptformatted: '',
        },
        transactionId: 1,
      };

      const resp = new PerformPaymentResponse();

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

      await service.performPayment(celcoinBillPayment, logger).then((res) => {
        expect(res instanceof PerformPaymentResponse).toBe(true);
        expect(res).toEqual(resp);
      });

      expect(authService.getAuthToken).toHaveBeenCalledWith(celcoinAuthData);
      expect(paymentRepository.updatePayment).toHaveBeenCalled();
      expect(paymentStatusRepository.saveNewStatus).toHaveBeenCalled();
      expect(mockGetInterfaceObject).toHaveBeenCalled();
    });

    it('should throw an DebNotFound Error Exception when the given id is not found in database', async () => {
      paymentRepository.findPaymentById.mockResolvedValue(undefined);
      authService.getAuthToken.mockResolvedValue(celcoinAuthData);

      await expect(
        service.performPayment(celcoinBillPayment, logger),
      ).rejects.toThrow(
        new DbNotFoundException(
          'Perform Payment',
          '020',
          'Payment id not found',
        ),
      );
    });

    it('Should return a PaymentException error when Celcoin returns a business logic error', async () => {
      paymentRepository.findPaymentById.mockResolvedValue(celcoinBillPayment);
      authService.getAuthToken.mockResolvedValue(celcoinAuthData);

      const dataResp = {
        errorCode: '999',
        message: 'Random celcoin business logic error',
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
        service.performPayment(celcoinBillPayment, logger),
      ).rejects.toThrow(
        new PaymentException(
          `Perform Payment`,
          '001',
          JSON.stringify(error.response.data),
        ),
      );
    });

    it('Should return a CelCoinApi error when Celcoin returns non expected error', async () => {
      paymentRepository.findPaymentById.mockResolvedValue(celcoinBillPayment);
      authService.getAuthToken.mockResolvedValue(celcoinAuthData);

      const dataResp = {
        message: 'Random celcoin random error',
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
        service.performPayment(celcoinBillPayment, logger),
      ).rejects.toThrow(
        new CelCoinApiException(
          `Perform Payment`,
          '001',
          JSON.stringify(error.response.data),
        ),
      );
    });
  });
});
