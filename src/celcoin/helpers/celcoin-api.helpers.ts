import { CelCoinAuthDto } from '../auth/dto/celcoin.auth.dto';
import { CelcoinPayments } from '../bill-payments/entities/celcoin-api.billpayments.entity';
import { CelcoinApiBillPaymentsStatusRepository } from '../bill-payments/celcoin-api.bill-payments-status.repository';
import { PaymentException, UnhandedException } from '../exceptions/exception';

export function getCelcoinAuthData(): CelCoinAuthDto {
  const celCoinAuthDto = new CelCoinAuthDto();
  celCoinAuthDto.client_id = process.env.CELCOIN_CLIENT_ID;
  celCoinAuthDto.client_secret = process.env.CELCOIN_CLIENT_SECRET;

  return celCoinAuthDto;
}

export function throwError(error, description: string, errorCode: string) {
  if (!error.response.error.exception) {
    throw new UnhandedException(description, errorCode, JSON.stringify(error));
  } else {
    throw error;
  }
}
