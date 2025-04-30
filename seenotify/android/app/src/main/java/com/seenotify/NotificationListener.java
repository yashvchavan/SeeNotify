package com.seenotify;
import android.app.Notification;
import android.os.Build;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.util.Log;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import static android.app.NotificationManager.IMPORTANCE_NONE;

public class NotificationListener extends NotificationListenerService {
    private static final String TAG = "NotificationListener";
    private static ReactContext reactContext;

    public static void setReactContext(ReactContext context) {
        reactContext = context;
        Log.d(TAG, "React context set");
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "Service created");
    }

    @Override
    public void onListenerConnected() {
        super.onListenerConnected();
        Log.d(TAG, "Connected to notification service");
        sendActiveNotifications();
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        // Skip muted notifications
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = getSystemService(NotificationManager.class)
                .getNotificationChannel(sbn.getNotification().getChannelId());
            if (channel != null && channel.getImportance() == IMPORTANCE_NONE) {
                Log.d(TAG, "Suppressed muted notification from: " + sbn.getPackageName());
                return;
            }
        }

        // Skip hotspot notifications
        if (sbn.getPackageName().equals("android") && 
            sbn.getNotification().extras.getString("android.text", "").contains("hotspot")) {
            Log.d(TAG, "Skipped hotspot notification");
            return;
        }
        if ("android".equals(sbn.getPackageName()) 
                && "TetherNotification".equals(sbn.getNotification().getChannelId())
                && sbn.getNotification().extras.getString("android.title", "").contains("mobile data hotspot")) {
            return;
        }
        Log.d(TAG, "Notification posted from: " + sbn.getPackageName());
        sendNotificationEvent("notificationPosted", convertNotification(sbn));
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        super.onNotificationRemoved(sbn);
        Log.d(TAG, "Notification removed: " + sbn.getPackageName());
        sendNotificationEvent("notificationRemoved", convertNotification(sbn));
    }

    private void sendActiveNotifications() {
        try {
            StatusBarNotification[] notifications = getActiveNotifications();
            WritableArray notificationsArray = new WritableNativeArray();
            
            for (StatusBarNotification sbn : notifications) {
                // Skip muted and hotspot notifications for initial load
                if (shouldSkipNotification(sbn)) continue;
                
                notificationsArray.pushMap(convertNotification(sbn));
            }
            
            WritableMap params = new WritableNativeMap();
            params.putArray("notifications", notificationsArray);
            sendNotificationEvent("activeNotifications", params);
        } catch (Exception e) {
            Log.e(TAG, "Error getting notifications", e);
        }
    }

    private boolean shouldSkipNotification(StatusBarNotification sbn) {
        // Skip muted notifications

        return false;
    }

    private WritableMap convertNotification(StatusBarNotification sbn) {
        WritableMap notification = new WritableNativeMap();
        
        // Create unique ID using package + id + tag + post time
        String uniqueId = sbn.getPackageName() + ":" + sbn.getId() + ":" + 
                         (sbn.getTag() != null ? sbn.getTag() : "") + ":" + 
                         sbn.getPostTime();
        
        notification.putString("id", uniqueId);
        notification.putString("packageName", sbn.getPackageName());
        notification.putString("tag", sbn.getTag() != null ? sbn.getTag() : "");
        notification.putDouble("postTime", sbn.getPostTime());
        notification.putBoolean("isGroupSummary", 
            (sbn.getNotification().flags & Notification.FLAG_GROUP_SUMMARY) != 0);

        if (sbn.getNotification() != null) {
            notification.putString("title", 
                sbn.getNotification().extras.getString("android.title", getSenderName(sbn)));
            notification.putString("text",
                sbn.getNotification().extras.getString("android.text", ""));
            notification.putString("subText",
                sbn.getNotification().extras.getString("android.subText", ""));
            notification.putBoolean("isGroupSummary", 
                    (sbn.getNotification().flags & android.app.Notification.FLAG_GROUP_SUMMARY) != 0);
                
            // Add system notification flag
            notification.putBoolean("isSystem", sbn.getPackageName().equals("android"));

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = getSystemService(NotificationManager.class)
                    .getNotificationChannel(sbn.getNotification().getChannelId());
                if (channel != null) {
                    notification.putString("channelId", channel.getId());
                    notification.putInt("importance", channel.getImportance());
                }
                notification.putString("channelId", sbn.getNotification().getChannelId());
                
            }
        }
        
        return notification;
    }

    private String getSenderName(StatusBarNotification sbn) {
        if (sbn.getNotification().extras.containsKey("android.title")) {
            return sbn.getNotification().extras.getString("android.title");
        }
        return sbn.getPackageName().equals("android") ? "System" : "Unknown";
    }

    private void sendNotificationEvent(String eventName, WritableMap params) {
        if (reactContext != null && reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        } else {
            Log.w(TAG, "No active React context to send event: " + eventName);
        }
    }
}