import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";
import { PaymentDestination } from '../celcoin-api.bill-payments.destination.enum';

export class PaymentDestinationPipe implements PipeTransform {
    readonly allowedStatuses = Object.values(PaymentDestination);

    transform(value: any, metadata: ArgumentMetadata) {

        if (!value) {
            throw new BadRequestException(`please inform the payment destination! Available options: ${this.allowedStatuses.toString()}`);
        }

        value = value.toUpperCase();
        if(!this.isStatusValid(value)){
            throw new BadRequestException(`"${value}" is an invalid payment destination! Available options: ${this.allowedStatuses.toString()}`);
        }
        return value;
    }

    private isStatusValid(status: any) {
       const index = this.allowedStatuses.indexOf(status);
       return index !== -1;
    }
}