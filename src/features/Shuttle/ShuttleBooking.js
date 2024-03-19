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
  View
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { colors } from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import moment from "moment";
import { _renderDate } from "../../screens/roster/customeComponent/customComponent";
import { URL } from "../../network/apiConstants";
import { API } from "../../network/apiFetch/API";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import DateTimePicker from "react-native-modal-datetime-picker";
import { Box, Row } from "native-base";
import * as Toast from "../../utils/Toast";
import bus_loading from "../../assets/bus_loading.gif";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import { TYPE } from "../../model/ActionType";

const selectFrom = "Boarding Point";
const selectTo = "Destination";
const width = Dimensions.get("screen").width;

class ShuttleBooking extends Component {
  state = {
    currentSliderIndex: 0,
    isLoading: false,
    showPop: false,
    showTimePop: false,
    selectedOption: "",
    From: "Select",
    FromIndex: 0,
    FromWayPointLeaveTime: null,
    To: "Select",
    ToIndex: 0,
    ToWayPointLeaveTime: null,
    ScheduleID: "",
    routeName: "",
    isDatePickerVisible: false,
    TripDate: "" /*moment().format("YYYY-MM-DD")*/,
    schedule: [],
    stops: [],
    nextAvailableIndex: 0
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

  toggleModalVisible(type) {
    if (!this.state.showPop)
      this.setState({ showPop: true, selectedOption: type });
    else this.setState({ showPop: false });
  }

  UNSAFE_componentWillMount() {
    this.subs = [
      this.props.navigation.addListener("focus", () => this.configSetup())
    ];
  }

  shouldComponentUpdate(nextProps, nextState) {
    //Handle when Date is changed
    if (this.state.TripDate !== nextState.TripDate) {
      //console.warn("Date changed..." + moment(nextState.TripDate).weekday());
      //global.shuttleResponse==
      this.configSetup(nextState.TripDate, nextState.currentSliderIndex);
    }
    //Change default value if Shuttle time changes
    if (this.state.currentSliderIndex !== nextState.currentSliderIndex) {
      console.warn("currentSliderIndex--scompu--->" + nextState.currentSliderIndex);
      // let schedule = nextState.schedule;
      let schedule = this.getFilteredSchedule(nextState.schedule);

      let maxIndex = schedule[nextState.currentSliderIndex].stop.length - 1;
      if (maxIndex >= 0) {
        this.setState({
          From: schedule[nextState.currentSliderIndex].stop[0].wayPointName,

          FromIndex: schedule[nextState.currentSliderIndex].stop[0].routeIndex,
          FromWayPointLeaveTime:
            schedule[nextState.currentSliderIndex].stop[0].wayPointLeaveTime,
          To:
            schedule[nextState.currentSliderIndex].stop[maxIndex].wayPointName,
          ToIndex:
            schedule[nextState.currentSliderIndex].stop[maxIndex].routeIndex,
          ToWayPointLeaveTime:
            schedule[nextState.currentSliderIndex].stop[maxIndex]
              .wayPointLeaveTime,
          stops: schedule[nextState.currentSliderIndex].stop,
          ScheduleID: schedule[nextState.currentSliderIndex].scheduleID
        });
      }
    }
    return true;
  }

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

  render() {
    if (this.state.isLoading || !this.state.TripDate)
      return this.showLoaderScreen();

    let filteredSchedule = this.state.schedule && this.getFilteredSchedule();
    return (
      <View style={{ flex: 1, alignItems: "center", padding: 10 }}>
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
            {this._renderRightArrow()}
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
              {filteredSchedule && filteredSchedule.length > 0 ? (
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
                        filteredSchedule[this.state.currentSliderIndex]
                          .startTime
                      }
                    </Text>
                    {this._renderRightArrow()}
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
          {this._renderLine("100%")}
          <TouchableDebounce
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center"
            }}
            onPress={() => this.toggleModalVisible(selectFrom)}
          >
            <View
              style={{ flex: 1 }}
              onPress={() => this.toggleModalVisible(selectFrom)}
            >
              {this.renderTitlePlace(selectFrom, this.state.From)}
            </View>
            {this._renderRightArrow()}
          </TouchableDebounce>

          {this._renderLine()}
          <TouchableDebounce
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center"
            }}
            onPress={() => this.toggleModalVisible(selectTo)}
          >
            <View style={{ flex: 1 }}>
              {this.renderTitlePlace(selectTo, this.state.To)}
            </View>
            {this._renderRightArrow()}
          </TouchableDebounce>
        </View>

