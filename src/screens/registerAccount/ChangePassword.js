import React, {Component} from "react";
import {
    Alert,
    Image,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    ScrollView,
    TouchableWithoutFeedback,
    View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Button, Container, Input, Text} from "native-base";
import Ionicons from "react-native-vector-icons/Ionicons";
import {URL} from "../../network/apiConstants/index";
import {styles} from "../../commonStyles/Styles";
import {API} from "../../network/apiFetch/API";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import {asyncString, setupPassword} from "../../utils/ConstantString";
import {spinner} from "../../network/loader/Spinner";
import {colors} from "../../utils/Colors";
import { CryptoXor } from "crypto-xor";

const timer = require("react-native-timer");
let passwordValidator = require("password-validator");
let passwordSchema = new passwordValidator();
// Add properties to Password
passwordSchema
    .is()
    .min(8) // Minimum length 8
    .is()
    .max(20) // Maximum length 20
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .symbols() // Must have Symbols
    .has()
    .not()
    .spaces(); // Should not have spaces

class ChangePassword extends Component {
    static navigationOptions = {
        title: "Change Password",
        headerTitleStyle: {fontFamily: "Roboto"}
    };
    //Loader State Handle Call From Loader
    onUpdate = () => {
        this.setState({
            isLoading: false,
            otpValidated: false
        });
    };

    constructor(props) {
        super(props);
        this.state = {
            oldPassword: "",
            password: "",
            confirmPassword: "",
            isLoading: false,
            comingFromPage: "",
            validPassword: false,
            inValidPassword: false,
            validOldPassword: false,
            inValidOldPassword: false,
            UserId: "",
            access_token: "",
            DToken: "",
            CustomerUrl: ""
        };
    }

    _goback() {
        const {goBack} = this.props.navigation;
        setTimeout(function () {
            goBack();
        }, 500);
    }

    componentDidMount() {
        AsyncStorage.multiGet(
            [
                asyncString.ACCESS_TOKEN,
                asyncString.USER_ID,
                asyncString.DTOKEN,
                asyncString.CAPI
            ],
            (err, savedData) => {
                this.setState({
                    access_token: CryptoXor.decrypt(savedData[0][1], asyncString.ACCESS_TOKEN),
                    UserId: savedData[1][1],
                    DToken: savedData[2][1],
                    CustomerUrl: savedData[3][1]
                });
            }
        );
    }

    oldPasswordChangeHandler(text) {
        if (text) {
            this.setState({
                oldPassword: text,
                validOldPassword: passwordSchema.validate(text),
                inValidOldPassword: !passwordSchema.validate(text)
            });
        } else {
            this.setState({
                oldPassword: text,
                validOldPassword: false,
                inValidOldPassword: false
            });
        }
    }

    passwordChangeHandler(text) {
        if (text) {
            this.setState({
                password: text,
                validPassword: passwordSchema.validate(text),
                inValidPassword: !passwordSchema.validate(text)
            });
        } else {
            this.setState({
                password: text,
                validPassword: false,
                inValidPassword: false
            });
        }
    }

    confirmPasswordChangeHandler(text) {
        if (text) {
            this.setState({
                confirmPassword: text,
                validConfirmPassword: passwordSchema.validate(text),
                inValidConfirmPassword: !passwordSchema.validate(text)
            });
        } else {
            this.setState({
                confirmPassword: text,
                validConfirmPassword: false,
                inValidConfirmPassword: false
            });
        }
    }

    setPassword(oldPassword, password, confirmPassword) {
        if (!oldPassword) {
            Alert.alert("Change Password", "Old Password cannot be blank");
            //this.passwordTextInput._root.focus();
        } else if (!this.state.validOldPassword) {
            Alert.alert("Change Password", "Old password is invalid");
            //this.passwordTextInput._root.focus();
        } else if (!password) {
            Alert.alert("Change Password", setupPassword.passwordBlank);
            //this.passwordTextInput._root.focus();
        } else if (!this.state.validPassword) {
            Alert.alert("Change Password", setupPassword.passwordInvalid);
            //this.passwordTextInput._root.focus();
        } else if (!confirmPassword) {
            Alert.alert("Change Password", setupPassword.confirmPasswordBlank);
            //this.confirmPasswordTextInput._root.focus();
        } else if (!this.state.validConfirmPassword) {
            Alert.alert("Change Password", setupPassword.confirmPasswordInvalid);
            //this.confirmPasswordTextInput._root.focus();
        } else if (this.state.oldPassword === this.state.password) {
            Alert.alert(
                "Change Password",
                "Old password and new password should not be same, Please try again"
            );
        } else if (this.state.password === this.state.confirmPassword) {
            //Check if Token has data means user is coming from "Forget Password?"
            let body = {
                NewPassword: this.state.password,
                UserId: this.state.UserId,
                DToken: this.state.DToken,
                OldPassword: this.state.oldPassword
            };
            this.setState({isLoading: true});
            let response = API.fetchJSON(
                this.state.CustomerUrl + URL.CHANGE_PASSWORD,
                body,
                this.state.access_token
            );
            if (response) handleResponse.changePassword(response, this);
            else this.setState({isLoading: false});
        } else {
            Alert.alert("Change Password", setupPassword.donotMatch);
        }
    }

