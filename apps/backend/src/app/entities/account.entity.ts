import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AccountRole {
  CANDIDATE = 'CANDIDATE',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN',
}

@Entity('accounts')
@Index(['email'], { unique: true })
export class Account {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: AccountRole,
    default: AccountRole.CANDIDATE,
  })
  role!: AccountRole;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
