import React, {Component} from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    PermissionsAndroid,
    Platform,
    RefreshControl,
    StatusBar,
    Text,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg";
import scan_icon from "../../assets/scan_qr.png";
import {colors} from "../../utils/Colors";
import moment from "moment";
import LinearGradient from "react-native-linear-gradient";
import { Button } from "native-base";
import { API } from "../../network/apiFetch/API";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import { URL } from "../../network/apiConstants";
import TouchableDebounce from "../../utils/TouchableDebounce";
import bus_loading from "../../assets/bus_loading.gif";
import { TYPE } from "../../model/ActionType";
import { asyncString } from "../../utils/ConstantString";

import { check, openSettings, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
let FRTrips;
class ETicket extends Component {
    state = {
        isLoading: false,
        refreshing: false,
        From: "",
        To: "",
        routeName: "",
        TripDate: "",
        time: "",
        ticketID: "",
        finalObject: {},
        isBookingAllowed: true

    };
    callback = async (actionType, response) => {
        switch (actionType) {
            case TYPE.GET_ETICKETS: {
                handleResponse.getAllETickets(this, response);
                break;
            }
            case TYPE.GET_PASSES: {
                handleResponse.getAllPasses(this, response);
                break;
            }
            case TYPE.GET_FAV_ROUTES: {
                handleResponse.getFavFixedRoutes(response, this);
                break;
            }
        }
    };


    static navigationOptions = ({ navigation }) => {
        return {
            title: "e-Pass"
        };
    };

    UNSAFE_componentWillMount() {
        FRTrips = this.props.route.params.FRTrips;
    }
    componentDidMount() {
        FRTrips = this.props.route.params.FRTrips;
        this.willFocusSubscription = this.props.navigation.addListener(
            'focus',
            payload => {
                this.getETickets();
            }
        );
    }

    componentWillUnmount() {
        // this.willFocusSubscription.remove();
    }

    render() {
        let data = [];
        if (this.state.isLoading) return this.showLoaderScreen();
        if (this.state.finalObject) {
            let first = Array.isArray(this.state.finalObject.tickets) ? this.state.finalObject.tickets : [];
            let second = Array.isArray(this.state.finalObject.passes) ? this.state.finalObject.passes : [];
            let third = Array.isArray(this.state.finalObject.fpasses) ? this.state.finalObject.fpasses : [];
            data = [...first, ...second, ...third];
            if (data && data.length > 0) {
                data = [...new Set(data)];
            }
        }
        return (
            <View style={{ flex: 1 }}>
                <StatusBar barStyle="dark-content" />
                <FlatList
                    style={{ minHeight: 100 }}
                    keyExtractor={this._keyExtractor}
                    data={data}
                    renderItem={this.renderItem.bind(this)}
                    ListEmptyComponent={this.renderEmptyList}
                    refreshing={this.state.isLoading}
                    onRefresh={this._onRefresh}
                />
            </View>
        );
    }

    renderEmptyList = () => {
        return (
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    margin: 10
                }}
            >
                <Text style={{ textAlign: "center", color: colors.GRAY }}>No passes available</Text>
            </View>
        );
    };

    renderItem(data) {
        return (
            <TouchableDebounce
                onPress={() => {
                    console.warn("orig " + JSON.stringify(data.item));
                    this.onCardClick(data);

                }}
            >
                <StatusBar
                    barStyle="dark-content"
                    hidden={false}
                    backgroundColor={colors.WHITE}
                    translucent={false}
                />
                <LinearGradient
                    start={{ x: 0, y: 0.75 }}
                    end={{ x: 1, y: 0.25 }}
                    colors={[colors.BLUE, colors.GREEN]}
                    style={gradientView}
                >
                    <View style={{ flexDirection: 'column' }}>
                        <View style={{ flexDirection: "row" }}>

                            <View style={{ flexDirection: "column", marginLeft: 10, flex: 1 }}>
                                {data.item.hasOwnProperty("passType") ? <Text style={type}>Bus Pass</Text> : (data.item.hasOwnProperty("typeID") ? <Text style={type}>{data.item.facilityName}</Text> : <Text style={type}>Shuttle Pass</Text>)}
                                {data.item.hasOwnProperty("typeID") &&
                                    <Text style={routeName}>{data.item.empInstruction}</Text>}
                                {data.item.hasOwnProperty("routeName") &&
                                    <Text style={routeName}>{data.item.routeName}</Text>}
                                {data.item.hasOwnProperty("passType") &&
                                    <Text style={routeName}>{"Type: " + data.item.passType}</Text>}
                                {data.item.hasOwnProperty("category") &&
                                    <Text style={routeName}>{"Category: " + data.item.category}</Text>}
                                {data.item.hasOwnProperty("tripCount") && data.item.tripCount > 0 &&
                                    <Text style={routeName}>{"Total Trips: " + data.item.tripCount}</Text>}

                                {data.item.employeeDeBoardingPointName && (
                                    <View
                                        style={{
                                            flexDirection: "column"
                                        }}
                                    >
                                        <Text style={routeName}>
                                            {"From: " + data.item.employeeBoardingPointName}
                                        </Text>
                                        <Text style={routeName}>
                                            {"To: " + data.item.employeeDeBoardingPointName}
                                        </Text>
                                    </View>
                                )}

                                {data.item.hasOwnProperty("pickupNodalPoint") &&data.item.pickupNodalPoint!==''&&
                                    <Text style={routeName}>
                                        {"Board At: " + data.item.pickupNodalPoint + ((data.item.hasOwnProperty("loginRouteName") && data.item.loginRouteName !== '') ? " (" + data.item.loginRouteName + ")" : "")}
                                    </Text>
                                }
                                {data.item.hasOwnProperty("dropNodalPoint") && data.item.dropNodalPoint!=='' &&
                                    <Text style={routeName}>
                                        {"Deboard At: " + data.item.dropNodalPoint + ((data.item.hasOwnProperty("logoutRouteName") && data.item.logoutRouteName !== '') ? " (" + data.item.logoutRouteName + ")" : "")}
                                    </Text>
                                }
                                {data.item.hasOwnProperty("tripDate") && <Text style={routeName}>
                                    {moment(data.item.tripDate, "YYYY-MM-DDTHH:mm").format("HH:mm")}
                                </Text>}

                                <Text style={routeName}>

                                    {
                                        !data.item.hasOwnProperty("typeID") && (data.item.hasOwnProperty("tripDate") ?
                                            moment(data.item.tripDate, "YYYY-MM-DDTHH:mm").format(
                                                "ddd, DD MMM"
                                            ) : ("Validity: " + moment(data.item.fromDate, "YYYY-MM-DDTHH:mm").format(
                                                "ddd, DD MMM"
                                            ) + " - " + moment(data.item.toDate, "YYYY-MM-DDTHH:mm").format(
                                                "ddd, DD MMM"
                                            )))

                                    }

                                </Text>

                            </View>
                            <View style={{ height: 120, width: 120, marginTop: 10, marginRight: 10 }}>
                                {data.item.hasOwnProperty("routeName") ?
                                    (<View style={{ height: 100, width: 100, marginTop: 10, alignSelf: 'center', position: 'absolute' }}><QRCode value={data.item.ticketID.toString()} size={100} /></View>) : <Image
                                        defaultSource={scan_icon}
                                        source={scan_icon}
                                        style={{ height: 100, width: 100, alignSelf: 'flex-end', position: 'absolute' }}
                                    />}

                            </View>
                        </View>
                        {data.item.hasOwnProperty("passType") &&
                            <View style={{ flexDirection: 'row', flex: 1, marginLeft: 10, marginRight: 10, marginTop: 10 }}>
                                <Button
                                    backgroundColor={colors.BLUE}
                                    style={{
                                        marginTop: 10, borderRadius: 10,
                                        borderWidth: 1,
                                        flex: 1,
                                    }}
                                    onPress={() => this.bookSeat()}
                                >
                                    <Text style={{ color: 'white' }}>View Routes</Text>
                                </Button>
                                <Button
                                    backgroundColor={colors.BLUE}
                                    style={{
                                        flex: 1,
                                        marginTop: 10, marginLeft: 10, borderRadius: 10,
                                        borderWidth: 1,
                                    }}
                                    onPress={() => this.props.navigation.navigate("Bookings", {
                                        passId: data.item.id,
                                    })}
                                >
                                    <Text style={{ color: 'white' }}>My Trips</Text>
                                </Button>
                            </View>
                        }
                        {
                            data.item.hasOwnProperty("typeID") &&
                            <View style={{ flexDirection: 'row', flex: 1, marginLeft: 10, marginRight: 10, marginTop: 10 }}>
                                <Text
                                    style={{
                                        marginTop: 10, borderRadius: 0,
                                        borderWidth: 0,
                                        flex: 1,
                                        backgroundColor: "#00000000"

                                    }}
                                    onPress={() => this.onCardClick(data)}
                                >
                                    <Text style={{ color: 'white' }}></Text>
                                </Text>
                                <Button
                                    backgroundColor={colors.BLUE}
                                    style={{
                                        flex: 1,
                                        marginTop: 10, marginLeft: 10, borderRadius: 10,
                                        borderWidth: 1,
                                    }}
                                    onPress={() => this.props.navigation.navigate("MyUsage", {
                                        passId: data.item.typeID,
                                    })}
                                >
                                    <Text style={{ color: 'white' }}>My Usage</Text>
                                </Button>
                            </View>

                        }

                    </View>
                </LinearGradient>
            </TouchableDebounce>
        );
    }

    onCardClick(data) {
        if (data.item.hasOwnProperty("ticketID")) {
            this.props.navigation.navigate("QRCode", {
                From: data.item.employeeBoardingPointName,
                To: data.item.employeeDeBoardingPointName,
                routeName: data.item.routeName,
                TripDate: moment(
                    data.item.tripDate,
                    "YYYY-MM-DD"
                ),
                time: moment(data.item.tripDate, "YYYY-MM-DDTHH:mm").format(
                    "HH:mm"
                ),
                ticketID: data.item.ticketID.toString(),
                QRButtonText: "Close",
                shuttleDetails: {
                    trackeeID: data.item.trackeeID,
                    DriverPhoto: data.item.driverPhoto,
                    DriverName: data.item.driverName,
                    VehicleRegNo: data.item.vehicleRegNo,
                    CheckinStatus: "0"
                },
                stops: data.item.stops
            });
        } else {
            this.checkPermissions(data.item);
        }
    }
    bookSeat() {

        AsyncStorage.multiGet(
            [asyncString.FIXED_FAV_ROUTES],
            (err, savedData) => {
                let data = JSON.parse(savedData[0][1]);
                if (data) {
                    //console.warn("raw login "+data.login.length);
                    if ((data.hasOwnProperty("login") && data.login.length > 0) || (data.hasOwnProperty("logout") && data.logout.length > 0)) {
                        let cached = [];
                        if (data.hasOwnProperty("logout") && data.logout.length > 0)
                            cached = data.hasOwnProperty("login") ? data.login.concat(data.logout) : data.logout;
                        else
                            cached = data.hasOwnProperty("login") ? data.login : [];
                        this.props.navigation.navigate("FixedRouteList", {
                            data: cached,
                            navigatedFrom: 'home',
                            cachedData: cached
                        });
                    } else {
                        this.getFavFixedRoutes();
                    }
                } else {
                    this.getFavFixedRoutes();
                }
            }
        );


    }

    getFavFixedRoutes() {
        let url = URL.GET_FAV_ROUTES + "?searchType=ByUserLocation";
        this.setState({ isLoading: true });
        API.newFetchXJSON(
            url,
            true,
            this.callback.bind(this),
            TYPE.GET_FAV_ROUTES
        );
    }

    checkPermissions(data) {
        let passId = data.hasOwnProperty("typeID") ? data.typeID.toString() : data.id;
        check(Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA)
            .then(result => {
                switch (result) {
                    case RESULTS.UNAVAILABLE:
                        console.warn(
                            'This feature is not available (on this device / in this context)',
                        );
                        break;
                    case RESULTS.DENIED:

                        console.warn(
                            'The permission has not been requested / is denied but requestable',
                        );
                        request(
                            Platform.select({
                                android: PERMISSIONS.ANDROID.CAMERA,
                                ios: PERMISSIONS.IOS.CAMERA,
                            }),
                        );
                        break;
                    case RESULTS.GRANTED:
                        if (data.hasOwnProperty("typeID")) {
                            console.warn("checked" + data.facilityName)
                            this.props.navigation.navigate("QRScanner", {
                                passId: passId,
                                isFacilityPass: data.hasOwnProperty("typeID") ? true : false,
                                passName: data.hasOwnProperty("typeID") ? data.facilityName : ""
                            });
                        } else {
                            if (moment().isBetween(data.fromDate, data.toDate) || (moment().format("YYYY-MM-DD") === moment(data.fromDate).format("YYYY-MM-DD")) || (moment().format("YYYY-MM-DD") === moment(data.toDate).format("YYYY-MM-DD"))) {

                                this.props.navigation.navigate("QRScanner", {
                                    passId: passId.toString(),
                                    isFacilityPass: data.hasOwnProperty("typeID") ? true : false,
                                    // passName: data.hasOwnProperty("typeID") ? data.item.facilityName : ""
                                });
                            } else {
                                Alert.alert("Warning!", "This pass is not valid for today. Please use a valid pass to checkin");
                            }
                        }

                        break;
                    case RESULTS.BLOCKED:
                        Alert.alert("Warning!", "You have selected 'Don't ask me again'. Please go to application's settings to enable the permission.", [
                            {
                                text: "Cancel",
                                onPress: () => console.log("NO Pressed"),

                            },
                            {
                                text: "Open Settings",
                                onPress: () => {
                                    openSettings().catch(() => console.warn('cannot open settings'));
                                    //this._onRefresh();
                                }
                            }
                        ]);
                        console.warn('The permission is denied and not requestable anymore');
                        break;
                }
            })
            .catch(error => {

            });
    }

    _keyExtractor(item, index) {
        return index.toString();
    }

    renderSeparator() {
        return <View style={styles.separator} />;
    }

    _onRefresh = () => {
        this.setState({
            isLoading: true
        }, () => {
            this.getETickets();
            console.warn("Checking refresh")
        });
    }


    getETickets() {
        this.setState({ isLoading: true });
        API.newFetchXJSON(
            URL.GET_ETICKETS,
            true,
            this.callback.bind(this),
            TYPE.GET_ETICKETS
        );
        if (!!FRTrips) {
            setTimeout(() => {
                API.newFetchXJSON(
                    URL.GET_PASSES,
                    true,
                    this.callback.bind(this),
                    TYPE.GET_PASSES
                );
            }, 10);
        }
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
                    style={{ height: 170, width: 170 }}
                />
                <Text style={{ color: colors.BLACK, marginTop: -20 }}>
                    Getting generated passes...
                </Text>
            </View>
        );
    }
}

export default ETicket;

const gradientView = {
    margin: 10,
    width: "95%",
    // height: 190,
    opacity: 0.95,
    borderRadius: 6,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
        width: 0,
        height: 2
    },
    shadowRadius: 4,
    shadowOpacity: 1,
    justifyContent: "space-between",
    paddingBottom: 10
};

const routeName = {
    marginTop: 10,
    fontFamily: "Helvetica",
    fontSize: 12,
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#ffffff"
};
const type = {
    marginTop: 10,
    fontFamily: "Helvetica",
    fontSize: 15,
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#ffffff",
    fontWeight: 'bold',
};


