import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateCategoryRuleDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  pattern?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;
}
