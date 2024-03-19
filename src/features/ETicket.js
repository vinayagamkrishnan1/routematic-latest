import React, {Component} from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Platform,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg";
import scan_icon from "../assets/scan_qr.png";
import {colors} from "../utils/Colors";
import moment from "moment";
import LinearGradient from "react-native-linear-gradient";
import { Button } from "native-base";
import { API } from "../network/apiFetch/API";
import { handleResponse } from "../network/apiResponse/HandleResponse";
import { URL } from "../network/apiConstants";
import TouchableDebounce from "../utils/TouchableDebounce";
import { Box, Row } from "native-base";
import bus_loading from "../assets/bus_loading.gif";
import { TYPE } from "../model/ActionType";
import { asyncString } from "../utils/ConstantString";
import Ionicons from "react-native-vector-icons/Ionicons";
import {Container, Fab, Icon, Tab, TabHeading, Tabs} from 'native-base';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;
import { check, openSettings, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

class ETicketNEW extends Component {

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
        isBookingAllowed: true,
        passType: 'S',
        passlist: []
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
            case TYPE.CANCEL_TICKET: {
                handleResponse.cancelTicket(this,response);
                break;
            }
            
        }
    };

    static navigationOptions = ({ navigation }) => {
        return {
            title: "e-Pass"
        };
    };

    componentDidMount() {
        this.willFocusSubscription = this.props.navigation.addListener(
            'focus',
            payload => {
                this.getShuttlePass();
            }
        );
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <StatusBar barStyle="dark-content" />  
            <Box
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    borderBottomWidth:1,
                    borderRightWidth:1,
                    borderColor:colors.GRAY
                }}>
                <TouchableDebounce
                    style={this.state.passType == 'S' ? [viewSelectedStyle, {flexDirection: "row",width:width/2,borderRightWidth:1,borderColor:colors.GRAY}]:[viewNotSelectedRosterTypeStyle, {flexDirection: "row",width:width/2,borderRightWidth:1,borderColor:colors.GRAY}]}
                    onPress={() => {
                        this.setState({passType: 'S', passlist: []});
                        this.getShuttlePass();
                    }}
                >
                    <Text
                        style={{
                            color: this.state.passType == 'S'
                                ? colors.WHITE
                                : colors.BLACK,
                            fontWeight: 'bold',
                            fontSize:15,
                        }}
                    >
                        Shuttle Pass
                    </Text>
                </TouchableDebounce>

                <TouchableDebounce
                    style={this.state.passType == 'B' ? [viewSelectedStyle, {flexDirection: "row", width:width/2}]:[viewNotSelectedRosterTypeStyle, {flexDirection: "row", width:width/2}]}
                    onPress={() => {
                        this.setState({passType: 'B', passlist: []});
                        this.getBusPass();
                    }}
                >
                    <Text
                        style={{
                            color: this.state.passType == 'B'
                                ? colors.WHITE
                                : colors.BLACK,
                            alignSelf: "center",
                            fontWeight: 'bold',
                            fontSize:15
                        }}
                    >
                       Bus Pass
                    </Text>
                </TouchableDebounce>
            </Box>

            <FlatList
                    style={{ minHeight: 100 }}
                    keyExtractor={this._keyExtractor}
                    data={this.state.passlist}
                    renderItem={this.renderItem.bind(this)}
                    ListEmptyComponent={this.renderEmptyList}
                    refreshing={this.state.isLoading}
                    onRefresh={this._onRefresh}
                />
            </View>
        );
    }

    cancelTicket (ticketID) {
    this.setState({ isLoading: true });

    let body = {
        TicketID: ticketID
      };
      API.newFetchJSON(
        URL.CANCEL_TICKET,
        body,
        true,
        this.callback.bind(this),
        TYPE.CANCEL_TICKET
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
    renderItem(data){
        return (
             <>
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
                        {data.item.hasOwnProperty("passType") && (
                        <View style={{ flexDirection: "row" }}>
                            <View style={{ flexDirection: "column", marginLeft: 10, flex: 1 }}>
                                {/* <Text style={type}>Bus Pass</Text> */}
                                {data.item.hasOwnProperty("totalTrips") &&
                                    <Text style={routeName}>{"Total Trips: " + data.item.totalTrips}</Text>}
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
                                <Text style={routeName}>
                                    {
                                        ("Pass Validity: " + moment(data.item.fromDate, "YYYY-MM-DDTHH:mm").format(
                                            "ddd, DD MMM"
                                        ) + " - " + moment(data.item.toDate, "YYYY-MM-DDTHH:mm").format(
                                            "ddd, DD MMM"
                                        ))
                                    }
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    top: 5,
                                    right: 10
                                }}
                                onPress={() => {
                                    this.props.navigation.navigate("FixedRoutePassDetail", {
                                        title: moment(data.item.fromDate, "YYYY-MM-DDTHH:mm").format("DD MMM") + " - " + moment(data.item.toDate, "YYYY-MM-DDTHH:mm").format("DD MMM"),
                                        passDtl: data.item
                                    })
                                }}
                            >
                                <Ionicons name="information-circle-outline" size={25} color={colors.BLUE}/>
                            </TouchableOpacity>
                        </View>
                        )}

                        {!data.item.hasOwnProperty("passType") && (
                            <>
                            <View style={{ flexDirection: "row" }}>
                                <View style={{ flexDirection: "column", marginLeft: 10, flex: 1 }}>
                                    {/* {data.item.hasOwnProperty("passType") ? <Text style={type}>Bus Pass</Text> : (data.item.hasOwnProperty("typeID") ? <Text style={type}>{data.item.facilityName}</Text> : <Text style={type}>Shuttle Pass</Text>)} */}
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
                                    {data.item.hasOwnProperty("vehicleRegNo") &&
                                    <Text style={routeName}>Vehicle No: {data.item.vehicleRegNo}</Text>}

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
                                        {"Pickup Time: "+moment(data.item.tripDate, "YYYY-MM-DDTHH:mm").format("HH:mm")}
                                    </Text>}

                                    <Text style={routeName}>Pickup Date: 
                                        {
                                            !data.item.hasOwnProperty("typeID") && (data.item.hasOwnProperty("tripDate") ?
                                                moment(data.item.tripDate, "YYYY-MM-DDTHH:mm").format(
                                                    "ddd, DD MMM YYYY"
                                                ) : ("Validity: " + moment(data.item.fromDate, "YYYY-MM-DDTHH:mm").format(
                                                    "ddd, DD MMM YYYY"
                                                ) + " - " + moment(data.item.toDate, "YYYY-MM-DDTHH:mm").format(
                                                    "ddd, DD MMM YYYY"
                                                )))
                                        }
                                    </Text>

                                </View>
                                <View style={{ height: 120, width: 120, marginTop: 10, marginRight: 10 }}>
                                    {!data.item.hasOwnProperty("routeName") ?
                                        (<View style={{ height: 100, width: 100, marginTop: 10, alignSelf: 'center', position: 'absolute' }}><QRCode value={data.item.ticketID?.toString()} size={100} /></View>) : <TouchableOpacity   onPress={() => {
                                            // this.props.navigation.navigate("ShuttleQRCode",{isEticket:true})
                                            this.onCardClick(data);
                                        }}><Image
                                            defaultSource={scan_icon}
                                            source={scan_icon}
                                            style={{ height: 100, width: 100, alignSelf: 'flex-end', position: 'absolute' }}
                                        /></TouchableOpacity>}
                                </View>
                            
                            </View>

                          <View style={{ flexDirection: 'row', flex: 1, marginLeft: 10, marginRight: 10, marginTop: 10 }}>
                            <Button
                                     backgroundColor={colors.WHITE}
                                     style={{
                                         flex: 1,
                                         marginTop: 10, marginLeft: 10, borderRadius: 10,
                                         borderWidth: 1,
                                     }}
                                     onPress={() => this.cancelTicket(data.item.ticketID)}
                                 >
                                     <Text style={{ color: 'black',fontSize: 15 ,fontWeight: 'bold'}}>Cancel</Text>
                                 </Button> 
                                 <Button
                                     backgroundColor={colors.WHITE}
                                     style={{
                                         flex: 1,
                                         marginTop: 10, marginLeft: 30, borderRadius: 10,
                                         borderWidth: 1,
                                     }}
                                     onPress={() =>  this.props.navigation.navigate("TrackShuttle", {
                                        Trips: {
                                          trackeeID: data.item.trackeeID,
                                          DriverPhoto: data.item.driverPhoto,
                                          DriverName: data.item.driverName,
                                          VehicleRegNo: data.item.vehicleRegNo,
                                          RouteNumber: data.item.driverMobile,
                                          CheckinStatus: "0",
                                          PickupLocation: data.item.boardingPointName,
                                          DestinationLocation: data.item.deBoardingPointName
                                        },
                                        CustomerUrl: global.CustomerUrl,
                                        UserId: global.UserId,
                                        stops: data.item.stops
                                      })}
                                 >
                                     <Text style={{ color: 'black',fontSize: 15 ,fontWeight: 'bold'}}>Track Now</Text>
                                 </Button>
                             </View>
                            </>
                        )}
                    </View>
                </LinearGradient>
            </>
        )
    }

    onCardClick(data) {
        // if (data.item.hasOwnProperty("ticketID")) {
        //     this.props.navigation.navigate("QRCode", {
        //         From: data.item.employeeBoardingPointName,
        //         To: data.item.employeeDeBoardingPointName,
        //         routeName: data.item.routeName,
        //         TripDate: moment(
        //             data.item.tripDate,
        //             "YYYY-MM-DD"
        //         ),
        //         time: moment(data.item.tripDate, "YYYY-MM-DDTHH:mm").format(
        //             "HH:mm"
        //         ),
        //         ticketID: data.item.ticketID.toString(),
        //         QRButtonText: "Close",
        //         shuttleDetails: {
        //             trackeeID: data.item.trackeeID,
        //             DriverPhoto: data.item.driverPhoto,
        //             DriverName: data.item.driverName,
        //             VehicleRegNo: data.item.vehicleRegNo,
        //             CheckinStatus: "0"
        //         },
        //         stops: data.item.stops
        //     });
        // } else {
            this.checkPermissions(data.item);
        // }
    }

    checkPermissions(data) {
        let passId = data.hasOwnProperty("typeID") ? data.typeID.toString() : data.ticketID;
        // let passId = data.hasOwnProperty("typeID") ? data.typeID.toString() : data.id;
        console.log('Clicked Data - ', passId, data);
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
                            console.warn('Shuttle checkin');
                            // if (moment().isBetween(data.fromDate, data.toDate) || (moment().format("YYYY-MM-DD") === moment(data.fromDate).format("YYYY-MM-DD")) || (moment().format("YYYY-MM-DD") === moment(data.toDate).format("YYYY-MM-DD"))) {

                                this.props.navigation.navigate("QRScanner", {
                                    passId: passId.toString(),
                                    isFacilityPass: false,
                                    isShuttlePass: true
                                });
                            // } else {
                            //     Alert.alert("Warning!", "This pass is not valid for today. Please use a valid pass to checkin");
                            // }
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
            if (this.state.passType == 'S') {
                this.getShuttlePass();
            } else {
                this.getBusPass();
            }
            console.warn("Checking refresh")
        });
    }


    getShuttlePass() {
        this.setState({ isLoading: true });
        API.newFetchXJSON(
            URL.GET_ETICKETS,
            true,
            this.callback.bind(this),
            TYPE.GET_ETICKETS
        );
    }

    getBusPass() {
        this.setState({ isLoading: true });
        API.newFetchXJSON(
            URL.GET_PASSESV1,
            true,
            this.callback.bind(this),
            TYPE.GET_PASSES
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
                    style={{ height: 170, width: 170 }}
                />
                <Text style={{ color: colors.BLACK, marginTop: -20 }}>
                    Getting generated passes...
                </Text>
            </View>
        );
    }
}

export default ETicketNEW;

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
const viewNotSelectedRosterTypeStyle = {
   // borderRadius: 30,
   width: "100%",
   padding: 15,
    // backgroundColor: colors.BLUE_BRIGHT,
   // margin: 5,
    justifyContent: "center",
    alignItems: "center"
  
  };
  
const viewSelectedStyle = {
   // borderRadius: 30,
    width: "100%",
    padding: 15,
    backgroundColor: colors.BLUE_BRIGHT,
   // margin: 5,
    justifyContent: "center",
    alignItems: "center"
  };
const routeName = {
    marginTop: 5,
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
