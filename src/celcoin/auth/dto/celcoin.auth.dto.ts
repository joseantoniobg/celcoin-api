import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CelCoinAuthDto {

    @ApiProperty({ description: "Client ID provided by CelCoin" })
    @IsString()
    @IsNotEmpty()
    client_id: string;
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: "Constant with value 'client_credentials'" })
    grant_type: string = 'client_credentials';
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: "Client Secret provided by CelCoin" })
    client_secret: string;

    getFormData() {
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('client_id', this.client_id);
        formData.append('grant_type', this.grant_type);
        formData.append('client_secret', this.client_secret);
        return formData;
    }
}