import React, { Component } from "react";
import { Button, Box } from "native-base";
import { Text, View, Image, Dimensions, ScrollView ,  FlatList,  StatusBar,SafeAreaView,RefreshControl, TouchableOpacity

} from "react-native";
import bus_loading from "../../assets/bus_loading.gif";

import { colors } from "../../utils/Colors";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import moment from "moment";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { API } from "../../network/apiFetch/API";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import { URL } from "../../network/apiConstants/index";
import { TYPE } from "../../model/ActionType";

const currentDay = moment().format("ddd");

import loginIcon from "../../assets/LoginRoute.png";
import logoutIcon from "../../assets/LogoutRoute.png";

class ShuttleRouteDetailsNEW extends Component {

  state = {
    isLoading: true,
    isTwoWayTrip: false,
    shuttleDetails: []
  };

  callback = async (actionType, response, copyDataObj) => {
    switch (actionType) {
      case TYPE.SHUTTLE_GENERATE_TICKET: {
        handleResponse.generateTicketShuttle(
          response,
          this,
          ''
        );
        break;
      }
      case TYPE.SHUTTLE_ROUTE_DETAILS: {
        handleResponse.getShuttleRouteDetails(response, this);
        console.log('Sugan','Shuttle Details ------'+JSON.stringify(response));
        break;
      }
    }
  };

  static navigationOptions = ({ navigation }) => {
    return {
      title: "Shuttle Details"
      //headerStyle: { display: "none" }
    };
  };

  constructor(props) {
    super(props);
    // this._renderItem = this._renderItem.bind(this);
  }

  UNSAFE_componentWillMount() {
    console.warn('UNSAFE_componentWillMount');
    this.getShuttleDetails();
  }

  generateTicketShuttle() {
    this.setState({
      isLoading: true
    });
    let body = {
      ShiftTime: this.props.route.params.body.date + " " + this.props.route.params.startTime,
      ScheduleID: this.props.route.params.body.scheduleId,
      StartWayPointID: this.props.route.params.body.StartWayPointID,
      EndWayPointID: this.props.route.params.body.EndWayPointID,
      ReturnShiftTime: this.props.route.params.returnTime ? (this.props.route.params.body.date + " " + this.props.route.params.returnTime) : undefined,
      ReturnScheduleID: this.props.route.params.body.returnScheduleId
    };

    console.warn('Shuttle body ', body);
    API.newFetchJSON(
      URL.shuttleGenerateTicketV2,
      body,
      true,
      this.callback.bind(this),
      TYPE.SHUTTLE_GENERATE_TICKET,
      null
    );
  }

  getShuttleDetails() {
    this.setState({ isLoading: true });

    let body = this.props.route.params.body;
  
    console.log('Sugan','body return====='+JSON.stringify(body));

    API.newFetchJSON(
      URL.shuttleRouteDetails,
      body,
      true,
      this.callback.bind(this),
      TYPE.SHUTTLE_ROUTE_DETAILS
    );
  }
  
    _renderItem = (item, shuttleTime) => {
      console.warn('item - ', item);
        return (
            <Box style={[SelectedTimeSquare, {backgroundColor: (item.time == shuttleTime ? colors.YELLOW : (item.availableSeats == 0 ? colors.RED : colors.BLUE))}]}>
              <Text style={SelectedTimeText}>{item.time}</Text>
              <Text style={UnSelectedTimeText}>{item.availableSeats}</Text>
            </Box>
        );
    };
  
