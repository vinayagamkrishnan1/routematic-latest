// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {URL} from "../network/apiConstants";
import DeviceInfo from "react-native-device-info";
// import {API} from "../network/apiFetch/API";
// import {handleResponse} from "../network/apiResponse/HandleResponse";

export const appVersion = {
  v: DeviceInfo.getVersion(), //"6.0.0",
  TrackeeKey: "r0u73M@7!C!57hE8o41D@tR30!5"
};

export const asyncString = {
  lastForcedLogout: "14Dec2018",
  LOGIN_INFO: "login_info",
  ACCESS_TOKEN: "access_token",
  ACCESS_TOKEN_HAS_EXPIRED: "access_token_has_expired",
  DID_RE_LOGIN: "did_re_login",
  REFRESH_TOKEN: "refresh_token_tmp_",
  USER_ID: "UserId",
  DTOKEN: "DToken",
  CAPI: "capi",
  UserName: "UserName",
  credential: "loginData",
  JBDevicesAllowed: "JBDevicesAllowed",
  LvTime: "LvTime",
  IdleTimeOutInMins: "IdleTimeOutInMins",
  tripId: "tripId",
  lastRatedDate: "lastRatedDate",
  DMapKey: "DMapKey",
  IPKey: "IPKey",
  PKey: "PKey",
  DOMAIN_NAME: "domainName",
  hasEverLoggedIn: "hasEverLoggedIn",
  EXPIRES_IN: "expires_in",
  FEEDBACK_PREVIOUS_DAY_LAST_SAVED_SHIFT_TIME:
    "FEEDBACK_PREVIOUS_DAY_LAST_SAVED_SHIFT_TIME",
  LAST_ANNOUNCEMENT_UPDATED: "LAST_ANNOUNCEMENT_UPDATED",
  LAST_CACHED_ANNOUNCEMENTS_TIPS_DATE: "LAST_CACHED_ANNOUNCEMENTS_TIPS_DATE",
  CACHED_ANNOUNCEMENTS: "CACHED_ANNOUNCEMENTS",
  CACHED_TIPS: "CACHED_TIPS",
  IS_SHUTTLE_ENABLED: "IS_SHUTTLE_ENABLED",
  IS_FIXED_ROUTE_ENABLED: "IS_FIXED_ROUTE_ENABLED",
  IS_NEW_FIXED_ROUTE_ENABLED: "IS_NEW_FIXED_ROUTE_ENABLED",
  IS_VERIFY_GEO_CODE_ENABLED: "IS_VERIFY_GEO_CODE_ENABLED",
  empVerifyGeoCode: "empVerifyGeoCode",
  IS_PUSH_ALLOWED: "IS_PUSH_ALLOWED",
  LV_TIME_EXPIRY_DATE: "LV_TIME_EXPIRY_DATE",
    HQT_TIME_INTERVAL: "hqt_polling_duration",
    FIXED_FAV_ROUTES:"fixed_fav_routes",
    isRosterOptOutEnabled:"isRosterOptOutEnabled",
    DISCLAIMER_TYPE:"disclaimer_type",
    CHECK_IN: "CHECK_IN",
    FEEDBACK:"FEEDBACK",
    ScreenShotAllowed:"ScreenShotAllowed",
    EnableFlexi:"enableFlexi",
    SOS:"SOS"

};
export const loginString = {
  enterEmail: "Enter Email ID",
  emailBlank: "Email ID cannot be blank.",
  enterValidEmail: "Invalid email ID or password.",
  enterPassword: "Enter password",
  passwordBlank: "Password cannot be blank.",
  enterValidPassword: "Invalid email ID or password.",
  dontHaveAccount: "New User Sign Up",
  register: "Sign Up",
  error401: "Invalid email ID or password",
  somethingWentWrong: "Something went wrong. Please try again.",
    safeDropBeforeCheckout:"For your safety, it is advisable to initiate Safe Drop after checkout from the trip. Are you sure you want to continue with Safe Drop Confirmation?"
};
export const pushNotification={
    isPushNotificationToDisplay:"isPushNotificationToDisplay",
    PushNotificationObject:"PushNotificationObject"
};
export const pushClearKeys=[
    pushNotification.isPushNotificationToDisplay,
    pushNotification.PushNotificationObject
];
export const roster = {
    login: "LOGIN",
    logout: "LOGOUT",
    cancelled: "Cancelled",
    select: "Select",
    noSchedule: "No Schedule",
};
export const forgetPasswordString = {
  enterEmail: "Official Email ID",
  emailBlank: "Email ID cannot be blank",
  alreadyHaveAccount: "Go back to Sign In",
  login: "Sign in",
  error401: "Invalid email ID.",
  error400: "Invalid email ID.",
  error40302: "Unregistered user. Please register to access Routematic.",
  error40305: "User does not exist. Please contact support.",
  error40300: "User does not exist. Please contact support.",
  error: "Something went wrong. Please try again.",
  connectivityIssue:
    "Unable to connect to server. Please check your internet connection and try again."
};

export const registerEmail = {
  enterEmail: "Enter Email ID",
  emailBlank: "Email ID cannot be blank.",
  enterValidEmail: "Invalid email ID.",
  alreadyHaveAccount: "Existing user Sign in",
  login: "Sign in",
  error401: "Invalid email ID.",
  error400: "Invalid email ID.",
  error40302: "Invalid email ID.",
  error40305: "User does not exist. Please contact support.",
  error40300: "Invalid email ID. Please contact support.",
  error40301: "User already registered. Please sign in to access your account.",
  error40304: "Please use your personal id for Rideshare.",
  error40404: "Please use Routematic website to do sign up.",
  error: "Something went wrong. Please try again."
  //"Please contact your transport admin to get your email activated."
};

