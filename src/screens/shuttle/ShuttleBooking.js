import React, { Component } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Picker,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { colors } from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import moment from "moment";
import { _renderDate, _renderInputContent, _renderInputDate } from "../../screens/roster/customeComponent/customComponent";
import { URL } from "../../network/apiConstants";
import { API } from "../../network/apiFetch/API";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import DateTimePicker from "react-native-modal-datetime-picker";
import { Box, Button, Row } from "native-base";
import * as Toast from "../../utils/Toast";
import bus_loading from "../../assets/bus_loading.gif";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import { TYPE } from "../../model/ActionType";
// import {
//   _renderOffice,
//   _renderTitleContent,
//   _renderWeeklyOff,
//   viewNotSelectedRosterTypeStyle,
//   viewSelectedStyle
// } from "../roster/customeComponent/customComponent";
const selectFrom = "Boarding Point";
const selectTo = "Destination";
const width = Dimensions.get("screen").width;

class ShuttleBookingNEW extends Component {

  state = {
    isLoading: false,
    showPop: false,
    showTimePop: false,
    isReturn: false,
    selectedOption: "",
    From: "Select",
    To: "Select",

    shuttleDetail: {},
    routesList: [],

    ScheduleID: "",
    routeName: "",
    isDatePickerVisible: false,
    TripDate: "" /*moment().format("YYYY-MM-DD")*/,
    isTwoWayTrip: false,
    returnShuttleEnabled:false,
    returnShuttleDetail: {},
    
    startTime:"00:00",
    returnTime:"00:00",
    StartWayPointID:0,
    EndWayPointID:0,

    startTimes: [],
    returnTimes: [],
    wayPoints: [],
  };

  callback = async (actionType, response, copyDataObj) => {
    switch (actionType) {
      case TYPE.SHUTTLE_GENERATE_TICKET: {
        handleResponse.generateTicketShuttle(
          response,
          this,
          copyDataObj.ticketInformation
        );
        break;
      }
      case TYPE.SHUTTLE_ROUTE_DETAILS: {
        handleResponse.getShuttleRouteDetails(response, this);
        console.log('Sugan','Shuttle Details ------'+JSON.stringify(response));
        this.configSetup();
        break;
      }
    }
  };

  static navigationOptions = ({ navigation }) => {
    return {
      title: "Shuttle Booking",
      headerTitleStyle: { fontFamily: "Roboto" }
    };
  };

  toggleDatePicker() {
    if (!this.state.isDatePickerVisible) {
      this.setState({ isDatePickerVisible: true });
    } else {
      this.setState({ isDatePickerVisible: false });
    }
  }

  toggleWay() {
    if (!this.state.isTwoWayTrip) {
      this.setState({ isTwoWayTrip: true });
    } else {
      this.setState({ isTwoWayTrip: false });
    }
  }

  toggleModalVisible(type) {
    if (!this.state.showPop)
      this.setState({ showPop: true, selectedOption: type });
    else this.setState({ showPop: false });
  }

  UNSAFE_componentWillMount(){
    this.configSetup();
    // this.subs = [
    //   this.props.navigation.addListener("focus", () => this.getShuttleDetails())
    // ];
  }

