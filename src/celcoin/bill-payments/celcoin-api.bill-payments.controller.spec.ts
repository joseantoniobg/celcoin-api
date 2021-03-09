import { Test, TestingModule } from '@nestjs/testing';
import { BillPaymentsController } from './celcoin-api.bill-payments.controller';

describe('BillPaymentsController', () => {
  let controller: BillPaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillPaymentsController],
    }).compile();

    controller = module.get<BillPaymentsController>(BillPaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
