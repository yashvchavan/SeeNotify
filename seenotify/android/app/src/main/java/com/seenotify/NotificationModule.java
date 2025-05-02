package com.seenotify;

import android.content.Intent;
import android.os.Build;
import android.os.Build.VERSION_CODES;
import android.provider.Settings;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = NotificationModule.NAME)
public class NotificationModule extends ReactContextBaseJavaModule {
    public static final String NAME = "NotificationModule";
    private final ReactApplicationContext reactContext;
    private final NotificationListener notificationListener;

    public NotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.notificationListener = new NotificationListener();
        NotificationListener.setReactContext(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void requestPermission(Promise promise) {
        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(NAME, "Error requesting notification permission", e);
            promise.reject("ERROR", "Could not open notification settings");
        }
    }

    @RequiresApi(api = VERSION_CODES.O)
    @ReactMethod
    public void muteNotification(String packageName, String channelId, Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= VERSION_CODES.O) {
                notificationListener.muteNotification(packageName, channelId);
                promise.resolve(true);
            } else {
                promise.reject("UNSUPPORTED", "Mute requires Android Oreo (8.0) or higher");
            }
        } catch (Exception e) {
            promise.reject("MUTE_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void sendReply(String packageName, String tag, int id, String replyText, Promise promise) {
        try {
            notificationListener.sendReply(packageName, tag, id, replyText);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("REPLY_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void isPermissionGranted(Promise promise) {
        try {
            String enabledListeners = Settings.Secure.getString(
                reactContext.getContentResolver(),
                "enabled_notification_listeners"
            );
            String packageName = reactContext.getPackageName();
            boolean granted = enabledListeners != null && enabledListeners.contains(packageName);
            promise.resolve(granted);
        } catch (Exception e) {
            Log.e(NAME, "Error checking notification permission", e);
            promise.reject("ERROR", "Could not check notification permission");
        }
    }
}