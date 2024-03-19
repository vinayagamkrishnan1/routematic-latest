import React, { Component } from "react";
import {  ActivityIndicator,SafeAreaView,ScrollView,StyleSheet,Text, View } from "react-native";
import {WebView} from "react-native-webview";
import * as Alert from "../../utils/Alert";
import { asyncString, loginString } from "../../utils/ConstantString";
import { CryptoXor } from "crypto-xor";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../utils/Colors";
import CookieManager from "@react-native-cookies/cookies";
var he = require("he");
import * as Toast from "../../utils/Toast";

// MS Intune start
import { MSALResult, MSALWebviewParams } from 'react-native-msal';
import { B2CClient } from '../../MSALAuth/b2cClient';
import { b2cConfig, b2cScopes as scopes, initialToken } from '../../MSALAuth/msalConfig';
import { API } from "../../network/apiFetch/API";
import { URL } from "../../network/apiConstants";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import { TYPE } from "../../model/ActionType";

const b2cClient = new B2CClient(b2cConfig);

// const [authResult, setAuthResult] = React.useState<MSALResult | null>(null);
// const [iosEphemeralSession, setIosEphemeralSession] = React.useState(false);
const webviewParameters: MSALWebviewParams = {
    ios_prefersEphemeralWebBrowserSession: false, // iosEphemeralSession,
};
// end

class IntuneLogin extends Component {

  state = {
    isLoading: false,
    domainName: "",
    emailID: "",
    authResult: null,
    iosEphemeralSession: false
  };

  UNSAFE_componentWillMount() {
    this.setState({isLoading: true});
    const { navigation, route } = this.props;
    console.warn('intune login param - ', route.params);
    const domainName = route.params.domainName ? route.params.domainName : null;
    const emailID = route.params.emailID ? route.params.emailID : null;
    this.setState({ domainName, emailID });
    console.warn('global._clientId - ', global._clientId);
    this.init();
    CookieManager.clearAll();
  }

  componentDidMount() {
    setTimeout(() => {
      this.handleSignInPress();
      this.setState({isLoading: false})
    }, 1000)
  }

    // MS Intune
    async init() {
      // Toast.show('Init msal');
      console.warn('b2c init');
      try {
        let _b2cConfig = B2CConfiguration = {
          auth: {
            clientId: global._clientId,
            authorityBase: 'https://login.microsoftonline.com/' + global._tenentId,
            policies: {
              signInSignUp: 'B2C_1_SignInUp',
              passwordReset: 'B2C_1_PasswordReset',
              // account_mode :"SINGLE",
              // broker_redirect_uri_registered: true
            },
            redirectUri: Platform.OS === 'android' ? global._androidRedirectURI : global._iosRedirectURI
          },
        };
        console.warn('initClient body - ', _b2cConfig);
        this.setState({initConfig: _b2cConfig});
        b2cClient.initClient(_b2cConfig);
        // Toast.show('Initclient msal');
        await b2cClient.init();
        const isSignedIn = await b2cClient.isSignedIn();
        // Toast.show('Sign in - ' + isSignedIn);
        this.setState({initRes: isSignedIn});
        if (isSignedIn) {
          // setAuthResult(await b2cClient.acquireTokenSilent({ scopes }));
          this.setState({authResult: await b2cClient.acquireTokenSilent({ scopes })});
        }
      } catch (error) {
        console.error(error);
        Toast.show('Init Error : ' + error);
        this.props.navigation.goBack();
        this.setState({initError: error});
      }
  }

  handleSignInPress = async () => {
      try {
        // Toast.show('signin msal');
          console.warn('signin');
        const res = await b2cClient.signIn({ scopes, webviewParameters });
        // console.warn('signin res - ', res);
        // Toast.show('sign res msal -> ' + res);
      //   setAuthResult(res);
        this.setState({isLoading: true, authResult: res});
        API.newFetchJSON(
          URL.MSAL_LOGIN_API,
          res,
          false,
          this.callback,
          TYPE.MSAL_LOGIN
        );
      } catch (error) {
        console.warn(error);
        this.setState({isLoading: true});
        var err = JSON.stringify(error)
        if (err.includes('android.content.IntentFilter')) {
          Alert.show("Please install the Microsoft Edge browser app");
        }
        Toast.show(err);
        this.props.navigation.goBack();
        this.setState({signinError: error});
      }
  
      // try {
      //   const resut = await initialToken();
      //   console.log("___2", JSON.stringify(resut));
      //   // Alert.alert("RESULT" + JSON.stringify(resut));
      //   setAuthResult(resut);
      // } catch (error: any) {
      //   console.log("___3", JSON.stringify(error));
      //   Alert.alert("ERROR" + JSON.stringify(error));
      // }
  
    };
  
    callback = async (actionType, response, copyDataObj) => {
      console.warn(actionType, response, copyDataObj);
      switch (actionType) {
          case TYPE.MSAL_LOGIN: {
              handleResponse.loginMSAL(response, this);
              break;
          }
      }
    };

    handleAcquireTokenPress = async () => {
      try {
        const res = await b2cClient.acquireTokenSilent({ scopes, forceRefresh: true });
      //   setAuthResult(res);
      this.setState({authResult: res});
      } catch (error) {
        console.warn(error);
      }
    };
  
    handleSignoutPress = async () => {
      try {
        await b2cClient.signOut();
      //   setAuthResult(null);
      this.setState({authResult: null});
      } catch (error) {
        console.warn(error);
      }
    };

  // MS Intune END

  render() {
    // if (this.state.isLoading) 
    return this.renderLoader();
    // return (
    //   <SafeAreaView style={styles.container}>
    //   <ScrollView style={styles.scrollView}>
    //     <Text style={{color: colors.BLACK}}>INIT CNF : {JSON.stringify(this.state.initConfig, null, 2)}</Text>
    //     <Text style={{color: colors.BLACK}}>INIT RES : {JSON.stringify(this.state.initRes, null, 2)}</Text>
    //     <Text style={{color: colors.BLACK}}>INIT ERROR : {JSON.stringify(this.state.initError, null, 2)}</Text>
    //     <Text style={{color: colors.BLACK}}>SIGN RES : {JSON.stringify(this.state.authResult, null, 2)}</Text>
    //     <Text style={{color: colors.BLACK}}>SIGN ERROR : {JSON.stringify(this.state.signinError, null, 2)}</Text>
    //   </ScrollView>
    // </SafeAreaView>
    // );
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
          flex: 1,
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

IntuneLogin.propTypes = {};

export default IntuneLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '1%',
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: '1%',
    margin: '-0.5%',
  },
  button: {
    backgroundColor: 'aliceblue',
    borderWidth: 1,
    margin: '0.5%',
    padding: 8,
    width: '49%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ddd',
  },
  switchButton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 4,
    margin: '0.5%',
    width: '99%',
  },
  scrollView: {
    borderWidth: 1,
    padding: 1,
  },
});