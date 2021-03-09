import { BadRequestException, HttpService, Injectable, Logger, Post, Body, Inject } from '@nestjs/common';
import { CelCoinAuthDto } from './dto/celcoin.auth.dto';
import celcoinApiConfig from '../config/celcoin-api.config';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CelcoinAuthRepository } from './celcoin-api.auth.repository';

@Injectable()
export class CelcoinApiAuthService {

    constructor(private httpService: HttpService, 
                @Inject(celcoinApiConfig.KEY)
                private readonly celCoinApiConfiguration: ConfigType<typeof celcoinApiConfig>,
                @InjectRepository(CelcoinAuthRepository)
                private readonly authRepository: CelcoinAuthRepository) {}

    async getAuthToken(celCoinAuthDto: CelCoinAuthDto): Promise<any> {
        try {
            
            const token = await this.authRepository.getValidToken();

            if (!token) {
                const urlEndPoint = this.celCoinApiConfiguration.services_endpoints.auth_token_url;
                const formData = celCoinAuthDto.getFormData();
                const response = await this.httpService.post(urlEndPoint, 
                                                 formData, {
                                                    headers: formData.getHeaders(),
                                                }).toPromise();

                if (response.status != 200) {
                    throw new BadRequestException(response.data);
                }

                await this.authRepository.saveToken(response.data); 

                return { token: response.data.access_token };
            }

            return { token: token.access_token };
        
        } catch (error) {
            throw error;
        }
    }
}
