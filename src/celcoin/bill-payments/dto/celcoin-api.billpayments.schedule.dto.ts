import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class ScheduleBillPaymentDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'The payment id from local system' })
  id: number;
  @IsDateString()
  @ApiProperty({ description: 'The date the payment will by performed' })
  paymentDate: Date;
}