    render() {
        const {
            oldPassword,
            password,
            confirmPassword,
            validOldPassword,
            inValidOldPassword,
            validPassword,
            inValidPassword,
            validConfirmPassword,
            inValidConfirmPassword
        } = this.state;

        return (
            <View
                style={{
                    flex: 1, 
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    backgroundColor: colors.WHITE
            }}>

            <TouchableWithoutFeedback
                onPress={() => {
                    Keyboard.dismiss();
                }}
                onPressIn={() => {
                    Keyboard.dismiss();
                }}
                onPressOut={() => {
                    Keyboard.dismiss();
                }}
            >
                <View style={{flex: 1, backgroundColor: colors.WHITE, marginHorizontal: 32}}>
                        {spinner.visible(this.state.isLoading)}
                        <StatusBar barStyle="dark-content"/>
                        {/* <KeyboardAvoidingView style={{flex: 1}} behavior="padding" enabled> */}
                        <ScrollView style={{flex: 1}}>
                            <View
                                style={{
                                    justifyContent: "flex-start",
                                    alignItems: "center",
                                    padding: 40,
                                }}
                            >
                                <View
                                    success={validOldPassword}
                                    error={inValidOldPassword}
                                    style={[styles.inputText,{marginBottom:20}]}
                                >
                                    <Ionicons
                                        name="md-lock-closed"
                                        style={styles.vectorIconBlack}
                                    />
                                    <Input
                                        placeholder={setupPassword.oldEnterPassword}
                                        ref={input => {
                                            this.oldPasswordTextInput = input;
                                        }}
                                        style={{flex: 1, color: colors.BLACK, height: 50}}
                                        underlineColorAndroid="transparent"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        numberOfLines={1}
                                        fontSize={16}
                                        returnKeyType="done"
                                        secureTextEntry={true}
                                        onChangeText={text => this.oldPasswordChangeHandler(text)}
                                        value={oldPassword}
                                        onSubmitEditing={() => {
                                            //this.setPassword(password, confirmPassword);
                                            this.passwordTextInput.focus();
                                        }}
                                    />
                                </View>

                                <View
                                    success={validPassword}
                                    error={inValidPassword}
                                    style={[styles.inputText,{marginBottom:20}]}
                                >
                                    <Ionicons
                                        name="md-lock-closed"
                                        style={styles.vectorIconBlack}
                                    />
                                    <Input
                                        placeholder={setupPassword.newEnterPassword}
                                        ref={input => {
                                            this.passwordTextInput = input;
                                        }}
                                        style={{flex: 1, color: colors.BLACK, height: 50}}
                                        underlineColorAndroid="transparent"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        numberOfLines={1}
                                        fontSize={16}
                                        returnKeyType="done"
                                        secureTextEntry={true}
                                        onChangeText={text => this.passwordChangeHandler(text)}
                                        value={password}
                                        onSubmitEditing={() => {
                                            //this.setPassword(password, confirmPassword);
                                            this.confirmPasswordTextInput.focus();
                                        }}
                                    />
                                </View>

                                <View
                                    success={validConfirmPassword}
                                    error={inValidConfirmPassword}
                                    style={styles.inputText}
                                >
                                    <Ionicons
                                        name="md-lock-closed"
                                        style={styles.vectorIconBlack}
                                    />
                                    <Input
                                        placeholder={setupPassword.newConfirmEnterPassword}
                                        ref={input => {
                                            this.confirmPasswordTextInput = input;
                                        }}
                                        style={{flex: 1, color: colors.BLACK, height: 50}}
                                        underlineColorAndroid="transparent"
                                        autoCapitalize="none"
                                        numberOfLines={1}
                                        fontSize={16}
                                        autoCorrect={false}
                                        returnKeyType="done"
                                        secureTextEntry={true}
                                        onChangeText={text => this.confirmPasswordChangeHandler(text)}
                                        value={confirmPassword}
                                        onSubmitEditing={() => {
                                            //this.setPassword(password, confirmPassword);
                                        }}
                                    />
                                </View>
                                <View
                                    style={[
                                        styles.buttonSmallLayout,
                                        {
                                            alignItems: "center",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignContent: "center",
                                            paddingLeft: 20,
                                            paddingRight: 20
                                        }
                                    ]}
                                >
                                    <Button
                                        danger
                                        style={{
                                            width: "45%",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            backgroundColor: colors.RED
                                        }}
                                        onPress={() => this._goback()}
                                    >
                                        <Text>CANCEL</Text>
                                    </Button>
                                    <Button
                                        success
                                        style={{
                                            width: "45%",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            backgroundColor: colors.GREEN
                                        }}
                                        onPress={() =>
                                            this.setPassword(oldPassword, password, confirmPassword)
                                        }
                                    >
                                        <Text>DONE</Text>
                                    </Button>
                                </View>
                            </View>
                            </ScrollView>
                        {/* </KeyboardAvoidingView> */}
                </View>
            </TouchableWithoutFeedback>
            </View>
        );
    }
}

export default ChangePassword;
