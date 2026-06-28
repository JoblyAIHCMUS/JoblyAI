import { IsString, MinLength, MaxLength } from 'class-validator';

export class PreShortlistQuestionInput {
  @IsString()
  @MinLength(5, { message: 'Each question must be at least 5 characters' })
  @MaxLength(500, { message: 'Each question must be at most 500 characters' })
  question!: string;

  @IsString()
  @MinLength(1, { message: 'Each expected answer must be at least 1 character' })
  @MaxLength(500, { message: 'Each expected answer must be at most 500 characters' })
  expectedAnswer!: string;
}
