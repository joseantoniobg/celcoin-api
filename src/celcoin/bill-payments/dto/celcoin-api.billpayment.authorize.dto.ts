import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsString, MaxLength } from 'class-validator';
import { BarCodeDto } from './celcoin-api.billpayment.barcode.dto';

export class CelcoinApiBillPaymentAuthorizeDto {
  @IsString()
  @MaxLength(50)
  @ApiProperty({ description: 'Terminal identifier on client system' })
  externalTerminal: string;

  @ApiProperty({
    description:
      'Transaction identifier on the client system - its not necessary to include',
  })
  externalNSU: number;

  @IsObject()
  @ApiProperty({
    description: 'Barcode object which has the barcode properties',
  })
  barCode: BarCodeDto;
}
