export class AuthorizePaymentResponse {
    id: number = undefined;
    assignor: string = undefined;
    documentRecipient: string = undefined;
    documentPayer:string = undefined;
    dueDate: Date = undefined;
    nextBusinessDay: Date = undefined;
    allowChangeValue: boolean = undefined;
    recipient: string = undefined;
    payer: string = undefined;
    discountValue: number = undefined; 
    interestValueCalculated: number = undefined;
    maxValue: number = undefined;
    minValue: number = undefined;
    fineValueCalculated: number = undefined;
    originalValue: number = undefined;
    totalUpdated: number = undefined;
    totalWithDiscount: number = undefined;
    totalWithAdditional: number = undefined;
    endHour: string = undefined;
    initeHour: string = undefined;
    nextSettle: string = undefined;
    transactionId: number = undefined;
}
