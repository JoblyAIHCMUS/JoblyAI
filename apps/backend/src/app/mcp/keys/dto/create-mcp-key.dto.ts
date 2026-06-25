import { IsIn, IsString } from 'class-validator';

export class CreateMcpKeyDto {
  @IsIn(['employer', 'candidate'])
  role!: 'employer' | 'candidate';

  @IsString()
  name!: string;
}
