# 12 - API Contracts

## POST /ingestion/notifications

### Request

```json
{
  "source": "android_notification",
  "providerPackage": "com.bank.app",
  "title": "Consumo aprobado",
  "body": "Consumo RD$1,250.00 en SUPERMERCADO NACIONAL tarjeta 1234",
  "occurredAt": "2026-06-18T14:31:00-04:00",
  "messageHash": "sha256..."
}
```

### Response

```json
{
  "rawMessageId": "uuid",
  "status": "queued"
}
```

## GET /transactions

### Query params

- `from`
- `to`
- `cardId`
- `categoryId`
- `type`
- `status`

### Response

```json
{
  "items": [
    {
      "id": "uuid",
      "type": "credit_card_purchase",
      "amount": 1250,
      "currency": "DOP",
      "merchant": "SUPERMERCADO NACIONAL",
      "category": "Supermercado",
      "cardLast4": "1234",
      "transactionDate": "2026-06-18T14:31:00-04:00",
      "source": "android_notification",
      "status": "categorized"
    }
  ],
  "total": 1
}
```

## GET /cards/:id/statement-summary

### Response

```json
{
  "cardId": "uuid",
  "displayName": "Visa Banco X",
  "currency": "DOP",
  "estimatedBalance": 15250,
  "currentMonthPurchases": 21250,
  "currentMonthPayments": 6000,
  "byCategory": [
    {
      "category": "Supermercado",
      "amount": 8500
    }
  ]
}
```

## POST /budgets

### Request

```json
{
  "categoryId": "uuid",
  "amount": 15000,
  "currency": "DOP",
  "period": "monthly",
  "alertThreshold": 80
}
```

## PATCH /transactions/:id

### Request

```json
{
  "categoryId": "uuid",
  "merchant": "SUPERMERCADO NACIONAL",
  "status": "categorized"
}
```
