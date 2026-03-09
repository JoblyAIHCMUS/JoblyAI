import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class RejectApplicationDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  feedback!: string;
}
