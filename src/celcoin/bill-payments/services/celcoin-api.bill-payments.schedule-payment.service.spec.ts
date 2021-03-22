import { Test, TestingModule } from '@nestjs/testing';
import { CelcoinApiBillPaymentsRepository } from '../celcoin-api.bill-payments.repository';
import { CelcoinSchedulePaymentService } from './celcoin-api.bill-payments.schedule-payment.service';
import { ScheduleBillPaymentDto } from '../dto/celcoin-api.billpayments.schedule.dto';
import { getDateFromStringISO } from '../../../helpers/helper.functions';
import { DbNotFoundException } from '../../exceptions/exception';
import { response } from 'express';
import { SchedulePaymentResponse } from '../responses/celcoin-api.bill-payments.SchedulePaymentResponse';

const mockBillPaymentsRepository = () => ({
  findPaymentById: jest.fn(),
  updatePayment: jest.fn(),
});

describe('SchedulePaymentService', () => {
  let service;
  let billPaymentRepository;

  describe('Should schedule a payment by a given payment date', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CelcoinSchedulePaymentService,
          {
            provide: CelcoinApiBillPaymentsRepository,
            useFactory: mockBillPaymentsRepository,
          },
        ],
      }).compile();

      service = module.get<CelcoinSchedulePaymentService>(
        CelcoinSchedulePaymentService,
      );
      billPaymentRepository = module.get<CelcoinApiBillPaymentsRepository>(
        CelcoinApiBillPaymentsRepository,
      );
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it("Should schedule a future payment by it's id", async () => {
      const mockBody = <ScheduleBillPaymentDto>{
        id: 1,
        paymentDate: getDateFromStringISO('2021-03-15T00:00:00.000Z'),
      };

      const mockPayment = {
        id: 1,
        paymentDate: undefined,
        isScheduled: false,
      };

      billPaymentRepository.findPaymentById.mockResolvedValue(mockPayment);

      expect(billPaymentRepository.findPaymentById).not.toHaveBeenCalled();
      expect(billPaymentRepository.updatePayment).not.toHaveBeenCalled();
      const result = await service.schedulePayment(mockBody);
      expect(billPaymentRepository.findPaymentById).toHaveBeenCalledWith(
        mockBody.id,
      );
      expect(billPaymentRepository.updatePayment).toHaveBeenCalled();
      expect(result instanceof SchedulePaymentResponse).toBe(true);
    });

    it('should throws a DbNotFoundException error when passing an invalid id', async () => {
      const mockBody = <ScheduleBillPaymentDto>{
        id: 0,
        paymentDate: getDateFromStringISO('2021-03-15T00:00:00.000Z'),
      };

      billPaymentRepository.findPaymentById.mockResolvedValue(undefined);

      await expect(service.schedulePayment(mockBody)).rejects.toThrow(
        new DbNotFoundException(
          'Schedule Payment',
          '020',
          'Payment ID not found',
        ),
      );
    });
  });
});
