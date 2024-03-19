/**
 * Created by @Soumya Ranjan Sethy <soumya.sethy@routematic.com>
 * */
import React, {Component} from "react";
import {
    Alert,
    ActivityIndicator,
    Dimensions,
    Image,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
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
import {asyncString, loginString} from "../../utils/ConstantString";
import {spinner} from "../../network/loader/Spinner";
import {colors} from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import TextDebounce from "../../utils/TextDebounce";
import TouchID from "react-native-touch-id";
import print from "../../utils/Logger";
import * as Keychain from "react-native-keychain";
const logo  = require("../../assets/routematic.png");
const {width, height}= Dimensions.get("window");

const optionalConfigObject = {
    title: "Routematic", //Android
    imageColor: "#e00606", //Android
    imageErrorColor: "#ff0000", //Android
    sensorDescription: "Scan", //Android
    sensorErrorDescription: "Failed", //Android
    cancelText: "Cancel", //Android
    fallbackLabel: "Show Passcode", //iOS (if empty, then label is hidden)
    unifiedErrors: false, //use unified error messages (default false)
    passcodeFallback: false //iOS
};
//Validation for Email/Password
let emailSchema = require("email-validator");
let passwordValidator = require("password-validator");
let passwordSchema = new passwordValidator();
//Add properties to Password
passwordSchema
    .is()
    .min(8) //Minimum length 8
    .is()
    .max(20) //Maximum length 20
    .has()
    .uppercase() //Must have uppercase letters
    .has()
    .lowercase() //Must have lowercase letters
    .has()
    .digits() //Must have digits
    .has()
    .symbols() //Must have Symbols
    .has()
    .not()
    .spaces(); //Should not have spaces

//create a component
class Login extends Component {
    static navigationOptions = {
        title: "Login",
        headerStyle: {display: "none"},
        headerLeft: null
    };
    onUpdate = () => {
        this.setState({
            isLoading: false
        });
    };

    constructor(props) {
        super(props);
        this.state = {
            push_id: "",
            username: "",
            password: "",
            isLoading: false,
            validEmail: false,
            inValidEmail: false,
            validPassword: false,
            inValidPassword: false,
        };
    }

    UNSAFE_componentWillMount() {
        console.warn('Params - ', this.props.route.params);

        let emailID = this.props.route.params.emailID;
        if (emailID)
            this.setState({
                username: emailID,
                validEmail: true
            });
        global.isPushAllowed = false;
    }

    componentWillUnmount() {
        if (this.state.isLoading) this.onUpdate();
    }

    verifyTouchID() {
        Keychain.getGenericPassword()
            .then(credentials => {
                if (
                    credentials &&
                    credentials.hasOwnProperty("username") &&
                    credentials.username
                ) {
                    TouchID.authenticate(
                        "Use touch id authentication to log in",
                        optionalConfigObject
                    )
                        .then(success => {
                            if (success) {
                                const {username, password} = credentials;
                                this.emailChangeHandler(username);
                                this.passwordChangeHandler(password);
                                this.authenticate(username, password);
                            }
                        })
                        .catch(error => {
                            print("Error", error);
                        });
                }
            })
            .catch(error => {
                print("error : ", JSON.stringify(error));
            });
    }

    componentDidMount() {
        TouchID.isSupported()
            .then(biometryType => {
                AsyncStorage.getItem(asyncString.hasEverLoggedIn, (err, result) => {
                    if (result === "Yes") {
                        if (biometryType === "TouchID") {
                            //Touch ID is supported on iOS
                            this.verifyTouchID();
                        } else if (biometryType === true) {
                            //Touch ID is supported on Android
                            this.verifyTouchID();
                        } else if (biometryType === "FaceID") {
                            //Touch ID is supported on iPhoneX
                            this.verifyTouchID();
                        }
                    } else {
                        Keychain.resetGenericPassword();
                    }
                });
            })
            .catch(error => {
                print("error : ", JSON.stringify(error));
            });
    }

    //Handle Text Change Event
    emailChangeHandler(text) {
        if (text) {
            this.setState({
                username: text,
                validEmail: emailSchema.validate(text),
                inValidEmail: !emailSchema.validate(text)
            });
        } else {
            this.setState({
                username: text,
                validEmail: false,
                inValidEmail: false
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

    authenticate(username, password) {
        if (!username) {
            alert(loginString.emailBlank);
        } else if (!this.state.validEmail) {
            alert(loginString.enterValidEmail);
        } else if (!password) {
            alert(loginString.passwordBlank);
        } else if (!this.state.validPassword) {
            alert(loginString.enterValidPassword);
        } else if (this.state.validEmail && this.state.validPassword) {
            let body = {
                grant_type: "password",
                username: username,
                password: password
            };
            this.setState({isLoading: true});
            let loginResponse = API.fetchXFORM(URL.LOGIN_API, body);
            if (loginResponse) handleResponse.login(loginResponse, this, body);
            else {
                this.setState({isLoading: false}, () => {
                    alert(loginString.somethingWentWrong);
                });
            }
        }
    }

    showLoaderScreen() {
        return (
            <View
                style={{
                    justifyContent: "center",
                    alignContent: "flex-start",
                    flex: 1,
                    backgroundColor: colors.BACKGROUND
                }}
            >
                <View style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <Image
                        source={logo}
                        defaultSource={logo}
                        resizeMethod="scale"
                        resizeMode="cover"
                        style={{
                            height: "70%",
                            width: "60%",
                            resizeMode: "contain",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    />
                    <ActivityIndicator size={"large"} color={colors.BLACK}/>
                    <Text style={[styles.text,{color:colors.BLACK}]}>Please wait...</Text>
                    <StatusBar barStyle="default"/>
                </View>
            </View>
        );
    }

    render() {
        const {
            username,
            password,
            validEmail,
            inValidEmail,
            validPassword,
            inValidPassword
        } = this.state;
        if(this.state.isLoading===true){
            return this.showLoaderScreen();
        }
//add input issue sugan
        return (
            <View style={{
                flex: 1,
            }}>
            <ImageBackground
                source={require("../../assets/cp_background.jpg")}
                defaultSource={require("../../assets/cp_background.jpg")}
                style={{
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: height
                }}
            >
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
                                    <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
            }}>

                            <ImageBackground
                                source={require("../../assets/cp_background.jpg")}
                                defaultSource={require("../../assets/cp_background.jpg")}
                                style={{
                                    justifyContent: "center",
                                    alignContent: "center",
                                    flex: 1,
                                    width: '100%'
                                }}
                            >
                                <StatusBar barStyle="light-content"/>
                                {spinner.visible(this.state.isLoading)}
                                <KeyboardAvoidingView
                                    style={{flex: 1}}
                                    // behavior="height"
                                    // enabled
                                >
                                    <View style={styles.loginScreen}>
                                        <View style={styles.top}>
                                            {/*Header */}
                                            <View style={styles.handleMargin}>
                                                <Image
                                                    source={require("../../assets/routematic.png")}
                                                    defaultSource={require("../../assets/routematic.png")}
                                                    resizeMethod="scale"
                                                    resizeMode="cover"
                                                    style={styles.logo}
                                                />
                                            </View>
                                        </View>
                                        <View style={styles.windowLayer}>
                                            {/*Content */}

                                            <Text style={styles.loginTxtUp}>Sign In</Text>

                                            <View
                                                success={validEmail}
                                                error={inValidEmail}
                                                style={styles.inputText}
                                            >
                                                <Ionicons
                                                    name="ios-mail"
                                                    style={styles.vectorIconBlue}
                                                />
                                                <Input
                                                    style={{color: colors.WHITE, width: "100%", height: 40,borderWidth:0}}
                                                    placeholder={loginString.enterEmail}
                                                    underlineColorAndroid="transparent"
                                                    autoCapitalize="none"
                                                    multiline={false}
                                                    autoCorrect={false}
                                                    numberOfLines={1}
                                                    borderWidth={0}
                                                    fontSize={16}
                                                    keyboardType="email-address"
                                                    returnKeyType="next"
                                                    onChangeText={text => this.emailChangeHandler(text)}
                                                    value={username}
                                                    blurOnSubmit={true}
                                                    ref={input => {
                                                        this.emailTextInput = input;
                                                    }}
                                                    onSubmitEditing={() => {
                                                        this.passwordTextInput._root.focus();
                                                    }}
                                                />
                                            </View>
                                            <View
                                                success={validPassword}
                                                error={inValidPassword}
                                                style={styles.inputText}
                                            >
                                                <Ionicons
                                                    name="ios-lock-closed"
                                                    style={styles.vectorIconBlue}
                                                />
                                                <Input
                                                    placeholder={loginString.enterPassword}
                                                    ref={input => {
                                                        this.passwordTextInput = input;
                                                    }}
                                                    style={{color: colors.WHITE, width: "100%", height: 40, borderWidth:0}}
                                                    underlineColorAndroid="transparent"
                                                    autoCapitalize="none"
                                                    autoCorrect={false}
                                                    numberOfLines={1}
                                                    borderWidth={0}
                                                    fontSize={16}
                                                    returnKeyType="done"
                                                    secureTextEntry={true}
                                                    onChangeText={text => this.passwordChangeHandler(text)}
                                                    value={password}
                                                    onSubmitEditing={() => {
                                                        Keyboard.dismiss();
                                                    }}
                                                />
                                            </View>
                                            <TouchableDebounce
                                                style={{width: "100%", height: "15%"}}
                                                onPress={() => {
                                                    this.passwordChangeHandler("");
                                                    this.props.navigation.navigate("ForgotPassword", {
                                                        username: this.state.username
                                                    });
                                                }}
                                            >
                                                <Text style={styles.forgotPassword}>Forgot Password?</Text>
                                            </TouchableDebounce>

                                            <Button
                                                backgroundColor={colors.BLUE}
                                                style={{borderRadius: 5}}
                                                onPress={() => {
                                                    this.authenticate(username, password);
                                                }}
                                            >
                                                <Text>Sign in</Text>
                                            </Button>
                                        </View>
                                    </View>
                                </KeyboardAvoidingView>
                                <View style={styles.bottom}>
                                    <TextDebounce
                                        style={{
                                            color: colors.WHITE,
                                            width: "100%",
                                            textAlign: "center",
                                            textDecorationLine: "underline",
                                            fontWeight: "700"
                                        }}
                                        onPress={() => {
                                            this.passwordChangeHandler("");
                                            this.props.navigation.navigate("RegisterEmail", {
                                                username: this.state.username
                                            });
                                        }}
                                    >
                                        {loginString.dontHaveAccount}
                                    </TextDebounce>
                                </View>
                            </ImageBackground>
                            </View>
            </TouchableWithoutFeedback>
            </ImageBackground>
            </View>
        );
    }
}

export default Login;
