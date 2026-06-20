# 02 - Architecture

## Arquitectura general

```text
App Flutter
│
├── Android
│   ├── Notification Reader Service
│   ├── Local Queue
│   └── Secure Storage
│
├── iOS
│   ├── OAuth Gmail/Outlook
│   └── Secure Storage
│
Backend NestJS
│
├── Auth Service
├── OAuth Service
├── Email Sync Worker
├── Notification Ingestion API
├── Bank Message Parser
├── Transaction Normalizer
├── Duplicate Detector
├── AI Categorization Engine
├── Budget Service
├── Alert Service
├── Card Reconciliation Service
└── PostgreSQL
```

## Componentes

### Mobile App

Responsable de:

- Autenticación del usuario
- Solicitud de permisos
- Captura de notificaciones en Android
- Envío seguro de eventos al backend
- Visualización de dashboards
- Gestión de tarjetas, presupuestos y reglas

### Backend API

Responsable de:

- Exponer APIs REST
- Procesar mensajes entrantes
- Sincronizar correos
- Normalizar transacciones
- Categorizar gastos
- Conciliar pagos
- Generar alertas
- Persistir datos

### Workers

Responsables de:

- Procesamiento asíncrono
- Lectura periódica de correos
- Reintentos
- Detección de duplicados
- Generación de alertas

## Flujo de notificación Android

```text
Banco → Notificación Android → NotificationListenerService → App Flutter/Kotlin → Backend API → Parser → DB → Dashboard
```

## Flujo de correo

```text
Banco → Gmail/Outlook → OAuth API → Backend Worker → Parser → DB → Dashboard
```

## Decisiones técnicas

### Flutter

Se elige Flutter por:

- Una sola base para Android/iOS.
- Buen rendimiento.
- Facilidad para crear UI financiera.
- Permite canales nativos para Android NotificationListenerService.

### NestJS

Se elige NestJS por:

- Arquitectura modular.
- Buen soporte para APIs REST.
- Integración con BullMQ, Prisma/TypeORM, JWT y OAuth.
- Escalable para microservicios futuros.

### PostgreSQL

Se elige PostgreSQL por:

- Consistencia transaccional.
- Buen soporte para JSONB.
- Consultas analíticas.
- Integridad relacional.

### Redis + BullMQ

Se usa para:

- Jobs de sincronización.
- Parsing asíncrono.
- Reintentos.
- Procesamiento de alertas.
