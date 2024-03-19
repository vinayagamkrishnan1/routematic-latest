import React, { Component } from "react";
import {  ActivityIndicator,Text, View } from "react-native";
import {WebView} from "react-native-webview";
import * as Alert from "../../utils/Alert";
import { asyncString } from "../../utils/ConstantString";
import { CryptoXor } from "crypto-xor";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../utils/Colors";
import CookieManager from "@react-native-cookies/cookies";
var he = require("he");

class SSOLogin extends Component {
  state = {
    ssoLoginURL: "",
    domainName: "",
    emailID: ""
  };

  UNSAFE_componentWillMount() {
    const { navigation, route } = this.props;
    console.warn('SSo param - ', route.params);
    const ssoLoginURL = route.params.ssoLoginURL ? route.params.ssoLoginURL : null;
    const domainName = route.params.domainName ? route.params.domainName : null;
    const emailID = route.params.emailID ? route.params.emailID : null;
    this.setState({ ssoLoginURL, domainName, emailID });
    CookieManager.clearAll();
  }

  onMessage1(m) {
    // console.warn(m.nativeEvent.data);
    let data = JSON.parse(he.decode(m.nativeEvent.data));
    // console.warn('sso data - ', data);
    if (data.status.code === 200) {
      try {
        AsyncStorage.multiSet([
          [asyncString.DOMAIN_NAME, this.state.domainName],
          [asyncString.hasEverLoggedIn, "Yes"],

          [asyncString.ACCESS_TOKEN, 
            // data.data.access_token
            CryptoXor.encrypt(data.data.access_token, asyncString.ACCESS_TOKEN)
          ],
          [asyncString.CAPI, data.data.capi],
          [
            asyncString.REFRESH_TOKEN,
            CryptoXor.encrypt(data.data.refresh_token, asyncString.REFRESH_TOKEN)
          ],
          [asyncString.DID_RE_LOGIN, asyncString.lastForcedLogout],
          [asyncString.EXPIRES_IN, data.data.expires_in.toString()],
          [asyncString.IS_PUSH_ALLOWED, "true"]
        ]).then(() => {
          this.props.navigation.navigate("App");
        });
      } catch (error) {
        Alert.show("Error", error);
      }
    } else {
      Alert.show(null, data.status.message);
    }
    if (data.status.code === 40302) {
      this.props.navigation.navigate("OTP", {
        EmailId: this.state.emailID,
        comingFromPage: "registerEmail",
          SSO:'SSO'
      });
    }
  }
  render() {
    const INJECTED_JAVASCRIPT = `(function() {
      window.ReactNativeWebView.postMessage(JSON.stringify("test"));
  })();`;
    return (
      <WebView
        style={{ flex: 1 }}
        source={/*PolicyHTML*/ { uri: this.state.ssoLoginURL }}
        // source={{ uri: 'https://rmmspqa.routematic.com/content/assert.html' }}
        // injectedJavaScript={INJECTED_JAVASCRIPT}
        // onMessage={this.handleMessage}
        ignoreSslError={true}
        onMessage={m => this.onMessage1(m)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        renderLoading={this.renderLoader}
        onShouldStartLoadWithRequest={() => true}
        javaScriptEnabledAndroid={true}
        startInLoadingState={true}
        cacheEnabled={false}
        cookiesEnabled={false}
        thirdPartyCookiesEnabled={false}
        onError={() => Alert.show("Login Error", "Something went wrong")}
      />

    );
  }
  handleMessage = (event) => {
    console.warn('handle message')
    let msgData;
    try {
        msgData = JSON.parse(event.nativeEvent.data);
        console.warn('WebViewLeaf : received message: '+ event.nativeEvent.data)
    } catch (err) {
      console.log('error',err);
    }
};

  renderLoader() {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column"
        }}
      >
        <ActivityIndicator size="large" color={colors.BLACK} />
        <Text style={{ fontWeight: "700", fontSize: 20, color: colors.BLACK }}>
          Please Wait...
        </Text>
      </View>
    );
  }
}

SSOLogin.propTypes = {};

export default SSOLogin;
