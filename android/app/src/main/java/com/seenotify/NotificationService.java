package com.seenotify;

import android.app.Notification;
import android.content.Intent;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class NotificationService extends NotificationListenerService {
    private static final String TAG = "NotificationService";
    private static final String EVENT_NOTIFICATION_RECEIVED = "notificationReceived";

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        Log.d(TAG, "Notification received: " + sbn.getPackageName());

        // Skip our own notifications to avoid recursion
        if (sbn.getPackageName().equals(getPackageName())) {
            return;
        }

        // Get notification details
        Notification notification = sbn.getNotification();
        Bundle extras = notification.extras;

        // Create notification data object for JavaScript
        WritableMap notificationData = Arguments.createMap();

        // Basic info
        notificationData.putString("id", String.valueOf(sbn.getId()));
        notificationData.putString("packageName", sbn.getPackageName());
        notificationData.putDouble("postTime", sbn.getPostTime());
        
        // Get app name (friendly name)
        String appName = getApplicationName(sbn.getPackageName());
        notificationData.putString("appName", appName);

        // Extract content from extras
        if (extras != null) {
            // Title, text, subtext
            if (extras.containsKey(Notification.EXTRA_TITLE)) {
                notificationData.putString("title", extras.getCharSequence(Notification.EXTRA_TITLE).toString());
            }
            
            if (extras.containsKey(Notification.EXTRA_TEXT)) {
                CharSequence text = extras.getCharSequence(Notification.EXTRA_TEXT);
                if (text != null) {
                    notificationData.putString("body", text.toString());
                }
            }
            
            if (extras.containsKey(Notification.EXTRA_SUB_TEXT)) {
                CharSequence subText = extras.getCharSequence(Notification.EXTRA_SUB_TEXT);
                if (subText != null) {
                    notificationData.putString("subText", subText.toString());
                }
            }
        }

        // Send to JavaScript
        sendEvent(notificationData);
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // Handle notification removal if needed
    }

    private String getApplicationName(String packageName) {
        try {
            return getPackageManager().getApplicationLabel(
                    getPackageManager().getApplicationInfo(packageName, 0)).toString();
        } catch (Exception e) {
            return packageName;
        }
    }

    private void sendEvent(WritableMap params) {
        try {
            ReactApplication reactApplication = (ReactApplication) getApplication();
            ReactNativeHost reactNativeHost = reactApplication.getReactNativeHost();
            ReactInstanceManager reactInstanceManager = reactNativeHost.getReactInstanceManager();
            ReactContext reactContext = reactInstanceManager.getCurrentReactContext();

            if (reactContext != null) {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(EVENT_NOTIFICATION_RECEIVED, params);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error sending event to JavaScript: " + e.getMessage());
        }
    }
} 