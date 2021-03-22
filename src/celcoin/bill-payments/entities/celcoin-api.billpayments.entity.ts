import { IsDate, IsDateString } from 'class-validator';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BillPaymentStatus } from './celcoin-api.billpaymentstatus.entity';

@Entity('celcoin_bill_payments')
export class CelcoinPayments extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  externalTerminal: string;

  @Column({ default: '1', type: 'char', length: 1 })
  type: string;

  @IsDate()
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @IsDate()
  @Column({ type: 'timestamp with time zone', nullable: true })
  processedAt: Date;

  @IsDate()
  @Column({ type: 'timestamp with time zone', nullable: true })
  performedAt: Date;

  @IsDate()
  @Column({ type: 'timestamp with time zone', nullable: true })
  confirmedAt: Date;

  @IsDate()
  @Column({ type: 'timestamp with time zone', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'varchar', length: 48, nullable: true })
  digitable: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  barCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  assignor: string;

  @Column({ type: 'varchar', length: 18, nullable: true })
  documentRecipient: string;

  @Column({ type: 'varchar', length: 18, nullable: true })
  clientPayer: string;

  @Column({ type: 'varchar', length: 18, nullable: true })
  documentPayer: string;

  @Column({ type: 'date', nullable: true })
  payDueDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  nextBusinessDay: Date;

  @Column({ type: 'date', nullable: true })
  dueDateRegister: Date;

  @Column({ type: 'date', nullable: true })
  paymentDate: Date;

  @Column({ type: 'boolean', nullable: true })
  isScheduled: boolean;

  @Column({ nullable: true })
  allowChangeValue: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  recipient: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  payer: string;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: true })
  discountValue: number;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: true })
  interestValueCalculated: number;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: true })
  maxValue: number;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: true })
  minValue: number;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: true })
  fineValueCalculated: number;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: true })
  originalValue: number;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: true })
  totalUpdated: number;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: true })
  totalWithDiscount: number;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: true })
  totalWithAdditional: number;

  @Column({ type: 'date', nullable: true })
  settleDate: Date;

  @Column({ type: 'varchar', length: 5, nullable: true })
  endHour: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  initeHour: string;

  @Column({ type: 'char', length: 1, nullable: true })
  nextSettle: string;

  @Column({ nullable: true })
  transactionId: number;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: true })
  value: number;

  @Column({ nullable: true })
  isExpired: boolean;

  @Column({ type: 'varchar', length: 66, nullable: true })
  completeAuthenticationBlock: string;

  @Column({ nullable: true })
  authentication: number;

  @Column({ nullable: true })
  receiptFormatted: string;

  @Column({ nullable: true })
  performTransactionId: number;

  @OneToMany((type) => BillPaymentStatus, (status) => status.payment, {
    eager: true,
  })
  statuses: BillPaymentStatus[];
}
