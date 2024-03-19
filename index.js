/**
 * @format
 */

import {AppRegistry, AppState, Platform} from "react-native";
import App from "./App";
import Pushy from "pushy-react-native";
import {name as appName} from './app.json';
import {asyncString} from "./src/utils/ConstantString";
import {showMessage} from "react-native-flash-message";
import {EventRegister} from "react-native-event-listeners";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {TYPE} from "./src/model/ActionType";
import moment from "moment";

// if (__DEV__) {
//     require("react-devtools");
// }
// Pushy.setNotificationListener(async pushData => {
//     console.warn("Index - pushyData -->> ", pushData);
//     let data;
//     let pushAllowed = await AsyncStorage.getItem(asyncString.IS_PUSH_ALLOWED);
//     if (pushAllowed === "true") {
//         if (pushData.hasOwnProperty("Args")) {
//             data = JSON.parse(pushData.Args);
//         } else {
//             data = pushData;
//         }
//         if (data.me === "1") {
//             return;
//         }
//         if (data.hasOwnProperty("waypointstatus")) {
//             if (AppState.currentState === "active") {
//                 let tripTime = moment.utc(data.waypointstatus).format("YYYY-MM-DD HH:mm:ss");
//                 let currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
//                 if (AppState.currentState === "active" && global.isTrackVehicle) {
//                     if (moment(currentTime).isSameOrAfter(tripTime)) {
//                         EventRegister.emit('wayPointApiEvent', 'call waypoint api from pushy')
//                     }
//                 }
//             }
//         } else if (pushData.hasOwnProperty("T")) {
//             if (pushData.T === "TC") {
//                 let notificationTitle = data.hasOwnProperty("sender") ? data.sender : "";
//                 let notificationText = data.hasOwnProperty("text") ? data.text || data.message  : "";
//                 if (notificationText != '') {
//                     if (AppState.currentState === "active") {
//                         if (global.isChatScreen) {
//                             EventRegister.emit(TYPE.CHAT, data)
//                         } else {
//                             if (Platform.OS === 'ios') {
//                                 showMessage({
//                                     message: "Co-passenger " + data.sender + " says:",
//                                     type: "info",
//                                     description: data.text || data.message || "",
//                                     onPress: () => {
//                                         EventRegister.emit(TYPE.CHAT, data);
//                                     }
//                                 });
//                             } else if (Platform.OS === "android") {
//                                 Pushy.setNotificationIcon("ic_launcher");
//                                 Pushy.notify(notificationTitle, notificationText, pushData);
//                                 EventRegister.emit(TYPE.CHAT, data);
//                             }
//                         }
//                     } else {
//                         if (Platform.OS === "ios") {
//                             showMessage({
//                                 message: notificationTitle,
//                                 type: "info",
//                                 description: notificationText,
//                                 onPress: () => {
//                                     EventRegister.emit(TYPE.CHAT, data);
//                                 }
//                             });
//                         } else if (Platform.OS === "android") {
//                             Pushy.setNotificationIcon("ic_launcher");
//                             Pushy.notify(notificationTitle, notificationText, pushData);
//                             EventRegister.emit(TYPE.CHAT, data);
//                         }
//                     }
//                 }
//             } else if (pushData.T === "ERCN") {
//                 let notificationTitle = data.hasOwnProperty('Title') ? data.Title : (data.hasOwnProperty("title") ? data.title : "");
//                 let notificationText = data.hasOwnProperty("Content") ? data.Content : (data.hasOwnProperty("content") ? data.content : "");
//                 let TimeToShow = moment.utc(data.timeToShow).format("YYYY-MM-DD HH:mm:ss");
//                 let currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
//                 // if (moment(currentTime).isSameOrBefore(TimeToShow)) {
//                 if (notificationText != '') {
//                     if (AppState.currentState === "active") {
//                         if (Platform.OS === 'ios') {
//                             showMessage({
//                                 message: notificationTitle,
//                                 type: "warn",
//                                 autoHide:false,
//                                 hideOnPress:true,
//                                 description: notificationText,
//                                 onPress: () => {
//                                     EventRegister.emit(TYPE.ROSTER_CANCEL_PUSH_NOTIFICATION, data);
//                                 }
//                             });
//                         } else if (Platform.OS === "android") {
//                             Pushy.setNotificationIcon("ic_launcher");
//                             Pushy.notify(notificationTitle, notificationText, pushData);
//                             EventRegister.emit(TYPE.ROSTER_CANCEL_PUSH_NOTIFICATION, data);
//                         }
//                     } else {
//                         if (Platform.OS === "ios") {
//                             showMessage({
//                                 message: notificationTitle,
//                                 type: "info",
//                                 autoHide:false,
//                                 hideOnPress:true,
//                                 description: notificationText,
//                                 onPress: () => {
//                                     EventRegister.emit(TYPE.ROSTER_CANCEL_PUSH_NOTIFICATION, data);
//                                 }
//                             });
//                         } else if (Platform.OS === "android") {
//                             Pushy.setNotificationIcon("ic_launcher");
//                             Pushy.notify(notificationTitle, notificationText, pushData);
//                             EventRegister.emit(TYPE.ROSTER_CANCEL_PUSH_NOTIFICATION, data);
//                         }
//                     }
//                 } else {
//                     console.warn('Time not matched note pushy');
//                 }
//             } else if(pushData.T === "EUTN") {
//                 let notificationTitle = data.hasOwnProperty("Title") ? data.Title : (data.hasOwnProperty("title") ? data.title : "");
//                 let notificationText = data.hasOwnProperty("Content") ? data.Content : (data.hasOwnProperty("content") ? data.content : "");
//                 if (notificationText != '') {
//                     if (Platform.OS === "ios") {
//                         EventRegister.emit('wayPointApiEvent', 'Call Way Point Api from Pushy.')
//                     } else if (Platform.OS === "android") {
//                         Pushy.setNotificationIcon("ic_launcher");
//                         Pushy.notify(notificationTitle, notificationText, pushData);
//                         EventRegister.emit('wayPointApiEvent', 'Call Way Point Api from Pushy.')
//                     }
//                 }
//             } else {
//                 let notificationTitle = data.hasOwnProperty("Title") ? data.Title : (data.hasOwnProperty("title") ? data.title : "");
//                 let notificationText = data.hasOwnProperty("Content") ? data.Content : (data.hasOwnProperty("content") ? data.content : "");
//                 if (notificationText != '') {
//                     if (Platform.OS === "ios") {
//                         showMessage({
//                             message: notificationTitle,
//                             type: "info",
//                             autoHide:true,
//                             hideOnPress:false,
//                             description: notificationText,
//                             onPress: () => {
//                                 if (pushData.hasOwnProperty("T") && pushData.T === "EUNP") {
//                                     EventRegister.emit(TYPE.NOTIFICATION_TEXT, data);
//                                 } else if (pushData.hasOwnProperty("T") && pushData.T === "EASP") {
//                                     EventRegister.emit(TYPE.AD_HOC_PUSH_NOTIFICATION, data);
//                                 } else if (pushData.hasOwnProperty("T") && pushData.T === "ERCN") {
//                                     EventRegister.emit(TYPE.ROSTER_CANCEL_PUSH_NOTIFICATION, data);
//                                 }else if(data.hasOwnProperty("T") && data.T === "EUTN"){
//                                     EventRegister.emit('wayPointApiEvent', 'call waypoint api from pushy')
//                                 }
//                             }
//                         });
//                     } else if (Platform.OS === "android") {
//                         Pushy.setNotificationIcon("ic_launcher");
//                         Pushy.notify(notificationTitle, notificationText, pushData);
//                         if (pushData.hasOwnProperty("T") && pushData.T === "EUNP") {
//                             EventRegister.emit(TYPE.NOTIFICATION_TEXT, data);
//                         } else if (pushData.hasOwnProperty("T") && pushData.T === "EASP") {
//                             EventRegister.emit(TYPE.AD_HOC_PUSH_NOTIFICATION, data);
//                         } else if (pushData.hasOwnProperty("T") && pushData.T === "ERCN") {
//                             EventRegister.emit(TYPE.ROSTER_CANCEL_PUSH_NOTIFICATION, data);
//                         }else if(data.hasOwnProperty("T") && data.T === "EUTN"){
//                             EventRegister.emit('wayPointApiEvent', 'call waypoint api from pushy')
//                         }
//                     }
//                 }
//             }
//         }
//     }
// });
Pushy.setNotificationClickListener(async (data) => {
    console.warn("Index - pushy data -->> ", data);
    if (data.hasOwnProperty("T") && data.T === "TC") {
        EventRegister.emit(TYPE.CHAT, data);
    } else if (data.hasOwnProperty("T") && data.T === "EUNP") {
        EventRegister.emit(TYPE.NOTIFICATION_TEXT, JSON.parse(data.Args));
    } else if (data.hasOwnProperty("T") && data.T === "EASP") {
        EventRegister.emit(TYPE.AD_HOC_PUSH_NOTIFICATION, JSON.parse(data.Args));
    } else if (data.hasOwnProperty("T") && data.T === "ERCN") {
        EventRegister.emit(TYPE.ROSTER_CANCEL_PUSH_NOTIFICATION, JSON.parse(data.Args));
    }else if (data.hasOwnProperty("T") && data.T === "EAFP") {
        EventRegister.emit(TYPE.FEEDBACK_PUSH_NOTIFICATION, JSON.parse(data.Args));
    }else if(data.hasOwnProperty("T") && data.T === "EUTN"){
        EventRegister.emit('wayPointApiEvent', 'call  api from pushy')
    }
});

AppRegistry.registerComponent(appName, () => App);
