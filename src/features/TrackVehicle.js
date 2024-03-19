import React, { Component } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    AppState,
    Dimensions,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    PermissionsAndroid,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Body, Button, Box, Stack, Text as Text1, HStack } from "native-base";
import KeepAwake from "react-native-keep-awake";
import MapView, { AnimatedRegion, Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { colors } from "../utils/Colors";
import {
    _renderDriverDetails,
    _renderDriverMarker,
    _renderEmployeeMarker,
    _renderEtaGpsTime,
    _renderGPSTime,
    autoTargetLocation,
    focus,
    getGoogleDirectionsWithETA,
    getTrackingDataOnlyForVehicle,
    intervalId,
    mapDelta,
    updateAndroidMarker
} from "../utils/MapHelper";
import TouchableDebounce from "../utils/TouchableDebounce";
import { CommonActions } from '@react-navigation/native';
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { URL } from "../network/apiConstants";
import { handleResponse } from "../network/apiResponse/HandleResponse";
import { EventRegister } from 'react-native-event-listeners'
import SwipeUpDown from 'react-native-swipe-up-down';
import axios from "axios";

import Emp_blue from "../assets/emp_blue.png";
import emp_rm_pin from "../assets/emp_rm_pin2.png";
import { asyncString, loginString, pushClearKeys } from "../utils/ConstantString";
import { inject, observer } from "mobx-react";
import Modal from "react-native-modal";
import RNSlidingButton, { SlideDirection } from "./RNSlidingButton";
import Shimmer from "react-native-shimmer";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import Geolocation from "@react-native-community/geolocation";
import { check, PERMISSIONS, RESULTS } from "react-native-permissions";
import moment from "moment";
import StarRating from "react-native-star-rating";
import { API } from "../network/apiFetch/API";
import { TYPE } from "../model/ActionType";
import { action, runInAction } from "mobx";
import { Rating } from "react-native-ratings";
import * as Toast from "../utils/Toast";
import { checkSpecialCharacter } from "../utils/Validators";

const timeout = 5000;
@inject("trackVehicleStore")
@observer
export default class TrackVehicle extends Component {

    static navigationOptions = () => {
        return { headerStyle: { display: "none" } };
    };

    constructor(props) {
        super(props);
        let keyboardSpace = 0;
        Keyboard.addListener('keyboardDidShow', (frames) => {
            if (!frames.endCoordinates) return;
            keyboardSpace = frames.endCoordinates.height
        });
        Keyboard.addListener('keyboardDidHide', (frames) => {
            keyboardSpace = 0;
        });
        this.state = {
            isOnTrackingScreen: true,
            enableCustomTrackeeID: false,
            customTrackeeID: "",
            CustomerUrl: "NA",
            UserId: "NA",
            isLoading: false,
            driverRating: 0.0,
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
            ChatEnabled: "0",
            access_token: undefined,
            hqtDuration: 0,
            trackWayPointData: {},
            trackWayPoints: [],
            WayPointMarker: [],
            currentLocation: {
                hasData: false
            },
            tempRating: 0.0,
            CheckinCheckoutDisabled: true,
            feedbackRating: 0,
            disableFooter: false,
            pin: "",
            keyboardSpace: keyboardSpace,
            appState: AppState.currentState
        };

    }

    _handleAppStateChange = nextAppState => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            // this.getLatestTripDetails(); disabled due to multiple api call irrespective of tracking
            global.isTrackVehicle = true;
        }
        this.setState({ appState: nextAppState });
    };

    getLatestTripDetails() {
        this.props.trackVehicleStore.getTripDetails(this.state.CustomerUrl).then(() => {
            if (this.props.trackVehicleStore.trackingData.hasOwnProperty("Trips")) {
                let Trips = this.props.trackVehicleStore.trackingData.Trips[0];
                this.setState({ Trips: Trips });
                let pickupOrDrop = autoTargetLocation(Trips.CheckinStatus, Trips.PickupLocation, Trips.DestinationLocation,);
                this.getWayPoints(this.state.Trips.TripID, true, pickupOrDrop);
                if (!this.props.trackVehicleStore.guardDetails.hasOwnProperty('guardName')) {
                    this.props.trackVehicleStore.getGuardDetails(this.props.trackVehicleStore.trackingData.Trips[0].TripID);
                }
            }
        });
    }

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
                    longitude: newCoordinate.longitude,
                    latitudeDelta: 0, // -> added this
                    longitudeDelta: 0, // -> added this
                }
            });
        }, overrideTimeout ? overrideTimeout + 500 : timeout + 2000);
    }

    UNSAFE_componentWillMount() {
        const { navigation, route } = this.props;
        // console.warn('Track params - ', route.params);
        const Trips = route.params.Trips ? route.params.Trips : {};
        const CustomerUrl = route.params.CustomerUrl ? route.params.CustomerUrl : "NA";
        const UserId = route.params.UserId ? route.params.UserId : "NA";
        const ChatEnabled = route.params.ChatEnabled ? route.params.ChatEnabled : "0";
        const access_token = route.params.access_token ? route.params.access_token : "";
        const CheckinCheckoutDisabled = route.params.CheckinCheckoutDisabled ? route.params.CheckinCheckoutDisabled : false;
        this.setState({ access_token, Trips, CustomerUrl, UserId, ChatEnabled, CheckinCheckoutDisabled });
        let pickupOrDrop = autoTargetLocation(Trips.CheckinStatus, Trips.PickupLocation, Trips.DestinationLocation,);
        this.listener = EventRegister.addEventListener('wayPointApiEvent', (data) => {
            this.getWayPoints(this.state.Trips.TripID, true, pickupOrDrop);
        });
        this.props.trackVehicleStore.setInitValues(access_token, Trips.TripID, Trips.ProgramType);
        this.getRatingForTrip(Trips.TripID);
        Keyboard.addListener('keyboardDidShow', (frames) => {
            if (!frames.endCoordinates) return;
            this.setState({ keyboardSpace: frames.endCoordinates.height });
        });
        Keyboard.addListener('keyboardDidHide', (frames) => {
            this.setState({ keyboardSpace: 0 });
        });
        if (Trips.DriverID) {
            this.getDriverRating(Trips.DriverID, access_token);
        }
    }

    getDriverRating(driverID, token) {
        axios.get(URL.GET_DRIVER_RATING + driverID, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            }
        }).then(response => {
            // console.warn('driver rate res - ', response);
            if (response.data?.status.code) {
                this.setState({ driverRating: response.data.data.rating });
            }
            console.warn("DATA CODE  " + JSON.stringify(response.data.data));

        }).catch(error => {
            console.warn("here errror " + error);
        });
    }


    componentDidMount() {
        AppState.addEventListener("change", this._handleAppStateChange);
        let Trip = this.state.Trips;
        let pickupOrDrop = autoTargetLocation(Trip.CheckinStatus, Trip.PickupLocation, Trip.DestinationLocation);
        this.subs = [
            this.props.navigation.addListener("focus", () => {
                this.setState({ isOnTrackingScreen: true });
                global.isTrackVehicle = true;
                this.getWayPoints(this.state.Trips.TripID, true, pickupOrDrop);
            }
            ),
            this.props.navigation.addListener("blur", () => {
                this.setState({ isOnTrackingScreen: false });
                global.isTrackVehicle = false;
            }
            )
        ];
        if (Trip.DriverID) {
            this.getDriverRating(Trip.DriverID, this.state.access_token);
        }
        getTrackingDataOnlyForVehicle(this.state.Trips.TrackeeID, this);
        this.timer = setInterval(() => {
            if (this.state.isOnTrackingScreen) {
                getTrackingDataOnlyForVehicle(this.state.Trips.TrackeeID, this);
            }
        // }, global.HQT_DURATION > 0 ? global.HQT_DURATION * 1000 : 7000);
        }, 4000);
        this.getWayPoints(this.state.Trips.TripID, true, pickupOrDrop);
        this.wayPointTimer = setInterval(() => {
            if (this.state.isOnTrackingScreen) {
                this.getWayPoints(this.state.Trips.TripID, false, pickupOrDrop);
            }
        // }, this.state.Trips.WayPointsPollingInMins ? (1000 * 60 * parseInt(this.state.Trips.WayPointsPollingInMins)) : (1000 * 300));
        }, 5000);
        this.googleApiTimer = setInterval(() => {
            if (this.state.isOnTrackingScreen) {
                this.callToGoogleApi(pickupOrDrop);
            }
        }, global.googleApiDuration > 0 ? global.googleApiDuration * 1000 : 45000);
        //       },9900);
        const deleteData = this.props.route.params.deleteData;
        if (deleteData && deleteData === true) {
            // clear the data
            AsyncStorage.multiRemove(pushClearKeys, err => {
                console.warn("removed successfully");
            });
        }
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.state.WayPointMarker.length > 0 ? focus(this, this.state.WayPointMarker) : focus(this);
            this.getRatingForTrip(Trip.TripID);
        });
        this.checkPermissions();
    }

    callToGoogleApi(pickupOrDrop) {
        if (this.state.Trips.TripType === "P") {
            let destination = this.state.trackWayPoints.find(function (item) {
                return (item.reached === 0 && item.skipped === 0 && item.proceed === 0)
            });
            if (this.state.currentLocation.hasData) {
                if (this.state.Trips.CheckinStatus === "1") {
                    getGoogleDirectionsWithETA(this, this.state.currentLocation, this.state.trackWayPoints, destination ? destination : pickupOrDrop, this.state.trackWayPointData);
                } else {
                    getGoogleDirectionsWithETA(this, this.state.currentLocation, this.state.trackWayPoints, destination ? destination : pickupOrDrop, this.state.trackWayPointData);
                }
            }
        } else {
            if (this.state.currentLocation.hasData && this.state.trackWayPointData.actualTripStartTime === "")
                getGoogleDirectionsWithETA(this, this.state.currentLocation, this.state.trackWayPoints, pickupOrDrop, this.state.trackWayPointData);
            else {
                let destination = this.state.trackWayPoints.find(function (item) {
                    return (item.reached === 0 && item.skipped === 0 && item.proceed === 0)
                });
                if (destination && destination.routeIndex <= this.state.trackWayPointData.employeeRouteIndex)
                    getGoogleDirectionsWithETA(this, this.state.currentLocation, this.state.trackWayPoints, destination ? destination : pickupOrDrop, this.state.trackWayPointData);
            }
        }
    }

    getWayPoints(TripID, needToCallGoogleApiForFirstTime, pickupOrDrop) {
        if (!TripID) return;
        let header = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.state.access_token
        };
        let url = URL.Wave_Points + TripID;
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
                    console.warn("waypoint data" + JSON.stringify(data));
                    if (response.status.code === 200) {
                        let WayPointMarker = [];
                        let wayPoints = [];
                        data.wayPoints.map((item, index) => {
                            if (item.reached === 0 && item.proceed === 0 && item.skipped === 0) {
                                if ((index + 1) !== data.employeeRouteIndex) {
                                    WayPointMarker.push("WayPointMarker" + index);
                                }
                                wayPoints.push(item);
                            }
                        });
                        WayPointMarker.push("Marker1");
                        WayPointMarker.push("Marker2");
                        setTimeout(() => {
                            this.setState({
                                trackWayPointData: data,
                                trackWayPoints: wayPoints,
                                WayPointMarker: WayPointMarker,
                            });
                            if (needToCallGoogleApiForFirstTime) {
                                this.callToGoogleApi(pickupOrDrop);
                            }
                        }, 500);
                    }
                }
            })
            .catch(error => {
                console.warn("Error" + JSON.stringify(error));
            });
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        clearInterval(this.wayPointTimer);
        clearInterval(this.googleApiTimer);
        clearInterval(intervalId);
        clearInterval(this.timerUpdateRotation);
        // this.focusListener.remove();
        // AppState.removeEventListener("change", this._handleAppStateChange);
        EventRegister.removeEventListener(this.listener);
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     // uncomment it once you have proper data
    //     if (!this.state.focused && this.state.TrackingData.isTracking) {
    //         this.setState({ focused: true });
    //         return true;
    //     } else if (this.state.direction.eta !== nextState.direction.eta)
    //         return true;
    //     else if (this.state.TrackingData.time !== nextState.TrackingData.time)
    //         return true;
    //     else if (nextState.trackWayPointData) {
    //         /*animationTimeout = setTimeout(() => {
    //             focus(this,this.state.WayPointMarker);
    //         }, 500);*/
    //         return true
    //     }
    // }

    render() {
        let Trip = this.state.Trips;
        let sourceLocation = autoTargetLocation(
            Trip.CheckinStatus,
            Trip.PickupLocation,
            Trip.DestinationLocation
        );
        let shouldDisplayWaypoints = true;
        this.state.trackWayPoints.map((data) => {
            if (data.expectedStartTime && data.expectedStartTime === "") {
                shouldDisplayWaypoints = false;
            }
        });
        let userData = [];
        let trackwaypoint = this.state.trackWayPointData.wayPoints;
        (trackwaypoint && trackwaypoint.map((item) => {
            if (item.employeesInfo && item.employeesInfo.length > 0) {
                item.employeesInfo.map((employee) => {
                    userData.push(employee);
                });
            }
        }));
        // console.warn('Trips - ', Trip);
        // console.warn('sourceLocation - ', sourceLocation);
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%'}}>
                <KeepAwake />
                <View style={{ flexDirection: "row", backgroundColor: colors.WHITE }}>
                    <View
                        style={{
                            width: "100%",
                            justifyContent: "flex-start",
                            alignContent: 'center',
                            flexDirection: "row"
                        }}
                    >
                        <TouchableDebounce
                            style={{ justifyContent: "center", alignItems: "center" }}
                            onPress={() => {
                                    this.props.navigation.dispatch(CommonActions.goBack());
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
                        {_renderEtaGpsTime(
                            Trip.CheckinStatus,
                            this.state.TrackingData.isTracking,
                            this.state.direction.gotETA,
                            this.state.direction.eta,
                            this.state.gotDataFirstTime,
                            this
                        )}
                    </View>
                </View>
                <StatusBar
                    translucent={false}
                    backgroundColor={colors.WHITE}
                    barStyle="dark-content"
                />
                <Modal
                    isVisible={this.props.trackVehicleStore.visibleCheckInModal === true}
                    style={styles.bottomModal}
                    onRequestClose={() => {
                        this.props.trackVehicleStore.disableCheckInModel();
                    }}
                >
                    <TouchableDebounce
                        style={{ height: "75%", width: "100%" }}
                        onPress={() => this.props.trackVehicleStore.disableCheckInModel()}
                    />
                    {this._renderCheckInModalContent()}
                </Modal>
                <Modal
                    isVisible={this.props.trackVehicleStore.visibleCheckOutModal === true}
                    style={styles.bottomModal}
                    onRequestClose={() => {
                        this.props.trackVehicleStore.disableCheckOutModel();
                    }}
                >
                    <TouchableDebounce
                        style={{ height: "75%", width: "100%" }}
                        onPress={() => this.props.trackVehicleStore.disableCheckOutModel()}
                    />
                    {this._renderCheckOutModalContent()}
                </Modal>
                <Modal
                    isVisible={this.props.trackVehicleStore.visiblePanicModal === true}
                    style={styles.bottomModal}
                    onRequestClose={() => {
                        this.props.trackVehicleStore.disablePanicModel()
                    }}
                >
                    <TouchableDebounce
                        style={{ height: "75%", width: "100%" }}
                        onPress={() => this.props.trackVehicleStore.disablePanicModel()}
                    />
                    {this._renderPanicModalContent()}
                </Modal>
                <Modal
                    isVisible={this.props.trackVehicleStore.visibleSafeDropModal === true}
                    style={{
                        flex: 1,
                        flexDirection: "column",
                        position: 'absolute',
                        bottom: 0,
                        top: this.state.keyboardSpace ? -10 - this.state.keyboardSpace : -100,
                        padding: 20,
                    }}
                    onRequestClose={() => {
                        this.props.trackVehicleStore.disableSafeDropModel()
                    }}
                >
                    {this._renderSafeDropContent(this.state.Trips)}
                </Modal>
                <Modal
                    isVisible={this.props.trackVehicleStore.visibleFeedBackModal === true}
                    style={{ flex: 1, flexDirection: "column" }}
                    onRequestClose={() => this.props.trackVehicleStore.disableFeedBackModel()}
                >
                    {(Trip.isFeedbackMandatory !== "1") && (
                    <TouchableDebounce
                        style={{
                            width: "100%",
                            position: "absolute",
                            right: 10,
                            top: 25,
                            justifyContent: "center",
                            alignItems: "flex-end",
                        }}
                        onPress={() => this.props.trackVehicleStore.disableFeedBackModel()}
                    >
                        <Text
                            style={{ color: colors.WHITE, fontWeight: "700", fontSize: 20 }}
                        >
                            Skip
                        </Text>
                    </TouchableDebounce>
                    )}
                    {this._renderFeedbackContent(Trip)}
                </Modal>
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
                        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                    >
                        {_renderEmployeeMarker(sourceLocation, this, this.state.Trips.TripType === "P" ? this.state.Trips.CheckinStatus === "0" :
                            this.state.Trips.TripType === "D" ? this.state.Trips.CheckinStatus === "1" : false)}
                        {shouldDisplayWaypoints && this.state.trackWayPoints.map((data, index) => {
                            let location = {
                                latitude: data.latitude, longitude: data.longitude
                            };
                            let temp = data.routeIndex === this.state.trackWayPointData.employeeRouteIndex;
                            let WayPointMarker = this.state.WayPointMarker;
                            let name = "";
                            data.employeesInfo.map((data) => {
                                name += (data.employeeName + ",");
                            });
                            if (name.length > 2) {
                                name = name.substring(0, name.length - 1);
                            }
                            if (!temp) {
                                return (
                                    <Marker
                                        identifier={WayPointMarker[index]}
                                        key={index}
                                        title={data.employeesInfo.length > 0 ? name : "Emp" + (data.routeIndex)}
                                        coordinate={location}>
                                        <Image
                                            source={Emp_blue}
                                            style={styles.icon_image_style}
                                        />
                                    </Marker>)
                            } else if (temp && this.state.Trips.TripType === "D" ? this.state.Trips.CheckinStatus === "0" : false) {
                                return (
                                    <Marker
                                        identifier={WayPointMarker[index]}
                                        key={index}
                                        title={data.employeesInfo.length > 0 ? name : "Emp" + (data.routeIndex)}
                                        coordinate={location}>
                                        <Image
                                            source={emp_rm_pin}
                                            style={styles.icon_image_style}
                                        />
                                    </Marker>)
                            }
                        })
                        }
                        {_renderDriverMarker(this.state.cabLocation, this.state.carHead)}
                        <Polyline
                            coordinates={this.state.direction.coords}
                            strokeWidth={3}
                            strokeColor={colors.BLUE}
                        />
                    </MapView>
                    {this.state.disableFooter === false && this.state.TrackingData.isTracking && (
                        <TouchableDebounce
                            style={[styles.buttonStyle, {
                                right: 20,
                                bottom: 20
                            }]}
                            onPress={() => this.state.WayPointMarker.length > 0 ? focus(this, this.state.WayPointMarker) : focus(this)}
                        >
                            <MaterialCommunityIcons
                                name="crosshairs-gps"
                                style={{ fontSize: 35, color: colors.BLACK }}
                            />
                        </TouchableDebounce>
                    )}
                    {(this.state.disableFooter === false && this.state.Trips.ProgramType != 'TD'&&this.state.Trips.CheckinStatus === "1") && (
                        <TouchableDebounce
                            style={[styles.buttonStyle, {
                                width: 60,
                                height: 60,
                                borderRadius: 30,
                                right: 20,
                                top: 20,
                                borderWidth: 1,
                                borderColor: colors.GRAY
                            }]}
                            onPress={() => this.props.trackVehicleStore.enablePanicModel()}
                        >
                            <Image
                                defaultSource={require("../assets/actions/SOS.png")}
                                source={require("../assets/actions/SOS.png")}
                                resizeMethod="scale"
                                resizeMode="cover"
                                style={[styles.iconStyle, { width: 62, height: 62 }]}
                            />
                        </TouchableDebounce>
                    )}
                    {(this.state.disableFooter === false && this.doIShowGuard(this.state.Trips)) && (
                        <TouchableDebounce
                            style={[styles.buttonStyle, {
                                width: 60,
                                height: 60,
                                borderRadius: 30,
                                right: 20,
                                top: 90,
                                borderWidth: 1,
                                borderColor: colors.WHITE,
                                backgroundColor: colors.WHITE
                            }]}
                            onPress={() => {
                                if (this.state.Trips.IsGuardDeployed === 1) {
                                    if (this.props.trackVehicleStore.guardDetails.hasOwnProperty('guardName')) {
                                        this.props.navigation.navigate("GuardDetails", {
                                            token: this.state.access_token,
                                            guardData: this.props.trackVehicleStore.guardDetails
                                        });
                                    } else {
                                        this.props.trackVehicleStore.getGuardDetails(this.state.Trips.TripID).then(() => {
                                            if (this.props.trackVehicleStore.guardDetails.hasOwnProperty('guardName')) {
                                                this.props.navigation.navigate("GuardDetails", {
                                                    token: this.state.access_token,
                                                    guardData: this.props.trackVehicleStore.guardDetails
                                                });
                                            } else {
                                                Alert.alert("Routematic", loginString.somethingWentWrong);
                                            }
                                        })
                                    }
                                } else {
                                    Alert.alert('Routematic', 'Guard is not deployed yet!');
                                }
                            }}
                        >
                            {
                                this.state.Trips.IsGuardDeployed === 1 ?
                                    (
                                        <Image
                                            defaultSource={require("../assets/guard.png")}
                                            source={require("../assets/guard.png")}
                                            resizeMethod="scale"
                                            resizeMode="cover"
                                            style={[styles.iconStyle, { width: 50, height: 50 }]}
                                        />
                                    ) : (
                                        <Image
                                            defaultSource={require("../assets/GuardGrey.png")}
                                            source={require("../assets/GuardGrey.png")}
                                            resizeMethod="scale"
                                            resizeMode="cover"
                                            style={[styles.iconStyle, { width: 50, height: 50 }]}
                                        />
                                    )
                            }

                        </TouchableDebounce>
                    )}
                </View>
                {this.state.disableFooter === false && (<View style={{ backgroundColor: "transparent", height: 160, alignItems: 'center' }}>
                    {this.renderUserAction(Trip, userData)}
                </View>)}
                <SwipeUpDown
                    ref={ref => {(this.swipeUpDownRef = ref)}}
                    animation="easeInEaseOut"
                    onShowMini={() => {
                        this.setState({ disableFooter: false });
                    }}
                    itemFull={this.renderEmployeeListingUI(userData)} // Pass props component when show full
                    disablePressToShow={false} // Press item mini to show full
                    style={{ backgroundColor: colors.WHITE }} // style for swipe
                />
              </View>
            </SafeAreaView>
        );
    }

    doIShowGuard(Trips) {
        if (Trips.hasOwnProperty('IsGuardRequired') && Trips.hasOwnProperty('IsGuardDeployed')) {
            return Trips.IsGuardRequired === 1 || Trips.IsGuardDeployed === 1;
        } else {
            return false;
        }
    }

    renderUserAction(Trip, userData) {
        return (
            <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                <View style={{
                    width: '100%',
                    height: 65,
                    flexDirection: 'row',
                    backgroundColor: colors.GREEN,
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <TouchableDebounce
                        style={styles.newButtonStyle}
                        onPress={() => {
                            this.state.CheckinCheckoutDisabled === false ?
                                this.state.Trips.CheckinStatus === "0" ? this.props.trackVehicleStore.enableCheckInModel(this.state.Trips.TripID, this.state.Trips.ProgramType)
                                    : this.state.Trips.CheckinStatus === "1" ? this.props.trackVehicleStore.enableCheckOutModel(this.state.Trips.TripID, this.state.Trips.ProgramType)
                                        : Alert.alert("Check Out", "You have already done Check Out for this trip")
                                : this.state.Trips.CheckinStatus === "0" ? 
                                    this.props.trackVehicleStore.trackVehicleDoCheckIn().then(() => {
                                        // if (this.state.CheckinCheckoutDisabled === false) { //  && this.props.trackVehicleStore.TripId.length === 0
                                        // }
                                        this.getLatestTripDetails();
                                    })
                                    : this.props.trackVehicleStore.trackVehicleDoCheckOut().then((res) => {
                                        // console.warn('Direct checkout -- ', res);
                                        setTimeout(() => {
                                            Alert.alert(
                                                'Check Out',
                                                res.data?.status?.message,
                                                [
                                                    {
                                                        text: "OK",
                                                        onPress: () => {
                                                            this.props.navigation.navigate("MyTripsMobx", {
                                                                feedbackTrip: 1
                                                            });
                                                        }
                                                    }
                                                ],
                                                { cancelable: false }
                                            );
                                        }, 500);
                                    }).catch((err) => {
                                        // console.warn('Direct checkout error -- ', err);
                                        Alert.alert(
                                            'Check Out',
                                            loginString.somethingWentWrong,
                                            [
                                                {
                                                    text: "OK",
                                                    onPress: () => {
                                                        console.warn('close modal');
                                                    }
                                                }
                                            ],
                                            { cancelable: true }
                                        );
                                    });
                        }}
                    >
                        {
                            this.state.Trips.CheckinStatus === "0" ?
                                <Image
                                    defaultSource={require("../assets/actions/CheckIn-green.png")}
                                    source={require("../assets/actions/CheckIn-green.png")}
                                    resizeMethod="scale"
                                    resizeMode="cover"
                                    style={styles.iconStyle}
                                /> :
                                this.state.Trips.CheckinStatus === "1" ?
                                    <Image
                                        defaultSource={require("../assets/actions/CheckOut-green.png")}
                                        source={require("../assets/actions/CheckOut-green.png")}
                                        resizeMethod="scale"
                                        resizeMode="cover"
                                        style={styles.iconStyle}
                                    /> :
                                    <Image
                                        defaultSource={require("../assets/actions/CheckOutBlue.png")}
                                        source={require("../assets/actions/CheckOutBlue.png")}
                                        resizeMethod="scale"
                                        resizeMode="cover"
                                        style={styles.iconStyle}
                                    />
                        }
                    </TouchableDebounce>
                    {this.state.Trips.TripType === "D" && (
                        <TouchableDebounce
                            style={styles.newButtonStyle}
                            onPress={() => {
                                if (this.state.Trips.SafeDropStatus === "0") {
                                    if (this.state.CheckinCheckoutDisabled === false) {
                                        if (this.state.Trips.CheckinStatus === "0") {
                                            Alert.alert("Safe Drop", "Before Safe drop you must do the Check In");
                                        } else if (this.state.Trips.CheckinStatus === "1") {
                                            Alert.alert(
                                                'Safe Drop',
                                                loginString.safeDropBeforeCheckout,
                                                [
                                                    {
                                                        text: "Cancel",
                                                        onPress: () => {
                                                            console.warn("canceled alert");
                                                        },
                                                        style: "cancel"
                                                    },
                                                    {
                                                        text: "OK",
                                                        onPress: () => {
                                                            this.props.trackVehicleStore.enableSafeDropModel(this.state.Trips.TripID, this.state.Trips.ProgramType);
                                                        }
                                                    }
                                                ],
                                                { cancelable: true }
                                            );
                                        } else if (this.state.Trips.CheckinStatus === "2") {
                                            this.props.trackVehicleStore.enableSafeDropModel(this.state.Trips.TripID, this.state.Trips.ProgramType);
                                        } else {
                                            Alert.alert("Safe Drop", "You have already done safe drop for this trip");
                                        }
                                    } else {
                                        if (this.state.Trips.CheckinStatus === "0") {
                                            Alert.alert("Safe Drop", "Before Safe drop you must do the Check In");
                                        } else this.props.trackVehicleStore.enableSafeDropModel(this.state.Trips.TripID, this.state.Trips.ProgramType);
                                    }
                                } else {
                                    Alert.alert("Safe Drop", "You have already done safe drop for this trip");
                                }
                            }}
                        >{
                                this.state.CheckinCheckoutDisabled === false ?
                                    (this.state.Trips.SafeDropStatus === "0" && this.state.Trips.CheckinStatus === "0")
                                        ? <Image
                                            defaultSource={require("../assets/actions/Safedrop-grey.png")}
                                            source={require("../assets/actions/Safedrop-grey.png")}
                                            resizeMethod="scale"
                                            resizeMode="cover"
                                            style={styles.iconStyle}
                                        />
                                        : this.state.Trips.SafeDropStatus === "0"
                                            ? <Image
                                                defaultSource={require("../assets/actions/SafeDropgreen.png")}
                                                source={require("../assets/actions/SafeDropgreen.png")}
                                                resizeMethod="scale"
                                                resizeMode="cover"
                                                style={styles.iconStyle}
                                            />
                                            : <Image
                                                defaultSource={require("../assets/actions/Safedropblue.png")}
                                                source={require("../assets/actions/Safedropblue.png")}
                                                resizeMethod="scale"
                                                resizeMode="cover"
                                                style={styles.iconStyle}
                                            />
                                    : this.state.Trips.SafeDropStatus === "0" ? <Image
                                        defaultSource={require("../assets/actions/SafeDropgreen.png")}
                                        source={require("../assets/actions/SafeDropgreen.png")}
                                        resizeMethod="scale"
                                        resizeMode="cover"
                                        style={styles.iconStyle}
                                    />
                                        : <Image
                                            defaultSource={require("../assets/actions/Safedropblue.png")}
                                            source={require("../assets/actions/Safedropblue.png")}
                                            resizeMethod="scale"
                                            resizeMode="cover"
                                            style={styles.iconStyle}
                                        />
                            }
                        </TouchableDebounce>
                    )}

                    {userData.length > 0 && (<TouchableDebounce
                        style={styles.newButtonStyle}
                        onPress={() => {
                            this.setState({ disableFooter: true });
                            if (this.swipeUpDownRef) {
                                this.swipeUpDownRef.showFull();
                            }
                        }}
                    >
                        <MaterialCommunityIcons
                            name="account-group"
                            style={{ fontSize: 42, color: colors.GREEN }}
                        />
                    </TouchableDebounce>
                    )}
                    {this.state.ChatEnabled === "1" && (
                        <TouchableDebounce
                            style={styles.newButtonStyle}
                            onPress={() => {
                                this.props.navigation.navigate("ChatScreen", {
                                    TripID: this.state.Trips.TripID
                                });
                            }}
                        >
                            <MaterialCommunityIcons
                                name="chat"
                                style={{ fontSize: 42, color: colors.GREEN }}
                            />
                        </TouchableDebounce>
                    )}
                    <TouchableDebounce
                        style={styles.newButtonStyle}
                        onPress={() => {
                            setTimeout(() => {
                                this.props.trackVehicleStore.enableFeedBackModel()
                            }, 1000);
                        }}
                    >
                        {this.state.feedbackRating > 0 ?
                            <Image
                                defaultSource={require("../assets/actions/Feedbackfullblue.png")}
                                source={require("../assets/actions/Feedbackfullblue.png")}
                                resizeMethod="scale"
                                resizeMode="cover"
                                style={[styles.iconStyle, { width: 54, height: 54 }]}
                            /> :
                            <Image
                                defaultSource={require("../assets/actions/Feedbackfullgreen.png")}
                                source={require("../assets/actions/Feedbackfullgreen.png")}
                                resizeMethod="scale"
                                resizeMode="cover"
                                style={[styles.iconStyle, { width: 54, height: 54 }]}
                            />}
                    </TouchableDebounce>
                </View>
                {_renderDriverDetails(
                    Trip.DriverPhoto,
                    Trip.DriverName,
                    Trip.VehicleRegNo,
                    Trip.RouteNumber,
                    this.state.CustomerUrl,
                    this.state.UserId,
                    this,
                    false,
                    Trip.DriverTemp,
                    Trip.VehicleSanitizedDate,
                    this.state.Trips.Pin,
                    this.state.Trips.PinLabel,
                    this.state.Trips.hasOwnProperty('OTPType') ? this.state.Trips.OTPType : undefined,
                    this.state.Trips.CheckinStatus,
                    this.state.driverRating,
                    Trip.DriverVaccinationStatus

                )}
            </View>
        )
    }

    renderEmployeeListingUI(data) {
        return (
            <View>
                <View style={styles.panelContainer}>
                    <Text style={{
                        textAlign: 'center',
                        color: colors.BLUE,
                        margin: 8,
                        fontSize: 20
                    }}>
                        Swipe down to close
                    </Text>
                </View>
                <FlatList
                    data={data}
                    renderItem={({ item }) => (
                        <View style={{
                            backgroundColor: 'white',
                            paddingLeft: 16,
                            paddingRight: 16,
                            paddingBottom: 8,
                            paddingTop: 8,
                            alignSelf: "center",
                            flex: 1
                        }}>
                            <Text style={{
                                fontSize: 16,
                                color: item.me === 1 ? colors.GREEN : colors.BLUE
                            }}>{item.employeeName}</Text>
                        </View>
                    )}
                />
            </View>
        );
    }

    _renderFeedbackContent = (Trip) => (
        <View style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'stretch',
        }}>
            <Box
                style={{
                    width: "100%",
                    // height: "50%",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: colors.WHITE,
                    borderRadius: 8,
                    padding: 10
                }}
            >
                <HStack>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: '100%',
                            marginBottom: 10
                        }}
                    >
                        <Text style={styles.itemName}>
                            {Trip.TripType === "P" ? "Pickup" : "Drop"}
                        </Text>

                        <Text style={styles.itemName}>
                            {Trip.TripID}
                        </Text>
                    </View>
                </HStack>
                {/* <Box bordered> */}
                    <Stack>
                        <Text style={styles.itemLastMessage}>
                            Driver Name : {Trip.DriverName}
                        </Text>
                        <Text style={styles.itemLastMessage}>
                            Vehicle No. : {Trip.VehicleRegNo}
                        </Text>
                        <Text style={styles.itemLastMessage}>
                            {moment(Trip.ShiftTime, "DD-MM-YYYY HH:mm:ss").format("DD MMM YYYY hh:mmA")}
                        </Text>
                    </Stack>
                {/* </Box> */}
                {/* <Box
                    footer
                    bordered
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center"
                    }}
                > */}
                    {/* <StarRating
                        disabled={false}
                        emptyStar={"ios-star-outline"}
                        fullStar={"ios-star"}
                        halfStar={"ios-star-half"}
                        iconSet={"Ionicons"}
                        maxStars={5}
                        rating={
                            this.state.feedbackRating /*feedbackLast24hrTrip.feedbackRating
                        }
                        selectedStar={rating =>
                            this.onStarRatingPress(rating, Trip)
                        }
                        fullStarColor={colors.YELLOW}
                        starSize={35}
                        containerStyle={{
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    /> */}

                    <Rating
                        type='star'
                        ratingColor='#3498db'
                        ratingBackgroundColor='#c8c7c8'
                        ratingCount={5}
                        imageSize={30}
                        startingValue={
                            this.state.tempRating
                        }
                        onFinishRating={rating =>
                            this.onStarRatingPress(rating, Trip)
                        }
                        style={{ paddingVertical: 10 }}
                    />
                {/* </Box> */}
                {this.state.enableComment && (
                    <>
                    <Stack style={{flexDirection: "column", width: "100%", alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{width:"90%", paddingVertical:12, alignSelf:"center", fontSize: 16, color: colors.BLACK}} >Comments</Text>
                        <TextInput style={{width: "90%", padding: 12, alignSelf: "center", color: colors.BLACK}}
                        placeholder={"Comments (Optional)"}
                        maxLength={600}
                        multiline={true}
                        borderBottomWidth={1}
                        borderBottomColor={colors.BLACK}
                        ref= {(el) => { this.comment = el; }}
                        onChangeText={(comment) => {
                            if (comment != "" && checkSpecialCharacter(comment)) {
                                Toast.show("Special character are not allowed except -_.,:?*$@");
                            } else {
                                this.setState({comment})
                            }
                        }}
                        value={this.state.comment}
                        returnKeyType={'done'}
                        />
                    </Stack>
                    <View style={{flexDirection: 'row',width:'90%',padding:12,justifyContent:'flex-end'}}>
                        <Button style={{backgroundColor: colors.GREEN, width: '50%'}} onPress={() => {
                            this.onStarRatingPress(this.state.tempRating, Trip, true);
                        }}>
                            <Text>
                                Submit
                            </Text>
                        </Button>
                    </View>
                    </>
                )}
            </Box>
        </View>
    );

    _renderSafeDropContent = (Trip) => (
        <View style={{
            justifyContent: 'center',
            alignItems: 'stretch',
        }}>
            <KeyboardAvoidingView behavior="position">
                <Box
                    style={{
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 8,
                        backgroundColor: colors.WHITE,
                        padding: 10
                    }}
                >
                    <Box >
                        <Text1 style={{fontSize: 20, fontWeight: '600'}}>Safe Drop</Text1>
                    </Box>
                    {/* <Box> */}
                        <Stack style={{ flexDirection: "column", width: "100%" }}>
                            <Text1 style={{ width: "90%", padding: 12, alignSelf: "center" }} >{"Please enter the T-Pin "}</Text1>
                            <TextInput style={{ width: "90%", padding: 12, alignSelf: "center" }}
                                placeholder={"T-PIN"}
                                keyboardType={'number-pad'}
                                maxLength={4}
                                borderBottomWidth={1}
                                ref={(el) => { this.pin = el; }}
                                onChangeText={(pin) => this.setState({ pin })}
                                value={this.state.pin}
                                returnKeyType={'done'}
                            />
                        </Stack>
                    {/* </Box> */}
                    <View style={{ flexDirection: 'row', width: '100%', padding: 12, justifyContent: 'space-around' }}>
                        <Button backgroundColor={colors.RED} width={'45%'} onPress={() => {
                            this.props.trackVehicleStore.disableSafeDropModel();
                            this.setState({ pin: "" });
                        }}>
                            <Text1>Cancel</Text1>
                        </Button>
                        <Button backgroundColor={colors.GREEN} width={'45%'} onPress={() => {
                            if (this.state.pin.toString().length === 4) {
                                if (this.state.pin === Trip.TPin) {
                                    this.props.trackVehicleStore.trackVehicleSafeDrop().then((res) => {
                                        console.warn('Safedrop checkout -- ', res);
                                        Alert.alert(
                                            'Safe Drop',
                                            res.data?.status?.message,
                                            [
                                                {
                                                    text: "OK",
                                                    onPress: () => {
                                                        if (this.props.trackVehicleStore.TripId.length === 0) {
                                                            const trips = this.state.Trips;
                                                            trips.SafeDropStatus = "1";
                                                            trips.CheckinStatus = "2";
                                                            this.setState({ Trips: trips });
                                                        }
                                                        this.props.navigation.navigate("MyTripsMobx", {
                                                            feedbackTrip: 1
                                                        });
                                                    }
                                                }
                                            ],
                                            { cancelable: false }
                                        );
                                    }).catch((err) => {
                                        console.warn('safedrop error -- ', err);
                                        Alert.alert(
                                            'Safe Drop',
                                            loginString.somethingWentWrong,
                                            [
                                                {
                                                    text: "OK",
                                                    onPress: () => {
                                                        console.warn('close modal');
                                                    }
                                                }
                                            ],
                                            { cancelable: true }
                                        );
                                    });
                                } else {
                                    Alert.alert("Safe Drop", "Inavlid T-Pin");
                                }
                            } else {
                                Alert.alert("Safe Drop", "Please enter valid T-Pin ");
                            }
                        }}>
                            <Text1>
                                Submit
                            </Text1>
                        </Button>
                    </View>
                </Box>
            </KeyboardAvoidingView>
        </View>
    );

    _onRefresh() {
        //Dummy method to override Feedback method
    }
    showPreviousTripPopup() {
        setTimeout(() => {
            this.props.trackVehicleStore.enableFeedBackModel();
            this.setState({ tempRating: 0.0 });
        }, 1000);
    }
    onStarRatingPress(rating, item, directSubmit) {
        // console.warn('Trip item - ', item);
        //if (this.state.feedbackRating > 0) return;
        this.setState({ tempRating: rating }, () => {
            let date = moment(item.ShiftTime, "DD-MM-YYYY HH:mm:ss").format("YYYY-MM-DDTHH:mm:ss");
            let time = moment(item.ShiftTime, "DD-MM-YYYY HH:mm:ss").format("HH:mm");
            let body = {
                tripId: item.TripID,
                shiftDate: date,
                shiftTime: time,
                rating: rating,
                devicecode: this.state.UserId,
                categoryId: "",
                subCategoryId: "",
                comments: this.state.comment,
                apiurl: this.state.CustomerUrl
            };

            var additionalFB = false;
            var enableComment = false;
            var baseRating = 3;
            if (item.baseRating == "0") {
                baseRating = 0;
            } else if (Number(item.baseRating)) {
                baseRating = Number(item.baseRating);
            } 
            if(rating <= baseRating) additionalFB = true;
            if(!additionalFB && rating >= 4) enableComment = true;
            // console.warn('additionalFB - ', additionalFB, ' | enableComment - ', enableComment);
            // console.warn('body ', body);
            if (additionalFB) { // rating < 4
                this.props.trackVehicleStore.disableFeedBackModel();
                this.setState({
                    isLoading: true
                });
                let feedback = {
                    tripId: item.TripID,
                    shiftDate: date,
                    shiftTime: time,
                    rating: rating
                };
                API.newFetchXJSON(
                    URL.FEEDBACK_CATEGORIES +
                    "devicecode=" +
                    this.state.UserId +
                    "&apiurl=" +
                    this.state.CustomerUrl,
                    this.state.access_token,
                    this.callback.bind(this),
                    TYPE.FEEDBACK_CATEGORIES,
                    {
                        feedback,
                        Last24hrTrips: "TrackVehicle"
                    }
                );
            } else if (enableComment && !directSubmit) {
                this.setState({enableComment});
                return;
            } else {
                setTimeout(() => {
                    Alert.alert(
                        "Feedback",
                        "Do you want to submit the rating?",
                        [
                            {
                                text: "No",
                                onPress: () => {
                                    this.setState({ tempRating: 0.0, enableComment: false });
                                },
                                style: "cancel"
                            },
                            {
                                text: "Yes",
                                onPress: () => {
                                    this.setState({
                                        isLoading: true
                                    });
                                    API.newFetchJSON(
                                        URL.FEEDBACK_SUBMIT,
                                        body,
                                        this.state.access_token,
                                        this.callback.bind(this),
                                        TYPE.FEEDBACK_SUBMIT,
                                        {
                                            rating,
                                            Last24hrTrips: "TrackVehicle",
                                            lastRatedDate: "",
                                            tripId: body.tripId
                                        }
                                    );
                                }
                            }
                        ],
                        { cancelable: true }
                    );
                }, 500);
            }
        });
    }

    callback = async (actionType, response, copyDataObj) => {
        const { navigate } = this.props.navigation;
        switch (actionType) {
            case TYPE.FEEDBACK_CATEGORIES: {
                handleResponse.getFeedbackCategories(
                    response,
                    this,
                    navigate,
                    copyDataObj.feedback,
                    copyDataObj.Last24hrTrips
                );
                break;
            }
            case TYPE.FEEDBACK_SUBMIT: {
                this.props.trackVehicleStore.disableFeedBackModel();
                this.insertToStorage(copyDataObj.tripId, copyDataObj.rating);
                handleResponse.submitFeedback(
                    response,
                    this,
                    copyDataObj.rating,
                    copyDataObj.Last24hrTrips,
                    copyDataObj.lastRatedDate
                );
                break;
            }
        }
    };

    insertToStorage(tripId, rating) {
        let object = {
            tripId: tripId,
            rating: rating
        };
        AsyncStorage.getItem(asyncString.FEEDBACK, (err, result) => {
            if (result !== null) {
                // console.warn('Data Found' + result);
                let array = JSON.parse(result);
                // console.warn('Data ARRAY' + JSON.stringify(array));
                let hasData = true;
                array.map((item) => {
                    if (item.tripId === object.tripId) {
                        hasData = false;
                        this.setState({ feedbackRating: item.rating });
                    }
                });
                if (hasData) {
                    array.push(object);
                    this.setState({ feedbackRating: rating });
                }
                console.warn('ADDED ARRAY ' + JSON.stringify(array));
                AsyncStorage.setItem(asyncString.FEEDBACK, JSON.stringify(array));
            } else {
                console.warn('Data NOT Found');
                this.setState({ feedbackRating: rating });
                let array = [];
                array.push(object);
                AsyncStorage.setItem(asyncString.FEEDBACK, JSON.stringify(array));
            }
        });
    }

    getRatingForTrip(TripID) {
        AsyncStorage.getItem(asyncString.FEEDBACK, (err, result) => {
            if (result !== null) {
                let array = JSON.parse(result);
                array.map((item) => {
                    if (item.tripId === TripID) {
                        this.setState({ feedbackRating: item.rating });
                    }
                });
            }
        });
    }


    _renderCheckInModalContent = () => {
        return (
            <View style={styles.modalContent}>
                <RNSlidingButton
                    style={{
                        borderColor: colors.GREEN,
                        borderWidth: 1,
                        width: "100%",
                        backgroundColor: colors.GREEN,
                        bottom: 0
                    }}
                    height={70}
                    onSlidingSuccess={() => {
                        this.props.trackVehicleStore.trackVehicleDoCheckIn().then(() => {
                            console.warn('Trip id affter checkin -> ', this.props.trackVehicleStore.TripId.length);
                            if (this.state.CheckinCheckoutDisabled === false) { //  && this.props.trackVehicleStore.TripId.length === 0
                                this.getLatestTripDetails();
                            }
                        });
                    }}
                    slideDirection={SlideDirection.RIGHT}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "center",
                            alignContent: "center"
                        }}
                    >
                        <ActivityIndicator
                            color={colors.WHITE}
                            animating={this.props.trackVehicleStore.isLoading}
                        />
                        {this.props.trackVehicleStore.isLoading && (
                            <Text
                                numberOfLines={1}
                                style={{
                                    fontSize: 14,
                                    fontWeight: "normal",
                                    textAlign: "center",
                                    color: colors.WHITE,
                                    marginLeft: 10,
                                    marginTop: 3
                                }}
                            > CHECKING IN...
                            </Text>
                        )}
                        {!this.props.trackVehicleStore.isLoading && (
                            <Shimmer duration={2000}>
                            <View style={{ borderBottomWidth: 0, flexDirection: 'row', justifyContent: 'flex-start' }}>
                                {(Platform.OS == 'android')?<Text
                                        numberOfLines={1}
                                        style={{
                                            fontSize: 14,
                                            fontWeight: "normal",
                                            textAlign: "center",
                                            color: colors.WHITE,
                                            fontFamily: "Roboto",
                                            marginBottom:5
                                        }}
                                    >
                                        Slide right to Check-In 
                                        <Text
                                        style={{
                                            fontSize: 25,
                                            fontWeight: "700",
                                            color: colors.WHITE,
                                            fontFamily: "Roboto",
                                            marginHorizontal: 10,
                                            right:0,
                                        }}
                                    > &gt;&gt; 
                                    </Text>        
                                    </Text>:<><Text
                                   numberOfLines={1}
                                   style={{
                                       fontSize: 14,
                                       fontWeight: "normal",
                                       textAlign: "center",
                                       color: colors.WHITE,
                                       fontFamily: "Roboto",
                                       marginTop:5
                                   }}
                               >
                                   Slide right to Check-In
                                   </Text>
                                   <FontAwesome
                                        name="angle-double-right"
                                        style={{
                                            fontSize: 30,
                                            color: colors.WHITE,
                                            marginHorizontal: 10,
                                            marginBottom:20,
                                            

                                        }}
                                    />
                                    </>}
                              </View>
                                {/* <View style={{ borderBottomWidth: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            fontSize: 14,
                                            fontWeight: "normal",
                                            textAlign: "center",
                                            color: colors.WHITE,
                                            fontFamily: "Roboto",
                                            marginTop:5

                                        }}
                                    >
                                        Slide right to Check In
                                    </Text>
                                    <FontAwesome
                                        name="angle-double-right"
                                        style={{
                                            fontSize: 30,
                                            color: colors.WHITE,
                                            marginHorizontal: 10,
                                            marginBottom:20

                                        }}
                                    />
                                </View> */}
                            </Shimmer>
                        )}
                    </View>
                </RNSlidingButton>
            </View>
        );
    };
    _renderCheckOutModalContent = () => {
        return (
            <View style={styles.modalContent}>
                <RNSlidingButton
                    style={{
                        borderColor: colors.RED,
                        borderWidth: 1,
                        width: "100%",
                        backgroundColor: colors.RED,
                        bottom: 0
                    }}
                    height={70}
                    onSlidingSuccess={() => {
                        this.props.trackVehicleStore.trackVehicleDoCheckOut().then((res) => {
                            console.warn('Direct checkout -- ', res);
                            setTimeout(() => {
                                Alert.alert(
                                    'Check Out',
                                    res.data?.status?.message,
                                    [
                                        {
                                            text: "OK",
                                            onPress: () => {
                                                this.props.navigation.navigate("MyTripsMobx", {
                                                    feedbackTrip: 1
                                                });
                                                // if (this.state.CheckinCheckoutDisabled === false && this.props.trackVehicleStore.TripId.length === 0) {
                                                //     console.warn('trackVehicleDoCheckOut if cond - getLatestTripDetails');
                                                //     this.getLatestTripDetails();
                                                // }
                                            }
                                        }
                                    ],
                                    { cancelable: false }
                                );
                            }, 500);
                        }).catch((err) => {
                            console.warn('Direct checkout error -- ', err);
                            Alert.alert(
                                'Check Out',
                                loginString.somethingWentWrong,
                                [
                                    {
                                        text: "OK",
                                        onPress: () => {
                                            console.warn('close modal');
                                        }
                                    }
                                ],
                                { cancelable: true }
                            );
                        });
                    }}
                    slideDirection={SlideDirection.RIGHT}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "center",
                            alignContent: "center"
                        }}
                    >
                        <ActivityIndicator
                            color={colors.WHITE}
                            animating={this.props.trackVehicleStore.isLoading}
                        />
                        {this.props.trackVehicleStore.isLoading && (
                            <Text
                                numberOfLines={1}
                                style={{
                                    fontSize: 14,
                                    fontWeight: "normal",
                                    textAlign: "center",
                                    color: colors.WHITE,
                                    marginLeft: 10,
                                    marginTop: 3
                                }}
                            > CHECKING OUT...
                            </Text>
                        )}
                        {!this.props.trackVehicleStore.isLoading && (
                            <Shimmer duration={2000}>
                               <View style={{ borderBottomWidth: 0, flexDirection: 'row', justifyContent: 'flex-start' }}>
                                {(Platform.OS == 'android')?<Text
                                        numberOfLines={1}
                                        style={{
                                            fontSize: 14,
                                            fontWeight: "normal",
                                            textAlign: "center",
                                            color: colors.WHITE,
                                            fontFamily: "Roboto",
                                            marginBottom:5
                                        }}
                                    >
                                        Slide right to Check Out 
                                        <Text
                                        style={{
                                            fontSize: 25,
                                            fontWeight: "700",
                                            color: colors.WHITE,
                                            fontFamily: "Roboto",
                                            marginHorizontal: 10,
                                            right:0,
                                        }}
                                    > &gt;&gt; 
                                    </Text>        
                                    </Text>:<><Text
                                   numberOfLines={1}
                                   style={{
                                       fontSize: 14,
                                       fontWeight: "normal",
                                       textAlign: "center",
                                       color: colors.WHITE,
                                       fontFamily: "Roboto",
                                       marginTop:5
                                   }}
                               >
                                   Slide right to Check Out
                                   </Text>
                                   <FontAwesome
                                        name="angle-double-right"
                                        style={{
                                            fontSize: 30,
                                            color: colors.WHITE,
                                            marginHorizontal: 10,
                                            marginBottom:20,
                                            

                                        }}
                                    />
                                    </>}
                              </View>
                                {/* <View style={{ borderBottomWidth: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            fontSize: 14,
                                            fontWeight: "normal",
                                            textAlign: "center",
                                            color: colors.WHITE,
                                            fontFamily: "Roboto",
                                            marginTop:5

                                        }}
                                    > Slide right to Check Out
                                    </Text>
                                    <FontAwesome
                                        name="angle-double-right"
                                        style={{
                                            fontSize: 30,
                                            color: colors.WHITE,
                                            marginHorizontal: 10,
                                            marginBottom:20

                                        }}
                                    />
                                </View> */}
                            </Shimmer>
                        )}
                    </View>
                </RNSlidingButton>
            </View>
        );
    };
    _renderPanicModalContent = () => (
        <View style={styles.modalContent}>
            <RNSlidingButton
                style={{
                    borderColor: colors.RED,
                    borderWidth: 1,
                    width: "100%",
                    backgroundColor: colors.RED
                }}
                height={70}
                onSlidingSuccess={() => {
                    !this.state.isSliderLoading && this.props.trackVehicleStore.trackVehicleDoPanic();
                }}
                slideDirection={SlideDirection.RIGHT}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignContent: "center"
                    }}
                >
                    <ActivityIndicator
                        color={colors.WHITE}
                        animating={this.props.trackVehicleStore.isLoading}
                    />
                    {this.props.trackVehicleStore.isLoading && (
                        <Text
                            numberOfLines={1}
                            style={{
                                fontSize: 14,
                                fontWeight: "normal",
                                textAlign: "center",
                                color: colors.WHITE,
                                marginLeft: 10,
                                marginTop: 3
                            }}
                        >
                            Registering SOS...
                        </Text>
                    )}
                    {!this.props.trackVehicleStore.isLoading && (
                        <Shimmer duration={2000}>
                          <View style={{ borderBottomWidth: 0, flexDirection: 'row', justifyContent: 'flex-start' }}>
                                {(Platform.OS == 'android')?<Text
                                        numberOfLines={1}
                                        style={{
                                            fontSize: 14,
                                            fontWeight: "normal",
                                            textAlign: "center",
                                            color: colors.WHITE,
                                            fontFamily: "Roboto",
                                            marginBottom:5
                                        }}
                                    >
                                        Slide right to register SOS 
                                        <Text
                                        style={{
                                            fontSize: 25,
                                            fontWeight: "700",
                                            color: colors.WHITE,
                                            fontFamily: "Roboto",
                                            marginHorizontal: 10,
                                            right:0,
                                        }}
                                    > &gt;&gt; 
                                    </Text>        
                                    </Text>:<><Text
                                   numberOfLines={1}
                                   style={{
                                       fontSize: 14,
                                       fontWeight: "normal",
                                       textAlign: "center",
                                       color: colors.WHITE,
                                       fontFamily: "Roboto",
                                       marginTop:5
                                   }}
                               >
                                   Slide right to register SOS
                                   </Text>
                                   <FontAwesome
                                        name="angle-double-right"
                                        style={{
                                            fontSize: 30,
                                            color: colors.WHITE,
                                            marginHorizontal: 10,
                                            marginBottom:20,
                                            

                                        }}
                                    />
                                    </>}
                              </View>
                            {/* <View style={{ borderBottomWidth: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        fontSize: 14,
                                        fontWeight: "normal",
                                        textAlign: "center",
                                        color: colors.WHITE,
                                        fontFamily: "Roboto",
                                        marginTop:5

                                    }}
                                >
                                    Slide right to register SOS
                                </Text>
                                <FontAwesome
                                    name="angle-double-right"
                                    style={{ fontSize: 30, color: colors.WHITE,                                             marginHorizontal: 10,

                                        marginBottom:20
                                    }}
                                />
                            </View> */}
                        </Shimmer>
                    )}
                </View>
            </RNSlidingButton>
        </View>
    );

    checkPermissions() {
        if (Platform.OS === "android") {
            RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({ interval: 10000, fastInterval: 5000 })
                .then(requestStatus => {
                    try {
                        PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                            {
                                title: "Current Location Permission",
                                message:
                                    "Please allow us with current location permission"
                            }
                        ).then(granted => {
                            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                                Geolocation.getCurrentPosition((data) => {
                                    this.props.trackVehicleStore.setLocation(data.coords.latitude + "," + data.coords.longitude);
                                }, (Error) => {
                                    console.warn("Error " + JSON.stringify(Error));
                                });
                            } else {
                                Alert.alert(
                                    "Oops!",
                                    "Please give permission to access your location"
                                );
                            }
                        });
                        console.warn("requestStatus " + JSON.stringify(requestStatus));
                    } catch (err) {
                        this.props.trackVehicleStore.setLocation("0.0,0.0");
                        console.warn(err);
                    }
                }).catch(err => {
                    this.props.trackVehicleStore.setLocation("0.0,0.0");
                    console.warn("requestStatus " + JSON.stringify(err));
                });
        } else {
            Geolocation.requestAuthorization();
            Geolocation.getCurrentPosition((data) => {
                this.props.trackVehicleStore.setLocation(data.coords.latitude + "," + data.coords.longitude);
            }, (Error) => {
                console.warn("Error " + JSON.stringify(Error));
            });
        }
        check(Platform.OS === "ios" ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
            .then(result => {
                switch (result) {
                    case RESULTS.UNAVAILABLE:
                        this.props.trackVehicleStore.setLocation("0.0,0.0");
                        break;
                    case RESULTS.DENIED:
                        this.props.trackVehicleStore.setLocation("0.0,0.0");
                        break;
                    case RESULTS.GRANTED:
                        try {
                            Geolocation.getCurrentPosition((data) => {
                                this.props.trackVehicleStore.setLocation(data.coords.latitude + "," + data.coords.longitude);

                            }, (Error) => {
                                this.props.trackVehicleStore.setLocation("0.0,0.0");
                            }, { enableHighAccuracy: false, timeout: 50000 });
                        } catch (e) {
                            this.props.trackVehicleStore.setLocation("0.0,0.0");
                        }
                        break;
                    case RESULTS.BLOCKED:
                        this.props.trackVehicleStore.setLocation("0.0,0.0");
                        break;
                }
            })
            .catch(error => {

            });
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
    },
    icon_image_style: {
        width: 32,
        height: 38
    }, bottomModal: {
        justifyContent: "flex-end",
        margin: 0,
        flex: 1
    }, modalContent: {
        height: "25%",
        backgroundColor: "transparent",
        justifyContent: "flex-end",
        alignItems: "flex-end",
        borderRadius: 4,
        borderColor: "rgba(0, 0, 0, 0.1)"
    }, iconStyle: {
        width: 46,
        height: 46,
        borderRadius: 23
    }, buttonStyle: {
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 2, // Android
        position: "absolute",
        backgroundColor: colors.WHITE,
        height: 50,
        width: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center"
    }, newButtonStyle: {
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 6, // Android
        backgroundColor: colors.WHITE,
        height: 50,
        width: 50,
        margin: 8,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center"
    }, itemName: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.BLACK
    },
    itemLastMessage: {
        fontSize: 16,
        color: "#111"
    },

});
