package com.nivaata.routematic.intune;

import android.view.WindowManager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.Objects;

import javax.annotation.Nonnull;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

class ScreenShotModule extends ReactContextBaseJavaModule {
    public ScreenShotModule(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Nonnull
    @Override
    public String getName() {
        return "ScreenShotModule";
    }

    @ReactMethod
    public void enabled(boolean enable) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (enable) {
                    Objects.requireNonNull(getCurrentActivity()).getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
                } else {
                    Objects.requireNonNull(getCurrentActivity()).getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
                }
            }
        });
    }
}