import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteFileDTO {
  @IsString()
  @IsNotEmpty()
  fileKey!: string; // e.g., "resumes/uuid.pdf"
}
