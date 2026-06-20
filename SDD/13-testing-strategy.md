# 13 - Testing Strategy

## Tipos de pruebas

### Unitarias

- Parsers por banco
- Normalizador de montos
- Detector de moneda
- Categorizador
- Detector de duplicados
- Conciliador de tarjetas

### Integración

- OAuth Gmail
- OAuth Outlook
- Ingesta de notificaciones
- Procesamiento por cola
- API transacciones
- API presupuestos

### End-to-end

Escenarios:

1. Usuario conecta Gmail.
2. Backend lee correo de consumo.
3. Parser crea transacción.
4. Categorizador asigna categoría.
5. Dashboard refleja gasto.

## Casos de prueba parser

### Consumo

Entrada:

```text
Consumo aprobado por RD$1,250.00 en SUPERMERCADO NACIONAL con tarjeta terminada 1234
```

Resultado esperado:

```json
{
  "type": "credit_card_purchase",
  "amount": 1250,
  "currency": "DOP",
  "merchant": "SUPERMERCADO NACIONAL",
  "cardLast4": "1234"
}
```

### Pago

Entrada:

```text
Pago recibido por RD$10,000.00 a tarjeta terminada 1234
```

Resultado esperado:

```json
{
  "type": "credit_card_payment",
  "amount": 10000,
  "currency": "DOP",
  "cardLast4": "1234"
}
```

## Pruebas de seguridad

- Usuario A no puede ver transacciones de Usuario B.
- Tokens OAuth se guardan cifrados.
- Refresh token no aparece en logs.
- Raw messages no exponen cuerpo completo.
- APIs requieren JWT.

## Pruebas móviles

### Android

- Permiso Notification Access activo.
- Captura notificación bancaria.
- Ignora app no autorizada.
- Reintenta envío sin internet.
- Sincroniza al recuperar conexión.

### iOS

- Conecta Gmail/Outlook.
- Muestra estado de conexión.
- Permite desconectar proveedor.

## Criterios de aceptación MVP

- El sistema procesa al menos 5 formatos de correos/notificaciones bancarias.
- Detecta monto, moneda, comercio y tarjeta.
- Evita duplicados por hash y similitud.
- Muestra dashboard mensual.
- Genera alerta por presupuesto.
