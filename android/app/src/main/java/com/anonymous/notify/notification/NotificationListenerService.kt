package com.anonymous.notify.notification

import android.app.Notification
import android.content.Intent
import android.os.IBinder
import android.service.notification.NotificationListenerService as AndroidNotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

class NotificationListenerService : AndroidNotificationListenerService() {
    
    private val TAG = "NotificationListener"
    
    companion object {
        var reactContext: ReactApplicationContext? = null
    }
    
    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Notification Listener Service created")
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        Log.d(TAG, "Notification Posted: ${sbn.packageName}")
        
        try {
            val notification = sbn.notification
            val extras = notification.extras
            
            // Get notification details
            val packageName = sbn.packageName
            val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
            val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
            val app = packageName.split(".").last().capitalize()
            val sender = title
            val message = text
            val postTime = sbn.postTime
            val category = getCategoryFromPackage(packageName)
            
            // Create notification data
            val notificationData = Arguments.createMap().apply {
                putString("id", UUID.randomUUID().toString())
                putString("app", app)
                putString("packageName", packageName)
                putString("sender", sender)
                putString("message", message)
                putString("time", formatTime(postTime))
                putString("title", title)
                putString("category", category)
                putBoolean("isRead", false)
                putString("icon", "Bell")  // Default icon, you can set based on category
            }
            
            // Send event to React Native
            sendEvent("onNotificationReceived", notificationData)
            
        } catch (e: Exception) {
            Log.e(TAG, "Error processing notification: ${e.message}")
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        Log.d(TAG, "Notification Removed: ${sbn.packageName}")
        
        try {
            val notificationData = Arguments.createMap().apply {
                putString("packageName", sbn.packageName)
                putLong("postTime", sbn.postTime)
            }
            
            sendEvent("onNotificationRemoved", notificationData)
        } catch (e: Exception) {
            Log.e(TAG, "Error processing notification removal: ${e.message}")
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactContext?.let { context ->
            context
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }
    
    private fun formatTime(timeInMillis: Long): String {
        val date = Date(timeInMillis)
        val format = SimpleDateFormat("h:mm a", Locale.getDefault())
        return format.format(date)
    }
    
    private fun getCategoryFromPackage(packageName: String): String {
        return when {
            packageName.contains("mail") || 
            packageName.contains("gmail") || 
            packageName.contains("outlook") -> "work"
            
            packageName.contains("whatsapp") || 
            packageName.contains("messenger") || 
            packageName.contains("telegram") || 
            packageName.contains("instagram") || 
            packageName.contains("snapchat") || 
            packageName.contains("twitter") -> "social"
            
            packageName.contains("calendar") || 
            packageName.contains("teams") || 
            packageName.contains("slack") || 
            packageName.contains("zoom") -> "work"
            
            packageName.contains("amazon") || 
            packageName.contains("shopping") || 
            packageName.contains("store") -> "promo"
            
            else -> "all"
        }
    }
}