export const otp = {
  enterOTP: "Enter OTP",
  otpBlank: "OTP cannot be blank.",
  otpLength: "Invalid OTP.",
  title: "Verify OTP",
  nextButtonText: "Next",
  prevButtonText: "Previous",
  resendOTP: "Resend OTP",
  verifyOTP: "Verify OTP",
  error: "Invalid OTP",
  emailSent: "OTP has been sent to your mobile."
};

export const setupPassword = {
  enterPassword: "Password",
  oldEnterPassword: "Old Password",
  newEnterPassword: "New Password",
  newConfirmEnterPassword: "Confirm New Password",
  passwordBlank: "Password cannot be blank.",
  passwordInvalid:
    "Password must contain min 8 character with a min of one lowercase alphabet, one uppercase alphabet, one numeric character and one special character.",
  enterConfirmPassword: "Confirm Password",
  confirmPasswordBlank: "Password cannot be blank.",
  confirmPasswordInvalid:
    "Password must contain min 8 character with a min of one lowercase alphabet, one uppercase alphabet, one numeric character and one special character.",
  donotMatch: "Passwords do not match.",
  title: "Set Password",
  nextButtonText: "Next",
  prevButtonText: "Previous",
  error: "Passwords do not match."
};

export const setupPin = {
  enterPin: "T-Pin",
  pinBlank: "T-Pin cannot be blank.",
  pinInvalid: "Invalid T-Pin.",
  enterConfirmPin: "Confirm T-Pin",
  confirmPinBlank: "T-Pin cannot be blank.",
  confirmPinInvalid: "Invalid T-Pin.",
  donotMatch: "T-Pin values do not match.",
  title: "Set T-Pin",
  nextButtonText: "Next",
  prevButtonText: "Previous",
  error: "T-Pin values do not match.",
  error40300: "Password does not conform to your company password policy.",
  error40301:
    "Unable to validate credentials. Please try again Or contact support.",
  error500:
    "Unable to validate credentials. Please try again Or contact support.",
    whyPin:"T-PIN will be required to authenticate yourself when you call the transport helpdesk"
};
export const setupMandatoryFields = {
    gender:"Gender",
    genderBlank:"Invalid Gender,Please Select Gender",
    mobileNO: "MobileNo ",
    mobileNoBlank: "Mobile No cannot be blank.",
    mobileNoInvalid: "Invalid Mobile No.",
    pickupLocationID:"Pickup Location ",
    pickupLocationBlank:"Pickup Location cannot be blank",
    dropLocationID:"Drop Location ",
    dropLocationBlank:"Drop Location cannot be blank",
    title: "Profile",
    nextButtonText: "Next",
    prevButtonText: "Previous",

};


export const forgetPasswordResetString = {
  password_mismatch: "Passwords do not match.",
  error40300: "Password does not conform to your company password policy.",
  error40302: "Something went wrong. Please try again.",
  error40301: "Invalid password."
};
export const noShow = {
    are_you_sure: ". Are you sure you want to continue?",
    noShowMessage: "This will result in No Show, Are you sure you want to continue?",
    normal: "Are you sure you want to cancel the roster for ",
    normal_title:"Update Roster",
    no_show_title:"No Show Alert",
    cancel_roster:"Are you sure you want to cancel the roster?",
    adhocAlert1:'This action will cancel any existing LOGIN request you have for DATE and might result in No Show if the shift cut off has expired.\n' +
        'Are you sure you want to proceed?',
};

export const adhoc = 'Adhoc';
export const Select = 'Select';

// export const logout = navigate => {
//   AsyncStorage.multiRemove(asyncStorageAllKeys, err => {
//     AsyncStorage.getItem(asyncString.DOMAIN_NAME).then(domainName => {
//       if (domainName) {
//         // navigate("SSOEmail");
//         let response = API.fetchGET(URL.SSO_CHECK + domainName);
//         if (response) handleResponse.checkSSO(response, this, domainName);
//       } else {
//         navigate("Login");
//       }
//     });
//   });
// };


export const noLoginInfo = "00000000-0000-0000-0000-000000000000";

export const asyncStorageAllKeys = [
  asyncString.ACCESS_TOKEN,
  asyncString.USER_ID,
  asyncString.DTOKEN,
  asyncString.LOGIN_INFO,
  asyncString.REFRESH_TOKEN,
  asyncString.CAPI,
  asyncString.UserName,
  asyncString.credential,
  asyncString.JBDevicesAllowed,
  asyncString.LvTime,
  asyncString.IdleTimeOutInMins,
  asyncString.tripId,
  asyncString.lastRatedDate,
  asyncString.DMapKey,
  asyncString.IPKey,
  asyncString.EXPIRES_IN,
  asyncString.FEEDBACK_PREVIOUS_DAY_LAST_SAVED_SHIFT_TIME,
  asyncString.LAST_CACHED_ANNOUNCEMENTS_TIPS_DATE,
  asyncString.CACHED_ANNOUNCEMENTS,
  asyncString.ACCESS_TOKEN_HAS_EXPIRED,
  asyncString.CACHED_TIPS,
  asyncString.IS_PUSH_ALLOWED,
  asyncString.LV_TIME_EXPIRY_DATE,
  asyncString.IS_VERIFY_GEO_CODE_ENABLED,
  asyncString.empVerifyGeoCode,
    asyncString.FIXED_FAV_ROUTES,
    asyncString.isRosterOptOutEnabled,
    asyncString.DISCLAIMER_TYPE,
    asyncString.FEEDBACK,
    "refresh_token" //Clearing the previous data
];
