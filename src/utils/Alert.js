import { Alert } from "react-native";
import { requestPhoneCallPermission } from "./RequestPermissions";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Rate, { AndroidMarket } from "react-native-rate";
// import moment from "moment";
// import { AppConfig } from "../config";

/*export function show(message) {
  alert(message);
}*/
export function show(title, message) {
  setTimeout(() => {
    Alert.alert(title, message);
  }, 500);
}
export function playStoreRating() {
  this.timeout = setTimeout(() => {
    Alert.alert(
      "Thank You",
      "Take a moment to rate us on Playstore",
      [
        {
          text: "Remind Me Later",
          onPress: () => {},
          style: "cancel"
        },
        {
          text: "Rate Now",
          onPress: () => {
            // let options = {
            //   GooglePackageName: "com.routematic.employee",
            //   preferredAndroidMarket: AndroidMarket.Google,
            //   preferInApp: false
            // };
            // Rate.rate(options, success => {
            //   if (success) {
            //     // this technically only tells us if the user successfully went to the Review Page. Whether they actually did anything, we do not know.
            //     // context.setState({ rated: true });
            //     AsyncStorage.setItem(
            //       asyncString.lastRatedDate,
            //       JSON.stringify(
            //         moment()
            //           .add(
            //             AppConfig.feedback.appRatingDuration,
            //             AppConfig.feedback.unitType
            //           )
            //           .format("YYYY-MM-DD HH:mm")
            //       )
            //     );
            //   }
            // });
          }
        }
      ],
      { cancelable: false }
    );
  }, 100);
}
export function callDriver(data) {
  if (!data) return;
  Alert.alert(
    "Call Driver",
    "Do you want to call the driver?",
    [
      {
        text: "No",
        onPress: () => {},
        style: "cancel"
      },
      {
        text: "Yes",
        onPress: () => {
          if (data.IVRNumber) {
            requestPhoneCallPermission(
              "+" + data.IVRNumber + "," + data.IVRMenuOptions[1].Driver
            );
          } else Alert.show(null, "Number not found, Please contact admin");
        }
      }
    ],
    { cancelable: true }
  );
}
