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
import {URL} from "../../network/apiConstants/index";
import {styles} from "../../commonStyles/Styles";
import {API} from "../../network/apiFetch/API";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import {registerEmail} from "../../utils/ConstantString";
import {colors} from "../../utils/Colors";
import {spinner} from "../../network/loader/Spinner";
import DeviceInfo from "react-native-device-info";

let emailSchema = require("email-validator");

class RegisterEmail extends Component {
    static navigationOptions = {
        title: "",
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

    _goback() {
        const {goBack} = this.props.navigation;
        setTimeout(function () {
            goBack();
        }, 500);
    }

    componentWillUnmount() {
        if (this.state.isLoading) this.onUpdate();
    }

    //Handle Text Change Event
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

    UNSAFE_componentWillMount() {
        let EmailId = this.props.route.params.username; // ", false);
        this.emailChangeHandler(EmailId);
    }

    async generateOtp() {
        Keyboard.dismiss();
        if (!this.state.EmailId) {
            //Toast.show(registerEmail.emailBlank);
            alert(registerEmail.emailBlank);
            //this.emailTextInput._root.focus();
            return;
        } else if (!this.state.validEmail) {
            //Toast.show(registerEmail.enterValidEmail);
            alert(registerEmail.enterValidEmail);
            //this.emailTextInput._root.focus();
            return;
        }

        let _deviceId = await DeviceInfo.getUniqueId();
        let body = {email: this.state.EmailId, imei: _deviceId};
        // let body = { email: this.state.EmailId, imei:"234523542532523523" };
        this.setState({isLoading: true});
        let response = API.fetchJSON(URL.REGISTER_EMAIL, body);
        if (response)
            handleResponse.registerEmail(response, this, this.state.EmailId);
        else {
            this.setState({isLoading: false});
            //Toast.show("Something went wrong!");
            alert(null, "Something went wrong!");
        }
    }

    render() {
        {
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
                                    //backgroundColor: "#f3f3f3",
                                    justifyContent: "center",
                                    alignContent: "flex-start",
                                    flex: 1
                                }}
                            >
                                <StatusBar barStyle="light-content"/>
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

                                        <Text style={styles.loginTxtUp}>Register</Text>

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
                                                placeholder={registerEmail.enterEmail}
                                                underlineColorAndroid="transparent"
                                                autoCapitalize="none"
                                                autoCorrect={false}
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
                                                    //this.generateOtp();
                                                }}
                                            />
                                        </View>

                                        <Button
                                            block
                                            full
                                            backgroundColor={colors.BLUE}
                                            style={{marginTop: 20}}
                                            onPress={() => this.generateOtp()}
                                        >
                                            <Text>Generate OTP</Text>
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
                                            onPress={() => {
                                                this._goback();
                                            }}
                                        >
                                            {registerEmail.alreadyHaveAccount}
                                        </TextDebounce>
                                    </View>
                                </View>
                            </ImageBackground>
                    </View>
                </TouchableWithoutFeedback>
            );
        }
    }
}

export default RegisterEmail;
