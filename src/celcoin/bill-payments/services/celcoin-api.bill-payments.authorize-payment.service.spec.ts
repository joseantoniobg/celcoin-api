import { Test, TestingModule } from '@nestjs/testing';
import { CelcoinAuthorizePaymentService } from './celcoin-api.bill-payments.authorize-payment.service';

describe('CelcoinService', () => {
  let service: CelcoinAuthorizePaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CelcoinAuthorizePaymentService],
    }).compile();

    service = module.get<CelcoinAuthorizePaymentService>(CelcoinAuthorizePaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
