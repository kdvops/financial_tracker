# 03 - Mobile App Spec

## Tecnología

- Flutter
- Dart
- Riverpod para estado e inyección de dependencias
- Dio para HTTP
- Flutter Secure Storage
- Kotlin para módulo Android nativo

## Decisión de estado

Se adopta Riverpod para:

- Manejo de estado asíncrono para auth, dashboard y sincronización.
- Inyección de dependencias limpia entre servicios, repositorios y UI.
- Reducir boilerplate frente a alternativas más ceremoniosas para el MVP.

## Módulos

```text
lib/
|-- app/
|-- auth/
|-- dashboard/
|-- cards/
|-- transactions/
|-- budgets/
|-- alerts/
|-- settings/
|-- email_connection/
`-- android_notification_bridge/
```

## Pantallas

### Login

- Email/password
- Google OAuth futuro
- Recuperación de cuenta

### Onboarding

- Explicar cómo se capturan transacciones
- Pedir permisos Android
- Conectar Gmail/Outlook
- Crear tarjetas manualmente o detectar automáticamente

### Dashboard

Debe mostrar:

- Gasto total del mes
- Gasto por tarjeta
- Gasto por categoría
- Pagos realizados
- Balance estimado
- Alertas activas

### Tarjetas

Campos:

- Nombre
- Banco
- Últimos 4 dígitos
- Moneda
- Fecha de corte
- Fecha límite de pago
- Límite de crédito opcional

### Transacciones

Campos visibles:

- Fecha
- Comercio
- Monto
- Moneda
- Categoría
- Tarjeta
- Fuente: correo/notificación/manual/importación
- Estado: procesada/duplicada/revisar

### Presupuestos

- Presupuesto mensual por categoría
- Porcentaje consumido
- Alertas por umbral

### Alertas

Tipos:

- Consumo inusual
- Exceso de presupuesto
- Pago pendiente
- Tarjeta cerca del límite
- Transacción duplicada detectada

## Permisos Android

- Notification Access
- Internet
- Foreground service si aplica
- Post notifications para alertas propias

## Restricción iOS

iOS no permite leer notificaciones bancarias de otras apps. La fuente primaria será correo OAuth.

## Almacenamiento local

Guardar localmente solo:

- Token de sesión
- Preferencias
- Estado de onboarding
- Cola temporal cifrada de eventos pendientes

No guardar:

- Tokens OAuth bancarios
- Correos completos
- Información sensible innecesaria
