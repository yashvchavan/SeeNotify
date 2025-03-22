package com.seenotify;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.provider.Settings;
import android.text.TextUtils;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class NotificationListenerModule extends ReactContextBaseJavaModule {
    private static final String NOTIFICATION_LISTENER_SETTINGS = "android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS";
    private final ReactApplicationContext reactContext;

    public NotificationListenerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "NotificationListener";
    }

    /**
     * Check if the notification listener permission is enabled
     */
    @ReactMethod
    public void isPermissionEnabled(Promise promise) {
        try {
            String packageName = reactContext.getPackageName();
            String flat = Settings.Secure.getString(reactContext.getContentResolver(),
                    "enabled_notification_listeners");
            
            if (!TextUtils.isEmpty(flat)) {
                String[] names = flat.split(":");
                for (String name : names) {
                    ComponentName componentName = ComponentName.unflattenFromString(name);
                    if (componentName != null && TextUtils.equals(packageName, componentName.getPackageName())) {
                        promise.resolve(true);
                        return;
                    }
                }
            }
            promise.resolve(false);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Open the system settings to request notification listener permission
     */
    @ReactMethod
    public void requestPermission(Promise promise) {
        try {
            Activity activity = getCurrentActivity();
            if (activity == null) {
                promise.reject("ERROR", "Activity not found");
                return;
            }

            Intent intent = new Intent(NOTIFICATION_LISTENER_SETTINGS);
            activity.startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
} 