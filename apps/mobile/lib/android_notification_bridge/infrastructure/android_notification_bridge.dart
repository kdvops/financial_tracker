import 'dart:async';

import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final androidNotificationBridgeProvider = Provider<AndroidNotificationBridge>(
  (ref) => const AndroidNotificationBridge(),
);

class AndroidNotificationBridge {
  const AndroidNotificationBridge();

  static const _methodChannel = MethodChannel(
    'financial_tracker/android_notification_bridge/methods',
  );
  static const _eventChannel = EventChannel(
    'financial_tracker/android_notification_bridge/events',
  );

  Future<bool> isNotificationAccessSupported() async {
    try {
      final result = await _methodChannel.invokeMethod<bool>(
        'isNotificationAccessSupported',
      );
      return result ?? false;
    } on PlatformException {
      return false;
    } on MissingPluginException {
      return false;
    }
  }

  Future<bool> hasNotificationAccess() async {
    try {
      final result = await _methodChannel.invokeMethod<bool>(
        'hasNotificationAccess',
      );
      return result ?? false;
    } on PlatformException {
      return false;
    } on MissingPluginException {
      return false;
    }
  }

  Future<void> openNotificationAccessSettings() async {
    try {
      await _methodChannel.invokeMethod<void>('openNotificationAccessSettings');
    } on MissingPluginException {
      return;
    }
  }

  Stream<Map<String, dynamic>> notificationEvents() {
    return _eventChannel.receiveBroadcastStream().map((event) {
      if (event is Map) {
        return Map<String, dynamic>.from(event);
      }
      return const <String, dynamic>{};
    });
  }
}
