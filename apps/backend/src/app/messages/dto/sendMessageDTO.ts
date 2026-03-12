import { IsString, IsNotEmpty } from 'class-validator';

export class SendMessageDTO {
  @IsString()
  @IsNotEmpty()
  recipientId!: string;

  @IsString()
  @IsNotEmpty()
  text!: string;
}
