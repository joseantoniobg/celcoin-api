import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CelcoinPayments } from './celcoin-api.billpayments.entity';

@Entity('celcoin_bill_payments_status')
export class BillPaymentStatus extends BaseEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => CelcoinPayments, payment => payment.statuses, { eager: false })
    payment: CelcoinPayments;

    @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    savedAt: Date;
    
    @Column({ type: 'varchar', length: 3, nullable: true })
    errorCode: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    message: string;

    @Column({ type: 'varchar', length: 30, nullable: true })
    status: string;
}