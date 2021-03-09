import { HttpException, HttpStatus } from "@nestjs/common";

export class PaymentException extends HttpException {
    constructor(response: string, status?: number) {
        
        if (!status) {
            status = HttpStatus.BAD_REQUEST;
        }
        
        response = `Error while ${response}. Verify payment data`;
        super({ status, error: response }, status);
    }
}