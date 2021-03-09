import { EntityRepository, MoreThan, Repository } from "typeorm";
import { CelCoinApiAuthToken } from './entities/celcoin-api-auth-token.entity';
import { CelcoinAuthResponseDto, getExpireDate } from './dto/celcoin.auth.response.dto';
import { InternalServerErrorException } from "@nestjs/common";

@EntityRepository(CelCoinApiAuthToken)
export class CelcoinAuthRepository extends Repository<CelCoinApiAuthToken> {
    
    async saveToken(celcoinAuthResponseDto: CelcoinAuthResponseDto): Promise<void> {
        const { access_token, expires_in, token_type } = celcoinAuthResponseDto;
        const token = this.create();
        token.access_token = access_token;
        token.expire_date = getExpireDate(expires_in);
        token.token_type = token_type;
        try {
            await token.save();
        } catch (error) {
            throw new InternalServerErrorException();
        }
    } 
    
    async getValidToken(): Promise<CelCoinApiAuthToken> {
        const token = await this.findOne({ expire_date: MoreThan(new Date(Date.now()).toUTCString()) });
        return token;
    }
    
}
