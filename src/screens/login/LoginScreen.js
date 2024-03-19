import React, { Component } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Icon } from "native-base";
import * as Animatable from "react-native-animatable";
import { styles } from "../../commonStyles/Styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import TouchableDebounce from "../../utils/TouchableDebounce";

const SCREEN_HEIGHT = Dimensions.get("window").height;
let duration = 0;

class LoginScreen extends Component {
  static navigationOptions = {
    title: "Login",
    headerStyle: { display: "none" },
    headerLeft: null
  };

  constructor(props) {
    super(props);
    this.state = {
      placeholderText: "Enter your email address"
    };
  }
  UNSAFE_componentWillMount() {
    this.loginHeight = new Animated.Value(150);
    this.keyboardWillShowListener = Keyboard.addListener(
      "keyboardWillShow",
      this.keyboardWillShow
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      "keyboardWillHide",
      this.keyboardWillHide
    );
    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      this.keyboardWillShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      this.keyboardWillHide
    );
    this.keyboardHeight = new Animated.Value(0);
    this.forwardArrowOpacity = new Animated.Value(0);
    this.borderBottomWidth = new Animated.Value(0);
  }
  keyboardWillShow = event => {
    if (Platform.OS === "android") {
      duration = 100;
    } else {
      duration = event.duration;
    }

    Animated.parallel([
      Animated.timing(this.keyboardHeight, {
        duration: duration + 100,
        toValue: event.endCoordinates.height + 10
      }),
      Animated.timing(this.forwardArrowOpacity, {
        duration: duration,
        toValue: 1
      }),
      Animated.timing(this.borderBottomWidth, {
        duration: duration,
        toValue: 1
      })
    ]).start();
  };
  keyboardWillHide = event => {
    if (Platform.OS === "android") {
      duration = 100;
    } else {
      duration = event.duration;
    }

    Animated.parallel([
      Animated.timing(this.keyboardHeight, {
        duration: duration + 100,
        toValue: 0
      }),
      Animated.timing(this.forwardArrowOpacity, {
        duration: duration,
        toValue: 0
      }),
      Animated.timing(this.borderBottomWidth, {
        duration: event.duration,
        toValue: 0
      })
    ]).start();
  };
  increaseHeightOfLogin = () => {
    this.setState({ placeholderText: "user@domain.com" });
    Animated.timing(this.loginHeight, {
      toValue: SCREEN_HEIGHT,
      duration: 500
    }).start(() => {
      this.refs.textInputMobile.focus();
    });
  };

  decreaseHeightOfLogin = () => {
    Keyboard.dismiss();
    Animated.timing(this.loginHeight, {
      toValue: 150,
      duration: 500
    }).start();
  };
  render() {
    const headerTextOpacity = this.loginHeight.interpolate({
      inputRange: [150, SCREEN_HEIGHT],
      outputRange: [1, 0]
    });
    const marginTop = this.loginHeight.interpolate({
      inputRange: [150, SCREEN_HEIGHT],
      outputRange: [25, 100]
    });
    const headerBackArrowOpacity = this.loginHeight.interpolate({
      inputRange: [150, SCREEN_HEIGHT],
      outputRange: [0, 1]
    });
    const titleTextLeft = this.loginHeight.interpolate({
      inputRange: [150, SCREEN_HEIGHT],
      outputRange: [100, 25]
    });
    const titleTextBottom = this.loginHeight.interpolate({
      inputRange: [150, 400, SCREEN_HEIGHT],
      outputRange: [0, 0, 100]
    });
    const titleTextOpacity = this.loginHeight.interpolate({
      inputRange: [150, SCREEN_HEIGHT],
      outputRange: [0, 1]
    });
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <Animated.View
          style={
            {
              position: "absolute",
              height: 60,
              width: 60,
              top: 60,
              left: 25,
              zIndex: 100,
              opacity: headerBackArrowOpacity
            } //animated
          }
        >
          <TouchableOpacity onPress={() => this.decreaseHeightOfLogin()}>
            <Icon name="md-arrow-back" style={{ color: "black" }} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={
            {
              position: "absolute",
              height: 60,
              width: 60,
              right: 10,
              bottom: this.keyboardHeight,
              opacity: this.forwardArrowOpacity,
              zIndex: 100,
              backgroundColor: "#54575e",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 30
            } // animated //animated
          }
        >
          <TouchableDebounce
            onPress={() => alert("Hello")}
            style={{
              height: 60,
              width: 60,
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Icon name="md-arrow-forward" style={{ color: "white" }} />
          </TouchableDebounce>
        </Animated.View>

        <ImageBackground style={{ flex: 1 }}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Animatable.View
              animation="zoomIn"
              iterationCount={1}
              style={{
                backgroundColor: "white",
                height: 100,
                width: 150,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <View style={styles.handleMargin}>
                <Image
                  source={require("../../assets/routematic.png")}
                  style={styles.logo_welcome}
                />
              </View>
            </Animatable.View>
          </View>

          {/** BOTTOM HALF **/}
          <Animatable.View animation="slideInUp" iterationCount={1}>
            <Animated.View
              style={
                { height: this.loginHeight, backgroundColor: "white" } //animated
              }
            >
              <Animated.View
                style={
                  {
                    opacity: headerTextOpacity,
                    alignItems: "flex-start",
                    paddingHorizontal: 25,
                    marginTop: marginTop
                  } //animated //animated
                }
              >
                <Text style={{ fontSize: 24 }}>Welcome to Routematic</Text>
              </Animated.View>

              <TouchableOpacity onPress={() => this.increaseHeightOfLogin()}>
                <Animated.View
                  style={
                    {
                      marginTop: marginTop,
                      paddingHorizontal: 25,
                      flexDirection: "row"
                    } //animated
                  }
                >
                  <Animated.Text
                    style={
                      {
                        fontSize: 24,
                        color: "gray",
                        position: "absolute",
                        bottom: titleTextBottom,
                        left: titleTextLeft,
                        opacity: titleTextOpacity
                      } //animated //animated //animated
                    }
                  >
                    Enter your email address
                  </Animated.Text>

                  {/*<Image*/}
                  {/*source={require("../../assets/india.png")}*/}
                  {/*style={{ height: 24, width: 24, resizeMode: "contain" }}*/}
                  {/*/>*/}

                  <Ionicons
                    name="ios-mail"
                    style={styles.vectorIconGray}
                  />
                  <Animated.View
                    pointerEvents="none"
                    style={
                      {
                        flexDirection: "row",
                        flex: 1,
                        borderBottomWidth: this.borderBottomWidth
                      } //animated
                    }
                  >
                    <TextInput
                      ref="textInputMobile"
                      style={{ flex: 1, fontSize: 20, marginLeft: 5 }}
                      placeholder={this.state.placeholderText}
                      underlineColorAndroid="transparent"
                      contextMenuHidden={true}
                      autoCapitalize="none"
                      multiline={false}
                      autoCorrect={false}
                      numberOfLines={1}
                      keyboardType="email-address"
                      returnKeyType="next"
                    />
                  </Animated.View>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
            <View
              style={{
                height: 70,
                backgroundColor: "white",
                alignItems: "flex-start",
                justifyContent: "center",
                borderTopColor: "#e8e8ec",
                borderTopWidth: 1,
                paddingHorizontal: 25
              }}
            />
            /*//This will hide after click on input*/
          </Animatable.View>
        </ImageBackground>
      </View>
    );
  }
}

export default LoginScreen;
