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

class ShuttleQRCheckIn extends Component {
  state = {
    currentSliderIndex: 0,
    currentSliderIndexR: 0,
    isLoading: false,
    showPop: false,
    showTimePop: false,
    isReturn: false,
    selectedOption: "",
    From: "Select",
    FromIndex: 0,
    To: "Select",
    ToIndex: 0,
    ScheduleID: "",
    routeName: "",
    schedule: [],
    nextAvailableIndex: 0,
    data: [], //shuttleResponse.data,
    datas: [],
    TripID: '',
    ShuttleID: '',
    ScheduleID: '',
    BoardingPointID: '',
    BoardingPointLat: '',
    BoardingPointLng: '',
    DeBoardingPointID: '',
    DeBoardingPointLat: '',
    DeBoardingPointLng: '',
    Lat:'',
    Lng:''
  };
  
  callback = async (actionType, response) => {
    switch (actionType) {
        case TYPE.QR_WITHOUTPASS_CHECKIN_LAST: {
            console.warn(response);
            console.log('Sugan QR',"response-----"+JSON.stringify(response));
            handleResponse.QRWithoutPassCheckinLast(this, response);
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

  toggleModalVisible(type) {
    console.log('Sugansug','Selected type--------'+JSON.stringify(type));
    if (!this.state.showPop)
      this.setState({ showPop: true, selectedOption: type });
    else this.setState({ showPop: false });
  }

  UNSAFE_componentWillMount(){
    this.subs = [
      this.props.navigation.addListener("focus", () => this.getShuttleDetails())
    ];
  }

  shouldComponentUpdate(nextProps, nextState) {
    
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
   if (this.state.isLoading)
   {
  //   return this.showLoaderScreen();
   }
    let filteredSchedule = this.props.route.params.data;
    console.log('Sugansug','Datass========'+JSON.stringify(filteredSchedule));
    return (
      <View style={{ flex: 1, alignItems: "center", padding: 10 }}>
        <View style={[rectangle14,{height:200,marginTop:50}]}>
          
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
            <View style={{ flex: 1 }}
            onPress={() => this.toggleModalVisible(selectTo)}>
              {this.renderTitlePlace(selectTo, this.state.To)}
            </View>
            {this._renderRightArrow()}
          </TouchableDebounce>
        </View>

        <TouchableDebounce
          style={oval}
          onPress={() => {

            if (!this.state.From || this.state.From === "Select") {
              Toast.show("Please select Source");
              return;
            } else if (!this.state.To || this.state.To === "Select") {
              Toast.show("Please select Destination");
              return;
            }
              this.generateTicketShuttle(filteredSchedule);
        
          }}
        >
          <MaterialIcons
            name={"navigate-next"}
            style={{ fontSize: 25, color: colors.WHITE, fontWeight: "700" }}
          />
        </TouchableDebounce>
        {this.renderModalView(filteredSchedule)}
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
        onPress={() =>{
          if(this.state.isReturn)
          this.setState({ currentSliderIndexR: index, showTimePop: false, isReturn:false })
          else
          this.setState({ currentSliderIndex: index, showTimePop: false })
        }
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
    console.log('Sugansug','RenderItem-------'+JSON.stringify(Item));
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
              console.log('Sugansug','RenderItem---selectedOption----'+JSON.stringify(this.state.selectedOption));
              console.log('Sugansug','RenderItem---selectTo----'+JSON.stringify(selectTo));

              // if (Item.item.routeIndex <= this.state.FromIndex) {
              //   Toast.show("Please choose next point of " + this.state.From);
              //   return;
              // }
            } 
            this.state.selectedOption === selectFrom
              ? this.setFrom(
                  Item.item.wayPointName,
                  Item.item.tripID,
                  Item.item.shuttleID,
                  Item.item.scheduleID,
                  Item.item.wayPointID,
                  Item.item.latitude,
                  Item.item.longitude
                )
              : this.setTo(
                  Item.item.wayPointName,
                  Item.item.wayPointID,
                  Item.item.latitude,
                  Item.item.longitude
                );
                this.toggleModalVisible(this.state.selectedOption);

                console.log('Sugansug','RenderItem---selectTo----'+JSON.stringify(selectTo));

          }}
        >
          <Text style={{color: colors.BLACK}}>{Item.item.wayPointName}</Text>
          {/* <Text style={{ fontSize: 10, color: colors.GREEN }}>
            {"Leaves at " + Item.item.wayPointLeaveTime}
          </Text> */}
        </TouchableDebounce>
      </View>
    );
  }


  renderModalView(filteredSchedule) {
    if (!JSON.stringify(filteredSchedule[this.state.currentSliderIndex]))
      return;

    let schedule = filteredSchedule[this.state.currentSliderIndex];
    console.log('Sugansug','schedule--------'+JSON.stringify(schedule));

    let filteredPlacesAfterFromIndex =
    filteredSchedule &&
    filteredSchedule.length > 1 &&
    filteredSchedule.slice(1,filteredSchedule.length)
    // filteredSchedule.filter(filteredSchedule => {
    //     return filteredSchedule.length >= this.state.FromIndex + 1;
    //   });
    let removedLastStops =
    filteredSchedule &&
    filteredSchedule.length > 1 &&
    filteredSchedule.slice(0, filteredSchedule.length - 1);
    
  console.log('Sugansug','filteredPlacesAfterFromIndex--------'+JSON.stringify(filteredPlacesAfterFromIndex));
  console.log('Sugansug','removedLastStops--------'+JSON.stringify(removedLastStops));

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
              // refreshControl={
              //   <RefreshControl
              //     refreshing={this.state.isLoading}
              //     onRefresh={this._onRefresh.bind(this)}
              //   />
              // }
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  setFrom(wayPointName,tripID,shuttleID, scheduleID,boardingPoingID,boardingPointLat,boardingPointLng) {
    this.setState({
      From: wayPointName,
      TripID: tripID,
      ShuttleID: shuttleID,
      ScheduleID: scheduleID,
      BoardingPointID: boardingPoingID,
      BoardingPointLat: boardingPointLat,
      BoardingPointLng: boardingPointLng
    });
  }

  setTo(wayPointName,deBoardingPointID, deBoardingPointLat, deBoardingPointLng) {
    this.setState({
      To: wayPointName,
      DeBoardingPointID: deBoardingPointID,
      DeBoardingPointLat: deBoardingPointLat,
      DeBoardingPointLng: deBoardingPointLng
    });
  }

  generateTicketShuttle(filteredSchedule) {

    this.setState({
      isLoading: true
    });
    let body = {
       TripID:this.state.TripID,
       Lat:this.state.Lat,
       Lng:this.state.Lng,
       ShuttleID:this.state.ShuttleID,
       ScheduleID:this.state.ScheduleID,
       BoardingPointID:this.state.BoardingPointID,
       BoardingPointLat:this.state.BoardingPointLat,
       BoardingPointLng:this.state.BoardingPointLng,
       DeBoardingPointID:this.state.DeBoardingPointID,
       DeBoardingPointLat:this.state.DeBoardingPointLat,
       DeBoardingPointLng:this.state.DeBoardingPointLng
    };
  
    console.warn('Shuttle body ', body);
    API.newFetchJSON(
      URL.SHUTTLE_CHECKIN,
      body,
      true,
      this.callback.bind(this),
      TYPE.QR_WITHOUTPASS_CHECKIN_LAST,
      null
  );
            
  }
  getShuttleDetails=async()=>{
    this.setState({ isLoading: true });
     let responseValue = this.props.route.params.data;
     let Lat = this.props.route.params.Lat;
     let Lng = this.props.route.params.Lng;

     await this.setState({datas:responseValue,Lat:Lat,Lng:Lng});
     console.log('Suganshuts','data========'+JSON.stringify(this.state.datas));
        this.configSetup();
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
    if(this.state.datas[0]!=undefined)
    {
    console.log('Suganshuts','----datas--------'+JSON.stringify(this.state.datas));

    let currentSliderIndex = index ? index : 0;
  //  let runDays = this.state.data.runDays; //", "NA");
  //  let routeName = this.state.data.routeName; //", "NA");
   let nextAvailableIndex = this.props.route.params.nextAvailableIndex;

    let shuttleResponse = this.state.datas; // ", {});
 
   // let filteredSchedule = this.getFilteredSchedule(schedule);
    let maxIndex = shuttleResponse.length - 1;
      console.log('Suganshuts..2...','maxIndex====='+JSON.stringify(maxIndex));

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
      this.setState({ isLoading: false });

    }
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

export default ShuttleQRCheckIn;

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
