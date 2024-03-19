import React, {Component} from 'react';
import {
    ActivityIndicator,
    Alert,
    AppState,
    FlatList,
    Image,
    ImageBackground,
    Keyboard,
    PermissionsAndroid,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {inject, observer} from 'mobx-react';
import moment from "moment";
import {asyncString, loginString} from "../utils/ConstantString";
import {Stack, Button, Box, HStack, Content, Text} from "native-base";
import {colors} from "../utils/Colors";
import {URL} from "../network/apiConstants";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as Toast from "../utils/Alert";
import Modal from "react-native-modal";
import {spinner} from "../network/loader/Spinner";
import TouchableDebounce from "../utils/TouchableDebounce";
import RNSlidingButton, {SlideDirection} from "../features/RNSlidingButton";
import Shimmer from "react-native-shimmer";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import Geolocation from "@react-native-community/geolocation";
import {check, openSettings, PERMISSIONS, request, RESULTS} from "react-native-permissions";
import { TYPE } from '../model/ActionType';
import { handleResponse } from '../network/apiResponse/HandleResponse';
import { API } from '../network/apiFetch/API';
import { Rating } from 'react-native-ratings';
import { checkSpecialCharacter } from '../utils/Validators';
import available_seat from "../assets/unavailable_seat.png";
import seat_no from "../assets/seat_no.png";
import vehicle_no from "../assets/vehicle_no.png";
import { Card } from 'react-native-paper';
import { CryptoXor } from 'crypto-xor';

const borderRadius=10;

@inject("myStore")
@observer
class MyTripsMobx extends Component {
    
    static navigationOptions = {
        title: "My Trips",
        headerTitleStyle: {fontFamily: "Roboto"}
    };

    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            access_token: "",
            CustomerUrl: "",
            IdleTimeOutInMins: 0,
            refresh: false,
            appState: AppState.currentState,
            pin:"",
            keyboardSpace:0,
            lastRatedDate: "",
            feedbackLoading: false,
            feedbackLast24hrTrip: {},
            tempRating: 0.0,
            viewMore: false
        };
        //for get keyboard height
        Keyboard.addListener('keyboardDidShow',(frames)=>{
            if (!frames.endCoordinates) return;
            this.setState({keyboardSpace: frames.endCoordinates.height});
        });
        Keyboard.addListener('keyboardDidHide',(frames)=>{
            this.setState({keyboardSpace:0});
        });
    }

    _renderDisclaimerType = () => (
        <View padder style={{marginTop: 16, backgroundColor: "#FFFFFF"}}>
            <StatusBar barStyle="light-content"/>
            <Box style={{padding: 10}}>
                <ScrollView>
                    {this._renderContent(this.props.myStore.optOutContent)}
                    {this._renderTC()}
                </ScrollView>
            </Box>
        </View>
    );

    _keyExtractor(item) {
        return item.metaData.routeID !== "" ? item.metaData.routeID : item.metaData.programID;
    }

    componentDidMount() {
        if (this.state.access_token === "") {
            console.warn('did mount access token call');
            AsyncStorage.multiGet(
                [
                    asyncString.ACCESS_TOKEN,
                    asyncString.USER_ID,
                    asyncString.DTOKEN,
                    asyncString.CAPI,
                    asyncString.IdleTimeOutInMins,
                    asyncString.isRosterOptOutEnabled,
                    asyncString.DISCLAIMER_TYPE
                ],
                (err, savedData) => {
                    let isRosterOptOutEnabled = savedData[5][1];
                    let disclaimerType = savedData[6][1];
                    var _token = CryptoXor.decrypt(savedData[0][1], asyncString.ACCESS_TOKEN);
                    this.setState({
                        access_token: _token,
                        UserId: savedData[1][1],
                        DToken: savedData[2][1],
                        CustomerUrl: savedData[3][1],
                        IdleTimeOutInMins: parseInt(savedData[4][1]),
                        isRosterOptOutEnabled,
                        disclaimerType
                    });
                    this.props.myStore.setInitMyTripsValues(disclaimerType, isRosterOptOutEnabled, _token,
                        savedData[3][1] + URL.CANCEL_TRIP, savedData[3][1], savedData[1][1]);
                    if (isRosterOptOutEnabled === "true" && disclaimerType) {
                        this.props.myStore.getOptOutData(_token);
                    }
                }
            );
        }
        this.checkPermissions();
        this.focusListener = this.props.navigation.addListener('focus', () => {
            // alert("my trips focus");
            setTimeout(() => {
                this.props.myStore.getMyTripData();
            }, 1000);
            const { navigation, route } = this.props;
            const feedback = route.params?.feedbackTrip // ", 0);
            console.warn('feedbackTrip willfocus -- ', feedback);
            if (feedback && feedback == 1) {
                setTimeout(() => {
                    this.props.myStore.enableFeedbackModal(this);
                }, 1000);
            }
        });
        this.changeEventListener = AppState.addEventListener("change", this._handleAppStateChange);
    }

    _renderContent(data) {
        return <Text style={{marginTop: 8}}>{data}</Text>;
    }

    _handleAppStateChange = nextAppState => {
        console.warn('State change -> ', nextAppState);
        this.setState({ appState: nextAppState });
        if (nextAppState === "active") {
            // alert("my trips appstate");
            // this.props.myStore.getMyTripData();
        }
    };

    _renderTC() {
        return (
            <React.Fragment>
                <Button
                    transparent
                    style={{
                        width: "100%",
                        backgroundColor: 'transparent',
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "row",
                        marginTop: 5
                    }}
                    onPress={() => this.props.myStore.toggleAccept()}
                >
                      <View 
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                    >
                    <FontAwesome
                        name={this.props.myStore.accepted ? "check-square-o" : "square-o"}
                        color={colors.BLACK}
                        size={25}
                    />
                    <Text style={{marginLeft: 5, fontWeight: "700", color: colors.BLACK,marginTop:5}}>
                        I Agree
                    </Text>
                    </View>
                </Button>

                <View
                    style={{
                        marginTop: 5,
                        marginBottom: 10,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        paddingLeft: 5,
                        paddingRight: 5
                    }}
                >
                    <Button
                        full
                        danger
                        style={{width: "45%", backgroundColor: colors.RED}}
                        onPress={() => {
                            this.props.myStore.disableOptOutVisible();
                        }}
                    >
                        <Text style={{color: colors.WHITE}}>Cancel</Text>
                    </Button>
                    <Button
                        success
                        full
                        style={{
                            width: "45%",
                            opacity: 1,
                            backgroundColor: this.props.myStore.accepted
                                ? "rgba(50,205,50,1)"
                                : "rgba(192,192,192,0.5)"
                        }}
                        onPress={() => {
                            if (!this.props.myStore.accepted) {
                                Toast.show("Please Accept the Opt-Out");
                                return;
                            }
                            this.props.myStore.optOutSelected();
                        }}
                    >
                        <Text style={{color: colors.WHITE}}>Accept</Text>
                    </Button>
                </View>
            </React.Fragment>
        );
    }

    renderItem = ({item, index}) => {
        console.warn('renderItem -> ', item);
        let momentDate = moment(item.tripTime).format("ddd, DD-MMM");
        let time = moment(item.tripTime).format("hh:mm A");
        console.warn('trip time --> ', momentDate, time);
        let pinText = item.pinLabel === "OTP"
            ? item.otpType === "CI" ? "Check In OTP" : "Check Out OTP"
            : item.pinLabel;
        return (
            <View padder style={{backgroundColor: item.tripStatus === "Ongoing" ? colors.GREEN : '#EEEEEE'}}>
                {( item.tripStatus === "Ongoing") && (
                    <View style={{flexDirection: 'column',marginLeft:2}}>
                        <Text style={styles.onGoingLabelName}>
                            {item.tripStatus + " Trip"}</Text>
                        <View style={[styles.UnderLine, {borderTopColor: colors.WHITE,width: 68,}]}/>
                    </View>
                )
                }
                {( item.tripStatus === "Upcoming") && (
                    <View style={{flexDirection: 'column',marginLeft:2}}>
                        <Text style={styles.upComingLabelName}>
                            {item.tripStatus + " Trip"}</Text>
                        <View style={[styles.UnderLine, {borderTopColor: colors.GREEN,width: 78,}]}/>
                    </View>
                )
                }
                {( item.tripStatus === "WL") && (
                    <View style={{flexDirection: 'column',marginLeft:2}}>
                        <Text style={styles.wlLabelName}>Waiting List Trip</Text>
                        <View style={[styles.UnderLine, {borderTopColor: colors.WHITE, width: 85,}]}/>
                    </View>
                )
                }
                {item.tripMode == 'FixedRoute' && (
                    <Card style={{
                        margin: 5
                    }}>
                        <Card.Content style={{}}>
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between"
                            }}
                        >
                            <Text style={styles.titleHead}> {(item.tripType === "Pickup" ? "Login" : "Logout") + " : " + time}</Text>
                            <Text style={styles.titleHead}> {momentDate} </Text>
                        </View>
                        {item.metaData.hasOwnProperty("routeName") && item.metaData.routeName !== "" && (
                            <Text style={{marginTop: 5, fontWeight: '600'}}> Route Name : {item.metaData.routeName} </Text>
                        )}
                        {(item.tripType === "Pickup") && (
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between"
                            }}
                        >
                            <Text style={styles.itemText}> ETA : {item.metaData.eta ? item.metaData.eta : "N/A"} </Text>
                        </View>
                         )}
                        {(this.state.viewMore == item.tripTime) && (
                            <View style={{}}>
                                {/* <Text style={{fontWeight: '600'}}> Status : {item.bookingStatus} </Text> */}
                                {/* {item.hasOwnProperty("vehicleType") && item.vehicleType !== ""&& (
                                    <Text style={{marginLeft: 5, fontWeight: '600'}}>
                                        Vehicle : {(item.vehicleReg ? item.vehicleReg : "") + " (" + (item.vehicleType !== "" ? item.vehicleType : "") + ")"}
                                    </Text>)
                                } */}
                                <Text style={{fontWeight: '600'}}> Sequence : {item.metaData.routeIndex + ` (${item.metaData.poi})`} </Text>
                                <Text style={{fontWeight: '600'}}> Office Location : {item.metaData.officeLocation} </Text>
                                {item.metaData.specialRequirement !== "" && (
                                    <Text style={{fontWeight: '600'}}> Special Requirement : {item.metaData.specialRequirement} </Text>
                                )}
                            </View>
                        )}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginTop: 5
                            }}
                        >
                            {/* <Text style={styles.itemText}> ETA : {item.metaData.eta ? item.metaData.eta : "N/A"} </Text> */}
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: 'center',
                                    justifyContent: "flex-start",
                                }}
                            >
                                {/* {(this.state.viewMore != item.tripTime) && (
                                    )} */}
                                <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginLeft: 2,
                                        marginRight: 25
                                    }}>
                                    <Image
                                    defaultSource={vehicle_no}
                                    source={vehicle_no}
                                    resizeMethod="scale"
                                    resizeMode="cover"
                                    style={{ height: 20, width: 20, marginRight: 5 }}
                                    />
                                    <Text style={styles.subTitleHead}> {item.vehicleReg ? item.vehicleReg : "N/A"} </Text>
                                </View>
                                {item.metaData.hasOwnProperty("seatNumber") && item.metaData.seatNumber !== "" && (
                                    <TouchableDebounce
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                    }}
                                    onPress={() => {
                                        if (item.metaData.seatNumber != 0) {
                                            this.props.navigation.navigate("SeatLayout", {
                                                fixRouteId: item.metaData.fixedRouteID,
                                                selectedShiftTime: item.tripTime,
                                                selectedShiftId: item.metaData.shiftID,
                                                selectedSeatId: item.metaData.seatNumber
                                            });
                                        }
                                    }}
                                    >
                                        <Image
                                        defaultSource={seat_no}
                                        source={seat_no}
                                        resizeMethod="scale"
                                        resizeMode="cover"
                                        style={{ height: 20, width: 20, marginRight: 5 }}
                                        />
                                        <Text style={styles.subTitleHead}> {item.metaData.seatNumberDescription} </Text>
                                        {(item.metaData.seatNumber != 0) && (
                                            <MaterialIcons name={"arrow-right"} size={30} color={colors.GREEN}/>
                                        )}
                                    </TouchableDebounce>
                                )}
                            </View>
                            <TouchableDebounce
                            onPress={() => {
                                if (this.state.viewMore != item.tripTime) {
                                    this.setState({viewMore: item.tripTime});
                                } else {
                                    this.setState({viewMore: false});
                                }
                            }}
                            >
                                <Text style={styles.linkText}> {(this.state.viewMore == item.tripTime) ? "Hide Details" : "View Details"} </Text>
                            </TouchableDebounce>
                        </View>
                        {(item.metaData.seatNumber !== 0) && (
                            <View
                                style={{
                                    marginTop: 15,
                                    flexDirection: "row",
                                    justifyContent: "space-between"
                                }}
                            >
                                {item.empCI === "0" && (
                                    <Button style={{backgroundColor: colors.RED}}
                                        onPress={() => {
                                            Alert.alert(
                                                "Cancel Trip",
                                                "Are you sure, you want to cancel the trip?",
                                                [
                                                    {
                                                        text: "No",
                                                        onPress: () => {
                                                        },
                                                        style: "cancel"
                                                    },
                                                    {
                                                        text: "Yes",
                                                        onPress: () => {
                                                            if (item.metaData.type === "FixedRoute") {
                                                                this.props.myStore.cancelFixedRouteTrip(item)
                                                            } else {
                                                                this.props.myStore.isOptOutToShow(item)
                                                            }
                                                        }
                                                    }
                                                ],
                                                { cancelable: true }
                                            );
                                        }}>
                                        Cancel Trip
                                    </Button>
                                )}
                                <TouchableOpacity
                                    onPress={() => {
                                        if (item.empCO !== "1") {
                                            console.warn('track fixed route - ', item.metaData);
                                            this.getFixedRouteTrackingDetails(item.metaData.fixedRouteID, item.metaData.shiftID);
                                        } else {
                                            Alert.alert("My Trips", "You have already checked-out! Tracking is not permitted on completed trips.");
                                        }
                                    }}>
                                    <MaterialCommunityIcons
                                        name="crosshairs-gps"
                                        style={{ fontSize: 40, color: colors.GREEN }}
                                    />
                                </TouchableOpacity>
                                {(item.empCI === "1") && (
                                    <TouchableOpacity
                                        onPress={() => this.props.myStore.enablePanicModel(item)}>
                                        <Image
                                            defaultSource={require("../assets/actions/SOS.png")}
                                            source={require("../assets/actions/SOS.png")}
                                            resizeMethod="scale"
                                            resizeMode="cover"
                                            style={{width:45, height:45}}
                                        />
                                    </TouchableOpacity>
                                )}
                                {(item.empCI !== "1") && (
                                    <Button
                                        style={{backgroundColor: colors.GREEN}}
                                        onPress={() => {
                                            this.checkCameraPermissions(item);
                                        }}
                                    >
                                        Check In
                                    </Button>
                                )}
                            </View>
                        )}
                        {(item.metaData.seatNumberDescription.startsWith('WL')) && (
                            <View
                                style={{
                                    marginTop: 15,
                                    flexDirection: "row",
                                    justifyContent: "space-between"
                                }}
                            >
                                <Button style={{backgroundColor: colors.RED}}
                                    onPress={() => {
                                        Alert.alert(
                                            "Cancel Trip",
                                            "Are you sure, you want to cancel the trip?",
                                            [
                                                {
                                                    text: "No",
                                                    onPress: () => {
                                                    },
                                                    style: "cancel"
                                                },
                                                {
                                                    text: "Yes",
                                                    onPress: () => {
                                                        this.props.myStore.cancelFixedRoutePass(item)
                                                    }
                                                }
                                            ],
                                            { cancelable: true }
                                        );
                                    }}>
                                    Cancel Trip
                                </Button>
                            </View>
                        )}
                        </Card.Content>
                    </Card>
                )}
                {item.tripMode != 'FixedRoute' && (
                <Box
                    margin="2"
                    padding="3"
                    rounded="lg"
                    overflow="hidden"
                    borderColor="coolGray.200"
                    borderWidth="3"
                    _dark={{
                        borderColor: "coolGray.600",
                        backgroundColor: "gray.700",
                    }}
                    _light={{
                        backgroundColor: "gray.50",
                    }}
                // style={{borderRadius:40}} 
                >
                    {/* <Box header bordered style={{ borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }}>
                    </Box> */}
                        <View
                            style={{
                                width:"100%",
                                flexDirection: "row",
                                justifyContent: "space-between"
                            }}
                        >
                            <Text style={[styles.itemName, {textAlign: 'left',marginLeft:-5}]}> {(item.tripMode === 'Adhoc' ? (item.metaData.programID.startsWith("RMADHNSS") && item.metaData.programType == "TD" ? 'Travel Desk Adhoc' : (item.metaData.programID.startsWith("RMADHNSS") && !item.metaData.programType ? 'Emergency Adhoc' : 'Adhoc - ' + (item.tripType === "Pickup" ? "Login" : "Logout"))) : (item.tripType === "Pickup" ? "Login" : "Logout"))}</Text>
                            <Text style={[styles.itemName, {flex: 0.8, fontSize: 18, textAlign: 'right'}]}>
                                {momentDate}
                            </Text>
                        </View>

                    {/* <Box
                        marginTop="2"
                        marginBottom="2"
                    > */}
                        {/* <Stack> */}
                            <View
                                style={{
                                    width: "100%",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Text style={[styles.itemLastMessage, {marginTop: 5}]}>
                                    {item.tripMode == 'Adhoc' && (
                                        <Text style={{fontWeight: "700"}}>Pickup Time : </Text>
                                    )}
                                    {time}
                                </Text>
                                <View>{item.tripMode == 'Roster' && this._renderEtaOrSlot(item)}</View>
                            </View>
                            
                            {item.hasOwnProperty("tripMode") && item.tripMode == 'Roster' && (
                                <Text style={styles.itemLastMessage}>
                                    Booking Type : {item.tripMode}
                                </Text>)
                            }
                            <Text style={styles.itemLastMessage}>
                                Status : {item.bookingStatus}
                            </Text>

                            <Text style={styles.itemLastMessage}>
                                Vehicle : {item.vehicleReg ? item.vehicleReg : "N/A"}
                            </Text>
                            
                            
                            {item.hasOwnProperty("managerApprovalStatus") && item.managerApprovalStatus && item.managerApprovalStatus !=="0"&& (
                                <Text style={styles.itemLastMessage}>
                                    Approval Status : {item.approvalStatus==="P"?"Pending Mgr Approval":item.approvalStatus==="R"?"Rejected by Mgr":"Approved by Mgr"}
                                </Text>)
                            }
                            {item.metaData.hasOwnProperty("routeIndex") &&(
                                <Text style={styles.itemLastMessage}>
                                    Sequence : {item.metaData.routeIndex}
                                </Text>)
                            }
                        {/* </Stack> */}
                    {/* </Box> */}
                    {item.tripStatus === "Ongoing" && item.routeStatus === "1" && (
                        // <View style={{flex: 1, flexDirection: 'row'}}>
                            <View space="3" style={{ width: "100%", flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', marginVertical: 10 }}>
                                {/* <View style={{width:"100%",flexDirection: 'row', justifyContent: 'space-between',alignContent:'center'}}> */}
                                {item.tripMode !== "FixedRoute" && (
                                <Button transparent={true}
                                        style={[styles.newButtonStyle1,{
                                            borderRadius:25,
                                            borderWidth: 1,
                                            borderColor: item.empCO === "1"?colors.BLUE_BRIGHT:colors.GREEN,
                                        }]}
                                        onPress={() => {
                                            if(this.props.myStore.checkinCheckoutDisabled === false) {
                                                if (item.empCO !== "1") {
                                                    (item.empCI === "0") ? this.props.myStore.enableCheckInModel(item)
                                                        : this.props.myStore.enableCheckOutModel(item);
                                                }
                                                else {
                                                    Alert.alert("Check-out", "You have already done Check-out for this trip");
                                                }
                                            }else{
                                                if(item.empCI==='0'){
                                                    this.props.myStore.myTripsDoCheckIn();
                                                }else{
                                                    this.props.myStore.myTripsDoCheckOut().then((res) => {
                                                        console.warn('Direct checkout -- ', res);
                                                        setTimeout(() => {
                                                            Alert.alert(
                                                                'Check Out',
                                                                res.data?.status?.message,
                                                                [
                                                                    {
                                                                        text: "OK",
                                                                        onPress: () => {
                                                                            if (res.data?.status?.message?.includes('Sorry')) {
                                                                                console.warn('checkout error');
                                                                            } else {
                                                                                this.props.myStore.enableFeedbackModal(this);
                                                                                this.props.myStore.getMyTripData();
                                                                                // this.showPreviousdayTrip();
                                                                            }
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
                                                }
                                             }
                                        }}>
                                    {
                                        item.empCO === "1" ?
                                            <Image
                                                defaultSource={require("../assets/actions/CheckOutBlue.png")}
                                                source={require("../assets/actions/CheckOutBlue.png")}
                                                resizeMethod="scale"
                                                resizeMode="cover"
                                                style={styles.iconStyle}
                                            />
                                            : item.empCI === "0" ?
                                            <Image
                                                defaultSource={require("../assets/actions/CheckIn-green.png")}
                                                source={require("../assets/actions/CheckIn-green.png")}
                                                resizeMethod="scale"
                                                resizeMode="cover"
                                                style={styles.iconStyle}
                                            />
                                            : <Image
                                                defaultSource={require("../assets/actions/CheckOut-green.png")}
                                                source={require("../assets/actions/CheckOut-green.png")}
                                                resizeMethod="scale"
                                                resizeMode="cover"
                                                style={styles.iconStyle}
                                            />
                                    }

                                </Button>
                                )}
                                {(item.hasOwnProperty("tripMode") && item.tripMode === "Roster") && item.tripType === "Drop" && (
                                    <Button transparent={true}
                                            style={{backgroundColor: 'transparent'}}
                                            onPress={() => {
                                                if (item.safeDropStatus === "0") {
                                                    if (this.props.myStore.checkinCheckoutDisabled === false) {
                                                        if (item.empCI === "0") {
                                                            Alert.alert(
                                                                "Safe Drop",
                                                                "Before Safe drop you must do the Check-In"
                                                            );
                                                        } else if (item.empCO === "0") {
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
                                                                            this.props.myStore.enableSafeDropModel(item)
                                                                        }
                                                                    }
                                                                ],
                                                                {cancelable: true}
                                                            );
                                                        } else {
                                                            this.props.myStore.enableSafeDropModel(item);
                                                        }
                                                    } else {
                                                        if (item.empCI === "0") {
                                                            Alert.alert(
                                                                "Safe Drop",
                                                                "Before Safe drop you must do the Check-In"
                                                            );
                                                        }else this.props.myStore.enableSafeDropModel(item);
                                                    }
                                                } else {
                                                    Alert.alert("Safe Drop", "You have already done safe drop for this trip");
                                                }
                                            }}
                                    >
                                        {this.props.myStore.checkinCheckoutDisabled === false ?
                                            (item.safeDropStatus === "0" && item.empCI === "0") ?
                                                <Image
                                                    defaultSource={require("../assets/actions/Safedrop-grey.png")}
                                                    source={require("../assets/actions/Safedrop-grey.png")}
                                                    resizeMethod="scale"
                                                    resizeMode="cover"
                                                    style={[styles.iconStyle, {width: 44, height: 44}]}
                                                /> : item.safeDropStatus === "0" ?
                                                <Image
                                                    defaultSource={require("../assets/actions/SafeDropgreen.png")}
                                                    source={require("../assets/actions/SafeDropgreen.png")}
                                                    resizeMethod="scale"
                                                    resizeMode="cover"
                                                    style={[styles.iconStyle, {width: 44, height: 44}]}/>
                                                : <Image
                                                    defaultSource={require("../assets/actions/Safedropblue.png")}
                                                    source={require("../assets/actions/Safedropblue.png")}
                                                    resizeMethod="scale"
                                                    resizeMode="cover"
                                                    style={[styles.iconStyle, {width: 44, height: 44}]}
                                                />
                                            : item.safeDropStatus === "0" ?
                                                <Image
                                                    defaultSource={require("../assets/actions/SafeDropgreen.png")}
                                                    source={require("../assets/actions/SafeDropgreen.png")}
                                                    resizeMethod="scale"
                                                    resizeMode="cover"
                                                    style={[styles.iconStyle, {width: 44, height: 44}]}/>
                                                : <Image
                                                    defaultSource={require("../assets/actions/Safedropblue.png")}
                                                    source={require("../assets/actions/Safedropblue.png")}
                                                    resizeMethod="scale"
                                                    resizeMode="cover"
                                                    style={[styles.iconStyle, {width: 44, height: 44}]}
                                                />
                                        }
                                    </Button>
                                )}
                                {((item.tripMode === "Roster" && item.metaData.programType !== 'TD' && item.empCI === "1") || (item.tripMode === "FixedRoute" && item.empCI === "1")) && (
                                    <Button transparent={true}
                                            style={styles.newButtonStyle1}
                                            onPress={() => this.props.myStore.enablePanicModel(item)}>
                                        <Image
                                            defaultSource={require("../assets/actions/SOS.png")}
                                            source={require("../assets/actions/SOS.png")}
                                            resizeMethod="scale"
                                            resizeMode="cover"
                                            style={[styles.iconStyle,{width:56,height:56}]}
                                        />
                                    </Button>
                                )}
                                <Button transparent={true}
                                        style={styles.newButtonStyle1}
                                        onPress={() => {
                                            if (item.empCO !== "1") {
                                                if (item.tripMode === "FixedRoute") {
                                                    console.warn('track fixed route - ', item.metaData);
                                                    this.getFixedRouteTrackingDetails(item.metaData.fixedRouteID, item.metaData.shiftID);
                                                } else {
                                                    console.warn('regular track');
                                                    this.props.myStore.getTrackVehicleDetails(this).then(() => {
                                                        if (this.props.myStore.trackingData.hasOwnProperty("Trips")) {
                                                            this.props.navigation.navigate("TrackVehicle", {
                                                                Trips: this.props.myStore.trackingData.Trips[0],
                                                                CustomerUrl: this.state.CustomerUrl,
                                                                UserId: global.UserId,
                                                                DMapKey: global.directionMapKey,
                                                                ChatEnabled: this.props.myStore.trackingData.Trips[0].ChatEnabled,
                                                                access_token: this.state.access_token,
                                                                CheckinCheckoutDisabled:this.props.myStore.trackingData.hasOwnProperty("CheckinCheckoutDisabled") ? this.props.myStore.trackingData.CheckinCheckoutDisabled : false,
                                                            });
                                                        }
                                                    });
                                                }
                                            } else {
                                                Alert.alert("My Trips", "You have already checked-out! Tracking is not permitted on completed trips.");
                                            }

                                        }}>
                                    <Ionicons
                                        name="ios-navigate"
                                        style={styles.vectorIcon}
                                    />
                                </Button>
                                {/* </View> */}
                            </View>
                        // </View>
                    )}
                    {/* <Box footer bordered style={{ width: "100%", borderBottomLeftRadius: borderRadius, borderBottomRightRadius: borderRadius }}>
                        <Stack> */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                width: "100%",
                                marginTop:10
                            }}
                        >
                            <Button style={{backgroundColor: colors.RED}}
                                    onPress={() => {
                                        if (item.empCI === "0") {
                                            Alert.alert(
                                                "Cancel Trip",
                                                "Are you sure, you want to cancel the trip?",
                                                [
                                                    {
                                                        text: "No",
                                                        onPress: () => {
                                                        },
                                                        style: "cancel"
                                                    },
                                                    {
                                                        text: "Yes",
                                                        onPress: () => {
                                                            if (item.metaData.type === "FixedRoute") {
                                                                this.props.myStore.cancelFixedRouteTrip(item)
                                                            } else {
                                                                this.props.myStore.isOptOutToShow(item)
                                                            }
                                                        }
                                                    }
                                                ],
                                                { cancelable: true }
                                            );
                                        } else {
                                            Alert.alert("Cancel Trip", "Cancellation cannot be processed at the moment as you have already checked in. For any modifications, please contact the transport admin.");
                                        }
                                    }}>
                                <Text>Cancel Trip</Text>
                            </Button>
                            {(item.empCO !=="1" && item.pin) && (
                                <Button
                                    light
                                    disabled={true}
                                    style={{borderColor: colors.BLUE_BRIGHT,backgroundColor:colors.WHITE}}
                                >
                                    <View style={{flexDirection: 'column'}}>
                                        <Text uppercase={false} style={{color: colors.BLUE_BRIGHT,fontWeight:'bold'}}>
                                            {pinText+" : "+item.pin}
                                        </Text>
                                    </View>
                                </Button>
                            )}
                        </View>
                        {/* </Stack>
                    </Box> */}
                </Box>
                )}
            </View>
        );
    };

    _onRefresh() {
        this.setState({refreshing:true});
        this.props.myStore.getMyTripData().then(()=>{
            this.setState({refreshing:false});
        });
    }

    componentWillUnmount(){
        console.warn('this.changeEventListener - ', this.changeEventListener);
        console.warn('this.focusListener - ', this.focusListener);
        // AppState.removeEventListener("change", this._handleAppStateChange);
        this.changeEventListener && this.changeEventListener.remove();
        // this.focusListener.remove();
        this.props.myStore.clearMyTripProps();
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <StatusBar barStyle="dark-content"/>
                {spinner.visible(this.props.myStore.isLoading)}
                {/* {this.props.myStore.noTrips ? (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                    >
                        <Text style={{justifyContent:'center',margin:12}}>{this.props.myStore.MyTripsErrorMessage}</Text>
                    </View>
                ) : ( */}
                    <View style={styles.container}>
                        <StatusBar barStyle="dark-content"/>
                        <Modal
                            isVisible={this.props.myStore.visibleOptOutModal}
                            style={{justifyContent: 'center', marginVertical: 40, alignContent: 'center'}}
                        >
                            {this._renderDisclaimerType()}
                        </Modal>
                        <Modal
                            isVisible={this.props.myStore.visibleCheckInModal === true}
                            style={styles.bottomModal}
                            onRequestClose={() => {
                                this.props.myStore.disableCheckInModel();
                            }}
                        >
                            <TouchableDebounce
                                style={{ height: "75%", width: "100%" }}
                                onPress={() => this.props.myStore.disableCheckInModel()}ss
                            />
                            {this._renderCheckInModalContent()}
                        </Modal>
                        <Modal
                            isVisible={this.props.myStore.visibleCheckOutModal === true}
                            style={styles.bottomModal}
                            onRequestClose={() => {
                                this.props.myStore.disableCheckOutModel();
                            }}
                        >
                            <TouchableDebounce
                                style={{ height: "75%", width: "100%" }}
                                onPress={() => this.props.myStore.disableCheckOutModel()}
                            />
                            {this._renderCheckOutModalContent()}
                        </Modal>
                        <Modal
                            isVisible={this.props.myStore.visiblePanicModal === true}
                            style={styles.bottomModal}
                            onRequestClose={() => {
                                this.props.myStore.disablePanicModel()
                            }}
                        >
                            <TouchableDebounce
                                style={{ height: "75%", width: "100%" }}
                                onPress={() => this.props.myStore.disablePanicModel()}
                            />
                            {this._renderPanicModalContent()}
                        </Modal>
                        <Modal
                            isVisible={this.props.myStore.visibleSafeDropModal === true}
                            style={{
                                flex: 1,
                                // flexDirection: "column",
                                // position: 'absolute',
                                // bottom: 0,
                                // top: this.state.keyboardSpace ? -10 - this.state.keyboardSpace : -100,
                                // padding: 20,
                                // width: '90%',
                                margin: 20
                            }}

                            onRequestClose={() => {
                                this.props.myStore.disableSafeDropModel()
                            }}
                        >
                            {this._renderSafeDropContent()}
                        </Modal>
                        <Modal
                            isVisible={this.props.myStore.visibleFeedbackModal === true}
                            style={{ flex: 1, flexDirection: "column" }}
                            onRequestClose={() => {
                                this.props.myStore.disableFeedbackModal()
                            }}
                        >
                            {(this.state.feedbackLast24hrTrip?.isFeedbackMandatory !== "1") && (
                                <TouchableDebounce
                                    style={{
                                        width: "100%",
                                        position: "absolute",
                                        right: 10,
                                        top: 25,
                                        justifyContent: "center",
                                        alignItems: "flex-end"
                                    }}
                                    onPress={() => {
                                        this.props.myStore.disableFeedbackModal()
                                    }}
                                >
                                    <Text
                                        style={{ color: colors.WHITE, fontWeight: "700", fontSize: 20 }}
                                    >
                                        Skip
                                    </Text>
                                </TouchableDebounce>
                            )}
                            {this.state.feedbackLoading && (
                                    <Text
                                        style={{ color: colors.WHITE, fontWeight: "700", fontSize: 20 }}
                                    >
                                        Loading...
                                    </Text>
                            )}
                            {!this.state.feedbackLoading && this.state.feedbackLast24hrTrip.hasOwnProperty('tripType') &&
                                this._renderFeedbackContent()
                            }
                            {/* {!this.state.feedbackLoading && !this.state.feedbackLast24hrTrip.hasOwnProperty('tripType') && 
                                this.props.myStore.disableFeedbackModal()
                            } */}
                        </Modal>

                        <FlatList
                            keyExtractor={(y, z) => z.toString()}
                            data={this.props.myStore.MyTripsData}
                            extraData={this.props.myStore.MyTripsData}
                            renderItem={this.renderItem.bind(this)}
                            ListEmptyComponent={() => {
                                return (
                                    <View
                                        style={{
                                            flex: 1,
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Text style={{justifyContent:'center',margin:12}}>{this.props.myStore.MyTripsErrorMessage}</Text>
                                    </View>
                                )
                            }}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this._onRefresh.bind(this)}
                                />
                            }
                        />
                    </View>
                {/* )} */}
            </View>
        );
    }

    _renderSafeDropContent = () =>{
        const Trip = this.props.myStore.safeDropTrip;
        return(
            <Box
                style={{
                    width: "100%",
                    alignContent: "center",
                    alignItems: "center",
                    borderRadius:8,
                    padding: 10,
                    backgroundColor: colors.WHITE
                }}
            >
                    {/* <Box > */}
                    <Text style={{fontSize: 20}}>Safe Drop</Text>
                    {/* </Box> */}
                    {/* <Box> */}
                    <Stack style={{flexDirection: "column", width: "100%", alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{width:"90%", padding:12, alignSelf:"center"}} >{"Please enter the T-Pin "}</Text>
                    <TextInput style={{width: "90%", padding: 12, alignSelf: "center", color: colors.BLACK}}
                               placeholder={"T-Pin"}
                               keyboardType={'number-pad'}
                               maxLength={4}
                               borderBottomWidth={1}
                               borderBottomColor={colors.BLACK}
                               ref= {(el) => { this.pin = el; }}
                               onChangeText={(pin) => this.setState({pin})}
                               value={this.state.pin}
                               returnKeyType={'done'}
                    />
                    </Stack>
                    {/* </Box> */}
                <View style={{flexDirection: 'row',width:'90%',padding:12,justifyContent:'space-around'}}>
                    <Button style={{backgroundColor: colors.RED, width: '45%'}}  onPress={() => {
                        this.props.myStore.disableSafeDropModel();
                        this.setState({pin:""});
                    }}>
                        <Text>Cancel</Text>
                    </Button>
                    <Button style={{backgroundColor: colors.GREEN, width: '45%'}} onPress={() => {
                        if(this.state.pin.toString().length===4) {
                            if (this.state.pin === Trip.tPin) {
                                this.props.myStore.myTripsSafeDrop().then((res) => {
                                    console.warn('Safedrop checkout -- ', res);
                                    Alert.alert(
                                        'Safe Drop',
                                        res.data?.status?.message,
                                        [
                                            {
                                                text: "OK",
                                                onPress: () => {
                                                    this.props.myStore.disableSafeDropModel()
                                                    this.props.myStore.enableFeedbackModal(this);
                                                    this.props.myStore.getMyTripData();
                                                    // this.showPreviousdayTrip();
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
                                Alert.alert("Safe Drop", "Invalid T-Pin ");
                            }
                        }else{
                            Alert.alert("Safe Drop", "Please enter valid T-Pin ");
                        }
                    }}>
                        <Text>
                            Submit
                        </Text>
                    </Button>
                </View>
            </Box>
    )};

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
                        this.props.myStore.myTripsDoCheckIn();
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
                            animating={this.props.myStore.isLoading}
                        />
                        {this.props.myStore.isLoading && (
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
                        {!this.props.myStore.isLoading && (
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
                        this.props.myStore.myTripsDoCheckOut().then((res) => {
                            console.warn('slide checkout -- ', res);
                            setTimeout(() => {
                                Alert.alert(
                                    'Check Out',
                                    res.data?.status?.message,
                                    [
                                        {
                                            text: "OK",
                                            onPress: () => {
                                                if (res.data?.status?.message?.includes('Sorry')) {
                                                    console.warn('checkout error');
                                                } else {
                                                    this.props.myStore.enableFeedbackModal(this);
                                                    this.props.myStore.getMyTripData();
                                                    // this.showPreviousdayTrip();
                                                }
                                            }
                                        }
                                    ],
                                    { cancelable: false }
                                );
                            }, 500);
                        }).catch((err) => {
                            console.warn('slide checkout error -- ', err);
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
                            animating={this.props.myStore.isLoading}
                        />
                        {this.props.myStore.isLoading && (
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
                        {!this.props.myStore.isLoading && (
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
                                        Slide right to Check-Out 
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
                                   Slide right to Check-Out
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
                    !this.state.isSliderLoading && this.props.myStore.myTripsDoCheckPanic();
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
                        animating={this.props.myStore.isLoading}
                    />
                    {this.props.myStore.isLoading && (
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
                    {!this.props.myStore.isLoading && (
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
                        </Shimmer>
                    )}
                </View>
            </RNSlidingButton>
        </View>
    );
    _renderFeedbackContent = () => (
        <View style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'stretch',
        }}>
            <Box
                style={{
                    width: "100%",
                    // height: "52%",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: colors.WHITE,
                    padding: 10,
                    borderRadius: 8
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
                        <Text style={[styles.itemName, { fontWeight: "700" }]}>
                            {this.state.feedbackLast24hrTrip.tripType}
                        </Text>

                        <Text style={[styles.itemName, { fontSize: 18 }]}>
                            {this.state.feedbackLast24hrTrip.tripId}
                        </Text>
                    </View>
                </HStack>
                {/* <HStack bordered> */}
                    <Stack >
                        <Text style={[styles.itemLastMessage]}>
                            Driver Name : {this.state.feedbackLast24hrTrip.driverName}
                        </Text>
                        <Text style={styles.itemLastMessage}>
                            Vehicle No. : {this.state.feedbackLast24hrTrip.vehicleRegNo}
                        </Text>
                        <Text style={[styles.itemLastMessage]}>
                            {moment(this.state.feedbackLast24hrTrip.shiftTime).format(
                                "DD MMM YYYY hh:mmA"
                            )}
                        </Text>
                    </Stack>
                {/* </HStack> */}
                {/* <HStack
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
                            this.state.tempRating /*feedbackLast24hrTrip.feedbackRating*
                        }
                        selectedStar={rating =>
                            this.onStarRatingPress(rating, this.state.feedbackLast24hrTrip)
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
                            this.onStarRatingPress(rating, this.state.feedbackLast24hrTrip)
                        }
                        style={{ paddingVertical: 10 }}
                    />
                {/* </HStack> */}
                {this.state.enableComment && (
                    <>
                    <Stack style={{flexDirection: "column", width: "100%", alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{width:"90%", paddingVertical:12, alignSelf:"center", fontSize: 16}} >Comments</Text>
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
                            this.onStarRatingPress(this.state.tempRating, this.state.feedbackLast24hrTrip, true);
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
    _renderEtaOrSlot(item) {
        if (item.boardingTime && item.boardingTime.includes("T")) {
            var eta = moment(item.boardingTime).format("hh:mmA");
        }
        return (
            <Text style={[styles.itemLastMessage, {marginTop: 5}]}>
                {(() => {
                    if (item.tripType === "Pickup") {
                        return `ETA : ${
                            eta && item.metaData.type === "Roster" ? eta : "N/A"
                        }`;
                    } else {
                        return `SLOT# : ${item.parkingSlot ? item.parkingSlot : "N/A"}`;
                    }
                })()}
            </Text>
        );
    }

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
                                    this.props.myStore.setLocation(data.coords.latitude + "," + data.coords.longitude);
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
                        this.props.myStore.setLocation("0.0,0.0");
                        console.warn(err);
                    }
                }).catch(err => {
                this.props.myStore.setLocation("0.0,0.0");
                console.warn("requestStatus " + JSON.stringify(err));
            });
        } else {
            Geolocation.requestAuthorization();
            Geolocation.getCurrentPosition((data) => {
                this.props.myStore.setLocation(data.coords.latitude + "," + data.coords.longitude);
            }, (Error) => {
                console.warn("Error " + JSON.stringify(Error));
            });
        }
        check(Platform.OS === "ios" ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
            .then(result => {
                switch (result) {
                    case RESULTS.UNAVAILABLE:
                        this.props.myStore.setLocation("0.0,0.0");
                        break;
                    case RESULTS.DENIED:
                        this.props.myStore.setLocation("0.0,0.0");
                        break;
                    case RESULTS.GRANTED:
                        try {
                            Geolocation.getCurrentPosition((data) => {
                                this.props.myStore.setLocation(data.coords.latitude + "," + data.coords.longitude);

                            }, (Error) => {
                                this.props.myStore.setLocation("0.0,0.0");
                            }, { enableHighAccuracy: false, timeout: 50000 });
                        } catch (e) {
                            this.props.myStore.setLocation("0.0,0.0");
                        }
                        break;
                    case RESULTS.BLOCKED:
                        this.props.myStore.setLocation("0.0,0.0");
                        break;
                }
            })
            .catch(error => {

            });
    }

    checkCameraPermissions(data) {
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
                        this.props.navigation.navigate("QRScanner", {
                            isFacilityPass: false,
                            returnData: this._onRefresh.bind(this),
                        });
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

    onStarRatingPress(rating, item, directSubmit) {
        console.warn("RATING "+JSON.stringify(item));
        this.setState({ tempRating: rating }, () => {
            if (item.feedbackRating > 0) return;
            var momentDate = moment(item.shiftTime);
            var hour = momentDate.hours();
            var minutes = momentDate.minutes();
            const { navigate } = this.props.navigation;
            let body = {
                tripId: item.tripId,
                shiftDate: item.shiftTime,
                shiftTime: hour + ":" + minutes,
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
            console.warn('additionalFB - ', additionalFB, ' | enableComment - ', enableComment);
            if (additionalFB) { // rating < 4
                this.setState({
                    isLoading: true
                });
                let feedback = {
                    tripId: item.tripId,
                    shiftDate: item.shiftTime,
                    shiftTime: hour + ":" + minutes,
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
                        Last24hrTrips: "Last24hrTrips"
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
                                            Last24hrTrips: "Last24hrTrips",
                                            lastRatedDate: this.state.lastRatedDate
                                        }
                                    );
                                }
                            }
                        ],
                        { cancelable: true }
                    );
                }, 300);
            }
        });
    }

    showPreviousTripPopup() {
        setTimeout(() => {
            this.setState({ tempRating: 0.0 });
        }, 0);
    }

    showPreviousdayTrip() {
console.warn('calling showPreviousdayTrip');
        let UserId = this.state.UserId;
        let CustomerUrl = this.state.CustomerUrl;
        let access_token = this.state.access_token;

        let url =
            URL.FEEDBACK_PREVIOUS_DAY +
            "devicecode=" +
            UserId +
            "&apiurl=" +
            CustomerUrl;
            console.warn('showPreviousdayTrip calling this URL -> ', url);
        API.newFetchXJSON(
            url,
            access_token,
            this.callback.bind(this),
            TYPE.FEEDBACK_PREVIOUS_DAY,
            {
                access_token,
                UserId,
                CustomerUrl,
                lastTripId: '',
                lastRatedDate: ''
            }
        );
    }

    getFixedRouteTrackingDetails(fixedRouteId, shiftId) {
        this.setState({ isLoading: true });
        let url = URL.GET_FIXED_ROUTE_TRACKING_DETAILS + "?FixedRouteID=" + fixedRouteId + "&ShiftID=" + shiftId;
        console.warn('GET_FIXED_ROUTE_TRACKING_DETAILS URL - ', url);
        API.newFetchXJSON(
          url,
          true,
          this.callback.bind(this),
          TYPE.GET_FIXED_ROUTE_TRACKING_DETAILS,
          {
            fixedRouteID: fixedRouteId,
            shiftID: shiftId,
            access_token: this.state.access_token
          }
        );
    }
    
    callback = async (actionType, response, copyDataObj) => {
        // console.warn('Callback res ---> ', actionType, response, copyDataObj);
        const { navigate } = this.props.navigation;
        switch (actionType) {
            case TYPE.FEEDBACK_PREVIOUS_DAY: {

                handleResponse.feedbackLast24hrTrip(
                    response,
                    this,
                    copyDataObj.access_token,
                    copyDataObj.UserId,
                    copyDataObj.CustomerUrl,
                    copyDataObj.lastTripId,
                    copyDataObj.lastRatedDate
                );
                break;
            }
            case TYPE.FEEDBACK_CATEGORIES: {
                this.props.myStore.disableFeedbackModal();
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
                this.props.myStore.disableFeedbackModal();
                handleResponse.submitFeedback(
                    response,
                    this,
                    copyDataObj.rating,
                    copyDataObj.Last24hrTrips,
                    copyDataObj.lastRatedDate
                );
                break;
            }
            case TYPE.GET_FIXED_ROUTE_TRACKING_DETAILS: {
                handleResponse.getFixedRouteTrackingDetailsNEW(response, this, copyDataObj);
                break;
            }
        }
    };
}

export default MyTripsMobx;


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    itemBlock: {
        flexDirection: "row",
        paddingBottom: 10
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 25
    },
    itemMeta: {
        marginLeft: 10,
        justifyContent: "center"
    },
    itemName: {
        fontSize: 20,
        marginTop: 5
    },
    onGoingLabelName: {
        fontSize: 16,
        padding: 4,
        fontWeight: "800",
        color:colors.WHITE,
        borderBottomWidth:1,
        borderBottomColor:colors.WHITE
    },
    upComingLabelName: {
        fontSize: 16,
        padding: 4,
        fontWeight: "800",
        color:colors.GREEN,
        borderBottomWidth:1,
        borderBottomColor:colors.GREEN
    },
    wlLabelName: {
        fontSize: 16,
        padding: 4,
        fontWeight: "800",
        color:colors.RED,
        borderBottomWidth:1,
        borderBottomColor:colors.RED
    },
    itemLastMessage: {
        fontSize: 16,
        color: "#111",
        marginTop: 5
    },
    separator: {
        height: 0.5,
        width: "100%",
        alignSelf: "center",
        backgroundColor: "#555"
    },
    header: {
        padding: 10
    },
    headerText: {
        fontSize: 30,
        fontWeight: "900"
    },
    navBar: {
        height: 60,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "blue"
    },
    leftContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-start",
        backgroundColor: "green"
    },
    rightContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "red"
    },
    rightIcon: {
        height: 10,
        width: 10,
        resizeMode: "contain",
        backgroundColor: "white"
    }, vectorIcon: {
        fontSize: 60,
        color: colors.GREEN,
        width:56,
        height:56,
        alignSelf:'center'
    },
    buttonText:{
        color:colors.BLACK,
        alignSelf: 'center',
        justifyContent:'center',
    }, iconStyle: {
        width: 40,
        height: 40,
        borderRadius:20,
        margin:4
    },modalContent: {
        height: "25%",
        backgroundColor: "transparent",
        justifyContent: "flex-end",
        alignItems: "flex-end",
        borderRadius: 4,
        borderColor: "rgba(0, 0, 0, 0.1)"
    },
    newButtonStyle: {
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: {height: 1, width: 1}, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 6, // Android
        backgroundColor: colors.WHITE,
        height: 50,
        width: 50,
        borderRadius: 25,
        alignContent:'center'
    },
    newButtonStyle1: {
        backgroundColor: colors.WHITE,
        height: 50,
        width: 50,
        alignSelf:'center',
        alignContent:'center'
    },
    UnderLine: {
        height: 0,
        marginLeft: 4,
        borderTopWidth: 2,
    },

    titleHead: {
        fontSize: 16,
        fontWeight: '900'
    },
    subTitleHead: {
        fontSize: 14,
        fontWeight: '900'
    },
    itemText: {
        fontWeight: '900'
    },
    linkText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.LIGHT_BLUE,
        textDecorationLine: 'underline'
    },
});

