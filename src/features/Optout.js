import React, { Component } from "react";
import HTML from "react-native-render-html";
import { Alert, Dimensions, StatusBar, View, ScrollView, useWindowDimensions } from "react-native";
import { Box } from "native-base";
import { Content, Text } from "native-base";
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from "moment";
const he = require("he");
import { Button } from "native-base";
import { API } from "../network/apiFetch/API";
import { TYPE } from "../model/ActionType";
import { handleResponse } from "../network/apiResponse/HandleResponse";
import { URL } from "../network/apiConstants";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../utils/Colors";
import * as Toast from "../utils/Toast";
import WebView from "react-native-webview";
const pickerType = { start: "start", end: "end" };

class Optout extends Component {
  static navigationOptions = {
    title: "Opt-out",
    headerTitleStyle: { fontFamily: "Roboto" }
  };
  callback = async (actionType, response) => {
    switch (actionType) {
      case TYPE.OPT_OUT_POST: {
        handleResponse.optOutPost(response, this);
        break;
      }
    }
  };
  _showDateTimePicker = datePickerType => {
    datePickerType === pickerType.start
      ? this.setState({
        isStartDatePickerVisible: true,
        datePickerType
      })
      : this.setState({
        isEndDatePickerVisible: true,
        datePickerType
      });
  };
  _hideDateTimePicker = () =>
    this.state.datePickerType === pickerType.start
      ? this.setState({
        isStartDatePickerVisible: false
      })
      : this.setState({
        isEndDatePickerVisible: false
      });
  _handleDatePicked = date => {
    const dateSelected = moment(date).format("YYYY-MM-DD");

    this.state.datePickerType === pickerType.start
      ? this.setState({
        startDate: dateSelected,
        endDate: ""
      })
      : this.setState({
        endDate: dateSelected
      });

    this._hideDateTimePicker();
  };
  postOptout = () => {
    if (!this.state.startDate) {
      Alert.alert("Start Date", "Please select start date");
      return;
    }
    if (!this.state.endDate) {
      Alert.alert("End Date", "Please select end date");
      return;
    }

    let body = {
      from: moment(this.state.startDate).format("YYYY-MM-DD"),
      to: moment(this.state.endDate).format("YYYY-MM-DD"),
      tripType: null,
      tcId: this.state.tcId
    };
    API.newFetchJSON(
      URL.Opt_Out_POST,
      body,
      true,
      this.callback.bind(this),
      TYPE.OPT_OUT_POST
    );
  };

  constructor(props) {
    super(props);
    this.state = {
      html: "",
      type: "",
      isStartDatePickerVisible: false,
      isEndDatePickerVisible: false,
      minDateAllowed: new Date(moment().format()),
      startDate: new Date(moment().format()),
      endDate: new Date(moment().format()),
      datePickerType: true,
      datePickerReq: false,
      tcId: "",
      accepted: false
    };
  }

  UNSAFE_componentWillMount() {
    const { navigation, route } = this.props;
    const html = route.params.html ? route.params.html : "No tripId ";
    const type = route.params.type ? route.params.type : "No type ";
    const datePickerReq = route.params.datePickerReq ? route.params.datePickerReq : false;
    const tcId = route.params.tcId ? route.params.tcId : "";
    this.setState({ html, type, datePickerReq, tcId });
  }