  showLoaderScreen() {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          backgroundColor: colors.WHITE
        }}
      >
        <StatusBar
          barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
        />

        <Image
          defaultSource={bus_loading}
          source={bus_loading}
          resizeMethod="scale"
          resizeMode="cover"
          style={{ height: 200, width: 200 }}
        />
        <Text style={{ color: colors.BLACK, marginTop: -20 }}>
        Fetching shuttle detail...
        </Text>
      </View>
    );
  }

  render() {
    if (this.state.isLoading || this.state.shuttleDetails.length == 0) return this.showLoaderScreen();

    let routeDtl = this.state.shuttleDetails;
    console.warn('routeDtl = ', routeDtl);
    let _seatAvailable = routeDtl[0]?.seatAvailability.find((item) => item.time == routeDtl[0].schedule[0].startTime);
    console.warn('_seatAvailable = ', _seatAvailable);
    let isBookingAllowed = _seatAvailable?.availableSeats > 0 ? true : false;
    console.warn('isBookingAllowed = ', isBookingAllowed);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.WHITE }}>
          <ScrollView
            style={{ flexDirection: "column", height: "100%" }}
            ref={c => {
              this.scrollView = c;
            }}
          >
            {routeDtl[0]?.routeName && (

            <View style={{

            }}>
              <View style={rectangle12Copy}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%"
                  }}
                >
                  <Text style={runsOn}> Runs On</Text>
                  <View style={{ flexDirection: "row", alignItems: 'center', marginRight: 10 }}>
                  {routeDtl[0].runDays &&
                      routeDtl[0].runDays.split(",").map((day, index) => {
                      if (day.includes(currentDay))
                        return (
                          <Text
                            key={index}
                            style={[selectedDayStyle, { marginLeft: 5 }]}
                          >
                            {day}
                          </Text>
                        );
                      else
                        return (
                          <Text
                            key={index}
                            style={[notSelectedDayStyle, { marginLeft: 5 }]}
                          >
                            {day}
                          </Text>
                        );
                    })}
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 5,
                  paddingBottom: 5,
                  borderBottomColor: colors.GRAY,
                  borderBottomWidth: 1,
                  flex: 1
                }}
              >
                {/* <Image
                  defaultSource={loginIcon}
                  source={loginIcon}
                  resizeMethod="scale"
                  resizeMode="cover"
                  style={{ height: 50, width: 50, marginLeft: 10 }}
                /> */}
                <View
                  style={{ flexDirection: "column", marginLeft: 10, flex: 1 }}
                >
                  <Text style={route12345}>
                    {routeDtl[0].routeName}
                  </Text>
                  <View style={{ flexDirection: "row", marginTop: 5, flexWrap: 'wrap' }}>
                    <Text style={source}>
                      {routeDtl[0].startWayPoint + " "}
                      <FontAwesome
                        name="long-arrow-right"
                        style={[
                          source,
                          { marginLeft: 10, marginRight: 10, marginTop: 2 }
                        ]}
                      />
                      {" " + routeDtl[0].endWayPoint}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={startTimeRectangle}>
                <View
                  style={{
                    justifyContent: "flex-start",
                    flexDirection: 'row',
                    alignItems: "center",
                    height: 30,
                  }}
                >
                  <Text style={setShuttleStartTime}> SHUTTLE TIME</Text>
                  <Text style={ShiftTime}>{routeDtl[0].schedule[0].startTime}</Text>
                </View>
                <View
                  style={{
                    height: 50,
                    margin: 5,
                  }}
                >
                  <ScrollView horizontal>
                  {routeDtl[0].seatAvailability.map((item) => {
                    console.warn('shift date -> ', item);
                    return this._renderItem(item, routeDtl[0].schedule[0].startTime);
                  })}
                  </ScrollView>
                </View>
              </View>

              {(!this.state.loginRouteCollapse) && (
                <TouchableOpacity onPress={() => {
                  this.setState({
                    loginRouteCollapse: !this.state.loginRouteCollapse
                  })
                }}>
                  <View style={{ flex: 1, margin: 5, padding: 5 }} >
                    {routeDtl[0] &&
                      routeDtl[0].schedule[0].stop.map(
                        (waypoint, index) => {
                          if (index === 0) {
                            return this.drawFirstLine(
                              index,
                              waypoint.wayPointName,
                              "Dep. " + waypoint.wayPointLeaveTime,
                              false,
                              this.state.loginRouteCollapse
                            );
                          } else if (routeDtl[0].schedule[0].stop.length - 1 === index) {
                            return this.drawLastLine(
                              index,
                              waypoint.wayPointName,
                              waypoint.wayPointLeaveTime, // "Dep. " + 
                              false
                            );
                          }
                        }
                      )}
                  </View>
                </TouchableOpacity>
              )}
              {(this.state.loginRouteCollapse) && (
                <TouchableOpacity onPress={() => {
                  this.setState({
                    loginRouteCollapse: !this.state.loginRouteCollapse
                  })
                }}>
                  <View style={{ flex: 1, margin: 5, padding: 5 }}>
                    {routeDtl[0] &&
                      routeDtl[0].schedule[0].stop.map(
                        (waypoint, index) => {
                          if (index === 0) {
                            return this.drawFirstLine(
                              index,
                              waypoint.wayPointName,
                              "Dep. " + waypoint.wayPointLeaveTime,
                              false,
                              this.state.loginRouteCollapse
                            );
                          } else if (routeDtl[0].schedule[0].stop.length - 1 === index) {
                            return this.drawLastLine(
                              index,
                              waypoint.wayPointName,
                              waypoint.wayPointLeaveTime, // "Dep. " + 
                              false
                            );
                          } else if (routeDtl[0].schedule[0].stop.length > 2) {
                            return this.drawLine(
                              index,
                              waypoint.wayPointName,
                              "Dep. " + waypoint.wayPointLeaveTime,
                              false
                            );
                          }
                        }
                      )}
                  </View>
                </TouchableOpacity>
              )}
            </View>
            )}

          {this.props.route.params.isTwoWayTrip && routeDtl[1]?.routeName && (
            <View style={{
              borderTopColor: colors.GRAY,
              borderTopWidth: 2,
            }}>
              <View style={rectangle12Copy}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%"
                  }}
                >
                  <Text style={runsOn}> Runs On</Text>
                  <View style={{ flexDirection: "row", alignItems: 'center', marginRight: 10 }}>
                  {routeDtl[1].runDays &&
                      routeDtl[1].runDays.split(",").map((day, index) => {
                      if (day.includes(currentDay))
                        return (
                          <Text
                            key={index}
                            style={[selectedDayStyle, { marginLeft: 5 }]}
                          >
                            {day}
                          </Text>
                        );
                      else
                        return (
                          <Text
                            key={index}
                            style={[notSelectedDayStyle, { marginLeft: 5 }]}
                          >
                            {day}
                          </Text>
                        );
                    })}
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 5,
                  paddingBottom: 5,
                  borderBottomColor: colors.GRAY,
                  borderBottomWidth: 1,
                  flex: 1
                }}
              >
                {/* <Image
                  defaultSource={logoutIcon}
                  source={logoutIcon}
                  resizeMethod="scale"
                  resizeMode="cover"
                  style={{ height: 50, width: 50, marginLeft: 10 }}
                /> */}
                <View
                  style={{ flexDirection: "column", marginLeft: 10, flex: 1 }}
                >
                  <Text style={route12345}>
                    {routeDtl[1].routeName}
                  </Text>
                  <View style={{ flexDirection: "row", marginTop: 5, flexWrap: 'wrap' }}>
                    <Text style={source}>
                      {routeDtl[1].startWayPoint + " "}
                      <FontAwesome
                        name="long-arrow-right"
                        style={[
                          source,
                          { marginLeft: 10, marginRight: 10, marginTop: 2 }
                        ]}
                      />
                      {" " + routeDtl[1].endWayPoint}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={startTimeRectangle}>
                <View
                  style={{
                    justifyContent: "flex-start",
                    flexDirection: 'row',
                    alignItems: "center",
                    height: 30,
                  }}
                >
                  <Text style={setShuttleStartTime}> SHUTTLE TIME</Text>
                  <Text style={ShiftTime}>{routeDtl[1].schedule[0].startTime}</Text>
                </View>
                <View
                  style={{
                    height: 50,
                    margin: 5,
                  }}
                >
                  <ScrollView horizontal>
                  {routeDtl[1].seatAvailability.map((item) => {
                    console.warn('shift date -> ', item);
                    return this._renderItem(item, routeDtl[1].schedule[0].startTime);
                  })}
                  </ScrollView>
                </View>
              </View>

              {(!this.state.logoutRouteCollapse) && (
                <TouchableOpacity onPress={() => {
                  this.setState({
                    logoutRouteCollapse: !this.state.logoutRouteCollapse
                  })
                }}>
                  <View style={{ flex: 1, margin: 5, padding: 5 }} >
                    {routeDtl[1] &&
                      routeDtl[1].schedule[0].stop.map(
                        (waypoint, index) => {
                          if (index === 0) {
                            return this.drawFirstLine(
                              index,
                              waypoint.wayPointName,
                              "Dep. " + waypoint.wayPointLeaveTime,
                              false,
                              this.state.logoutRouteCollapse
                            );
                          } else if (routeDtl[1].schedule[0].stop.length - 1 === index) {
                            return this.drawLastLine(
                              index,
                              waypoint.wayPointName,
                              waypoint.wayPointLeaveTime, // "Dep. " + 
                              false
                            );
                          }
                        }
                      )}
                  </View>
                </TouchableOpacity>
              )}
              {(this.state.logoutRouteCollapse) && (
                <TouchableOpacity onPress={() => {
                  this.setState({
                    logoutRouteCollapse: !this.state.logoutRouteCollapse
                  })
                }}>
                  <View style={{ flex: 1, margin: 5, padding: 5 }}>
                    {routeDtl[1] &&
                      routeDtl[1].schedule[0].stop.map(
                        (waypoint, index) => {
                          if (index === 0) {
                            return this.drawFirstLine(
                              index,
                              waypoint.wayPointName,
                              "Dep. " + waypoint.wayPointLeaveTime,
                              false,
                              this.state.logoutRouteCollapse
                            );
                          } else if (routeDtl[1].schedule[0].stop.length - 1 === index) {
                            return this.drawLastLine(
                              index,
                              waypoint.wayPointName,
                              waypoint.wayPointLeaveTime, // "Dep. " + 
                              false
                            );
                          } else if (routeDtl[1].schedule[0].stop.length > 2) {
                            return this.drawLine(
                              index,
                              waypoint.wayPointName,
                              "Dep. " + waypoint.wayPointLeaveTime,
                              false
                            );
                          }
                        }
                      )}
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
          {/* position: "absolute",  */}
          <View
            style={{ flexDirection: 'row', bottom: 0, right: 0, padding: 10, width: "100%" }}
          >
            <Button
              disabled={!isBookingAllowed}
              backgroundColor={isBookingAllowed ? colors.BLUE : colors.GRAY}
              style={{
                marginLeft: 5,
                flex: 1, borderRadius: 5,
                borderWidth: 1,
              }}
              onPress={() => {
                this.generateTicketShuttle();
              }}
            >
              <Text style={{ color: colors.WHITE }}>Generate Pass</Text>
            </Button>
          </View>
          </ScrollView>
      </SafeAreaView>
    );
  }

  drawFirstLine(index, Title, desc, isOffice, isCollapsed) {
    return (
      <View style={{ flexDirection: "row" }} key={index}>
        <View
          style={{
            flexDirection: "row",
            transform: [{ rotate: "90deg" }],
            marginLeft: -70
          }}
        >
          <View
            style={{
              borderRadius: 5,
              height: 10,
              width: 10,
              borderWidth: 5,
              borderColor: colors.BLACK
            }}
          />
          <View
            style={{
              marginTop: 3.5,
              height: 3,
              width: 70,
              backgroundColor: colors.GRAY
            }}
          />
        </View>
        <View
          style={parent}
        >
          <Text style={isOffice ? officeStyle : textLine} numberOfLines={1}>{Title}</Text>
          <Text style={greenText}>{desc}</Text>
        </View>
        <View>
          <MaterialIcons name={isCollapsed ? "arrow-drop-up" : "arrow-drop-down"} size={30} color={colors.GREEN}/>
        </View>
      </View>
    );
  }

  drawLastLine(index, Title, desc, isOffice) {
    return (
      <View style={{ flexDirection: "row", marginTop: -30 }} key={index}>
        <View
            style={{
              marginLeft: Platform.OS == 'android' ? 12 : 8,
              marginTop: Platform.OS == 'android' ? 10 : 15,
              borderRadius: 5,
              height: 10,
              width: 10,
              borderWidth: 5,
              borderColor: colors.BLACK
            }}
          />
        <View
          style={[parent, {
            marginBottom: 10,
            marginLeft: 15,
            justifyContent: "flex-start"
          }]}
        >
          <Text style={isOffice ? officeStyle : textLine} numberOfLines={1}>{Title}</Text>
          <Text style={greenText}>{desc}</Text>
        </View>
      </View>
    );
  }

  drawLine(index, Title, desc, isOffice) {
    return (
      <View style={{ flexDirection: "row", marginTop: -30 }} key={index}>
        <View
          style={{
            flexDirection: "row", transform: [{ rotate: "90deg" }], marginLeft: -70
          }}
        >
          <View
            style={{
              borderRadius: 5,
              height: 10,
              width: 10,
              borderWidth: 5,
              borderColor: colors.BLACK
            }}
          />
          <View
            style={{
              marginTop: 3.5,
              height: 3,
              width: 70,
              backgroundColor: colors.GRAY
            }}
          />
        </View>
        <View
          style={[parent, {
            justifyContent: "flex-start"
          }]}
        >
          <Text style={isOffice ? officeStyle : textLine} numberOfLines={1}>{Title}</Text>
          <Text style={greenText}>{desc}</Text>
        </View>
      </View>
    );
  }
}

