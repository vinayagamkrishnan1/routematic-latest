import { Alert, Linking, NativeModules, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    appVersion,
    asyncStorageAllKeys,
    asyncStorageKeys,
    asyncString,
    forgetPasswordResetString,
    forgetPasswordString,
    loginString,
    // logout,
    noLoginInfo,
    otp,
    registerEmail,
    setupPin
} from "../../utils/ConstantString";
import { StackActions } from '@react-navigation/native'

import * as Toast from "../../utils/Toast";
import * as Alert1 from "../../utils/Alert";
import * as StoreReview from "react-native-store-review";
import moment from "moment";
import TouchID from "react-native-touch-id";
import * as Keychain from "react-native-keychain";
import { CryptoXor } from "crypto-xor";
import print from "../../utils/Logger";
import { AppConfig } from "../../config/index";
import { API } from "../apiFetch/API";
import { URL } from "../apiConstants";
import Pushy from "pushy-react-native";
import { showMessage } from "react-native-flash-message";
import NavigationService from "../../utils/NavigationService";
import { EventRegister } from "react-native-event-listeners";
import { TYPE } from "../../model/ActionType";
import { requestPhoneCallPermission } from "../../utils/RequestPermissions";

const GoogleKeyManager = NativeModules.GoogleKeyManager;

export function NetworkErrorHandle(error) {
    if (error.message === "Network request failed") {
        Alert1.show(null, "Please check your network connection and try again");
    }
}

