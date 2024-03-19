package com.nivaata.routematic.intune.parkzeus;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import com.bosch.innopark.ui.splash.SplashActivity;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ParkzeusModule extends ReactContextBaseJavaModule {

    private String KEY_EMAIL_ID = "email_id";
    private String KEY_USER_INFO = "user_info";
    private String KEY_ACCESS_TOKEN = "session_id";
    private String KEY_REFRESH_TOKEN = "refresh_token";
    private String KEY_ENDPOINT = "sso_auth_url";

    ParkzeusModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public void initialize() {
        super.initialize();
    }

    /**
     * @return the name of this module. This will be the name used to {@code require()} this module
     * from JavaScript.
     */
    @Override
    public String getName() {
        return "ParkingModule";
    }

    @ReactMethod
    void startParkZeus(String emailId, String userInfo, String accessToken, String refreshToken, String endPoint) {
        Log.e("Email Input --","" + emailId);
        Activity activity = getCurrentActivity();
        Intent intent = new Intent(activity, SplashActivity.class);
        intent.putExtra(KEY_EMAIL_ID, emailId);
        intent.putExtra(KEY_USER_INFO, userInfo);
        intent.putExtra(KEY_ACCESS_TOKEN, accessToken);
        intent.putExtra(KEY_REFRESH_TOKEN, refreshToken);
        intent.putExtra(KEY_ENDPOINT, endPoint);
        activity.startActivity(intent);
    }
}