const amountPattern = /(RD\$|DOP|US\$|USD)\s?([\d,]+(?:\.\d{2})?)/i;
const cardLast4Pattern =
  /(terminada|finalizada|No\.|tarjeta|termina en|Forma de pago)\s?(en|con)?\s?.*?(\d{4})/i;

export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function extractAmount(text: string) {
  const match = text.match(amountPattern);
  if (!match) {
    return null;
  }

  const capturedAmount = match[2];
  if (!capturedAmount) {
    return null;
  }

  const rawAmount = capturedAmount.replace(/,/g, '');
  return Number(rawAmount);
}

export function extractCardLast4(text: string) {
  const match = text.match(cardLast4Pattern);
  return match?.[3] ?? null;
}

export function extractLineValue(text: string, label: string) {
  const line = text
    .split(/\r?\n/)
    .find((entry) => entry.toLowerCase().includes(label.toLowerCase()));

  if (!line) {
    return null;
  }

  const index = line.indexOf(':');
  if (index >= 0) {
    return normalizeWhitespace(line.slice(index + 1));
  }

  return normalizeWhitespace(line.replace(label, ''));
}

export function extractPatternValue(text: string, pattern: RegExp) {
  const match = text.match(pattern);
  const value = match?.[1];
  return value ? normalizeWhitespace(value) : null;
}

export function parseDateString(value: string | null, fallback: Date | null) {
  if (!value) {
    return fallback?.toISOString() ?? new Date().toISOString();
  }

  const cleaned = normalizeWhitespace(value.replace('(AST)', '').trim());

  const qikMatch = cleaned.match(
    /^(\d{2})-(\d{2})-(\d{4}) (\d{1,2}):(\d{2}) ([AP]M)$/i,
  );

  if (qikMatch) {
    const [, month, day, year, hourRaw, minute, meridiem] = qikMatch;
    if (!month || !day || !year || !hourRaw || !minute || !meridiem) {
      return fallback?.toISOString() ?? new Date().toISOString();
    }

    let hour = Number(hourRaw);
    if (meridiem.toUpperCase() === 'PM' && hour < 12) {
      hour += 12;
    }
    if (meridiem.toUpperCase() === 'AM' && hour === 12) {
      hour = 0;
    }

    const date = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day), hour + 4, Number(minute)),
    );
    return date.toISOString();
  }

  const santaCruzMatch = cleaned.match(
    /^(\d{1,2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/,
  );

  if (santaCruzMatch) {
    const [, day, month, year, hour, minute, second] = santaCruzMatch;
    if (!day || !month || !year || !hour || !minute || !second) {
      return fallback?.toISOString() ?? new Date().toISOString();
    }

    const date = new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour) + 4,
        Number(minute),
        Number(second),
      ),
    );
    return date.toISOString();
  }

  const nativeDate = new Date(cleaned);
  if (!Number.isNaN(nativeDate.getTime())) {
    return nativeDate.toISOString();
  }

  return fallback?.toISOString() ?? new Date().toISOString();
}
