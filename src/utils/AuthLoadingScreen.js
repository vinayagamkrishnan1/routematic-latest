import React from "react";
import {
    ActivityIndicator,
    Alert,
    AppState,
    Image,
    Linking,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {createSwitchNavigator} from "@react-navigation/native";
import AuthStackNavigator from "../utils/AuthStackNavigator";
import AppStackNavigator from "../utils/AppStackNavigator";
import {colors} from "./Colors";
import SplashScreen from "react-native-splash-screen";
import {asyncString} from "./ConstantString";
import  remoteConfig  from '@react-native-firebase/remote-config';
import VersionNumber from "react-native-version-number";
const logo = require("../assets/routematic.png");

class AuthLoadingScreen extends React.Component {
    state = {
        appState: AppState.currentState,
    };

    constructor() {
        super();
        //this._bootstrapAsync();
        global.HQT_DURATION = 5;
        global.googleApiDuration = 45;
        this._bootstrapAsync();
        //this.fetchRemoteConfig();
    }

    _bootstrapAsync = async () => {
        const userToken = await AsyncStorage.getItem(asyncString.ACCESS_TOKEN);
        this.props.navigation.navigate(userToken ? "App" : "Auth");
    };

    _handleAppStateChange = (nextAppState) => {
        if (
            this.state.appState.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
            this.fetchRemoteConfig();
        }
        this.setState({appState: nextAppState});
    };

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
        SplashScreen.hide();
        // Pushy.listen();
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    async fetchRemoteConfig() {
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
                remoteConfigVal.storeUrlAndroid = remoteConfig().getValue('force_update_store_url_android').value;
                remoteConfigVal.storeUrlIos = remoteConfig().getValue('force_update_store_url_ios').value;
                remoteConfigVal.latestVersion = remoteConfig().getValue('latest_version').value;
                remoteConfigVal.latestIosVersion = remoteConfig().getValue('latest_version_ios').value;
                remoteConfigVal.updateTitle = remoteConfig().getValue('update_title').value;
                remoteConfigVal.updateDescription = remoteConfig().getValue('update_description').value;
                remoteConfigVal.isForceUpdate = remoteConfig().getValue('force_update_required').value;
                remoteConfigVal.skipBuildNumber = remoteConfig().getValue('skip_build_number').value;
                remoteConfigVal.skipBuildNumberIos = remoteConfig().getValue('skip_build_number_ios').value;
                remoteConfigVal.hqtDuration = remoteConfig().getValue('hqt_polling_duration').value;
                global.HQT_DURATION = parseInt(remoteConfig().getValue('hqt_polling_duration').value);
                global.AndroidGoogleApiKey = remoteConfig().getValue('google_api_key_android').value;
                global.directionApiConfig = remoteConfig().getValue('directions_advanced_api_enabled').value;
                global.directionApiDuration = remoteConfig().getValue('direction_API_duration').value;
                global.carIcon = remoteConfig().getValue('car_icon').value;
                global.busIcon = remoteConfig().getValue('bus_icon').value;
                this.checkForUpdate(remoteConfigVal);
            }
        }, 4000)

        //await crashlytics.crashlytics().setCrashlyticsCollectionEnabled(true);
    }

    checkForUpdate(configVals) {
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
                    {cancelable: false},
                ) :
                Alert.alert(
                    configVals.updateTitle,
                    configVals.updateDescription,
                    [
                        {

                            text: configVals.isForceUpdate ? '' : 'Later',
                            onPress: () => this._bootstrapAsync(),
                            style: 'cancel',
                        },
                        {
                            text: 'Update',
                            onPress: () => Linking.openURL(Platform.OS === 'ios' ? configVals.storeUrlIos : configVals.storeUrlAndroid)
                        },
                    ],
                    {cancelable: false},
                );
        } else {
            this._bootstrapAsync();
        }
    }

    render() {
        return (
            <View
                style={{
                    justifyContent: "center",
                    alignContent: "flex-start",
                    flex: 1,
                    backgroundColor: colors.BACKGROUND
                }}
            >
                <View style={styles.container}>
                    <Image
                        source={logo}
                        defaultSource={logo}
                        resizeMethod="scale"
                        resizeMode="cover"
                        style={styles.logo}
                    />
                    <ActivityIndicator size={"large"} color={colors.BLACK}/>
                    <Text style={styles.text}>Please wait...</Text>
                    <StatusBar barStyle="default"/>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    logo: {
        height: "70%",
        width: "60%",
        resizeMode: "contain",
        alignItems: "center",
        justifyContent: "center"
    },
    text: {
        color: colors.BLACK
    }
});
export default createSwitchNavigator(
    {
        AuthLoading: AuthLoadingScreen,
        App: AppStackNavigator,
        Auth: AuthStackNavigator
    },
    {
        initialRouteName: "AuthLoading"
    }
);
