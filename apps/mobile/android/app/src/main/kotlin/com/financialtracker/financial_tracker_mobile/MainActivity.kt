package com.financialtracker.financial_tracker_mobile

import android.content.ComponentName
import android.content.Intent
import android.provider.Settings
import com.financialtracker.financial_tracker_mobile.notifications.BankNotificationListenerService
import com.financialtracker.financial_tracker_mobile.notifications.NotificationEventStreamHandler
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            "financial_tracker/android_notification_bridge/methods",
        ).setMethodCallHandler { call, result ->
            when (call.method) {
                "isNotificationAccessSupported" -> result.success(true)
                "openNotificationAccessSettings" -> {
                    startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
                    result.success(null)
                }
                "hasNotificationAccess" -> result.success(hasNotificationAccess())
                else -> result.notImplemented()
            }
        }

        EventChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            "financial_tracker/android_notification_bridge/events",
        ).setStreamHandler(NotificationEventStreamHandler)
    }

    private fun hasNotificationAccess(): Boolean {
        val enabledListeners = Settings.Secure.getString(
            contentResolver,
            "enabled_notification_listeners",
        ) ?: return false

        return enabledListeners.contains(
            ComponentName(this, BankNotificationListenerService::class.java).flattenToString(),
        )
    }
}
