import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

interface Company {
  id: number;
  name: string;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  industry?: string | null;
  sizeRange?: string | null;
  adminId?: number | null;
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
  phoneNumber?: string;

  @Expose()
  dateOfBirth?: Date;

  @Expose()
  gender?: string;

  @Expose()
  avatarUrl?: string;

  @Expose()
  role?: string;

  @Expose()
  company?: Company | null;

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
  @Expose()
  isAdmin!: boolean;

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
  role?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;
}
