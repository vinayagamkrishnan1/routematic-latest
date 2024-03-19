import React, {Component} from "react";

import {
    AppState,
    Image,
    ImageBackground,
    Keyboard,
    Linking,
    Platform,
    StatusBar,
    StyleSheet,
    TouchableWithoutFeedback,
    View
} from "react-native";
import * as Alert from "../../utils/Alert";
import {Button, Input, Item, Text} from "native-base";
import Ionicons from "react-native-vector-icons/Ionicons";
import {URL} from "../../network/apiConstants/index";
import {styles} from "../../commonStyles/Styles";
import {API} from "../../network/apiFetch/API";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import {asyncString, forgetPasswordString} from "../../utils/ConstantString";
import {colors} from "../../utils/Colors";
import {spinner} from "../../network/loader/Spinner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CryptoXor } from "crypto-xor";

let emailSchema = require("email-validator");

class SSOEmail extends Component {
    static navigationOptions = {
        title: "SSO User",
        headerStyle: {display: "none"},
        headerLeft: null
    };

    constructor(props) {
        super(props);
        this.state = {
            EmailId: "",
            validEmail: false,
            inValidEmail: false,
            isLoading: false,
        };
    }

    componentDidMount() {
        this.props.navigation.addListener('focus', () => {
            setTimeout(() => {
                console.warn('detectDeepLinkForSMAL');
                this.detectDeepLinkForSMAL();
            }, 100);
        });
        this.changeEventListener = AppState.addEventListener("change", this._handleAppStateChange);
    }

    _handleAppStateChange = nextAppState => {
        console.warn('State change -> ', nextAppState);
        this.setState({ appState: nextAppState });
        if (nextAppState === "active") {
            this.detectDeepLinkForSMAL();
        }
    };

    detectDeepLinkForSMAL() {
        // Linking.getInitialURL().then(url => {
        //     console.warn('Deeplink url ', url);
        //     if (url) {
        //         this.navigate(url);
        //     }
        // });

        // Add an event listener to handle custom URL schemes
        Linking.addEventListener('url', async (event) => {
            console.warn("EVENT - ", event);
            const { url } = event;
            Alert.show("EVENT", JSON.stringify(event));
            Alert.show("EVENT url", JSON.stringify(url));
            console.warn('DL URL - ', url);
            if (url.startsWith('rm-https://emp.dl') || 
                url.startsWith('https://dlrm.routematic.com/intune')
            ) {
                // Parse the URL and extract parameters
                let _url = decodeURI(url);
                Alert.show("_url::::", JSON.stringify(_url));
                console.warn('DL URL decode - ', _url);
                let params = _url.split('?')[1];
                // Alert.show("0", "SAML RESPONSE>>>>" + JSON.stringify(params));
                Alert.show("PARAMS::::", JSON.stringify(params));
                if (params) {
                    console.warn('params - ', params);
                    let res = JSON.parse(params.replace('data=', ''));
                    Alert.show("RESPONSE::::", JSON.stringify(res));
                    Alert.show("RESPONSE.DATA::::", JSON.stringify(res.data));
                    console.warn('Res obj - ', res);
                    console.warn('CAPI - ', res.data.capi);
                    this.handleSMALResponse(res);
                } else {
                    Alert.show("ERROR", JSON.stringify("Params not available."));
                }
            } else {
                Alert.show("ERROR", JSON.stringify("EVENT Listener not registered"));
            }
        });
    }

    async UNSAFE_componentWillMount() {
        let keys = await AsyncStorage.getAllKeys();
        console.warn('AsyncStorage -----------------> ', keys);
        let tk = await AsyncStorage.getItem(asyncString.ACCESS_TOKEN);
        console.warn('AsyncStorage token-----------------> ', tk);
        // Linking.removeEventListener('url', this.handleOpenURL);
        this.props.navigation.addListener('focus', async () => {
            setTimeout(() => {
                console.warn('detectDeepLinkForSMAL willfocus');
                this.detectDeepLinkForSMAL();
            }, 100);
        });
    }

    handleOpenURL = (event) => { // D
        if (event.url) {
            // this.navigate(event.url);
        }
    }

