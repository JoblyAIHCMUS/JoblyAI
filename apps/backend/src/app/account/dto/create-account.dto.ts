import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { AccountRole } from '../../entities/account.entity';

export class CreateAccountDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'hashed_password' })
  @IsString()
  @MinLength(8)
  passwordHash!: string;

  @ApiProperty({
    example: 'CANDIDATE',
    enum: AccountRole,
    required: false,
  })
  @IsEnum(AccountRole)
  @IsOptional()
  role?: AccountRole;
}
