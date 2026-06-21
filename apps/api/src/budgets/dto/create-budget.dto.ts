import { IsIn, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';

export class CreateBudgetDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  @IsIn(['DOP', 'USD'])
  currency?: 'DOP' | 'USD';

  @IsOptional()
  @IsString()
  @IsIn(['monthly'])
  period?: 'monthly';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  alertThreshold?: number;
}