ShuttleRouteDetailsNEW.propTypes = {};

export default ShuttleRouteDetailsNEW;

const parent = {
  width: 0,
  flexGrow: 1,
  marginBottom: 65,
  marginLeft: 25,
  flexDirection: "column"
};
const textLine = {
  flex: 1,
  flexWrap: 'wrap',
  color: colors.BLACK
};
const officeStyle = {
  flex: 1,
  flexWrap: 'wrap',
  textSize: 16,
  color: colors.RED
};
const carouselStyle = {
  width: 375,
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
};

const oval = {
  backgroundColor: colors.RED,
  width: 50,
  height: 50,
  borderRadius: 25,
  justifyContent: "center",
  alignItems: "center",
  marginLeft: 10
};
const route12345 = {
  fontFamily: "Helvetica",
  fontSize: 16,
  fontWeight: "bold",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#4a4a4a"
};
const source = {
  fontFamily: "Helvetica",
  fontSize: 12,
  fontWeight: "300",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#4a4a4a"
};
const rectangle12Copy = {
  marginTop: 5,
  // marginLeft: 10,
  // marginRight: 10,
  justifyContent: "center",
  alignItems: "center",
  // margin: 10,
  height: 50,
  // borderRadius: 5,
  backgroundColor: colors.BLUE, // "#ffffff",
  shadowColor: "#9b9b9b",
  // elevation: 2,
  // shadowOffset: {
  //   width: 0.5,
  //   height: 0.5
  // },
  // shadowRadius: 3,
  // shadowOpacity: 1
};
const runsOn = {
  marginLeft: 10,
  fontFamily: "Helvetica",
  fontSize: 15,
  fontWeight: "300",
  fontStyle: "normal",
  letterSpacing: 0,
  color: colors.WHITE // "#4a4a4a"
};
const selectedDayStyle = {
  fontFamily: "Helvetica",
  fontSize: 14,
  fontWeight: "bold",
  // fontStyle: "normal",
  letterSpacing: 0,
  color: colors.LIGHT_GRAY, // "#417505",
  marginRight: 3
};
const notSelectedDayStyle = {
  fontFamily: "Helvetica",
  fontSize: 12,
  fontStyle: "normal",
  letterSpacing: 0,
  color: colors.WHITE,
  marginRight: 3
};
const ShiftTime = {
  // marginTop: 5,
  marginLeft: 20,
  fontFamily: "Helvetica",
  fontSize: 16,
  fontWeight: "bold",
  fontStyle: "normal",
  letterSpacing: 0,
  alignSelf: 'center',
  color: colors.BLACK
};
const setShuttleStartTime = {
  // marginTop: 10,
  marginLeft: 16,
  fontFamily: "Helvetica",
  fontSize: 10,
  fontWeight: "bold",
  fontStyle: "normal",
  alignSelf: 'center',
  letterSpacing: 0,
  color: "#4a90e2"
};
const setShuttleReturnTime = {
  marginTop: 10,
  marginLeft: 20,
  fontFamily: "Helvetica",
  fontSize: 18,
  fontWeight: "bold",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#000"
};
const setShuttleTotalTime = {
  marginTop: 15,
  marginRight: 30,
  fontFamily: "Helvetica",
  fontSize: 15,
  fontWeight: "bold",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#000000"
};
const startTimeRectangle = {
  width: "100%",
  height: 100,
  borderRadius: 5,
  backgroundColor: "#ffffff",
  shadowColor: "#9b9b9b",
  elevation: 2,
  shadowOffset: {
    width: 0,
    height: 0.5
  },
  shadowRadius: 1,
  shadowOpacity: 1
};
const startTimeTabel = {
  width: "95%",
  height: 180,
  borderRadius: 5,
  marginLeft:10,
  padding:20,
  backgroundColor: "#dedcdc",
  shadowColor: "#9b9b9b",
  elevation: 2,
  shadowOffset: {
    width: 0,
    height: 0.5
  },
  shadowRadius: 1,
  shadowOpacity: 1,
  flexDirection: "row",
  justifyContent: "space-between",
};

