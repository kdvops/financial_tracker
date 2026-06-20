# 05 - Email Ingestion Spec

## Objetivo

Permitir que el backend capture correos bancarios autorizados por el usuario mediante OAuth, sin solicitar contraseña del correo.

## Proveedores

- Gmail
- Outlook/Microsoft Graph

## Bancos y remitentes objetivo MVP

### Banco Santa Cruz

- Remitente confiable inicial: `notificaciones@bsc.com.do`
- Subject esperado: `Notificación, Banco Santa Cruz`
- Frase clave en cuerpo: `NOTIFICACIÓN DE CONSUMO`

### Qik

- Remitentes confiables iniciales: `notificaciones@qik.do`, `no-reply-qik@qik.com.do`
- Subjects esperados: `Usaste tu tarjeta de crédito Qik`, `Pago de servicio realizado`
- Frase clave en cuerpo para consumos: `Se hizo una transacción`
- Señales adicionales: `tarjeta crédito Qik`, `Monto total pagado`, `Forma de pago`

## Flujo OAuth

```text
Usuario -> App -> Backend /oauth/google/start -> Google Consent Screen
Google -> Backend /oauth/google/callback -> Guarda tokens cifrados
Backend Worker -> Gmail API -> Correos bancarios -> Parser
```

## Permisos recomendados

### Gmail

Preferir permisos limitados:

- Gmail read-only si es necesario.
- Idealmente usar filtros por query.
- Evitar permisos de modificación.

### Outlook

- Mail.Read
- offline_access

## Estrategia de sincronización

### MVP

Job cada 5 minutos:

```text
1. Buscar correos nuevos.
2. Filtrar remitentes bancarios.
3. Descargar metadata y body mínimo necesario.
4. Crear raw_message.
5. Enviar a cola de parsing.
```

### Futuro

- Gmail Push Notifications con Pub/Sub.
- Microsoft Graph subscriptions.

## Filtros de búsqueda

Ejemplos:

```text
from:(alertas@banco.com.do)
subject:(consumo OR transacción OR tarjeta OR pago)
newer_than:30d
```

```text
("consumo aprobado" OR "transacción aprobada" OR "pago recibido")
```

### Filtros MVP recomendados

```text
from:(notificaciones@bsc.com.do)
subject:("Notificación, Banco Santa Cruz")
```

```text
from:(notificaciones@qik.do OR no-reply-qik@qik.com.do)
subject:("Usaste tu tarjeta de crédito Qik" OR "Pago de servicio realizado")
```

## Datos a guardar

Guardar:

- Provider
- Message ID
- Remitente
- Subject
- Fecha
- Hash del cuerpo
- Fragmento mínimo necesario
- Texto normalizado para parsing

No guardar por defecto:

- Todo el correo completo
- Adjuntos
- Conversaciones completas

## Deduplicación de correos

Cada mensaje debe tener una llave única:

```text
provider + provider_message_id + user_id
```

## Seguridad

- Tokens OAuth cifrados con AES-256-GCM o KMS.
- Rotación de tokens.
- Revocación desde la app.
- Auditoría de acceso.
