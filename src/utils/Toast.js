import Toast from "react-native-simple-toast";

export function show(message) {
  Toast.show(message, Toast.LONG);
}
