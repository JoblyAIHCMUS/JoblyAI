import { IsString, MinLength, MaxLength } from 'class-validator';

export class PreShortlistQuestionInput {
  @IsString()
  @MinLength(5, { message: 'Each question must be at least 5 characters' })
  @MaxLength(10000, {
    message: 'Each question must be at most 10000 characters',
  })
  question!: string;

  @IsString()
  @MinLength(1, {
    message: 'Each expected answer must be at least 1 character',
  })
  @MaxLength(10000, {
    message: 'Each expected answer must be at most 10000 characters',
  })
  expectedAnswer!: string;
}
