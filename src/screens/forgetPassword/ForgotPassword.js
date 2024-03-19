import React, {Component} from "react";

import {
    Image,
    ImageBackground,
    Keyboard,
    Platform,
    StatusBar,
    StyleSheet,
    TouchableWithoutFeedback,
    View
} from "react-native";
import TextDebounce from "../../utils/TextDebounce";
import {Button, Input, Text} from "native-base";
import Ionicons from "react-native-vector-icons/Ionicons";
import {pentest, URL} from "../../network/apiConstants/index";
import {styles} from "../../commonStyles/Styles";
import {API} from "../../network/apiFetch/API";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import {forgetPasswordString} from "../../utils/ConstantString";
import {colors} from "../../utils/Colors";
import {spinner} from "../../network/loader/Spinner";
import DeviceInfo from "react-native-device-info";

let emailSchema = require("email-validator");

class ForgetPassword extends Component {
    static navigationOptions = {
        title: "Forgot Password",
        headerStyle: {display: "none"},
        headerLeft: null
    };
    //Loader State Handle Call From Loader
    onUpdate = () => {
        this.setState({
            isLoading: false
        });
    };

    constructor(props) {
        super(props);
        this.state = {
            EmailId: "",
            validEmail: false,
            inValidEmail: false,
            isLoading: false
        };
    }

    UNSAFE_componentWillMount() {
        let EmailId = this.props.route.params.username; // ", false);
        console.warn("EmailId->" + EmailId);
        this.emailChangeHandler(EmailId);
    }

    _goback() {
        const {goBack} = this.props.navigation;
        setTimeout(function () {
            goBack();
        }, 100);
    }

    componentWillUnmount() {
        if (this.state.isLoading) this.onUpdate();
    }

    emailChangeHandler(text) {
        if (text) {
            this.setState({
                EmailId: text,
                validEmail: emailSchema.validate(text),
                inValidEmail: !emailSchema.validate(text)
            });
        } else {
            this.setState({
                EmailId: text,
                validEmail: false,
                inValidEmail: false
            });
        }
    }

    async generateForgetOtp() {
        if (!this.state.EmailId) {
            //Toast.show(forgetPasswordString.emailBlank);
            alert(forgetPasswordString.emailBlank);
            //this.emailTextInput._root.focus();
        } else if (!this.state.validEmail) {
            //Toast.show(forgetPasswordString.error401);
            alert(forgetPasswordString.error401);
            //this.emailTextInput._root.focus();
        } else if (this.state.validEmail) {

            if (pentest) {
                let body = {
                    Email: this.state.EmailId
                };
                console.warn('FP URL --- ', URL.FORGET_PASSWORD_PT, body);
                this.setState({isLoading: true});
                let response = API.fetchJSON(URL.FORGET_PASSWORD_PT, body);
                console.warn('FP Response -> ', response);
                if (response) {
                    handleResponse.forgetPassword_PT(response, this);
                } else {
                    alert(forgetPasswordString.connectivityIssue);
                    this.setState({isLoading: false});
                }
            } else {
                let _deviceId = await DeviceInfo.getUniqueId();
                let body = {
                    email: this.state.EmailId,
                    imei: _deviceId
                };
                console.warn('fp body - ', body);
                this.setState({isLoading: true});
                let response = API.fetchJSON(URL.FORGET_PASSWORD, body);
                if (response) {
                    handleResponse.forgetPassword(response, this);
                } else {
                    alert(forgetPasswordString.connectivityIssue);
                    this.setState({isLoading: false});
                }
            }
        }
    }

    render() {
        return (
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
                <View style={{flex: 1}}>
                        <ImageBackground
                            source={require("../../assets/cp_background.jpg")}
                            defaultSource={require("../../assets/cp_background.jpg")}
                            resizeMethod="scale"
                            resizeMode="cover"
                            style={{
                                justifyContent: "center",
                                alignContent: "flex-start",
                                flex: 1
                            }}
                        >
                            {spinner.visible(this.state.isLoading)}
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

                                    <Text style={styles.loginTxtUp}>Password Reset</Text>

                                    <View
                                        success={this.state.validEmail}
                                        error={this.state.inValidEmail}
                                        style={styles.inputText}
                                    >
                                        <Ionicons
                                            name="ios-mail"
                                            style={styles.vectorIconBlue}
                                        />
                                        <Input
                                            style={{color: colors.WHITE, height: 40, borderWidth:0}}
                                            placeholder={forgetPasswordString.enterEmail}
                                            underlineColorAndroid="transparent"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            numberOfLines={1}
                                            borderWidth={0}
                                            fontSize={16}
                                            keyboardType="email-address"
                                            returnKeyType="next"
                                            onChangeText={text => this.emailChangeHandler(text)}
                                            value={this.state.EmailId}
                                            blurOnSubmit={true}
                                            ref={input => {
                                                this.emailTextInput = input;
                                            }}
                                            onSubmitEditing={() => {
                                                //this.generateForgetOtp();
                                            }}
                                        />
                                    </View>

                                    <Button
                                        backgroundColor={colors.BLUE}
                                        style={styles.button}
                                        onPress={() => this.generateForgetOtp()}
                                    >
                                        <Text style={{alignSelf: "center"}}>Generate OTP</Text>
                                    </Button>
                                </View>
                                <View style={styles.bottom}>
                                    {/*Footer */}

                                    <TextDebounce
                                        style={{
                                            color: colors.WHITE,
                                            textAlign: "center",
                                            textDecorationLine: "underline",
                                            fontWeight: "700"
                                        }}
                                        onPress={() => this._goback()}
                                    >
                                        {forgetPasswordString.alreadyHaveAccount}
                                    </TextDebounce>
                                </View>
                            </View>
                        </ImageBackground>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default ForgetPassword;