  _renderWayTrip = () => {
    return (
        <View
            style={{
                width: "100%",
                height: 50,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginVertical: 10
            }}
        >
            <Box
                style={{
                    flexDirection: "row",
                    borderRadius: 25,
                    justifyContent: "space-between",
                    marginLeft: 50,
                    marginRight: 50
                }}
            >
                <TouchableDebounce
                      style={!this.state.isTwoWayTrip
                        ? [viewSelectedStyle, {flexDirection: "row", width: 150}]:[viewNotSelectedRosterTypeStyle, {flexDirection: "row", width: 150}]

                     //[viewSelectedStyle, {flexDirection:"row", width:150}]
                      //this.state.isTwoWayTrip
                            // ? [viewSelectedStyle, {flexDirection: "row", width: 100}]
                        //     : 
                      //  {flexDirection: "row", width: 100}
                        // : 
                       //  viewNotSelectedRosterTypeStyle
                    }
                    onPress={() => {
                      this.setState({isTwoWayTrip:false});
                        // if (store.RosteringAllowedLogin === 1) {
                        //     store.setOnlyLogin();
                        // }
                    }}
                >
                    {!this.state.isTwoWayTrip && (
                        <Ionicons
                            name={"ios-checkmark-circle"}
                            style={{color: colors.WHITE}}
                            size={20}
                        />
                    )}
                    <Text
                        style={{
                            color: !this.state.isTwoWayTrip
                                    ? colors.WHITE
                                    : colors.BLACK,
                                // : colors.GRAY,
                            marginLeft: 12,
                            fontWeight: 'bold'
                        }}
                    >
                        One Way Trip
                    </Text>
                </TouchableDebounce>
                 {this.state.returnShuttleEnabled? <TouchableDebounce
                    style={this.state.isTwoWayTrip
                             ? [viewSelectedStyle, {flexDirection: "row", width: 150}]:[viewNotSelectedRosterTypeStyle, {flexDirection: "row", width: 150}]
                            // : {justifyContent: "center", alignItems: "center"}
                        // : {
                        //     width: 80,
                        //     justifyContent: "center",
                        //     alignItems: "center",
                        // }
                    }
                    onPress={() => {
                      this.setState({isTwoWayTrip:true});

                        // if (store.RosteringAllowedLogout === 1) {
                        //     store.setOnlyLogOut()
                        // }
                    }}
                >
                    {this.state.isTwoWayTrip&& (
                        <Ionicons
                            name={"ios-checkmark-circle"}
                            style={{
                                color:
                                    this.state.isTwoWayTrip ? colors.WHITE
                                        : colors.BLACK
                            }}
                            size={20}
                        />
                    )}
                    <Text
                        style={{
                            color: this.state.isTwoWayTrip
                                    ? colors.WHITE
                                    : colors.BLACK,
                                   // : colors.BLACK,
                            //    : colors.GRAY,
                            marginLeft: 10,
                            marginRight: 10,
                            alignSelf: "center",
                            fontWeight: 'bold'
                        }}
                    >
                       Two Way Trip
                    </Text>
                </TouchableDebounce>:<></>}       
               
           
            </Box>
        </View>
    );
};

  _renderRightArrow() {
    return (
      <FontAwesome
        name="chevron-right"
        style={{
          fontSize: 20,
          marginRight: 20,
          color: colors.GRAY,
          fontFamily: "Helvetica",
          right: 0,
          position: "absolute"
        }}
        onPress={() => {
          setTimeout(() => this.setState({ showTimePop: false }), 0);
        }}
      />
    );
  }

