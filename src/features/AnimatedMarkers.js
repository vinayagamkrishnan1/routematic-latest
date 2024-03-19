import React from "react";
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, {
  AnimatedRegion,
  Marker,
  PROVIDER_GOOGLE
} from "react-native-maps";
import Polyline from "@mapbox/polyline";
import { Body, Card, CardItem } from "native-base";
import { API } from "../network/apiFetch/API";
import { URL } from "../network/apiConstants/index";
import { colors } from "../utils/Colors";
import { appVersion } from "../utils/ConstantString";
import LinearGradient from "react-native-linear-gradient";
import KeepAwake from "react-native-keep-awake";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { mapDelta } from "../utils/MapHelper";

const carIcon = require("../assets/ic_car_topview_20.png");
const LATITUDE = 0.0;
const LONGITUDE = 0.0;
const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;
const DEFAULT_PADDING = { top: 60, right: 60, bottom: 200, left: 60 };
const markerIDs = ["Marker1", "Marker2"];

function autoTarget(CheckinStatus, PickupLocation, DestinationLocation) {
  return CheckinStatus === "0" ? PickupLocation : DestinationLocation;
}

class AnimatedMarkers extends React.Component {
  static navigationOptions = {
    title: "Track Vehicle",
    headerTitleStyle: { fontFamily: "Roboto" }
  };
  state = {
    initialRender: true
  };
  getMapRegion = () => ({
    ...autoTarget(
      this.state.CheckinStatus,
      this.state.PickupLocation,
      this.state.DestinationLocation
    ),
    ...mapDelta
  });
  _renderDriverDetails = () => {
    return (
      <View style={styles.buttonContainer}>
        <Card style={{ width: "80%", height: 100, bottom: 0 }}>
          <CardItem>
            <Body>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Image
                  source={{ uri: this.state.DriverPhoto }}
                  resizeMethod="scale"
                  resizeMode="cover"
                  style={{ width: 60, height: 60, borderRadius: 30 }}
                />
                <View>
                  <Text
                    style={{
                      marginLeft: 10,
                      fontSize: 15,
                      fontWeight: "700",
                      fontFamily: "Roboto"
                    }}
                  >
                    {this.state.DriverName}
                  </Text>
                  <Text
                    style={{ marginLeft: 10, fontSize: 13, fontWeight: "400" }}
                  >
                    {this.state.VehicleRegNo}
                  </Text>
                  <Text
                    style={{ marginLeft: 10, fontSize: 13, fontWeight: "400" }}
                  >
                    {this.state.RouteNumber}
                  </Text>
                </View>
              </View>
            </Body>
          </CardItem>
        </Card>
      </View>
    );
  };
  _renderEmployeeMarker = () => {
    return (
      <Marker.Animated
        ref={marker => {
          this.markerPickup = marker;
        }}
        coordinate={
          new AnimatedRegion(
            this.state.CheckinStatus === "0"
              ? this.state.PickupLocation
              : this.state.DestinationLocation
          )
        }
      >
        <FontAwesome name="map-pin" color={colors.RED} size={35} />
      </Marker.Animated>
    );
  };
  _renderDriverMarker = () => {
    //alert("Api Level : " + Platform.Version);
    if (Platform.OS === "android" && Platform.Version >= 26)
      return (
        <Marker.Animated
          identifier="Marker1"
          image={carIcon}
          ref={marker => {
            this.markerDriver = marker;
          }}
          anchor={{ position: "absolute", x: 0.5, y: 0.5 }}
          coordinate={this.state.coordinate}
          style={{
            width: 35,
            height: 35,
            transform: [{ rotate: this.state.computeHeading + "deg" }]
          }}
        />
      );
    else
      return (
        <Marker.Animated
          identifier="Marker2"
          ref={marker => {
            this.markerDriver = marker;
          }}
          anchor={{ position: "absolute", x: 0.5, y: 0.5 }}
          coordinate={this.state.coordinate}
          style={{
            width: 35,
            height: 35,
            justifyContent: "center",
            alignItems: "center",
            transform: [{ rotate: this.state.computeHeading + "deg" }]
          }}
        >
          <Image
            defaultSource={require("../assets/ic_car_topview.png")}
            source={require("../assets/ic_car_topview.png")}
            resizeMode="contain"
            anchor={{ position: "absolute", x: 0.5, y: 0.5 }}
            style={{
              flex: 1,
              transform: [{ rotate: this.state.computeHeading + "deg" }]
            }}
            onLayout={() => this.setState({ initialRender: false })}
            key={`${this.state.initialRender}`}
          />
        </Marker.Animated>
      );
  };

