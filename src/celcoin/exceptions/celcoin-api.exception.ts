import { HttpException, HttpStatus } from "@nestjs/common";

export class CelCoinApiException extends HttpException {
    constructor(response: string, status?: number) {
        
        if (!status) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
        }
        
        response = `Error while calling celcoin api: ${response}. Verify API Stability, credentials and connection`;
        super({ statusCode: status, message: response }, status);
    }
}