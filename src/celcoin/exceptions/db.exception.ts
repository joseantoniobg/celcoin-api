import { HttpException, HttpStatus } from "@nestjs/common";

export class DbException extends HttpException {
    constructor(response: string, status?: number) {
        
        if (!status) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        
        response = `Error while trying to perform DB Action: ${response}. Verify DB Stability, credentials, entities and connection`;
        super({ status, error: response }, status);
    }
}