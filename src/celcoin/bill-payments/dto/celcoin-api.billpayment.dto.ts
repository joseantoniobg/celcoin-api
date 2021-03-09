import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, isNotEmpty, IsNotEmpty, isNumber, IsNumber, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CelcoinBillPaymentDto {

    @IsString()
    @MaxLength(50)
    @ApiProperty({ description: "Terminal ID from clients system" })
    externalTerminal: string;

    @IsNumber()
    @ApiProperty({ description: "NSU from clients system" })
    externalNSU: number;

    @IsString()
    @MaxLength(18)
    @IsNotEmpty()
    @ApiProperty({ description: "personal ID from who is paying the bill" })
    cpfCnpj: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(0.01)
    @ApiProperty({ description: "The value being payed" })
    value: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(0.01)
    @ApiProperty({ description: "The nominal value being payed" })
    originalValue: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(0.00)
    @ApiProperty({ description: "The total amount of discounts being applyed to payment" })
    valueWithDiscount: number = 0;

    @IsNumber()
    @IsNotEmpty()
    @Min(0.00)
    @ApiProperty({ description: "The total amount of interest and taxes being applyed to payment" })
    valueWithAdditional: number = 0;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1)
    @MinLength(1)
    @ApiProperty({ description: "The type of the payment. Default: Concessionaria" })
    type: string = '1';

    @IsString()
    @IsNotEmpty()
    @MaxLength(48)
    @ApiProperty({ description: "The digitable line from the bloqueto" })
    digitable: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    @ApiProperty({ description: "The barcode string line from the bloqueto" })
    barcode: string;

    @IsDateString()
    @IsNotEmpty()
    @ApiProperty({ description: "The due date to pay, its returned from celcoin api authorize method" })
    dueDate: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ description: "The transaction unique id to identify the payment, its returned from celcoin api authorize method" })
    transactionIdAuthorize: number;
}