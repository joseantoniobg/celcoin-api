import { Test, TestingModule } from '@nestjs/testing';
import { CelcoinApiBillPaymentsService } from './celcoin-api.bill-payments.service';
import { HttpService, HttpModule } from '@nestjs/common';
import { CelcoinApiBillPaymentAuthorizeDto } from './dto/celcoin-api.billpayment.authorize.dto';
import { CelCoinAuthDto } from '../auth/dto/celcoin.auth.dto';
import { CelcoinApiAuthService } from '../auth/celcoin-api.auth.service';
import { CelcoinApiBillPaymentsRepository } from './celcoin-api.bill-payments.repository';
import { CelcoinPayments } from './entities/celcoin-api.billpayments.entity';
import { AxiosResponse } from 'axios';

describe('BillPaymentsService', () => {
  let service: CelcoinApiBillPaymentsService;
  let httpService: HttpService;
  let authService: CelcoinApiAuthService;
  let paymentRepository: CelcoinApiBillPaymentsRepository;

  const mockAuthService = () => ({
    getAuthToken: jest.fn(),
  });

  const mockPaymentRepository = () => ({
    saveNewPendingPayment: jest.fn(),
  });

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [CelcoinApiBillPaymentsService, 
                  { provide: CelcoinApiAuthService, useFactory: mockAuthService },
                  {provide: CelcoinApiBillPaymentsRepository, useFactory: mockPaymentRepository },
                ],
    }).compile();

    httpService = await module.get<HttpService>(HttpService);
    service = await module.get<CelcoinApiBillPaymentsService>(CelcoinApiBillPaymentsService);
    authService = await module.get<CelcoinApiAuthService>(CelcoinApiAuthService);
    paymentRepository = await module.get<CelcoinApiBillPaymentsRepository>(CelcoinApiBillPaymentsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('gets authorization for a payment to be processed', async () => {
    const celcoinBillPayment = new CelcoinApiBillPaymentAuthorizeDto();
    celcoinBillPayment.externalTerminal = 'Terminal', 
    celcoinBillPayment.externalNSU = undefined;
    celcoinBillPayment.barCode.digitable= 'test';
    celcoinBillPayment.barCode.barCode = 'test';

    const celcoinAuthData = new CelCoinAuthDto();
    celcoinAuthData.client_id = 'id';
    celcoinAuthData.client_secret = 'secret';

    const mockcelcoinPayment = new CelcoinPayments();
    mockcelcoinPayment.id = 1;

    expect(authService.getAuthToken).not.toHaveBeenCalled();
    expect(paymentRepository.saveNewPendingPayment).not.toHaveBeenCalled();
    paymentRepository.saveNewPendingPayment.mockResolvedValue(mockcelcoinPayment);

    const response: AxiosResponse<any> = {
      data,
      headers: {},
      config: { url: 'http://localhost:3000/mockUrl' },
      status: 200,
      statusText: 'OK',
    };

    jest
    .spyOn(httpService, 'post')
    .mockImplementationOnce(() => of(response));
    celCoinApiService.getAuthToken(celcoinAuthDto).then(res => {
      expect(res).toEqual(data);
    });

  });
});
