/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect } from "react";
import 'react-native-gesture-handler';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
} from 'react-native';

import {
  Colors,
  Header,
} from 'react-native/Libraries/NewAppScreen';
import {Text, View, LogBox, AppState, Alert, Linking} from "react-native";
import FlashMessage from "react-native-flash-message";
import Pushy from "pushy-react-native";
import codePush from "react-native-code-push";
import {Provider} from "mobx-react";
// import AuthLoadingScreen from "./src/utils/AuthLoadingScreen";
// import NavigationService from "./src/utils/NavigationService";
import  MyStore from './src/stores/MyTripsStore';
import HomeStore from "./src/stores/HomeStore";
import RosterStore from "./src/stores/rosterRuleStore";
import TrackVehicleStore from './src/stores/TrackVehicleStore';
import AdhocStore from './src/stores/AdhocStore';
import FeedBackStore from './src/stores/FeedBackStore';
import modifiedAdHocStore from './src/stores/modifiedAdHocStore';
import CovidStore from './src/stores/CovidStore';
import SplashScreen from "react-native-splash-screen";
import remoteConfig from '@react-native-firebase/remote-config';
import VersionNumber from "react-native-version-number";
import Navigation from "./src/navigation/config/navigation";
import FixedRouteStore from "./src/stores/FixedRouteStore";

// class App extends React.Component {

//   state = {
//     appState: AppState.currentState,
//   };

//   constructor() {
//     super();
//     console.warn('Constructor loading');
//     global.HQT_DURATION = 5;
//     global.googleApiDuration = 45;
//   }

//   _handleAppStateChange = (nextAppState) => {
//     console.warn('_handleAppStateChange loading');
//     if (
//       this.state.appState.match(/inactive|background/) &&
//       nextAppState === 'active'
//     ) {
//       this.fetchRemoteConfig();
//     }
//     this.setState({ appState: nextAppState });
//   };

//   componentDidMount() {
//     console.warn('componentDidMount loading');
//     Pushy.listen();

//     AppState.addEventListener('change', this._handleAppStateChange);
//     SplashScreen.hide();
//   }

//   componentWillUnmount() {
//     console.warn('componentWillUnmount loading');
//     AppState.removeEventListener('change', this._handleAppStateChange);
//   }

//   async fetchRemoteConfig() {
//     console.warn('fetchRemoteConfig loading');
//     await remoteConfig().fetch(0);
//     setTimeout(() => {
//       const activated = remoteConfig().activate();
//       if (activated) {
//         let remoteConfigVal = {
//           latestVersion: 0,
//           isForceUpdate: false,
//           storeUrlAndroid: "",
//           storeUrlIos: "",
//           updateTitle: "",
//           updateDescription: "",
//           skipBuildNumber: 0,
//           hqtDuration: 7,
//           google_api_key_android: "",
//           directionsAdvancedEnabled: 1,
//           directionAPIDuration: 60,
//           latestIosVersion: 0,
//           skipBuildNumberIos: 0,
//           car_icon: "https://apk.routematic.com/icons/ic_car.png",
//           bus_icon: "https://apk.routematic.com/icons/ic_bus.png"
//         };
//         remoteConfigVal.storeUrlAndroid = remoteConfig().getValue('force_update_store_url_android').value;
//         remoteConfigVal.storeUrlIos = remoteConfig().getValue('force_update_store_url_ios').value;
//         remoteConfigVal.latestVersion = remoteConfig().getValue('latest_version').value;
//         remoteConfigVal.latestIosVersion = remoteConfig().getValue('latest_version_ios').value;
//         remoteConfigVal.updateTitle = remoteConfig().getValue('update_title').value;
//         remoteConfigVal.updateDescription = remoteConfig().getValue('update_description').value;
//         remoteConfigVal.isForceUpdate = remoteConfig().getValue('force_update_required').value;
//         remoteConfigVal.skipBuildNumber = remoteConfig().getValue('skip_build_number').value;
//         remoteConfigVal.skipBuildNumberIos = remoteConfig().getValue('skip_build_number_ios').value;
//         remoteConfigVal.hqtDuration = remoteConfig().getValue('hqt_polling_duration').value;
//         global.HQT_DURATION = parseInt(remoteConfig().getValue('hqt_polling_duration').value);
//         global.AndroidGoogleApiKey = remoteConfig().getValue('google_api_key_android').value;
//         global.directionApiConfig = remoteConfig().getValue('directions_advanced_api_enabled').value;
//         global.directionApiDuration = remoteConfig().getValue('direction_API_duration').value;
//         global.carIcon = remoteConfig().getValue('car_icon').value;
//         global.busIcon = remoteConfig().getValue('bus_icon').value;
//         this.checkForUpdate(remoteConfigVal);
//       }
//     }, 4000)

