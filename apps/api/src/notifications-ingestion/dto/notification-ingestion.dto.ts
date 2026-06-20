import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class NotificationIngestionDto {
  @IsString()
  @IsIn(['android_notification'])
  source!: 'android_notification';

  @IsString()
  @MinLength(3)
  providerPackage!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  body!: string;

  @IsDateString()
  occurredAt!: string;

  @IsString()
  @MinLength(8)
  messageHash!: string;

  @IsOptional()
  @IsString()
  appName?: string;
}
