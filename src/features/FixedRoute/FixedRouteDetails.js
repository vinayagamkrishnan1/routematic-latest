import React, { Component } from "react";
import { Button, Box } from "native-base";
import { Dimensions, Image, ScrollView, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../utils/Colors";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import TouchableDebounce from "../../utils/TouchableDebounce";
import busIcon from "../../assets/Bus.png";
import LinearGradient from "react-native-linear-gradient";
import moment from "moment";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { API } from "../../network/apiFetch/API";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import { URL } from "../../network/apiConstants/index";
import { TYPE } from "../../model/ActionType";
import * as Alert from "../../utils/Alert";
import { asyncString } from "../../utils/ConstantString";
// import Carousel from "react-native-snap-carousel";
import Carousel from 'react-native-anchor-carousel';
import SideSwipe from 'react-native-sideswipe';
import SafeAreaView from "react-native-safe-area-view";

const width = Dimensions.get("screen").width;

const currentDay = moment().format("ddd");

class FixedRouteDetails extends Component {
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
    cachedData: {}
  };

  static navigationOptions = ({ navigation }) => {
    return {
      title: "Route Details"
      //headerStyle: { display: "none" }
    };
  };

  constructor(props) {
    super(props);
    this._renderItem = this._renderItem.bind(this);
  }

  UNSAFE_componentWillMount() {
console.warn('this.props.route.params dtl -> ', this.props.route.params);
    let shiftTimes = this.props.route.params.schedule ? this.props.route.params.schedule : [];
    for (let i = 0; i < shiftTimes.length; i++) {
      shiftTimes[i].routeID = this.props.route.params.fixedRouteId ? this.props.route.params.fixedRouteId : '';
    }
    this.setState({
      runsOn: this.props.route.params.runsOn ? this.props.route.params.runsOn : '',
      routeName: this.props.route.params.routeName ? this.props.route.params.routeName : '',
      startPoint: this.props.route.params.startPoint ? this.props.route.params.startPoint : '',
      endPoint: this.props.route.params.endPoint ? this.props.route.params.endPoint : '',

      schedule: shiftTimes,
      selectedShift: shiftTimes[0].shiftID,
      selectedShiftTime: shiftTimes[0].shiftTime,
      selectedShiftObject: shiftTimes[0],
      fixRouteId: this.props.route.params.fixedRouteId ? this.props.route.params.fixedRouteId : '',
      officeLocationId: this.props.route.params.officeLocationId ? this.props.route.params.officeLocationId : '',
      nodalPointId: this.props.route.params.nodalPointId ? this.props.route.params.nodalPointId : '',
      fav_routes: this.props.route.params.data
    });
  }

  componentDidMount() {
    this.getFixedRouteDetails(this.state.fixRouteId, this.state.officeLocationId, this.state.nodalPointId);
    this.getBusPassTypes();
    AsyncStorage.getItem(asyncString.FIXED_FAV_ROUTES)
      .then(req => JSON.parse(req))
      .then(cachedData => {
        this.setState({ cachedData: cachedData });
      }).catch((error) => {
        console.warn("Error Async error" + JSON.stringify(error));
      });
    this.getPasses();
  }

  _renderItem = ({ itemIndex, currentIndex, item, }) => {
    return (
      <Box style={SelectedTimeSquare}>
        <TouchableDebounce
          onPress={() =>
            this.setState({
              currentIndex: itemIndex,
              currentSliderIndex: itemIndex,
              selectedShiftObject: this.state.schedule[itemIndex],
              selectedShift: this.state.schedule[itemIndex].shiftID,
              selectedShiftTime: this.state.schedule[itemIndex].shiftTime
            })
          }
        >
          <Text style={currentIndex === itemIndex ? SelectedTimeText : UnSelectedTimeText}>{item.shiftTime}</Text>
        </TouchableDebounce>
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

  isWithInShiftTime() {
    let index = this.state.currentSliderIndex;
    if (this.state.schedule && this.state.schedule[index].wayPoints) {
      let length = this.state.schedule[index].wayPoints.length;
      if (this.isItRunsToday() === true) {
        let low = moment(this.state.selectedShiftObject.wayPoints[0].eta, "HH:mm").subtract(30, "minutes").format("HH:mm");
        let high = moment(this.state.selectedShiftObject.wayPoints[length - 1].eta, "HH:mm").add(30, 'minutes').format("HH:mm");
        let start = moment().startOf('day').set('hour', parseInt(low.split(":")[0])).set('minute', parseInt(low.split(":")[1])).format("YYYY-MM-DD HH:mm");
        let end = moment().startOf('day').set('hour', parseInt(high.split(":")[0])).set('minute', parseInt(high.split(":")[1])).format("YYYY-MM-DD HH:mm");
        let current = moment().format("YYYY-MM-DD HH:mm");
        return moment(current).isSameOrAfter(start) && moment(current).isSameOrBefore(end);
      } else return false;
    } else return false;
  }

  render() {
    let timeLine = [];
    this.state.schedule[this.state.currentSliderIndex].wayPoints.map((item) => {
      timeLine.push({ time: item.eta, title: item.name, description: "dep" + item.eta });
    });
    const { width } = Dimensions.get('window');
    const contentOffset = (width - 65) / 2;
    // if (this._slider1Ref)
    // this._slider1Ref.snapToItem(this.state.currentSliderIndex);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.WHITE }}>
          <ScrollView
            style={{ flexDirection: "column", height: "100%" }}
            ref={c => {
              this.scrollView = c;
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
                flex: 1
              }}
            >
              <LinearGradient
                start={{ x: 0, y: 0.75 }}
                end={{ x: 1, y: 0.25 }}
                colors={[colors.BLUE, colors.GREEN]}
                style={oval}
              >
                <Image
                  defaultSource={busIcon}
                  source={busIcon}
                  resizeMethod="scale"
                  resizeMode="cover"
                  style={{ height: 20, width: 35 }}
                />
              </LinearGradient>
              <View
                style={{ flexDirection: "column", marginLeft: 10, flex: 1 }}
              >
                <Text style={route12345}>
                  {this.state.routeName}
                </Text>
                <View style={{ flexDirection: "row", marginTop: 5, flexWrap: 'wrap' }}>
                  <Text style={source}>
                    {this.state.startPoint + " "}
                    <FontAwesome
                      name="long-arrow-right"
                      style={[
                        source,
                        { marginLeft: 10, marginRight: 10, marginTop: 2 }
                      ]}
                    />
                    {" " + this.state.endPoint}
                  </Text>
                </View>
              </View>
            </View>
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
                <View style={{ flexDirection: "row", marginRight: 10 }}>
                  {this.state.runsOn &&
                    this.state.runsOn.split(",").map((day, index) => {
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
            <View style={startTimeRectangle}>
              <Text style={setShuttleStartTime}> SHIFT</Text>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: 30,
                  margin: 16
                }}
              >
                <SideSwipe
                  index={this.state.currentIndex}
                  itemWidth={65}
                  ref={(c) => {
                    this._slider1Ref = c;
                  }}
                  data={this.state.schedule}
                  contentOffset={contentOffset}
                  onIndexChange={index =>

                    this.setState({
                      currentSliderIndex: index,
                      currentIndex: index,
                      selectedShiftObject: this.state.schedule[index],
                      selectedShift: this.state.schedule[index].shiftID,
                      selectedShiftTime: this.state.schedule[index].shiftTime
                    })
                    // this.setState(() => ({ currentIndex: index }))
                  }
                  renderItem={this._renderItem}
                />
                {/* <Carousel
                            ref={(c) => {
                              this._slider1Ref = c;
                            }}
                            data={this.state.schedule}
                            itemWidth={200}
                            separatorWidth={10}
                            onScroll = {console.warn("End")}
                            containerWidth={width - 20}
                            renderItem={this._renderItem}
                  /> */}
              </View>
            </View>

            <View style={{ flex: 1, margin: 16, padding: 16 }}>
              {this.state.schedule[this.state.currentSliderIndex] &&
                this.state.schedule[this.state.currentSliderIndex].wayPoints.map(
                  (item, index) => {
                    if (index === 0) {
                      return this.drawFirstLine(
                        index,
                        this.state.schedule[this.state.currentSliderIndex].wayPoints[
                          index
                        ].name,
                        "Dep. " +
                        this.state.schedule[this.state.currentSliderIndex]
                          .wayPoints[index].eta,
                        this.state.schedule[this.state.currentSliderIndex]
                          .wayPoints[index].isOffice
                      );
                    } else if (
                      this.state.schedule[this.state.currentSliderIndex].wayPoints
                        .length -
                      1 ===
                      index
                    ) {
                      return this.drawLastLine(
                        index,
                        this.state.schedule[this.state.currentSliderIndex].wayPoints[
                          index
                        ].name,
                        "Dep. " +
                        this.state.schedule[this.state.currentSliderIndex]
                          .wayPoints[index].eta,
                        this.state.schedule[this.state.currentSliderIndex]
                          .wayPoints[index].isOffice
                      );
                    } else if (
                      this.state.schedule[this.state.currentSliderIndex].wayPoints
                        .length > 2
                    ) {
                      return this.drawLine(
                        index,
                        this.state.schedule[this.state.currentSliderIndex].wayPoints[
                          index
                        ].name,
                        "Dep. " +
                        this.state.schedule[this.state.currentSliderIndex]
                          .wayPoints[index].eta,
                        this.state.schedule[this.state.currentSliderIndex]
                          .wayPoints[index].isOffice
                      );
                    }
                  }
                )}
            </View>
          </ScrollView>
        {this.isWithInShiftTime() && <TouchableDebounce
          style={trackVehicle}
          onPress={() => {
            console.warn("data" + JSON.stringify(this.state.data));
            if (this.state.data && this.state.data.isPassAvailable) {
              this.setState({
                wayPoints: this.state.schedule[this.state.currentSliderIndex].wayPoints
              }, () => {
                console.warn("cached " + JSON.stringify(this.state.cachedData));
                let Item = this.state.fav_routes;
                let cachedData = this.state.cachedData ? this.state.cachedData : {};
                if (Item.item.tripType === "D") {
                  let isNotExist = true;
                  let logout = cachedData.hasOwnProperty("logout") ? cachedData.logout : [];
                  logout.map((temp) => {
                    if (temp.fixedRouteID === Item.item.fixedRouteID) {
                      isNotExist = false;
                    }
                  });
                  if (isNotExist) {
                    console.warn("inside if at logout length " + logout.length);
                    if (logout.length < 2) {
                      logout.push(Item.item)
                    } else {
                      logout.splice(1, 1);
                      logout.splice(0, 0, Item.item);
                    }
                    let temp = this.state.cachedData ? this.state.cachedData : {};
                    if (temp.hasOwnProperty("logout")) {
                      temp.logout = logout;
                    } else {
                      temp["logout"] = logout;
                    }
                    console.warn("logout " + JSON.stringify(temp));
                    this.setState({ cachedData: temp });
                    AsyncStorage.setItem(asyncString.FIXED_FAV_ROUTES, JSON.stringify(temp).toString());
                  }
                } else {
                  let isNotExist = true;
                  let login = cachedData.hasOwnProperty("login") ? cachedData.login : [];
                  login.map((temp) => {
                    if (temp.fixedRouteID === Item.item.fixedRouteID) {
                      isNotExist = false;
                    }
                  });
                  if (isNotExist) {
                    console.warn("inside if at login ");
                    if (login.length < 2) {
                      login.push(Item.item)
                    } else {
                      login.splice(1, 1);
                      login.splice(0, 0, Item.item);
                    }
                    let temp = this.state.cachedData ? this.state.cachedData : {};
                    if (temp.hasOwnProperty("login")) {
                      temp.login = login;
                    } else {
                      temp["login"] = login;
                    }
                    console.warn("login " + JSON.stringify(temp));
                    this.setState({ cachedData: temp });
                    AsyncStorage.setItem(asyncString.FIXED_FAV_ROUTES, JSON.stringify(temp).toString());
                  }
                }
                this.getFixedRouteTrackingDetails(this.state.fixRouteId, this.state.selectedShift)
              });

            } else
              Alert.show(null, "Please generate a pass to track the vehicle");
          }}
        >
          <MaterialIcons name="gps-fixed" style={{ fontSize: 30 }} />
        </TouchableDebounce>
        }
        <View
          style={{ position: "absolute", flexDirection: 'row', bottom: 0, right: 0, padding: 20, width: "100%" }}
        >
        
           {this.state.data.bookingEnabled &&
            <Button 
            backgroundColor={colors.BLUE}
            style={{
              flex: 1, borderRadius: 10,
              borderWidth: 1,
            }}
            onPress={() => {
              if (this.state.finalObject.passes.length > 0) {
                this.props.navigation.navigate("SeatBooking", {
                  // passId: passId,
                  fixRouteId: this.state.fixRouteId,
                  shiftTimes: this.state.schedule,
                  selectedShiftTime: this.state.selectedShiftTime === '' ? this.state.schedule[0].shiftTime : this.state.selectedShiftTime,
                  selectedShiftId: this.state.selectedShift === '' ? this.state.schedule[0].shiftID : this.state.selectedShift,
                  passes: this.state.finalObject,
                  advanceSeatBooking: this.state.data.advanceSeatBooking,

                });
              } else {
                console.warn("passes" + JSON.stringify(this.state.finalObject))
                Alert.show("Warning", "You do not have any passes. Please generate a pass to book the seat.")
              }
            }
            }>
            <Text style={{ color: colors.WHITE }}>Book Seat</Text>
          </Button>
          }
          <Button
            backgroundColor={colors.BLUE}
            style={{
              marginLeft: 5,
              flex: 1, borderRadius: 10,
              borderWidth: 1,
            }}
            onPress={() => {
              if (this.state.passTypes && this.state.passTypes.length > 0) {
                this.props.navigation.navigate("BusPassBooking", {
                  passTypes: this.state.passTypes,
                  suggestedCategory: this.state.data.suggestedCategory,
                  categories: this.state.data.categories,

                  dailyPassAdvance: this.state.data.dailyPassAdvance,
                  weeklyPassAdvance: this.state.data.weeklyPassAdvance,
                  monthlyPassAdvance: this.state.data.monthlyPassAdvance,


                  weeklyPassCutoff: this.state.data.weeklyPassCutoff,
                  monthlyPassCutoff: this.state.data.monthlyPassCutoff,

                })
              } else {
                //Todo message has to be confirmed.
                Alert.show(null, "Issue while generating the pass, Please contact your transport admin");
              }
            }
            }
          >
            <Text style={{ color: colors.WHITE }}>Generate Pass</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  drawFirstLine(index, Title, desc, isOffice) {
    return (
      <View style={{ flexDirection: "row" }} key={index}>
        <View
          style={{
            flexDirection: "row",
            transform: [{ rotate: "90deg" }]
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
              marginTop: 3,
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
      </View>
    );
  }
  drawLastLine(index, Title, desc, isOffice) {
    return (
      <View style={{ flexDirection: "row", marginTop: -30 }} key={index}>
        <View
          style={{
            flexDirection: "row",
            transform: [{ rotate: "90deg" }]
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
              marginTop: 3,
              height: 3,
              width: 70,
              backgroundColor: colors.WHITE
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
  drawLine(index, Title, desc, isOffice) {
    return (
      <View style={{ flexDirection: "row", marginTop: -30 }} key={index}>
        <View
          style={{
            flexDirection: "row", transform: [{ rotate: "90deg" }]
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
              marginTop: 3,
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
  callback = async (actionType, response) => {
    switch (actionType) {
      case TYPE.GET_FIXED_ROUTE_DETAILS: {
        handleResponse.getFixedRoutesDetails(response, this);
        break;
      }
      case TYPE.GET_FIXED_ROUTE_TRACKING_DETAILS: {
        handleResponse.getFixedRouteTrackingDetails(response, this);
        break;
      }
      case TYPE.GET_BUS_PASS_TYPES: {
        handleResponse.getBusPassTypes(response, this);
        break;
      }
      case TYPE.GET_PASSES: {
        handleResponse.getAllPasses(this, response);
        break;
      }
    }
  };
  getPasses() {
    API.newFetchXJSON(
      URL.GET_PASSES,
      true,
      this.callback.bind(this),
      TYPE.GET_PASSES
    );
  }

  getFixedRouteDetails(fixedRouteId, officeLocationId, nodalPointId) {
    this.setState({ isLoading: true });
    let url = URL.GET_FIXED_ROUTE_DETAILS + "?FixedRouteId=" + fixedRouteId + "&OfficeLocationId=" + officeLocationId + "&NodalPointId=" + nodalPointId;
    API.newFetchXJSON(
      url,
      true,
      this.callback.bind(this),
      TYPE.GET_FIXED_ROUTE_DETAILS
    );
  }
  getFixedRouteTrackingDetails(fixedRouteId, shiftId) {
    if (!shiftId) {
      Alert.show("Fixed Route", "Please select the Shift");
    } else {
      this.state.schedule.map((data) => {
        if (shiftId === data.shiftID) {
          this.setState({ selectedShiftTime: data.shiftTime });
        }
      });
      this.setState({ isLoading: true });
      let url = URL.GET_FIXED_ROUTE_TRACKING_DETAILS + "?FixedRouteID=" + fixedRouteId + "&ShiftID=" + shiftId;
      API.newFetchXJSON(
        url,
        true,
        this.callback.bind(this),
        TYPE.GET_FIXED_ROUTE_TRACKING_DETAILS
      );
    }
  }
  getBusPassTypes() {

    API.newFetchXJSON(
      URL.GET_BUS_PASS_TYPES,
      true,
      this.callback.bind(this),
      TYPE.GET_BUS_PASS_TYPES
    );
  }
}



FixedRouteDetails.propTypes = {};

export default FixedRouteDetails;
const parent = {
  width: 0,
  flexGrow: 1,
  marginBottom: 65,
  marginLeft: 15,
  flexDirection: "column"
};
const textLine = {
  flex: 1,
  flexWrap: 'wrap'
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
  fontSize: 18,
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
  marginLeft: 10,
  marginRight: 10,
  justifyContent: "center",
  alignItems: "center",
  margin: 10,
  height: 40,
  borderRadius: 5,
  backgroundColor: "#ffffff",
  shadowColor: "#9b9b9b",
  elevation: 2,
  shadowOffset: {
    width: 0.5,
    height: 0.5
  },
  shadowRadius: 3,
  shadowOpacity: 1
};
const runsOn = {
  marginLeft: 10,
  fontFamily: "Helvetica",
  fontSize: 15,
  fontWeight: "300",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#4a4a4a"
};
const selectedDayStyle = {
  fontFamily: "Helvetica",
  fontSize: 12,
  fontWeight: "bold",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#417505",
  marginRight: 3
};
const notSelectedDayStyle = {
  fontFamily: "Helvetica",
  fontSize: 12,
  fontStyle: "normal",
  letterSpacing: 0,
  color: colors.BLACK,
  marginRight: 3
};
const setShuttleStartTime = {
  marginTop: 10,
  marginLeft: 16,
  fontFamily: "Helvetica",
  fontSize: 10,
  fontWeight: "bold",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#4a90e2"
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
  width: 65,
  backgroundColor: colors.WHITE
};
const SelectedTimeText = {
  fontFamily: "Helvetica",
  fontSize: 18,
  justifyContent: "center",
  alignSelf: "center",
  fontWeight: "bold",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#000000"
};
const UnSelectedTimeText = {
  fontFamily: "Helvetica",
  fontSize: 14,
  justifyContent: "center",
  alignSelf: "center",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#000000"
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

