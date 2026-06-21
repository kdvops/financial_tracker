import { IsIn, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @IsOptional()
  @IsString()
  cardId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  merchant?: string | null;

  @IsOptional()
  @IsString()
  @IsIn([
    'RAW_RECEIVED',
    'PARSED',
    'NORMALIZED',
    'DUPLICATE_SUSPECTED',
    'CATEGORIZED',
    'RECONCILED',
    'NEEDS_REVIEW',
    'FAILED',
  ])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  confidence?: number;
}
