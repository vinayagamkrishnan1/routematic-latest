import React, { Component } from "react";
import { Text, View, Dimensions, BackHandler } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { colors } from "../../utils/Colors";
import LinearGradient from "react-native-linear-gradient";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import moment from "moment";
import * as Toast from "../../utils/Toast";
import { Button } from "native-base";
import SafeAreaView from "react-native-safe-area-view";
var { height } = Dimensions.get("window");
class QrCode extends Component {
  state = {
    From: "",
    To: "",
    routeName: "",
    TripDate: "",
    time: "",
    ticketID: "",
    QRButtonText: "",
    shuttleDetails: {
      DriverPhoto: "",
      DriverName: "",
      VehicleRegNo: "",
      RouteNumber: "",
      CheckinStatus: "",
      PickupLocation: "",
      DestinationLocation: ""
    },
    stops: []
  };

  static navigationOptions = ({ navigation }) => {
    return {
      title: "E-Ticket",
      headerStyle: { display: "none" }
    };
  };

  UNSAFE_componentWillMount() {
    let shuttleDetails = this.props.route.params.shuttleDetails ? this.props.route.params.shuttleDetails : "NA";
    let stops = this.props.route.params.stops ? this.props.route.params.stops : [];
    console.warn("shuttleDetails->" + JSON.stringify(shuttleDetails));
    let From = this.props.route.params.From ? this.props.route.params.From : "NA";
    let To = this.props.route.params.To ? this.props.route.params.To : "NA";
    let routeName = this.props.route.params.routeName ? this.props.route.params.routeName : "NA";
    let TripDate = this.props.route.params.TripDate ? this.props.route.params.TripDate : "NA";
    console.warn("TripDate : " + TripDate);
    let time = this.props.route.params.time ? this.props.route.params.time : "NA";
    let ticketID = this.props.route.params.ticketID ? this.props.route.params.ticketID : "NA";
    let QRButtonText = this.props.route.params.QRButtonText ? this.props.route.params.QRButtonText : "Save Pass";

    this.setState({
      From,
      To,
      routeName,
      TripDate,
      time,
      ticketID,
      QRButtonText,
      shuttleDetails,
      stops
    });
  }
  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton() {
    // if(this.state.QRButtonText==="Save Pass")
    return true;
  }
  render() {
    return (
      <SafeAreaView>
        {/* <View
          style={{
            backgroundColor: colors.WHITE,
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 20 }}>Shuttle Pass</Text>
        </View> */}
          <View
            style={{
              alignItems: "center",
              flexDirection: "column",
              height: '100%'
              // flex: 1
            }}
          >
            <LinearGradient
              start={{ x: 0, y: 0.75 }}
              end={{ x: 1, y: 0.25 }}
              colors={[colors.BLUE, colors.GREEN]}
              style={gradientView}
            >
              <Text style={routeName}>{this.state.routeName}</Text>
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 10,
                  marginTop: 20
                }}
              >
                <View>
                  <Text style={placeName}>{this.state.From}</Text>
                </View>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  <MaterialCommunityIcons
                    name="dots-horizontal"
                    style={{ color: colors.WHITE, fontSize: 20 }}
                  />
                  <MaterialCommunityIcons
                    name="bus-side"
                    style={{ color: colors.WHITE, fontSize: 20 }}
                  />
                  <MaterialCommunityIcons
                    name="dots-horizontal"
                    style={{ color: colors.WHITE, fontSize: 20 }}
                  />
                </View>
                <View>
                  <Text style={placeName}>{this.state.To}</Text>
                </View>
              </View>

              <View
                style={{
                  justifyContent: "space-between",
                  flexDirection: "row",
                  padding: 10
                }}
              >
                <View style={{ flexDirection: "column", marginLeft: 10 }}>
                  <Text style={time}>{this.state.time}</Text>
                  <Text style={weekDayYearText}>
                    {moment(this.state.TripDate, "YYYY-MM-DD").format(
                      "ddd,DD MMM YYYY"
                    )}
                  </Text>
                </View>
                {this.state.stops &&
                  this.state.stops.length > 0 && (
                    <Button
                      backgroundColor={colors.BLUE}
                      style={{ padding: 5 }}
                      onPress={() =>
                        this.props.navigation.navigate("TrackShuttle", {
                          Trips: this.state.shuttleDetails,
                          CustomerUrl: global.CustomerUrl,
                          UserId: global.UserId,
                          stops: this.state.stops
                        })
                      }
                    >
                      <Text style={{ color: colors.WHITE }}>Track Now</Text>
                    </Button>
                  )}
              </View>
            </LinearGradient>

            <View style={rectangle}>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 10,
                  flex: 1
                }}
              >
                <QRCode value={this.state.ticketID} size={190} />
                <Text
                  style={{
                    marginTop: 20,
                    fontWeight: "700",
                    color: colors.BLACK,
                    fontSize: 20
                  }}
                >
                  {this.state.ticketID}
                </Text>
              </View>
            </View>
            <View style={{ position: "absolute", bottom: 0, width: "100%" }}>
              <Button
                backgroundColor={colors.BLUE}
                onPress={() => {
                  if (this.state.QRButtonText === "Close") {
                    this.props.navigation.goBack();
                  } else {
                    Toast.show(
                      "Ticket Saved under e-Tickets. When you board the shuttle please scan the e-Ticket on the driver mobile"
                    );
                    this.props.navigation.navigate("Home");
                  }
                }}
              >
                <Text style={{ color: colors.WHITE }}>
                  {this.state.QRButtonText}
                </Text>
              </Button>
            </View>
          </View>
      </SafeAreaView>
    );
  }
}

export default QrCode;

const gradientView = {
  margin: 10,
  // flex: 1,
  width: "95%",
  height: height / 3.5, //"50%",
  //opacity: 0.95,
  borderRadius: 6,
  shadowColor: "rgba(0, 0, 0, 0.5)",
  shadowOffset: {
    width: 0,
    height: 2
  },
  shadowRadius: 4,
  shadowOpacity: 1,
  justifyContent: "space-between",
  paddingBottom: 20
};

const rectangle = {
  width: "95%",
  height: height / 2.2,
  backgroundColor: colors.WHITE,
  justifyContent: "center",
  alignItems: "center",
  marginTop: -10,
  flexDirection: "column",
  shadowColor: "rgba(0, 0, 0, 0.5)",
  shadowOffset: {
    width: 1,
    height: 1
  },
  shadowRadius: 5,
  shadowOpacity: 1
};
const routeName = {
  marginTop: 10,
  marginLeft: 10,
  fontFamily: "Helvetica",
  fontSize: 12,
  fontWeight: "300",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#ffffff"
};
const placeName = {
  fontFamily: "Helvetica",
  fontSize: 20,
  fontWeight: "300",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#ffffff"
};
const time = {
  fontFamily: "Helvetica",
  fontSize: 18,
  fontWeight: "300",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#ffffff"
};
const weekDayYearText = {
  fontFamily: "Helvetica",
  fontSize: 10,
  fontWeight: "300",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#ffffff"
};
