import React, { Component } from "react";
import { Button, Box } from "native-base";
import { Dimensions, Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../utils/Colors";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import busIcon from "../../assets/Bus.png";
import loginIcon from "../../assets/LoginRoute.png";
import logoutIcon from "../../assets/LogoutRoute.png";
// import LinearGradient from "react-native-linear-gradient";
import moment from "moment";
// import SideSwipe from 'react-native-sideswipe';
import SafeAreaView from "react-native-safe-area-view";
import { inject, observer } from "mobx-react";

const currentDay = moment().format("ddd");

// const theme = useColorScheme();
// const isDarkTheme = theme === 'dark';

@inject("fixedRouteStore")
@observer
class FixedRouteDetailsNEW extends Component {

  state = {
    currentSliderIndex: 0,
    shuttleResponse: {},
    data: {},
    schedule: [],
    nextAvailableIndex: null,
    CustomerUrl: "https://apiclient1.routematic.com",
    runsOn: '',
    routeName: '',
    startPoint: '',
    endPoint: '',
    fixRouteId: '',
    officeLocationId: '',
    nodalPointId: '',
    trackingDetails: '',
    wayPoints: '',
    currentIndex: 0,
    selectedColor: "#000000",
    finalObject: {},

    passTypes: '',
    selectedShift: '',
    selectedShiftTime: '',
    selectedShiftObject: {},
    fav_routes: {},
    fav_login: [],
    fav_logout: [],
    fixed_fav_routes: {},
    cachedData: {},
    loginRouteCollapse: false,
    logoutRouteCollapse: false,
  };

  constructor(props) {
    super(props);
  }

  UNSAFE_componentWillMount() {
console.warn('this.props.route.params dtl -> ', this.props.route.params);
  }

  componentDidMount() {
  }

  _renderItem = (item) => { // {item}
    return (
      <Box style={[SelectedTimeSquare, {backgroundColor: (item.SeatAvailablity == 0 ? colors.RED : colors.BLUE)}]}>
        <Text style={SelectedTimeText}>{moment(item.Date).format("DD MMM")}</Text>
        <Text style={UnSelectedTimeText}>{item.SeatAvailablityDesc}</Text>
      </Box>
    );
  };

  goToTop = () => {
    this.scrollView.scrollTo({ x: 0, y: 0, animated: true });
  };

  isItRunsToday() {
    let day = moment().format('ddd');
    let runs = this.state.runsOn.split(",");
    let hasData = runs.find(function (item) {
      return item.includes(day);
    });
    return !!hasData;
  }

  render() {
    const Store = this.props.fixedRouteStore;
    let routeDtl = Store.fixedRouteDetail;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.WHITE }}>
          <ScrollView
            style={{ flexDirection: "column", height: "100%" }}
            ref={c => {
              this.scrollView = c;
            }}
          >
            {routeDtl.LoginRoute?.RouteName && (

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
                  {routeDtl.LoginRoute?.Schedule &&
                      routeDtl.LoginRoute?.Schedule.split(",").map((day, index) => {
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
                <Image
                  defaultSource={loginIcon}
                  source={loginIcon}
                  resizeMethod="scale"
                  resizeMode="cover"
                  style={{ height: 50, width: 50, marginLeft: 10 }}
                />
                <View
                  style={{ flexDirection: "column", marginLeft: 10, flex: 1 }}
                >
                  <Text style={route12345}>
                    {routeDtl.LoginRoute?.RouteName}
                  </Text>
                  <View style={{ flexDirection: "row", marginTop: 5, flexWrap: 'wrap' }}>
                    <Text style={source}>
                      {Store.selectedRoster.pickupLocationSelected + " "}
                      <FontAwesome
                        name="long-arrow-right"
                        style={[
                          source,
                          { marginLeft: 10, marginRight: 10, marginTop: 2 }
                        ]}
                      />
                      {" " + Store.selectedRoster.officeLoginSelected}
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
                  <Text style={setShuttleStartTime}> SHIFT TIME</Text>
                  <Text style={ShiftTime}>{routeDtl.LoginRoute?.ShiftTime}</Text>
                </View>
                <View
                  style={{
                    height: 50,
                    margin: 5,
                  }}
                >
                  <ScrollView horizontal>
                  {routeDtl.LoginRoute?.ShiftDates.map((item) => {
                    console.warn('shift date -> ', item);
                    return this._renderItem(item);
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
                    {routeDtl.LoginRoute &&
                      routeDtl.LoginRoute?.Waypoints.map(
                        (waypoint, index) => {
                          if (index === 0) {
                            return this.drawFirstLine(
                              index,
                              waypoint.Name,
                              "Dep. " + waypoint.ETA,
                              waypoint.IsOffice,
                              this.state.loginRouteCollapse
                            );
                          } else if (routeDtl.LoginRoute?.Waypoints.length - 1 === index) {
                            return this.drawLastLine(
                              index,
                              waypoint.Name,
                              waypoint.ETA, // "Dep. " + 
                              waypoint.IsOffice
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
                    {routeDtl.LoginRoute &&
                      routeDtl.LoginRoute?.Waypoints.map(
                        (waypoint, index) => {
                          if (index === 0) {
                            return this.drawFirstLine(
                              index,
                              waypoint.Name,
                              "Dep. " + waypoint.ETA,
                              waypoint.IsOffice,
                              this.state.loginRouteCollapse
                            );
                          } else if (routeDtl.LoginRoute?.Waypoints.length - 1 === index) {
                            return this.drawLastLine(
                              index,
                              waypoint.Name,
                              waypoint.ETA, // "Dep. " + 
                              waypoint.IsOffice
                            );
                          } else if (routeDtl.LoginRoute?.Waypoints.length > 2) {
                            return this.drawLine(
                              index,
                              waypoint.Name,
                              "Dep. " + waypoint.ETA,
                              waypoint.IsOffice
                            );
                          }
                        }
                      )}
                  </View>
                </TouchableOpacity>
              )}
            </View>
            )}

          {routeDtl.LogoutRoute?.RouteName && (
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
                  {routeDtl.LogoutRoute?.Schedule &&
                      routeDtl.LogoutRoute?.Schedule.split(",").map((day, index) => {
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
                <Image
                  defaultSource={logoutIcon}
                  source={logoutIcon}
                  resizeMethod="scale"
                  resizeMode="cover"
                  style={{ height: 50, width: 50, marginLeft: 10 }}
                />
                <View
                  style={{ flexDirection: "column", marginLeft: 10, flex: 1 }}
                >
                  <Text style={route12345}>
                    {routeDtl.LogoutRoute?.RouteName}
                  </Text>
                  <View style={{ flexDirection: "row", marginTop: 5, flexWrap: 'wrap' }}>
                    <Text style={source}>
                      {Store.selectedRoster.officeLogoutSelected + " "}
                      <FontAwesome
                        name="long-arrow-right"
                        style={[
                          source,
                          { marginLeft: 10, marginRight: 10, marginTop: 2 }
                        ]}
                      />
                      {" " + Store.selectedRoster.dropLocationSelected}
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
                  <Text style={setShuttleStartTime}> SHIFT TIME</Text>
                  <Text style={ShiftTime}>{routeDtl.LogoutRoute?.ShiftTime}</Text>
                </View>
                <View
                  style={{
                    height: 50,
                    margin: 5,
                  }}
                >
                  <ScrollView horizontal>
                  {routeDtl.LogoutRoute?.ShiftDates.map((item) => {
                    console.warn('shift date -> ', item);
                    return this._renderItem(item);
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
                    {routeDtl.LogoutRoute &&
                      routeDtl.LogoutRoute?.Waypoints.map(
                        (waypoint, index) => {
                          if (index === 0) {
                            return this.drawFirstLine(
                              index,
                              waypoint.Name,
                              "Dep. " + waypoint.ETA,
                              waypoint.IsOffice,
                              this.state.logoutRouteCollapse
                            );
                          } else if (routeDtl.LogoutRoute?.Waypoints.length - 1 === index) {
                            return this.drawLastLine(
                              index,
                              waypoint.Name,
                              waypoint.ETA, // "Dep. " + 
                              waypoint.IsOffice
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
                    {routeDtl.LogoutRoute &&
                      routeDtl.LogoutRoute?.Waypoints.map(
                        (waypoint, index) => {
                          if (index === 0) {
                            return this.drawFirstLine(
                              index,
                              waypoint.Name,
                              "Dep. " + waypoint.ETA,
                              waypoint.IsOffice,
                              this.state.logoutRouteCollapse
                            );
                          } else if (routeDtl.LogoutRoute?.Waypoints.length - 1 === index) {
                            return this.drawLastLine(
                              index,
                              waypoint.Name,
                              waypoint.ETA, // "Dep. " + 
                              waypoint.IsOffice
                            );
                          } else if (routeDtl.LogoutRoute?.Waypoints.length > 2) {
                            return this.drawLine(
                              index,
                              waypoint.Name,
                              "Dep. " + waypoint.ETA,
                              waypoint.IsOffice
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
              backgroundColor={colors.BLUE}
              style={{
                marginLeft: 5,
                flex: 1, borderRadius: 5,
                borderWidth: 1,
              }}
              onPress={() => {
                this.props.fixedRouteStore.generatePass(this).then((response)=>{
                });
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

export default FixedRouteDetailsNEW;

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