/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleResponse } from "../network/apiResponse/HandleResponse";
import { URL } from "../network/apiConstants/index";
import { asyncString } from "../utils/ConstantString";
import { API } from "../network/apiFetch/API";
import { spinner } from "../network/loader/Spinner";
import { Body, Button, Card, CardItem, Content, Text } from "native-base";
import { TYPE } from "../model/ActionType";
import { colors } from "../utils/Colors";
import { CryptoXor } from "crypto-xor";

export default class GetFlexiCabs extends Component<{}> {
  static navigationOptions = {
    title: "Available Cab List",
    headerTitleStyle: { fontFamily: "Roboto" }
  };

  constructor(props) {
    super(props);

    this.state = {
      data: [], //responseFlexiCabs.Cabs
      refreshing: false,
      access_token: "",
      UserId: "",
      DToken: "",
      CustomerUrl: "",
      isArray: true,
      noTrips: false,
      errorMessage: "",
      isLoading: false
    };
  }
  callback = async (actionType, response, copyDataObj) => {
    const { navigate } = this.props.navigation;
    switch (actionType) {
      case TYPE.SAVE_FLEXI: {
        handleResponse.saveFlexi(response, this, navigate);
        break;
      }
    }
  };
  _keyExtractor(item, index) {
    return index;
  }

  componentDidMount() {
    const { navigation, route } = this.props;
    const Cabs = route.params.Cabs // ", []);
    this.setState({ data: Cabs });
    AsyncStorage.multiGet(
      [
        asyncString.ACCESS_TOKEN,
        asyncString.USER_ID,
        asyncString.DTOKEN,
        asyncString.CAPI
      ],
      (err, savedData) => {
        this.setState({
          access_token: CryptoXor.decrypt(
            savedData[0][1],
            asyncString.ACCESS_TOKEN
          ),
          UserId: savedData[1][1],
          DToken: savedData[2][1],
          CustomerUrl: savedData[3][1]
        });
      }
    );
  }

  saveFlexi(cab) {
    const { navigate } = this.props.navigation;
    Alert.alert(
      "Flexi cab booking",
      "Do you want to book the cab?",
      [
        {
          text: "No",
          onPress: () => console.warn("NO Pressed"),
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => {
            this.setState({
              isLoading: true
            });
            let body = {
              DeviceID: this.state.UserId,
              TripID: cab.tid,
                IsProfileStateCheck:1
            };
            API.newFetchJSON(
              this.state.CustomerUrl + URL.SAVE_FLEXI,
              body,
              this.state.access_token,
              this.callback.bind(this),
              TYPE.SAVE_FLEXI
            );
            // if (response) handleResponse.saveFlexi(response, this, navigate);
            // else this.setState({ isLoading: false });
          }
        }
      ],
      { cancelable: true }
    );
  }

  renderItem(data) {
    let { item, index } = data;
    return (
      <Content padder>
        <Card>
          <CardItem header bordered>
            <View
              style={{
                flex: 1,
                flexDirection: "row"
              }}
            >
              <Text style={styles.itemName}>Route Number :</Text>
              <Text style={[styles.itemName, { fontSize: 18, marginLeft: 20 }]}>
                {item.rn}
              </Text>
            </View>
          </CardItem>
          <CardItem bordered>
            <Body>
              <Text style={styles.itemLastMessage}>
                Available Seats : {item.s}
              </Text>
              <Text style={styles.itemLastMessage}>ETA : {item.e}</Text>
            </Body>
          </CardItem>
          <CardItem footer bordered>
            <Button
              backgroundColor={colors.BLUE}
              style={{ marginTop: 5 }}
              onPress={() => this.saveFlexi(item)}
            >
              <Text>Book</Text>
            </Button>
          </CardItem>
        </Card>
      </Content>
    );
  }

  renderSeparator() {
    return <View style={styles.separator} />;
  }

  renderHeader() {
    return <View style={styles.header} />;
  }

  _onRefresh() {
    this.setState({
      refreshing: true
    });
    this.props.route.params.refresh();
  }

  render() {
    if (this.state.noTrips) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Text>{this.state.errorMessage}</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <FlatList
          keyExtractor={this._keyExtractor}
          data={this.state.data}
          renderItem={this.renderItem.bind(this)}
          ItemSeparatorComponent={this.renderSeparator.bind(this)} //ListHeaderComponent={this.renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isLoading}
              onRefresh={this._onRefresh.bind(this)}
            />
          }
        />
        {spinner.visible(this.state.isLoading)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20
  },
  itemBlock: {
    flexDirection: "row",
    paddingBottom: 10
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  itemMeta: {
    marginLeft: 10,
    justifyContent: "center"
  },
  itemName: {
    fontSize: 20,
    marginTop: 5
  },
  itemLastMessage: {
    fontSize: 16,
    color: "#111",
    marginTop: 5
  },
  separator: {
    height: 0.5,
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#555"
  },
  header: {
    padding: 10
  },
  headerText: {
    fontSize: 30,
    fontWeight: "900"
  },
  navBar: {
    height: 60,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "blue"
  },
  leftContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    backgroundColor: "green"
  },
  rightContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "red"
  },
  rightIcon: {
    height: 10,
    width: 10,
    resizeMode: "contain",
    backgroundColor: "white"
  }
});
