# 09 - Card Reconciliation Spec

## Objetivo

Calcular balance estimado por tarjeta de crédito usando consumos, pagos, reversos, comisiones e intereses detectados automáticamente.

## Entidades

### Credit Card

- Banco
- Nombre
- Últimos 4 dígitos
- Moneda
- Límite
- Fecha de corte
- Fecha límite de pago

### Card Ledger

Registro contable interno de movimientos.

## Tipos que afectan balance

### Aumentan deuda

- Consumo
- Comisión
- Interés
- Retiro de efectivo

### Reducen deuda

- Pago
- Reverso
- Devolución
- Cashback aplicado

## Fórmula simple

```text
balance_estimado =
  consumos
+ comisiones
+ intereses
- pagos
- reversos
- devoluciones
```

## Conciliación de pagos

Cuando llega mensaje:

```text
Pago recibido por RD$10,000.00 a tarjeta terminada 1234
```

Crear transacción:

```json
{
  "type": "credit_card_payment",
  "amount": 10000,
  "cardLast4": "1234"
}
```

Aplicar al balance de esa tarjeta.

## Estados

- `pending`
- `posted`
- `reconciled`
- `needs_review`

## Reglas

- Si un pago no tiene tarjeta identificada, marcar `NEEDS_REVIEW`.
- Si hay dos tarjetas con mismo last4, pedir selección manual.
- Si un pago es mayor que balance estimado, permitir balance negativo o marcar revisión.
- No asumir saldo oficial del banco; mostrar como saldo estimado.
