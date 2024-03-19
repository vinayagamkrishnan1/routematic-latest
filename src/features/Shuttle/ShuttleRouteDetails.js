import React, { Component } from "react";
import { Button, Box } from "native-base";
import { Text, View, Image, Dimensions, ScrollView } from "react-native";
import { colors } from "../../utils/Colors";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import TouchableDebounce from "../../utils/TouchableDebounce";
import busIcon from "../../assets/Bus.png";
import LinearGradient from "react-native-linear-gradient";
import moment from "moment";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
const width = Dimensions.get("screen").width;
import Carousel from 'react-native-anchor-carousel';

import { extendMoment } from "moment-range";
const currentDay = moment().format("ddd");

const momentRange = extendMoment(moment);

class ShuttleRouteDetails extends Component {
  state = {
    currentSliderIndex: 0,
    shuttleResponse: {},
    schedule: [],
    nextAvailableIndex: null,
    CustomerUrl: "https://apiclient1.routematic.com"
  };

  static navigationOptions = ({ navigation }) => {
    return {
      title: "Shuttle Details"
      //headerStyle: { display: "none" }
    };
  };

  constructor(props) {
    super(props);
    this._renderItem = this._renderItem.bind(this);
  }

  UNSAFE_componentWillMount() {
    let shuttleResponse = this.props.route.params.shuttleResponse ? this.props.route.params.shuttleResponse : [];

    const range = moment.range(
      moment().format("YYYY-MM-DD"),
      moment()
        .add("7", "d")
        .format("YYYY-MM-DD")
    );
    for (let eachDay of range.by("d")) {
      let weekDayAvailable = eachDay.weekday();

      let shuttles =
        shuttleResponse.item.schedule.length > 0 &&
        shuttleResponse.item.schedule.filter(schedule => {
          return weekDayAvailable === schedule.dayOfWeek;
        });

      if (shuttles.length > 0) {
        let diff = 0;
        if (moment().weekday() < eachDay.weekday()) {
          diff = Math.abs(moment().weekday() - eachDay.weekday());
        }

        if (moment().weekday() > eachDay.weekday()) {
          diff = Math.abs(moment().weekday() - (eachDay.weekday() + 7));
        }

        console.warn("schedules-->" + JSON.stringify( shuttles));
        this.setState({
          shuttleResponse: shuttleResponse.item,
          schedule: shuttles,
          nextAvailableIndex: diff
        });
        break;
      }
    }
  }
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
    return (
      <View style={{ backgroundColor: colors.WHITE }}>
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
                  {this.state.shuttleResponse.routeName}
                </Text>
                <View style={{ flexDirection: "row", marginTop: 5 }}>
                  <Text style={source}>
                    {this.state.shuttleResponse.startWayPoint}
                  </Text>
                  <FontAwesome
                    name="long-arrow-right"
                    style={[
                      source,
                      { marginLeft: 10, marginRight: 10, marginTop: 2 }
                    ]}
                  />
                  <Text style={source}>
                    {this.state.shuttleResponse.endWayPoint}
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
                  {this.state.shuttleResponse.runDays &&
                    this.state.shuttleResponse.runDays
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
                      })}
                </View>
              </View>
            </View>
            <View style={startTimeRectangle}>
              <Text style={setShuttleStartTime}>SHUTTLE START TIME</Text>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: 50,
                  marginTop: 10
                }}
              >
               {/* <Carousel
                  ref={c => (this._slider1Ref = c)}
                  data={this.state.schedule}
                  firstItem={0}
                  itemWidth={70}
                  sliderWidth={width}
                  activeSlideAlignment="start"
                  renderItem={this._renderItem}
                  loop={false}
                  loopClonesPerSide={2}
                  autoplay={false}
                  autoplayDelay={500}
                  autoplayInterval={5000}
                  inactiveSlideOpacity={0.5}
                  inactiveSlideScale={0.7}
                  activeAnimationType={"spring"}
                  onSnapToItem={index => {
                    this.setState({ currentSliderIndex: index });
                  }}
                />*/}
                
                  <Carousel
                      ref={(c) => {
                          this._slider1Ref = c;
                      }}
                      data={this.state.schedule}
                      itemWidth={200}
                      containerWidth={width - 20}
                      renderItem={this._renderItem}
                  />
              </View>
            </View>

            <View style={{ flex: 1, marginTop: 10 }}>
              {this.state.schedule[this.state.currentSliderIndex] &&
                this.state.schedule[this.state.currentSliderIndex].stop.map(
                  (item, index) => {
                    if (index === 0) {
                      return this.drawFirstLine(
                        index,
                        this.state.schedule[this.state.currentSliderIndex].stop[
                          index
                        ].wayPointName,
                        "Dep. " +
                          this.state.schedule[this.state.currentSliderIndex]
                            .stop[index].wayPointLeaveTime
                      );
                    } else if (
                      this.state.schedule[this.state.currentSliderIndex].stop
                        .length -
                        1 ===
                      index
                    ) {
                      return this.drawLastLine(
                        index,
                        this.state.schedule[this.state.currentSliderIndex].stop[
                          index
                        ].wayPointName,
                        "Dep. " +
                          this.state.schedule[this.state.currentSliderIndex]
                            .stop[index].wayPointLeaveTime
                      );
                    } else if (
                      this.state.schedule[this.state.currentSliderIndex].stop
                        .length > 2
                    ) {
                      return this.drawLine(
                        index,
                        this.state.schedule[this.state.currentSliderIndex].stop[
                          index
                        ].wayPointName,
                        "Dep. " +
                          this.state.schedule[this.state.currentSliderIndex]
                            .stop[1].wayPointLeaveTime
                      );
                    }
                  }
                )}
            </View>
          </ScrollView>
        {/* <TouchableDebounce style={scrollTopOval} onPress={() => this.goToTop}>
          <FontAwesome name="chevron-up" style={{ fontSize: 30 }} />
        </TouchableDebounce>*/}
        <TouchableDebounce
          style={trackVehicle}
          onPress={() =>
            this.props.navigation.navigate("TrackShuttle", {
              Trips: {
                trackeeID: this.state.schedule[this.state.currentSliderIndex]
                  .trackeeID,
                DriverPhoto: this.state.schedule[this.state.currentSliderIndex]
                  .driverPhoto,
                DriverName: this.state.schedule[this.state.currentSliderIndex]
                  .driverName,
                VehicleRegNo: this.state.schedule[this.state.currentSliderIndex]
                  .vehicleRegNo,
                RouteNumber: this.state.schedule[this.state.currentSliderIndex]
                  .routeNumber,
                CheckinStatus: "0",
                PickupLocation: this.state.schedule[
                  this.state.currentSliderIndex
                ].pickupLocation,
                DestinationLocation: this.state.schedule[
                  this.state.currentSliderIndex
                ].destinationLocation
              },
              CustomerUrl: global.CustomerUrl,
              UserId: global.UserId,
              stops: this.state.schedule[this.state.currentSliderIndex].stop
            })
          }
        >
          <MaterialIcons name="gps-fixed" style={{ fontSize: 30 }} />
        </TouchableDebounce>
        <View
          style={{ position: "absolute", bottom: 0, right: 0, width: "100%" }}
        >
          <Button
            backgroundColor={colors.BLUE}
            onPress={() =>
              this.props.navigation.navigate("ShuttleBooking", {
                shuttleID: this.state.shuttleResponse.shuttleID,
                routeName: this.state.shuttleResponse.routeName,
                runDays: this.state.shuttleResponse.runDays,
                schedule: this.state
                  .schedule /*[this.state.slider1ActiveSlide]*/,
                currentSliderIndex: this.state.currentSliderIndex,
                nextAvailableIndex: this.state.nextAvailableIndex,
                shuttleResponse: this.state.shuttleResponse
              })
            }
          >
            <Text style={{ color: colors.WHITE }}>Generate Pass</Text>
          </Button>
        </View>
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
          style={{ marginBottom: 65, marginLeft: 15, flexDirection: "column" }}
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

ShuttleRouteDetails.propTypes = {};

export default ShuttleRouteDetails;

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
  backgroundColor: colors.WHITE,
    width:65
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
