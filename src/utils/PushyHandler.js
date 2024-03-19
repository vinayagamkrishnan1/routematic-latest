import Pushy from "pushy-react-native";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { asyncString } from "./ConstantString";
import { EventRegister } from "react-native-event-listeners";

export const pushyListenerWithHandler = () => {
  // console.warn("Registered Listener...");
  let data;
  Pushy.setNotificationListener(async pushData => {
    if (Platform.OS === "android") Pushy.setNotificationIcon("ic_launcher");
    // console.warn(JSON.stringify(pushData));
    let pushAllowed = await AsyncStorage.getItem(asyncString.IS_PUSH_ALLOWED);
    // console.warn("pushAllowed->" + pushAllowed);

    if (pushAllowed === "true") {
      if (pushData.hasOwnProperty("Args")) {
        data = JSON.parse(pushData.Args);
      } else {
        data = pushData;
      }
      // console.warn("AppState->" + AppState.currentState);
      if (Platform.OS === "ios") {
        if (AppState.currentState !== "active") {
          let notificationTitle = "Co-passenger " + data.sender + " says:";

          // Attempt to extract the "message" property from the payload: {"message":"Hello World!"}
          let notificationText =
            data.text || data.message || "A new message received";

          // Display basic system notification
          Pushy.notify(notificationTitle, notificationText);
        } else {
          // console.warn("data.TripID--->" + data.tid);
          EventRegister.emit("NotificationEvent", {
            title: data.sender,
            body: data.text || data.message || "A new message received",
            TripID: data.tid
          });
        }
      } else {
        let notificationTitle = data.sender;

        // Attempt to extract the "message" property from the payload: {"message":"Hello World!"}
        let notificationText =
          data.text || data.message || "A new message received";

        // Display basic system notification
        Pushy.notify(notificationTitle, notificationText);
      }
    } else {
      // console.warn("Push not allowed on Login Screen...");
    }
  });
};
