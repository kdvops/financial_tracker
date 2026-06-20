# 16 - MVP Decisions

## Propósito

Cerrar decisiones operativas del MVP para poder implementar sin ambigüedad innecesaria.

## Bancos objetivo del MVP

- Banco Santa Cruz
- Qik

El MVP debe priorizar calidad de parsing para estos bancos antes de expandir a otros emisores.

## Parsers iniciales

- `BancoSantaCruzParser`
- `QikParser`
- `GenericBankParser` solo como fallback de baja confianza

Si un mensaje no coincide con un parser específico y el parser genérico produce `confidence < 0.70`, debe marcarse `NEEDS_REVIEW`.

## Detección de duplicados

### Método recomendado

Usar deduplicación por dos niveles:

1. Duplicado exacto por identidad de origen.
2. Duplicado probable por similitud financiera.

### Nivel 1 - exacto

Para email:

```text
user_id + provider + provider_message_id
```

Para notificación Android:

```text
user_id + source + message_hash
```

### Nivel 2 - probable

Marcar como duplicado probable si coinciden:

- mismo `user_id`
- misma moneda
- diferencia de monto <= 0.01
- mismo `cardLast4` si existe
- fecha dentro de una ventana de 10 minutos
- similitud alta de comercio normalizado

### Prioridad entre fuentes

Si el mismo evento aparece por email y notificación:

- preferir email cuando tenga fecha, comercio y tarjeta más completos
- preferir notificación cuando llegue primero y el email no agregue mejor información
- conservar vínculo entre ambos `raw_messages` si se implementa relación posterior

## Autenticación y sesiones

### Método recomendado

- Access token JWT de 15 minutos
- Refresh token rotativo de 30 días
- Revocación por logout y por desconexión de dispositivo

### Almacenamiento recomendado

- `access_token` solo en cliente móvil seguro
- `refresh_token` persistido en backend como hash, nunca en texto plano
- tokens OAuth cifrados en `oauth_connections`

## Flujo OAuth móvil recomendado

### Método recomendado

- La app abre el navegador del sistema hacia el backend
- El backend inicia OAuth con `state` firmado y `code_verifier` si aplica
- El callback del proveedor regresa al backend
- El backend guarda tokens cifrados
- El backend redirige a un deep link móvil de éxito o error

### Deep links

- éxito: `financialtracker://oauth/success?provider=google`
- error: `financialtracker://oauth/error?provider=google`

## Dashboard API mínimo del MVP

Además de las APIs ya documentadas, el MVP debe incluir:

- `GET /dashboard/summary`
- `GET /dashboard/spending-by-category`
- `GET /dashboard/spending-by-card`

### `GET /dashboard/summary`

Debe devolver:

- gasto total del mes
- pagos del mes
- balance estimado total
- cantidad de alertas activas

## Base de datos mínima adicional recomendada

El esquema v1 debe agregar al menos:

- `updated_at` en `cards`, `transactions`, `budgets`, `alerts`, `category_rules`
- tabla `audit_logs`
- tabla `refresh_tokens`
- índices para `raw_messages.user_id`, `transactions.user_id`, `transactions.transaction_date`

## IA en MVP

### Método recomendado

- nivel 1: reglas exactas
- nivel 2: coincidencia difusa
- nivel 3: IA externa opcional y desactivable

La IA no debe ser obligatoria para que el MVP funcione correctamente.

## Fixtures y pruebas

El repositorio debe incluir fixtures anonimizados para:

- consumo Banco Santa Cruz
- consumo Qik
- pago de servicio Qik

Cada parser específico debe tener pruebas unitarias con esos ejemplos.
