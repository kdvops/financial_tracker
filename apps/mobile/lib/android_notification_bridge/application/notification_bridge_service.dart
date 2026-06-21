import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../infrastructure/android_notification_bridge.dart';

final notificationBridgeServiceProvider = Provider<NotificationBridgeService>(
  (ref) => NotificationBridgeService(ref.watch(androidNotificationBridgeProvider)),
);

final notificationBridgeAvailabilityProvider = FutureProvider<bool>((ref) {
  return ref.watch(notificationBridgeServiceProvider).isBridgeAvailable();
});

final notificationAccessProvider = FutureProvider<bool>((ref) {
  return ref.watch(notificationBridgeServiceProvider).hasNotificationAccess();
});

class NotificationBridgeService {
  NotificationBridgeService(this._bridge);

  final AndroidNotificationBridge _bridge;

  Future<bool> isBridgeAvailable() {
    return _bridge.isNotificationAccessSupported();
  }

  Future<void> openNotificationAccessSettings() {
    return _bridge.openNotificationAccessSettings();
  }

  Future<bool> hasNotificationAccess() {
    return _bridge.hasNotificationAccess();
  }

  Stream<Map<String, dynamic>> watchEvents() {
    return _bridge.notificationEvents();
  }
}
