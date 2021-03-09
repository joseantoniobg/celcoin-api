import { IsDateString } from "class-validator";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('celcoin_auth_tokens')
export class CelCoinApiAuthToken extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    access_token: string;

    @IsDateString()
    @Column({ type: 'timestamp with time zone' })
    expire_date: Date;

    @Column({ nullable: true, type: 'varchar', length: 10 })
    token_type: string;
    
}