  updateData() {
    console.warn('data updated');
    let startTimes = [];
    let returnTimes = [];
    let wayPoints = [];

    this.state.shuttleDetail?.schedule.filter(schedule => {
      let _today = new Date(this.state.TripDate);
      console.warn('_today - ', this.state.TripDate, _today.toDateString(), new Date().toDateString());
      const currentTime = moment().format("YYYY-MM-DD HH:mm");
      if(schedule.dayOfWeek == _today.getDay()) {
        if (_today.toDateString() === new Date().toDateString()) {
          let shiftTime = moment(this.state.TripDate + " " + schedule.startTime, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD HH:mm");
          if (moment(shiftTime).isSameOrAfter(currentTime)) {
            startTimes.push(schedule);
          }
        } else {
          startTimes.push(schedule);
        }
      };
    });
    console.warn('startTimes - ', startTimes);
    if (startTimes.length > 0) {
      wayPoints = startTimes[0].stop;
    }

    this.state.returnShuttleDetail?.schedule.filter(schedule => {
      if(schedule.dayOfWeek == new Date(this.state.TripDate).getDay()) {
        returnTimes.push(schedule);
      };
    });

    this.setState({
      startTimes,
      returnTimes,
      wayPoints,
      startTime: startTimes.length > 0 ? startTimes[0].startTime : "00:00",
      returnTime: returnTimes.length > 0 ? returnTimes[0].startTime : "00:00"
    })
  }

  render() {
    return (
      <SafeAreaView
          style={{
              flex: 1,
              backgroundColor: colors.LIGHT_GRAY
          }}
      >
          <View style={{flexDirection: "column", flex: 1}}>
              
              {/* {spinner.visible(this.props.fixedRouteStore.isLoading)} */}

              <View style={[itemStyle, {marginTop: 5, height: 100}]}>
                {this._renderDatePicker()}
              </View>
              <View style={itemStyle}>
                  {this._renderStartEndTime()}
              </View>
              <View style={itemStyle}>
                  {this._renderPickup()}
              </View>
              <View style={itemStyle}>
                  {this._renderDrop()}
              </View>

              {this.renderDatePicker()}
              {this.renderModalView(this.state.wayPoints)}
              {this._renderTime(this.state.isReturn ? this.state.returnTimes : this.state.startTimes)}
          </View>
          <Button
                  backgroundColor={colors.BLUE}
                  style={{margin: 10}}
                  onPress={()=>{
                    if (this.state.startTimes.length === 0) {
                      Toast.show(
                        "No Shuttle timings are available at this moment. Please try later"
                      );
                      return;
                    }
                    if(this.state.isTwoWayTrip)
                      {
                        if(this.state.startTime > this.state.returnTime)
                        {
                          Toast.show("Please Select Valid Return Time ");
                          return;
                        }
                      }
                    if (!this.state.From || this.state.From === "Select") {
                      Toast.show("Please select boarding point");
                      return;
                    } else if (!this.state.To || this.state.To === "Select") {
                      Toast.show("Please select destination");
                      return;
                    }
  
                    this.gotoBookingDetail();
                  }}
              >
                  <Text style={{color: colors.WHITE, fontWeight: "700"}}>
                      Next
                  </Text>
              </Button>
      </SafeAreaView>
  );
  }
  render_old() {
    console.warn('loading - ', this.state.isLoading);
    console.warn('state - ', this.state.startTime);
    // if (this.state.isLoading) return this.showLoaderScreen();

    return (
      <View style={{ flex: 1, alignItems: "center", padding: 10 }}>
         {/* {this._renderWayTrip()} */}
        <View style={rectangle14}>
          <TouchableDebounce
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center"
            }}
            onPress={() => this.toggleDatePicker()}
          >
            <View
              style={{ height: 60, marginLeft: 10, marginTop: 10 }}
              onPress={() => this.toggleDatePicker()}
            >
              {_renderDate(
                "Date",
                moment(this.state.TripDate).format("DD"),
                moment(this.state.TripDate).format("MMMM YYYY"),
                moment(this.state.TripDate).format("dddd")
              )}
            </View>
            {/* {this._renderRightArrow()} */}
          </TouchableDebounce>
          {this._renderLine("100%")}

          <View style={startTimeRectangle}>
            <Text style={setShuttleStartTime}>SET SHUTTLE START TIME</Text>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 50,
                marginTop: 10
              }}
            >
              {this.state.startTime != "00:00" ? (
                <TouchableDebounce
                  style={{ width: "100%", height: "100%" }}
                  onPress={() => this.setState({ showTimePop: true })}
                >
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      justifyContent: "space-between",
                      flexDirection: "row"
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 25,
                        marginLeft: 10,
                        color: colors.BLACK
                      }}
                    >
                          {
                        this.state.startTime
                      }
                    </Text>
                    {/* {this._renderRightArrow()} */}
                  </View>
                </TouchableDebounce>
              ) : (
                <Text
                  style={{
                    alignSelf: "center",
                    color: colors.RED
                    //margin: 10
                  }}
                >
                  No shuttle timings are available. Please choose next available
                  day.
                </Text>
              )}
            </View>
          </View>

          {this.state.isTwoWayTrip? <>
          {this._renderLine("100%")}
          <View style={startTimeRectangle}>
            <Text style={setShuttleStartTime}>RETURN SHUTTLE TIME</Text>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 50,
                marginTop: 10
              }}
            >
              {this.state.returnShuttleDetail ? (
                <TouchableDebounce
                  style={{ width: "100%", height: "100%" }}
                  onPress={() => this.setState({ showTimePop: true, isReturn: true })}
                >
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      justifyContent: "space-between",
                      flexDirection: "row"
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 25,
                        marginLeft: 10,
                        color: colors.BLACK
                      }}
                    >
                      {
                        this.state.returnTime
                      }                    </Text>
                    {/* {this._renderRightArrow()} */}
                  </View>
                </TouchableDebounce>
              ) : (
                <Text
                  style={{
                    alignSelf: "center",
                    color: colors.RED
                    //margin: 10
                  }}
                >
                  No shuttle timings are available. Please choose next available
                  day.
                </Text>
              )}
            </View>
          </View></>
          :<></>}
          
          {this._renderLine("100%")}
          <TouchableDebounce
            onPress={() => this.toggleModalVisible(selectFrom)}
          >
            <View style={{minHeight: 160, display: 'flex', alignContent: 'center', justifyContent: 'center'}}>
              {this.renderTitlePlace(selectFrom, this.state.From)}
              {/* {this._renderRightArrow()} */}
            </View>
          </TouchableDebounce>

          {this._renderLine()}
          <TouchableDebounce
            onPress={() => this.toggleModalVisible(selectTo)}
          >
            <View style={{minHeight: 160, display: 'flex', alignContent: 'center', justifyContent: 'center'}}>
              {this.renderTitlePlace(selectTo, this.state.To)}
              {/* {this._renderRightArrow()} */}
            </View>
          </TouchableDebounce>
        </View>

        <TouchableDebounce
          style={oval}
          onPress={() => {
            if (this.state.startTimes.length === 0) {
              Toast.show(
                "No Shuttle timings are available at this moment. Please try later"
              );
              return;
            }
            if(this.state.isTwoWayTrip)
              {
                if(this.state.startTime > this.state.returnTime)
                {
                  Toast.show("Please Select Valid Return Time ");
                  return;
                }
              }
            if (!this.state.From || this.state.From === "Select") {
              Toast.show("Please select boarding point");
              return;
            } else if (!this.state.To || this.state.To === "Select") {
              Toast.show("Please select destination");
              return;
            }

            this.gotoBookingDetail();
          }}
        >
          <MaterialIcons
            name={"navigate-next"}
            style={{ fontSize: 25, color: colors.WHITE, fontWeight: "700" }}
          />
        </TouchableDebounce>
        {this.renderModalView(this.state.wayPoints)}
        {this.renderDatePicker()}
        {this._renderTime(this.state.isReturn ? this.state.returnTimes : this.state.startTimes)}
      </View>
    );
  }

  _renderDatePicker = () => {
    return (
        <View style={itemViewStyle}>
            <View
                style={{
                    flexDirection: "row"
                }}
            >
                <TouchableDebounce
                    onPress={() => this.toggleDatePicker()}
                    style={{width: "100%"}}
                >
                    {_renderInputDate("Date", 
                    moment(this.state.TripDate).format("DD"),
                    moment(this.state.TripDate).format("MMMM YYYY"),
                    moment(this.state.TripDate).format("dddd"))}
                </TouchableDebounce>
            </View>
        </View>
    );
  };

  _renderStartEndTime = () => {
    return (
        <View style={itemViewStyle}>
            <View
                style={{
                    flexDirection: "row"
                }}
            >
                <TouchableDebounce
                    onPress={() => this.setState({ showTimePop: true })}
                    style={{width: "100%"}}
                >
                    {_renderInputContent("Shuttle Time", this.state.startTime)}
                </TouchableDebounce>
            </View>
        </View>
    );
  };

  _renderPickup() {
      return (
          <View style={itemViewStyle}>
              <View
                  style={{
                      flexDirection: "row"
                  }}
              >
                  <TouchableDebounce
                      onPress={() => this.toggleModalVisible(selectFrom)}
                      style={{width: "100%"}}
                  >
                      {_renderInputContent(
                          selectFrom,
                          this.state.From
                      )}
                  </TouchableDebounce>
              </View>
          </View>
      );
  };

  _renderDrop() {
      return (
          <View style={itemViewStyle}>
              <View
                  style={{
                      flexDirection: "row"
                  }}
              >
                  <TouchableDebounce
                      onPress={() => this.toggleModalVisible(selectTo)}
                      style={{width: "100%"}}
                  >
                      {_renderInputContent(
                          selectTo,
                          this.state.To
                      )}
                  </TouchableDebounce>
              </View>
          </View>
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
          Loading booking detail...
        </Text>
      </View>
    );
  }

  renderTitlePlace(title, placeName) {
    return (
      <View style={{ flex: 1, marginLeft: 10, marginTop: 10 }}>
        <Text style={from}>{title}</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <FontAwesome
            name={"building-o"}
            style={{ fontSize: 18, color: colors.BLACK }}
          />
          <Text style={sourceName}>{placeName}</Text>
        </View>
      </View>
    );
  }

  _renderLine(size) {
    return (
      <View
        style={{
          height: 0.5,
          width: size ? size : "100%",
          backgroundColor: colors.GRAY,
          marginTop: 5
        }}
      />
    );
  }

  _keyExtractor(item, index) {
    return index.toString();
  }

  _renderSeparator() {
    return <View style={separator} />;
  }

  _renderCarouselItem(schedule, index) {
    return (
      <TouchableDebounce
        onPress={() =>{
          // let time =moment(new Date()).format("HH:MM");
          // console.log('sugantime','timevalue-----'+JSON.stringify(time));
          // if(time>schedule.startTime)
          // {
          //   if(this.state.isReturn)
          //      this.setState({ returnTime:"00:00" })
          //   else
          //      this.setState({ startTime:"00:00" })
           
          //      Toast.show("Selected time not valid");
          //   return;
          // }
          if(this.state.isReturn) {
            this.setState({ showTimePop: false, isReturn:false, returnTime: schedule.startTime })
          } else {
            this.setState({ showTimePop: false, startTime: schedule.startTime })
          }
        }
        }
      >
        <Box style={SelectedTimeSquare}>
          <Text style={schedule.startTime == this.state.startTime ? SelectedTimeText : timeText}>{schedule.startTime}</Text>
        </Box>
      </TouchableDebounce>
    );
  }

  _renderEmptyList = () => {
    return (
      //View to show when list is empty
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          margin: 10
        }}
      >
        <Text style={{ textAlign: "center" }}>No data found</Text>
      </View>
    );
  };

  _renderListItem(Item,stoplength) {
    return (
      <View
        style={{
          justifyContent: "center",
          // width: "100%",
          // height: 50,
          paddingLeft: 10,
          paddingRight: 10,
          backgroundColor: colors.WHITE
        }}
      >
        <TouchableDebounce
          onPress={() => {
            if (this.state.selectedOption === selectTo) {
              if (Item.item.routeIndex <= this.state.FromIndex) {
                Toast.show("Please choose next point of " + this.state.From);
                return;
              }
            } 
           // Sugan need to uncomment before apk
            if (this.state.selectedOption === selectFrom) {
              if (Item.item.routeIndex >= stoplength) {
                Toast.show(
                  "You cannot select " +
                  Item.item.wayPointName +
                    " as your boarding point"
                );
                return;
              }
            }
            if (this.state.selectedOption === selectTo) {
              if (Item.item.routeIndex <= 1) {
                Toast.show(
                  "You cannot select " +
                  Item.item.wayPointName +
                    " as your destination point"
                );
                return;
              }
            }
            this.toggleModalVisible();
            this.state.selectedOption === selectFrom
              ? this.setFrom(
                  Item.item.routeIndex,
                  Item.item.wayPointName,
                  Item.item.wayPointID
                )
              : this.setTo(
                  Item.item.routeIndex,
                  Item.item.wayPointName,
                  Item.item.wayPointID
                );
          }}
        >
          <Text style={{color: colors.BLACK, fontSize: 12, padding: 10, fontWeight: (this.state.selectedOption === selectFrom ? (Item.item.wayPointName == this.state.From ? 'bold' : '100') : (Item.item.wayPointName == this.state.To ? 'bold' : '100'))}}>{Item.item.wayPointName}</Text>
        </TouchableDebounce>
      </View>
    );
  }

  _renderTime(shuttleTimes) {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.showTimePop}
        onRequestClose={() => {
          this.setState({ showTimePop: false });
        }}
        backdropColor={colors.BLACK}
        backdropOpacity={1}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.WHITE }}>
          <View style={{ flex: 1, backgroundColor: colors.WHITE }}>
            <View style={{ flexDirection: "row", height: 50, marginTop: 30 }}>
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 20,
                  marginLeft: 10,
                  color: colors.BLUE
                }}
              >
                Select Shuttle Time
              </Text>
              <Ionicons
                name="close"
                style={{
                  fontSize: 40,
                  marginRight: 20,
                  marginTop: 10,
                  color: colors.BLACK,
                  fontFamily: "Helvetica",
                  right: 0,
                  position: "absolute"
                }}
                onPress={() => {
                  setTimeout(() => this.setState({ showTimePop: false }), 0);
                }}
              />
            </View>
            <FlatList
              keyExtractor={this._keyExtractor}
              data={shuttleTimes}
              renderItem={({ item, index }) =>
                this._renderCarouselItem(item, index)
              }
              ListEmptyComponent={this._renderEmptyList}
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  renderModalView(waypoints) {
    if (this.state.selectedOption === selectFrom) {
      waypoints = waypoints.filter(waypoint => waypoint.wayPointName !== this.state.shuttleDetail.endWayPoint);
    } else {
      waypoints = waypoints.filter(waypoint => waypoint.wayPointName !== this.state.shuttleDetail.startWayPoint);
    }
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.showPop}
        onRequestClose={() => {
          this.setState({ showPop: false });
        }}
        backdropColor={colors.BLACK}
        backdropOpacity={1}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.WHITE }}>
          <View style={{ flex: 1, backgroundColor: colors.WHITE }}>
            <View style={{ flexDirection: "row", height: 50, marginTop: 30 }}>
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 20,
                  marginLeft: 10,
                  color: colors.BLUE
                }}
              >
                Select{" "}
                {this.state.selectedOption === selectFrom
                  ? selectFrom
                  : selectTo}
              </Text>
              <Ionicons
                name="close"
                style={{
                  fontSize: 40,
                  marginRight: 20,
                  marginTop: 10,
                  color: colors.BLACK,
                  fontFamily: "Helvetica",
                  right: 0,
                  position: "absolute"
                }}
                onPress={() => {
                  setTimeout(() => this.setState({ showPop: false }), 0);
                }}
              />
            </View>
            <FlatList
              keyExtractor={this._keyExtractor}
              data={waypoints}
              renderItem={(item)=>this._renderListItem(item)}
              ItemSeparatorComponent={this._renderSeparator.bind(this)}
              ListEmptyComponent={this._renderEmptyList}
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  setFrom(routeIndex, wayPointName,wayPointID) {
    this.setState({
      From: wayPointName,
      FromIndex: routeIndex,
      StartWayPointID:wayPointID,
      To: "Select",
      ToIndex: null,
    });
  }

  setTo(routeIndex, wayPointName,wayPointID) {
    this.setState({
      To: wayPointName,
      ToIndex: routeIndex,
      EndWayPointID:wayPointID
    });
  }

  gotoBookingDetail() {

    this.setState({
      isLoading: true
    });
     
    let _schedule = this.state.startTimes.find(schedule => schedule.startTime == this.state.startTime);
    let body= {
      date: this.state.TripDate,
      shuttleId: this.state.shuttleDetail.shuttleID,
      scheduleId: _schedule?.scheduleID,
      returnShuttleId: this.state.isTwoWayTrip ? this.state.returnShuttleDetail?.shuttleID : undefined,
      returnScheduleId: this.state.isTwoWayTrip ? this.state.returnTimes?.find(schedule => schedule.startTime == this.state.returnTime)?.scheduleID : undefined,
      StartWayPointID: this.state.wayPoints.find(wp => wp.wayPointName == this.state.From)?.wayPointID,
      EndWayPointID: this.state.wayPoints.find(wp => wp.wayPointName == this.state.To)?.wayPointID,
    };
    console.log('Shuttle body ','new---------'+ JSON.stringify(body));

    this.props.navigation.navigate("ShuttleRouteDetailsNEW", {
      body: body,
      isTwoWayTrip: this.state.isTwoWayTrip,
      startTime:this.state.startTime,
      returnTime:this.state.returnTime,
    });
  }

  _handleDatePicked = date => {
      try {
          let day = moment(date).format("ddd");
          console.log('Sugans','Run Days===='+JSON.stringify(this.state.shuttleDetail.runDays));
          if (!this.state.shuttleDetail.runDays.includes(day)) {
              Toast.show("This shuttle doesn't run on " + moment(date).format("dddd"));
              return;
          }
          const dateSelected = moment(date).format("YYYY-MM-DD");
          console.warn("dateSelected::" + dateSelected);
          this.setState({
              TripDate: dateSelected,
          });
          setTimeout(() => {
            this.updateData();
          }, 100)
          this.toggleDatePicker();
      }catch (e) {
          console.warn("dateSelected::" +e+" Object "+JSON.stringify(e));
      }
  };

  renderDatePicker() {
    return (
      <DateTimePicker
        isVisible={this.state.isDatePickerVisible}
        onConfirm={this._handleDatePicked}
        onCancel={() => this.setState({ isDatePickerVisible: false })}
        mode={"date"}
        is24Hour={false}
        minimumDate={new Date()}
      />
    );
  }

  configSetup() {
    let shuttleDetail = this.props.route.params.shuttleDetail;
    let routesList = this.props.route.params.routesList;

    console.warn('shuttleDetail', shuttleDetail);
    console.warn('routesList', routesList);

    let returnShuttleDetail = routesList.find(shuttle => shuttle.shuttleID === shuttleDetail.returnShuttleID);
console.warn('returnShuttleDetail', returnShuttleDetail);

    this.setState({
      shuttleDetail,
      routesList,
      TripDate:moment().format("YYYY-MM-DD"),
      // startTime: shuttleDetail.schedule[0].startTime,
      From: shuttleDetail.startWayPoint,
      To: shuttleDetail.endWayPoint,
      returnShuttleEnabled: shuttleDetail.returnShuttleID ? true : false,
      returnShuttleDetail,
      // returnTime: returnShuttleDetail?.schedule[0].startTime,
      isLoading: false
    });

    setTimeout(() => {

      this.updateData();
    }, 100)
  }

}

