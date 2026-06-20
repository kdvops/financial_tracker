# 08 - AI Categorization Spec

## Objetivo

Categorizar automáticamente transacciones para análisis financiero.

## Categorías iniciales

- Supermercado
- Combustible
- Restaurante
- Servicios
- Suscripciones
- Salud
- Educación
- Transporte
- Compras
- Entretenimiento
- Viajes
- Transferencias
- Pagos de tarjeta
- Comisiones
- Otros

## Estrategia híbrida

### Nivel 1: reglas exactas

```text
SUPERMERCADO NACIONAL → Supermercado
LA SIRENA → Supermercado
TEXACO → Combustible
NETFLIX → Suscripciones
```

### Nivel 2: coincidencia difusa

Comparar nombre del comercio normalizado con comercios conocidos.

### Nivel 3: IA

Enviar al modelo:

```json
{
  "merchant": "SUPERMERCADO NACIONAL",
  "amount": 1250,
  "currency": "DOP",
  "description": "Consumo aprobado..."
}
```

Respuesta esperada:

```json
{
  "category": "Supermercado",
  "confidence": 0.98,
  "reason": "El comercio corresponde a una cadena de supermercados."
}
```

## Aprendizaje por usuario

Si el usuario cambia una categoría:

```text
Transaction merchant = NETFLIX
User category = Suscripciones
Crear regla:
merchant contains NETFLIX → Suscripciones
```

## Reglas de privacidad

- No enviar datos sensibles completos al modelo.
- Enmascarar tarjeta.
- Enviar solo comercio, monto y texto mínimo.
- Permitir desactivar IA externa.