        <TouchableDebounce
          style={oval}
          onPress={() => {
            let filteredSchedule = this.getFilteredSchedule();
            if (filteredSchedule.length === 0) {
              Toast.show(
                "No Shuttle timings are available at this moment. Please try later"
              );
              return;
            }
            if (!this.state.From || this.state.From === "Select") {
              Toast.show("Please select Source");
              return;
            } else if (!this.state.To || this.state.To === "Select") {
              Toast.show("Please select Destination");
              return;
            }

            let currTimeDate = moment().format("YYYY-MM-DD HH:mm");

            let stops = filteredSchedule[this.state.currentSliderIndex].stop;
            let calculatedTripDateTimeString =
              this.state.TripDate + " " + stops[0].wayPointLeaveTime;
            let tripStartDateTime = moment(calculatedTripDateTimeString);
            let calculatedWayPointLeaveTime =
              stops[stops.length - 1].wayPointLeaveTime;
            let tripEndDateTime = moment(
              this.state.TripDate + " " + calculatedWayPointLeaveTime
            ).format("YYYY-MM-DD HH:mm");

            if (
              moment(currTimeDate).isBetween(tripStartDateTime, tripEndDateTime)
            ) {
              this.showAlertWithConfirmation();
            } else {
              this.generateTicketShuttle();
            }
          }}
        >
          <MaterialIcons
            name={"navigate-next"}
            style={{ fontSize: 25, color: colors.WHITE, fontWeight: "700" }}
          />
        </TouchableDebounce>
        {this.renderModalView(filteredSchedule)}
        {this.renderDatePicker()}
        {this._renderTime(filteredSchedule)}
      </View>
    );
  }

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
          Generating Ticket...
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
            marginLeft: 10
          }}
        >
          <FontAwesome
            name={"building-o"}
            style={{ fontSize: 25, color: colors.BLACK }}
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

  _onRefresh() {
    this.setState({
      refreshing: true
    });
  }

  _renderCarouselItem(schedule, index) {
     console.warn("data-->", index, '--->', JSON.stringify(schedule));
    return (
      <TouchableDebounce
        onPress={() =>
          this.setState({ currentSliderIndex: index, showTimePop: false })
        }
      >
        <Box style={SelectedTimeSquare}>
          <Text style={SelectedTimeText}>{schedule.startTime}</Text>
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
        <Text style={{ textAlign: "center" }}>No Address found</Text>
      </View>
    );
  };

  _renderListItem(Item) {
    return (
      <View
        style={{
          justifyContent: "center",
          width: "100%",
          height: 50,
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
            if (this.state.selectedOption === selectFrom) {
              if (Item.item.routeIndex >= this.state.stops.length) {
                Toast.show(
                  "You cannot select " +
                    this.state.From +
                    " as your starting point"
                );
                return;
              }
            }
            this.toggleModalVisible();
            this.state.selectedOption === selectFrom
              ? this.setFrom(
                  Item.item.wayPointName,
                  Item.item.routeIndex,
                  Item.item.wayPointLeaveTime
                )
              : this.setTo(
                  Item.item.wayPointName,
                  Item.item.routeIndex,
                  Item.item.wayPointLeaveTime
                );
          }}
        >
          <Text style={{color: colors.BLACK}}>{Item.item.wayPointName}</Text>
          <Text style={{ fontSize: 10, color: colors.GREEN }}>
            {"Leaves at " + Item.item.wayPointLeaveTime}
          </Text>
        </TouchableDebounce>
      </View>
    );
  }

  _renderTime(filteredSchedule) {
    if (!JSON.stringify(filteredSchedule[this.state.currentSliderIndex]))
      return;
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
                Select Shuttle Start Time
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
              data={filteredSchedule}
              renderItem={this._renderCarouselItem.bind(this)}
              renderItem={({ item, index }) =>
                this._renderCarouselItem(item, index)
              }
              // ItemSeparatorComponent={this._renderSeparator.bind(this)}
              ListEmptyComponent={this._renderEmptyList}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.isLoading}
                  onRefresh={this._onRefresh.bind(this)}
                />
              }
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  renderModalView(filteredSchedule) {
    if (!JSON.stringify(filteredSchedule[this.state.currentSliderIndex]))
      return;

    let schedule = filteredSchedule[this.state.currentSliderIndex];
    let filteredPlacesAfterFromIndex =
      schedule.stop &&
      schedule.stop.filter(stop => {
        return stop.routeIndex >= this.state.FromIndex + 1;
      });
    let removedLastStops =
      schedule.stop &&
      schedule.stop.length > 1 &&
      schedule.stop.slice(0, schedule.stop.length - 1);
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
              data={
                this.state.selectedOption === selectFrom
                  ? removedLastStops
                  : filteredPlacesAfterFromIndex
              }
              renderItem={this._renderListItem.bind(this)}
              ItemSeparatorComponent={this._renderSeparator.bind(this)}
              ListEmptyComponent={this._renderEmptyList}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.isLoading}
                  onRefresh={this._onRefresh.bind(this)}
                />
              }
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  setFrom(place, index, wayPointLeaveTime) {
    this.setState({
      From: place,
      FromIndex: index,
      FromWayPointLeaveTime: wayPointLeaveTime,
      To: "Select",
      ToIndex: null,
      ToWayPointLeaveTime: null
    });
  }

  setTo(place, index, wayPointLeaveTime) {
    this.setState({
      To: place,
      ToIndex: index,
      ToWayPointLeaveTime: wayPointLeaveTime
    });
  }

  generateTicketShuttle() {
    let filteredStops = this.getFilteredSchedule()[
      this.state.currentSliderIndex
    ].stop;
    let stops = filteredStops; //this.state.stops
    console.warn("filteredStops-->" + JSON.stringify(filteredStops));
    this.setState({
      isLoading: true
    });
    let body = {
      TripDate: this.state.TripDate + "T" + this.state.FromWayPointLeaveTime,
      ScheduleID: this.state.ScheduleID,
      StartWayPointID: findIDFromWayPointName(stops, this.state.From),
      EndWayPointID: findIDFromWayPointName(stops, this.state.To),
      CAPI: global.CustomerUrl
    };
    let ticketInformation = {
      From: this.state.From,
      To: this.state.To,
      routeName: this.state.routeName,
      TripDate: this.state.TripDate,
      time: this.state.FromWayPointLeaveTime
      //this.getFilteredSchedule()[this.state.currentSliderIndex].startTime
    };
    console.warn('Shuttle body ', body);
    API.newFetchJSON(
      URL.shuttleGenerateTicket,
      body,
      true,
      this.callback.bind(this),
      TYPE.SHUTTLE_GENERATE_TICKET,
      { ticketInformation }
    );
    //handleResponse.generateTicketShuttle(response, this, ticketInformation);
  }

  _handleDatePicked = date => {
      try {
          let day = moment(date).format("ddd");
          if (!this.state.runDays.includes(day)) {
              Toast.show("This shuttle doesn't run on " + moment(date).format("dddd"));
              return;
          }
          const dateSelected = moment(date).format("YYYY-MM-DD");
          console.warn("dateSelected::" + dateSelected);
          this.setState({
              TripDate: dateSelected,
              From: "Select",
              FromIndex: 0,
              FromWayPointLeaveTime: null,
              To: "Select",
              ToIndex: 0,
              ToWayPointLeaveTime: null,
          });
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

  getFilteredSchedule(schedule, TripDate) {
    let filteredSchedule = [];
    schedule = schedule ? schedule : this.state.schedule;
    TripDate = TripDate ? TripDate : this.state.TripDate;
    if (
      schedule.length > 0 &&
      moment(TripDate ? TripDate : this.state.TripDate).isBefore(moment())
    ) {
      filteredSchedule = schedule.filter(schedule => {
        let calculatedWayPointLeaveTime =
          schedule.stop[schedule.stop.length - 1].wayPointLeaveTime;

        let tripEndDateTime = moment(
          TripDate + " " + calculatedWayPointLeaveTime
        ).format("YYYY-MM-DD HH:mm");
        let currentDateTime = moment().format("YYYY-MM-DD HH:mm");
        return moment(currentDateTime).isBefore(tripEndDateTime);
      });
    } else {
      filteredSchedule = schedule;
    }
    return filteredSchedule;
  }

  configSetup(paramTripDate, index) {
    console.warn('configSetup -> calling index - ', index);
    let currentSliderIndex = index ? index : 0;
    let runDays = this.props.route.params.runDays; //", "NA");
    let routeName = this.props.route.params.routeName; //", "NA");
    let nextAvailableIndex = this.props.route.params.nextAvailableIndex;
    //Dynamic Scheduling...
    let shuttleResponse = this.props.route.params.shuttleResponse; // ", {});
    let dynamicSchedule = [];
    if (paramTripDate && moment(paramTripDate).weekday()) {
      dynamicSchedule =
        shuttleResponse.schedule.length > 0 &&
        shuttleResponse.schedule.filter(schedule => {
          return moment(paramTripDate).weekday() === schedule.dayOfWeek;
        });
    }
    //Assign Schedule...
    let schedule = paramTripDate
      ? dynamicSchedule
      : this.props.route.params.schedule; // ", []);
    //Assign Date...
    let TripDate = paramTripDate
      ? paramTripDate
      : moment()
          .add(nextAvailableIndex, "d")
          .format("YYYY-MM-DD");

    let filteredSchedule = this.getFilteredSchedule(schedule);
    this.setState({ runDays, TripDate, routeName, schedule: filteredSchedule });
    if (filteredSchedule && filteredSchedule.length === 0) {
      console.warn("Empty Schedule Found");
      return;
    }
    let maxIndex =
      filteredSchedule[currentSliderIndex].stop &&
      filteredSchedule[currentSliderIndex].stop.length - 1;

    if (maxIndex >= 0) {
      console.warn('dflt schedule - ', filteredSchedule);
      console.warn('dflt schedule -indx data ::  ', filteredSchedule[currentSliderIndex]);
      let customisedSchedules = this.getFilteredSchedule(
        filteredSchedule,
        TripDate
      );

      let customisedSchedule = customisedSchedules[currentSliderIndex];
      console.warn('dflt customisedSchedule - ', customisedSchedules);
      console.warn('dflt customisedSchedule -indx data ::  ', customisedSchedule);

      if (!customisedSchedule) return;
      let customisedStop = customisedSchedule.stop;
      //Setup Config...
      this.setState({
        From: customisedStop[currentSliderIndex].wayPointName,
        FromIndex: customisedStop[currentSliderIndex].routeIndex,
        FromWayPointLeaveTime:
          customisedStop[currentSliderIndex].wayPointLeaveTime,
        To: customisedStop[maxIndex].wayPointName,
        ToIndex: customisedStop[maxIndex].routeIndex,
        ToWayPointLeaveTime: customisedStop[maxIndex].wayPointLeaveTime,
        stops: customisedStop,
        currentSliderIndex,
        schedule: customisedSchedules, //filteredSchedule,
        runDays,
        ScheduleID: customisedSchedule.scheduleID, // filteredSchedule[currentSliderIndex].scheduleID,
        routeName,
        nextAvailableIndex,
        TripDate
      });
    }
  }

  showAlertWithConfirmation() {
    Alert.alert(
      "Warning!",
      "Shuttle might already have departed. Are you sure you want to generate e-Ticket?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel"
        },
        {
          text: "Continue",
          onPress: () => {
            this.generateTicketShuttle();
          }
        }
      ],
      { cancelable: false }
    );
  }
}

export default ShuttleBooking;

const rectangle14 = {
  height: 320,
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
  overflow: "hidden"
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
  marginLeft: 10
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
  width: 39.2,
  height: 17,
  fontFamily: "Helvetica",
  fontSize: 14,
  fontWeight: "bold",
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
