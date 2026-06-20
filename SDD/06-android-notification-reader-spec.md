# 06 - Android Notification Reader Spec

## Objetivo

Capturar notificaciones bancarias en Android para detectar consumos, pagos y movimientos sin registro manual.

## Tecnología

- Kotlin
- NotificationListenerService
- Flutter MethodChannel/EventChannel
- WorkManager para reintentos
- Room opcional para cola local cifrada

## Servicio Android

Clase sugerida:

```kotlin
class BankNotificationListenerService : NotificationListenerService() {
    override fun onNotificationPosted(sbn: StatusBarNotification) {
        // Extraer app, título, texto, fecha y packageName
        // Filtrar apps bancarias permitidas
        // Enviar evento a backend o cola local
    }
}
```

## Datos capturados

- packageName de la app bancaria
- appName
- notificationTitle
- notificationText
- bigText si existe
- timestamp
- deviceId anónimo
- hash del mensaje
- usuario autenticado

## Filtro local

La app debe permitir configurar apps bancarias permitidas.

Ejemplo:

```text
com.banco.app
com.visanet.alertas
com.mastercard.alerts
```

## Flujo

```text
NotificationListenerService
→ Normalización local básica
→ Cola local
→ POST /ingestion/notifications
→ Backend Parser
```

## Payload

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

## Consideraciones

- El permiso Notification Access debe ser explicado claramente.
- El usuario puede desactivar la captura por app.
- No se debe capturar información de apps no autorizadas.
- No se deben enviar notificaciones completas de apps sensibles no bancarias.
- Debe existir opción para borrar datos.
