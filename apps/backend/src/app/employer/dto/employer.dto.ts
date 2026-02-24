import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

interface Company {
  id: number;
  name: string;
  website?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  industry?: string | null;
  size?: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class QueryResponseEmployerDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  verified!: boolean;

  @Expose()
  image?: string;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  jobTitle?: string;

  @Expose()
  company?: Company;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;
  @Expose()
  banned!: boolean;
  @Expose()
  bannedReason?: string;
  @Expose()
  banExpires?: Date;

  @Expose({ name: 'fullName' })
  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
}

export class UpdateEmployerDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  companyId?: number;
}