export const handleResponse = {
    handleLogoutForSSO: (response, domainName, context, emailID) => {
        if (context) {
            setTimeout(
                () =>
                    context.setState({
                        isLoading: false
                    }),
                0
            );
        }

        if (
            response &&
            response.status.code === 200 &&
            response.data.ssoenabled === 1
        ) {
            // NavigationService.navigate("SSOLogin", {
            //     ssoLoginURL: response.data.ssologin,
            //     domainName,
            //     emailID
            // });
            context.props.navigation.reset({ routes: [{ name: "Auth" }] });
        } else {
            // NavigationService.navigate("SSOEmail", { emailID });
            context.props.navigation.reset({ routes: [{ name: "Auth" }] });
        }
    },
    checkSSO: function (response, context, domainName, emailID) {
        response
            .then(response => response.json())
            .then(response => {
                console.warn("checkSSOres " + JSON.stringify(response));
                console.log("___checkSSOres " + JSON.stringify(response));

                // alert("SSO url " + JSON.stringify(response));

                if (response && response.data && 
                    response.data.ssoenabled === 1 && 
                    response.status.code == 200 &&
                    JSON.stringify(response.data.ssologin).includes("exo.eyqao365.com")
                ) {
                    // Intune SAML
                    try {
                        Linking.openURL('microsoft-edge-' + response.data.ssologin).then((result) => {
                          console.warn('Link opened successfully.');
                        }).catch((error) => {
                          Alert.alert('Error', 'Please install edge browser.');
                        });
                    } catch (error) {
                        console.warn('Error opening link:', error);
                        Alert.alert('Error', 'Please install edge browser.');
                    }
                } else if(response && response.data && 
                    response.data.ssoenabled === 1 && 
                    response.status.code == 200 &&
                    JSON.stringify(response.data.ssologin).includes("routematic.com")
                ) {
                    // SAML for others
                    context.props.navigation.navigate("SSOLogin", {
                        ssoLoginURL: response.data.ssologin,
                        domainName,
                        emailID
                    });
                } else {
                    showMessage({
                        message: "Routematic",
                        type: "warning",
                        description: response.message || "Something went wrong. Please try later.",
                        duration: 10000,
                        onPress: () => {
                        }
                    });
                }

                // if (
                //     response &&
                //     response.status.code === 200 &&
                //     response.data.ssoenabled && response.data.ssoenabled === 1
                // ) {

                //     // // SAML for others
                //     context.props.navigation.navigate("SSOLogin", {
                //         ssoLoginURL: response.data.ssologin,
                //         domainName,
                //         emailID
                //     });


                //     // Intune SAML
                //     // try {
                //     //     Linking.openURL('microsoft-edge-' + response.data.ssologin).then((result) => {
                //     //       console.warn('Link opened successfully.');
                //     //     }).catch((error) => {
                //     //       Alert.alert('Error', 'Please install edge browser.');
                //     //     });
                //     // } catch (error) {
                //     //     console.warn('Error opening link:', error);
                //     //     Alert.alert('Error', 'Please install edge browser.');
                //     // }

                //     // // MSAL
                //     // global._clientId = '73bafdb3-a9a9-429a-aa1f-e434d195d66c';
                //     // global._tenentId = '90b92f5f-79c4-4fa9-9eea-7265479e6271';
                //     // global._androidRedirectURI = 'msauth://com.eygsl.cbs.routematicqa/pKLmhyA0HEMLOig6q6sLrvpEOUI=';
                //     // global._iosRedirectURI = 'msauth.com.eygsl.cbs.routematicqa://auth';
                //     // setTimeout(() => {
                //     //     context.props.navigation.navigate("IntuneLogin", {
                //     //         domainName,
                //     //         emailID
                //     //     });
                //     // }, 100);
                // } else if (
                //     response &&
                //     response.status.code === 200 &&
                //     response.data.intuneenabled && response.data.intuneenabled === 1
                // ) {
                //     global._clientId = response.data.intuneconfig?.client_id;
                //     global._tenentId = response.data.intuneconfig?.tenant_id;
                //     global._androidRedirectURI = response.data.intuneconfig?.redirect_uri.android;
                //     global._iosRedirectURI = response.data.intuneconfig?.redirect_uri.ios;
                    
                //     setTimeout(() => {
                //         context.props.navigation.navigate("IntuneLogin", {
                //             domainName,
                //             emailID
                //         });
                //     }, 100);
                // } else if (
                //     response &&
                //     response.status.code === 200 &&
                //     response.data.ssoenabled === 0
                // ) {
                //     // context.props.navigation.reset({ routes: [{ name: "Auth" }] });
                //     context.props.navigation.navigate("Login", { emailID });
                // } else if (response.message) {
                //     showMessage({
                //         message: "Routematic",
                //         type: "warning",
                //         description: response.message,
                //         duration: 10000,
                //         onPress: () => {
                //         }
                //     });
                // } else {
                //     showMessage({
                //         message: "Routematic",
                //         type: "warning",
                //         description: "Something went wrong. Please try later.",
                //         duration: 10000,
                //         onPress: () => {
                //         }
                //     });
                // }
            })
            .then(() => context.setState({ isLoading: false }))
            .catch(error => {
                NetworkErrorHandle(error);
                context.setState({ isLoading: false });
            });
    },
    /********************************** Handling Login Response ***************************************/
    login: function (response, context, body) {
        if (!response) {
            Alert1.show(null, "Something went wrong. Please try later.");
            return;
        }
        response
            .then(response => {
                context.setState({ isLoading: false }, () => {
                    setTimeout(() => {
                        if (response.status == "401") {
                            Alert1.show(null, loginString.error401);
                        }
                        if (response.ok) {
                            context.setState({ isLoading: true });
                            response.json().then(data => {
                                // console.warn('Login res - ', data);
                                if (data.status.code == "200") {
                                    global.isPushAllowed = true;
                                    TouchID.isSupported()
                                        .then(biometryType => {
                                            if (biometryType === "TouchID") {
                                                // Touch ID is supported on iOS
                                                Keychain.resetGenericPassword().then(function () {
                                                    Keychain.setGenericPassword(
                                                        body.username,
                                                        body.password
                                                    );
                                                });
                                            } else if (biometryType === "FaceID") {
                                                Keychain.resetGenericPassword().then(function () {
                                                    Keychain.setGenericPassword(
                                                        body.username,
                                                        body.password
                                                    );
                                                });
                                                // Face ID is supported on iOS
                                            } else if (biometryType === true) {
                                                // Touch ID is supported on Android
                                                Keychain.resetGenericPassword().then(function () {
                                                    Keychain.setGenericPassword(
                                                        body.username,
                                                        body.password
                                                    );
                                                });
                                            }
                                        })
                                        .catch(error => {
                                            print("error", JSON.stringify(error));
                                        });

                                    try {
                                        AsyncStorage.multiSet([
                                            [asyncString.DOMAIN_NAME, ""],
                                            [asyncString.hasEverLoggedIn, "Yes"],
                                            [
                                                asyncString.ACCESS_TOKEN,
                                                // JSON.parse(JSON.stringify(data.data.access_token))
                                                CryptoXor.encrypt(
                                                    data.data.access_token,
                                                    asyncString.ACCESS_TOKEN
                                                )
                                            ],
                                            [
                                                asyncString.CAPI,
                                                JSON.parse(JSON.stringify(data.data.capi))
                                            ],
                                            [
                                                asyncString.REFRESH_TOKEN,
                                                CryptoXor.encrypt(
                                                    data.data.refresh_token,
                                                    asyncString.REFRESH_TOKEN
                                                )
                                                // CryptoXor.encrypt(asyncString.REFRESH_TOKEN, JSON.stringify(body))
                                            ],
                                            [asyncString.DID_RE_LOGIN, asyncString.lastForcedLogout],
                                            [asyncString.EXPIRES_IN, data.data.expires_in.toString()],
                                            [asyncString.IS_PUSH_ALLOWED, "true"]
                                        ]).then(() => {
                                            //context.setState({ isLoading: false });
                                            context.setState({ isLoading: false });
                                            // context.props.navigation.navigate("Home");
                                            context.props.navigation.reset({ routes: [{ name: "App" }] })
                                        });
                                    } catch (error) {
                                        // Error saving data
                                        context.setState({ isLoading: false });
                                        Alert1.show(null, error);
                                    }
                                } else {
                                    context.setState({ isLoading: false });
                                    Alert1.show(
                                        null,
                                        JSON.parse(JSON.stringify(data.status.message))
                                    );
                                }
                                setTimeout(() => {
                                    context.setState({ isLoading: false });
                                    if (data.status.code === 40302) {
                                        context.props.navigation.navigate("OTP", {
                                            EmailId: body.username,
                                            comingFromPage: "registerEmail"
                                        });
                                    }
                                }, 200);
                            });
                        } else if (response) {
                            response.json().then(data => {
                                if (data && data.status && data.status.message) {
                                    Alert1.show(
                                        "Login",
                                        JSON.parse(JSON.stringify(data.status.message))
                                    );
                                } else {
                                    Alert1.show(null, "Something went wrong. Please try later...");
                                }
                            });
                        } else {
                            Alert1.show(null, "Something went wrong. Please try later...");
                        }
                    }, 510);
                });
            })
            .catch(error => {
                console.warn("error in login->" + JSON.stringify(error));
                NetworkErrorHandle(error);
                context.setState({ isLoading: false });
                Alert1.show(null, "Something went wrong. Please try later...");
            });
    },
    /********************************** Handling MSAL Login ***************************************/
    loginMSAL: function (response, context) {
        console.warn('msal res - ', response);
        if (!response) {
            Alert1.show(null, "Something went wrong. Please try later.");
            return;
        }
        context.setState({ isLoading: true });
        let data = JSON.parse(response.data);
        console.warn('MSAL Login res - ', data);
        console.warn('MSAL Login resdata - ', data.data);
        if (data.status.code == 200) {
            try {
                AsyncStorage.multiSet([
                    [asyncString.DOMAIN_NAME, ""],
                    [asyncString.hasEverLoggedIn, "Yes"],
                    [
                        asyncString.ACCESS_TOKEN,
                        // JSON.parse(JSON.stringify(data.data.access_token))
                        CryptoXor.encrypt(
                            data.data.access_token,
                            asyncString.ACCESS_TOKEN
                        )
                    ],
                    [
                        asyncString.CAPI,
                        JSON.parse(JSON.stringify(data.data.capi))
                    ],
                    [
                        asyncString.REFRESH_TOKEN,
                        CryptoXor.encrypt(
                            data.data.refresh_token,
                            asyncString.REFRESH_TOKEN
                        )
                        // CryptoXor.encrypt(asyncString.REFRESH_TOKEN, JSON.stringify(body))
                    ],
                    [asyncString.DID_RE_LOGIN, asyncString.lastForcedLogout],
                    [asyncString.EXPIRES_IN, data.data.expires_in.toString()],
                    [asyncString.IS_PUSH_ALLOWED, "true"]
                ]).then(() => {
                    //context.setState({ isLoading: false });
                    context.setState({ isLoading: false });
                    // context.props.navigation.navigate("Home");
                    context.props.navigation.reset({ routes: [{ name: "App" }] })
                });
            } catch (error) {
                // Error saving data
                context.setState({ isLoading: false });
                Alert1.show(null, error);
                context.props.navigation.goBack();
            }
        } else {
            context.setState({ isLoading: false });
            Alert1.show(
                null,
                JSON.parse(JSON.stringify(data.status.message))
            );
            context.props.navigation.goBack();
        }
    } /********************************** Handling Forget Password ***************************************/,
    forgetPassword: function (response, context) {
        response
            .then(response => {
                // console.warn('response --- ', response);
                context.setState({ isLoading: false });
                if (response.status == "401") {
                    Alert1.show(null, forgetPasswordString.error401);
                }
                if (response.status == "400") {
                    Alert1.show(null, forgetPasswordString.error400);
                }
                if (response.ok) {
                    response.json().then(data => {
                        console.warn('JSON fp - ', JSON.stringify(data));
                        if (data.Status == "200") {
                            Toast.show("OTP Has been sent!");
                            context.props.navigation.navigate("OTP", {
                                ...data,
                                EmailId: context.state.EmailId,
                                comingFromPage: "fromForgotPassword"
                            });
                        } else if (data.Status == "40302") {
                            Alert1.show(null, forgetPasswordString.error40302);
                        } else if (data.Status == "40305") {
                            Alert1.show(null, forgetPasswordString.error40305);
                        } else if (data.Status == "40300") {
                            Alert1.show(null, forgetPasswordString.error40300);
                        } else if (data.description) {
                            Alert1.show(null, data.description);
                        } else if (data.Description) {
                            Alert1.show(null, data.Description);
                        } else {
                            Alert1.show(null, forgetPasswordString.error);
                        }
                    });
                }
            })
            .catch(error => {
                console.warn('FP error -- ', error);
                NetworkErrorHandle(error);
                context.setState({ isLoading: false });
            });
    },
    forgetPassword_PT: function (response, context) {
        response
            .then(response => {
                console.warn('response --- ', response);
                context.setState({ isLoading: false });
                if (response.status == "401") {
                    Alert1.show(null, forgetPasswordString.error401);
                }
                if (response.status == "400") {
                    Alert1.show(null, forgetPasswordString.error400);
                }
                if (response.ok) {
                    response.json().then(data => {
                        console.warn('JSON - ', JSON.stringify(data));
                        if (data.status.code == 200) {
                            Toast.show("OTP Has been sent!");
                            context.props.navigation.navigate("OTP", {
                                ...data.data,
                                EmailId: context.state.EmailId,
                                comingFromPage: "fromForgotPassword"
                            });
                        } else if (data.status.code == "40302") {
                            Alert1.show(null, forgetPasswordString.error40302);
                        } else if (data.status.code == "40305") {
                            Alert1.show(null, forgetPasswordString.error40305);
                        } else if (data.status.code == "40300") {
                            Alert1.show(null, forgetPasswordString.error40300);
                        } else if (data.description) {
                            Alert1.show(null, data.description);
                        } else if (data.Description) {
                            Alert1.show(null, data.Description);
                        } else {
                            Alert1.show(null, forgetPasswordString.error);
                        }
                    });
                }
            })
            .catch(error => {
                NetworkErrorHandle(error);
                context.setState({ isLoading: false });
            });
    },
     /********************************** Handling Register Email ***************************************/
    registerEmail: function (response, context) {
        let contentText = "Your transport team has not yet approved your Routematic access. Please contact your transport helpdesk to get your email ID added to the list of approved users.";
        response
            .then(response => {
                context.setState({ isLoading: false });
                if (response.ok) {
                    response.json().then(data => {
                        // console.warn("Reg->" + JSON.stringify(data));
                        if (data.Status == "200") {
                            Toast.show("OTP Has been sent to mobile and email");
                            context.props.navigation.navigate("OTP", {
                                ...data,
                                EmailId: context.state.EmailId,
                                comingFromPage: "registerEmail",
                                Url: data.Url
                            });
                            context.setState({ Url: data.Url });
                        } else if (data.Status == "40300") {
                            Alert1.show("Unable to register", (data.Description && data.Description !== "") ? data.Description : contentText);
                        } else if (data.Status == "40404") {
                            Alert1.show(null, registerEmail.error40404);
                        } else if (data.Status == "40301") {
                            Alert1.show(null, registerEmail.error40301);
                        } else if (data.Status == "40302") {
                            Alert1.show(null, registerEmail.error40302);
                        } else if (data.Status == "40304") {
                            Alert1.show(null, registerEmail.error40304);
                        } else if (data.Status == "400") {
                            Alert1.show(null, registerEmail.error400);
                        } else if (data.Description) {
                            Alert1.show(null, data.Description);
                        }
                    });
                }
            })
            .catch(error => {
                NetworkErrorHandle(error);
                context.setState({ isLoading: false });
            });
    } /********************************** Handling OTP Verify ***************************************/,
    ForgotPasswordOTPVerify: function (response, context) {
        response
            .then(response => {
                context.setState({ isLoading: false });
                response.json().then(data => {
                    if (data.Status == "200") {
                        const { comingFromPage } = context.props.route.params;
                        if (
                            Platform.OS === "ios" &&
                            comingFromPage &&
                            comingFromPage !== "fromForgotPassword"
                        ) {
                            GoogleKeyManager.addEvent("Places API Key", data.IPKey);
                        }
                        if (data.PKey) {
                            global.PKey = data.PKey;
                        }
                        if (data.DMapKey) {
                            global.directionMapKey = data.DMapKey;
                        }
                        if (data.IPKey) {
                            global.ipkey = data.IPKey;
                        }
                        context.setState({
                            otpValidated: true,
                            UserId: data.UserId,
                            SiteLat: data.SiteLat,
                            SiteLong: data.SiteLong,
                            GeoCode: data.GeoCode,
                            Hadd: data.Hadd,
                            HomeLat: data.HomeLat,
                            HomeLong: data.HomeLong,
                            Token: data.Token, //If coming from ForgetPassword this will have data and Others above will not.
                            clusterDetails: {
                                Clusterlat: data.Clusterlat ? data.Clusterlat : "0.0",
                                Clusterlng: data.Clusterlng ? data.Clusterlng : "0.0",
                                Clusterradius: data.Clusterradius,
                                ClusterOutOfRadiusMsg: data.ClusterOutOfRadiusMsg
                            }
                        });
                    } else {

                        context.setState({
                            otpValidated: false
                        });
                        Alert1.show(null, otp.error);
                    }
                });
            })
            .catch(error => {
                NetworkErrorHandle(error);
                context.setState({ isLoading: false });
            })
            .finally(
                context.setState({
                    isLoading: false
                })
            );
    },
    OTPVerify: function (response, context) {
        response
            .then(response => {
                context.setState({ isLoading: false });
                response.json().then(Data => {
                    let data = Data.data;
                    if (Data.status.code === 200) {
                        const { comingFromPage } = context.props.route.params;
                        if (
                            Platform.OS === "ios" &&
                            comingFromPage &&
                            comingFromPage !== "fromForgotPassword"
                        ) {
                            GoogleKeyManager.addEvent("Places API Key", data.ipKey);
                        }
                        if (data.pKey) {
                            global.PKey = data.pKey;
                        }
                        if (data.dMapKey) {
                            global.directionMapKey = data.dMapKey;
                        }
                        if (data.ipKey) {
                            global.ipkey = data.ipKey;
                        }
                        context.setState({
                            otpValidated: true,
                            SiteLat: data.siteLat,
                            SiteLong: data.siteLong,
                            GeoCode: data.geoCode,
                            Hadd: data.hadd,
                            HomeLat: data.homeLat,
                            HomeLong: data.homeLong,
                            clusterDetails: {
                                Clusterlat: data.clusterlat ? data.clusterlat : "0.0",
                                Clusterlng: data.clusterlng ? data.clusterlng : "0.0",
                                Clusterradius: data.clusterradius,
                                ClusterOutOfRadiusMsg: data.clusterOutOfRadiusMsg
                            },
                            registrationToken: data.registrationToken,
                            hasPasswordScreen: data.hasPasswordScreen,
                            seededByEmp: (data.hasOwnProperty('seededByEmp') || data.seededByEmp !== null) ? data.seededByEmp : []
                        });
                    } else {
                        context.setState({
                            otpValidated: false
                        });
                        Alert1.show(null, otp.error);
                    }
                });
            })
            .catch(error => {
                NetworkErrorHandle(error);
                context.setState({ isLoading: false });
            })
            .finally(() => {
                context.setState({
                    isLoading: false
                });
            });
    },
    setCredential: function (response, context) {
        response
            .then(response => {
                context.setState({ isLoading: false });
                if (response.ok) {
                    response.json().then(Data => {
                        let data = Data.data;
                        setTimeout(() => {
                            if (data.status === 200) {
                                Alert1.show(null, "Registration Successful, Please Login Now!");
                                context.props.navigation.dispatch(StackActions.popToTop());
                            } else if (data.status === 40300) {
                                Alert1.show(null, setupPin.error40300);
                            } else if (data.status === 40301) {
                                Alert1.show(null, setupPin.error40301);
                            } else if (data.status === 500) {
                                Alert1.show(null, setupPin.error500);
                            } else if (data.Description) {
                                Alert1.show(null, data.Description);
                            } else {
                                Alert1.show(
                                    "Registration Error",
                                    "There was an error while doing registration. Please try later."
                                );
                            }
                        }, 500);
                    });
                }
            })
            .catch(error => {
                NetworkErrorHandle(error);
                context.setState({ isLoading: false });
            })
            .finally(
                context.setState.bind({
                    isLoading: false
                })
            );
    },
    /********************************** Handling Password Policy ***************************************/
    validatePassword: function (response, context) {
        response.then(response => {
            context.setState({ isLoading: false });
            console.warn("Password response " + JSON.stringify(response));
            response.json().then(data => {
                if (data.status.code === 200) {
                    context.navigateToTpin();
                } else
                    Alert1.show(null, data.status.message);
            }).catch(error => {
                console.warn(JSON.stringify(error));
                NetworkErrorHandle(error);
                context.setState({ isLoading: false });
            }).finally(() => {
                context.setState({ isLoading: false })
            });
        });
    },

    /********************************** Handling Forget Password Update ***************************************/

    updatePassword: function (response, context) {
        response.then(response => {
            context.setState({ isLoading: false });
            if (response.ok) {
                response.json().then(data => {
                    if (data.Status == "200") {
                        if (data.Description) {
                            Alert1.show(null, data.Description);
                        } else Alert1.show(null, "Password updated successfully");
                        //context.props.navigation.push("Login");
                        context.props.navigation.dispatch(StackActions.popToTop());
                    } else if (data.Description) {
                        Alert1.show(null, data.Description);
                    } else if (data.Status == "40300") {
                        Alert1.show(null, forgetPasswordResetString.error40300);
                    } else if (data.Status == "40301") {
                        Alert1.show(null, forgetPasswordResetString.error40301);
                    } else if (data.Status == "40302") {
                        Alert1.show(null, forgetPasswordResetString.error40302);
                    } else {
                        Alert1.show(null, "Something went wrong, try again!");
                    }
                })
                    .catch(error => {
                        console.warn(JSON.stringify(error));
                        NetworkErrorHandle(error);
                        context.setState({ isLoading: false });
                    })
                    .finally(
                        context.setState({
                            isLoading: false
                        })
                    );
            }
        });
    },
    updatePassword_PT: function (response, context) {
        response.then(response => {
            context.setState({ isLoading: false });
            if (response.ok) {
                response.json().then(data => {
                    if (data.status.code == 200) {
                        if (data.status.message) {
                            Alert1.show(null, data.status.message);
                        } else Alert1.show(null, "Password updated successfully");
                        //context.props.navigation.push("Login");
                        context.props.navigation.dispatch(StackActions.popToTop());
                    } else if (data.status.message) {
                        Alert1.show(null, data.status.message);
                    } else if (data.status.code == 40300) {
                        Alert1.show(null, forgetPasswordResetString.error40300);
                    } else if (data.status.code == 40301) {
                        Alert1.show(null, forgetPasswordResetString.error40301);
                    } else if (data.status.code == 40302) {
                        Alert1.show(null, forgetPasswordResetString.error40302);
                    } else {
                        Alert1.show(null, "Something went wrong, try again!");
                    }
                })
                    .catch(error => {
                        console.warn(JSON.stringify(error));
                        NetworkErrorHandle(error);
                        context.setState({ isLoading: false });
                    })
                    .finally(
                        context.setState({
                            isLoading: false
                        })
                    );
            }
        });
    } 
    /********************************** Handling Login-info which is called in background in home ***************************************/,
    LOGIN_INFO: function (response, context) {
        /*response
          .then(response => {*/
        context.setState({ isLoading: false }, () => {
            setTimeout(() => {
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                console.warn('LOGIN-INFO res - ', data);
                if (data.Status === 200) {
                    if (JSON.parse(JSON.stringify(data.UserId)) === noLoginInfo) {
                        const { navigate } = context.props.navigation;
                        // logout(navigate);
                        AsyncStorage.multiRemove(asyncStorageAllKeys, err => {
                            AsyncStorage.getItem(asyncString.DOMAIN_NAME).then(domainName => {
                            if (domainName) {
                                // navigate("SSOEmail");
                                let response = API.fetchGET(URL.SSO_CHECK + domainName);
                                if (response) handleResponse.checkSSO(response, this, domainName);
                            } else {
                                navigate("Login");
                            }
                            });
                        });
                        setTimeout(() => {
                            Alert1.show(
                                "Login Error",
                                "Something went wrong. Please login again"
                            );
                        }, 300);
                    } else {
                        if (Platform.OS === "ios") {
                            GoogleKeyManager.addEvent("Places API Key", data.IPKey);
                        }
                        context.setState({
                            UserId: data.UserId,
                            DToken: data.DToken,
                            UserName: data.UserName,
                            LvTime: data.LvTime * 60000,
                            IdleTimeOutInMins: data.IdleTimeOutInMins * 60000,
                            JBDevicesAllowed: data.JBDevicesAllowed === 1,
                            DMapKey: data.DMapKey ? data.DMapKey : "",
                            isShuttleAllowed: data.ShuttleTrips === 1 ? "true" : "false",
                            isFixedRouteAllowed: data.FRTrips === 1 ? "true" : "false",
                            isNewFixedRouteAllowed: data.WorkFlowType === "1" ? "true" : "false"
                        });

                        //Set LvTime Alert in Days, Hrs, Mins
                        var seconds = parseInt(data.LvTime) * 60;
                        var days = Math.floor(seconds / (3600 * 24));
                        seconds -= days * 3600 * 24;
                        var hrs = Math.floor(seconds / 3600);
                        seconds -= hrs * 3600;
                        var mnts = Math.floor(seconds / 60);
                        seconds -= mnts * 60;
                        var calculatedLVTime = [];
                        if (parseInt(days) > 0) calculatedLVTime.push(days + " days");
                        if (parseInt(hrs) > 0) calculatedLVTime.push(hrs + " hours");
                        if (parseInt(mnts) > 0) calculatedLVTime.push(mnts + " minutes");

                        Alert1.show(
                            null,
                            `You will be logged out of this app in ${calculatedLVTime.join(
                                " "
                            )} as per your organization's Information Security policy.`
                        );
                        setTimeout(() => {
                            if (!global.byPassJailBroken) context.checkRooted(data.JBDevicesAllowed === 1);
                        }, 300);

                        //set the directions key for the directions api
                        if (data.DMapKey) global.directionMapKey = data.DMapKey;
                        if (data.PKey) global.PKey = data.PKey;
                        if (data.IPKey) global.ipkey = data.IPKey;
                        try {
                            AsyncStorage.multiSet([
                                [asyncString.USER_ID, JSON.parse(JSON.stringify(data.UserId))],
                                [asyncString.DTOKEN, JSON.parse(JSON.stringify(data.DToken))],
                                [
                                    asyncString.UserName,
                                    JSON.parse(JSON.stringify(data.UserName))
                                ],
                                [
                                    asyncString.JBDevicesAllowed,
                                    JSON.stringify(data.JBDevicesAllowed == 1)
                                ],
                                [asyncString.LvTime, JSON.stringify(data.LvTime * 60000)],
                                [
                                    asyncString.IdleTimeOutInMins,
                                    JSON.stringify(data.IdleTimeOutInMins * 60000)
                                ],
                                [asyncString.LvTime, JSON.stringify(data.LvTime * 60000)],
                                [
                                    asyncString.IS_SHUTTLE_ENABLED,
                                    data.ShuttleTrips === 1 ? "true" : "false"
                                ],

                                [asyncString.DMapKey, JSON.parse(JSON.stringify(data.DMapKey))],
                                [asyncString.IPKey, JSON.parse(JSON.stringify(data.IPKey))],
                                [
                                    asyncString.LV_TIME_EXPIRY_DATE,
                                    moment()
                                        .add(parseInt(data.LvTime), "m")
                                        .format("YYYY-MM-DD HH:mm")
                                ],
                                [
                                    asyncString.IS_FIXED_ROUTE_ENABLED,
                                    data.FRTrips === 1 ? "true" : "false"
                                ], 
                                [
                                    asyncString.IS_NEW_FIXED_ROUTE_ENABLED,
                                    data.WorkFlowType === "1" ? "true" : "false"
                                ], 
                                [
                                    asyncString.isRosterOptOutEnabled,
                                    data.RosterOptOutIsValid ? data.RosterOptOutIsValid === "Y" ? "true" : "false" : "false"
                                ], [
                                    asyncString.DISCLAIMER_TYPE,
                                    data.RosterOptOutTripType ? data.RosterOptOutTripType : ""
                                ], [
                                    asyncString.ScreenShotAllowed,
                                    data.hasOwnProperty('ScreenShotEnabled') ? data.ScreenShotAllowed === 1 ? "true" : "false" : "true"
                                ]
                            ])
                                .then(() => {
                                    // if (data.PNEnabled === 1) {
                                        //Register the device for push notifications
                                        console.warn('Register the device for push notifications');
                                        try {
                                            Pushy.toggleFCM(true);
                                        } catch (e) {
                                            console.warn("Pushy toggleFCM Error: " + e);
                                        }
                                        Pushy.register()
                                        .then(async deviceToken => {
                                            console.warn("Pushy device token: " + deviceToken);
                                            await API.newFetchJSON(
                                                URL.UPDATE_PUSHY_ID,
                                                {
                                                    os: Platform.OS,
                                                    version: appVersion.v,
                                                    pushyid: await deviceToken
                                                },
                                                true,
                                                () => {
                                                }
                                            );
                                        })
                                        .catch(err => {
                                            console.warn("pushy error");
                                            console.warn(err.message);
                                        });
                                    // }
                                })
                                .then(async () => {
                                    context.setState({
                                        isLoading: false
                                    });
                                });
                        } catch (error) {
                            // Error saving data
                            Alert1.show(null, error);
                        }
                        /* context.showPreviousdayTrip(
                                    data.UserId,
                                    capi,
                                    access_token
                                  );*/
                    }
                } else {
                    console.warn("Should logout immediately....");
                    handleResponse.expireSession(context);
                }
            }, 400);
        });
        // })
        /*.catch(error => {
            NetworkErrorHandle(error);
            context.setState({ isLoading: false });
          });*/
    } /********************************** Handling Logout ***************************************/,
    Logout: function (response, context, navigate) {
        response
            .then(response => {
                context.setState({ isLoading: false });
                AsyncStorage.multiRemove(asyncStorageKeys, err => {
                    AsyncStorage.getItem(asyncString.DOMAIN_NAME).then(domainName => {
                        if (domainName) {
                            // navigate("SSOEmail");
                            let response = API.fetchGET(URL.SSO_CHECK + domainName);
                            console.warn("SSO" + response);
                            if (response)
                                handleResponse.checkSSO(response, context, domainName);
                        } else {
                            navigate("Auth"); // SSOEmail
                        }
                    });
                });
            })
            .catch(error => {
                NetworkErrorHandle(error);
                context.setState({ isLoading: false });
            });
    } /*********************************** GET Trip Details **********************************/,
    getTripDetails: function (response, context, type, navigate) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;

        if (response.hasOwnProperty("code") && response.code === 401) {
            Alert1.show(type, "Something went wrong");
            return;
        }
        if (data.Status == "200") {
            if (type === "Check-in/Check-out") {
                if (data.Trips[0].VehicleID) {
                    if (data.Trips[0].CheckinStatus === "2") {
                        Alert1.show(
                            type,
                            "You have already done Check-in/Check-out for this trip"
                        );
                        return;
                    }

                    context.setState({
                        VehicleID: data.Trips[0].VehicleID,
                        CheckinStatus: data.Trips[0].CheckinStatus,
                        visibleModal: "checkInOut"
                    });
                } else Alert1.show(null, "No Vehicle ID Found");
            } else if (type === "panic") {
                if (data.Trips[0].VehicleID)
                    context.setState({
                        VehicleID: data.Trips[0].VehicleID,
                        visibleModal: "panic"
                    });
                else Alert1.show(null, "No Vehicle ID Found");
            } else if (type === "Call Driver") {
                if (data.Trips[0].CheckinStatus === "2") {
                    Alert1.show(
                        "Call Driver",
                        "Calling a Driver during non trip hours is not allowed. Please try again later."
                    );
                    return;
                }
                if (data.Trips[0].DriverMobileNumber) {
                    context.GetMenuOptionIVR(navigate, type);
                } else Alert1.show(null, "No Vehicle ID Found");
            } else if (type === "Track Vehicle") {
                if (data.Trips[0].CheckinStatus === "2") {
                    Alert1.show(
                        type,
                        "You have already checked-out! Tracking is not permitted on completed trips."
                    );
                    return;
                }
                if (
                    data &&
                    data.Trips[0] &&
                    data.Trips[0].PickupLocation &&
                    data.Trips[0].PickupLocation.includes(",") &&
                    data.Trips[0].PickupLocation.split(",")[0] !== "0.0" &&
                    data.Trips[0].DestinationLocation &&
                    data.Trips[0].DestinationLocation.includes(",") &&
                    data.Trips[0].DestinationLocation.split(",")[0] !== "0.0"
                ) {
                    navigate("TrackVehicle", {
                        Trips: data.Trips[0],
                        CustomerUrl: context.state.CustomerUrl,
                        UserId: context.state.UserId,
                        DMapKey: context.state.DMapKey,
                        ChatEnabled: data.Trips[0].ChatEnabled,
                        access_token: context.state.access_token
                    });
                } else {
                    alert("Something went wrong. Please try later.");
                }
            }
        } else if (data.Description) {
            if (type === "Call Driver" && data.Status === "2000") {
                Alert1.show(
                    "Call Driver",
                    "Calling a Driver during non trip hours is not allowed. Please try again later."
                );
                return;
            }
            if (type === "panic") {
                Alert1.show("SOS", data.Description);
                return;
            }
            Alert1.show(type, data.Description);
        } else {
            Alert1.show(null, "Something went wrong!");
        }
    } /*********************************** Get IVR Details ********************************/,
    getIVRDetails: function (response, context, navigate, type) {
        // console.warn("IVR " + JSON.stringify(response));
        context.setState({ isLoading: false });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;

        if (data.Status == "200") {
            if (data.IVRNumber) {
                Platform.OS === "iOS"
                    ? requestPhoneCallPermission(
                        type === "callTransport"
                            ? "+" + data.IVRNumber
                            // ? "+" + data.IVRNumber + "," + data.IVRMenuOptions[0].Admin
                            : "+" + data.IVRNumber + "," + data.IVRMenuOptions[1].Driver
                    )
                    : context.setState({
                        IVRNumber: data.IVRNumber,
                        Admin: data.IVRMenuOptions[0].Admin,
                        Driver: data.IVRMenuOptions[1].Driver,
                        visibleModal:
                            type === "callTransport" ? "callTransport" : "callDriver"
                    });
            } else Alert1.show(null, "Number not found, Please contact admin");
        } else if (data.Description) {
            Alert1.show(null, data.Description);
        }
    }/*********************************** Get PARKING AUTH Details ********************************/,
    parkingAuth: function (response, context, NativeModules) {
        console.warn("PARK res " + JSON.stringify(response));
        context.setState({ isLoading: false });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        console.warn('park auth data -', data);
        if (response.status == 200) {
            if (Platform.OS == 'android') {
                console.warn('parkauth - ', context.state.guestEmail, data.userinfo, data.access_token, data.refresh_token, data.endpoint);
                NativeModules.ParkingModule.startParkZeus(context.state.guestEmail, data.userinfo, data.access_token, data.refresh_token, data.endpoint);
            } else {
                console.warn('calling pz - ', context.state.guestEmail, NativeModules.ParkZeusModule);
                // ParkZeusModule
                NativeModules.ParkZeusModule.startParkZeus(context.state.guestEmail, data.userinfo, data.access_token, data.refresh_token, data.endpoint);
            }
        } else if (response.description) {
            Alert1.show(null, response.description);
        }
    },
    /*callDriver: function(response, context) {
      context.setState({ isLoading: false });
      let data = response.data;
      if (data.Status === 200) {
        if (data.IVRNumber) Alert.callDriver(data);
        else {
          Alert1.show(null, "No IVR number found. Contact your admin.");
        }
      } else if (data.Description) {
        Alert1.show(null, data.Description);
      }
    },
  */
    callDriver: (response, context) => {
        response
            .then(response => {
                context.setState({ isLoading: false });
                if (response.ok) {
                    response.json().then(data => {
                        console.warn('call driver res - ', data);
                        if (data.Status === 200) {
                            if (data.IVRNumber) Alert1.callDriver(data);
                            else {
                                Alert1.show(null, "No IVR number found. Contact your admin.");
                            }
                        } else if (data.Description) {
                            Alert1.show(null, data.Description);
                        }
                    });
                }
            })
            .catch(error => {
                NetworkErrorHandle(error);
                context.setState({ isLoading: false });
            });
    },
    /********************************** feedbackLast24hrTrip **************************/

    feedbackLast24hrTrip: function (
        response,
        context,
        access_token,
        UserId,
        CustomerUrl,
        lastTripId,
        lastRatedDate
    ) {
        context.setState({ isLoading: false, feedbackLoading: true });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        console.warn('FEEDBACK_PREVIOUS_DAY data -> ',lastTripId, ' - ' , data);
        if (data.status.code === 200) {
            if (data?.data) {
                if (data.data.feedbackRating == 0) {
                    if (data.data.tripId !== lastTripId) {
console.warn('showing feedback dialog');
                        AsyncStorage.multiSet([
                            [asyncString.tripId, data.data.tripId],
                            [
                                asyncString.FEEDBACK_PREVIOUS_DAY_LAST_SAVED_SHIFT_TIME,
                                data.data.shiftTime
                            ]
                        ]).then(() => {
                            // console.warn('Feedback -> ', data.data);
                            /* context.navigationHandler("Last24hrTrip", {
                                    feedbackLast24hrTrip: data.data,
                                    access_token,
                                    UserId,
                                    CustomerUrl,
                                    lastRatedDate
                                  });*/
                            context.setState({
                                feedbackLoading: false,
                                visibleModal: "feedback",
                                feedbackLast24hrTrip: data.data
                            });
                        });
                    } else {
                        context.props.myStore?.disableFeedbackModal();
                        context.setState({ isLoading: false, feedbackLoading: false });
                    }
                } else {
                    context.props.myStore?.disableFeedbackModal();
                    context.setState({ isLoading: false, feedbackLoading: false });
                }
            } else {
                console.warn('Else feedback ');
                context.props.myStore?.disableFeedbackModal();
                context.setState({ isLoading: false, feedbackLoading: false });
            }
        } else {
            context.props.myStore?.disableFeedbackModal();
            context.setState({ isLoading: false, feedbackLoading: false });
        }
    },

    getRosterDetails: function (response, context, navigate, isNewRoster) {
        context.setState({ isLoading: false });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        try {
            let data = response.data;
            if (data.Status === "200") {
                context.setState({
                    availableRosters: data.AvailableRosters,
                    loginShifts: data.LoginShifts,
                    rosterDetails: isNewRoster ? data : JSON.stringify(data)
                });
            } else if (data.Description) {
                Alert1.show(null, data.Description);
                context.props.navigation.dispatch(StackActions.popToTop());
            } else {
                Alert1.show("Roster", "Something went wrong. Please try later.");
                context.props.navigation.goBack();
            }
        } catch (error) {
            console.warn("Err Roster->" + error.message);
            context.props.navigation.goBack();
        }
        setTimeout(function () {
            context.setState({ isLoading: false });
        }, 5000);
    },
    getSelectedRoster: function (response, context, rosterDetails, calculateRoster) {
        context.setState({
            isLoading: false,
            hideCalendar: true
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        let defaultOfficeSelected = findName(
            JSON.parse(rosterDetails).DefaultOffice,
            JSON.parse(rosterDetails).Offices
        );

        if (data.Status === "1005") {
            context.setState({
                RosterID: "0",
                loginSelected: "Select",
                logoutSelected: "Select",
                pickupLocationSelected: "Select",
                dropLocationSelected: "Select",
                officeLoginSelected: defaultOfficeSelected,
                officeLogoutSelected: defaultOfficeSelected,
                showCancel: "",
                anyChangeInData: false,
                anyChangeInDataLogin: false,
                anyChangeInDataLogout: false,
                FabVisible: false
            });
            context.popupDialog.show();
        } else if (data.Status === "200") {
            context.setState({
                selectDateRoster: data
            });

            /**************************** Update Roster ****************************/
            let selectDateRoster = data;
            console.warn("Response " + JSON.stringify(selectDateRoster));
            let pickupLocationSelected = findName(
                selectDateRoster.LoginLocation,
                JSON.parse(rosterDetails).Locations
            );

            let dropLocationSelected = findName(
                selectDateRoster.LogoutLocation,
                JSON.parse(rosterDetails).Locations
            );
            let officeLoginSelected = selectDateRoster.LoginOffice
                ? findName(
                    selectDateRoster.LoginOffice,
                    JSON.parse(rosterDetails).Offices
                )
                : defaultOfficeSelected;

            let officeLogoutSelected = selectDateRoster.LogoutOffice
                ? findName(
                    selectDateRoster.LogoutOffice,
                    JSON.parse(rosterDetails).Offices
                )
                : defaultOfficeSelected;
            context.setState({
                showUpdateRosterWindow: true,
                loginSelected:
                    selectDateRoster.LoginShift === "NS"
                        ? "Cancelled"
                        : selectDateRoster.LoginShift
                            ? selectDateRoster.LoginShift //+ ",0,D"
                            : "Select",
                logoutSelected:
                    selectDateRoster.LogoutShift === "NS"
                        ? "Cancelled"
                        : selectDateRoster.LogoutShift
                            ? selectDateRoster.LogoutShift //+ ",0,D"
                            : "Select",
                pickupLocationSelected,
                dropLocationSelected,
                officeLoginSelected,
                officeLogoutSelected,
                RosterID: selectDateRoster.RosterID,
                showCancel: "|Cancel,0,D",
                anyChangeInData: false,
                anyChangeInDataLogin: false,
                anyChangeInDataLogout: false
            });
            let checkRosterEditRule = context.checkRosterEditRule(calculateRoster[0]);
            if (
                checkRosterEditRule.isLoginModifyAllowed ||
                checkRosterEditRule.isLogoutModifyAllowed
            ) {
                context.RBSheet.open();//QuickAction
            } else {
                context.setState({ FabVisible: false });
                context.popupDialog.show(); // ViewRosterComponent
            }

            /**************************** End of Update Roster **********************/
        } else if (data.Description) {
            Alert1.show(null, data.Description);
        }
    },
    createRosterForSelectedDate: function (response, context) {
        context.setState({ isLoading: false, showLoader: false });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        if (data.Status === "200") {
            if (Platform.OS === "ios") {
                showMessage({
                    message: "Roster",
                    type: "success",
                    description: data.Description,
                    duration: 10000,
                    onPress: () => {
                    }
                });
            } else {
                Alert1.show("Roster", data.Description);
            }

            context.props.navigation.dispatch(StackActions.popToTop());
        } else if (data.Description) {
            let description = JSON.parse(JSON.stringify(data.Description));

            if (Platform.OS === "ios") {
                showMessage({
                    message: "Roster",
                    type: "warning",
                    description: description.split("|").join("\n\n"),
                    duration: 10000,
                    onPress: () => {
                    }
                });
            } else {
                Alert1.show("Roster", description.split("|").join("\n\n"));
            }
        }
    },
    updateRosterForSelectedDate: function (
        response,
        context,
        AvailableRosters,
        isNewRoster
    ) {
        context.setState(
            { isLoading: false, showLoader: false, responsePopup: true },
            () => {
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (!data) return;
                if (data.Status === "200") {
                    if (Platform.OS === "ios") {
                        showMessage({
                            message: "Roster",
                            type: "success",
                            description: data.Description,
                            duration: 10000,
                            onPress: () => {
                            }
                        });
                    } else {
                        Alert1.show("Roster", JSON.parse(JSON.stringify(data.Description)));
                    }
                    context.popupDialog.dismiss();
                    setTimeout(() => {
                        context.props.navigation.dispatch(StackActions.popToTop());
                    }, 400);
                } else if (data.Description) {
                    let description = JSON.parse(JSON.stringify(data.Description));

                    if (Platform.OS === "ios") {
                        showMessage({
                            message: "Roster",
                            type: "warning",
                            description: description.split("|").join("\n\n"),
                            duration: 10000,
                            onPress: () => {
                            }
                        });
                    } else {
                        Alert1.show("Roster", description.split("|").join("\n\n"));
                    }
                }
            }
        );
    },
    checkInOut(response, context, type) {
        context.setState(
            {
                isSliderLoading: false,
                visibleModal: false
            },
            () => {
                setTimeout(() => {
                    let data = response.data;
                    if (data.Status == "200") {
                        if (type === "CI") {
                            var cico = "Checked in";
                        } else {
                            cico = "Checked out";
                        }
                        Alert1.show(cico, "You have successfully " + cico);
                    } else if (data.Description) {
                        Alert1.show(null, data.Description);
                    } else {
                        Alert1.show(null, "Something went wrong");
                    }
                }, 400);
            }
        );
    }
    /********************************** Handling Change Password ***************************************/,
    changePassword: function (response, context) {
        response.then(response => {
            console.warn('changePassword res - ', response);
            context.setState({ isLoading: false });
            if (response.ok) {
                response
                    .json()
                    .then(data => {
                        if (data.Status == "200") {
                            if (data.Description) {
                                Alert1.show(null, data.Description);
                            } else Alert1.show(null, "Set password changed successfully");
                            //context.props.navigation.push("Login");
                            context.props.navigation.dispatch(StackActions.popToTop());
                        } else if (data.Description) {
                            Alert1.show(null, data.Description);
                        } else if (data.Status == "40300") {
                            Alert1.show(null, forgetPasswordResetString.error40300);
                        } else if (data.Status == "40301") {
                            Alert1.show(null, forgetPasswordResetString.error40301);
                        } else if (data.Status == "40302") {
                            Alert1.show(null, forgetPasswordResetString.error40302);
                        } else {
                            Alert1.show(null, "Something went wrong, try again!");
                        }
                    })
                    .catch(error => {
                        NetworkErrorHandle(error);
                        context.setState({ isLoading: false });
                    })
                    .finally(
                        context.setState({
                            isLoading: false
                        })
                    );
            }
        });
    } /****************************************** Submit Feedback ***********************************************/,
    submitFeedback: function (response, context, rating, action, lastRatedDate) {
        context.setState(
            {
                isLoading: false,
                recentlyLoggedIn: false,
                showLoader: false
            },
            () => {
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                context.setState({
                    visibleModal: false
                });
                Toast.show(data.status.message);
                if (action === "Last24hrTrips") {
                    context.props.navigation.navigate("Home");
                    // context.props.navigation.dispatch(StackActions.popToTop());
                } else if (action === "refresh") {
                    context._onRefresh();
                } else if (action === "TrackVehicle") {
                    context.props.navigation.navigate("TrackVehicle");
                } else {
                    context.props.route.params.feedbackRefreshCallback();
                    const { navigate } = context.props.navigation;
                    navigate("Feedback");
                }

                let today = moment().format("YYYY-MM-DD HH:mm");

                if (!lastRatedDate) {
                    console.warn("lastRatedDate->" + lastRatedDate);
                    // if (rating > 3 && Platform.OS === "ios") {
                    //     StoreReview.requestReview();
                    // }
                    // if (rating > 3 && Platform.OS === "android") {
                    //     Alert1.playStoreRating();
                    // }
                    AsyncStorage.setItem(
                        asyncString.lastRatedDate,
                        JSON.stringify(
                            moment()
                                .add(
                                    AppConfig.feedback.appRatingDuration,
                                    AppConfig.feedback.unitType
                                )
                                .format("YYYY-MM-DD HH:mm")
                        )
                    );
                    context.setState({
                        lastRatedDate: JSON.stringify(
                            moment()
                                .add(
                                    AppConfig.feedback.appRatingDuration,
                                    AppConfig.feedback.unitType
                                )
                                .format("YYYY-MM-DD HH:mm")
                        )
                    });
                } else if (moment(today).isSameOrAfter(JSON.parse(lastRatedDate))) {
                    console.warn(
                        "today->" + today + "lastRatedDate->" + JSON.parse(lastRatedDate)
                    );
                    // if (rating > 3 && Platform.OS === "ios") {
                    //     StoreReview.requestReview();
                    // }
                    // if (rating > 3 && Platform.OS === "android") {
                    //     Alert1.playStoreRating();
                    // }
                    AsyncStorage.setItem(
                        asyncString.lastRatedDate,
                        JSON.stringify(
                            moment()
                                .add(
                                    AppConfig.feedback.appRatingDuration,
                                    AppConfig.feedback.unitType
                                )
                                .format("YYYY-MM-DD HH:mm")
                        )
                    );
                    context.setState({
                        lastRatedDate: JSON.stringify(
                            moment()
                                .add(
                                    AppConfig.feedback.appRatingDuration,
                                    AppConfig.feedback.unitType
                                )
                                .format("YYYY-MM-DD HH:mm")
                        )
                    });
                } else {
                    console.warn(
                        "Skip today->" +
                        today +
                        "lastRatedDate->" +
                        JSON.parse(lastRatedDate)
                    );
                }
            }
        );
    } /****************************************** GET Feedback ***********************************************/,
    getFeedback: function (response, context) {
        context.setState({ isLoading: false, refreshing: false });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        if (response.status === 502) {
            Alert1.show(
                null,
                "Unable to perform the operation. Please try later or contact support"
            );
            context.setState({ noData: "No feedback available" });
        }
        let data = response.data;
        if (data.status.code == "200") {
            let array = [];
            if (!Array.isArray(data.data)) {
                array.push(data.data);
            }

            context.setState({
                data: Array.isArray(data.data) ? data.data : array,
                refreshing: false
            });
        } else if (data.status.message) {
            Alert1.show(null, data.status.message);
            context.setState({
                refreshing: false
            });
        } else {
            Alert1.show(null, "Something went wrong");
            context.setState({
                refreshing: false
            });
        }
    },
    getFeedbackCategories: async function (
        response,
        context,
        navigate,
        feedback,
        action
    ) {
        context.setState({ refreshing: false, isLoading: false });

        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        if (data.status.code === 200) {
            if (Object.keys(data.data).length > 0) {
                navigate("CategoryFeedback", {
                    tripId: feedback.tripId,
                    shiftDate: feedback.shiftDate,
                    shiftTime: feedback.shiftTime,
                    rating: feedback.rating,
                    devicecode: context.state.UserId,
                    apiurl: context.state.CustomerUrl,
                    feedbackRefreshCallback: action === "Last24hrTrips" ? null : context._onRefresh.bind(context),
                    data: data.data,
                    action: action,
                    isFromHome: action === "Last24hrTrips",
                    isFromTrips: action === "TrackVehicle",
                    showPreviousTripPopup:
                        action === "Last24hrTrips"
                            ? context.showPreviousTripPopup.bind(context)
                            : null
                });
            }
        } else if (data.status.message) {
            Alert1.show("Feedback", data.status.message);
        }
    },

    /******************************** My Trips ***********************************************/

    myTrips: async (response, context) => {
        context.setState({ isLoading: false });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        if (data.Status === 200) {
            if (!Object.keys(data.Data).length > 0) {
                context.setState({
                    noTrips: true,
                    errorMessage: data.Message
                });
            }
            if (!data.Data && data.Message) {
                context.setState({
                    noTrips: true,
                    errorMessage: data.Message
                });
            }
            context.setState({
                data: data.Data,
                LoginCutoffMinutes: data.LoginCutoffMinutes,
                LogoutCutoffMinutes: data.LogoutCutoffMinutes,
                NoShowCount: data.NoShowCount,
                NoShowErrorMessage: data.NoShowErrorMessage,
                optOutAccepted: false,
                accepted: false
            });
        }
    } /********************************* Cancel My Trip ******************************************/,
    cancelTrip: function (response, context, callBack) {
        console.warn("here ");
        context.setState({ isLoading: false });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        if (data.Status === 200) {
            Alert1.show("My Trip", data.Message);
            callBack();
        }
    },
    /******************************** Get User Details ***********************************************/
    userDetails: async (response, context) => {
        context.setState({ isLoading: false });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        // console.warn('Profile response ', response);
        let data = response.data;
        let Data = data.data.contact;
        // console.warn("Data " + JSON.stringify(Data));
        if (data.status.code === 200) {
            context.setState({
                userDetails: data.data,
                employeePin: Data.employeePin,
                contactNo: Data.contactNo,
                address: Data.address,
                employeePinCopy: Data.employeePin,
                contactNoCopy: Data.contactNo,
                addressCopy: Data.address,
                latitudeCopy: Data.latitude,
                longitudeCopy: Data.longitude,
                emergencyContactNo: Data.emergencyContactNo,
                latitude: Data.latitude,
                longitude: Data.longitude,
                officeLatitude: Data.officeLatitude,
                officeLongitude: Data.officeLongitude,
                officeRadius: Data.officeRadius,
                isProfileApproved: Data.isProfileApproved,
                isEmployeePinEditable: Data.isEmployeePinEditable,
                isContactNoEditable: Data.isContactNoEditable,
                isEmergencyContactNoEditable: Data.isEmergencyContactNoEditable,
                isAddressEditable: Data.isAddressEditable,
                isGeocodeEditable: Data.isGeocodeEditable,
                showLocality: Data.showLocality ? Data.showLocality : null,
                localityId: Data.localityId,
                localityName: Data.localityName,
                localityNameEditable: Data.showLocality === 1 ? Data.isLocalityEditable === true : false,
                vaccinations: data.data.vaccinations,
                vaccinationStatus: Data.vaccinationStatus,
                businessID: Data.businessID,
                guestEmail: Data.emailID,
                alternateContactNo: Data.emergencyContactNo,
                siteID: Data.siteID,
                employeeNumber: Data.employeeNumber,
                pickupLocationAddress:Data.pickupLocationAddress,
                dropLocationAddress:Data.dropLocationAddress,
                pickupLatitude:Data.pickupLatitude,
                pickupLongitude:Data.pickupLongitude,
                dropLatitude:Data.dropLatitude,
                dropLongitude:Data.dropLongitude,
                isPickupAndDropSameLocation:Data.isPickupAndDropSameLocation,
            });
            if (Data.showLocality === 1 && Data.localityId && !context.state.calledPreviously) {
                context.setState({ calledPreviously: true });
                context.getLocalityList();
            }
        } else {
            context.setState({
                isLoading: false,
                isUserProfile: true,
                errorMessage: data.Message
            });
        }

    },
    /******************************** Save User Details ***********************************************/
    saveUserDetails: async (response, context) => {
        context.setState({ isLoading: false });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        // console.warn("here goes the response" + JSON.stringify(response.data));
        let data = response.data;
        if (data.status.code === 200) {
            Alert1.show("User Profile", data.status.message);
            context.props.navigation.dispatch(StackActions.popToTop());
        } else if (response.data.status.code === 400) {
            Alert1.show("User Profile", response.data.status.message);
        }
    }/******************************** Get Locality List ***********************************************/,
    getLocalityList: async (response, context) => {
        context.setState({ isLoading: false });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        console.warn("Locality" + JSON.stringify(response.data));
        let data = response.data;
        if (data.status.code === 200) {
            context.setState({ localityList: data.data });
        } else {
            Alert1.show("User Profile", "Error in getting Locality list ");
        }
    }
    /********************************* SaveAdhoc ******************************************/,
    saveAdhoc: function (response, context) {
        context.setState({ isLoading: false });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        Alert1.show("Flexi Cab", data.Description);
        if (data.Status == "200") {
            context.props.navigation.dispatch(StackActions.popToTop());
        }
    } /********************************* getAdhocPrograms ******************************************/,

    getAdhocPrograms: function (response, context) {
        context.setState({ isLoading: false });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        if (data.Status === "200") {
            context.setState({ responseGetAdhocPrograms: data });
        } else if (data.Description) {
            Alert1.show("Adhoc", data.Description);
        } else {
            Alert1.show("Adhoc", "Something went wrong, Try later");
        }
    } /********************************* getAdhocPrograms ******************************************/,

    getProgramDetails: function (response, context) {
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;

        if (data.Status.Code === 200) {
            context.setState({
                responseGetProgramDetails: data.Data,
                isLoading: false,
                LineManagerEmails:
                    data.Data &&
                        data.Data.LineManagerEmails &&
                        data.Data.LineManagerEmails.length > 0
                        ? data.Data.LineManagerEmails[0]
                        : "",
                lineManagerInputText:
                    data.Data &&
                        data.Data.LineManagerEmails &&
                        data.Data.LineManagerEmails.length > 0
                        ? data.Data.LineManagerEmails[0]
                        : "",
                tripTypeSelected: data.Data.Types.length === 1 ? data.Data.Types[0].Name : "SELECT"
            });
            if (context.state.tripTypeSelected !== null && context.state.tripTypeSelected !== "Others" && context.state.tripTypeSelected !== "SELECT") {
                let source = "SELECT";
                let destination = "SELECT";
                let sourceArray = data.Data.Locations.filter(
                    location => {
                        return location.LocationType === "S";
                    }
                );
                let destinationArray = data.Data.Locations.filter(
                    location => {
                        return location.LocationType === "D";
                    }
                );
                if (sourceArray.length === 1) {
                    source = sourceArray[0].LocationName;
                }
                if (destinationArray.length === 1) {
                    destination = destinationArray[0].LocationName;
                }
                context.setState({
                    fromSelected: source,
                    toSelected: destination
                });
            }

        } else if (data.Status.Message) {
            Alert1.show("Request Adhoc", data.Description);
        } else if (data.Description) {
            Alert1.show("Request Adhoc", data.Description);
        } else if (data.status.message) {
            Alert1.show("Request Adhoc", data.status.message);
        } else {
            Alert1.show("Request Adhoc", "Something went wrong, Try later");
        }
    } /********************************* Get Flexi Details ******************************************/,

    getFlexiDetails: function (response, context) {
        context.setState({ isLoading: false });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        if (data.Status === "200") {
            context.setState({ responseGetFlexiDetails: data });
        } else if (data.Description) {
            Alert1.show("Request flexi cab", data.Description);
        } else {
            Alert1.show("Request flexi cab", "Something went wrong, Try later");
        }
    } /********************************* Get Flexi Details ******************************************/,
    getFlexiCabs: function (response, context) {
        context.setState({ isLoading: false });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        if (data.Status === "200") {
            context.showAvailableCabs(data.Cabs);
        } else if (data.Status === "402") {
            Alert1.show(
                "Request flexi cab",
                "No Cabs currently available for the route"
            );
        } else if (data.Description) {
            Alert1.show("Request flexi cab", data.Description);
        } else {
            Alert1.show("Request flexi cab", "Something went wrong, Try later");
        }
    } /********************************* SAVE FLEXI ******************************************/,
    saveFlexi: function (response, context) {
        context.setState({ isLoading: false });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        Alert1.show(null, data.Description);
        if (data.Status == "200")
            context.props.navigation.dispatch(StackActions.popToTop());
    },
    /***************************** SAVE EMPLOYEE LOCATION *********************************/

    saveEmployeeLocation: function (
        response,
        context,
        type,
        selectedLocation
    ) {
        setTimeout(() => {
            context.setState({ isLoading: false, visibleModal: false });
        }, 0);
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        let newData = [];
        if (data.Status === "200") {
            if (context.state.data) {
                newData = [
                    ...context.state.data,
                    ...[
                        {
                            ID: data.Description,
                            Name: selectedLocation,
                            Address: context.state.selectedLocation,
                            Lat: context.state.selectLat,
                            Lng: context.state.selectLng
                        }
                    ]
                ]
            }

            context.setState({
                newLocation: [
                    {
                        ID: data.Description,
                        Name: selectedLocation,
                        Address: context.state.selectedLocation,
                        Lat: context.state.selectLat,
                        Lng: context.state.selectLng
                    },
                    type
                ],
                data: newData,
                showAddNickName: false,
                selectedLocation: selectedLocation,
            });
            if (type === "Pickup")
                context.setState({
                    fromAddressID: data.Description,
                    pickupLocationSelected: selectedLocation
                });
            else if (type === "Drop")
                context.setState({
                    selectedLocation
                });
        } else {
            Alert1.show("Unable to save location. Try again later.");
        }
    } /***************************** SAVE POI LOCATION *********************************/,
    savePOI: function (response, context, type, selectedLocation) {
        setTimeout(() => context.setState({ isLoading: false }), 0);
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        if (data.status === "200") {
            if (type == "from") {
                Toast.show("From Location: " + data.description);
                context.setState({
                    fromAddressID: data.addressID,
                    fromSelected: selectedLocation
                });
            } else if (type == "to") {
                context.setState({
                    toAddressID: data.addressID,
                    toSelected: selectedLocation
                });
                Toast.show("To Location: " + data.description);
            }
        } else if (data.description) {
            Alert1.show("Adhoc Other Location", data.description);
        } else {
            Alert1.show(
                "Adhoc Other Location",
                "Something went wrong. Please try again..."
            );
        }
    },
    announcement: function (response, context) {
        context.setState({ isLoading: false });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        if (data.status.code === 200) {
            if (data.data.configs) {
                let ipkey = "";
                let pkey = "";
                let dmkey = "";
                if (data.data.configs.hasOwnProperty("ipkey")) {
                    ipkey = data.data.configs.ipkey.key;
                }
                if (data.data.configs.hasOwnProperty("pkey")) {
                    pkey = data.data.configs.pkey.key;
                    global.PKey = pkey;
                }
                if (data.data.configs.hasOwnProperty("dmkey")) {
                    dmkey = data.data.configs.dmkey.key;
                }
                let enableFlexi = "0";
                if (data.data.hasOwnProperty("enableFlexi")) {
                    context.setState({ isFlexiEnabled: data.data.enableFlexi === "1" });
                    enableFlexi = data.data.enableFlexi;
                } else {
                    context.setState({ isFlexiEnabled: false });
                    enableFlexi = "0";
                }
                if (ipkey && dmkey) {
                    if (Platform.OS === "ios") {
                        GoogleKeyManager.addEvent("Places_API_Key", ipkey);
                    }
                    global.directionMapKey = dmkey;
                    try {
                        AsyncStorage.multiSet([
                            [asyncString.IPKey, data.data.configs.ipkey.key],
                            [asyncString.PKey, data.data.configs.pkey.key],
                            [asyncString.DMapKey, data.data.configs.dmkey.key],
                            [asyncString.EnableFlexi, enableFlexi]
                        ]);
                    } catch (error) {
                        // Error saving data
                        Alert1.show(null, error);
                    }
                }
            }


            let isVerifyGeoCode = "false";
            let empVerifyGeoCode = "";
            if (data.data.hasOwnProperty("empVerifyGeoCode")) {
                empVerifyGeoCode = data.data.empVerifyGeoCode;
                console.warn("empVerifyGeoCode->" + JSON.stringify(empVerifyGeoCode));
                if (
                    empVerifyGeoCode.hasOwnProperty("required") &&
                    empVerifyGeoCode.required === 1
                ) {
                    isVerifyGeoCode = "true";
                    context.setState({
                        empVerifyGeoCode,
                        isChangeAddressAllowed: isVerifyGeoCode
                    });
                    context.openVerifyGeoCode(empVerifyGeoCode);
                }
            } else {
                context.setState({ isChangeAddressAllowed: "false" });
            }
            if (data.data.hasOwnProperty("empTncAcceptanceCheck")) {
                let termsAndCondition = data.data.empTncAcceptanceCheck;
                if (termsAndCondition.isEmpTncAccepted === false) {
                    context.props.homeStore.setTermsAndConditionRequired();
                }
            }
            AsyncStorage.multiSet([
                [asyncString.IS_VERIFY_GEO_CODE_ENABLED, isVerifyGeoCode],
                [asyncString.empVerifyGeoCode, JSON.stringify(empVerifyGeoCode)],
                [
                    asyncString.LAST_CACHED_ANNOUNCEMENTS_TIPS_DATE,
                    JSON.stringify(
                        moment()
                            .add("30", "minutes")
                            .format("YYYY-MM-DD HH:mm:ss")
                    )
                ]
            ]).catch(error =>
                console.warn("Verify Geo code error->" + error.message)
            );
            if (data.data.hasOwnProperty("tips")) {
                context.setState({
                    tips: data.data.tips
                });
            }
            if (data.data.hasOwnProperty("announcements")) {
                context.setState({
                    announcements: data.data.announcements
                });
            }
            if (data.data.announcements) {
                try {
                    AsyncStorage.multiSet([
                        [asyncString.CACHED_TIPS, JSON.stringify(data.data.tips)],
                        [
                            asyncString.CACHED_ANNOUNCEMENTS,
                            JSON.stringify(data.data.announcements)
                        ]
                    ]).then(() => {
                        context.setState({
                            tips: data.data.tips,
                            announcements: data.data.announcements
                        });
                    });
                } catch (error) {
                    // Error saving data
                    Alert1.show(null, error);
                }
            }
        }
    },
    expireSession: function (context) {
        setTimeout(() => context.setState({ isLoading: true }), 0);
        const { navigate, reset } = context.props.navigation;

        AsyncStorage.multiRemove(asyncStorageAllKeys, err => {
            AsyncStorage.getItem(asyncString.DOMAIN_NAME).then(domainName => {
                if (domainName) {
                    API.fetchGET(URL.SSO_CHECK + domainName)
                        .then(response => {
                            return response.json();
                        })
                        .then(responseSSO => {
                            handleResponse.handleLogoutForSSO(
                                responseSSO,
                                domainName,
                                context
                            );
                        })
                        .catch(error => {
                            NetworkErrorHandle(error);
                            context.setState({ isLoading: false });
                        })
                        .done(
                            setTimeout(
                                () =>
                                    context.setState({
                                        isLoading: false
                                    }),
                                100
                            )
                        );
                } else {
                    setTimeout(
                        () =>
                            context.setState({
                                isLoading: false
                            }),
                        0
                    );
                    // navigate("Auth");
                    reset({ routes: [{ name: "Auth" }] });
                }
            });
        }).then(() => {
            //Alert1.show("Your session has expired!", "Please login again to continue");
            showMessage({
                message: "Your session has expired!",
                type: "warning",
                description: "Please login again to continue",
                duration: 10000,
                onPress: () => {
                }
            });
        });
    },
    getShuttleDetails: function (response, context) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }

        let data = response.data;
        if (data.status.code === 200) {
            if (data.data.shuttles.length > 0) {
                console.log('Sugan','data=y===='+JSON.stringify(data));
                context.setState({
                    data: data.data.shuttles
                });
            }
        }
    },
    getShuttleRouteDetails: function (response, context) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }

        let data = response.data;
       console.log('Sugan','new Hanlde===='+JSON.stringify(response));

        if (data.status.code === 200) {
            if (data.data.shuttles.length > 0) {
                console.log('Sugan','data=new===='+JSON.stringify(data));
                context.setState({
                    shuttleDetails: data.data.shuttles
                });
            }
        }
    },
    getFixedRoutes: function (response, context) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        console.warn("getFixedRoutes" + JSON.stringify(response));
        let data = response.data;
        if (data.status.code === 200) {
            if (data.data.routes.length > 0) {
                context.props.navigation.navigate("FixedRouteList", {
                    data: data.data.routes
                });
            }
        } else {
            Alert1.show("Search Routes", "" + data.status.message);
        }
    },
    getCategories: function (response, context) {
        context.setState({
            isLoading: false
        });
        console.warn("data" + JSON.stringify(response));
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }

        let data = response.data;
        if (data.status.code === 200) {

            if (data.status.message) {
                context.setState({
                    category: "Your pass category is: " + data.status.message
                })
            }
        }
    },
    getFavFixedRoutes: function (response, context) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        console.warn("fixed route data --> ", data);
        if (data.status.code === 200) {
            if (data.data.routes.length > 0) {
                context.props.navigation.navigate("FixedRouteList", {
                    data: data.data.routes
                });
            } else {
                setTimeout(() => {
                    AsyncStorage.multiGet(
                        [asyncString.FIXED_FAV_ROUTES],
                        (err, savedData) => {
                            let data = JSON.parse(savedData[0][1]);
                            if (data) {
                                //console.warn("raw login "+data.login.length);
                                if ((data.hasOwnProperty("login") && data.login.length > 0) || (data.hasOwnProperty("logout") && data.logout.length > 0)) {
                                    let cached = [];
                                    if (data.hasOwnProperty("logout") && data.logout.length > 0)
                                        cached = data.hasOwnProperty("login") ? data.login.concat(data.logout) : data.logout;
                                    else
                                        cached = data.hasOwnProperty("login") ? data.login : [];
                                    context.props.navigation.navigate("FixedRouteList", {
                                        data: cached,
                                        navigatedFrom: 'home',
                                        cachedData: cached
                                    });
                                } else {
                                    context.props.navigation.navigate("SearchRoutes", {
                                        navigatedFrom: 'home'
                                    });
                                }
                            } else {
                                context.props.navigation.navigate("SearchRoutes", {
                                    navigatedFrom: 'home'
                                });
                            }
                        }
                    );
                }, 100);
            }
        } else if (response.data.status.code === 400) {
            setTimeout(() => {
                AsyncStorage.multiGet(
                    [asyncString.FIXED_FAV_ROUTES],
                    (err, savedData) => {
                        let data = JSON.parse(savedData[0][1]);
                        if (data) {
                            //console.warn("raw login "+data.login.length);
                            if ((data.hasOwnProperty("login") && data.login.length > 0) || (data.hasOwnProperty("logout") && data.logout.length > 0)) {
                                let cached = [];
                                if (data.hasOwnProperty("logout") && data.logout.length > 0)
                                    cached = data.hasOwnProperty("login") ? data.login.concat(data.logout) : data.logout;
                                else
                                    cached = data.hasOwnProperty("login") ? data.login : [];
                                this.props.navigation.navigate("FixedRouteList", {
                                    data: cached,
                                    navigatedFrom: 'home',
                                    cachedData: cached
                                });
                            } else {
                                context.props.navigation.navigate("SearchRoutes", {
                                    navigatedFrom: 'home'
                                });
                            }
                        } else {
                            context.props.navigation.navigate("SearchRoutes", {
                                navigatedFrom: 'home'
                            });
                        }
                    }
                );
            }, 100);
        }
        /*        if (response.data.status.code === 400) {
                    Alert1.show("Fixed Route 1", " need to check");
                }*/
    },
    getFixedRoutesDetails: function (response, context) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }

        let data = response.data;

        if (data.status.code === 200) {
            context.setState({
                data: data.data
            });

        }
    },
    getBusPassTypes: function (response, context) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }

        let data = response.data;

        if (data.status.code === 200) {
            context.setState({
                passTypes: data.data
            });

        }
    },
    getFixedRouteTrackingDetailsNEW: function (response, context, route) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        console.warn('getFixedRouteTrackingDetails --> ', route);
        console.warn('getFixedRouteTrackingDetails ', data);
        if (data.status.code === 200) {
            if (data.data) {
                context.props.navigation.navigate("FixedRouteTrackVehicleNEW", {
                    Trips: {
                        trackeeID: data.data.trackeeID,
                        DriverPhoto: data.data.driverPhoto,
                        DriverName: data.data.driverName,
                        VehicleRegNo: data.data.vehicleRegNo,
                        RouteNumber: data.data.routeNumber,
                        CheckinStatus: "0",
                        TripID: data.data.tripID,
                        fixedRouteId: route.fixedRouteID,
                        shiftId: route.shiftID,
                        CallDriverEnabled: data.data.callDriverEnabled
                    },
                    CustomerUrl: context.state.CustomerUrl,
                    UserId: context.state.UserId,
                    access_token: route.access_token
                })
            } else {
                Alert1.show("Fixed Route", "No Active trips available");
            }
        } else {
            Alert1.show("Fixed Route", data.status.message);
        }
    },
    getFixedRouteTrackingDetails: function (response, context) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        console.warn('getFixedRouteTrackingDetails ', data);
        if (data.status.code === 200) {
            if (data.data) {
                context.props.navigation.navigate("FixedRouteTrackVehicle", {
                    Trips: {
                        trackeeID: data.data.trackeeID,
                        DriverPhoto: data.data.driverPhoto,
                        DriverName: data.data.driverName,
                        VehicleRegNo: data.data.vehicleRegNo,
                        RouteNumber: data.data.routeNumber,
                        CheckinStatus: "0",
                        TripID: data.data.tripID,
                        fixedRouteId: context.state.fixRouteId,
                        shiftId: context.state.selectedShift,
                        shiftName: context.state.selectedShiftTime,
                        routeName: context.state.routeName
                    },
                    stops: context.state.wayPoints,
                    data: context.state.data,
                    routeName: context.state.routeName
                })
            } else {
                Alert1.show("Fixed Route", "No Active trips available");
            }
        } else {
            Alert1.show("Fixed Route", data.status.message);
        }
    },
    getWayPoints: function (response, context) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        if (data.status.code === 200) {
            context.setState({
                officeLocations: data.data.officeLocations,
                nodalPoints: data.data.nodalPoints,
                fixedRoutes: data.data.fixedRoutes
            });
        }
    },
    getBusPasses: function (response, context) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        if (data.status.code === 200) {
            context.props.navigation.dispatch(StackActions.popToTop());
            /*            context.props.navigation.navigate("SearchRoutes", {
                            navigatedFrom: 'home'
                        });*/
        }
        Alert1.show("Generate Pass", data.status.message);
    },
    generateBusTickets: function (response, context) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;

        if (data.status.code === 200) {
            // Alert1.show("Ticket Generation", data.data.response);
            // context.props.navigation.navigate("SearchRoutes", {
            //     navigatedFrom:'home'
            // });
            if (data.data.hasOwnProperty("routes") && data.data.routes[0].tripType === "D" && data.data.isError === false) {
                Alert.alert(
                    'Book for Logout',
                    data.data.response + ' Do you want to book your seat for ' + data.data.routes[0].shiftTime + " logout?.",
                    [
                        {
                            text: 'Cancel',
                            onPress: () => {
                                context.props.navigation.navigate("ETicket", {
                                    passId: context.state.selectedPassId,
                                    FRTrips: true
                                });
                            },
                            style: 'cancel',
                        },
                        {
                            text: 'OK', onPress: () => {
                                context.setState({

                                    selectedRouteId: data.data.routes[0].routeID,
                                    selectedShiftTime: data.data.routes[0].shiftTime,
                                    selectedShiftId: data.data.routes[0].shiftID,
                                    selectedSeatId: '',
                                    shiftTimes: data.data.routes
                                }, () => context.getSeatLayout())
                            }
                        }
                    ],
                    { cancelable: false },
                );
            } else {
                Alert.alert(
                    'Seat Booking',
                    data.data.response,
                    [

                        {
                            text: 'OK', onPress: () => {


                                context.props.navigation.navigate("ETicket", {
                                    passId: context.state.selectedPassId,
                                    FRTrips: true
                                });
                            }
                        }
                    ],
                    { cancelable: false },
                );

            }

        } else {
            Alert1.show("Seat Booking", data.status.message);
        }

    },
    generateTicketShuttle: function (response, context, ticketInformation) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        console.log('Sugan','data======='+JSON.stringify(data));
        if (data.status.code === 200) {
            Toast.show(data.status.message);
            context.props.navigation.navigate("Home");
        } else if (data.status.message) {
            Alert1.show("Shuttle", data.status.message);
        } else {
            Toast.show("Something went wrong. Try later.");
        }
    },
    getAllETickets: function (context, response) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
