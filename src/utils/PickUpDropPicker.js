//import liraries
import React, { Component } from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { colors } from "./Colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import TouchableDebounce from "./TouchableDebounce";
import {
  _renderSourceTargetMarker,
  _renderSourceTargetView
} from "../screens/roster/customeComponent/customComponent";
// create a component
class PickupDropPicker extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      //title: "Routematic",
      headerStyle: { display: "none" }
    };
  };
  state = {
    pickupDropSwitch: false,
    selectedPickupLocation: "",
    selectedDropLocation: "",
    Locations: [
      {
        Name: "Home"
      },
      {
        Name: "Suncity Appartment, Surjapur Road, Bangalore"
      },
      {
        Name: "Nivaata Systems"
      },
      {
        Name: "Routematic, Bangalore"
      },
      {
        Name: "Indranagar, Bangalore"
      },
      {
        Name: "Kormongala, Bangalore"
      },
      {
        Name: "JP Nagar, Bangalore"
      }
    ]
  };
  UNSAFE_componentWillMount() {
    this.setState({ Locations: this.props.route.params.Locations });
  }
  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={{ backgroundColor: colors.BACKGROUND }} />
        <View
          style={{
            height: 60,
            width: "100%",
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "row",
            paddingTop: 20,
            backgroundColor: colors.BLUE
          }}
        >
          <Ionicons
            name="close"
            style={{
              fontSize: 30,
              color: colors.WHITE,
              marginLeft: 10,
              fontFamily: "Helvetica"
            }}
            onPress={() => this.props.navigation.goBack()}
          />
          <Text
            style={{
              fontFamily: "Helvetica",
              fontSize: 18,
              marginLeft: 5,
              color: colors.WHITE
            }}
          >
            Select Address
          </Text>
        </View>
        <View style={{ height: 80, width: "100%", flexDirection: "row" }}>
          {_renderSourceTargetMarker()}
          <View
            style={{
              flexDirection: "column",
              flex: 1,
              justifyContent: "flex-start"
            }}
          >
            <TouchableDebounce>
              {_renderSourceTargetView(
                "Pick up",
                this.state.selectedPickupLocation
                  ? this.state.selectedPickupLocation
                  : "Enter your pick up location",
                {
                  color: this.state.selectedPickupLocation
                    ? colors.GRAY
                    : colors.BLUE_BRIGHT
                }
              )}
            </TouchableDebounce>
            <View style={dottedLine} />
            <TouchableDebounce>
              {_renderSourceTargetView("Drop", "Enter your drop location", {
                color: colors.BLUE_BRIGHT
              })}
            </TouchableDebounce>
          </View>
        </View>
        <View style={line} />
        <View
          style={{
            backgroundColor: colors.BACKGROUND,
            height: 50,
            width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <Text>Tap to Select Other Pick-Up Location</Text>
            <Ionicons
              name="chevron-forward"
              style={{
                fontSize: 25,
                marginLeft: 20,
                color: colors.BLACK,
                fontFamily: "Helvetica"
              }}
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "flex-start",
            marginTop: 20,
            marginLeft: 20,
            marginRight: 20
          }}
        >
          {this.state.Locations.map((Item, index) => {
            let isSelected = this.state.selectedPickupLocation.includes(
              Item.Name
            );

            return (
              <TouchableDebounce
                key={index}
                style={isSelected ? viewSelectedStyle : viewNotSelectedStyle}
                onPress={() => {
                  this.setState({ selectedPickupLocation: Item.Name });
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{ color: isSelected ? colors.WHITE : colors.BLACK }}
                >
                  {Item.Name}
                </Text>
              </TouchableDebounce>
            );
          })}
        </View>
        <TouchableDebounce
          style={{
            width: "100%",
            height: 50,
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            bottom: 0,
            backgroundColor: colors.BLUE_BRIGHT
          }}
          onPress={() => {
            this.props.route.params.setLocation(
              this.state.selectedPickupLocation
            );
            this.props.navigation.goBack();
          }}
        >
          <Text
            style={{ color: colors.WHITE, fontWeight: "700", fontSize: 20 }}
          >
            Save
          </Text>
        </TouchableDebounce>
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: colors.WHITE
  }
});

//make this component available to the app
export default PickupDropPicker;
const viewSelectedStyle = {
  borderRadius: 30,
  padding: 5,
  backgroundColor: colors.BLUE_BRIGHT,
  margin: 5,
  justifyContent: "center",
  alignItems: "center"
};
const viewNotSelectedStyle = {
  borderWidth: 1,
  borderRadius: 30,
  borderColor: colors.GRAY,
  padding: 5,
  borderStyle: "solid",
  margin: 5,
  justifyContent: "center",
  alignItems: "center"
};
const dottedLine = {
  width: "100%",
  borderStyle: "dashed",
  borderWidth: 0.5,
  borderColor: "#979797",
  marginTop: 8
};
const line = {
  width: "100%",
  borderStyle: "solid",
  borderWidth: 0.5,
  borderColor: colors.GRAY,
  marginTop: 50
};
