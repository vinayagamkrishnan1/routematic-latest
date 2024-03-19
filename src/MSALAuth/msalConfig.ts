import { Platform } from 'react-native';
import { MSALAndroidConfigOptions } from 'react-native-msal';
import type { B2CConfiguration } from './b2cClient';
import PublicClientApplication from 'react-native-msal';

const resourceUri = 'https://graph.microsoft.com/User.Read';
const authority = 'https://login.microsoftonline.com/';

// let _clientId = '' // '73bafdb3-a9a9-429a-aa1f-e434d195d66c';
// let _tenentId = '' // '90b92f5f-79c4-4fa9-9eea-7265479e6271';
// let _androidRedirectURI = '' // 'msauth://com.eygsl.cbs.routematicqa/pKLmhyA0HEMLOig6q6sLrvpEOUI=';
// let _iosRedirectURI = '' // 'msauth.com.eygsl.cbs.routematicqa://auth';

const androidOptions: MSALAndroidConfigOptions = {
  authorization_user_agent: 'DEFAULT',
  broker_redirect_uri_registered: true,
  multiple_clouds_supported: false
}

export const b2cConfig: B2CConfiguration = {
  auth: {
    clientId: global._clientId,
    authorityBase: authority + global._tenentId,
    policies: {
      signInSignUp: 'B2C_1_SignInUp',
      passwordReset: 'B2C_1_PasswordReset',
      // account_mode :"SINGLE",
      // broker_redirect_uri_registered: true
    },
    redirectUri: Platform.OS === 'android' ? global._androidRedirectURI : global._iosRedirectURI
  },
  // web only:
  // cache: { cacheLocation: 'localStorage' },
  // androidConfigOptions: androidOptions,
};

export const b2cScopes = ['User.read'];

// import AsyncStorage from '@react-native-community/async-storage';
// import Msintune from 'react-native-msintune';

export const initialToken = async () => {
  const config: B2CConfiguration = {
    auth: {
      clientId: global._clientId,
      authorityBase: authority + global._tenentId,
      policies: {
        signInSignUp: 'B2C_1_SignInUp',
        passwordReset: 'B2C_1_PasswordReset',
      },
      // broker_redirect_uri_registered: true,
    },
    androidConfigOptions: {
      authorization_user_agent: 'DEFAULT',
      broker_redirect_uri_registered: true,
      // account_mode: "MULTIPLE"
    }
  };
  const pca: any = new PublicClientApplication(config);
  try {
    await pca.init();
    try {
      console.log('pca', pca);
      console.log('PCAAccounts', await pca.getAccounts());
    } catch (error) {
      console.log('PCAAccounts Error', error);
    }
    if (pca.isInitialized) {
      try {
        const params = {
          scopes: Platform.OS === 'android' ? ["User.read"] : ["User.read"],
          clientId: global._clientId,
          authority: authority + global._tenentId
        };
        const result = await pca.acquireToken(params);
        console.log('result>>>>>>', result);
        // try {
        //   Msintune.initializeInTuneSDK(
        //     result.account.identifier,
        //     clientId,
        //     result.tenantId,
        //     result.accessToken,
        //     (res) => {
        //       console.log('Msintune success');
        //     },
        //     (err) => {
        //       console.log('Msintune failed', err.message);
        //     },
        //   );
        //   setAuthDetails(authDetails);
        //   await SetStoreData(IS_USER_LOGGEDIN, 'yes');
        //   return authDetails;
        // } catch (err) {
        //   // pca.signOut();
        // }
        // return authDetails;
        return result;
      } catch (err) {
        console.log('React Reference App', err);
        pca.signOut();
      }
    }
  } catch (err) {
    console.log('React Reference App???????', '' + err);
    pca.signOut();
  }
};
