# 11 - Security & Privacy Spec

## Principios

- Mínima recolección de datos.
- Consentimiento explícito.
- Tokens cifrados.
- Auditoría.
- Borrado de datos por usuario.
- No guardar correos completos por defecto.
- No vender ni compartir datos financieros.

## Datos sensibles

- Tokens OAuth.
- Información bancaria.
- Últimos 4 dígitos de tarjetas.
- Historial de gastos.
- Correos bancarios.
- Notificaciones financieras.

## Controles

### Cifrado

- TLS obligatorio.
- Tokens OAuth cifrados.
- Secrets gestionados por Vault/KMS.
- Backup cifrado.

### Autenticación

- JWT access token corto.
- Refresh token rotativo.
- MFA futuro opcional.

### Autorización

- Todo recurso debe filtrar por user_id.
- Nunca permitir acceso cruzado entre usuarios.

### Auditoría

Registrar:

- Conexión OAuth.
- Desconexión OAuth.
- Lectura de correos.
- Creación/modificación de transacciones.
- Cambios de categoría.
- Borrado de datos.

## Permisos móviles

### Android

Explicar claramente:

- Qué notificaciones se leen.
- Qué apps se monitorean.
- Cómo desactivar el permiso.

### iOS

No intentar leer notificaciones de otras apps.

## Borrado de cuenta

Debe eliminar:

- Usuario
- Tokens
- Raw messages
- Transacciones
- Tarjetas
- Presupuestos
- Alertas
- Reglas

## Protección IA

Antes de enviar datos a un modelo IA:

- Remover last4 si no es necesario.
- Remover nombres personales.
- Enviar solo merchant + monto + moneda.
- Permitir modo sin IA externa.
