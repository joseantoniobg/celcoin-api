import { Test, TestingModule } from '@nestjs/testing';
import { CelcoinPerformPaymentService } from './celcoin-api.bill-payments.perform-payment.service';
import { CelcoinAuthorizePaymentService } from './celcoin-api.bill-payments.authorize-payment.service';
import { CelcoinEndPaymentService } from './celcoin-api.bill-payments.end-payment.service';
import { CelcoinApiBillPaymentsService } from './celcoin-api.bill-payments.service';

const mockAuthorizePaymentService = () => ({
  getPaymentAuthorization: jest.fn(),
});

const mockPerformPaymentService = () => ({
  performPayment: jest.fn(),
});

const mockEndPaymentService = () => ({
  endPayment: jest.fn(),
});

describe('CelcoinBillPaymentsService', () => {
  let service;
  let authorizePaymentService;
  let performPaymentService;
  let endPaymentService;
  describe('endpoint to unite all services relative to bill payment process', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CelcoinApiBillPaymentsService,
          {
            provide: CelcoinAuthorizePaymentService,
            useFactory: mockAuthorizePaymentService,
          },
          {
            provide: CelcoinPerformPaymentService,
            useFactory: mockPerformPaymentService,
          },
          {
            provide: CelcoinEndPaymentService,
            useFactory: mockEndPaymentService,
          },
        ],
      }).compile();

      service = await module.get<CelcoinApiBillPaymentsService>(
        CelcoinApiBillPaymentsService,
      );

      authorizePaymentService = await module.get<CelcoinAuthorizePaymentService>(
        CelcoinAuthorizePaymentService,
      );
      performPaymentService = await module.get<CelcoinPerformPaymentService>(
        CelcoinPerformPaymentService,
      );
      endPaymentService = await module.get<CelcoinEndPaymentService>(
        CelcoinEndPaymentService,
      );
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('authorize a payment by calling it service', async () => {
      const mockCelcoinApiBillPaymentAuthorizeDto = {};
      expect(
        authorizePaymentService.getPaymentAuthorization,
      ).not.toHaveBeenCalled();
      await service.getPaymentAuthorization(
        mockCelcoinApiBillPaymentAuthorizeDto,
      );
      expect(
        authorizePaymentService.getPaymentAuthorization,
      ).toHaveBeenCalled();
    });

    it('perform a payment by calling it service', async () => {
      const mockCelcoinApiBillPaymentPerformDto = {};
      expect(performPaymentService.performPayment).not.toHaveBeenCalled();
      await service.performPayment(mockCelcoinApiBillPaymentPerformDto);
      expect(performPaymentService.performPayment).toHaveBeenCalled();
    });

    it('end a payment by calling it service', async () => {
      const mockBody = { id: 1, paymentDestination: 'CONFIRM' };
      expect(endPaymentService.endPayment).not.toHaveBeenCalled();
      await service.endPayment(mockBody);
      expect(endPaymentService.endPayment).toHaveBeenCalled();
    });
  });
});
