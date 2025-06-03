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
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Bundle;
import android.app.RemoteInput;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
public class NotificationListener extends NotificationListenerService {
    private static final String TAG = "NotificationListener";
    private static ReactContext reactContext;
    private final Map<String, StatusBarNotification> notificationCache = new ConcurrentHashMap<>();
    public NotificationListener() {
        super();
    }
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
        if (shouldSkipNotification(sbn)) {
            return;
        }

        // Cache the notification
        String uniqueId = generateUniqueId(sbn);
        notificationCache.put(uniqueId, sbn);
        
        Log.d(TAG, "Notification posted from: " + sbn.getPackageName());
        sendNotificationEvent("notificationPosted", convertNotification(sbn));
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        String uniqueId = generateUniqueId(sbn);
        
        // Only forward removal if we explicitly want to remove it
        if (!notificationCache.containsKey(uniqueId)) {
            super.onNotificationRemoved(sbn);
            Log.d(TAG, "Notification removed: " + sbn.getPackageName());
            sendNotificationEvent("notificationRemoved", convertNotification(sbn));
        } else {
            // Keep the notification in our cache
            Log.d(TAG, "Notification removal intercepted: " + sbn.getPackageName());
        }
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
    public void muteNotification(String packageName, String channelId) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            NotificationChannel channel = notificationManager.getNotificationChannel(channelId);
            
            if (channel != null) {
                channel.setImportance(NotificationManager.IMPORTANCE_NONE);
                notificationManager.createNotificationChannel(channel);
                Log.d(TAG, "Muted channel: " + channelId);
            }
        }
    }
    private String generateUniqueId(StatusBarNotification sbn) {
        return sbn.getPackageName() + ":" + sbn.getId() + ":" + 
               (sbn.getTag() != null ? sbn.getTag() : "") + ":" + 
               sbn.getPostTime();
    }
    public void removeNotificationFromCache(String uniqueId) {
        notificationCache.remove(uniqueId);
    }
    public void sendReply(String packageName, String tag, int id, String replyText) {
        try {
            StatusBarNotification[] notifications = getActiveNotifications();
            for (StatusBarNotification sbn : notifications) {
                if (sbn.getPackageName().equals(packageName) && 
                    (sbn.getTag() == null ? tag == null : sbn.getTag().equals(tag)) &&
                    sbn.getId() == id) {
                    
                    Notification notification = sbn.getNotification();
                    Bundle extras = notification.extras;
                    
                    // Check for direct reply action
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH) {
                        Notification.Action[] actions = notification.actions;
                        if (actions != null) {
                            for (Notification.Action action : actions) {
                                if (action.getRemoteInputs() != null) {
                                    // Found a reply action - send the reply
                                    Intent sendIntent = new Intent();
                                    RemoteInput[] remoteInputs = action.getRemoteInputs();
                                    Bundle remoteInputResults = new Bundle();
                                    
                                    for (RemoteInput remoteInput : remoteInputs) {
                                        remoteInputResults.putCharSequence(
                                            remoteInput.getResultKey(), replyText);
                                    }
                                    
                                    RemoteInput.addResultsToIntent(remoteInputs, sendIntent, 
                                        remoteInputResults);
                                    
                                    try {
                                        action.actionIntent.send(this, 0, sendIntent);
                                        Log.d(TAG, "Reply sent successfully");
                                    } catch (PendingIntent.CanceledException e) {
                                        Log.e(TAG, "Error sending reply", e);
                                    }
                                    return;
                                }
                            }
                        }
                    }
                }
            }
            Log.w(TAG, "No reply action found for this notification");
        } catch (Exception e) {
            Log.e(TAG, "Error sending reply", e);
        }
    }
    private boolean shouldSkipNotification(StatusBarNotification sbn) {
        String packageName = sbn.getPackageName();
        
        // List of allowed package names
        String[] allowedPackages = {
            "com.whatsapp",           // WhatsApp
            "com.google.android.gm",  // Gmail
            "com.instagram.android",  // Instagram
            "com.twitter.android",    // X (Twitter)
            "com.linkedin.android",   // LinkedIn
            "com.facebook.katana",    // Facebook
            "com.facebook.orca",      // Facebook Messenger
            "com.snapchat.android",   // Snapchat
            "com.microsoft.teams",    // Microsoft Teams
            "com.slack"              // Slack
        };
        
        // Check if the notification is from Android system or mobile hotspot
        if (packageName.equals("android") || 
            (sbn.getNotification() != null && 
             sbn.getNotification().extras.getString("android.title", "").toLowerCase().contains("hotspot"))) {
            return true;  // Skip these notifications
        }
        
        // Check if the package is in our allowed list
        for (String allowedPackage : allowedPackages) {
            if (packageName.equals(allowedPackage)) {
                return false;  // Don't skip these notifications
            }
        }
        
        return true;  // Skip all other notifications
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