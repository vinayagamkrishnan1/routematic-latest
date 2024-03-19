package com.nivaata.routematic.intune;

import android.util.Log;

//import com.babylon.certificatetransparency.CTInterceptorBuilder;
import com.facebook.react.modules.network.OkHttpClientFactory;
import com.facebook.react.modules.network.OkHttpClientProvider;
import com.facebook.react.modules.network.ReactCookieJarContainer;

import java.util.concurrent.TimeUnit;

import javax.net.ssl.SSLContext;

import okhttp3.Interceptor;
import okhttp3.OkHttpClient;

class CustomNetworkModule implements OkHttpClientFactory {
    public OkHttpClient createNewNetworkModuleClient() {

        try {
//            SSLContext sc = SSLContext.getInstance("TLSv1.2");
//            sc.init(null, null, null);
//            CTInterceptorBuilder builder = new CTInterceptorBuilder();
//            builder.includeHost("*.routematic.com");
////            builder.includeHost("*.localhost");
//
//            Interceptor networkInterceptor = builder.build();
//            OkHttpClient.Builder client = new OkHttpClient.Builder()
//                    .cookieJar(new ReactCookieJarContainer())
//                    .followRedirects(true)
//                    .followSslRedirects(true)
//                    .retryOnConnectionFailure(true)
//                    .addNetworkInterceptor(networkInterceptor)
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
//            return OkHttpClientProvider.enableTls12OnPreLollipop(client).build();

        } catch (Exception e) {
            Log.e("TLSSetup", e.getMessage());
        }
        return OkHttpClientProvider.getOkHttpClient();

    }
}