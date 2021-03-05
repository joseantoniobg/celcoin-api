import { Test, TestingModule } from '@nestjs/testing';
import { BillPaymentsService } from './celcoin-api.bill-payments.service';
import { HttpService, HttpModule } from '@nestjs/common';
import { CelcoinBillPaymentDto } from './dto/celcoin-api.billpayment.dto';

describe('BillPaymentsService', () => {
  let service: BillPaymentsService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [BillPaymentsService],
    }).compile();

    service = module.get<BillPaymentsService>(BillPaymentsService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // it('performs a payment using celcoin billpayments service', async () => {
  //   var celcoinBillPayment = new CelcoinBillPaymentDto();
  //   celcoinBillPayment.externalTerminal = 'Terminal', 
  //   celcoinBillPayment.externalNSU = 123;
  //   celcoinBillPayment.cpfCnpj = '000.000.000-00';
  //   celcoinBillPayment.value = 10.99;
  //   celcoinBillPayment.originalValue = 10.99;
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

  // it('throws a bad request exception when client_id or Client_secret are incorrect', async () => {
    
  //   var celcoinAuthDto = new CelCoinAuthDto();
  //   celcoinAuthDto.client_id = 'notTheRightClientId', 
  //   celcoinAuthDto.client_secret = 'NotTheRightSecret';

  //   const data = {
  //     "errorCode": "999",
  //     "message": "invalid client_secret"
  //   };

  //   const response: AxiosResponse<any> = {
  //     data,
  //     headers: {},
  //     config: { url: 'http://localhost:3000/mockUrl' },
  //     status: 400,
  //     statusText: 'Bad Request',
  //   };

  //   jest
  //   .spyOn(httpService, 'post')
  //   .mockImplementationOnce(() => of(response));

  //   expect(celCoinApiService.getAuthToken(celcoinAuthDto)).rejects.toThrow(new BadRequestException(data));

  // });

});
