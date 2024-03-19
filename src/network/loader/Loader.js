//import liraries
import React, {Component} from "react";
import {ActivityIndicator, Animated, ImageBackground, StyleSheet, View} from "react-native";
import {Text} from "native-base";
import {colors} from "../../utils/Colors";

// create a component
class Loader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaderText: "Please Wait...",
      lateText: ""
    };
  }

  update = () => {
    this.props.onUpdate();
  };

  ShowAlertWithDelay = () => {
    console.log(
      "This is taking much longer than it should. You might want to check your internet connectivity."
    );
    this.setState({
      lateText:
        "This is taking much longer than it should. You might want to check your internet connectivity."
    });
  };

  componentDidMount() {
    //setTimeout(() => this.ShowAlertWithDelay(), 1000);
    if (this.props.loadMsg) {
      this.setState({ loaderText: this.props.loadMsg });
    }
  }
  componentWillUnmount() {
    this.setState({ loaderText: "Please Wait..." });
  }

  render() {
    return (
        <ImageBackground
            defaultSource={require("../../assets/cp_background.jpg")}
            source={require("../../assets/cp_background.jpg")}
            resizeMethod="scale"
            resizeMode="cover"
            style={{
                justifyContent: "center",
                alignContent: "flex-start",
                flex: 1
            }}
        >
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "transparent"
                }}
            >
                <ActivityIndicator animating={true}/>
                <Text
                    style={{
                        marginTop: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        color: colors.WHITE
                    }}
                >
                    {this.state.loaderText}
                </Text>

                <View
                    style={{
                        marginTop: 20,
                        marginLeft: "20%",
                        marginRight: "20%",
                        justifyContent: "center"
                    }}
                >
            {/*<Button block onPress={() => this.update()}>
            <Text>Cancel</Text>
          </Button>*/}
                </View>
                <Animated.Text
                    style={{
                        marginTop: 20,
                        marginLeft: 40,
                        marginRight: 40,
                        alignItems: "center",
                        justifyContent: "center",
                        color: colors.WHITE
                    }}
                >
                    {this.state.lateText}
                </Animated.Text>
            </View>
        </ImageBackground>
    );
  }
}

//make this component available to the app
export default Loader;
