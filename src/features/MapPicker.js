import React, {Component} from "react";
import {
    Alert,
    Animated,
    AppRegistry,
    BackHandler,
    Dimensions,
    Image,
    PermissionsAndroid,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomModalFilterPicker from "./CustomModalFilterPicker";
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import {GooglePlacesInput} from "./GooglePlacesAutocomplete";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import * as Toast from "../utils/Toast";
import {asyncString} from "../utils/ConstantString";
import MapView, {Callout, Marker, Polyline, PROVIDER_GOOGLE} from "react-native-maps";
import {Button, Icon, Text} from "native-base";
import {colors} from "../utils/Colors";
import TouchableDebounce from "../utils/TouchableDebounce";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {animationTimeout, calculateDistance, mapDelta} from "../utils/MapHelper";
import Geolocation from '@react-native-community/geolocation';
import SafeAreaView from "react-native-safe-area-view";

const markerIDs = ["Marker1", "Marker2"];

export default class MapPicker extends Component {
    static navigationOptions = ({navigation}) => {
        return {title: "Routematic", headerStyle: {display: "none"}};
    };
    callBack = result => {
        console.warn('Geo callback result -> ', result);
        let place = result.geometry?.location;
        this.setState(
            {
                goingBackAllowed: false,
                showGooglePlacesSearch: false,
                selectedLocation: result.formatted_address,
                selectLat: place.lat,
                selectLng: place.lng
            },
            () => {
                this.goToLocation(place.lat, place.lng);
            }
        );
    };
    componentWillUnmount = () => {
        BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
        if (this.focusCluster) {
            clearTimeout(this.focusCluster);
            this.focusCluster = 0;
        }
    };
    handleBackPress = () => {
        //console.warn("notAllowedGoingBack->" + this.state.notAllowedGoingBack);
        return this.state.notAllowedGoingBack;
    };
    onSelect = picked => {
        let result = findLatLngFromName(picked, this.state.StaffLocations);
        if (!result) {
            alert("Location not found");
            return;
        }

        this.setState({
            picked: picked,
            selectedLocation: picked,
            visible: false,
            selectLat: result.lat,
            selectLng: result.lng
        });

        this.goToLocation(parseFloat(result.lat), parseFloat(result.lng));
        // if (this.checkClusterRadius()) {
        //   focus(this);
        // }
    };
    onCancel = () => {
        this.setState({visible: false});
    };
    /************************* Search Nodal Points ************************/
    onShow = () => {
        this.setState({visible: true});
    };

    constructor(props, ctx) {
        super(props, ctx);
        this.state = {
            showGooglePlacesSearch: false,
            region: {latitude: 0.0, longitude: 0.0, ...mapDelta},
            coordinate: {latitude: 0.0, longitude: 0.0},
            selectedLocation: "",
            selectLat: "",
            selectLng: "" /******************** Nodal Point ********************/,
            visible: false,
            picked: null,
            showNodalPoint: this.props.route.params.showNodalPoint ? this.props.route.params.showNodalPoint : false,
            StaffLocations: this.props.route.params.StaffLocations ? this.props.route.params.StaffLocations : [],
            nodalPoints: [],
            enableCurrentLocation: false,
            clusterDetails: {
                Clusterlat: "0.0",
                Clusterlng: "0.0",
                Clusterradius: 0.0,
                ClusterOutOfRadiusMsg: ""
            },
            title:undefined,
            distanceFromOffice: "",
            fromProfile: false,
            notAllowedGoingBack: false /*{
        Clusterlat: "12.9201596",
        Clusterlng: "77.6512411",
        Clusterradius: 90.0,
        ClusterOutOfRadiusMsg:
          "Your location is outside the permissible radius setup by your transport team. Please reach out to your organization's transport team for any questions."
      }*/
        };
        /******************** End Nodal point *******************/
        Geolocation.setRNConfiguration({
            authorizationLevel: 'always',
            skipPermissionRequests: false,
        });
    }

    checkClusterRadius() {
        console.warn('checkClusterRadius -- ', this.state.clusterDetails);
        return !!(
            this.state.clusterDetails.Clusterlat &&
            this.state.clusterDetails.Clusterlat !== "0.0"
        );
    }

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
        /******************** Pushing Nodal Point ********************/
        let locationNameArray = [];
        let nodalDisplayarray = [];
        let i;
        let size = Object.keys(this.state.StaffLocations).length;
        if (size == 0) return;
        for (i = 0; i < size; i++) {
            locationNameArray.push({
                key: this.state.StaffLocations[i].Name,
                label: this.state.StaffLocations[i].Name + " [ Nodal Points ]"
            });
        }
        this.setState({
            nodalPoints: locationNameArray
            //showNodalPoint: this.props.route.params.showNodalPoint", false)
        });
        /******************** End of Pushing Nodal Point ********************/
    }

    UNSAFE_componentWillMount() {
        AsyncStorage.getItem(
            asyncString.IS_VERIFY_GEO_CODE_ENABLED,
            (err, result) => {
                if (result === "true") {
                    this.setState({
                        notAllowedGoingBack: true
                    });
                } else {
                    this.setState({
                        notAllowedGoingBack: false
                    });
                }
            }
        );
        let enableCurrentLocation = this.props.route.params.enableCurrentLocation ? this.props.route.params.enableCurrentLocation : false;

        let clusterDetails = this.props.route.params.clusterDetails ? this.props.route.params.clusterDetails : {
            Clusterlat: "0.0",
            Clusterlng: "0.0",
            Clusterradius: 0.0,
            ClusterOutOfRadiusMsg: ""
        };

        let title = this.props.route.params?.title;
        let fromProfile = this.props.route.params ? this.props.route.params.fromProfile : false;
        this.setState({
            showNodalPoint: this.props.route.params.showNodalPoint ? this.props.route.params.showNodalPoint : false,
            StaffLocations: this.props.route.params.StaffLocations ? this.props.route.params.StaffLocations : [],
            enableCurrentLocation,
            clusterDetails: clusterDetails,
            region: this.props.route.params ? this.props.route.params.region : {latitude: 0.0, longitude: 0.0, ...mapDelta},
            fromProfile,
            title
        });
        if (enableCurrentLocation) {
            if (Platform.OS === "android") {
                RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
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
                                        const NY = {
                                            lat: data.coords.latitude,
                                            lng: data.coords.longitude
                                        };
                                        this.getGeoLocation(NY);
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
                            console.warn(err);
                        }
                    }).catch(err => {
                    console.warn("requestStatus " + JSON.stringify(err));
                });
            } else {
                Geolocation.requestAuthorization();
                Geolocation.getCurrentPosition((data) => {
                    const NY = {
                        lat: data.coords.latitude,
                        lng: data.coords.longitude
                    };
                    this.getGeoLocation(NY);
                }, (Error) => {
                    console.warn("Error " + JSON.stringify(Error));
                });
            }
        }
    }

    showSearchLocation() {
        this.setState({
            selectedLocation: "",
            showGooglePlacesSearch: true
        });
    }

    goToLocation(latitude, longitude) {
        if (latitude && longitude) {
            const coordinate = {latitude, longitude};
            this.setState({coordinate});

            setTimeout(
                () =>
                    this.map.animateToRegion(
                        {...coordinate, latitudeDelta: 2, longitudeDelta: 2},
                        350
                    ),
                100
            );

            !!this.checkClusterRadius() &&
            calculateDistance(
                parseFloat(this.state.clusterDetails.Clusterlat),
                parseFloat(this.state.clusterDetails.Clusterlng),
                latitude,
                longitude
            ).then(distance => {
                this.setState({
                    distanceFromOffice: distance
                });
                if (distance && this.checkClusterRadius()) {
                    setTimeout(() => focus(this), 800);
                }
            });
        } else {
            console.warn("here there is an error lat " + latitude + " long " + longitude);
        }
    }

    getGeoLocation(NY) {
        let url = "https://maps.googleapis.com/maps/api/geocode/json?address=" +
            NY.lat + "," + NY.lng + "&key=" + global.directionMapKey;
        fetch(url)
            .then(response => response.json())
            .then(responseJson => {
                this.setState({
                        selectedLocation:
                        responseJson.results[0].formatted_address,
                        selectLat: NY.lat,
                        selectLng: NY.lng
                    },
                    () => {
                        this.goToLocation(NY.lat, NY.lng);
                    }
                );
            }).catch(error => {
                console.warn("Error " + JSON.stringify(error));
                this.setState({
                    distanceFromOffice: false
                });
            }
        );
    }

    /************************* ENd Search Nodal Points ************************/
    render() {
        const {visible, showGooglePlacesSearch} = this.state;
        if (showGooglePlacesSearch) {
            return (
                <SafeAreaView style={{flex: 1, backgroundColor: colors.WHITE}}>
                    <View
                        style={{alignItems: "center", justifyContent: "flex-start"}}
                    >
                        <TouchableDebounce
                            style={{flexDirection: "row", alignItems: "center"}}
                            onPress={() => this.setState({showGooglePlacesSearch: false})}
                        >
                            {/* <Ionicons name={"chevron-left"} size={30}/> */}
                            <Text style={{color: colors.BLACK}}>Cancel</Text>
                        </TouchableDebounce>
                    </View>
                    <GooglePlacesInput callBack={this.callBack}/>
                </SafeAreaView>
            );
        }
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.WHITE}}>
                <View style={styles.container}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                    <CustomModalFilterPicker
                        visible={visible}
                        onSelect={this.onSelect}
                        onCancel={this.onCancel}
                        options={this.state.nodalPoints}
                    />

                    {this.state.clusterDetails.hasOwnProperty("addressText") && (
                        <View
                            style={{
                                flexDirection: "column",
                                padding: 5,
                                justifyContent: "center",
                                backgroundColor: "rgba(52, 52, 52, 0.8)"
                            }}
                        >
                            <Text
                                style={{
                                    fontWeight: "500",
                                    fontSize: 15,
                                    color: colors.WHITE
                                }}
                            >
                                Verify Geo Code for Address,
                            </Text>
                            <View style={{flexDirection: "row", justifyContent: "center"}}>
                                <Text
                                    numberOfLines={2}
                                    ellipsizeMode="middle"
                                    style={{fontSize: 12, color: colors.WHITE}}
                                >
                                    {this.state.clusterDetails.addressText}
                                </Text>
                            </View>
                        </View>
                    )}
                    {!this.state.clusterDetails.hasOwnProperty("addressText") && (
                        <View style={{width: "100%", alignItems: "center"}}>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    alignItems: "center"
                                }}
                            >
                                <Button
                                    transparent
                                    onPress={() => this.props.navigation.goBack()}
                                >
                                    <Icon name="arrow-back"/>
                                </Button>
                                <Text style={{fontSize: 15, fontWeight: "700"}}>
                                    {this.state.title?this.state.title:'Select Other Location'}
                                </Text>
                            </View>
                        </View>
                    )}

                    <MapView
                        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                        ref={map => (this.map = map)}
                        initialRegion={
                            this.checkClusterRadius()
                                ? {
                                    latitude: parseFloat(this.state.clusterDetails.Clusterlat),
                                    longitude: parseFloat(this.state.clusterDetails.Clusterlng),
                                    latitudeDelta: 2,
                                    longitudeDelta: 2
                                }
                                : this.props.route.params.region ? this.props.route.params.region : this.state.region
                        }
                        style={styles.container}
                        showsMyLocationButton={false}
                        showsUserLocation={true}
                        followsUserLocation={true}
                        loadingEnabled={true}
                        scrollEnabled={true}
                        showsBuildings={true}
                    >
                        {!!this.checkClusterRadius() && (
                            <Marker
                                identifier="Marker1"
                                coordinate={{
                                    latitude: parseFloat(this.state.clusterDetails.Clusterlat),
                                    longitude: parseFloat(this.state.clusterDetails.Clusterlng)
                                }}
                            >
                                <Image source={require('../assets/office.png')} style={{height: 35, width:35 }} />

                            </Marker>
                        )}

                        <Marker
                            identifier="Marker2"
                            draggable
                            coordinate={this.state.coordinate}
                            onDragEnd={e => {
                                if (this.state.showNodalPoint) {
                                    Alert.alert("Nodal Point", "Please select a nodal points");
                                    return;
                                }
                                this.setState({
                                    selectedLocation: "Getting Address ..."
                                });
                                const NY = {
                                    lat: e.nativeEvent.coordinate.latitude,
                                    lng: e.nativeEvent.coordinate.longitude
                                };
                                this.getGeoLocation(NY);
                            }}
                        >
                            <FontAwesome name="map-pin" color={colors.GREEN} size={30}/>
                        </Marker>
                        {!!(this.checkClusterRadius() && this.state.distanceFromOffice) && (
                            <Polyline
                                tappable={true}
                                onPress={() =>
                                    Toast.show(
                                        "Distance from Office: " +
                                        this.state.distanceFromOffice +
                                        " KM (Max " +
                                        this.state.clusterDetails.Clusterradius +
                                        " KM allowed)"
                                    )
                                }
                                coordinates={[
                                    {
                                        latitude: parseFloat(this.state.clusterDetails.Clusterlat),
                                        longitude: parseFloat(this.state.clusterDetails.Clusterlng)
                                    },
                                    this.state.coordinate
                                ]}
                                strokeWidth={2}
                            />
                        )}
                    </MapView>

                    <Callout style={{width: "100%", top: 80}}>
                        <TouchableDebounce
                            onPress={() => {
                                this.state.showNodalPoint
                                    ? this.showNodalPointSearch()
                                    : this.showSearchLocation();
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: colors.WHITE,
                                    opacity: 0.8,
                                    marginLeft: 10,
                                    marginRight: 10,
                                    elevation: 10,
                                    borderWidth: 0.5,
                                    borderColor: colors.BLACK,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    padding: 5
                                }}
                            >
                                <Ionicons
                                    name="md-search"
                                    style={{fontSize: 30, color: colors.BLACK}}
                                />
                                <Text
                                    numberOfLines={1}
                                    ellipsizeMode="middle"
                                    style={{fontSize: 12, marginRight: 10}}
                                >
                                    {this.state.selectedLocation
                                        ? this.state.selectedLocation
                                        : "Search ..."}
                                </Text>
                            </View>
                        </TouchableDebounce>
                    </Callout>
                    {!!this.state.enableCurrentLocation && (
                        <TouchableDebounce
                            style={{
                                position: "absolute",
                                right: 20,
                                bottom: 100,
                                backgroundColor: colors.WHITE,
                                height: 40,
                                width: 40,
                                borderRadius: 20,
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                            onPress={() => {
                                if (Platform.OS === "ios") {
                                    Geolocation.requestAuthorization();
                                    Geolocation.getCurrentPosition((data) => {
                                        const NY = {
                                            lat: data.coords.latitude,
                                            lng: data.coords.longitude
                                        };
                                        this.getGeoLocation(NY);
                                    }, (Error) => {
                                        console.warn("Error " + JSON.stringify(Error));
                                    });
                                } else {
                                    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
                                        interval: 10000,
                                        fastInterval: 5000
                                    })
                                        .then(requestStatus => {
                                            try {
                                                PermissionsAndroid.request(
                                                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                                                    {
                                                        title: "Current Location Permission",
                                                        message: "Please allow us with current location permission"
                                                    }
                                                ).then(granted => {
                                                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                                                        Geolocation.getCurrentPosition((data) => {
                                                            const NY = {
                                                                lat: data.coords.latitude,
                                                                lng: data.coords.longitude
                                                            };
                                                            this.getGeoLocation(NY);
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
                                            } catch (err) {
                                                console.warn(err);
                                            }
                                        }).catch(err => {
                                        console.warn(err);
                                    });
                                }
                            }}
                        >
                            <MaterialCommunityIcons
                                name="crosshairs-gps"
                                style={{fontSize: 25, color: colors.BLACK}}
                            />
                        </TouchableDebounce>
                    )}
                </View>
                <View style={{width: "100%", position: 'absolute', alignItems: "center", bottom: 0}}>
                    <View style={{
                        backgroundColor: 'transparent',
                        flexDirection: "column",
                        width: "100%",
                        alignItems: "center"
                    }}>
                        {/* {!!(this.checkClusterRadius() && this.state.distanceFromOffice) && (
                            <View
                                style={{
                                    backgroundColor: "rgba(52, 52, 52, 0.8)",
                                    width: "100%"
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 12,
                                        color: colors.WHITE
                                    }}
                                >
                                    {"Distance from Office: " +
                                    this.state.distanceFromOffice +
                                    " KM (Max " +
                                    this.state.clusterDetails.Clusterradius +
                                    " KM allowed)"}
                                </Text>
                            </View>
                        )} */}
                        <View style={{flexDirection: "row", marginBottom: 2}}>
                            {this.state.fromProfile === true && (
                                <Button onPress={() => this.props.navigation.goBack()}
                                        style={{
                                            width: this.state.fromProfile === true ? "45%" : "100%",
                                            alignSelf: "center",
                                            justifyContent: "center",
                                            backgroundColor: colors.RED,
                                            marginLeft: this.state.fromProfile === true ? 6 : 0,
                                            marginRight: this.state.fromProfile === true ? 6 : 0,
                                            marginBottom:20,
                                            height:55 
                                        }}
                                >
                                    <Text>
                                        Cancel
                                    </Text>
                                </Button>
                            )}
                            <Button
                                backgroundColor={colors.BLUE}
                                style={{
                                    width: this.state.fromProfile === true ? "45%" : "100%",
                                    alignSelf: "center",
                                    justifyContent: "center",
                                    marginRight: this.state.fromProfile === true ? 6 : 0,
                                    marginLeft: this.state.fromProfile === true ? 6 : 0,
                                    marginBottom:20,
                                    height:55
                                }}
                                onPress={() => {
                                    if (!this.state.selectedLocation) {
                                        Alert.alert("Location", "Address field cannot be empty");
                                        return;
                                    }
                                    if (this.checkClusterRadius()) {
                                        calculateDistance(
                                            parseFloat(this.state.clusterDetails.Clusterlat),
                                            parseFloat(this.state.clusterDetails.Clusterlng),
                                            parseFloat(this.state.selectLat),
                                            parseFloat(this.state.selectLng)
                                        ).then(distance => {
                                            this.setState({
                                                distanceFromOffice: distance
                                            });
                                            if (distance > this.state.clusterDetails.Clusterradius) {
                                                Alert.alert(
                                                    null,
                                                    this.state.clusterDetails.ClusterOutOfRadiusMsg
                                                );
                                            } else if (distance <= 1) {
                                                Alert.alert(
                                                    'Confirm Location',
                                                    'Distance from your location to office is less than 1 km, Are you sure you want to continue?',
                                                    [
                                                        {
                                                            text: 'Cancel',
                                                            onPress: () => console.log('Cancel Pressed'),
                                                            style: 'cancel',
                                                        },
                                                        {
                                                            text: 'OK', onPress: () => {
                                                                const { navigation, route } = this.props;
                                                                const type = route.params.type ? route.params.type : "NA";

                                                                this.state.showNodalPoint
                                                                    ? this.props.route.params.returnData(
                                                                    this.state.selectedLocation
                                                                    )
                                                                    : this.props.route.params.getLocationPicker(
                                                                    this.state.selectedLocation,
                                                                    this.state.selectLat,
                                                                    this.state.selectLng,
                                                                    type
                                                                    );
                                                                this.props.navigation.goBack();
                                                            }
                                                        }
                                                    ],
                                                    {cancelable: false},
                                                );
                                            } else {
                                                const { navigation, route } = this.props;
                                                const type = route.params.type ? route.params.type : "NA";

                                                this.state.showNodalPoint
                                                    ? this.props.route.params.returnData(
                                                    this.state.selectedLocation
                                                    )
                                                    : this.props.route.params.getLocationPicker(
                                                    this.state.selectedLocation,
                                                    this.state.selectLat,
                                                    this.state.selectLng,
                                                    type
                                                    );
                                                this.props.navigation.goBack();
                                            }
                                        });
                                    } else {
                                        const {navigation, route} = this.props;
                                        const type = route.params.type ? route.params.type : "NA";

                                        this.state.showNodalPoint
                                            ? this.props.route.params.returnData(
                                            this.state.selectedLocation
                                            )
                                            : this.props.route.params.getLocationPicker(
                                            this.state.selectedLocation,
                                            this.state.selectLat,
                                            this.state.selectLng,
                                            type
                                            );
                                        this.props.navigation.goBack();
                                    }
                                }}
                            >
                                <Text style={{alignSelf: "center", justifyContent: "center"}}>Confirm</Text>
                            </Button>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    showNodalPointSearch() {
        this.setState({visible: true});
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

function findLatLngFromName(Name, LocationArray) {
    let i;
    for (i = 0; i < LocationArray.length; i++) {
        if (LocationArray[i].Name.toString().trim() === Name.toString().trim()) {
            return {
                lat: LocationArray[i].lat,
                lng: LocationArray[i].lng,
                name: LocationArray[i].Name
            };
        }
    }
    return null;
}

export function focus(context) {
    focusMap([markerIDs[0], markerIDs[1]], true, context);
}

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
export function focusMap(markers, animated, context) {
    EdgePaddingOptions.animated = animated;
    if (context.map) context.map.fitToSuppliedMarkers(markers, EdgePaddingOptions);
}

