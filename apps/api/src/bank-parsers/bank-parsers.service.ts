import { Injectable } from '@nestjs/common';

import type { NormalizedTransaction } from '@financial-tracker/shared-contracts';

import { BancoSantaCruzParser } from './banco-santa-cruz.parser';
import { GenericBankParser } from './generic-bank.parser';
import type { BankParserInput } from './interfaces/bank-parser.interface';
import { QikParser } from './qik.parser';

@Injectable()
export class BankParsersService {
  private readonly parsers = [
    new BancoSantaCruzParser(),
    new QikParser(),
    new GenericBankParser(),
  ];

  parse(input: BankParserInput): NormalizedTransaction | null {
    const parser = this.parsers.find((candidate) => candidate.supports(input));
    if (!parser) {
      return null;
    }

    return parser.parse(input);
  }
}
