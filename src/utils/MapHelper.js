import MapView, {AnimatedRegion, Marker} from "react-native-maps";
import {colors} from "./Colors";
import {ActivityIndicator,ImageBackground, Dimensions, Image, Platform, Text, View} from "react-native";
import React from "react";
import Polyline from "@mapbox/polyline";
import {appVersion} from "./ConstantString";
import { Stack, Box } from "native-base";
import {URL} from "../network/apiConstants";
import moment from "moment";
import TouchableDebounce from "./TouchableDebounce";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {API} from "../network/apiFetch/API";
import {handleResponse} from "../network/apiResponse/HandleResponse";
import emp_rm_pin from "../assets/emp_rm_pin2.png";
import office from "../assets/off_rm_pin.png";
import StarRating from "react-native-star-rating";
import { Rating } from "react-native-ratings";

const carIcon = require("../assets/ic_car_topview.png");
const carIcon20 = require("../assets/ic_car_topview_20.png");
const markerIDs = ["Marker1", "Marker2"];
const {width, height} = Dimensions.get("window");
const ratio = width / height;

export let intervalId;
export const mapDelta = {
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0922 * ratio
};
let toggle = true;

export var animationTimeout;
const EDGE_PADDING = {
    top: 30,
    right: 30,
    bottom: 30,
    left: 30
};
const EdgePaddingOptions = {
    edgePadding: EDGE_PADDING,
    animated: false // optional
};

export function focus(context, markers) {
    animationTimeout = setTimeout(() => {
        focusMap(markers ? markers : [markerIDs[0], markerIDs[1]], true, context);
    }, 100);
}

export function focusMap(markers, animated, context) {
    EdgePaddingOptions.animated = animated;
    if (context.map) context.map.fitToSuppliedMarkers(markers, EdgePaddingOptions);
}

export const autoTargetLocation = (
    checkinStatus,
    pickupLocation,
    dropLocation
) => {
    let location;
    if (checkinStatus && pickupLocation && dropLocation) {
        checkinStatus === "0"
            ? location = {
                latitude: convertToFloat(pickupLocation.split(",")[0]),
                longitude: convertToFloat(pickupLocation.split(",")[1])
            }
            : location = {
                latitude: convertToFloat(dropLocation.split(",")[0]),
                longitude: convertToFloat(dropLocation.split(",")[1])
            };
    }
    return location;
};
export const _renderEmployeeMarker = (location, context, status) => {
    if (location) {
        //console.warn("Employeee Loc:" + JSON.stringify(location));
        if (status) {
            return (
                <Marker.Animated
                    identifier="Marker1"
                    ref={marker => {
                        context.markerPickup = marker;
                    }}
                    coordinate={location}
                >
                    <Image
                        source={emp_rm_pin}
                        style={{
                            width: 30,
                            height: 38
                        }}
                    />
                </Marker.Animated>
            );
        } else {
            return (
                <Marker.Animated
                    identifier="Marker1"
                    ref={marker => {
                        context.markerPickup = marker;
                    }}
                    coordinate={location}
                >
                    <Image
                        source={office}
                        style={{
                            width: 30,
                            height: 38
                        }}
                    />
                </Marker.Animated>
            );
        }
    }
};

export function updateAndroidMarker(newCoordinate, timeout) {
    if (this.markerDriver != null && this.markerDriver._component)
        this.markerDriver._component.animateMarkerToCoordinate(
            newCoordinate,
            timeout
        );
}

export const _renderDriverMarker = (coordinate, computeHeading, isShuttle) => {
    if (coordinate && (parseInt(JSON.stringify(coordinate.latitude)) > 0) && (parseInt(JSON.stringify(coordinate.longitude)))) {
        return (
            <Marker.Animated
                identifier={isShuttle ? "shuttleMarker" : "Marker2"}
                ref={marker => {
                    this.markerDriver = marker;
                }}
                anchor={{position: "absolute", x: 0.5, y: 0.5}}
                coordinate={coordinate}
                style={{
                    width: 35,
                    height: 35,
                    justifyContent: "center",
                    alignItems: "center",
                    transform: [{rotate: computeHeading + "deg"}]
                }}
            >
                <Image
                    source={require("../assets/ic_car_topview.png")}
                    resizeMode="contain"
                    anchor={{position: "absolute", x: 0.5, y: 0.5}}
                    style={{flex: 1, transform: [{rotate: computeHeading + "deg"}]}}
                />

            </Marker.Animated>
        );
    }
};
export const _renderFixedDriverMarker = (coordinate, computeHeading) => {
    console.warn('DriverMarker ', coordinate);
    if (coordinate && (parseInt(JSON.stringify(coordinate.latitude)) > 0) && (parseInt(JSON.stringify(coordinate.longitude)))) {
        console.warn('DriverMarker In --- ', coordinate);
        // console.warn('global.busIcon -- ', global.busIcon);
        return (
            <Marker.Animated
                identifier={"WayPointMarker0"}
                ref={marker => {
                    this.markerDriver = marker;
                }}
                anchor={{position: "absolute", x: 0.5, y: 0.5}}
                coordinate={coordinate}
                style={{
                    width: 35,
                    height: 35,
                    justifyContent: "center",
                    alignItems: "center",
                    transform: [{rotate: computeHeading + "deg"}]
                }}
            >
                <Image
                    // source={{
                    //     uri: global.busIcon ? global.busIcon : "https://apk.routematic.com/icons/ic_bus.png"
                    // }}
                    source={require("../assets/ic_bus.png")}
                    resizeMode="contain"
                    anchor={{position: "absolute", x: 0.5, y: 0.5}}
                    style={{width: 30, height: 42, transform: [{rotate: computeHeading + "deg"}]}}
                />
            </Marker.Animated>
        );
    }
};

export function getRotation(prevPos, curPos) {
    if (!prevPos || !curPos) return 0;
    const xDiff = curPos.latitude - prevPos.latitude;
    const yDiff = curPos.longitude - prevPos.longitude;
    return (Math.atan2(yDiff, xDiff) * 180.0) / Math.PI;
}

