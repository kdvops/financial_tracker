package com.financialtracker.financial_tracker_mobile.notifications

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import io.flutter.plugin.common.EventChannel

class BankNotificationListenerService : NotificationListenerService() {
    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val extras = sbn.notification.extras
        val title = extras?.getString("android.title")
        val text = extras?.getCharSequence("android.text")?.toString()
        val bigText = extras?.getCharSequence("android.bigText")?.toString()

        NotificationEventStreamHandler.emit(
            mapOf(
                "packageName" to sbn.packageName,
                "notificationTitle" to title,
                "notificationText" to text,
                "bigText" to bigText,
                "timestamp" to sbn.postTime,
            ),
        )
    }
}

object NotificationEventStreamHandler : EventChannel.StreamHandler {
    private var sink: EventChannel.EventSink? = null

    override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
        sink = events
    }

    override fun onCancel(arguments: Any?) {
        sink = null
    }

    fun emit(payload: Map<String, Any?>) {
        sink?.success(payload)
    }
}