export default ShuttleBookingNEW;


const itemStyle = {
  marginVertical: 2,
  marginLeft: 10,
  marginRight: 10,
  justifyContent: "center",
  height: 70,
  shadowColor: "#000",
  shadowOffset: {
      width: 0,
      height: 1
  },
  shadowOpacity: 0.2,
  shadowRadius: 1.41,
  elevation: 2
};

const itemViewStyle = {
  flex: 1,
  paddingLeft: 10,
  paddingRight: 10,
  paddingTop: 10,
  paddingBottom: 10,
  flexDirection: "row",
  backgroundColor: colors.WHITE,
  justifyContent: "center",
  alignItems: "center"
};

const rectangle14 = {
  flex: 1,
  // height: 620,
  width: "100%",
  backgroundColor: colors.WHITE,
  shadowColor: "rgba(0, 0, 0, 0.5)",
  shadowOffset: {
    width: 1,
    height: 1
  },
  shadowRadius: 2,
  shadowOpacity: 1,
  flexDirection: "column",
  borderRadius: 5,
  // overflow: "hidden"
};
const from = {
  fontFamily: "Helvetica",
  fontSize: 14,
  fontStyle: "normal",
  letterSpacing: 0,
  color: colors.GRAY
};
const sourceName = {
  fontFamily: "Helvetica",
  fontSize: 18,
  fontWeight: "bold",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#4a4a4a",
  marginLeft: 10,
  // width: '85%'
};
const viewSelectedStyle = {
  borderRadius: 30,
  width: 60,
  padding: 5,
  backgroundColor: colors.BLUE_BRIGHT,
  margin: 5,
  justifyContent: "center",
  alignItems: "center"
};
const oval = {
  elevation: 2,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 20,
  borderRadius: 30,
  width: 60,
  height: 60,
  backgroundColor: colors.BLUE_BRIGHT,
  shadowColor: "rgba(0, 0, 0, 0.5)",
  shadowOffset: {
    width: 0,
    height: 2
  },
  shadowRadius: 4,
  shadowOpacity: 1
};
const viewNotSelectedRosterTypeStyle = {
  borderRadius: 30,
  width: 60,
  padding: 5,
  // backgroundColor: colors.BLUE_BRIGHT,
  margin: 5,
  justifyContent: "center",
  alignItems: "center"

};
const separator = {
  height: 0.5,
  width: "100%",
  alignSelf: "center",
  backgroundColor: "#555"
};
const startTimeRectangle = {
  width: "100%",
  height: 80,
  borderRadius: 5,
  backgroundColor: colors.WHITE
};
const setShuttleStartTime = {
  marginTop: 10,
  marginLeft: 10,
  fontFamily: "Helvetica",
  fontSize: 10,
  fontWeight: "bold",
  fontStyle: "normal",
  letterSpacing: 0,
  color: colors.GRAY
};
const SelectedTimeSquare = {
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 5,
  backgroundColor: colors.WHITE,
  padding: 10
};
const SelectedTimeText = {
  height: 20,
  fontFamily: "Helvetica",
  fontSize: 14,
  fontWeight: "bold",
  fontStyle: "normal",
  letterSpacing: 0,
  color: colors.BLACK
};
const timeText = {
  height: 20,
  fontFamily: "Helvetica",
  fontSize: 14,
  fontStyle: "normal",
  letterSpacing: 0,
  color: colors.BLACK
};

const findIDFromWayPointName = (array, wayPointName) => {
  if (!array || !wayPointName) return false;
  else {
    let index = array.map((item, index) => {
      if (item.wayPointName === wayPointName) {
        return item.wayPointID;
      }
    });
    let set = [...new Set(index)];

    for (let i = 0; i < set.length; i++) {
      if (set[i]) return set[i];
    }
  }
  return false;
};
