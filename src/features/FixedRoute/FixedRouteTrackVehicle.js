import React, {Component} from "react";
import {Animated, Dimensions, Image, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View} from "react-native";
import KeepAwake from "react-native-keep-awake";
import MapView, {AnimatedRegion, Marker, Polyline, PROVIDER_GOOGLE} from "react-native-maps";
import {colors} from "../../utils/Colors";
import {
    _renderFixedDriverMarker,
    _renderFixedRouteDriverDetails,
    _renderGPSTime,
    focus,
    getHqtTrackingData,
    intervalId,
    mapDelta,
    updateAndroidMarker
} from "../../utils/MapHelper";
import {URL} from "../../network/apiConstants";
import TouchableDebounce from "../../utils/TouchableDebounce";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import Waypoint from "../../assets/waypoint.png";
import Office from "../../assets/off_rm_pin.png";
import moment from "moment";

const isShuttle = true;
const timeout = 5000;
let animationTimeout;
let title="";
class FixedRouteTrackVehicle extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: '' // navigation.getParam('routeName', 'RouteName'),
            //headerStyle: { display: "none" }
        };
    };
    state = {
        isOnTrackingScreen: true,
        enableCustomTrackeeID: false,
        customTrackeeID: "",
        CustomerUrl: "NA",
        UserId: "NA",
        isLoading: false,
        Trips: {},
        TrackingData: {time: "", isTracking: false, data: []},
        coords: [],
        wpcoords: [],
        currentLocation: {},
        focused: false,
        cabLocation: new AnimatedRegion({
            latitude: 0.0,
            longitude: 0.0,
            latitudeDelta: 0, // -> added this
            longitudeDelta: 0, // -> added this
        }),
        carHead: "0",
        lastUpdatedTime: "",
        lastUpdatedLocation: {latitude: 0.0, longitude: 0.0},
        lastUpdatedLocationIndex: 0,
        gotDataFirstTime: false,
        isFastMoveEnabled: true,
        latitudeDelta: mapDelta.latitudeDelta,
        longitudeDelta: mapDelta.longitudeDelta,
        stops: [],
        isLoginTrip: false,
        trackWayPointData: {},
        trackWayPoints: [],
        WayPointMarker: [],
        routeDetails:{}
    };

    getWayPoints(shiftId, routeId) {
        if (!shiftId || !routeId) return;
        let header = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.state.access_token
        };
        let url = URL.Fixed_Wave_Points + shiftId + "/" + routeId;
        axios.get(url, {
            headers: header
        })
            .then(respons => {
                let response = respons.data;
                if (response) {
                    if (!response || response.status === 401) {
                        handleResponse.expireSession(context);
                        return;
                    }
                    let data = response.data;
                    console.warn('getWayPoints >>> ', data);
                    if (response.status.code === 200) {
                        let WayPointMarker = [];
                        let wayPoints = [];
                        WayPointMarker.push("WayPointMarker0");
                        for (let i = 0; i < data.wayPoints.length; i++) {
                            let wayPoint = data.wayPoints[i];
                            if (wayPoint.wayPointStatus.status === 1) {
                                WayPointMarker.push("WayPointMarker" + (i + 1));
                                wayPoints.push(wayPoint);
                            }
                        }
                        this.setState({
                            trackWayPointData: data,
                            trackWayPoints: wayPoints,
                            WayPointMarker: WayPointMarker,
                            isLoginTrip: data.tripType === "P",
                        });
                        focus(this, this.state.WayPointMarker);
                    }
                }
            })
            .catch(error => {
                console.warn("Error i am inside waypoints catch " + error);
            });
    }

    animate(newCoordinate, rotation, overrideTimeout) {
        if (!newCoordinate) return;
        const {cabLocation} = this.state;
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
                }
            });
        }, overrideTimeout ? overrideTimeout + 500 : timeout + 2000);
    }

    UNSAFE_componentWillMount() {
        const {navigation, route } = this.props;
        const Trips = route.params.Trips ? route.params.Trips : {};
        const CustomerUrl = route.params.CustomerUrl ? route.params.CustomerUrl : "NA";
        const UserId = route.params.UserId ? route.params.UserId : "NA";
        const stops = route.params.stops ? route.params.stops : [];
        const data= route.params.data ? route.params.data : {};
        this.setState({
            Trips,
            CustomerUrl,
            UserId,
            stops,
            data
        });
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        clearInterval(this.wayPointTimer);
        clearInterval(intervalId);
        clearInterval(this.timerUpdateRotation);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!this.state.focused && this.state.TrackingData.isTracking) {
            animationTimeout = setTimeout(() => {
                focus(this, this.state.WayPointMarker);
            }, 500);
            this.setState({focused: true});
            return true;
        } else if (this.state.stops !== nextState.stops) return true;
        else if (this.state.TrackingData.time !== nextState.TrackingData.time)
            return true;
        else return !!nextState.trackWayPointData;
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
        let TrackeeID = Trip.trackeeID;
        getHqtTrackingData(TrackeeID, this);
        this.timer = setInterval(() => {
            if (this.state.isOnTrackingScreen) {
                getHqtTrackingData(TrackeeID, this);
            }
        }, 5000); // 7000
        this.getWayPoints(Trip.shiftId, Trip.fixedRouteId);
        this.wayPointTimer = setInterval(() => {
            if (this.state.isOnTrackingScreen) {
                this.getWayPoints(Trip.shiftId, Trip.fixedRouteId);
            }
        }, 5000); // this.state.Trips.WayPointsPollingInMins ? (1000 * 60 * this.state.Trips.WayPointsPollingInMins) : (1000 * 30));
    }

    render() {
        let Trip = this.state.Trips;
        let sourceLocation = {};
        if(this.state.data){
            let data = this.state.data.waypoints[0];
            sourceLocation={
                latitude: parseFloat(data.latitude),
                longitude: parseFloat(data.longitude),
                latitudeDelta: this.state.latitudeDelta,
                longitudeDelta: this.state.longitudeDelta
            }
        }
        title=Trip.routeName;
        return (
            <SafeAreaView>
                <KeepAwake/>
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
                        initialRegion={{...sourceLocation, ...mapDelta}}
                        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                    >
                        {
                            this.state.trackWayPoints.map((data, index) => {
                                let reach = moment(data.estimatedReachTime, "YYYY-MM-DDTHH:mm:ss").format("HH:mm");
                                return (
                                    <Marker
                                        identifier={this.state.WayPointMarker[index + 1]}
                                        ref={marker => {
                                            this.marker = marker;
                                        }}
                                        key={index}
                                        title={data.locationName + "\n Scheduled Time : " + reach}
                                        description={"Scheduled Time :  " + reach}
                                        coordinate={{
                                            latitude: parseFloat(data.latitude),
                                            longitude: parseFloat(data.longitude)
                                        }}
                                    >
                                        <Image
                                            source={data.isOffice=== true ? Office : Waypoint}
                                            style={styles.icon_image_style}
                                        />
                                    </Marker>
                                );
                            })
                        }
                        {_renderFixedDriverMarker(
                            this.state.cabLocation,
                            this.state.carHead,
                            isShuttle,
                            "WayPointMarker0"
                        )}
                        <Polyline
                            coordinates={this.state.coords.length > 0 ? this.state.coords : []}
                            strokeWidth={3}
                            strokeColor={colors.BLUE}
                        />
                        <Polyline
                            coordinates={this.state.wpcoords.length > 0 ? this.state.wpcoords : []}
                            strokeWidth={3}
                            strokeColor={colors.GREEN}
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
                                focus(this, this.state.WayPointMarker);
                            }}
                        >
                            <MaterialCommunityIcons
                                name="crosshairs-gps"
                                style={{fontSize: 25, color: colors.BLACK}}
                            />
                        </TouchableDebounce>
                    )}
                </View>
                <View style={{backgroundColor: "transparent", height: 100}}>
                    {_renderFixedRouteDriverDetails(
                        Trip.DriverPhoto,
                        Trip.DriverName,
                        Trip.VehicleRegNo,
                        Trip.RouteNumber,
                        0,
                        this
                    )}
                </View>
            </SafeAreaView>
        );
    }

}

export default FixedRouteTrackVehicle;

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
        marginTop: 2,
        ...StyleSheet.absoluteFillObject
    }, icon_image_style: {
        width: 32,
        height: 38
    }

});
