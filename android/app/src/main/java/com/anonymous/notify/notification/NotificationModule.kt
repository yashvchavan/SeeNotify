package com.anonymous.notify.notification

import com.anonymous.notify.notification.NotificationListenerService
import android.content.Intent
import android.provider.Settings
import android.util.Log
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class NotificationModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val TAG = "NotificationModule"

    init {
        NotificationListenerService.reactContext = reactContext
    }

    override fun getName(): String {
        return "NotificationModule"
    }

    @ReactMethod
    fun setupNotificationListener(promise: Promise) {
        try {
            val enabled = isNotificationListenerEnabled()
            promise.resolve(enabled)
        } catch (e: Exception) {
            Log.e(TAG, "Error setting up notification listener: ${e.message}")
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun requestNotificationPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error requesting notification permission: ${e.message}")
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun isNotificationListenerEnabled(promise: Promise) {
        val enabled = isNotificationListenerEnabled()
        promise.resolve(enabled)
    }

    private fun isNotificationListenerEnabled(): Boolean {
        val packageName = reactContext.packageName
        val flat = Settings.Secure.getString(reactContext.contentResolver, "enabled_notification_listeners")
        return flat != null && flat.contains(packageName)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Keep track of event listeners
        Log.d(TAG, "Adding listener for $eventName")
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Remove event listeners
        Log.d(TAG, "Removing listeners")
    }
}