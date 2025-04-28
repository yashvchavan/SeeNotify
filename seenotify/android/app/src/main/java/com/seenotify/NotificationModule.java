package com.seenotify;

import android.content.Intent;
import android.provider.Settings;
import android.util.Log;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = NotificationModule.NAME)
public class NotificationModule extends ReactContextBaseJavaModule {
    public static final String NAME = "NotificationModule";
    private final ReactApplicationContext reactContext;

    public NotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
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