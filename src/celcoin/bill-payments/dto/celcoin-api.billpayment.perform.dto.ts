import { BillDataDto } from './celcoin-api.billpayment.billdata.dto';
import { BarCodeDto } from './celcoin-api.billpayment.barcode.dto';
import { IsDate, IsNotEmpty, IsNumber, IsObject, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PerformBillPaymentDto {
    
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ description: 'Transaction identifier on client system' })
    externalNSU: number;

    @IsString()
    @MaxLength(50)
    @IsNotEmpty()
    @ApiProperty({ description: 'Terminal identifier on client system' })
    externalTerminal: string;

    @IsString()
    @MaxLength(18)
    @IsNotEmpty()
    @ApiProperty({ description: 'Informs User CPF/CNPJ' })
    cpfCnpj: string;

    @IsObject()
    @ApiProperty({ description: 'The bill data' })
    billData: BillDataDto;

    @IsObject()
    @ApiProperty({ description: 'The barCode data' })
    barCode: BarCodeDto;

    @IsDate()
    @IsNotEmpty()
    @ApiProperty({ description: 'Bounce due date returned on authorize' })
    dueDate: Date;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ description: 'Bounce transactionId returned on authorize' })
    transactionIdAuthorize: number;

}