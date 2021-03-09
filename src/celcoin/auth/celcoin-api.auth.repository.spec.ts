import { Test } from '@nestjs/testing';
import { CelcoinAuthRepository } from './celcoin-api.auth.repository';
import { CelCoinApiAuthToken } from './entities/celcoin-api-auth-token.entity';
import { MoreThan } from 'typeorm';
describe('CelcoinAuthRepository', () => {
    let celcoinAuthRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [CelcoinAuthRepository,],
        }).compile();

        celcoinAuthRepository = await module.get<CelcoinAuthRepository>(CelcoinAuthRepository);
    });

    describe('getValidToken', () => {
        let findOne;

        beforeEach(() => {
            findOne = jest.fn();
            celcoinAuthRepository.findOne = jest.fn().mockReturnValue({ findOne });
        });

        it('gets a valid token from the repository', async () => {
            
            const authToken = new CelCoinApiAuthToken();
            authToken.access_token = 'test';
            celcoinAuthRepository.findOne.mockResolvedValue(authToken);
            expect(celcoinAuthRepository.findOne).not.toHaveBeenCalled();
            const result = await celcoinAuthRepository.getValidToken();
            expect(celcoinAuthRepository.findOne).toHaveBeenCalled();
            expect(result).toEqual(authToken);

        });

    });

});