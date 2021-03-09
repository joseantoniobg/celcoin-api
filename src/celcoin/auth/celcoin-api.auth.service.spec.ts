import { Test, TestingModule } from '@nestjs/testing';
import { CelcoinApiAuthService } from './celcoin-api.auth.service';
import { CelCoinAuthDto } from './dto/celcoin.auth.dto';
import { HttpModule, HttpService, BadRequestException } from '@nestjs/common';
import { CelcoinAuthRepository } from './celcoin-api.auth.repository';
import { ConfigModule } from '@nestjs/config';
import celcoinApiConfig from '../config/celcoin-api.config';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';

const mockAuthRepository = () => ({
  saveToken: jest.fn(),
  getValidToken: jest.fn(),
});


describe('CelcoinApiService', () => {
  let celCoinApiService: CelcoinApiAuthService;
  let httpService;
  let celcoinAuthRepository;
  let celcoinAuthDto;
  let mockToken;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule,
                ConfigModule.forFeature(celcoinApiConfig),],
      providers: [CelcoinApiAuthService,
                  { provide: CelcoinAuthRepository, 
                    useFactory: mockAuthRepository,
                  },
          ],
    }).compile();

    celCoinApiService = await module.get<CelcoinApiAuthService>(CelcoinApiAuthService);
    httpService = await module.get<HttpService>(HttpService);
    celcoinAuthRepository = await module.get<CelcoinAuthRepository>(CelcoinAuthRepository); 

    celcoinAuthDto = new CelCoinAuthDto();
    celcoinAuthDto.client_id = '41b44ab9a56440.teste.celcoinapi.v5', 
    celcoinAuthDto.client_secret = 'e9d15cde33024c1494de7480e69b7a18c09d7cd25a8446839b3be82a56a044a3';
    mockToken = { access_token: 'test', expire_date: new Date(Date.now() + 2400000), token_type: 'bearer' }

  });

  it('should be defined', () => {
    expect(celCoinApiService).toBeDefined();
  });

  it('expects to look for a valid token from the repository and returns it', async () => {

    celcoinAuthRepository.getValidToken.mockResolvedValue(mockToken);
    expect(celcoinAuthRepository.getValidToken).not.toHaveBeenCalled();
    const result = await celCoinApiService.getAuthToken(celcoinAuthDto);
    expect(celcoinAuthRepository.getValidToken).toHaveBeenCalled();
    expect(result).toEqual({ token: mockToken.access_token })

  });

  it('returns a token from the CelCoin Api when local database doesnt have a valid token', async () => {
  
    const data = {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiI0MWI0NGFiOWE1NjQ0MC50ZXN0ZS5jZWxjb2luYXBpLnY1IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6InRlc3RlIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy91c2VyZGF0YSI6ImI5ZTI1NmJiN2RmOTRmNTQ5NGJkIiwiZXhwIjoxNjEyMTg1OTM0LCJpc3MiOiJDZWxjb2luQVBJIiwiYXVkIjoiQ2VsY29pbkFQSSJ9.ImS9n89TObSqS7WPVgPHiBPc7L6VthdI14oQFmx4Vmo",
      "expires_in": 2400,
      "token_type": "bearer"
    };

    const response: AxiosResponse<any> = {
      data,
      headers: {},
      config: { url: 'http://localhost:3000/mockUrl' },
      status: 200,
      statusText: 'OK',
    };

    celcoinAuthRepository.getValidToken.mockResolvedValue(undefined);

    jest
    .spyOn(httpService, 'post')
    .mockImplementationOnce(() => of(response));
    celCoinApiService.getAuthToken(celcoinAuthDto).then(res => {
      expect(res).toEqual({ token: data.access_token });
    });

  });

  it('throws a bad request exception when client_id or Client_secret are incorrect', async () => {
    
    var celcoinAuthDto = new CelCoinAuthDto();
    celcoinAuthDto.client_id = 'notTheRightClientId', 
    celcoinAuthDto.client_secret = 'NotTheRightSecret';

    const data = {
      "errorCode": "999",
      "message": "invalid client_secret"
    };

    const response: AxiosResponse<any> = {
      data,
      headers: {},
      config: { url: 'http://localhost:3000/mockUrl' },
      status: 400,
      statusText: 'Bad Request',
    };

    jest
    .spyOn(httpService, 'post')
    .mockImplementationOnce(() => of(response));

    expect(celCoinApiService.getAuthToken(celcoinAuthDto)).rejects.toThrow(new BadRequestException(data));

  });

});