//     //await crashlytics.crashlytics().setCrashlyticsCollectionEnabled(true);
//   }

//   checkForUpdate(configVals) {
//     console.warn('checkForUpdate loading');
//     console.warn(configVals.storeUrlAndroid);
//     let currentVersion = VersionNumber.buildVersion;
//     //Alert.alert("storeUrlAndroid "+currentVersion,configVals.storeUrlAndroid);
//     if (Platform.OS === 'ios' ? (currentVersion < configVals.latestIosVersion && currentVersion !== configVals.skipBuildNumberIos) : (currentVersion < configVals.latestVersion && currentVersion !== configVals.skipBuildNumber)) {
//       configVals.isForceUpdate === true ?
//         Alert.alert(
//           configVals.updateTitle,
//           configVals.updateDescription,
//           [
//             {
//               text: 'Update',
//               onPress: () => Linking.openURL(Platform.OS === 'ios' ? configVals.storeUrlIos : configVals.storeUrlAndroid)
//             },
//           ],
//           { cancelable: false },
//         ) :
//         Alert.alert(
//           configVals.updateTitle,
//           configVals.updateDescription,
//           [
//             {

//               text: configVals.isForceUpdate ? '' : 'Later',
//               onPress: () => this._bootstrapAsync(),
//               style: 'cancel',
//             },
//             {
//               text: 'Update',
//               onPress: () => Linking.openURL(Platform.OS === 'ios' ? configVals.storeUrlIos : configVals.storeUrlAndroid)
//             },
//           ],
//           { cancelable: false },
//         );
//     }
//   }

//     render() {
//         return (
//             <Provider
//             >
//                 {/* myStore={MyStore}
//                 homeStore={HomeStore}
//                 rosterStore={RosterStore}
//                 trackVehicleStore={TrackVehicleStore}
//                 adhocStore={AdhocStore}
//                 feedbackStore={FeedBackStore}
//                 mAdHocStore={modifiedAdHocStore}
//                 covidStore={CovidStore} */}
//                 <View style={{flex: 1}}>
//                     <AuthLoadingScreen
//                         ref={navigatorRef => {
//                             NavigationService.setTopLevelNavigator(navigatorRef);
//                         }}
//                     />
//                     <FlashMessage position="top"/>
//                 </View>
//             </Provider>
//         );
//     }
// }

fetchRemoteConfig = async () => {
  console.warn('fetchRemoteConfig loading');
  await remoteConfig().fetch(0);
  setTimeout(() => {
    const activated = remoteConfig().activate();
    if (activated) {
      let remoteConfigVal = {
        latestVersion: 0,
        isForceUpdate: false,
        storeUrlAndroid: "",
        storeUrlIos: "",
        updateTitle: "",
        updateDescription: "",
        skipBuildNumber: 0,
        hqtDuration: 7,
        google_api_key_android: "",
        directionsAdvancedEnabled: 1,
        directionAPIDuration: 60,
        latestIosVersion: 0,
        skipBuildNumberIos: 0,
        car_icon: "https://apk.routematic.com/icons/ic_car.png",
        bus_icon: "https://apk.routematic.com/icons/ic_bus.png"
      };
      remoteConfigVal.storeUrlAndroid = remoteConfig().getValue('force_update_store_url_android').asString();
      remoteConfigVal.storeUrlIos = remoteConfig().getValue('force_update_store_url_ios').asString();
      remoteConfigVal.latestVersion = remoteConfig().getValue('latest_version').asNumber();
      remoteConfigVal.latestIosVersion = remoteConfig().getValue('latest_version_ios').asNumber();
      remoteConfigVal.updateTitle = remoteConfig().getValue('update_title').asString();
      remoteConfigVal.updateDescription = remoteConfig().getValue('update_description').asString();
      remoteConfigVal.isForceUpdate = remoteConfig().getValue('force_update_required').asBoolean();
      remoteConfigVal.skipBuildNumber = remoteConfig().getValue('skip_build_number').asNumber();
      remoteConfigVal.skipBuildNumberIos = remoteConfig().getValue('skip_build_number_ios').asNumber();
      remoteConfigVal.hqtDuration = remoteConfig().getValue('hqt_polling_duration').asNumber();
      global.HQT_DURATION = parseInt(remoteConfig().getValue('hqt_polling_duration').asNumber());
      global.AndroidGoogleApiKey = remoteConfig().getValue('google_api_key_android').asString();
      global.directionApiConfig = remoteConfig().getValue('directions_advanced_api_enabled').asString();
      global.directionApiDuration = remoteConfig().getValue('direction_API_duration').asNumber();
      global.carIcon = remoteConfig().getValue('car_icon').asString();
      global.busIcon = remoteConfig().getValue('bus_icon').asString();
      this.checkForUpdate(remoteConfigVal);
    }
  }, 4000)

  //await crashlytics.crashlytics().setCrashlyticsCollectionEnabled(true);
}