  constructor(props) {
    super(props);

    this.state = {
      time: "",
      PickupLocation: this.props.route.params.PickupLocation ? this.props.route.params.PickupLocation : {
        latitude: 0.0,
        longitude: 0.0
      },
      latitude: 0.0,
      longitude: 0.0,
      computeHeading: 0,
      distanceTravelled: 0,
      coordinate: new AnimatedRegion({
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: 0, // -> added this
longitudeDelta: 0, // -> added this
      }),
      coords: [],
      distance: "",
      eta: "",
      CheckinStatus: "0",
      TripType: "",
      DriverName: "",
      VehicleRegNo: "",
      RouteNumber: "",
      TrackeeID: "",
      DestinationLocation: this.props.route.params.DestinationLocation ? this.props.route.params.DestinationLocation :
        {
          latitude: 0.0,
          longitude: 0.0
        },
      isTracking: false,
      showSourceAndTarget: true,
      gotETA: false,
      focused: false
    };
  }

  UNSAFE_componentWillMount() {
    const { navigation, route } = this.props;
    const DriverName = route.params.DriverName; // ", "No DriverName ");
    const DriverPhoto = route.params.DriverPhoto; // ", "");
    const VehicleRegNo = route.params.VehicleRegNo
    // ",
    //   "No VehicleRegNo "
    // );
    const RouteNumber = route.params.RouteNumber; // ", "No RouteNumber ");
    const TrackeeID = route.params.TrackeeID; // ", "No TrackeeID");
    const CheckinStatus = route.params.CheckinStatus; // ", "0");
    const TripType = route.params.TripType; // ", "P");
    const PickupLocation = route.params.PickupLocation
    // ", {
    //   latitude: 0.0,
    //   longitude: 0.0
    // });
    const DestinationLocation = route.params.DestinationLocation
    // ", {
    //   latitude: 0.0,
    //   longitude: 0.0
    // });
    this.setState({
      DriverName,
      DriverPhoto,
      VehicleRegNo,
      RouteNumber,
      CheckinStatus,
      TripType,
      PickupLocation,
      DestinationLocation,
      latitude: 0.0, //PickupLocation.latitude,
      longitude: 0.0, //PickupLocation.longitude,
      TrackeeID
    });
    if (PickupLocation.latitude !== 0.0 && DestinationLocation.latitude !== 0.0)
      this.getMapRegion();
    else {
      alert("Pickup location or Drop location not found. Please try later.");
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  componentDidMount() {
    this.getTrackingData();
    /*********************** Interval call *********************/
    this.timer = setInterval(() => this.getTrackingData(), 20000);
  }

  async getTrackingData() {
    let body = { id: this.state.TrackeeID, key: appVersion.TrackeeKey };
    let response = await API.fetchXFORM(URL.GET_TRACKING_DATA, body);
    let getTrackingData = await response.json();
    let latestIndex = Object.keys(getTrackingData.data).length - 1;
    let totalSize = Object.keys(getTrackingData.data).length;
    let hasData = totalSize == 5;
    this.setState({
      time: getTrackingData.data[latestIndex].ts,
      isTracking: hasData
    });
    /************************ Calculating Pickup/Drop source & target *********************/
    var startLoc, destinationLoc;
    if (this.state.CheckinStatus === "0") {
      startLoc = this.state.latitude + "," + this.state.longitude;
      destinationLoc =
        this.state.PickupLocation.latitude +
        "," +
        this.state.PickupLocation.longitude;
    } else {
      startLoc = this.state.latitude + "," + this.state.longitude;
      destinationLoc =
        this.state.DestinationLocation.latitude +
        "," +
        this.state.DestinationLocation.longitude;
    }
    if (this.state.latitude === "0.0") return;
    this.getDirections(startLoc, destinationLoc);
    /************************ End of Calculating Pickup/Drop source & target *********************/
    /******************** Start Iterate over LatLng Array ************************/
    for (i = 0; i < Object.keys(getTrackingData.data).length; i++) {
      let oldLatitude = 0.0;
      let oldLongitude = 0.0;

      let index = i - 1;
      oldLatitude = parseFloat(getTrackingData.data[index > 0 ? index : i].lat);
      oldLongitude = parseFloat(
        getTrackingData.data[index > 0 ? index : i].long
      );

      const oldCoordinate = { latitude: oldLatitude, longitude: oldLongitude };
      const latitude = parseFloat(getTrackingData.data[i].lat);
      const longitude = parseFloat(getTrackingData.data[i].long);
      const newCoordinate = { latitude, longitude };
      this.state.isTracking &&
        newCoordinate &&
        oldCoordinate &&
        this.animate(newCoordinate, oldCoordinate);
    }
    /******************** End Iterate over LatLng Array ************************/

    /* if (!this.state.focused) {
          animationTimeout = setTimeout(() => {
            focus(this);
          }, 500);
          this.setState({
            focused: true
          });
        }*/
    if (!this.state.focused) {
      try {
        if (
          this.state.latitude !== 0.0 &&
          this.state.showSourceAndTarget &&
          this.state.DestinationLocation.latitude !== 0.0 &&
          this.state.PickupLocation.latitude !== 0.0
        ) {
          this.fitTwoMarkers();

          /*setTimeout(() => {
            this.fitTwoMarkers();
          }, 1000);
          setTimeout(() => {
            this.fitTwoMarkers();
          }, 5000);
          this.setState({
            focused: true
          });*/
        }
      } catch (e) {
        console.warn("Error : " + e.toString());
      }
    }
  }

  fitTwoMarkers() {
    this.map.fitToCoordinates(
      [
        this.state.CheckinStatus === "0"
          ? this.state.PickupLocation
          : this.state.DestinationLocation,
        {
          latitude: this.state.latitude,
          longitude: this.state.longitude
        }
      ],
      {
        edgePadding: DEFAULT_PADDING,
        animated: true
      }
    );
    this.setState({
      showSourceAndTarget: false
    });
  }

  animate(newCoordinate, oldCoordinate) {
    if (Platform.OS === "android") {
      if (this.marker) {
        this.marker._component.animateMarkerToCoordinate(newCoordinate, 1000);
      }
    } else {
      new AnimatedRegion({ oldCoordinate })
        .timing(newCoordinate, {
          duration: 1000,
          useNativeDriver: true
        })
        .start();
    }
    this.setState({
      latitude: newCoordinate.latitude,
      longitude: newCoordinate.longitude,
      coordinate: newCoordinate,
      computeHeading: computeHeading(
        {
          lat: oldCoordinate.latitude,
          lng: oldCoordinate.longitude
        },
        {
          lat: newCoordinate.latitude,
          lng: newCoordinate.longitude
        }
      )
    });
  }

  /********************** Draw routs between two location ***************************/
  async getDirections(startLoc, destinationLoc) {
    try {
      let param='';
      
      if(global.directionApiConfig===1)
        param+="&departure_time="+(Math.round(new Date().getTime() / 1000));
      let resp = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${
          global.directionMapKey
        }`+param
      );
      console.log("api333"+JSON.stringify(param))

      let respJson = await resp.json();
      //console.warn("resp : "+JSON.stringify(respJson));
      if (respJson.error_message) {
        console.warn(JSON.stringify(respJson));
      }
      let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
      let coords = points.map((point, index) => {
        return {
          latitude: point[0],
          longitude: point[1]
        };
      });
      this.setState({
        coords: coords,
        distance: respJson.routes[0].legs[0].distance.text,
        eta: respJson.routes[0].legs[0].duration.text,
        gotETA: true
      });
      return coords;
    } catch (error) {
      return error;
    }
  }

  /****************** End of Draw routs between two location ***************************/
  render() {
    //console.warn("Eta : "+parseInt(this.state.eta));
    return (
      <View style={styles.container}>
        {Platform.OS === "ios" ? (
          <StatusBar barStyle="dark-content" />
        ) : (
          <StatusBar barStyle="light-content" />
        )}
        <KeepAwake />
        <MapView
          ref={ref => {
            this.map = ref;
          }}
          // provider={PROVIDER_GOOGLE}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          showUserLocation={true}
          followUserLocation={true}
          loadingEnabled={true}
          //region={this.getMapRegion()}
          // onRegionChangeComplete={region => {
          //   this.getMapRegion();
          // }}
          initialRegion={this.getMapRegion()}
          showsTraffic={false}
          showsIndoors={true}
          rotateEnabled={true}
          toolbarEnabled={true}
        >
          <MapView.Polyline
            coordinates={this.state.coords}
            strokeWidth={3}
            strokeColor={colors.BLUE}
          />

          {this._renderDriverMarker()}
          {this._renderEmployeeMarker()}
        </MapView>

        <LinearGradient
          start={{ x: 0, y: 0.75 }}
          end={{ x: 1, y: 0.25 }}
          colors={[colors.BLUE, colors.GREEN]}
          style={{
            backgroundColor: colors.BLUE,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            padding: 5,
            opacity: 0.8
          }}
        >
          <Text
            style={{
              color: colors.WHITE,
              fontWeight: "700",
              fontSize: 18,
              fontFamily: "Roboto"
            }}
          >
            {!this.state.isTracking
              ? "Tracking data is not available please call driver"
              : parseInt(this.state.eta) < 2
                ? this.state.gotETA
                  ? "Arriving now"
                  : ""
                : this.state.CheckinStatus === "0"
                  ? this.state.isTracking && this.state.eta
                    ? "Arriving in "
                    : ""
                  : this.state.isTracking && this.state.eta
                    ? "On Trip, Reaching in "
                    : ""}

            {this.state.isTracking &&
            this.state.eta &&
            parseInt(this.state.eta) > 2
              ? this.state.eta
              : ""}
          </Text>
        </LinearGradient>
        <View
          style={{
            backgroundColor: colors.BLACK,
            opacity: 0.8,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            padding: 5
          }}
        >
          {this.state.isTracking && (
            <Text
              style={{
                color: colors.WHITE,
                fontWeight: "700",
                fontFamily: "Roboto"
              }}
            >
              GPS Time{" "}
              {this.state.time
                ? this.state.time.split(" ")[1].split(":")[0] +
                  ":" +
                  this.state.time.split(" ")[1].split(":")[1]
                : ""}
            </Text>
          )}
        </View>
        {this._renderDriverDetails()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    flex: 1
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20
  },
  latlng: {
    width: 200,
    alignItems: "stretch"
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10
  },
  buttonContainer: {
    flexDirection: "row",
    backgroundColor: "transparent"
  }
});

export default AnimatedMarkers;

function computeHeading(start, end) {
  var lat1 = (start.lat * Math.PI) / 180;
  var lat2 = (end.lat * Math.PI) / 180;
  var lng1 = (start.lng * Math.PI) / 180;
  var lng2 = (end.lng * Math.PI) / 180;
  return (
    (Math.atan2(
      Math.sin(lng2 - lng1) * Math.cos(lat2),
      Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)
    ) *
      180) /
    Math.PI
  ).toString();
}
