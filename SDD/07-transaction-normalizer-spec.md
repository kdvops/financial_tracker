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
|-- BancoSantaCruzParser
|-- QikParser
`-- GenericBankParser
```

## Patrones MVP por banco

### Banco Santa Cruz - consumo

Ejemplo real observado:

```text
NOTIFICACIÓN DE CONSUMO
...
Monto: RD$ 515.80
Lugar de transacción: SIRENA MARKET COLINA CTROSANTO DOMINGODO
Fecha y hora: 2/06/2026 09:47:22
Estado: Aprobada
```

Extracciones esperadas:

- `type`: `credit_card_purchase`
- `amount`: valor después de `Monto:`
- `merchant`: valor después de `Lugar de transacción:`
- `transactionDate`: valor después de `Fecha y hora:`
- `cardLast4`: 4 dígitos al final de `terminada en`

### Qik - consumo con tarjeta

Ejemplo real observado:

```text
Se hizo una transacción de RD$ 3,041.90 en NEXT LINCOLN GASOPOLIS
con tu tarjeta crédito Qik que termina en ...5647
Fecha y hora: 06-18-2026 08:30 PM (AST)
Monto: RD$ 3,041.90
```

Extracciones esperadas:

- `type`: `credit_card_purchase`
- `amount`: valor después de `de RD$` o campo `Monto`
- `merchant`: valor después de `en`
- `transactionDate`: valor de `Fecha y hora`
- `cardLast4`: 4 dígitos finales visibles

### Qik - pago de servicio

Ejemplo real observado:

```text
Monto total pagado RD$ 1,211.54
Servicio Electricidad / Edesur
Canal Pago de servicio
Forma de pago Mastercard *5647
```

Extracciones esperadas:

- `type`: `credit_card_purchase`
- `amount`: valor después de `Monto total pagado`
- `merchant`: valor del campo `Servicio`
- `transactionDate`: valor del campo `Fecha y hora`
- `cardLast4`: 4 dígitos al final de `Forma de pago`
- `notes`: `channel=Pago de servicio`, `referenceNumber` si existe

## Reglas generales

### Monto

Detectar patrones:

```regex
(RD\$|DOP|US\$|USD)\s?[\d,]+(\.\d{2})?
```

### Tarjeta

Detectar:

```regex
(terminada|finalizada|No\.|tarjeta|termina en|Forma de pago)\s?(en|con)?\s?.*?(\d{4})
```

### Comercio

Detectar después de:

```text
en
comercio
establecimiento
merchant
Lugar de transacción:
Servicio
```

### Fecha y hora

Detectar etiquetas:

```text
Fecha y hora:
fecha y hora
```

## Confianza

Asignar confianza según:

- Monto detectado: +0.25
- Moneda detectada: +0.15
- Comercio detectado: +0.20
- Tarjeta detectada: +0.20
- Tipo detectado: +0.20

Si confianza < 0.70, marcar `NEEDS_REVIEW`.
