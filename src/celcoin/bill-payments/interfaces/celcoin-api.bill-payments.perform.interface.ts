import { IBillData } from './celcoin-api.bill-apyments.bill-data.interface';
import { IBarCode } from './celcoin-api.bill-payments.barcode.interface';

export interface IPerformBillPayment {

    externalNSU: number;

    externalTerminal: string;

    cpfCnpj: string;

    billData: IBillData;

    barCode: IBarCode;

    dueDate: Date;

    transactionIdAuthorize: number;

}