console.warn('Data - ', data);
        if (data.status.code === 200) {
            let ticketObject = context.state.finalObject;
            ticketObject.tickets = data.data;
            context.setState({
                finalObject: ticketObject,
                passlist: data.data
            });
        } else if (data.status.message) {
            Alert1.show("Shuttle", data.status.message);
        } else {
            Toast.show("Something went wrong. Try later.");
        }
    },
    fixedRouteCheckin: function (context, response) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        console.warn("Data", JSON.stringify(data));
        if (data.Status.Code === 200) {
            Alert1.show("Check-In", data.Status.Message);
            // context.getFixedRouteDetailShowSOS();
            context.getMyTripsUpdate();
        } else if (data.Status.Message) {
            Alert1.show("Check-In", data.Status.Message);
        } else {
            Toast.show("Something went wrong. Try later.");
        }
    },
    fixedRouteSOS: function (context, response) {
        context.setState({
            isLoading: false
        });
        let data = response.data;
        console.warn("Data", JSON.stringify(data));
        if (data.status.code === 200) {
            let object = {
                "passId": context.state.passId,
                "tripID": data.data.tripID,
                "tripEndTime": data.data.tripEndTime
            };
            EventRegister.emit(TYPE.SOS, object);
        } else if (data.status.message) {
            Alert1.show("Check-In", data.status.message);
        } else {
            Toast.show("Something went wrong. Try later.");
        }
    },
    facilityPassCheckin: function (context, response) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        console.warn(data.status.code)
        if (data.status.code === 200) {
            Alert1.show("Check-In", data.data.message);
        } else if (data.status.message) {
            Alert1.show("Check-In", data.status.message);
        } else {
            Toast.show("Something went wrong. Try later.");
        }
    },
    shuttleCheckin: function (context, response) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        console.warn('Checkin response - ', data);
        if (data.status.code === 200) {
            if (data.status.message != undefined) {
                Alert1.show("Check-In", data.status.message);
                context.props.navigation.navigate("Home");
            }
        } else if (data.status.message) {
            Alert1.show("Check-In", data.status.message);
        } else {
            Toast.show("Something went wrong. Try later.");
        }
    },
    QRWithoutPassCheckin: function (context, response, lat, lng) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
       /// console.log('Sugan', 'QRWithoutPassCheckin------' + JSON.stringify(response));
        let data = response.data;
        if (data.status.code === 200) {
            if (data.status.message != undefined) {
                Alert1.show("Check-In", data.status.message);
                context.props.navigation.navigate("Home");
            }
            else {
                context.props.navigation.navigate("ShuttleQRCheckIn",{
                        data:response.data.data,
                        Lat:lat,
                        Lng:lng
                       });
            }
        } else if (data.status.message) {
            Alert1.show("Check-In", data.status.message);
        } else {
            Toast.show("Something went wrong. Try later.");
        }
    },
    QRWithoutPassCheckinLast: function (context, response) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        //  console.warn(data.status.code)
        if (data.status.code === 200) {
            Alert1.show("Check-In", data.status.message);
            context.props.navigation.navigate("Home");

        } else if (data.status.message) {
            Alert1.show("Check-In", data.status.message);
        } else {
            Toast.show("Something went wrong. Try later.");
        }
    },
    getAllPasses: function (context, response) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        console.warn('get pass - ', data);
        if (data.status.code === 200) {
            let passObject = context.state.finalObject;
            passObject.passes = data.data.employeePasses;
            let facilityPasses = passObject;
            facilityPasses.fpasses = data.data.facilityTypes;
            context.setState({
                // finalObject: passObject,
                finalObject: facilityPasses,
                isBookingAllowed: data.data.bookingEnabled,
                passlist: data.data.employeePasses
            });
        } else if (data.status.message) {
            // Alert1.show("Fixed Route", data.status.message);
        } else {
            Toast.show("Something went wrong. Try later.");
        }
    },
    cancelTicket: function (context, response) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        console.warn('get pass - ', data);
        if (data.status.code === 200) {
            Alert1.show("Cancel Ticket", data.status.message);
            context.props.navigation.navigate("Home");

        } else if (data.status.message) {
            Alert1.show("Cancel Ticket", data.status.message);
        } else {
            Toast.show("Something went wrong. Try later.");
        }
    },
    getMyUsages: function (context, response) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        if (data.status.code === 200) {
            context.setState({
                bookings: (context.state.pageState === '' || context.state.pageState === null) ? data.data.facilities :
                    context.state.bookings.concat(data.data.facilities),
                pageState: data.data.pageState
            });
        } else if (data.status.message) {
            // Alert1.show("Fixed Route", data.status.message);
        } else {
            Toast.show("Something went wrong. Try later.");
        }
    },
    getAllBookings: function (context, response) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        if (data.status.code === 200) {
            context.setState({
                bookings: (context.state.pageState === '' || context.state.pageState === null) ? data.data.seats :
                    context.state.bookings.concat(data.data.seats),

                pageState: data.data.pageState
            });
        } else if (data.status.message) {
            // Alert1.show("Fixed Route", data.status.message);
        } else {
            Toast.show("Something went wrong. Try later.");
        }
    },
    cancelBooking: function (context, response) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        if (data.status.code === 200) {
            context.setState({
                isLoading: false,
                bookings: []
            }, () => {
                context.getBookings();
            });
        }
        Alert1.show("Cancel Booking", data.data.response);
    },
    getSeatLayout: function (context, response) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        console.warn('Seat Layout -> ', data);
        if (data.status.code === 200) {
            let seatLayout = data.data.layout;
            let bookedSeats = data.data.hasOwnProperty("seatsBooked") ? data.data.seatsBooked : []
            console.warn("seat" + JSON.stringify(seatLayout))
            context.setState({
                seatLayout: seatLayout,
                bookedSeats: bookedSeats
            });
        } else if (data.status.message) {
            // Alert1.show("Fixed Route", data.status.message);
        } else {
            Toast.show("Something went wrong. Try later.");
        }
    },
    sendChat: function (context, response) {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        if (data.status.code === 200) {
            if (data.status.hasOwnProperty("message"))
                Toast.show(data.status.message);
            /*context.setState(previousState => ({
                  messages: GiftedChat.append(previousState.messages, messages),
                  index: context.state.index + 1
                }));*/
        } else if (data.status.hasOwnProperty("message") && data.status.message) {
            Toast.show(data.status.message);
        } else {
            Toast.show("Something went wrong. Try later.");
        }
    },
    updateGeoCode: (response, context) => {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }

        let data = response.data;
        if (data.status.message) {
            Alert1.show("Verify Geo Code", data.status.message);
        } else {
            Toast.show("Something went wrong. Try later.");
        }
        if (data.status.code === 200) {
            context.setState({ isChangeAddressAllowed: "false" });
            AsyncStorage.multiSet([
                [asyncString.IS_VERIFY_GEO_CODE_ENABLED, "false"],
                [asyncString.empVerifyGeoCode, ""]
            ]).catch(error =>
                console.warn("removing empVerifyGeoCode" + error.message)
            );
        }
    },

    // Nipun Added - opt-out start
    optOut: (response, context) => {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        console.warn('Optout - ', data);
        if (data.status.code === 500) {
            Alert1.show("Opt-Out", data.status.message);
        }
        context.props.navigation.navigate("Optout", {
            html: data.data.tcContent,
            datePickerReq: true,
            tcId: data.data.tcId.ACCESS_TOKEN
        });
    },
    optOutPost: (response, context) => {
        context.setState({
            isLoading: false
        });
        if (!response || response.status === 401) {
            handleResponse.expireSession(context);
            return;
        }
        let data = response.data;
        if (data && data.hasOwnProperty("status")) Toast.show(data.status.message);
        if (data.status.code === 200) {
            context.props.navigation.goBack();
        }
    }
    // Nipun Added opt-out end
};

function findName(id, array) {
    let i;
    for (i = 0; i < array.length; i++) {
        if (array[i].ID.toString().trim() == id.toString().trim()) {
            return array[i].Name;
        }
    }
    return "";
}
