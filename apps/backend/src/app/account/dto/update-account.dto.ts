import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { AccountRole } from '../../entities/account.entity';
import { CreateAccountDto } from './create-account.dto';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @ApiProperty({ example: 'EMPLOYER', enum: AccountRole, required: false })
  @IsEnum(AccountRole)
  @IsOptional()
  override role?: AccountRole;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}
