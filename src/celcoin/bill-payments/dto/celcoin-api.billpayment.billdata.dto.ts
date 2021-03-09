import { isNotEmpty, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BillDataDto {

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ description: 'Defines the amount to be payed' })
    value: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ description: 'Nominal value of payment' })
    originalValue: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ description: 'Total amount of discounts and rebates' })
    valueWithDiscount: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ description: 'Total amount of interest and fines' })
    valueWithAdditional: number;
    
}