export function computeHeading(start, end) {
    var lat1 = (start.latitude * Math.PI) / 180;
    var lat2 = (end.latitude * Math.PI) / 180;
    var lng1 = (start.longitude * Math.PI) / 180;
    var lng2 = (end.longitude * Math.PI) / 180;
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

const getDistance = (origins, destinations) => {
    let GmapKey = global.directionMapKey;
    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${
        origins.latitude
        },${origins.longitude}&destination=${destinations.latitude},${
        destinations.longitude
        }&mode=driving&avoid=highways&alternatives=true&key=${GmapKey}`;
    /* if(global.directionApiConfig===1){
       var a = parseFloat(origins.latitude)+0.001;
       var b = parseFloat(origins.longitude)+0.001;
       let waypoints = "waypoints=via:"+ a+","+b;
       url+="&departure_time="+(Math.round(new Date().getTime() / 1000))+10+"&"+waypoints;
     }*/
    return new Promise(function (resolve, reject) {
        fetch(url)
            .then(response => {
                return response.json();
            })
            .then(response => {
                //console.warn("Distance->" + parseFloat(response.rows[0].elements[0].distance.text));
                let distanceArray = [];
                response.routes.map(route => {
                    distanceArray.push(route.legs[0].distance.value);
                });
                let minDistanceKM = Math.min(...distanceArray) / 1000;
                return resolve(minDistanceKM);
            })
            .catch(async error => {
                console.warn(error.message);
                return reject(error.message);
            });
    });
};
let lastDirectionCalled;
let jsonresponse = {};

export function getDirectionsWithETA(context, startLoc, waypoints, destinationLoc) {
    if (lastDirectionCalled && ((new Date().getTime() / 1000) - lastDirectionCalled) < global.directionApiDuration) {
        if (jsonresponse) {
            let points = Polyline.decode(
                jsonresponse.routes[0].overview_polyline.points
            );
            let coords = points.map((point, index) => {
                return {
                    index: index.toString(),
                    latitude: point[0],
                    longitude: point[1]
                };
            });
            context.setState({
                direction: {
                    coords,
                    // eta: respJson.routes[0].legs[1]? respJson.routes[0].legs[1].duration.text : respJson.routes[0].legs[0].duration.text,
                    eta: jsonresponse.routes[0].legs[0].duration.text,
                    gotETA: true
                }
            });
        }
        return;
    }
    lastDirectionCalled = new Date().getTime() / 1000;
    let GmapKey = global.directionMapKey;
    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc.latitude.toString()},${startLoc.longitude.toString()}&destination=${
        destinationLoc.latitude
        },${destinationLoc.longitude}&mode=driving&key=${GmapKey}`;
    if (global.directionApiConfig === 1) {
        var a = parseFloat(startLoc.latitude) + 0.001;
        var b = parseFloat(startLoc.longitude) + 0.001;
        waypoints = "waypoints=via:" + a + "," + b;
        url += "&departure_time=" + (Math.round(new Date().getTime() / 1000)) + 10 + "&" + waypoints;
    }
    try {
        let respJson = {};
        fetch(url)
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                respJson = myJson;
                jsonresponse = myJson;
                console.warn("respJson : " + JSON.stringify(respJson));
                if (respJson.error_message) {
                    console.warn("respJson : " + JSON.stringify(jsonresponse));
                }

                let points = Polyline.decode(
                    jsonresponse.routes[0].overview_polyline.points
                );
                let coords = points.map((point, index) => {
                    return {
                        index: index.toString(),
                        latitude: point[0],
                        longitude: point[1]
                    };
                });
                context.setState({
                    direction: {
                        coords,
                        eta: jsonresponse.routes[0].legs[0].duration.text,
                        gotETA: true
                    }
                });

            });
    } catch (error) {
        console.warn("Error : " + JSON.stringify(error.message));
        return error;
    }
}

