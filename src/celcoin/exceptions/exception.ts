import { HttpException, HttpStatus } from "@nestjs/common";
import { IException } from './exception.interface';
import { ExceptionType } from './exception.enum';

export class GeneralException extends HttpException {
    
    constructor(process: string, errorCode: string, message: string, status?: number, exception?: ExceptionType) {
        
        var errorOutput = <IException>{
            exception,
            process,
            errorCode,
            message
        };

        super({ status, error: errorOutput }, status);
    }
}

export class PaymentException extends GeneralException {
    constructor(process: string, errorCode: string, message: string) {
        super(process, errorCode, message, 400, ExceptionType.PAYMENT_EXCEPTION);
    }
}

export class CelCoinApiException extends GeneralException {
    constructor(process: string, errorCode: string, message: string) {
        super(process, errorCode, message, 503, ExceptionType.CELCOIN_EXCEPTION);
    }
}

export class DbException extends GeneralException {
    constructor(process: string, errorCode: string, message: string) {
        super(process, errorCode, message, 500, ExceptionType.DB_EXCEPTION);
    }
}

export class DbNotFoundException extends GeneralException {
    constructor(process: string, errorCode: string, message: string) {
        super(process, errorCode, message, 400, ExceptionType.DB_NOT_FOUND_EXCEPTION);
    }
}

export class UnhandedException extends GeneralException {
    constructor(process: string, errorCode: string, message: string) {
        super(process, errorCode, message, 500, ExceptionType.UNHANDED_EXCEPTION);
    }
}


