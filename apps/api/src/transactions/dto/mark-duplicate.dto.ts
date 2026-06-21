import { IsOptional, IsString, MaxLength } from 'class-validator';

export class MarkDuplicateDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  duplicateGroupId?: string;
}