  render() {
    if (this.state.html && this.state.type)
      return (
        <View padder style={{ flex: 1, padding: 10, backgroundColor: "#FFFFFF" }}>
          <StatusBar barStyle="light-content" />
          {/* <ScrollView> */}
          {this._renderContent(this.state.type, this.state.html)}
          <Box style={{ padding: 10 }}>
            {this._renderTC(this.state.datePickerReq)}
          </Box>
          {/* </ScrollView> */}

        </View>
      );
  }
  _renderContent(type, data) {
    return type === "text/plain" ? (
      <Text style={{color: colors.BLACK}}>{data}</Text>
    ) : (
      <WebView
        source={{ html: he.decode(data) }}
      />
    );
  }
  toggleAccept() {
    this.state.accepted
      ? this.setState({ accepted: false })
      : this.setState({ accepted: true });
  }
  _renderTC(datePickerReq) {
    return (
      <React.Fragment>
        <View
          style={{
            marginTop: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          {datePickerReq && (
            <View
              style={{
                flexDirection: "column",
                width: "40%",
                borderColor: colors.GRAY,
                justifyContent: "center"
              }}
            >
              <Text style={{ color: colors.GRAY, fontSize: 15 }}>
                Start Date
              </Text>
              <Button
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: colors.GRAY,
                  justifyContent: "center",
                  flexDirection: "row",
                  backgroundColor: 'transparent',
                  height: 50
                }}
                full
                iconLeft
                onPress={() => this._showDateTimePicker(pickerType.start)}
              >
                <Ionicons name={"calendar"} size={25} color={colors.GRAY} />
                <Text style={{ color: colors.BLACK, fontSize: 12 }}>
                  {this.state.startDate
                    ? moment(this.state.startDate).format("DD MMM YYYY")
                    : "Select"}
                </Text>
              </Button>
            </View>
          )}
          <Ionicons style={{ marginTop: 15 }} name={"arrow-forward-circle"} size={30} />

          {datePickerReq && (
            <View
              style={{
                flexDirection: "column",
                width: "40%",
                justifyContent: "center"
              }}
            >
              <Text style={{ color: colors.GRAY, fontSize: 15 }}>End Date</Text>
              <Button
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: colors.GRAY,
                  justifyContent: "center",
                  flexDirection: "row",
                  backgroundColor: 'transparent',
                  height: 50
                }}
                full
                iconLeft
                onPress={() => {
                  if (!this.state.startDate)
                    Alert.alert(null, "Please select start date first");
                  this._showDateTimePicker(pickerType.end);
                }}
              >
                <Ionicons name={"calendar"} size={25} color={colors.GRAY} />
                <Text style={{ color: colors.BLACK, fontSize: 12 }}>
                  {this.state.endDate
                    ? moment(this.state.endDate).format("DD MMM YYYY")
                    : "Select"}
                </Text>
              </Button>
            </View>
          )}
        </View>
        <Button
          transparent
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            backgroundColor: 'transparent',
            marginTop: 5
          }}
          onPress={() => this.toggleAccept()}
        >
            <View 
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                    >
          <FontAwesome
            name={this.state.accepted ? "check-square-o" : "square-o"}
            color={colors.BLACK}
            size={25}
          />
          <Text style={{ marginLeft: 5, fontWeight: "700", color: "black" }}>
            I Agree
          </Text>
          </View>
        </Button>

        <View
          style={{
            marginTop: 5,
            marginBottom: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          <Button
            full
            danger
            style={{ width: "45%", backgroundColor: colors.RED }}
            onPress={() => this.props.navigation.goBack()}
          >
            <Text style={{ color: colors.WHITE }}>Cancel</Text>
          </Button>
          <Button
            success
            full
            style={{
              width: "45%",
              opacity: 1,
              backgroundColor: this.state.accepted
                ? "rgba(50,205,50,1)"
                : "rgba(192,192,192,0.5)"
            }}
            onPress={() => {
              if (!this.state.accepted) {
                Toast.show("Please Accept the Terms & Condition");
                return;
              }
              this.postOptout();
            }}
          >
            <Text style={{ color: colors.WHITE }}>Accept</Text>
          </Button>
        </View>

        <DateTimePicker
          isVisible={this.state.isStartDatePickerVisible}
          onConfirm={this._handleDatePicked}
          onCancel={this._hideDateTimePicker}
          is24Hour={false}
          minimumDate={this.state.minDateAllowed}
          mode={"date"}
        />
        <DateTimePicker
          isVisible={this.state.isEndDatePickerVisible}
          onConfirm={this._handleDatePicked}
          onCancel={this._hideDateTimePicker}
          mode={"date"}
          is24Hour={false}
          minimumDate={new Date(moment(this.state.startDate).format())}
        />
      </React.Fragment>
    );
  }
}

export default Optout;
