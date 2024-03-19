import React, { Component } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Box } from "native-base";
import KeepAwake from "react-native-keep-awake";
import MapView, { AnimatedRegion, Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { colors } from "../../utils/Colors";
import {
  _renderDriverDetails,
  _renderDriverMarker,
  _renderGPSTime,
  focus,
  getTrackingData,
  intervalId,
  mapDelta,
  updateAndroidMarker,
  getDirections
} from "../../utils/MapHelper";
import TouchableDebounce from "../../utils/TouchableDebounce";
import { NavigationActions } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const isShuttle = true;
const timeout = 5000;
let animationTimeout;
let markerIDs = ["shuttleMarker"];

export default class TrackShuttle extends Component {
  
  static navigationOptions = () => {
    return { headerStyle: { display: "none" } };
  };
  state = {
    isOnTrackingScreen: true,
    enableCustomTrackeeID: false,
    customTrackeeID: "",
    CustomerUrl: "NA",
    UserId: "NA",
    isLoading: false,
    Trips: {},
    TrackingData: { time: "", isTracking: false, data: [] },
    direction: { coords: [], distance: "", eta: "", gotETA: false },
    focused: false,
    cabLocation: new AnimatedRegion({
      latitude: 0.0,
      longitude: 0.0,
      latitudeDelta: 0, // -> added this
longitudeDelta: 0, // -> added this
    }),
    carHead: "0",
    lastUpdatedTime: "",
    lastUpdatedLocation: { latitude: 0.0, longitude: 0.0 },
    lastUpdatedLocationIndex: 0,
    gotDataFirstTime: false,
    isFastMoveEnabled: true,
    latitudeDelta: mapDelta.latitudeDelta,
    longitudeDelta: mapDelta.longitudeDelta,
    stops: []
  };

  animate(newCoordinate, rotation, overrideTimeout) {
    if (!newCoordinate) return;
    const { cabLocation } = this.state;
    if (Platform.OS === "android") {
      updateAndroidMarker(
        newCoordinate,
        overrideTimeout ? overrideTimeout : timeout
      );
    } else {
      cabLocation
        .timing({
          ...newCoordinate,
          duration: overrideTimeout ? overrideTimeout : timeout
        })
        .start();
    }
    this.timerUpdateRotation = setTimeout(() => {
      this.setState({
        ...this.state,
        carHead: rotation,
        cabLocation: new AnimatedRegion(newCoordinate),
        lastUpdatedLocation: {
          latitude: newCoordinate.latitude,
          longitude: newCoordinate.longitude
        } /*
        region: {
          ...sourceLocation,
          ...(this.state.region
            ? {
                latitudeDelta: this.state.region.latitudeDelta,
                longitudeDelta: this.state.region.longitudeDelta
              }
            : mapDelta)
        }*/
      });
    }, overrideTimeout ? overrideTimeout + 500 : timeout + 2000);
  }

  markerWithCustomColor = (index, maxSize) => {
    switch (index) {
      case 0:
        return <FontAwesome name="map-pin" color={colors.GREEN} size={30} />;
      case maxSize:
        return <FontAwesome name="map-pin" color={colors.RED} size={30} />;
      default:
        return <FontAwesome name="map-pin" color={colors.YELLOW} size={30} />;
    }
  };

  UNSAFE_componentWillMount() {
    const { navigation, route } = this.props;
    const Trips = route.params.Trips ? route.params.Trips : {};
    const CustomerUrl = route.params.CustomerUrl ? route.params.CustomerUrl : "NA";
    const UserId = route.params.UserId ? route.params.UserId : "NA";
    const stops = route.params.stops ? route.params.stops : [];
    getDirections(this, stops);
    this.setState({
      Trips,
      CustomerUrl,
      UserId,
      stops
    });
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    clearInterval(intervalId);
    clearInterval(this.timerUpdateRotation);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.state.focused && this.state.TrackingData.isTracking) {
      animationTimeout = setTimeout(() => {
        focus(this, markerIDs);
      }, 500);
      this.setState({ focused: true });
      return true;
    } else if (this.state.direction.eta !== nextState.direction.eta)
      return true;
    else if (this.state.stops !== nextState.stops) return true;
    else return this.state.TrackingData.time !== nextState.TrackingData.time;
  }

  onRegionChange(region) {
    this.setState({
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta
    });
    //console.warn("Region update : " + JSON.stringify(region));
  }

  componentDidMount() {
    this.subs = [
      this.props.navigation.addListener("focus", () =>
        this.setState({
          isOnTrackingScreen: true
        })
      ),
      this.props.navigation.addListener("blur", () =>
        this.setState({
          isOnTrackingScreen: false
        })
      )
    ];

    let Trip = this.state.Trips;
    let dummyPickupOrDrop = { latitude: 0.0, longitude: 0.0 };
    let TrackeeID = Trip.trackeeID;
    getTrackingData(TrackeeID, this, dummyPickupOrDrop, isShuttle);
    this.timer = setInterval(() => {
      if (!this.state.isOnTrackingScreen) {
      } else getTrackingData(TrackeeID, this, dummyPickupOrDrop, isShuttle);
    }, 7000);
  }

  render() {
    let Trip = this.state.Trips;
    let lat = this.state.stops[0].wayPointLat;
    let lng = this.state.stops[0].wayPointLng;

    let sourceLocation = {
      /*latitude: parseFloat(lat),
      longitude: parseFloat(lng)*/
        latitude: 13.1183531,
        longitude:77.5815545
    };

    return (
      <SafeAreaView>
        <KeepAwake />
        {/* <View style={{ flexDirection: "row", backgroundColor: colors.WHITE }}>
          <View
            style={{
              width: "100%",
              justifyContent: "flex-start",
              flexDirection: "row",
              alignItems: "center"
            }}
          >
            <TouchableDebounce
              style={{ justifyContent: "center", alignItems: "center" }}
              onPress={() => {
                this.props.navigation.dispatch(NavigationActions.back());
              }}
            >
              <Ionicons
                name="close"
                style={{
                  fontSize: 30,
                  color: colors.BLACK,
                  marginLeft: 10,
                  marginRight: 10
                }}
              />
            </TouchableDebounce>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                fontFamily: "Roboto"
              }}
            >
              Shuttle Tracking
            </Text>
            {/*{_renderEtaGpsTime(
              Trip.CheckinStatus,
              this.state.TrackingData.isTracking,
              this.state.direction.gotETA,
              this.state.direction.eta,
              this.state.gotDataFirstTime
            )}*
          </View>
        </View> */}
        <StatusBar
          translucent={false}
          backgroundColor={colors.WHITE}
          barStyle="dark-content"
        />
        {_renderGPSTime(
          this.state.TrackingData.isTracking,
          this.state.TrackingData.time
        )}
        <View style={styles.container}>
          <MapView
            ref={ref => {
              this.map = ref;
            }}
            style={styles.map}
            initialRegion={{ ...sourceLocation, ...mapDelta }}
            /*onRegionChange={region => this.onRegionChange(region)}
            region={{
              region: {
                latitude:
                  this.state.lastUpdatedLocation.latitude !== 0.0
                    ? this.state.lastUpdatedLocation.latitude
                    : sourceLocation.latitude,
                longitude:
                  this.state.lastUpdatedLocation.latitude !== 0.0
                    ? this.state.lastUpdatedLocation.longitude
                    : sourceLocation.longitude,
                latitudeDelta: this.state.latitudeDelta,
                longitudeDelta: this.state.longitudeDelta
              }
            }}*/ 
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          >
            {/*{_renderMultipleMarker(stops.stop, this)}*/}
            {this.state.stops.length > 0 &&
              this.state.stops.map((location, index) => {
                if (
                  !JSON.stringify(markerIDs).includes(
                    "Marker" + index.toString()
                  )
                ) {
                  markerIDs.push("Marker" + index.toString());
                }

                return (
                  <Marker.Animated
                    key={index.toString()}
                    identifier={"Marker" + index.toString()}
                    ref={marker => {
                      this.markerPickup = marker;
                    }}
                    coordinate={{
                      latitude: 13.1183531,
                      longitude:77.5815545
                    }}
                    title={location.wayPointName}
                    description={"Leaves at " + location.wayPointLeaveTime}
                  >
                    <Box
                      style={{ justifyContent: "center", alignItems: "center" }}
                    >
                      <View
                        style={{
                          flexDirection: "column",
                          backgroundColor: colors.WHITE,
                          padding: 5
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10
                          }}
                        >
                          {location.wayPointName}
                        </Text>
                        <Text
                          style={{
                            fontSize: 8
                          }}
                        >
                          {"Leaves at " + location.wayPointLeaveTime}
                        </Text>
                      </View>
                    </Box>
                    {this.markerWithCustomColor(
                      index,
                      this.state.stops.length - 1
                    )}
                  </Marker.Animated>
                );
              })}

            {_renderDriverMarker(
              this.state.cabLocation,
              this.state.carHead,
              isShuttle
            )}
            <Polyline
              coordinates={this.state.direction.coords}
              strokeWidth={3}
              strokeColor={colors.BLUE}
            />
          </MapView>
          {this.state.TrackingData.isTracking && (
            <TouchableDebounce
              style={{
                position: "absolute",
                right: 20,
                bottom: 20,
                backgroundColor: colors.WHITE,
                height: 40,
                width: 40,
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center"
              }}
              onPress={() => {
                focus(this, markerIDs);
              }}
            >
              <MaterialCommunityIcons
                name="crosshairs-gps"
                style={{ fontSize: 25, color: colors.BLACK }}
              />
            </TouchableDebounce>
          )}
        </View>
        <View style={{ backgroundColor: "transparent", height: 100 }}>
          {_renderDriverDetails(
            Trip.DriverPhoto,
            Trip.DriverName,
            Trip.VehicleRegNo,
            Trip.RouteNumber,
            this.state.CustomerUrl,
            this.state.UserId,
            this,
            isShuttle
          )}
        </View>
      </SafeAreaView>
    );
  }
}

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  map: {
    flex: 1,
    height,
    width,
    marginTop: 1.5,
    ...StyleSheet.absoluteFillObject
  }
});
