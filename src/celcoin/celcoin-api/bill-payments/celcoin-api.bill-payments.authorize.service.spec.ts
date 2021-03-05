import { Test, TestingModule } from '@nestjs/testing';
import { BillPaymentsAuthorizeService } from './celcoin-api.bill-payments.authorize.service';
import { HttpService, HttpModule } from '@nestjs/common';
import { CelcoinBillPaymentAuthorizeDto } from './dto/celcoin-api.billpayment.authorize.dto';

describe('BillPaymentsAuthorizeService', () => {
  let service: BillPaymentsAuthorizeService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [BillPaymentsAuthorizeService],
    }).compile();

    httpService = module.get<HttpService>(HttpService);
    service = module.get<BillPaymentsAuthorizeService>(BillPaymentsAuthorizeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // it('gets authorization for a payment to be processed', async () => {
  //   var celcoinBillPayment = new CelcoinBillPaymentAuthorizeDto();
  //   celcoinBillPayment.externalTerminal = 'Terminal', 
  //   celcoinBillPayment.externalNSU = 123;
  //   celcoinBillPayment.digitable= '';
  //   celcoinBillPayment.barcode = '';

  //   const data = {
  //     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiI0MWI0NGFiOWE1NjQ0MC50ZXN0ZS5jZWxjb2luYXBpLnY1IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6InRlc3RlIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy91c2VyZGF0YSI6ImI5ZTI1NmJiN2RmOTRmNTQ5NGJkIiwiZXhwIjoxNjEyMTg1OTM0LCJpc3MiOiJDZWxjb2luQVBJIiwiYXVkIjoiQ2VsY29pbkFQSSJ9.ImS9n89TObSqS7WPVgPHiBPc7L6VthdI14oQFmx4Vmo",
  //     "expires_in": 2400,
  //     "token_type": "bearer"
  //   };

  //   const response: AxiosResponse<any> = {
  //     data,
  //     headers: {},
  //     config: { url: 'http://localhost:3000/mockUrl' },
  //     status: 200,
  //     statusText: 'OK',
  //   };

  //   jest
  //   .spyOn(httpService, 'post')
  //   .mockImplementationOnce(() => of(response));
  //   celCoinApiService.getAuthToken(celcoinAuthDto).then(res => {
  //     expect(res).toEqual(data);
  //   });

  // });
});
