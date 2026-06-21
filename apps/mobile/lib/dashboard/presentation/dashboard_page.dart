import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../android_notification_bridge/application/notification_bridge_service.dart';
import '../../auth/application/auth_controller.dart';

class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(authControllerProvider).asData?.value;
    final bridgeStatus = ref.watch(notificationBridgeAvailabilityProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Resumen'),
        actions: [
          IconButton(
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _SummaryCard(
            title: 'Sesion activa',
            subtitle: session?.email ?? 'Sin usuario',
          ),
          const SizedBox(height: 16),
          _SummaryCard(
            title: 'Captura Android',
            subtitle: bridgeStatus.when(
              data: (enabled) => enabled
                  ? 'Bridge nativo disponible para notificaciones'
                  : 'Bridge nativo aun no disponible',
              error: (_, __) => 'No se pudo leer el estado del bridge',
              loading: () => 'Verificando bridge...',
            ),
          ),
          const SizedBox(height: 16),
          _SummaryCard(
            title: 'Proximo paso',
            subtitle:
                'Conectar dashboard real, tarjetas, transacciones, presupuestos y alertas al backend.',
          ),
        ],
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({
    required this.title,
    required this.subtitle,
  });

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(subtitle, style: Theme.of(context).textTheme.bodyLarge),
          ],
        ),
      ),
    );
  }
}
