export class PerformPaymentResponse {
    performTransactionId: number = undefined;
    isExpired: boolean = undefined;
    completeAuthenticationBlock: string = undefined;
    authentication: number = undefined;
    receiptFormatted: string = undefined;
}