export function getGoogleDirectionsWithETA(context, startLoc, trackWayPoint, destinationLoc, data) {
    let GmapKey = global.directionMapKey;
    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc.latitude},${startLoc.longitude}&destination=${
        destinationLoc.latitude
        },${destinationLoc.longitude}&mode=driving&key=${GmapKey}`;
    if (global.directionApiConfig === 1) {
        var a = parseFloat(startLoc.latitude) + 0.001;
        var b = parseFloat(startLoc.longitude) + 0.001;
        let waypoints = "waypoints=via:" + a + "," + b;
        url += "&departure_time=" + (Math.round(new Date().getTime() / 1000)) + 10 + "&" + waypoints;
    }
    try {
        let respJson = {};
        fetch(url)
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                respJson = myJson;
                jsonresponse = myJson;
                if (respJson.error_message) {
                    console.warn("respJson : " + JSON.stringify(jsonresponse));
                }
                if (jsonresponse.routes.length > 0) {
                    let points = Polyline.decode(
                        jsonresponse.routes[0].overview_polyline.points
                    );
                    let coords = points.map((point, index) => {
                        return {
                            index: index.toString(),
                            latitude: point[0],
                            longitude: point[1]
                        };
                    });
                    let initialEta = jsonresponse.routes[0].legs[0].duration.value;
                    console.warn("First leg " + jsonresponse.routes[0].legs[0].duration.text);
                    let userIndex = data.employeeRouteIndex;
                    const dateFormat = "MM/DD/YYYY HH:mm:ss";
                    const shiftDateFormat = "DD-MM-YYYY HH:mm:ss";
                    let now = moment().format(dateFormat);
                    let count = 0;
                    if (context.state.Trips.TripType === "P") {
                        let lastIndex = points.length;
                        let maxIndex = lastIndex + trackWayPoint.length;
                        let j = 0;
                        for (let i = lastIndex; i < maxIndex; i++) {
                            if (j < trackWayPoint.length) {
                                let wayPoint = trackWayPoint[j];
                                if (wayPoint.proceed === 0 && wayPoint.skipped === 0) {
                                    coords.push({
                                        index: (i).toString(),
                                        latitude: parseFloat(wayPoint.latitude),
                                        longitude: parseFloat(wayPoint.longitude)
                                    });
                                }
                                j++;
                            }
                        }

                        if (context.state.Trips.CheckinStatus === "1") {
                            let i = coords.length;
                            let location = context.state.Trips.DestinationLocation.toString().split(",");
                            coords.push({
                                index: (i).toString(),
                                latitude: parseFloat(location[0]),
                                longitude: parseFloat(location[1])
                            });
                            let j = 0;
                            for (let i = 1; i < trackWayPoint.length; i++) {
                                if (i + 1 < trackWayPoint.length) {
                                    let previous = moment(trackWayPoint[j].expectedStartTime, dateFormat).format(dateFormat);
                                    let current = moment(trackWayPoint[i].expectedStartTime, dateFormat).format(dateFormat);
                                    let temp = moment(current).diff(previous, 'seconds');
                                    if (temp > 0)
                                        count += temp;
                                    j++;
                                } else {
                                    let last = trackWayPoint.length - 1;
                                    let previous = moment(trackWayPoint[last - 1].expectedStartTime, dateFormat).format(dateFormat);
                                    let current = moment(trackWayPoint[last].expectedStartTime, dateFormat).format(dateFormat);
                                    let temp = moment(current).diff(previous, 'seconds');
                                    if (temp > 0)
                                        count += temp;
                                    j++;
                                }
                                console.warn("count " + count);
                            }
                            if (trackWayPoint.length > 0) {
                                let last = trackWayPoint.length - 1;
                                let shiftTime = moment(context.state.Trips.ShiftTime, shiftDateFormat).format(dateFormat);
                                let current = moment(trackWayPoint[last].expectedStartTime, dateFormat).format(dateFormat);
                                let temp = moment(shiftTime).diff(current, 'seconds');
                                if (temp > 0)
                                    count += temp;
                            }
                            initialEta += count;
                        } else {
                            let j = 1;
                            for (let i = 0; i < trackWayPoint.length; i++) {
                                if (j < trackWayPoint.length && trackWayPoint[j].routeIndex <= userIndex) {
                                    let previous = moment(trackWayPoint[i].expectedStartTime, dateFormat).format(dateFormat);
                                    let current = moment(trackWayPoint[j].expectedStartTime, dateFormat).format(dateFormat);
                                    let temp = moment(current).diff(previous, 'seconds');
                                    if (temp > 0)
                                        count += temp;
                                    j++;
                                }
                            }
                            initialEta += count;
                        }
                    } else {
                        if (data.actualTripStartTime !== "") {
                            let actualTripStartTime = moment(data.actualTripStartTime, dateFormat).format(dateFormat);
                            if (moment(now).isSameOrAfter(actualTripStartTime)) {
                                let lastIndex = points.length;
                                let maxIndex = lastIndex + trackWayPoint.length;
                                let j = 0;
                                for (let i = lastIndex; i < maxIndex; i++) {
                                    let wayPoint = trackWayPoint[j];
                                    if (wayPoint.proceed === 0 && wayPoint.skipped === 0) {
                                        coords.push({
                                            index: (i).toString(),
                                            latitude: parseFloat(wayPoint.latitude),
                                            longitude: parseFloat(wayPoint.longitude)
                                        });
                                    }
                                    j++;
                                }
                                if (trackWayPoint.length > 0) {
                                    let j = 1;
                                    for (let i = 0; i < userIndex - 1; i++) {
                                        if (j < trackWayPoint.length && trackWayPoint[j].routeIndex <= userIndex) {
                                            let previous = moment(trackWayPoint[i].expectedEndTime, dateFormat).format(dateFormat);
                                            let current = moment(trackWayPoint[j].expectedEndTime, dateFormat).format(dateFormat);
                                            let temp = moment(current).diff(previous, 'seconds');
                                            if (temp > 0)
                                                count += temp;
                                            j++;
                                        }
                                    }
                                }
                                initialEta += count;
                            }
                        }
                    }
                    console.warn("initialEta " + initialEta);
                    let eta = Math.floor(initialEta / 60) + " min";
                    context.setState({
                        direction: {
                            coords,
                            eta,
                            gotETA: true
                        }
                    });
                }
            });
    } catch (error) {
        console.warn("Error : " + JSON.stringify(error.message));
        return error;
    }
}

export function getDirections(context, stops) {
    let URL = `${getStopsDirectionsUrl(stops)}&key=${global.directionMapKey}`;
    try {
        let respJson = {};
        fetch(URL)
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                respJson = myJson;
                if (respJson.error_message) {
                    console.warn("respJson : " + JSON.stringify(respJson));
                }
                let points = Polyline.decode(
                    respJson.routes[0].overview_polyline.points
                );
                //Adding Index
                let coords = points.map((point, index) => {
                    return {
                        index: index.toString(),
                        latitude: point[0],
                        longitude: point[1]
                    };
                });
                //Setting direction parameter
                context.setState({direction: {coords}});
            });
    } catch (error) {
        console.warn("Error : " + JSON.stringify(error.message));
        return error;
    }
}

export function getTrackingDataOnlyForVehicle(
    TrackeeID,
    context
) {
    if (!TrackeeID) return;
    let body = {
        id: TrackeeID,
        key: appVersion.TrackeeKey
    };
    fetch(URL.GET_TRACKING_DATA, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
        .then(response => response.json())
        .then(response => {
            let getTrackingData = response;
            if (getTrackingData.description) {
                context.setState({
                    gotDataFirstTime: true
                });
            }
            if (!getTrackingData.data) return;
            let latestIndex = Object.keys(getTrackingData.data).length - 1;
            let totalSize = latestIndex + 1;
            if (totalSize <= 0) {
                context.setState({
                    currentLocation: {
                        hasData: false
                    }
                });
                return;
            }
            let hasData = true; //totalSize === 5;
            let date = getTrackingData.data[latestIndex].ts;
            let newTime = moment(date, "DD-MM-YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
            let current15before = moment().subtract(15, "minutes").format("YYYY-MM-DD HH:mm:ss");
            /******************* Checking for Valid Tracking data 15 mins prior to current time *****************************/
            if (moment(newTime).isBefore(current15before)) {
                hasData = false;
            }
            if (!hasData) return;
            let lastSavedTime = moment(context.state.TrackingData.time, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
            context.setState({
                TrackingData: {
                    time: newTime,
                    isTracking: hasData
                }
            });
            if (lastSavedTime === "Invalid date") {
                context.setState({
                    cabLocation: new AnimatedRegion({
                        latitude: convertToFloat(getTrackingData.data[latestIndex].lat),
                        longitude: convertToFloat(getTrackingData.data[latestIndex].long),
                        latitudeDelta: 0, // -> added this
                        longitudeDelta: 0, // -> added this
                    }),
                    gotDataFirstTime: true,
                    currentLocation: {
                        latitude: convertToFloat(getTrackingData.data[latestIndex].lat),
                        longitude: convertToFloat(getTrackingData.data[latestIndex].long),
                        hasData: true
                    }
                });
            }
            /************************* Simple real time location move ***********************/
            for (let i = 0; i < totalSize - 1; i++) {
                let newTime = moment(getTrackingData.data[i].ts, "DD-MM-YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
                if (moment(newTime).isSameOrAfter(lastSavedTime)) {
                    if (!getTrackingData.data) return;
                    if (!getTrackingData.data[i].lat || !getTrackingData.data[i].long) {
                        return;
                    }
                    let currentPosition = {
                        latitude: convertToFloat(getTrackingData.data[i].lat),
                        longitude: convertToFloat(getTrackingData.data[i].long),
                        latitudeDelta: 0, // -> added this
                        longitudeDelta: 0, // -> added this
                    };
                    let rotation = hasData && getRotation(
                        {
                            latitude:
                                i === 0
                                    ? context.state.lastUpdatedLocation.latitude !== 0.0
                                    ? context.state.lastUpdatedLocation.latitude
                                    : getTrackingData.data[0].lat
                                    : convertToFloat(getTrackingData.data[i === latestIndex ? i - 1 : i].lat),
                            longitude:
                                i === 0
                                    ? context.state.lastUpdatedLocation.latitude !== 0.0
                                    ? context.state.lastUpdatedLocation.longitude
                                    : getTrackingData.data[0].long
                                    : convertToFloat(getTrackingData.data[i === latestIndex ? i - 1 : i].long)
                        },
                        {
                            latitude: convertToFloat(getTrackingData.data[i === latestIndex ? i : latestIndex > 0 ? i + 1 : i].lat),
                            longitude: convertToFloat(getTrackingData.data[i === latestIndex ? i : latestIndex > 0 ? i + 1 : i].long)
                        }
                    );
                    context.setState({
                        currentLocation: {
                            latitude: currentPosition.latitude,
                            longitude: currentPosition.longitude,
                            hasData: true
                        }
                    });
                    //Moving car
                    context.animate(currentPosition, rotation, 5000);
                }
            }

            /********************** End of Simple real time location move ***********************/
        });
}

export function getHqtTrackingData(TrackeeID, context) {
    console.warn('getHqtTrackingData ----- ', TrackeeID);
    if (!TrackeeID) return;
    let body = {
        id: TrackeeID,
        key: appVersion.TrackeeKey
    };

    fetch(URL.GET_TRACKING_DATA, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
        .then(response => response.json())
        .then(response => {
            let getTrackingData = response;
            console.warn('Tracking data ', getTrackingData);
            if (getTrackingData.description) {
                context.setState({
                    gotDataFirstTime: true
                });
            }
            if (!getTrackingData.data) return;
            let latestIndex = Object.keys(getTrackingData.data).length - 1;
            let totalSize = latestIndex + 1;
            if (totalSize <= 0) return;
            let hasData = true; //totalSize === 5;
            let date = getTrackingData.data[latestIndex].ts;
            let newTime = moment(date, "DD-MM-YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
            let current15before = moment().subtract(15, "minutes").format("YYYY-MM-DD HH:mm:ss");
            /******************* Checking for Valid Tracking data 15 mins prior to current time *****************************/
            if (moment(newTime).isBefore(current15before)) {
                console.warn("Has Data -- ", hasData);
                hasData = false;
            }
            let lastSavedTime = moment(context.state.TrackingData.time, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
            context.setState({
                TrackingData: {
                    time: newTime,
                    isTracking: hasData
                }
            });
            if (!hasData) return;
            console.warn('lastSavedTime ', lastSavedTime);
            if (lastSavedTime === "Invalid date") {
                context.setState({
                    cabLocation: new AnimatedRegion({
                        latitude: convertToFloat(getTrackingData.data[latestIndex].lat),
                        longitude: convertToFloat(getTrackingData.data[latestIndex].long),
                        latitudeDelta: 0, // -> added this
                        longitudeDelta: 0, // -> added this
                    }),
                    gotDataFirstTime: true,
                    currentLocation: {
                        latitude: convertToFloat(getTrackingData.data[latestIndex].lat),
                        longitude: convertToFloat(getTrackingData.data[latestIndex].long)
                    }
                });
            }
            let coords = [];
            coords.push({
                index: "0",
                latitude: convertToFloat(getTrackingData.data[latestIndex].lat),
                longitude: convertToFloat(getTrackingData.data[latestIndex].long)
            });
            let wpcoords = [];
            for (let i = 0; i < context.state.trackWayPoints.length; i++) {
                let wayPoint = context.state.trackWayPoints[i];
                if (wayPoint.wayPointStatus.status === 1) {
                    wpcoords.push({
                        index: (i + 1).toString(),
                        latitude: parseFloat(wayPoint.latitude),
                        longitude: parseFloat(wayPoint.longitude)
                    });
                }
            }
            context.setState({coords: coords, wpcoords: wpcoords});
            for (let i = 0; i < totalSize - 1; i++) {
                let newTime = moment(getTrackingData.data[i].ts, "DD-MM-YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
                if (moment(newTime).isSameOrAfter(lastSavedTime)) {
                    if (!getTrackingData.data) return;
                    if (!getTrackingData.data[i].lat || !getTrackingData.data[i].long) {
                        return;
                    }
                    let currentPosition = {
                        latitude: convertToFloat(getTrackingData.data[i].lat),
                        longitude: convertToFloat(getTrackingData.data[i].long),
                        latitudeDelta: 0, // -> added this
                        longitudeDelta: 0, // -> added this
                    };
                    let rotation =
                        hasData &&
                        getRotation(
                            {
                                latitude:
                                    i === 0
                                        ? context.state.lastUpdatedLocation.latitude !== 0.0
                                        ? context.state.lastUpdatedLocation.latitude
                                        : getTrackingData.data[0].lat
                                        : convertToFloat(
                                        getTrackingData.data[i === latestIndex ? i - 1 : i].lat
                                        ),
                                longitude:
                                    i === 0
                                        ? context.state.lastUpdatedLocation.latitude !== 0.0
                                        ? context.state.lastUpdatedLocation.longitude
                                        : getTrackingData.data[0].long
                                        : convertToFloat(
                                        getTrackingData.data[i === latestIndex ? i - 1 : i].long
                                        )
                            },
                            {
                                latitude: convertToFloat(
                                    getTrackingData.data[
                                        i === latestIndex ? i : latestIndex > 0 ? i + 1 : i
                                        ].lat
                                ),
                                longitude: convertToFloat(
                                    getTrackingData.data[
                                        i === latestIndex ? i : latestIndex > 0 ? i + 1 : i
                                        ].long
                                )
                            }
                        );
                    context.setState({
                        currentLocation: {
                            latitude: currentPosition.latitude,
                            longitude: currentPosition.longitude
                        }
                    });
                    context.animate(currentPosition, rotation, 5000);
                }
            }
        });
}

export function getTrackingData(
    TrackeeID,
    context,
    destinationLocation,
    isShttle
) {
    if (!TrackeeID) return;
    let body = {
        id: TrackeeID,
        key: appVersion.TrackeeKey
    };
    fetch(URL.GET_TRACKING_DATA, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
        .then(response => response.json())
        .then(response => {
            let getTrackingData = response;
            if (getTrackingData.description) {
                context.setState({
                    gotDataFirstTime: true
                });
            }
            if (!getTrackingData.data) return;
            let latestIndex = Object.keys(getTrackingData.data).length - 1;
            let totalSize = latestIndex + 1;
            if (totalSize <= 0) return;
            let hasData = true; //totalSize === 5;

            let date = getTrackingData.data[latestIndex].ts;
            let newTime = moment(date, "DD-MM-YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
            let current15before = moment().subtract(15, "minutes").format("YYYY-MM-DD HH:mm:ss");
            /******************* Checking for Valid Tracking data 15 mins prior to current time *****************************/
            if (moment(newTime).isBefore(current15before)) {
                hasData = false;
            }
            let lastSavedTime = moment(context.state.TrackingData.time, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
            context.setState({
                TrackingData: {
                    time: newTime,
                    isTracking: hasData
                }
            });
            if (!hasData) return;
            if (lastSavedTime === "Invalid date") {
                context.setState({
                    cabLocation: new AnimatedRegion({
                        latitude: convertToFloat(getTrackingData.data[latestIndex].lat),
                        longitude: convertToFloat(getTrackingData.data[latestIndex].long),
                        latitudeDelta: 0, // -> added this
                        longitudeDelta: 0, // -> added this
                    }),
                    gotDataFirstTime: true
                });
                if (!isShttle) {
                    let employeeRouteIndex = context.state.trackWayPointData.employeeRouteIndex;
                    let trackWayPoints = context.state.trackWayPoints;
                    if (context.state.Trips.TripType === "P") {
                        if (context.state.Trips.CheckinStatus === "1") {
                            getDirectionsWithETA(
                                context,
                                {
                                    latitude: getTrackingData.data[latestIndex].lat,
                                    longitude: getTrackingData.data[latestIndex].long
                                },
                                getWaypointsAfterCheckin(trackWayPoints, employeeRouteIndex),
                                destinationLocation
                            );
                        } else {
                            getDirectionsWithETA(
                                context,
                                {
                                    latitude: getTrackingData.data[latestIndex].lat,
                                    longitude: getTrackingData.data[latestIndex].long
                                },
                                getWaypointsBeforeCheckin(trackWayPoints, employeeRouteIndex),
                                destinationLocation
                            );
                        }
                    } else {
                        // trip started
                        if (context.state.trackWayPointData.hasOwnProperty("tripStartTime") && context.state.trackWayPointData.tripStartTime.length > 1) {
                            getDirectionsWithETA(
                                context,
                                {
                                    latitude: getTrackingData.data[latestIndex].lat,
                                    longitude: getTrackingData.data[latestIndex].long
                                },
                                [],
                                destinationLocation
                            );
                        } else {
                            getDirectionsWithETA(
                                context,
                                {
                                    latitude: context.state.Trips.PickupLocation.split(",")[0],
                                    longitude: context.state.Trips.PickupLocation.split(",")[1]
                                },
                                getWaypointsBeforeCheckin(trackWayPoints, employeeRouteIndex),
                                {
                                    latitude: getTrackingData.data[latestIndex].lat,
                                    longitude: getTrackingData.data[latestIndex].long
                                }
                            );
                        }
                    }
                }
            } else if (moment(newTime).isAfter(lastSavedTime)) {
                let lastUpdatedLocation = context.state.lastUpdatedLocation;
                let employeeRouteIndex = context.state.trackWayPointData.employeeRouteIndex;
                let trackWayPoints = context.state.trackWayPoints;
                if (!isShttle) {
                    if (context.state.Trips.TripType === "P") {
                        if (context.state.Trips.CheckinStatus === "1") {
                            getDirectionsWithETA(
                                context,
                                {
                                    latitude:
                                        lastUpdatedLocation.latitude !== 0.0
                                            ? lastUpdatedLocation.latitude
                                            : getTrackingData.data[0].lat,
                                    longitude:
                                        lastUpdatedLocation.latitude !== 0.0
                                            ? lastUpdatedLocation.longitude
                                            : getTrackingData.data[0].long
                                },
                                getWaypointsAfterCheckin(trackWayPoints, employeeRouteIndex),
                                destinationLocation
                            );
                        } else {
                            getDirectionsWithETA(
                                context,
                                {
                                    latitude:
                                        lastUpdatedLocation.latitude !== 0.0
                                            ? lastUpdatedLocation.latitude
                                            : getTrackingData.data[0].lat,
                                    longitude:
                                        lastUpdatedLocation.latitude !== 0.0
                                            ? lastUpdatedLocation.longitude
                                            : getTrackingData.data[0].long
                                },
                                getWaypointsBeforeCheckin(trackWayPoints, employeeRouteIndex),
                                destinationLocation
                            );
                        }
                    } else {
                        // trip started
                        if (context.state.trackWayPointData.hasOwnProperty("tripStartTime") && context.state.trackWayPointData.tripStartTime.length > 1) {
                            getDirectionsWithETA(
                                context,
                                {
                                    latitude: getTrackingData.data[latestIndex].lat,
                                    longitude: getTrackingData.data[latestIndex].long
                                },
                                [],
                                destinationLocation
                            );
                        } else {
                            getDirectionsWithETA(
                                context,
                                {
                                    latitude: context.state.Trips.PickupLocation.split(",")[0],
                                    longitude: context.state.Trips.PickupLocation.split(",")[1]
                                },
                                getWaypointsBeforeCheckin(trackWayPoints, employeeRouteIndex),
                                {
                                    latitude: getTrackingData.data[latestIndex].lat,
                                    longitude: getTrackingData.data[latestIndex].long
                                }
                            );
                        }
                    }
                }
            }
            /************************* Simple real time location move ***********************/
            for (let i = 0; i < totalSize - 1; i++) {
                let newTime = moment(getTrackingData.data[i].ts, "DD-MM-YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
                if (moment(newTime).isSameOrAfter(lastSavedTime)) {
                    if (!getTrackingData.data) return;
                    if (!getTrackingData.data[i].lat || !getTrackingData.data[i].long) {
                        return;
                    }
                    let currentPosition = {
                        latitude: convertToFloat(getTrackingData.data[i].lat),
                        longitude: convertToFloat(getTrackingData.data[i].long),
                        latitudeDelta: 0, // -> added this
                        longitudeDelta: 0, // -> added this
                    };

                    //Getting rotation
                    let rotation = hasData && getRotation(
                        {
                            latitude:
                                i === 0
                                    ? context.state.lastUpdatedLocation.latitude !== 0.0
                                    ? context.state.lastUpdatedLocation.latitude
                                    : getTrackingData.data[0].lat
                                    : convertToFloat(getTrackingData.data[i === latestIndex ? i - 1 : i].lat),
                            longitude:
                                i === 0
                                    ? context.state.lastUpdatedLocation.latitude !== 0.0
                                    ? context.state.lastUpdatedLocation.longitude
                                    : getTrackingData.data[0].long
                                    : convertToFloat(getTrackingData.data[i === latestIndex ? i - 1 : i].long)
                        },
                        {
                            latitude: convertToFloat(getTrackingData.data[i === latestIndex ? i : latestIndex > 0 ? i + 1 : i].lat),
                            longitude: convertToFloat(getTrackingData.data[i === latestIndex ? i : latestIndex > 0 ? i + 1 : i].long)
                        }
                    );
                    //Moving car
                    context.animate(currentPosition, rotation, 5000);
                }
            }

            /********************** End of Simple real time location move ***********************/
        });
}

function getWaypoints(trackWayPoints) {
    let waypointsData = [];
    for (let i = 0; i < trackWayPoints.length; i++) {
        let wayPoint = trackWayPoints[i];
        if (wayPoint.reached === 0 && wayPoint.proceed === 0 && wayPoint.skipped === 0) waypointsData.push(wayPoint);
    }
    return waypointsData;
}

function getWaypointsBeforeCheckin(trackWayPoints, employeeRouteIndex) {
    let waypointsData = [];
    for (let i = 0; i < employeeRouteIndex - 1; i++) {
        waypointsData.push(trackWayPoints[i]);
    }
    console.warn("before " + JSON.stringify(waypointsData));
    return waypointsData;
}

function getWaypointsAfterCheckin(trackWayPoints, employeeRouteIndex) {
    let waypointsData = [];
    for (let i = employeeRouteIndex; i < trackWayPoints.length; i++) {
        waypointsData.push(trackWayPoints[i]);
    }
    console.warn("after " + JSON.stringify(waypointsData));
    return waypointsData;
}

this.callDriver = async function (context, CustomerUrl, UserId) {
    context.setState({isLoading: true});
    let body = {
        CustomerUrl: CustomerUrl,
        userId: UserId
    };
    console.warn('Call Driver - ', body);
    let response = API.fetchJSON(URL.IVR, body, false);
    handleResponse.callDriver(response, context);
};
export const _renderDriverDetails = (
    DriverPhoto,
    DriverName,
    VehicleRegNo,
    RouteNumber,
    CustomerUrl,
    UserId,
    context,
    isShuttle,
    DriverTemp,
    VehicleSanitizedDate,
    Pin,
    PinLabel,
    OTPType,
    CheckinStatus,
    driverRating,
    DriverVaccinationStatus
) => {
    let time = moment(VehicleSanitizedDate, "DD-MM-YYYY HH:mm:ss").format('DD MMM hh:mm A');
    let driverTemp =(DriverTemp && DriverTemp !== null)?(" (" + DriverTemp + "\u00b0F )"):" ";
    let pinText = PinLabel==="OTP"
        ? OTPType==="CI"?"Check In OTP : "+Pin:"Check Out OTP : "+Pin
        :PinLabel + " : " + Pin;
    let getImage = "";
    if(DriverVaccinationStatus==="Not Vaccinated"){
        getImage = require("../assets/photo_image.png");
    }else if(DriverVaccinationStatus==="Partially Vaccinated"){
        getImage = require("../assets/dashboard/partiallyVaccine.png");
    }else if(DriverVaccinationStatus==="Fully Vaccinated"){
        getImage = require("../assets/dashboard/fullyVaccine.png");
    }

    return (
        <View style={{
            flex:1,
            padding:4,
            flexDirection: "column",
            alignItems: 'center'
        }}>
            {(CheckinStatus !=="2" && PinLabel != null && Pin != null) && (
                <View style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    padding: 3,
                    backgroundColor: colors.YELLOW
                }}>
                    <Text
                        style={{
                            fontSize: 12,
                            color: colors.BLACK
                        }}>
                        {pinText}
                    </Text>
                </View>)}
        <View
            style={{
                flex:1,
                padding:4,
                flexDirection: "row",
                alignItems: 'center'

            }}
        >
            <View style={{flexDirection:'column'}}>
                {DriverVaccinationStatus && DriverVaccinationStatus!=null?
                    (
                        <ImageBackground
                            source={getImage}
                            style={{
                                width: 90,
                                height: 70,
                                alignContent: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Image
                                source={{uri: DriverPhoto}}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    alignContent: 'center',
                                    alignSelf: 'center',
                                    marginBottom: 9,
                                }}
                            />
                        </ImageBackground>
                    )
                    :(
                <Image
                    source={{
                        uri: DriverPhoto
                    }}
                    resizeMethod="scale"
                    resizeMode="cover"
                    style={{width: 60, height: 60, borderRadius: 30,borderColor:colors.GREEN,borderWidth:1}}
                />)}
            </View>

            <View
                style={{
                    flexDirection: "column",
                    marginTop: 5,
                    marginLeft: 10,
                    flex: 5,
                    alignItems: 'flex-start',
                    justifyContent: 'center'

                }}
            >
                <Text
                    style={{
                        fontSize: 12,
                        fontFamily: "Roboto",
                        color: colors.BLACK
                    }}
                >
                    {DriverName+driverTemp}

                    </Text>
                    <Text
                        style={{
                            fontSize: 12,
                            fontFamily: "Roboto",
                            color: colors.BLACK
                        }}
                    >
                        {RouteNumber != null ? VehicleRegNo + "(" + RouteNumber + ")" : VehicleRegNo}
                    </Text>
                    {VehicleSanitizedDate != null && (<Text
                        style={{ fontSize: 12, color: colors.BLACK }}
                    >
                        {"Sanitized Dt : " + time}
                    </Text>)}
                    {driverRating != null &&
                        (
                            // <StarRating
                            //     disabled={true}
                            //     emptyStar={"star-outline"}
                            //     fullStar={"star"}
                            //     halfStar={"star-half"}
                            //     iconSet={"Ionicons"}
                            //     maxStars={5}
                            //     rating={
                            //         driverRating
                            //     }
                            //     fullStarColor={colors.YELLOW}
                            //     starSize={26}
                            //     containerStyle={{
                            //         flexDirection: "row",
                            //         justifyContent: "space-between",
                            //         alignItems: "center"
                            //     }}
                            // />
                            <Rating
                                type='star'
                                ratingColor='#3498db'
                                ratingBackgroundColor='#c8c7c8'
                                ratingCount={5}
                                imageSize={20}
                                startingValue={
                                    driverRating
                                }
                                style={{ paddingVertical: 10 }}
                            />
                        )}
                </View>

            {!isShuttle && (
                <View>
                    <TouchableDebounce
                        style={{
                            justifyContent: "center",
                            alignItems: "center",
                            alignSelf: 'center',
                            width: 50,
                            height: 50
                        }}
                        onPress={() => {
                            this.callDriver(context, CustomerUrl, UserId);
                        }}
                    >
                        {context.state.isLoading ? (
                            <ActivityIndicator color={colors.BLACK} animating={true}/>
                        ) : (
                            <MaterialIcons
                                name="call"
                                style={{
                                    fontSize: 40,
                                    color: colors.GREEN,
                                    alignSelf: "center",
                                    position: "absolute",
                                }}
                            />
                        )}
                    </TouchableDebounce>
                </View>
            )}
        </View>
        </View>
    );
};

export const _renderFixedRouteDriverDetails = (
    DriverPhoto,
    DriverName,
    VehicleRegNo,
    RouteNumber,
    CallDriverEnabled,
    context
) => {
    return (
        <Box style={{ flex: 1, bottom: 0 }}>
            <Box>
                <Stack>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: 'center',
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                alignItems: "center",
                                width: "80%"
                            }}
                        >
                            <Image
                                source={{
                                    uri: DriverPhoto
                                }}
                                resizeMethod="scale"
                                resizeMode="cover"
                                style={{ width: 60, height: 60, borderRadius: 30 }}
                            />
                            <View>
                                <Text
                                    style={{
                                        marginLeft: 10,
                                        fontSize: 14,
                                        fontWeight: "500",
                                        fontFamily: "Roboto",
                                        color: colors.BLACK
                                    }}
                                >
                                    {DriverName}
                                </Text>
                                <Text
                                    style={{
                                        marginLeft: 10,
                                        fontSize: 12,
                                        fontWeight: "400",
                                        fontFamily: "Roboto",
                                        color: colors.BLACK
                                    }}
                                >
                                    {VehicleRegNo}
                                </Text>
                                <Text
                                    style={{
                                        marginLeft: 10,
                                        fontSize: 12,
                                        fontWeight: "400",
                                        color: colors.BLACK
                                    }}
                                >
                                    {RouteNumber}
                                </Text>
                            </View>
                        </View>
                        {CallDriverEnabled == 1 && (
                            <View>
                                <TouchableDebounce
                                    style={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                        alignSelf: 'center',
                                        width: 50,
                                        height: 50
                                    }}
                                    onPress={() => {
                                        this.callDriver(context, context.state.CustomerUrl, context.state.UserId);
                                    }}
                                >
                                    {context.state.isLoading ? (
                                        <ActivityIndicator color={colors.BLACK} animating={true}/>
                                    ) : (
                                        <MaterialIcons
                                            name="call"
                                            style={{
                                                fontSize: 40,
                                                color: colors.GREEN,
                                                alignSelf: "center",
                                                position: "absolute",
                                            }}
                                        />
                                    )}
                                </TouchableDebounce>
                            </View>
                        )}
                    </View>
                </Stack>
            </Box>
        </Box>
    );
};
export const _renderEtaGpsTime = (
    CheckinStatus,
    isTracking,
    gotETA,
    eta,
    gotDataFirstTime,
    context
) => {
    // if (!eta) return;
    return (
        <View
            style={{
                flexDirection: "column",
                justifyContent: "flex-start",
                //alignItems: "center",
                width: "90%",
                marginTop: 10
            }}
        >
            {gotDataFirstTime && (
                <Text
                    style={{
                        color: colors.BLACK,
                        fontWeight: "500",
                        fontSize: isTracking ? 15 : 13,
                        fontFamily: "Roboto",
                        width: "100%"
                    }}
                >
                    {!isTracking
                        ? "Tracking data is not available please call driver"
                        : getMessage(context, eta)}
                </Text>
            )}
            {!gotDataFirstTime && (
                <Text
                    style={{
                        color: colors.BLACK,
                        fontWeight: "500",
                        fontSize: 15,
                        fontFamily: "Roboto"
                    }}
                >
                    {"Fetching Location. Please Wait..."}
                </Text>
            )}
        </View>
    );
};
export const _renderGPSTime = (isTracking, datetime) => {
    console.warn('_renderGPSTime - ', datetime);
    var _time = "";
    if (datetime) {
        var timestr = datetime.split(" ")[1].split(":");
        console.warn('time str - ', timestr);
        _time = timestr[0] + ":" + timestr[1];
    }
    return (
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
            <Text
                style={{
                    color: colors.WHITE,
                    fontWeight: "700",
                    fontSize: 12,
                    fontFamily: "Roboto"
                }}
            >
                {isTracking && ("GPS Time " +  _time)}
                {!isTracking && "Tracking data is not available please call driver" }
            </Text>
        </View>
    );
};

function getMessage(context, eta) {
    let userWayPoint = {};
    if (context.state.trackWayPointData.hasOwnProperty("employeeRouteIndex") && context.state.trackWayPoints) {
        context.state.trackWayPointData.wayPoints.map((data) => {
            if (data.routeIndex === context.state.trackWayPointData.employeeRouteIndex) {
                userWayPoint = data;
            }
        });
        if (context.state.Trips.TripType === "P") {
            if (context.state.Trips.CheckinStatus === "0") {
                if (userWayPoint.skipped === 1) {
                    return "Driver skipped your pickup ";
                } else if (userWayPoint.proceed === 1) {
                    return "Vehicle left your pickup point, Please check-in if you have boarded";
                } else {
                    return "Arriving in " + eta;
                }
            } else
                return "Reaching destination in " + eta
        } else {
            if (context.state.Trips.CheckinStatus === "0") {// not checked in
                let actual = context.state.trackWayPointData.actualTripStartTime;
                if (actual && actual.toString().length > 0) {
                    let triptime = moment(actual, "MM/DD/YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
                    let currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
                    if (moment(currentTime).isSameOrAfter(triptime)) {
                        return "Vehicle left , Please check-in if you have boarded"
                    } else {//trip not started
                        return "Arriving in " + eta;
                    }
                } else {//trip not started
                    return "Arriving in " + eta;
                }
            } else {// checked in
                if (userWayPoint.reached === 0 && userWayPoint.skipped === 0) {
                    return "Reaching destination in " + eta
                } else if (userWayPoint.reached === 1) {
                    return "Reached your location"
                }
            }
        }
    }
}

// Convert Degress to Radians
function Deg2Rad(deg) {
    return (deg * Math.PI) / 180;
}

function PythagorasEquirectangular(lat1, lon1, lat2, lon2) {
    lat1 = Deg2Rad(lat1);
    lat2 = Deg2Rad(lat2);
    lon1 = Deg2Rad(lon1);
    lon2 = Deg2Rad(lon2);
    var R = 6371; // km
    var x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
    var y = lat2 - lat1;
    return Math.sqrt(x * x + y * y) * R;
}

export function nearestLocation(latitude, longitude, locations) {
    var mindif = 99999;
    var closest;

    for (let index = 0; index < locations.length; ++index) {
        var dif = PythagorasEquirectangular(
            latitude,
            longitude,
            locations[index][1],
            locations[index][2]
        );
        if (dif < mindif) {
            closest = index;
            mindif = dif;
        }
    }

    // return the nearest location
    var closestLocation = locations[closest];
    console.warn('The closest location is ' + closestLocation[0]);
    return closestLocation;
}

function convertToFloat(x) {
    if (x) return parseFloat(x);
}

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    /* var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;*/
    return new Promise(function (resolve, reject) {
        getDistance(
            {latitude: lat1.toString(), longitude: lon1.toString()},
            {latitude: lat2.toString(), longitude: lon2.toString()}
        ).then(distanceKm => resolve(distanceKm));
    });
};

// Converts numeric degrees to radians[
function toRad(Value) {
    return (Value * Math.PI) / 180;
}

function getDirectionsUrl(origin, dest, markerPoints) {
    // Origin of route
    let str_origin = "origin=" + origin.latitude + "," + origin.longitude;

    // Destination of route
    let str_dest = "destination=" + dest.latitude + "," + dest.longitude;

    // Sensor enabled
    let sensor = "sensor=false";

    // Waypoints
    let waypoints = "";
    for (let i = 2; i < markerPoints.size(); i++) {
        let point = markerPoints.get(i);
        if (i == 2) waypoints = "waypoints=";

        waypoints += point.latitude + "," + point.longitude + "|";
    }

    // Building the parameters to the web service
    let parameters = str_origin + "&" + str_dest + "&" + sensor + "&" + waypoints;
    if (global.directionApiConfig === 1)
        parameters += "&departure_time=" + (Math.round(new Date().getTime() / 1000));
    // Output format
    let output = "json";

    // Building the url to the web service
    let url =
        "https://maps.googleapis.com/maps/api/directions/" +
        output +
        "?" +
        parameters;

    console.log("Google API 3" + JSON.stringify(url))

    return url;
}

export const getStopsDirectionsUrl = stops => {
    if (!stops || stops.length <= 0) return;
    let startPoint = stops[0];
    let endPoint = stops[stops.length - 1];
    let newArr = stops.filter((item, index) => {
        console.warn(index, item.wayPointName);
        return index !== 0 && index !== stops.length - 1;
    });
    console.warn("waypoindt->" + JSON.stringify(newArr));

    // Origin of route
    let str_origin =
        "origin=" + startPoint.wayPointLat + "," + startPoint.wayPointLng;

    // Destination of route
    let str_dest =
        "destination=" + endPoint.wayPointLat + "," + endPoint.wayPointLng;

    // Sensor enabled
    let sensor = "sensor=false";

    // Waypoints
    let waypoints = "";
    for (let i = 0; i < newArr.length; i++) {
        let point = newArr[i];
        if (i === 0) waypoints = "waypoints=";
        waypoints += point.wayPointLat + "," + point.wayPointLng + "|";
    }

    // Building the parameters to the web service
    let parameters = str_origin + "&" + str_dest + "&" + sensor + "&" + waypoints;
    if (global.directionApiConfig === 1)
        parameters += "&departure_time=" + (Math.round(new Date().getTime() / 1000));
    // Output format
    let output = "json";

    // Building the url to the web service
    let url =
        "https://maps.googleapis.com/maps/api/directions/" +
        output +
        "?" +
        parameters;
    console.log("Google API 4" + JSON.stringify(url))
    return url;
};
