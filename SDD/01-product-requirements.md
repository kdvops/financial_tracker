# 01 - Product Requirements Document

## Nombre del producto

Financial Tracker App

## Problema

El usuario no conoce con precisión cuánto ha gastado en sus tarjetas de crédito, si los pagos ya fueron aplicados, cuánto debe pagar, ni en qué categorías consume más. Las aplicaciones tradicionales requieren registrar gastos manualmente, lo cual genera abandono y datos incompletos.

## Objetivo principal

Automatizar la captura de gastos desde notificaciones bancarias y correos electrónicos para construir un historial financiero útil, categorizado y conciliado.

## Plataformas

- Android
- iOS
- Web futura opcional

## Fuentes de datos

### Android

- Notificaciones bancarias
- Correos Gmail/Outlook

### iOS

- Correos Gmail/Outlook

### Backend

- Sincronización OAuth con Gmail/Outlook
- Parsing de mensajes bancarios
- Normalización de transacciones

## Funcionalidades principales

### MVP

- Registro de usuario
- Conexión de cuenta Gmail/Outlook
- Lectura de correos bancarios autorizados
- Lector de notificaciones bancarias en Android
- Parser de consumos de tarjetas
- Parser de pagos de tarjetas
- Detección de duplicados
- Categorización automática
- Dashboard por tarjeta
- Dashboard por categoría
- Alertas de exceso de presupuesto
- Alertas de consumo inusual

### Post-MVP

- Importación de estados de cuenta PDF
- OCR de comprobantes
- Machine learning personalizado por usuario
- Reglas personalizadas por comercio
- Multi-moneda
- Exportación Excel/PDF
- Widget móvil
- Modo familiar

## Casos de uso

### Caso 1: consumo con tarjeta

1. Banco envía notificación o correo.
2. Sistema captura el mensaje.
3. Parser extrae monto, comercio, tarjeta y fecha.
4. Sistema crea transacción.
5. Motor categoriza automáticamente.
6. App actualiza balance de tarjeta.

### Caso 2: pago a tarjeta

1. Banco envía correo de pago aplicado.
2. Backend identifica que es pago de tarjeta.
3. Sistema registra pago.
4. Conciliador reduce saldo estimado de la tarjeta.

### Caso 3: alerta de presupuesto

1. Usuario define presupuesto mensual de restaurantes.
2. Sistema acumula transacciones categorizadas.
3. Si supera umbral, envía alerta.

## Restricciones

- iOS no permite leer notificaciones de otras apps.
- Android requiere permiso explícito para Notification Access.
- Google Play puede restringir lectura de SMS, por lo tanto SMS no será fuente primaria.
- El backend no debe guardar correos completos salvo que el usuario lo autorice.
- Los tokens OAuth deben almacenarse cifrados.

## Métricas de éxito

- 90% de transacciones bancarias detectadas correctamente.
- 95% de duplicados evitados.
- 80% de categorías asignadas automáticamente.
- Menos de 5% de correcciones manuales necesarias.
