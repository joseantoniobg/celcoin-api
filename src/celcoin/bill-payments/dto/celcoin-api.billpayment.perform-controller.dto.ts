import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PerformPaymentControllerDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'The id returned from authorize payment call' })
  id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The client CPF/CNPJ' })
  cpfCnpj: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'The Value payed by the client' })
  value: number;
}
