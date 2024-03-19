// define your styles
import {StyleSheet} from "react-native";
import {colors} from "../utils/Colors";

export const styles = StyleSheet.create({
  loginScreen: {
    flex: 1,
    backgroundColor: "transparent", //colors.WHITE,
    justifyContent: "center",
    alignItems: "center"
  },
  top: {
    width: "80%",
    height: "15%",
    justifyContent: "center",
    alignItems: "center"
    // backgroundColor: colors.WHITE
  },
  windowLayer: {
    //backgroundColor: colors.WHITE,
    width: "90%",
    height: "70%",
    padding: "3%",
    marginBottom: "5%",
    //opacity: 0.2,
    borderRadius: 10,
    shadowColor: colors.GRAY,
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowRadius: 5,
    shadowOpacity: 0.2
  },
  bottom: {
    width: "100%",
    height: "10%",
    justifyContent: "center",
    alignItems: "center"
    //backgroundColor: colors.WHITE
  },

  loginTxtUp: {
    width: "100%",
    marginTop: "10%",
    //fontFamily: 'Helvetica',
    fontSize: 20,
    fontWeight: "bold",
    color: colors.WHITE,
    textAlign: "center"
  },
  upperTextInput: {
    width: 0, //"100%",
    marginTop: "5%",
    // fontFamily: 'Helvetica',
    fontSize: 14,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "left",
    color: colors.GRAY
  },

  forgotPassword: {
    width: "100%",
    marginTop: "5%",
    // fontFamily: 'Helvetica',
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "right",
    color: colors.WHITE,
    textDecorationLine: "underline"
  },
  register: {
    width: "100%",
    // fontFamily: 'Helvetica',
    fontSize: 18,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.WHITE,
    textDecorationLine: "underline",
    textAlign: "center"
  },
  handleMargin: {
    marginTop: "-10%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  vectorIconBlue: {
    fontSize: 30,
    color: colors.WHITE
  },
  vectorIconGreen: {
    fontSize: 30,
    color: colors.GREEN
  },
  vectorIconGray: {
    fontSize: 25,
    color: colors.BORDER
  },
  vectorIconBlack: {
    fontSize: 25,
    color: colors.BLACK
  },

  OTPSent: {
    marginTop: "10%",
    flex: 1,
    flexDirection: "column",
    width: "80%",
    height: "20%",
    // fontFamily: 'Helvetica',
    fontSize: 14,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "left",
    color: colors.GRAY,
    backgroundColor: colors.GREEN
  },

  email: {
    width: "80%",
    height: 20,
    // fontFamily: 'Helvetica',
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.WHITE,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "10%"
  },
  emailSent: {
    width: "80%",
    height: 20,
    // fontFamily: 'Helvetica',
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.WHITE,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10
  },
  logo: {
    height: "100%",
    width: "60%",
    marginTop: "40%",
    resizeMode: "contain",
    alignItems: "center",
    justifyContent: "center"
  },
  button: {
    marginTop: 20,
  },
  buttonSmallLayout: {
    width: "100%",
    height: "20%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "10%"
  },
  buttonSmallLayoutRow: {
    width: "100%",
    height: "40%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "10%"
  },
  buttonSmall: { width: "40%" },
  inputText: {
    height: "15%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor:colors.WHITE,
    borderBottomWidth:1,
  },
  inputTextNoBorder: {
    height: "15%",
    borderBottomWidth: 0
  },
  menu: {
    width: window.width,
    height: window.height
  },
  avatarContainer: {
    marginBottom: 20,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.BLACK,
    opacity: 0.8
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  name: {
    position: "absolute",
    left: 60,
    top: 15
  },
  item: {
    fontSize: 14,
    fontWeight: "300",
    paddingTop: 5
  },
  logo_welcome: {
    height: "100%",
    width: "100%",
    //marginTop: "30%",
    resizeMode: "contain",
    alignItems: "center",
    justifyContent: "center"
  }
});