    navigate = (url) => { // E
        console.warn('URL ', url);
        const route = url ? url.replace(/.*?:\/\//g, '') : '';
        const email = route.match(/\/([^\/]+)\/?$/)[1];
        const routeName = route.split('/')[0];

        console.warn('route - ', route, ' | email-id - ', email, ' | routeName - ', routeName);
        if ((routeName === 'employee' || routeName === 'www.routematic.com' || routeName === 'dlrm.routematic.com') && emailSchema.validate(email)) {
            this.setState({
                EmailId: email,
                validEmail: emailSchema.validate(email),
                inValidEmail: !emailSchema.validate(email)
            });
        };
    }

    handleSMALResponse(data) {
        Alert.show("handleSMALResponse::::", JSON.stringify(data));
        // Alert.show("5", "handleSMALResponse>>>>" + JSON.stringify(data));
        // Alert.show("5.1", "handleSMALResponse>>>>" + JSON.stringify(data.data));
        // Alert.show("5.2", "handleSMALResponse>>>>" + JSON.stringify(data.data.access_token));
        // Alert.show("5.3", "handleSMALResponse>>>>" + JSON.stringify(data.data.capi));
        if (data.status.code === 200) {
          try {
            // Alert.show("6", "handleSMALResponse try >>>>" + JSON.stringify(data));
            AsyncStorage.multiSet([
              [asyncString.DOMAIN_NAME, this.state.domainName],
              [asyncString.hasEverLoggedIn, "Yes"],
    
              [asyncString.ACCESS_TOKEN, 
                // data.data.access_token
                CryptoXor.encrypt(data.data.access_token, asyncString.ACCESS_TOKEN)
              ],
              [asyncString.CAPI, data.data.capi],
              [
                asyncString.REFRESH_TOKEN,
                CryptoXor.encrypt(data.data.refresh_token, asyncString.REFRESH_TOKEN)
              ],
              [asyncString.DID_RE_LOGIN, asyncString.lastForcedLogout],
              [asyncString.EXPIRES_IN, data.data.expires_in.toString()],
              [asyncString.IS_PUSH_ALLOWED, "true"]
            ]).then((result) => {
                // Alert.show("7", "Befor navigation.navigate APP" + JSON.stringify(result));
                Alert.show("Before redirecting to the application catch::::", JSON.stringify(result));
                this.props.navigation.navigate("App");
            });
          } catch (error) {
            // Alert.show("8", "handleSMALResponse catch >>>>" + JSON.stringify(error));
            console.warn('Error - ', error);
            // Alert.show("Error", error);
            Alert.show("handleSMALResponse catch::::", JSON.stringify(error));
          }
        } else {
          Alert.show("handleSMALResponse ELSE::::", JSON.stringify(data));
        }
    }

    _goback() {
        const {goBack} = this.props.navigation;
        setTimeout(function () {
            goBack();
        }, 500);
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

    checkSSO() {
        if (!this.state.EmailId) {
            //Toast.show(forgetPasswordString.emailBlank);
            alert(forgetPasswordString.emailBlank);
            //this.emailTextInput._root.focus();
        } else if (!this.state.validEmail) {
            //Toast.show(forgetPasswordString.error401);
            alert(forgetPasswordString.error401);
            //this.emailTextInput._root.focus();
        } else if (this.state.validEmail) {
            setTimeout(() => {
                this.setState({isLoading: true});
            }, 0);

            let domainName = this.state.EmailId.replace(/.*@/, "");
            this.setState({domainName});
            let response = API.fetchGET(URL.SSO_CHECK + domainName);
            console.warn("test SSO domain : "+JSON.stringify(response))
            if (response)
                handleResponse.checkSSO(response, this, domainName, this.state.EmailId);
            else {
                alert(forgetPasswordString.connectivityIssue);
                this.setState({isLoading: false});
            }
        }
    }

    render() {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%'
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
                {/* <View style={{flex: 1}}> */}
                    {/* <View> */}
                        <ImageBackground
                            source={require("../../assets/cp_background.jpg")}
                            defaultSource={require("../../assets/cp_background.jpg")}
                            resizeMethod="scale"
                            resizeMode="cover"
                            style={{
                                justifyContent: "center",
                                alignContent: "center",
                                flex: 1,
                                width: '100%'
                            }}
                        >
                            {spinner.visible(this.state.isLoading)}
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
                                    <Text style={styles.loginTxtUp}>Please Enter Your Email</Text>

                                    <View
                                        success={this.state.validEmail}
                                        error={this.state.inValidEmail}
                                        style={[styles.inputText, {marginTop: 10}]}
                                    >
                                        <Ionicons
                                            name="ios-mail"
                                            style={styles.vectorIconBlue}
                                        />
                                        <Input
                                            style={{color: colors.WHITE, height: 40,borderWidth:0}}
                                            placeholder={forgetPasswordString.enterEmail}
                                            underlineColorAndroid="transparent"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            numberOfLines={1}
                                            keyboardType="email-address"
                                            returnKeyType="next"
                                            borderWidth={0}
                                            fontSize={16}
                                            onChangeText={text => this.emailChangeHandler(text)}
                                            value={this.state.EmailId}
                                            blurOnSubmit={true}
                                            ref={input => {
                                                this.emailTextInput = input;
                                            }}
                                            onSubmitEditing={() => {
                                            }}
                                        />
                                    </View>

                                    <Button
                                        backgroundColor={colors.BLUE}
                                        style={styles.button}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            this.checkSSO();
                                        }}
                                    >
                                        <Text style={{alignSelf: "center"}}>Next</Text>
                                    </Button>
                                </View>
                                {/* <View style={styles.bottom}>
                Footer
                <TextDebounce
                  style={{
                    color: colors.WHITE,
                    textAlign: "center",
                    textDecorationLine: "underline",
                    fontWeight: "700"
                  }}
                  onPress={() => this._goback()}
                >
                  Go back to Login
                </TextDebounce>
              </View>*/}
                            </View>
                        </ImageBackground>
                    {/* </View> */}
                {/* </View> */}
            </TouchableWithoutFeedback>
            </View>
        );
    }
}

export default SSOEmail;
