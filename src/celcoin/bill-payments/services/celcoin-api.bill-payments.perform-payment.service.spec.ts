import { Test, TestingModule } from '@nestjs/testing';
import { CelcoinPerformPaymentService } from './celcoin-api.bill-payments.perform-payment.service';

describe('CelcoinService', () => {
  let service: CelcoinPerformPaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CelcoinPerformPaymentService],
    }).compile();

    service = module.get<CelcoinPerformPaymentService>(CelcoinPerformPaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
