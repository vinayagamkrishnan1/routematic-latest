import React, { Component } from "react";
import HTML from "react-native-render-html";
import { Alert, Dimensions, StatusBar, View } from "react-native";
import { Content, Text } from "native-base";
import { colors } from "../utils/Colors";

var he = require("he");

class FullHTMLView extends Component {
  static navigationOptions = {
    title: "Announcement",
    headerTitleStyle: { fontFamily: "Roboto" }
  };
  constructor(props) {
    super(props);
    this.state = {
      html: "",
      type: ""
    };
  }

  UNSAFE_componentWillMount() {
    const { navigation, route } = this.props;
    const html = route.params.html ? route.params.html : "No tripId ";
    const type = route.params.type ? route.params.type : "No type ";
    console.warn("type : " + type);
    this.setState({ html, type });
  }

  render() {
    if (this.state.html && this.state.type)
      return (
        <View padder style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          <StatusBar barStyle="dark-content" />

          {this._renderContent(this.state.type, this.state.html)}
        </View>
      );
  }
  _renderContent(type, data) {
    return type === "text/plain" ? (
      <Text style={{margin:16, color: colors.BLACK}}>{data}</Text>
    ) : (
      <View style={{margin:16}}>
        <HTML
          source={{html: he.decode(data)}}
          // html={he.decode(data)}
          imagesMaxWidth={Dimensions.get("window").width}
          contentWidth={Dimensions.get("window").width}
        />
      </View>
    );
  }
}

export default FullHTMLView;
