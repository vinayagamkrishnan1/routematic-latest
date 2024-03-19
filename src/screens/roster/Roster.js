import React, { Component } from "react";
import {
  findNodeHandle,
  Image,
  PanResponder,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";
import { Container, Tab, TabHeading, Tabs, Text } from "native-base";
import { API } from "../../network/apiFetch/API";
import { URL } from "../../network/apiConstants/index";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import { asyncString } from "../../utils/ConstantString";
import CalendarPicker from "./CalendarPicker";
import CreateRoster from "./CreateRoster";
import { spinner } from "../../network/loader/Spinner";
import { colors } from "../../utils/Colors";
import { TYPE } from "../../model/ActionType";
import { CryptoXor } from "crypto-xor";

class Roster extends Component {
  static navigationOptions = {
    title: "My Roster",
    headerTitleStyle: { fontFamily: "Roboto" }
  };
  getRosterDetails = () => {
    const { navigate } = this.props.navigation;
    AsyncStorage.multiGet(
      [
        asyncString.ACCESS_TOKEN,
        asyncString.USER_ID,
        asyncString.IdleTimeOutInMins,
        asyncString.CAPI
      ],
      (err, savedData) => {
        let access_token = CryptoXor.decrypt(savedData[0][1], asyncString.ACCESS_TOKEN); // JSON.parse(JSON.stringify(savedData[0][1]));
        let UserId = JSON.parse(JSON.stringify(savedData[1][1]));
        let CustomerUrl = savedData[3][1];
        if (!access_token) return;
        if (!UserId) return;
        setTimeout(() => {
          this.setState({
            isLoading: true,
            access_token,
            CustomerUrl,
            UserId,
            IdleTimeOutInMins: parseInt(savedData[2][1])
          });
        }, 100);

        let body = { DeviceID: UserId };
        API.newFetchJSON(
          CustomerUrl + URL.GET_ROSTER_DETAILS,
          body,
          access_token,
          this.callback.bind(this),
          TYPE.GET_ROSTER_DETAILS
        );
        // if (response) handleResponse.getRosterDetails(response, this, navigate);
        // else this.setState({ isLoading: false });
      }
    );
  };

  constructor(props) {
    super(props);
    this.state = {
      selected: "",
      isLoading: false,
      access_token: "",
      UserId: "",
      availableRosters: "",
      rosterDetails: "",
      IdleTimeOutInMins: "",
      isRoster: true,
      CustomerUrl: ""
    };
  }
  callback = async (actionType, response) => {
    const { navigate } = this.props.navigation;
    switch (actionType) {
      case TYPE.GET_ROSTER_DETAILS: {
        handleResponse.getRosterDetails(response, this, navigate);
        break;
      }
    }
  };
  goBack(goBack = navigation.goBack()) {
    const { navigation } = this.props;
    goBack;
    route.params.onSelect({ selected: true });
  }

  clearAuthAndLogout() {
    if (!this.state.isRoster) return;
    const { navigate } = this.props.navigation;
    let body = {
      UserId: this.state.UserId,
      DToken: this.state.DToken,
      DType: 1
    };
    this.setState({ isLoading: true });
    let response = API.fetchJSON(this.state.CustomerUrl + URL.SIGN_OUT, body);
    if (response) handleResponse.Logout(response, this, navigate);
    else this.setState({ isLoading: false });
    clearInterval(this.timer);
  }

  UNSAFE_componentWillMount() {
    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: () => {
        clearTimeout(this.timeout);
        this.setState(state => {
          if (state.inactive === false) return null;
          return {
            inactive: false
          };
        });
        if (this.state.IdleTimeOutInMins > 0)
          this.timeout = setTimeout(() => {
            this.clearAuthAndLogout();
          }, this.state.IdleTimeOutInMins);
        return false;
      }
    });
    this.subs = [
      this.props.navigation.addListener("focus", () =>
        //console.warn("will focus")
        this.setState({ isRoster: true })
      ),
      this.props.navigation.addListener("blur", () =>
        //console.warn("will blur")
        this.setState({ isRoster: false })
      )
    ];
  }

  componentWillUnmount() {
    // this.subs.forEach(sub => {
    //   sub.remove();
    // });
    clearTimeout(this.timeout);
  }

  componentDidMount() {
    const { navigate } = this.props.navigation;
    this.getRosterDetails();
    setTimeout(() => this.setState({ initialPage: 1, activeTab: 1 }), 1);
  }

  render() {
    let rosterDetails = this.state.rosterDetails;
    if (!rosterDetails)
      return (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1
          }}
        >
          <StatusBar
            barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
          />
          <ActivityIndicator />
          <Text style={{ color: colors.BLACK, marginTop: 20 }}>
            Please wait...
          </Text>
        </View>
      );

    return (
      <View style={{ flex: 1 }} {...this._panResponder.panHandlers}>
        <Container>
          {/*{spinner.visible(this.state.isLoading)}*/}
          <StatusBar
            barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
          />
          <Tabs locked={true} style={{ backgroundColor: colors.WHITE }}>
            <Tab
              heading={
                <TabHeading style={{ backgroundColor: colors.WHITE }}>
                  <Text style={{ color: colors.BLACK }}>CREATE</Text>
                </TabHeading>
              }
            >
              <CreateRoster
                rosterDetails={rosterDetails}
                getRosterDetails={this.getRosterDetails.bind(this)}
              />
            </Tab>
            <Tab
              heading={
                <TabHeading style={{ backgroundColor: colors.WHITE }}>
                  <Text style={{ color: colors.BLACK }}>VIEW/MODIFY</Text>
                </TabHeading>
              }
            >
              {/*{this.state.isLoading && (
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    height: 100,
                    flexDirection: "column"
                  }}
                >
                  <StatusBar
                    barStyle={
                      Platform.OS === "ios" ? "dark-content" : "dark-light"
                    }
                  />
                  <ActivityIndicator />
                  <Text style={{ color: colors.BLACK, marginTop: 20 }}>
                    Updating roster...
                  </Text>
                </View>
              )}*/}
              <CalendarPicker
                availableRosters={this.state.availableRosters}
                rosterDetails={rosterDetails}
                access_token={this.state.access_token}
                UserId={this.state.UserId}
                getRosterDetails={this.getRosterDetails.bind(this)}
              />
            </Tab>
          </Tabs>
        </Container>
      </View>
    );
  }
}

Roster.propTypes = {};
export default Roster;
