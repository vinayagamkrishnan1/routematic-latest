import React, { Component } from "react";
import { Button, Box } from "native-base";
import { Text, View, Image, Dimensions, ScrollView ,  FlatList,  StatusBar,SafeAreaView,RefreshControl

} from "react-native";
import bus_loading from "../../assets/bus_loading.gif";

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

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;
import Ionicons from "react-native-vector-icons/Ionicons";

import Carousel from 'react-native-anchor-carousel';

import { extendMoment } from "moment-range";
import styles from "react-native-modal-filter-picker/src/styles";
const currentDay = moment().format("ddd");

const momentRange = extendMoment(moment);

class ShuttleRouteDetailsNEW extends Component {
  state = {
    currentSliderIndex: 0,
    shuttleResponse: {},
    schedule: [],
    nextAvailableIndex: null,
    CustomerUrl: "https://apiclient1.routematic.com",
    data: undefined, //shuttleResponse.data,
    isLoading: true,
    isTwoWayTrip: false,
    startTime:0,
    returnTime:0,
    FromIndex:0,
    ToIndex:0
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

  static defaultnavigationoptions = ({ navigation }) => {
    return {
      headerShown: true,
      title: "Shuttle Detail",
      headerTitleStyle: { fontFamily: "Roboto" },
      headerLeft: (
        <Button
          full
          transparent
          iconLeft
          light
          style={{ padding: 10 }}
          onPress={() => {
              // const isFromHome = this.props.route.params.isFromHome ? this.props.route.params.isFromHome : false;
              // const isFromTrips = this.props.route.params.isFromTrips ? this.props.route.params.isFromTrips : false;
              // if (isFromHome && this.props.route.params.showPreviousTripPopup) {
              //     this.props.route.params.showPreviousTripPopup();
              //     navigation.navigate("Home");
              // } else if (isFromTrips === true) {
              //     navigation.goBack();
              // } else navigation.navigate("Feedback");
          }}
        >
          <Ionicons
            name={"md-arrow-back"}
            style={{
              fontSize: 30,
              color: colors.BLACK
            }}
          />
        </Button>
      )
    };
  };
  // static defaultNavigationOptions = ({ navigation }) => {
  //   return {
  //     headerTitle: "Shuttle Details",
  //     headerLeft: (
  //       <View>
  //         <Text>Logo</Text>
  //       </View>
  //     ),
  //     headerRight: (
  //       <View>
  //         <Text>Logo</Text>
  //       </View>
  //     ),
  //     // headerRight: (
  //     //   <View>
  //       /* <TouchableOpacity
  //         title="Ok" 
  //             //onPress={ this.changeScreen.bind(this) }>
  //         onPress={() => navigation.navigate('MyProfil')}>
            
  //         <View style={styles.circle}>
  //           <Text style={styles.txtInside}>{this.state.user.name}</Text> 
  //         </View>
  //       </TouchableOpacity> */
  //     // </View>
  //     // )
  //     //headerStyle: { display: "none" }
  //   };
  // };

  constructor(props) {
    super(props);
    this._renderItem = this._renderItem.bind(this);
  }

  UNSAFE_componentWillMount() {
    this.getShuttleDetails();
      this.setState({
        //  shuttleResponse: shuttleResponse,
         // schedule: shuttles,
         // nextAvailableIndex: diff,
         // data:shuttleResponse,
          isTwoWayTrip:this.props.route.params.isTwoWayTrip,
          startTime:this.props.route.params.startTime,
          returnTime:this.props.route.params.returnTime,
          FromIndex:this.props.route.params.FromIndex,
          ToIndex:this.props.route.params.ToIndex
        });
  //   let shuttleResponse = this.props.route.params.shuttleResponse ? this.props.route.params.shuttleResponse : [];
  // //  console.log('Sugan','shuttleResponse====='+JSON.stringify(shuttleResponse));
  // //  console.log('Sugans','shuttleResponse==item======'+JSON.stringify(shuttleResponse.item));
  //  this.setState({FromIndex:this.props.route.params.FromIndex,ToIndex:this.props.route.params.ToIndex});
  //   const range = moment.range(
  //     moment().format("YYYY-MM-DD"),
  //     moment()
  //       .add("7", "d")
  //       .format("YYYY-MM-DD")
  //   );
  //   for (let eachDay of range.by("d")) {
  //     let weekDayAvailable = eachDay.weekday();

  //     let shuttles =
  //       shuttleResponse.schedule.length > 0 &&
  //       shuttleResponse.schedule.filter(schedule => {
  //         return weekDayAvailable === schedule.dayOfWeek;
  //       });
  //       console.log('Suganssi','----shuttleResponse========='+JSON.stringify(shuttleResponse));
  //       console.log('Suganssi','----shuttles========='+JSON.stringify(shuttles));

  //     if (shuttles.length > 0) {
  //       let diff = 0;
  //       if (moment().weekday() < eachDay.weekday()) {
  //         diff = Math.abs(moment().weekday() - eachDay.weekday());
  //       }

  //       if (moment().weekday() > eachDay.weekday()) {
  //         diff = Math.abs(moment().weekday() - (eachDay.weekday() + 7));
  //       }

  //       console.warn("schedules-->" + JSON.stringify( shuttles));
  //       this.setState({
  //         shuttleResponse: shuttleResponse,
  //         schedule: shuttles,
  //         nextAvailableIndex: diff,
  //         data:shuttleResponse,
  //         isTwoWayTrip:this.props.route.params.isTwoWayTrip,
  //         startTime:this.props.route.params.startTime,
  //         returnTime:this.props.route.params.returnTime,
  //       });
  //       this.setSt ate({ isLoading: false });

  //       break;
  //     }
  //   }
  }
  generateTicketShuttle() {
    this.setState({
      isLoading: true
    });
    let body = {
      ShiftTime:this.props.route.params.ShiftTime,
      ScheduleID:this.props.route.params.ScheduleID,
      StartWayPointID:this.props.route.params.StartWayPointID,
      EndWayPointID:this.props.route.params.EndWayPointID,
      ReturnShiftTime:this.props.route.params.TripDate+" "+this.props.route.params.returnTime,
      ReturnScheduleID:this.props.route.params.returnScheduleId
    };

let bodynew = {
    ShiftTime:"2023-08-11 18:00",
    ScheduleID:3274,
    StartWayPointID:50,
    EndWayPointID:52,
    ReturnShiftTime:"2023-08-11 23:00",
    ReturnScheduleID:3297
}
    console.warn('Shuttle body ', bodynew);
    API.newFetchJSON(
      URL.shuttleGenerateTicketV2,
      body,
      true,
      this.callback.bind(this),
      TYPE.SHUTTLE_GENERATE_TICKET,
      null
    );
         //    this.props.navigation.navigate("Home");
  }
  getShuttleDetails() {
    this.setState({ isLoading: true });

    // let shuttleResponse = this.props.route.params.shuttleResponse ? this.props.route.params.shuttleResponse : [];
    // this.setState({data:shuttleResponse});
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
  
    _renderItems = ({item})=>{
     // console.warn('suuu'+JSON.stringify(item));
      console.log('Sugansn','render== item ooooooooom======'+JSON.stringify(item));

      return (
          <View
      style={{
        backgroundColor:item.time===this.state.startTime?"#ffc001":colors.WHITE,
        width: width/4.7,
        height: height/13,
        alignItems: 'center',
        //justifyContent: 'center',
        borderWidth:1,
        borderColor:colors.BLACK
      }}>
      <Text style={{ fontSize: 15, fontWeight: 'bold',marginTop:10 }}>{item.time}</Text>
      <Text style={{ fontSize: 15, fontWeight: 'bold' }}>({item.availableSeats})</Text>

    </View>
      )
    };
    _renderItemsReturn = ({item})=>{
      // console.warn('suuu'+JSON.stringify(item));
       console.log('Sugansn','render== item ooooooooo======'+JSON.stringify(item));
 
       return (
           <View
       style={{
         backgroundColor:item.time===this.state.returnTime?"#ffc001":colors.WHITE,
         width: width/4.7,
         height: height/13,
         alignItems: 'center',
         //justifyContent: 'center',
         borderWidth:1,
         borderColor:colors.BLACK
       }}>
       <Text style={{ fontSize: 15, fontWeight: 'bold',marginTop:10 }}>{item.time}</Text>
       <Text style={{ fontSize: 15, fontWeight: 'bold' }}>({item.availableSeats})</Text>
 
     </View>
       )
     };
    _renderItem = ({item, index}) => {
        return (
            <Box style={SelectedTimeSquare}>
                <TouchableDebounce
                    onPress={() => {
                        this._slider1Ref.scrollToIndex(index);
                        this.setState({currentSliderIndex: index,});
                    }}>
                    <Text style={SelectedTimeText}>{item.startTime}</Text>
                </TouchableDebounce>
            </Box>
        );
    };
  
  render() {
    if (this.state.isLoading|| !this.state.data) return this.showLoaderScreen();
    
    return (
      <View style={{ backgroundColor: colors.WHITE }}>
        <ScrollView style={{flexDirection: "column", height: "100%"}}>
        {/* <ScrollView
            style={{ flexDirection: "column", height: "100%" }}
            ref={c => {
              this.scrollView = c;
            }}
          > */}
         
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
              //  flex: 1
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
                  {this.state.data!=undefined?this.state.data[0].routeName:''}
                </Text>
                <View style={{ flexDirection: "row", marginTop: 5 ,flexWrap: 'wrap',alignSelf:'baseline',flexShrink: 1}}>
                  <Text style={source}>
                   {this.state.data!=undefined?this.state.data[0].startWayPoint:''}
                  </Text>
                  <FontAwesome
                    name="long-arrow-right"
                    style={[
                      source,
                      { marginLeft: 10, marginRight: 10, marginTop: 2 }
                    ]}
                  />
                  <Text style={source}>
                  {this.state.data!=undefined?this.state.data[0].endWayPoint:''}
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
                  {this.state.data!=undefined?this.state.data[0].runDays &&
                    this.state.data[0].runDays
                      .split(",")
                      .map((day, index) => {
                        if (currentDay === day)
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
                      }):''}
                </View>
              </View>
            </View>
            <View style={startTimeRectangle}>
              <Text style={setShuttleStartTime}>SHUTTLE START TIMEs</Text>
              <Text style={setShuttleTotalTime}></Text>
              </View>
              <View>
              <View
                style={startTimeTabel}
              >
           {this.state.data!=undefined?<FlatList
           data={this.state.data[0].seatAvailability}
           renderItem={this._renderItems}
              numColumns={4}
            />:<></>}
               </View>
            </View>
            {this.state.isTwoWayTrip? (
            <View>
            <View style={startTimeRectangle}>
              <Text style={setShuttleReturnTime}>Return Shuttle time</Text>
              <Text style={setShuttleTotalTime}></Text>
              </View>
              <View>
              <View
                style={startTimeTabel2}
              >
           {this.state.data!=undefined?<FlatList
           // keyExtractor={this._keyExtractor}
           data={this.state.data[1].seatAvailability}
           renderItem={this._renderItemsReturn}
           numColumns={4}
          />:<></>}

              </View>
            </View>
            </View>):(<View></View>)}
            <ScrollView
            style={{ flexDirection: "column", height: "100%" }}
            ref={c => {
              this.scrollView = c;
            }}
          > 
            <View style={{ flex: 1, marginTop: 10, marginBottom:70 }}>
              {this.state.data!=undefined&&this.state.data[this.state.currentSliderIndex] &&
                this.state.data[this.state.currentSliderIndex].schedule[this.state.currentSliderIndex].stop.map(
                  (item, index) => {
                    console.log('Sugan index','--------'+JSON.stringify(index));
                    if (index <this.state.ToIndex) {
                      console.log('Sugan index','---inner-----'+JSON.stringify(index));

                      return this.drawFirstLine(
                        index,
                        this.state.data[this.state.currentSliderIndex].schedule[this.state.currentSliderIndex].stop[
                          index
                        ].wayPointName,
                        "Dep. " +
                          this.state.data[this.state.currentSliderIndex].schedule[this.state.currentSliderIndex]
                            .stop[index].wayPointLeaveTime
                      );
                    // } else if (
                    //   this.state.schedule[this.state.FromIndex].stop
                    //     .length -
                    //     1 ===
                    //   index
                    // ) {
                    //   return this.drawLastLine(
                    //     index,
                    //     this.state.schedule[this.state.FromIndex].stop[
                    //       index
                    //     ].wayPointName,
                    //     "Dep. " +
                    //       this.state.schedule[this.state.FromIndex]
                    //         .stop[index].wayPointLeaveTime
                    //   );
                    // } else if (
                    //   this.state.schedule[this.state.FromIndex].stop
                    //     .length > 2
                    // ) {
                    //   return this.drawLine(
                    //     index,
                    //     this.state.schedule[this.state.FromIndex].stop[
                    //       index
                    //     ].wayPointName,
                    //     "Dep. " +
                    //       this.state.schedule[this.state.FromIndex]
                    //         .stop[1].wayPointLeaveTime
                    //   );
                     }
                  }
                )}
            </View>
            </ScrollView>
          </ScrollView>
        {/* <TouchableDebounce style={scrollTopOval} onPress={() => this.goToTop}>
          <FontAwesome name="chevron-up" style={{ fontSize: 30 }} />
        </TouchableDebounce>*/}
        {/* <TouchableDebounce
          style={trackVehicle}
          onPress={() =>
            this.props.navigation.navigate("TrackShuttle", {
             // Trips: {
              //   trackeeID: this.state.schedule[this.state.currentSliderIndex]
              //     .trackeeID,
              //   DriverPhoto: this.state.schedule[this.state.currentSliderIndex]
              //     .driverPhoto,
              //   DriverName: this.state.schedule[this.state.currentSliderIndex]
              //     .driverName,
              //   VehicleRegNo: this.state.schedule[this.state.currentSliderIndex]
              //     .vehicleRegNo,
              //   RouteNumber: this.state.schedule[this.state.currentSliderIndex]
              //     .routeNumber,
              //   CheckinStatus: "0",
              //   PickupLocation: this.state.schedule[
              //     this.state.currentSliderIndex
              //   ].pickupLocation,
              //   DestinationLocation: this.state.schedule[
              //     this.state.currentSliderIndex
              //   ].destinationLocation
              // },
              // CustomerUrl: global.CustomerUrl,
              // UserId: global.UserId,
              // stops: this.state.schedule[this.state.currentSliderIndex].stop
            }
            )
          }
        >
          <MaterialIcons name="gps-fixed" style={{ fontSize: 30 }} />
        </TouchableDebounce> */}
        <View
          style={{ position: "absolute", bottom: 0, right: 0, width: "100%" }}
        >
          <Button
            backgroundColor={colors.BLUE}
            onPress={() =>{
              this.generateTicketShuttle();
              // this.props.navigation.navigate("ShuttleBooking", {
              //   shuttleID: this.state.shuttleResponse.shuttleID,
              //   routeName: this.state.shuttleResponse.routeName,
              //   runDays: this.state.shuttleResponse.runDays,
              //   schedule: this.state
              //     .schedule /*[this.state.slider1ActiveSlide]*/,
              //   currentSliderIndex: this.state.currentSliderIndex,
              //   nextAvailableIndex: this.state.nextAvailableIndex,
              //  // shuttleResponse: this.state.shuttleResponse
              //   shuttleResponse: this.state.data
                
              // })
             // console.log('Sugansi','Data============='+JSON.stringify(this.state.data));
            }
            }
          >
            <Text style={{ color: colors.WHITE }}>Generate Pass</Text>
          </Button>
        </View>
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
          Loading Routes...
        </Text>
      </View>
    );
  }
  drawFirstLine(index, Title, desc) {
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
              width: 80,
              backgroundColor: colors.GRAY
            }}
          />
        </View>
        <View
          style={{ marginBottom: 50, marginLeft: 15, flexDirection: "column" }}
        >
          <Text style={{color: colors.BLACK}}>{Title}</Text>
          <Text style={greenText}>{desc}</Text>
        </View>
      </View>
    );
  }
  drawLastLine(index, Title, desc) {
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
              width: 80,
              backgroundColor: colors.WHITE
            }}
          />
        </View>
        <View
          style={{
            marginBottom: 65,
            marginLeft: 15,
            flexDirection: "column",
            justifyContent: "flex-start"
          }}
        >
          <Text style={{color: colors.BLACK}}>{Title}</Text>
          <Text style={greenText}>{desc}</Text>
        </View>
      </View>
    );
  }
  drawLine(index, Title, desc) {
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
              width: 80,
              backgroundColor: colors.GRAY
            }}
          />
        </View>
        <View
          style={{
            marginBottom: 65,
            marginLeft: 15,
            flexDirection: "column",
            justifyContent: "flex-start"
          }}
        >
          <Text style={{color: colors.BLACK}}>{Title}</Text>
          <Text style={greenText}>{desc}</Text>
        </View>
      </View>
    );
  }
}

ShuttleRouteDetailsNEW.propTypes = {};

export default ShuttleRouteDetailsNEW;

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
  marginLeft: 20,
  fontFamily: "Helvetica",
  fontSize: 10,
  fontWeight: "bold",
  fontStyle: "normal",
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
 // height: 100,
  borderRadius: 5,
  backgroundColor: "#ffffff",
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
  // borderRadius: 5,
  borderWidth:1,
  height:150,
  borderColor:colors.BLACK,
  backgroundColor: colors.YELLOW,
    width:100
};
const SelectedTimeText = {
  width: 39.2,
  height: 17,
  fontFamily: "Helvetica",
  fontSize: 14,
  fontWeight: "bold",
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

const greenText = {
  fontFamily: "HelveticaNeue",
  fontSize: 10,
  fontWeight: "normal",
  fontStyle: "normal",
  letterSpacing: 0,
  color: colors.GREEN
};
