/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from "react";
import {Dimensions, FlatList, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
// import RNGooglePlaces from "react-native-google-places-native";

type Props = {};
export default class AddressPicker extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  onOpenPickerPress = () => {
    console.log("picker");
    // RNGooglePlaces.openPlacePickerModal()
    //   .then(place => {
    //     console.log(place);
    //   })
    //   .catch(error => console.log(error.message));
  };

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={this.onOpenPickerPress}
        >
          <Text style={styles.text}>Open PlacePicker Modal</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 12,
    paddingTop: 45
  },
  button: {
    backgroundColor: "#263238",
    flexDirection: "row",
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10
  },
  text: {
    color: "white"
  },
  inputLauncher: {
    backgroundColor: "#F3F7F9",
    width: "100%",
    borderRadius: 4,
    height: 35,
    justifyContent: "center",
    paddingLeft: 10,
    marginBottom: 16
  },
  inputWrapper: {
    backgroundColor: "#F3F7F9",
    width: "100%",
    borderRadius: 2,
    justifyContent: "center",
    paddingHorizontal: 8
  },
  input: {
    color: "#222B2F",
    height: 35,
    fontSize: 15,
    paddingVertical: 4
  },
  list: {
    marginTop: 16,
    height: Dimensions.get("window").height - 70
  },
  listItemWrapper: {
    backgroundColor: "transparent",
    height: 56
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: "100%"
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#DAE4E9",
    width: "92%",
    marginHorizontal: 16,
    opacity: 0.6
  },
  primaryText: {
    color: "#222B2F",
    fontSize: 15,
    marginBottom: 3
  },
  placeMeta: {
    flex: 1,
    marginLeft: 15
  },
  secondaryText: {
    color: "#9BABB4",
    fontSize: 13
  },
  listIcon: {
    width: 25,
    height: 25
  }
});
