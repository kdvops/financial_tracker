# 07 - Transaction Normalizer Spec

## Objetivo

Convertir mensajes bancarios heterogéneos en transacciones financieras estructuradas.

## Entrada

Raw message:

```json
{
  "source": "email",
  "subject": "Consumo aprobado",
  "body": "Consumo aprobado por RD$1,250.00 en SUPERMERCADO NACIONAL con tarjeta terminada 1234",
  "receivedAt": "2026-06-18T14:31:00-04:00"
}
```

## Salida

```json
{
  "type": "credit_card_purchase",
  "amount": 1250.00,
  "currency": "DOP",
  "merchant": "SUPERMERCADO NACIONAL",
  "cardLast4": "1234",
  "transactionDate": "2026-06-18T14:31:00-04:00",
  "confidence": 0.96
}
```

## Tipos de transacción

- `credit_card_purchase`
- `credit_card_payment`
- `debit_card_purchase`
- `bank_transfer`
- `atm_withdrawal`
- `fee`
- `interest`
- `refund`
- `reversal`
- `unknown`

## Campos normalizados

- userId
- source
- bank
- account/card reference
- cardLast4
- amount
- currency
- merchant
- transactionDate
- type
- categoryId
- rawMessageId
- confidence
- status

## Parser por banco

Estrategia:

```text
BankParser interface
├── BancoPopularParser
├── BancoBHDParser
├── BanreservasParser
├── ScotiabankParser
└── GenericBankParser
```

## Reglas generales

### Monto

Detectar patrones:

```regex
(RD\$|DOP|US\$|USD)\s?[\d,]+(\.\d{2})?
```

### Tarjeta

Detectar:

```regex
(terminada|finalizada|No\.|tarjeta)\s?(en|con)?\s?(\d{4})
```

### Comercio

Detectar después de:

```text
en
comercio
establecimiento
merchant
```

## Confianza

Asignar confianza según:

- Monto detectado: +0.25
- Moneda detectada: +0.15
- Comercio detectado: +0.20
- Tarjeta detectada: +0.20
- Tipo detectado: +0.20

Si confianza < 0.70, marcar `NEEDS_REVIEW`.
