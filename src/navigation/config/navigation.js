import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import Loading from '../screens/Loading';

import {
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colors} from '../../utils/Colors';
import {asyncString} from '../../utils/ConstantString';
import {NativeBaseProvider} from 'native-base';
import {SafeAreaProvider} from 'react-native-safe-area-view';

import {AuthContext} from '../components/context';

import AppStackScreen from '../navigator/AppStackScreen';
import SSOEmail from '../../screens/login/SSOEmail';
import SSOLogin from '../../screens/login/SSOLogin';
import Login from '../../screens/login/Login';
import OTP from '../../screens/registerAccount/OTP';
import RegisterEmail from '../../screens/registerAccount/RegisterEmail';
import SetPin from '../../screens/registerAccount/SetPin';
import UserMandatoryData from '../../screens/registerAccount/UserMandatoryData';
import PickupLocationSelector from '../../screens/registerAccount/PickupLocationSelector';
import DropLocationSelector from '../../screens/registerAccount/DropLocationSelector';
import GenderSelector from '../../screens/registerAccount/GenderSelector';
import ForgotPassword from '../../screens/forgetPassword/ForgotPassword';
import MapPicker from '../../features/MapPicker';
import IntuneLogin from '../../screens/login/IntuneLogin';
import { CryptoXor } from 'crypto-xor';

const AuthStack = createStackNavigator();
const AuthStackScreen = () => (
  <AuthStack.Navigator
    initialRouteName="SSOEmail"
    screenOptions={{
      // header: props => <AuthStackAppbar {...props} />,
      headerStyle: styles.headerStyle,
    }}>
    <AuthStack.Screen
      name="SSOEmail"
      component={SSOEmail}
      options={{headerShown: false}}
    />
    <AuthStack.Screen
      name="SSOLogin"
      component={SSOLogin}
      options={{headerShown: false}}
    />
    <AuthStack.Screen
      name="IntuneLogin"
      component={IntuneLogin}
      options={{headerShown: false}}
    />
    <AuthStack.Screen
      name="Login"
      component={Login}
      options={{headerShown: false}}
    />
    <AuthStack.Screen
      name="RegisterEmail"
      component={RegisterEmail}
      options={{headerShown: false, title: 'RegisterEmail'}}
    />
    <AuthStack.Screen
      name="OTP"
      component={OTP}
      options={{headerShown: false, title: 'Verify OTP'}}
    />
    <AuthStack.Screen
      name="SetPIN"
      component={SetPin}
      options={{headerShown: false, title: 'SetPIN'}}
    />
    <AuthStack.Screen
      name="ForgotPassword"
      component={ForgotPassword}
      options={{headerShown: false, title: 'ForgotPassword'}}
    />
    <AuthStack.Screen
      name="UserMandatoryData"
      component={UserMandatoryData}
      options={{headerShown: false, title: 'UserMandatoryData'}}
    />
    <AuthStack.Screen
      name="PickupLocationSelector"
      component={PickupLocationSelector}
      options={{headerShown: false, title: 'PickupLocationSelector'}}
    />
    <AuthStack.Screen
      name="DropLocationSelector"
      component={DropLocationSelector}
      options={{headerShown: false, title: 'DropLocationSelector'}}
    />
    <AuthStack.Screen
      name="GenderSelector"
      component={GenderSelector}
      options={{headerShown: false, title: 'GenderSelector'}}
    />
    <AuthStack.Screen
      name="MapPicker"
      component={MapPicker}
      options={{headerShown: false, title: 'MapPicker'}}
    />
  </AuthStack.Navigator>
);

const RootStack = createStackNavigator();
const RootStackScreen = ({userToken, language}) => {
  console.warn('RootStackScreen token->>> ', userToken);
  return (
    <RootStack.Navigator
      initialRouteName={userToken ? 'App' : 'Auth'}
      screenOptions={{headerShown: false}}>
      <RootStack.Screen name="Auth" component={AuthStackScreen} />
      <RootStack.Screen name="App" component={AppStackScreen} />
    </RootStack.Navigator>
  );
};

const Navigation = () => {

  const initialLoginState = {
    isLoading: true,
    userName: null,
    userToken: null,
  };

  const loginReducer = (prevState, action) => {
    switch (action.type) {
      case 'RETRIEVE_TOKEN':
        return {
          ...prevState,
          userToken: action.token,
          isLoading: false,
        };
      case 'LOGIN':
        return {
          ...prevState,
          userName: action.id,
          userToken: action.token,
          isLoading: false,
        };
      case 'LOGOUT':
        return {
          ...prevState,
          userName: null,
          userToken: null,
          isLoading: false,
        };
    }
  };

  const [loginState, dispatch] = React.useReducer(
    loginReducer,
    initialLoginState,
  );

  const authContext = React.useMemo(
    () => ({
      signIn: async _userToken => {
        const userToken = String(_userToken);
        const userName = '';
        // try {
        //   await AsyncStorage.setItem('userToken', userToken);
        // } catch(e) {
        //   console.log(e);
        // }
        // console.log('user token: ', userToken);
        dispatch({type: 'LOGIN', id: userName, token: userToken});
      },
      signOut: async () => {
        dispatch({type: 'LOGOUT'});
      },
    }),
    [],
  );

  React.useEffect(() => {
    setTimeout(async () => {
      let userToken;
      userToken = null;
      try {
        var _userToken = await AsyncStorage.getItem(asyncString.ACCESS_TOKEN);
        userToken = CryptoXor.decrypt(
          _userToken,
          asyncString.ACCESS_TOKEN
        );
      } catch (e) {
        console.log(e);
      }
      dispatch({type: 'RETRIEVE_TOKEN', token: userToken});
    }, 1000);
  }, []);

  if (loginState.isLoading) {
    return <Loading />;
  }

  return (
    <NativeBaseProvider>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          <SafeAreaProvider>
            <RootStackScreen userToken={loginState.userToken} />
          </SafeAreaProvider>
        </NavigationContainer>
      </AuthContext.Provider>
    </NativeBaseProvider>
  );
};

export default Navigation;

const styles = StyleSheet.create({
  barIcon: {
    width: 20,
    height: 20,
  },
  barText: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    textAlign: 'center',
    marginTop: 5,
    color: colors.GRAY,
    backgroundColor: 'transparent',
  },
  headerStyle: {
    backgroundColor: '#fff',
    borderBottomColor: '#d4d4d4',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderWidth: 2,
    elevation: 20,
    shadowColor: '#52006A',
    shadowOpacity: 0.5,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
});
