import { IsString, MaxLength, IsBoolean, IsNumber } from 'class-validator';

export class CelcoinApiBillPaymentAuthorizeResponse {
    
    @IsString()
    @MaxLength(100)
    assignor: string;

    @IsString()
    @MaxLength(18)
    documentRecipient: string;

    @IsString()
    @MaxLength(18)
    documentPayer: string;


    payDueDate: string;

    nextBusinessDay: string;

    dueDateRegister: string;

    @IsBoolean()
    allowChangeValue: boolean;

    @IsString()
    @MaxLength(100)
    recipient: string;

    @IsString()
    @MaxLength(100)
    payer: string;

    @IsNumber()
    discountValue: number;

    @IsNumber()
    interestValueCalculated: number;

    @IsNumber()
    maxValue: number;

    @IsNumber()
    minValue: number;

    @IsNumber()
    fineValueCalculated: number;

    @IsNumber()
    originalValue: number;

    @IsNumber()
    totalUpdated: number;

    @IsNumber()
    totalWithDiscount: number;

    @IsNumber()
    totalWithAditional: number;

    settleDate: string;

    dueDate: string;

    @IsString()
    @MaxLength(5)
    endHour: string;

    @IsString()
    @MaxLength(5)
    initeHour: string;

    @IsString()
    @MaxLength(1)
    nextSettle: string;

    @IsNumber()
    transactionId: number;

    @IsNumber()
    value: number;

    @IsString()
    @MaxLength(3)
    errorCode: string;

    @IsString()
    @MaxLength(100)
    message: string;

    @IsString()
    @MaxLength(30)
    status: string;

}