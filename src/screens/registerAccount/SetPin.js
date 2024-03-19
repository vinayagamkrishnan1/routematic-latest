import React, {Component} from "react";
import {
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
import {Button, Container, Input, Item, Text} from "native-base";
import Ionicons from "react-native-vector-icons/Ionicons";
import {loginString, setupPin} from "../../utils/ConstantString";
import {styles} from "../../commonStyles/Styles";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import {API} from "../../network/apiFetch/API";
import {URL} from "../../network/apiConstants/index";
import {colors} from "../../utils/Colors";
import {spinner} from "../../network/loader/Spinner";
import moment from "moment";

let pinValidator = require("password-validator");
let pinSchema = new pinValidator();

// Add properties to Password
pinSchema
    .is()
    .min(4) // Minimum length 8
    .is()
    .max(4) // Maximum length 20
    .has()
    .digits() // Must have digits
    .has()
    .not()
    .spaces(); // Should not have spaces

class SetPin extends Component {
    static navigationOptions = {
        title: "",
        headerStyle: {display: "none"},
        headerLeft: null
    };

    constructor(props) {
        super(props);
        this.state = {
            pin: "",
            confirmPin: "",
            isLoading: false,
            //Initializing Prev.Page constants & Setting in ViewDidMount
            UserId: "",
            Password: "",
            SiteLat: "",
            SiteLong: "",
            GeoCode: "",
            Hadd: "",
            HomeLat: "",
            HomeLong: "",
            Url: "",
            //Validation Purpose
            validPin: false,
            inValidPin: false,
            validConfirmPin: false,
            inValidConfirmPin: false,
            place: "",
            clusterDetails: "",
            seededByEmp:[],
            registrationToken:"",
            email:""
        };
    }

    componentDidMount() {
        //Updating value from Prev.Page Here.
        if (this.props.route.params) {
            const {
                UserId,
                password,
                SiteLat,
                SiteLong,
                GeoCode,
                Hadd,
                HomeLat,
                HomeLong,
                Url,
                clusterDetails,
                seededByEmp,
                registrationToken,
                email

        } = this.props.route.params;
            console.warn("inside component " + JSON.stringify(seededByEmp));
            this.setState({
                UserId: UserId,
                Password: password,
                SiteLat,
                SiteLong,
                GeoCode,
                Hadd,
                HomeLat,
                HomeLong,
                Url,
                clusterDetails,
                seededByEmp,
                registrationToken,
                email
            });
            this.setState({
                Password: password
            });
        }
    }

    _goback() {
        const {goBack} = this.props.navigation;
        setTimeout(function () {
            goBack();
        }, 500);
    }

    pinChangeHandler(text) {
        if (text) {
            this.setState({
                pin: text,
                validPin: pinSchema.validate(text),
                inValidPin: !pinSchema.validate(text)
            });
        } else {
            this.setState({
                pin: text,
                validPin: false,
                inValidPin: false
            });
        }
    }

    confirmPinChangeHandler(text) {
        if (text) {
            this.setState({
                confirmPin: text,
                validConfirmPin: pinSchema.validate(text),
                inValidConfirmPin: !pinSchema.validate(text)
            });
        } else {
            this.setState({
                confirmPin: text,
                validConfirmPin: false,
                inValidConfirmPin: false
            });
        }
    }

    goToLocationPicker() {
        this.props.navigation.navigate("MapPicker", {
            getLocationPicker: this.getLocationPicker.bind(this),
            enableCurrentLocation: true,
            title:'Select Home location',
            clusterDetails: this.state.clusterDetails
        });
    }

    getLocationPicker(selectedLocation, selectLat, selectLng) {
        this.setState({
            HomeLat: selectLat,
            HomeLong: selectLng,
            Hadd: selectedLocation
        });
        this.createUser(selectedLocation, selectLat, selectLng);
    }

    setPin(pin, confirmPin) {
        Keyboard.dismiss();
        if (!pin) {
            alert(setupPin.pinBlank);
            //this.pinTextInput.focus();
        } else if (!this.state.validPin) {
            alert(setupPin.pinInvalid);
            //this.pinTextInput.focus();
        } else if (!confirmPin) {
            alert(setupPin.confirmPinBlank);
            // this.confirmPinTextInput.focus();
        } else if (!this.state.validConfirmPin) {
            alert(setupPin.confirmPinInvalid);
            //this.confirmPinTextInput.focus();
        } else if (this.state.pin === this.state.confirmPin) {
            if (!this.state.HomeLat) {
                if(this.state.seededByEmp && this.state.seededByEmp.length>0){
                    if(this.state.seededByEmp.length===1&& this.state.seededByEmp.includes('latLong')){
                        this.goToLocationPicker();
                    }else {
                        this.props.navigation.navigate('UserMandatoryData', {
                            email: this.state.email,
                            password: this.state.Password,
                            pin: this.state.pin,
                            UserId: this.state.UserId,
                            SiteLat: this.state.SiteLat,
                            SiteLong: this.state.SiteLong,
                            GeoCode: this.state.GeoCode,
                            Hadd: this.state.Hadd,
                            HomeLat: this.state.HomeLat,
                            HomeLong: this.state.HomeLong,
                            Url: this.state.Url,
                            clusterDetails: this.state.clusterDetails,
                            seededByEmp: this.state.seededByEmp,
                            registrationToken: this.state.registrationToken,
                        })
                    }
                }else {
                    this.createUser();
                }
            }
        } else {
            alert(setupPin.donotMatch);
        }
    }

    createUser(selectedLocation, selectLat, selectLng) {
        let termsId = global.termsId;
        let body = {
            UserId: this.state.UserId,
            Password: this.state.Password,
            Pin: this.state.pin,
            Platform: Platform.OS === "android" ? 0 : 1,
            HomeLat: selectLat,
            HomeLong: selectLng,
            Hadd: selectedLocation,
            TCAccept: moment().toISOString(),
            EmployeeTncId:termsId,
            RegistrationToken:this.state.registrationToken
        };
        this.setState({isLoading: true});
        let response = API.fetchJSON(URL.SET_CREDENTIAL, body);
        if (response) handleResponse.setCredential(response, this);
        else alert(loginString.somethingWentWrong);
    }

    render() {
        const {
            pin,
            confirmPin,
            validPin,
            inValidPin,
            validConfirmPin,
            inValidConfirmPin
        } = this.state;
        return (
            <View style={{
                flex: 1,
                // justifyContent: 'center',
                // alignItems: 'center',
                // width: '100%'
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
                            <ImageBackground
                                source={require("../../assets/cp_background.jpg")}
                                defaultSource={require("../../assets/cp_background.jpg")}
                                resizeMethod="scale"
                                resizeMode="cover"
                                style={{
                                    //backgroundColor: "#f3f3f3",
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
                                    // behavior="padding"
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

                                            <Text style={styles.loginTxtUp}>Set T-PIN</Text>

                                            <View
                                                success={validPin}
                                                error={inValidPin}
                                                style={[styles.inputText, {marginVertical: 15}]}
                                            >
                                                <Ionicons
                                                    name="md-lock-closed"
                                                    style={styles.vectorIconBlue}
                                                />
                                                <Input
                                                    style={{color: colors.WHITE, flex: 1}}
                                                    placeholder={setupPin.enterPin}
                                                    ref={input => {
                                                        this.pinTextInput = input;
                                                    }}
                                                    maxLength={4}
                                                    borderWidth={0}
                                                    fontSize={16}
                                                    underlineColorAndroid="transparent"
                                                    autoCapitalize="none"
                                                    autoCorrect={false}
                                                    keyboardType="numeric"
                                                    returnKeyType="done"
                                                    secureTextEntry={true}
                                                    onChangeText={text => this.pinChangeHandler(text)}
                                                    value={pin}
                                                    onSubmitEditing={() => {
                                                        //this.setPin(pin, confirmPin);
                                                        this.confirmPinTextInput.focus();
                                                    }}
                                                />
                                                {/*<Ionicons name="ios-eye-outline" style={styles.vectorIconBlue} />*/}
                                            </View>
                                            <View
                                                success={validConfirmPin}
                                                error={inValidConfirmPin}
                                                style={[styles.inputText, {marginVertical: 15}]}
                                            >
                                                <Ionicons
                                                    name="md-lock-closed"
                                                    style={styles.vectorIconBlue}
                                                />
                                                <Input
                                                    style={{color: colors.WHITE, flex: 1}}
                                                    placeholder={setupPin.enterConfirmPin}
                                                    ref={input => {
                                                        this.confirmPinTextInput = input;
                                                    }}
                                                    maxLength={4}
                                                    borderWidth={0}
                                                    fontSize={16}
                                                    underlineColorAndroid="transparent"
                                                    autoCapitalize="none"
                                                    autoCorrect={false}
                                                    keyboardType="numeric"
                                                    returnKeyType="done"
                                                    secureTextEntry={true}
                                                    onChangeText={text => this.confirmPinChangeHandler(text)}
                                                    value={confirmPin}
                                                    onSubmitEditing={() => {
                                                        // this.setPin(pin, confirmPin);
                                                    }}
                                                />
                                            </View>

                                            <View style={[styles.buttonSmallLayout,{flexDirection: "column",}]}>
                                                <Button
                                                    backgroundColor={colors.BLUE}
                                                    style={{width: "100%"}}
                                                    onPress={() => this.setPin(pin, confirmPin)}
                                                >
                                                    <Text>{setupPin.nextButtonText}</Text>
                                                </Button>
                                                <View style={{
                                                    width: "100%",
                                                    flexDirection:'row',
                                                    alignItems: "center",
                                                    marginTop:8
                                                }}>
                                                    <Ionicons
                                                        name="md-call"
                                                        style={{
                                                            fontSize: 30,
                                                            color: colors.WHITE,
                                                            marginRight:8
                                                        }}
                                                    />
                                                    <Text style={{color: colors.WHITE}}>
                                                        {setupPin.whyPin}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={styles.bottom}>{/*Footer */}</View>
                                    </View>
                                </KeyboardAvoidingView>
                            </ImageBackground>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

SetPin.propTypes = {};

export default SetPin;
