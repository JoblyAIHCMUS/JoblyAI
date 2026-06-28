import {
  IsArray,
  IsString,
  MinLength,
  MaxLength,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerInput {
  @IsString()
  questionId!: string;

  @IsString()
  @MinLength(20, { message: 'Each answer must be at least 20 characters' })
  @MaxLength(2000, { message: 'Each answer must be at most 2000 characters' })
  answer!: string;
}

export class SubmitAnswersRequestDTO {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => AnswerInput)
  answers!: AnswerInput[];
}
