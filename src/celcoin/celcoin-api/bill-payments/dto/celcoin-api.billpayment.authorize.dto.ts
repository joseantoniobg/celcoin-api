import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CelcoinApiBillPaymentAuthorizeDto {
    
    @IsString()
    @MaxLength(50)
    @ApiProperty({ description: 'Terminal identifier on client system' })
    externalTerminal: string;

    @IsNumber()
    @ApiProperty({ description: 'Transaction identifier on the client system' })
    externalNSU: number;

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

}