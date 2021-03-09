import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CelcoinAuthResponseDto {

    @IsString()
    @IsNotEmpty()
    access_token: string;

    @IsNumber()
    @Min(1)
    expires_in: number;

    @IsString()
    @IsNotEmpty()
    token_type: string;

}

export function getExpireDate(expires_in: number): Date {
    var now = new Date();
    var expiryDate = new Date(now.getTime() + expires_in*1000);
    return expiryDate;
}