import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../android_notification_bridge/application/notification_bridge_service.dart';
import '../../auth/application/auth_controller.dart';

class OnboardingPage extends ConsumerWidget {
  const OnboardingPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bridge = ref.watch(notificationBridgeServiceProvider);
    final access = ref.watch(notificationAccessProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Onboarding')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Text(
            'Vamos a preparar la captura de consumos y pagos.',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 20),
          const _StepTile(
            title: '1. Explicar permisos',
            description:
                'La app necesitara acceso a notificaciones para leer alertas bancarias permitidas.',
          ),
          const _StepTile(
            title: '2. Configurar apps bancarias',
            description:
                'Mas adelante filtraremos solo Qik, Banco Santa Cruz y otras apps autorizadas por el usuario.',
          ),
          const _StepTile(
            title: '3. Sincronizar con el backend',
            description:
                'Cada evento validado terminara en POST /ingestion/notifications.',
          ),
          const SizedBox(height: 8),
          Card(
            child: ListTile(
              title: const Text('Estado actual del permiso'),
              subtitle: Text(
                access.when(
                  data: (enabled) => enabled
                      ? 'Notification Access ya esta habilitado'
                      : 'Notification Access aun no esta habilitado',
                  error: (_, __) => 'No se pudo leer el estado del permiso',
                  loading: () => 'Verificando permiso...',
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: () async {
              await bridge.openNotificationAccessSettings();
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text(
                      'Se abrio la configuracion de acceso a notificaciones.',
                    ),
                  ),
                );
              }
            },
            child: const Text('Abrir permisos Android'),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: () =>
                ref.read(authControllerProvider.notifier).completeOnboarding(),
            child: const Text('Continuar al dashboard'),
          ),
        ],
      ),
    );
  }
}

class _StepTile extends StatelessWidget {
  const _StepTile({
    required this.title,
    required this.description,
  });

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(title),
        subtitle: Text(description),
      ),
    );
  }
}
