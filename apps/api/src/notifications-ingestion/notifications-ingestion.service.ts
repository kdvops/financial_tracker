import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import type { NotificationIngestionDto } from './dto/notification-ingestion.dto';

@Injectable()
export class NotificationsIngestionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly transactionsService: TransactionsService,
  ) {}

  async ingest(userId: string, dto: NotificationIngestionDto) {
    const rawMessage = await this.prismaService.rawMessage.create({
      data: {
        userId,
        source: dto.source,
        provider: dto.providerPackage,
        subject: dto.title,
        sender: dto.appName ?? dto.providerPackage,
        receivedAt: new Date(dto.occurredAt),
        bodyHash: dto.messageHash,
        normalizedText: `${dto.title}\n${dto.body}`.trim(),
        processingStatus: 'RAW_RECEIVED',
      },
    });

    await this.transactionsService.processRawMessage(rawMessage.id);

    return {
      rawMessageId: rawMessage.id,
      status: 'queued',
    };
  }

  async ingestBatch(userId: string, items: NotificationIngestionDto[]) {
    const results = [];

    for (const item of items) {
      results.push(await this.ingest(userId, item));
    }

    return {
      items: results,
      total: results.length,
    };
  }
}