const startTimeTabel2 = {
  width: "95%",
  height: 180,
  borderRadius: 5,
  marginLeft:10,
  padding:20,
 // backgroundColor: "#dedcdc",
  //shadowColor: "#9b9b9b",
 // elevation: 2,
  // shadowOffset: {
  //   width: 0,
  //   height: 0.5
  // },
 // shadowRadius: 1,
  shadowOpacity: 1,
  flexDirection: "row",
  justifyContent: "space-between",
};
const SelectedTimeSquare = {
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 5,
  width: 100,
  padding: 10,
  margin: 2,
  backgroundColor: colors.BLUE
};
const SelectedTimeText = {
  fontFamily: "Helvetica",
  fontSize: 10,
  justifyContent: "center",
  alignSelf: "center",
  fontWeight: "bold",
  fontStyle: "normal",
  letterSpacing: 0,
  color: colors.WHITE
};
const UnSelectedTimeText = {
  fontFamily: "Helvetica",
  fontSize: 14,
  justifyContent: "center",
  alignSelf: "center",
  fontStyle: "normal",
  letterSpacing: 0,
  color: colors.WHITE
};
const scrollTopOval = {
  justifyContent: "center",
  alignItems: "center",
  position: "absolute",
  bottom: 50,
  right: 10,
  marginBottom: 10,
  borderRadius: 20,
  width: 40,
  height: 40,
  backgroundColor: colors.WHITE,
  shadowColor: "rgba(0, 0, 0, 0.5)",
  elevation: 2,
  shadowOffset: {
    width: 0,
    height: 2
  },
  shadowRadius: 4,
  shadowOpacity: 1
};
const trackVehicle = {
  justifyContent: "center",
  alignItems: "center",
  position: "absolute",
  bottom: 50,
  right: 10,
  marginBottom: 80,
  borderRadius: 20,
  width: 40,
  height: 40,
  backgroundColor: colors.WHITE,
  shadowColor: "rgba(0, 0, 0, 0.5)",
  elevation: 2,
  shadowOffset: {
    width: 0,
    height: 2
  },
  shadowRadius: 4,
  shadowOpacity: 1
};
const slide1 = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center'
};
const greenText = {
  fontFamily: "HelveticaNeue",
  fontSize: 10,
  fontWeight: "normal",
  fontStyle: "normal",
  letterSpacing: 0,
  color: colors.GREEN
};
