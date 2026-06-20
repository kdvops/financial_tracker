import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DuplicateDetectorService {
  constructor(private readonly prismaService: PrismaService) {}

  async isProbableDuplicate(input: {
    transactionId: string;
    userId: string;
    amount: number;
    currency: string;
    cardLast4: string | null;
    merchant: string | null;
    transactionDate: Date;
    type: string;
  }) {
    const startWindow = new Date(input.transactionDate.getTime() - 10 * 60 * 1000);
    const endWindow = new Date(input.transactionDate.getTime() + 10 * 60 * 1000);
    const normalizedMerchant = this.normalizeMerchant(input.merchant);

    const candidates = await this.prismaService.transaction.findMany({
      where: {
        userId: input.userId,
        id: {
          not: input.transactionId,
        },
        currency: input.currency,
        type: input.type,
        amount: input.amount,
        cardLast4: input.cardLast4 ?? undefined,
        transactionDate: {
          gte: startWindow,
          lte: endWindow,
        },
      },
      select: {
        id: true,
        merchant: true,
      },
    });

    if (candidates.length === 0) {
      return false;
    }

    if (!normalizedMerchant) {
      return true;
    }

    return candidates.some((candidate) => {
      const candidateMerchant = this.normalizeMerchant(candidate.merchant);
      return candidateMerchant === normalizedMerchant;
    });
  }

  private normalizeMerchant(merchant: string | null) {
    if (!merchant) {
      return null;
    }

    return merchant.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }
}