checkForUpdate = (configVals) => {
  console.warn('checkForUpdate loading');
  console.warn(configVals.storeUrlAndroid);
  let currentVersion = VersionNumber.buildVersion;
  //Alert.alert("storeUrlAndroid "+currentVersion,configVals.storeUrlAndroid);
  if (Platform.OS === 'ios' ? (currentVersion < configVals.latestIosVersion && currentVersion !== configVals.skipBuildNumberIos) : (currentVersion < configVals.latestVersion && currentVersion !== configVals.skipBuildNumber)) {
    configVals.isForceUpdate === true ?
      Alert.alert(
        configVals.updateTitle,
        configVals.updateDescription,
        [
          {
            text: 'Update',
            onPress: () => Linking.openURL(Platform.OS === 'ios' ? configVals.storeUrlIos : configVals.storeUrlAndroid)
          },
        ],
        { cancelable: false },
      ) :
      Alert.alert(
        configVals.updateTitle,
        configVals.updateDescription,
        [
          {

            text: configVals.isForceUpdate ? '' : 'Later',
            onPress: () => {
              // this._bootstrapAsync()
            },
            style: 'cancel',
          },
          {
            text: 'Update',
            onPress: () => Linking.openURL(Platform.OS === 'ios' ? configVals.storeUrlIos : configVals.storeUrlAndroid)
          },
        ],
        { cancelable: false },
      );
  }
}

const App = () => {

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    console.warn('component did mount in useeffect');
    Pushy.listen();
    SplashScreen.hide();

    this.fetchRemoteConfig();   
  }, []);

  // return (
  //   <SafeAreaView style={backgroundStyle}>
  //     <StatusBar
  //       barStyle={isDarkMode ? 'light-content' : 'dark-content'}
  //       backgroundColor={backgroundStyle.backgroundColor}
  //     />
  //     <ScrollView
  //       contentInsetAdjustmentBehavior="automatic"
  //       style={backgroundStyle}>
  //       <Header />
  //       <View
  //         style={{
  //           backgroundColor: isDarkMode ? Colors.black : Colors.white,
  //         }}>
  //       </View>
  //     </ScrollView>
  //   </SafeAreaView>
  // );

  return (
    <Provider
    myStore={MyStore}
    homeStore={HomeStore}
    rosterStore={RosterStore}
    trackVehicleStore={TrackVehicleStore}
    feedbackStore={FeedBackStore}
    adhocStore={AdhocStore}
    mAdHocStore={modifiedAdHocStore}
    fixedRouteStore={FixedRouteStore}
    >
        {/* 
      covidStore={CovidStore}
         */}
        <View style={{flex: 1}}>
            <Navigation />

            <FlashMessage position="top"/>
        </View>
    </Provider>
  );
};

LogBox.ignoreLogs(["Class RCTCxxModule"]);
LogBox.ignoreLogs(["Setting a timer"]);
LogBox.ignoreLogs(["Deprecation warning"]);
LogBox.ignoreLogs([
  'Require cycle:'
])
LogBox.ignoreLogs([
  "Warning: isMounted(...) is deprecated",
  "Module RCTImageLoader"
]);

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.IMMEDIATE,
  mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
  minimumBackgroundDuration:5
};

export default codePush(codePushOptions)(App);
