import React, { Component } from "react";
import {
    Alert,
    Image,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { WebView } from 'react-native-webview';
import TouchableDebounce from "../../utils/TouchableDebounce";
import { Button, Input, ScrollView, Text } from "native-base";
import Ionicons from "react-native-vector-icons/Ionicons";
import { pentest, URL } from "../../network/apiConstants/index";
import { styles } from "../../commonStyles/Styles";
import { API } from "../../network/apiFetch/API";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import {loginString, otp, registerEmail, setupPassword} from "../../utils/ConstantString";
import { spinner } from "../../network/loader/Spinner";
import { colors } from "../../utils/Colors";
import Modal from "react-native-modal";
import TextDebounce from "../../utils/TextDebounce";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DeviceInfo from "react-native-device-info";
import axios from "axios";
import OTPInputView from "@twotalltotems/react-native-otp-input";

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

class OTP extends Component {
    static navigationOptions = {
        title: "",
        headerStyle: { display: "none" },
        headerLeft: null
    };
    state = {
        visible: false,
        visibleModal: null
    };
    //Loader State Handle Call From Loader
    onUpdate = () => {
        this.setState({
            isLoading: false,
            otpValidated: false
        });
    };
    hideModalView = () => {
        this.setState({ visibleModal: null });
    };

    constructor(props) {
        super(props);
        this.state = {
            otpValidated: false,
            otpEntered: "",
            password: "",
            confirmPassword: "",
            sPin: "0000",
            isLoading: false, //Initializing Prev.Page constants & Setting in ViewDidMount
            OTPKey: "",
            EmailId: "",
            comingFromPage: "",
            validPassword: false,
            inValidPassword: false,
            Token: "", //Used if Coming from Forget Password

            UserId: "", //Saving OTP Response i.e UserId which will be used in Set Credential Process
            SiteLat: "",
            SiteLong: "",
            GeoCode: "",
            Hadd: "",
            HomeLat: "",
            HomeLong: "",
            //counter state
            time: {},
            seconds: 19,
            termsAndCondition: false,
            htmlTermsAndConditions: "",
            Url: "",
            resendBtnText: "Resend OTP",
            resendEnable: true,
            clusterDetails: {
                Clusterlat: "0.0",
                Clusterlng: "0.0",
                Clusterradius: 0.0,
                ClusterOutOfRadiusMsg: ""
            },
            termsAndConditionContent:"",
            termsId:-1,
            registrationToken:'',
            seededByEmp:[],
            hasPasswordScreen:null
        };
    }

    static getOpacity(comingFromPage, termsAndCondition) {
        if (comingFromPage === "fromForgotPassword") {
            return 1;
        } else if (termsAndCondition) return 1;
        else return 0.5;
    }


    _goback() {
        const { goBack } = this.props.navigation;
        setTimeout(function () {
            goBack();
        }, 500);
    }

    componentWillUnmount() {
        timer.clearTimeout(this);
        clearInterval(this.timer);
    }

    async resendOTP() {
        const { EmailId } = this.props.route.params;
        if (!EmailId) {
            //Toast.show(registerEmail.emailBlank);
            alert(registerEmail.emailBlank);
            return;
        }
        const { comingFromPage } = this.props.route.params;
        //Handling OTP URL based on from where USER has come.
        let url = URL.REGISTER_EMAIL;

        if (comingFromPage === "fromForgotPassword") {
            url = pentest ? URL.FORGET_PASSWORD_PT : URL.FORGET_PASSWORD;
        }
        let _deviceId = await DeviceInfo.getUniqueId();
        let body = { email: EmailId, imei: _deviceId };
        this.setState({ isLoading: true });
        let response = API.fetchJSON(url, body); // SWITCH ACCORDING TO COMING FROM
        if (response) {

            comingFromPage === "fromForgotPassword"
                ? (pentest ? handleResponse.forgetPassword_PT(response, this) : handleResponse.forgetPassword(response, this))
                : handleResponse.registerEmail(response, this);
        } else {
            this.setState({ isLoading: false });
            //Toast.show("Something went wrong!");
            alert("Something went wrong!");
        }
        this.callTimer();
    }
    callTimer() {
        let sec30 = 30;
        this.timer = setInterval(() => {
            if (sec30 <= 0) {
                clearInterval(this.timer);
                this.setState({resendBtnText: "Resend OTP", resendEnable: true});
            } else {
                sec30 = sec30 - 1;
                this.setState({
                    resendBtnText: (sec30 < 10 ? "00:0" + sec30 : "00:" + sec30) + "s",
                    resendEnable: false
                });
            }
        }, 1000);
    }

    componentDidMount() {
        if (this.props.route.params) {
            const {
                OTPKey,
                EmailId,
                comingFromPage,
                Url,
                SSO,
                token
            } = this.props.route.params;
            // console.warn('Token for FP-PT :: ', token);
            if(SSO && SSO !== null){
                this.resendOTP();
            }else{
                this.callTimer();
            }
            this.setState({
                OTPKey: OTPKey,
                EmailId: EmailId,
                comingFromPage: comingFromPage,
                Url,
                Token: token
            });
            if(this.state.termsAndConditionContent.toString().trim().length<2 && comingFromPage !== "fromForgotPassword"){
                let domain = EmailId.replace(/.*@/, "");
                let url = URL.TERMS_AND_CONDITION + '?dn='+ domain +'&r=emp&m=mobile';
                let header ={
                    Accept: "application/json",
                    "Content-Type": "application/json"
                };
                axios.get(url, {
                    headers: header
                }).then(async response => {
                    if(response.data.termsContentResult) {
                        await this.setState({
                            termsAndConditionContent: response.data.termsContentResult,
                            termsId: response.data.termsId
                        });
                        global.termsId = response.data.termsId;
                    }
                }).catch(async error => {
                    if (error) {
                        Alert.show('Routematic',  loginString.somethingWentWrong);
                    }
                });
            }
        }
    }

    otpChangeHandler(otpEntered) {
        this.setState({ otpEntered: otpEntered });
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

    setPassword(password, confirmPassword) {
        if (!password) {
            alert(setupPassword.passwordBlank);
            //this.passwordTextInput._root.focus();
        } else if (!this.state.validPassword) {
            alert(setupPassword.passwordInvalid);
            //this.passwordTextInput._root.focus();
        } else if (!confirmPassword) {
            alert(setupPassword.confirmPasswordBlank);
            //this.confirmPasswordTextInput._root.focus();
        } else if (!this.state.validConfirmPassword) {
            alert(setupPassword.confirmPasswordInvalid);
            //this.confirmPasswordTextInput._root.focus();
        } else if (this.state.password === this.state.confirmPassword) {
            //Check if Token has data means user is coming from "Forget Password?"
            if (this.state.Token) {
                if (pentest) {
                    let body = {
                        Token: this.state.Token,
                        OTP: this.state.otpEntered,
                        Password: this.state.password,
                    };
                    // console.warn('Reset password body -- ', body);
                    this.setState({ isLoading: true });
                    let response = API.fetchJSON(
                        URL.UPDATE_USER_PASSWORD_PT,
                        body
                    );
                    console.warn('PT fp response - ', response);
                    if (response) handleResponse.updatePassword_PT(response, this);
                    else this.setState({ isLoading: false });
                } else {
                    let body = {
                        Email: this.state.EmailId,
                        Token: this.state.Token,
                        Password: this.state.password,
                        ConfirmPassword: this.state.confirmPassword
                    };
                    this.setState({ isLoading: true });
                    let response = API.fetchJSON(
                        this.state.Url + URL.UPDATE_USER_PASSWORD,
                        body
                    );
                    if (response) handleResponse.updatePassword(response, this);
                    else this.setState({ isLoading: false });
                }
            } else {
                let body = {
                    registrationToken: this.state.registrationToken,
                    password: this.state.password,
                };
                this.setState({ isLoading: true });
                let response = API.fetchJSON(
                    URL.VALIDATE_PASSWORD,
                    body
                );
                if (response) handleResponse.validatePassword(response, this);
                else this.setState({ isLoading: false });
            }
        } else {
            alert(setupPassword.donotMatch);
        }
    }

    navigateToTpin(){
        this.props.navigation.navigate("SetPIN", {
            email: this.state.EmailId,
            password: this.state.password,
            UserId: this.state.UserId,
            SiteLat: this.state.SiteLat,
            SiteLong: this.state.SiteLong,
            GeoCode: this.state.GeoCode,
            Hadd: this.state.Hadd,
            HomeLat: this.state.HomeLat,
            HomeLong: this.state.HomeLong,
            Url: this.state.Url,
            clusterDetails: this.state.clusterDetails,
            seededByEmp:this.state.seededByEmp,
            registrationToken:this.state.registrationToken
        });
        return(<View/>);
    }

    render() {
        const {comingFromPage} = this.props.route.params;
        return this.state.otpValidated ? 
            (this.state.hasPasswordScreen===1 || (comingFromPage === "fromForgotPassword")) ? this.getChangePasswordComponent() : this.navigateToTpin()
            : this.getValidateOtpComponent();
    }

    verifyOtp() {
        const {
            OTPKey,
            EmailId,
            comingFromPage
        } = this.props.route.params;
        if (
            !this.state.termsAndCondition &&
            comingFromPage !== "fromForgotPassword"
        ) {
            Alert.alert("Terms & Conditions", "Please accept terms and conditions");
            return;
        }
        if (!this.state.otpEntered) {
            alert(otp.otpBlank);
            return;
        }
        this.setState({ isLoading: true });
        //Handling OTP URL based on from where USER has come.
        let url = URL.VERIFY_OTP;
        let body = {
            EmailId: EmailId,
            OTP: this.state.otpEntered,
            OTPKey: OTPKey
        };
        if (comingFromPage === "fromForgotPassword") {
            if (pentest) {
                this.setState({
                    otpValidated: true,
                    isLoading: false
                })
            } else {
                url = this.state.Url + URL.VERIFY_FORGET_PASSWORD_OTP;
                body = {
                    Email: EmailId,
                    OTP: this.state.otpEntered,
                    OTPKey: OTPKey
                };
                const response = API.fetchJSON(url, body);
                if (response) handleResponse.ForgotPasswordOTPVerify(response, this);
                else this.setState({ isLoading: false });
            }
        }else{
            const response = API.fetchJSON(url, body);
            if (response) handleResponse.OTPVerify(response, this);
            else this.setState({ isLoading: false });
        }
    }

    getChangePasswordComponent() {
        const {
            password,
            confirmPassword,
            validPassword,
            inValidPassword,
            validConfirmPassword,
            inValidConfirmPassword
        } = this.state;
        const { comingFromPage } = this.props.route.params;

        return (
            <View style={{ flex: 1 }}>
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
                        <ImageBackground
                            source={require("../../assets/cp_background.jpg")}
                            defaultSource={require("../../assets/cp_background.jpg")}
                            resizeMethod="scale"
                            resizeMode="cover"
                            style={{
                                justifyContent: "center",
                                alignContent: "flex-start",
                                flex: 1,
                                width: '100%'
                            }}
                        >
                            {spinner.visible(this.state.isLoading)}
                            <KeyboardAvoidingView
                                style={{ flex: 1 }}
                                // behavior="padding"
                                // enabled
                            >
                                <View style={styles.loginScreen}>
                                    <View style={styles.top}>
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
                                        <Text style={styles.loginTxtUp}>Set password </Text>
                                        <View
                                            success={validPassword}
                                            error={inValidPassword}
                                            style={[styles.inputText,{marginVertical:20}]}
                                        >
                                            <Ionicons
                                                name="md-lock-closed"
                                                style={styles.vectorIconBlue}
                                            />
                                            <Input
                                                placeholder={setupPassword.enterPassword}
                                                ref={input => {
                                                    this.passwordTextInput = input;
                                                }}
                                                style={{ flex: 1, color: colors.WHITE, height: 50 }}
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
                                                    //this.setPassword(password, confirmPassword);
                                                }}
                                            />
                                        </View>
                                        <View
                                            success={validConfirmPassword}
                                            error={inValidConfirmPassword}
                                            style={[styles.inputText,{marginBottom:20}]}
                                        >
                                            <Ionicons
                                                name="md-lock-closed"
                                                style={styles.vectorIconBlue}
                                            />
                                            <Input
                                                placeholder={setupPassword.enterConfirmPassword}
                                                ref={input => {
                                                    this.confirmPasswordTextInput = input;
                                                }}
                                                style={{ flex: 1, color: colors.WHITE, height: 50 }}
                                                underlineColorAndroid="transparent"
                                                autoCapitalize="none"
                                                numberOfLines={1}
                                                borderWidth={0}
                                                fontSize={16}
                                                autoCorrect={false}
                                                returnKeyType="done"
                                                secureTextEntry={true}
                                                onChangeText={text =>
                                                    this.confirmPasswordChangeHandler(text)
                                                }
                                                value={confirmPassword}
                                                onSubmitEditing={() => {
                                                    //this.setPassword(password, confirmPassword);
                                                }}
                                            />
                                        </View>

                                        <View style={styles.buttonSmallLayout}>
                                            <Button
                                                backgroundColor={colors.BLUE}
                                                style={{ width: "100%" }}
                                                onPress={() =>
                                                    this.setPassword(password, confirmPassword)
                                                }
                                            >
                                                <Text>
                                                    {comingFromPage === "fromForgotPassword"
                                                        ? "DONE"
                                                        : otp.nextButtonText}
                                                </Text>
                                            </Button>
                                        </View>
                                    </View>
                                    {/* <View style={styles.bottom}></View> */}
                                </View>
                            </KeyboardAvoidingView>
                        </ImageBackground>
            </TouchableWithoutFeedback>
            </View>
        );
    }

    _renderTermsAndCondition() {
        return (
            <View style={{width:'100%',flex: 1}}>
                <WebView source={{ html: this.state.termsAndConditionContent}} />
                <Button
                    primary
                    full
                    backgroundColor={colors.BLUE}
                    style={{
                        bottom: 0,
                        left: 0,
                        right: 0
                    }}
                    onPress={() => this.hideModalView()}
                >
                    <Text
                        onPresss={() => {
                            this.setState({ visibleModal: null });
                        }}
                    >
                        Close
                    </Text>
                </Button>
            </View>
        );
    }

    _renderTermsAndConditionText() {
        const { comingFromPage } = this.props.route.params;
        if (comingFromPage === "registerEmail") {
            return (
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignContent: "center",
                        marginTop: 20
                    }}
                >
                    {this.state.termsAndCondition ? (
                        <MaterialCommunityIcons
                            name="checkbox-marked-outline"
                            style={{
                                color: colors.WHITE,
                                marginRight: 5,
                                marginTop: 5
                            }}
                            size={30}
                            onPress={() => {
                                this.setState({ termsAndCondition: false });
                            }}
                        />
                    ) : (
                            <MaterialCommunityIcons
                                name="checkbox-blank-outline"
                                style={{
                                    color: colors.WHITE,
                                    marginRight: 5,
                                    marginTop: 5
                                }}
                                size={30}
                                onPress={() => {
                                    this.setState({ termsAndCondition: true });
                                }}
                            />
                        )}
                    <Text style={{ marginTop: 10, color: colors.WHITE }}>
                        {"I agree to the "}
                        <TextDebounce
                            style={{ textDecorationLine: "underline" }}
                            onPress={() => {
                                if(this.state.termsAndConditionContent.length>2) {
                                    this.setState({
                                        visibleModal: "termsAndConditions"
                                    });
                                }
                            }}
                        >
                            terms and conditions
                        </TextDebounce>
                    </Text>
                </View>
            );
        }
    }

    getValidateOtpComponent() {
        {
            const { comingFromPage } = this.props.route.params;
            return (
                <View style={{ flex: 1 }}>
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
                    
                            <ImageBackground
                                source={require("../../assets/cp_background.jpg")}
                                defaultSource={require("../../assets/cp_background.jpg")}
                                resizeMethod="scale"
                                resizeMode="cover"
                                style={{
                                    justifyContent: "center",
                                    alignContent: "flex-start",
                                    flex: 1,
                                    width: '100%'
                                }}
                            >
                                <Modal
                                    isVisible={this.state.visibleModal === "termsAndConditions"}
                                    style={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: "100%",
                                        height: "100%"
                                    }}
                                >
                                    {this._renderTermsAndCondition()}
                                </Modal>
                                {spinner.visible(this.state.isLoading)}

                                    <KeyboardAvoidingView
                                        style={{flex: 1}}
                                        // behavior="padding"
                                        // enabled
                                    >
                                        <View style={styles.loginScreen}>
                                            <View style={styles.top}>
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

                                                <Text style={styles.loginTxtUp}>{otp.title}</Text>

                                                <View
                                                    style={{
                                                        marginTop: 20,
                                                        width: "100%",
                                                        justifyContent: "center",
                                                        alignItems: "center"
                                                    }}
                                                >
                                                    <View style={{borderBottomWidth: 0,alignSelf:'center'}}>
                                                        <Text
                                                            style={{
                                                                marginTop: 0,
                                                                color: colors.BORDER,
                                                                alignSelf: "center",
                                                                padding: 10
                                                            }}
                                                        >
                                                            {otp.emailSent}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View style={{borderBottomWidth: 0}}>
                                                    <OTPInputView
                                                        style={{width:'90%',height: 60}}
                                                        pinCount={6}
                                                        onCodeChanged = {code => { this.otpChangeHandler(code)}}
                                                        autoFocusOnLoad
                                                        codeInputFieldStyle={customStyle.underlineStyleBase}
                                                        codeInputHighlightStyle={customStyle.underlineStyleHighLighted}
                                                        onCodeFilled={(code => {
                                                            console.warn(`Code is ${code}, you are good to go!`);
                                                        })}
                                                    />
                                                </View>
                                                {this._renderTermsAndConditionText()}
                                                <View style={styles.buttonSmallLayout}>
                                                    <TouchableDebounce
                                                        style={{
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            width:'80%'
                                                        }}
                                                        onPress={() => {
                                                            if (this.state.resendEnable === true) {
                                                                this.resendOTP();
                                                            }
                                                        }}

                                                    >
                                                        <Text
                                                            numberOfLines={1}
                                                            style={{
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                fontSize: 14,
                                                                color: colors.WHITE,
                                                                borderBottomWidth: 1,
                                                                textDecorationLine: this.state.resendBtnText==="Resend OTP"?'underline':"",
                                                            }}
                                                        >
                                                            {this.state.resendBtnText}
                                                        </Text>
                                                    </TouchableDebounce>
                                                    <Button
                                                        style={{
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            width: '100%',
                                                            backgroundColor: (this.state.otpEntered.length !== 6 || (comingFromPage === "registerEmail" ? this.state.termsAndCondition === false : false)) ? colors.GRAY: colors.BLUE
                                                        }}
                                                        disabled={this.state.otpEntered.length !== 6 || (comingFromPage === "registerEmail" ? this.state.termsAndCondition === false : false)}
                                                        onPress={() => this.verifyOtp()}
                                                    >
                                                        <Text
                                                            numberOfLines={1}
                                                            style={{
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                fontSize: 12
                                                            }}
                                                        >
                                                            {otp.verifyOTP}
                                                        </Text>
                                                    </Button>
                                                </View>
                                            </View>
                                        </View>
                                    </KeyboardAvoidingView>
                                    <View style={styles.bottom}>
                                        <TouchableDebounce
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                                justifyContent: "center",
                                                alignContent: "center"
                                            }}
                                            onPress={() => {
                                                this._goback();
                                            }}
                                        >
                                            <Text
                                                numberOfLines={1}
                                                style={{
                                                    flex: 1,
                                                    alignSelf: "center",
                                                    textDecorationLine: "underline",
                                                    color: colors.WHITE,
                                                    textAlign: "center"
                                                }}
                                            >
                                                Change Email ID
                                            </Text>
                                        </TouchableDebounce>
                                    </View>
                            </ImageBackground>
                </TouchableWithoutFeedback>
                </View>
            );
        }
    }
}
const customStyle = StyleSheet.create({
    borderStyleBase: {
        width: 30,
        height: 45
    },

    borderStyleHighLighted: {
        borderColor: "#03DAC6",
    },

    underlineStyleBase: {
        width: 30,
        height: 45,
        borderWidth: 0,
        borderBottomWidth: 1,
        fontSize:20,
        fontWeight: "500",
    },

    underlineStyleHighLighted: {
        borderColor: "#03DAC6",
    },
});

export default OTP;
