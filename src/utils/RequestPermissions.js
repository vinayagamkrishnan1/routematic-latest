import {Alert, Linking, PermissionsAndroid, Platform} from "react-native";
import RNImmediatePhoneCall from "react-native-immediate-phone-call";

export async function requestPhoneCallPermission(phoneNumber) {
    if (Platform.OS === "android" && Platform.Version > 22)
      try {
        
        Linking.openURL(`tel:${phoneNumber}`);
        // const granted = await PermissionsAndroid.request(
        //   PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        //   {
        //     title: "Phone call Permission",
        //     message: "Please allow us with phone call permission"
        //   }
        // );
        // if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        //   RNImmediatePhoneCall.immediatePhoneCall(phoneNumber);
        // } else {
        //   Alert.alert("Oops!", "Please give permission to make call");
        // }
      } catch (err) {
        console.warn(err);
      }
    else RNImmediatePhoneCall.immediatePhoneCall(phoneNumber);
  }