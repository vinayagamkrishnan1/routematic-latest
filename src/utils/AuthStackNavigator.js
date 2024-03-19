import React from "react";
import {createStackNavigator} from "@react-navigation/native";
import {StyleSheet} from "react-native";
import Login from "../screens/login/Login";
import SSOEmail from "../screens/login/SSOEmail";
import SSOLogin from "../screens/login/SSOLogin";
import RegisterEmail from "../screens/registerAccount/RegisterEmail";
import OTP from "../screens/registerAccount/OTP";
import ForgotPassword from "../screens/forgetPassword/ForgotPassword";
import SetPIN from "../screens/registerAccount/SetPin";
import MapPicker from "../features/MapPicker";
import UserMandatoryData from "../screens/registerAccount/UserMandatoryData";
import PickupLocationSelector from "../screens/registerAccount/PickupLocationSelector";
import DropLocationSelector from "../screens/registerAccount/DropLocationSelector";
import GenderSelector from "../screens/registerAccount/GenderSelector";

const AuthStackNavigator = createStackNavigator(
    {
        Login: {screen: Login},
        RegisterEmail: {screen: RegisterEmail},
        OTP: {screen: OTP},
        SetPIN: {screen: SetPIN},
        ForgotPassword: {screen: ForgotPassword},
        MapPicker: {screen: MapPicker},
        SSOLogin: {screen: SSOLogin},
        SSOEmail: {screen: SSOEmail},
        UserMandatoryData: {screen: UserMandatoryData},
        PickupLocationSelector: {screen: PickupLocationSelector},
        DropLocationSelector: {screen: DropLocationSelector},
        GenderSelector:{screen:GenderSelector}
        // LoginScreen: { screen: LoginScreen }
    },
    {
        initialRouteName: "SSOEmail" //'SSOEmail'
    }
);

export default AuthStackNavigator;
