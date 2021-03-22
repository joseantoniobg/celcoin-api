import { Test, TestingModule } from '@nestjs/testing';
import { CelcoinEndPaymentService } from './celcoin-api.bill-payments.end-payment.service';

describe('CelcoinService', () => {
  let service: CelcoinEndPaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CelcoinEndPaymentService],
    }).compile();

    service = module.get<CelcoinEndPaymentService>(CelcoinEndPaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
