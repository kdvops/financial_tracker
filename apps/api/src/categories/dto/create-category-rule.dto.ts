import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCategoryRuleDto {
  @IsString()
  @MaxLength(120)
  pattern!: string;

  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;
}
