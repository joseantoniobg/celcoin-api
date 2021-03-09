import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BarCodeDto {

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
    barCode: string;

}