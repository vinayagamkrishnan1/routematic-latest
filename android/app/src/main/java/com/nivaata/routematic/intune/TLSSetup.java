package com.nivaata.routematic.intune;

import android.util.Log;

//import com.babylon.certificatetransparency.CTInterceptorBuilder;
//import com.babylon.certificatetransparency.cache.AndroidDiskCache;
import com.facebook.react.modules.network.OkHttpClientProvider;
import com.facebook.react.modules.network.ReactCookieJarContainer;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;

import okhttp3.ConnectionSpec;
import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.TlsVersion;

/**
 * Updated by @Sathish on 18 Aug 2020
 * */
public class TLSSetup {

    public static void configure() {
        try {
//            SSLContext sc = SSLContext.getInstance("TLSv1.2");
//            sc.init(null, null, null);
//            CTInterceptorBuilder builder = new CTInterceptorBuilder()
//                    .includeHost("*.routematic.com");
//            Interceptor networkInterceptor = builder.build();
//            OkHttpClient.Builder client = new OkHttpClient.Builder()
//                    .followRedirects(true)
//                    .followSslRedirects(true)
//                    .retryOnConnectionFailure(true)
//                    .addInterceptor(networkInterceptor)
//                    .cache(null)
//                    .connectTimeout(30, TimeUnit.SECONDS)
//                    .writeTimeout(30, TimeUnit.SECONDS)
//                    .readTimeout(30, TimeUnit.SECONDS);
//
////            client.hostnameVerifier(new HostnameVerifier() {
////                @Override
////                public boolean verify(String hostname, SSLSession session) {
////                    Log.e("host name", hostname);
////                    return hostname.contains(".routematic.com") ? true : false;
////                }
////            });
//
//             OkHttpClientProvider.enableTls12OnPreLollipop(client).build();

        } catch (Exception e) {
            Log.e("TLSSetup", e.getMessage());
        }
    }

}
