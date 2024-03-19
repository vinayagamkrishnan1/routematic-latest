import React, {Component} from "react";
import {ActivityIndicator, Alert, FlatList, ScrollView, StatusBar, Text, View} from "react-native";
import {Button, Card} from "native-base";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {SafeAreaView} from '@react-navigation/native';
import {colors} from "../../utils/Colors";
import {
    _renderDate,
    _renderOffice,
    _renderTitleContent,
    _renderWeeklyOff
} from "../roster/customeComponent/customComponent";
import {
    findAddress,
    findID,
    findLat,
    findLng,
    findName,
    getAutoWeeklyOff,
    getCalculatedCreateRoster,
    getDates,
    getDaysInMonth,
    weeklyOffDaysToNumber
} from "../roster/customeComponent/RosterCustomFunctions";
import TouchableDebounce from "../../utils/TouchableDebounce";
import Moment from "moment";
import {extendMoment} from "moment-range";
import {filterShiftTimeBasedOnCutOffTime} from "../../utils/customFunction";
import {SlideAnimation} from "react-native-popup-dialog";
import {API} from "../../network/apiFetch/API";
import {URL} from "../../network/apiConstants";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import {asyncString} from "../../utils/ConstantString";
import {viewNotSelectedRosterTypeStyle, viewSelectedStyle} from "./customeComponent/customComponent";
import Ionicons from "react-native-vector-icons/Ionicons";
import {TYPE} from "../../model/ActionType";
import * as HOC from "../../components/hoc";
import _ from "lodash";
import {rosterType} from "./customeComponent/RosterType";
import Calendar from "react-native-calendar-select";
import {mapDelta} from "../../utils/MapHelper";
import Modal from "react-native-modal";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import * as Alert1 from "../../utils/Alert";
import * as Toast from "../../utils/Toast";
import { CryptoXor } from "crypto-xor";

const ViewLoader = HOC.LoaderHOC(View);

const moment = extendMoment(Moment);
const slideAnimation = new SlideAnimation({
    slideFrom: "bottom"
});
let calculateRoster = [];
let rosterDetailsLocations = [];
let rosterDetailsLocationsWithoutOthers = [];

class CreateRosterNew extends Component {
    static navigationOptions = {
        title: "Create Roster",
        headerTitleStyle: {fontFamily: "Roboto"}
    };
    state = {
        isLoading: false,
        CustomerUrl: "",
        UserId: "",
        access_token: "",
        officeSelected: "",
        loginSelected: "",
        logoutSelected: "",
        pickupLocationSelected: "",
        dropLocationSelected: "",
        weeklyOffStateValue: [],
        rosterDetails: {
            Locations: [],
            Offices: [],
            Rosters: [],
            AvailableRosters: "",
            EligibleRosterDays: 0,
            RosteringAllowedLogin: 0,
            RosteringAllowedLogout: 0
        },
        ToDate: "",
        FromDate: "",
        markedDates: getDaysInMonth(moment().month(), moment().year(), []),
        Locations: [],
        showLoader: false,
        DISABLED_DAYS: [],
        rosterType: rosterType.both,
        isRosterOptOutEnabled: false,
        disclaimerType: "",
        accepted: false,
        optOutAccepted: false,
        visibleOptOutModal: false,
    };
    callback = async (actionType, response) => {
        switch (actionType) {
            case TYPE.CREATE_ROSTER: {
                handleResponse.createRosterForSelectedDate(response, this);
                break;
            }
        }
    };
    _renderDisclaimerType = () => (
        <View padder style={{marginTop: 16, backgroundColor: "#FFFFFF"}}>
            <StatusBar barStyle="light-content"/>
            <Card style={{padding: 10}}>
                <ScrollView>
                    {this._renderContent(this.state.RosterContent)}
                    {this._renderTC()}
                </ScrollView>
            </Card>
        </View>
    );

    _renderContent(data) {
        return <Text style={{marginTop: 8}}>{data}</Text>;
    }

    toggleAccept() {
        this.state.accepted
            ? this.setState({accepted: false})
            : this.setState({accepted: true});
    }

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
                    onPress={() => this.toggleAccept()}
                >
                       <View 
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                    >
                    <FontAwesome
                        name={this.state.accepted ? "check-square-o" : "square-o"}
                        color={colors.BLACK}
                        size={25}
                    />
                    <Text style={{marginLeft: 5, fontWeight: "700", color: "black",marginTop:5}}>
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
                            this.setState({
                                visibleOptOutModal: false,
                                accepted: false,
                                optOutAccepted: false
                            })
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
                            backgroundColor: this.state.accepted
                                ? "rgba(50,205,50,1)"
                                : "rgba(192,192,192,0.5)"
                        }}
                        onPress={() => {
                            if (!this.state.accepted) {
                                Toast.show("Please Accept the Opt-Out");
                                return;
                            }
                            this.optOutSelected();
                        }}
                    >
                        <Text style={{color: colors.WHITE}}>Accept</Text>
                    </Button>
                </View>
            </React.Fragment>
        );
    }

    optOutSelected = () => {
        this.setState({
            optOutAccepted: true,
            visibleOptOutModal: false
        });
        setTimeout(() => {
            this.createRoster()
        }, 60);
    };
    setOfficeLocation = officeSelected => {
        this.setLoader();
        let officeList = this.state.rosterDetails.Offices;
        let office;
        for (let i = 0; i < officeList.length; i++) {
            if (officeList[i].Name === officeSelected) {
                office = officeList[i];
            }
        }
        const autoWeeklyOffCalculation = getAutoWeeklyOff(this.state.rosterDetails, (office.ID));
        const weeklyOffStateValue = autoWeeklyOffCalculation.autoWeekDayArray;
        this.setState({
            officeSelected,
            weeklyOffStateValue,
            FromDate: "Select",
            ToDate: "Select",
            loginSelected: "Select",
            logoutSelected: "Select",
            pickupLocation: "Select",
            dropLocation: "Select",
            pickupLocationSelected: "Select",
            dropLocationSelected: "Select"
        });
        this.stopLoader();
    };
    setLoginTime = loginSelected => {
        this.setLoader();
        setTimeout(() => {
            this.setState({
                loginSelected,
                pickupLocationSelected: "Select",
            });
            let pickupLocationSelected;
            if (!loginSelected.toString().includes("Select")) {
                pickupLocationSelected = this.state.pickupLocationSelected ? this.checkNodalName(
                    this.state.pickupLocationSelected,
                    this.state.rosterDetails.RosteringAllowedLogin === 1
                        ? calculateRoster[0].AllowOtherLocationsLogin === 1
                        ? [...rosterDetailsLocations]
                        : [...rosterDetailsLocationsWithoutOthers]
                        : [],
                    calculateRoster[0].RestrictToPOILogin
                ) : "Select";
            }
            console.warn("pickupLocationSelected " + pickupLocationSelected);
            if (!pickupLocationSelected || pickupLocationSelected.includes("Select")) {
                let location = this.state.rosterDetails.RosteringAllowedLogin === 1
                    ? calculateRoster[0].AllowOtherLocationsLogin === 1
                        ? [...rosterDetailsLocations]
                        : [...rosterDetailsLocationsWithoutOthers]
                    : [];
                console.warn("1212login loc " + JSON.stringify(location));
                if (location.length > 2) {
                    pickupLocationSelected = "Select"
                } else pickupLocationSelected = location[0].Name
            }
            this.setState({
                pickupLocationSelected: pickupLocationSelected ? pickupLocationSelected : "Select",
                isLoading: false
            });
        }, 10);
    };
    setLogoutTime = logoutSelected => {
        this.setLoader();
        setTimeout(() => {
            this.setState({
                logoutSelected,
                isLoading: false
            });
            let dropLocationSelected;
            if (!logoutSelected.toString().includes("Select")) {
                dropLocationSelected = this.state.dropLocationSelected ? this.checkNodalName(
                    this.state.dropLocationSelected,
                    this.state.rosterDetails.RosteringAllowedLogout === 1
                        ? calculateRoster[0].AllowOtherLocationsLogout === 1
                        ? [...rosterDetailsLocations]
                        : [...rosterDetailsLocationsWithoutOthers]
                        : [],
                    calculateRoster[0].RestrictToPOILogout,
                ) : "Select";
            }
            if (!dropLocationSelected || dropLocationSelected.includes("Select")) {
                let location = this.state.rosterDetails.RosteringAllowedLogout === 1
                    ? calculateRoster[0].AllowOtherLocationsLogout === 1
                        ? [...rosterDetailsLocations]
                        : [...rosterDetailsLocationsWithoutOthers]
                    : [];
                console.warn("1212 out  loc " + JSON.stringify(location));
                if (location.length > 2) {
                    dropLocationSelected = "Select"
                } else dropLocationSelected = location[0].Name
            }
            console.warn("logout " + dropLocationSelected);
            this.setState({
                dropLocationSelected: dropLocationSelected ? dropLocationSelected : "Select",
                isLoading: false
            });
        }, 10);

    };
    _renderStartEndTime = (LoginShifts, LogoutShifts) => {
        return (
            <View
                style={{
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingTop: 10,
                    paddingBottom: 10,
                    flexDirection: "row",
                    justifyContent: "flex-start"
                }}
            >
                {(this.state.rosterType === rosterType.pickup ||
                    this.state.rosterType === rosterType.both) && (
                    <TouchableDebounce
                        onPress={() => {
                            if (!this.state.FromDate || this.state.FromDate === "Select" || !this.state.FromDate || this.state.ToDate === "Select") {
                                Alert.alert(
                                    "Create Roster",
                                    "Please select Start Date & End Date"
                                );
                                return;
                            }
                            if (LoginShifts.length <= 0) {
                                Alert.alert("Update Roster", "Login Shifts are not available.");
                            } else {
                                this.setState({
                                    pickupLocationSelected: "Select"
                                });
                                this.props.navigation.navigate("TimePicker", {
                                    shiftType: "login",
                                    shiftTimes: LoginShifts + "|Cancel",
                                    selectedShiftTime: this.state.loginSelected,
                                    setLoginTime: this.setLoginTime.bind(this)
                                });
                            }
                        }}
                        style={{
                            width:
                                this.state.rosterType === rosterType.pickup ? "100%" : "50%"
                        }}
                    >
                        {_renderTitleContent(
                            "Login Time",
                            this.state.loginSelected ? this.state.loginSelected : "Select",
                            ""
                        )}
                    </TouchableDebounce>
                )}
                {(this.state.rosterType === rosterType.drop ||
                    this.state.rosterType === rosterType.both) && (
                    <TouchableDebounce
                        onPress={() => {
                            if (!this.state.FromDate || this.state.FromDate === "Select" || !this.state.FromDate || this.state.ToDate === "Select") {
                                Alert.alert(
                                    "Create Roster",
                                    "Please select Start Date & End Date"
                                );
                                return;
                            }
                            if (LogoutShifts.length <= 0) {
                                Alert.alert("Update Roster", "Logout Shifts are not available. ");
                            } else {
                                this.setState({
                                    dropLocationSelected: "Select"
                                });
                                this.props.navigation.navigate("TimePicker", {
                                    shiftType: "logout",
                                    shiftTimes: LogoutShifts + "|Cancel",
                                    selectedShiftTime: this.state.logoutSelected,
                                    setLogoutTime: this.setLogoutTime.bind(this)
                                });
                            }
                        }}
                        style={{
                            width: this.state.rosterType === rosterType.drop ? "100%" : "50%"
                        }}
                    >
                        {_renderTitleContent(
                            "Logout Time",
                            this.state.logoutSelected ? this.state.logoutSelected : "Select",
                            this.state.logoutSelected && (this.state.logoutSelected.includes("*"))
                                ? "*"
                                : ""
                        )}
                    </TouchableDebounce>
                )}
            </View>
        );
    };
    _renderStartEndDate = () => {
        let endDayNumber = moment(this.state.ToDate)
            .add(this.state.ToDate ? 0 : 1, "day")
            .format("DD");
        let endDayName = moment(this.state.ToDate)
            .add(this.state.ToDate ? 0 : 1, "day")
            .format("dddd");
        let endDayMonthYear = moment(this.state.ToDate)
            .add(this.state.ToDate ? 0 : 1, "day")
            .format("MMM YYYY");
        let startDayNumber = moment(this.state.FromDate)
            .add(this.state.FromDate ? 0 : 1, "day")
            .format("DD");
        let startDayName = moment(this.state.FromDate)
            .add(this.state.FromDate ? 0 : 1, "day")
            .format("dddd");
        let startDayMonthYear = moment(this.state.FromDate)
            .add(this.state.FromDate ? 0 : 1, "day")
            .format("MMM YYYY");
        return (
            <View
                style={{
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingTop: 10,
                    paddingBottom: 10
                }}
            >
                <View
                    style={{
                        flexDirection: "row"
                    }}
                >
                    <TouchableDebounce
                        onPress={() => this.openCalendar()}
                        style={{width: "50%"}}
                    >
                        {_renderDate(
                            "From Date",
                            startDayNumber === "Invalid date" ? "Select" : startDayNumber,
                            startDayMonthYear === "Invalid date" ? "" : startDayMonthYear,
                            startDayName === "Invalid date" ? "" : startDayName
                        )}
                    </TouchableDebounce>
                    <TouchableDebounce
                        onPress={() => this.openCalendar()}
                        style={{width: "50%"}}
                    >
                        {_renderDate(
                            "To Date",
                            endDayNumber === "Invalid date" ? "Select" : endDayNumber,
                            endDayMonthYear === "Invalid date" ? "" : endDayMonthYear,
                            endDayName === "Invalid date" ? "" : endDayName
                        )}
                    </TouchableDebounce>
                </View>
            </View>
        );
    };
    /****************************** Pickup/Drop *****************************************/
    _renderPickupAndDrop = (
        Locations,
        rosterDetails,
        calculateRoster,
        rosterDetailsLocations,
        rosterDetailsLocationsWithoutOthers
    ) => {

        let login = this.state.rosterType === rosterType.both ? "Login Pickup Location" : "Pickup Location";
        let logout = this.state.rosterType === rosterType.both ? "Logout Drop Location" : "Drop Location";
        let region;
        for (let i = 0; i < Locations.length; i++) {
            if (Locations[i].ID === "H") {
                region = {latitude: parseFloat(Locations[i].Lat), longitude: parseFloat(Locations[i].Lng), ...mapDelta};
            }
        }
        return (
            <View
                style={{
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingTop: 10,
                    paddingBottom: 10,
                    flexDirection: "column"
                }}
            >
                <View
                    style={{
                        flexDirection: "row"
                    }}

                >
                    {(this.state.rosterType === rosterType.pickup ||
                        this.state.rosterType === rosterType.both) && (<Text style={[{
                        fontFamily: "Helvetica",
                        fontSize: 13,
                        textAlign: "left",
                        color: colors.GRAY
                    }, {marginLeft: 3}]}>{login}</Text>)}

                    {(this.state.rosterType === rosterType.drop ||
                        this.state.rosterType === rosterType.both) && (
                        <Text style={[{
                            fontFamily: "Helvetica",
                            fontSize: 13,
                            textAlign: "left",
                            color: colors.GRAY
                        }, {marginLeft: this.state.rosterType === rosterType.drop ? 0 : 25}]}>{logout}</Text>)}
                </View>
                <View
                    style={{
                        flexDirection: "row"
                    }}
                >
                    {(this.state.rosterType === rosterType.pickup ||
                        this.state.rosterType === rosterType.both) && (
                        <TouchableDebounce
                            onPress={() => {
                                if (!this.state.FromDate || this.state.FromDate === "Select") {
                                    Alert.alert(
                                        "Create Roster",
                                        "Please select Start Date & End Date"
                                    );
                                    return;
                                } else if (!this.state.loginSelected || this.state.loginSelected === "Select") {
                                    Alert.alert("Create Roster", "Please select Login Time");
                                    return;
                                }
                                if (Locations)
                                    this.props.navigation.navigate("AddressPicker", {
                                        type: "Pickup",
                                        Locations: rosterDetails.RosteringAllowedLogin === 1
                                            ? calculateRoster[0].AllowOtherLocationsLogin === 1
                                                ? [...rosterDetailsLocations]
                                                : [...rosterDetailsLocationsWithoutOthers]
                                            : [],
                                        setLocation: this.setPickupLocation.bind(this),
                                        selected: this.state.pickupLocationSelected,
                                        showOtherLocation: calculateRoster[0].AllowOtherLocationsLogin === 1,
                                        addNewLocation: this.addNewLocation.bind(this),
                                        RestrictToPOI: calculateRoster[0].RestrictToPOILogin,
                                        MaxOtherLocationCount: rosterDetails.MaxOtherLocationCount,
                                        region: region
                                    });
                            }}
                            style={{
                                width:
                                    this.state.rosterType === rosterType.pickup ? "100%" : "50%"
                            }}
                        >
                            {_renderTitleContent(
                                "Login:Pickup location",
                                this.state.pickupLocationSelected ? this.state.pickupLocationSelected : "Select",
                                null,
                                "something"
                            )}
                        </TouchableDebounce>
                    )}
                    {(this.state.rosterType === rosterType.drop ||
                        this.state.rosterType === rosterType.both) && (
                        <TouchableDebounce
                            onPress={() => {
                                if (!this.state.ToDate || this.state.ToDate === "Select") {
                                    Alert.alert(
                                        "Create Roster",
                                        "Please select Start Date & End Date"
                                    );
                                    return;
                                } else if (!this.state.logoutSelected || this.state.logoutSelected === "Select") {
                                    Alert.alert("Create Roster", "Please select Logout Time");
                                    return;
                                }
                                this.props.navigation.navigate("AddressPicker", {
                                    type: "Drop",
                                    Locations: rosterDetails.RosteringAllowedLogout === 1
                                        ? calculateRoster[0].AllowOtherLocationsLogout === 1
                                            ? [...rosterDetailsLocations]
                                            : [...rosterDetailsLocationsWithoutOthers]
                                        : [],
                                    setLocation: this.setDropLocation.bind(this),
                                    selected: this.state.dropLocationSelected,
                                    showOtherLocation: calculateRoster[0].AllowOtherLocationsLogout === 1,
                                    addNewLocation: this.addNewLocation.bind(this),
                                    RestrictToPOI: calculateRoster[0].RestrictToPOILogout,
                                    MaxOtherLocationCount: rosterDetails.MaxOtherLocationCount,
                                    region: region

                                });
                            }}
                            style={{
                                width:
                                    this.state.rosterType === rosterType.drop ? "100%" : "50%"
                            }}
                        >
                            {_renderTitleContent(
                                "Logout : Drop location",
                                this.state.dropLocationSelected ? this.state.dropLocationSelected : "Select",
                                null,
                                "something"
                            )}
                        </TouchableDebounce>
                    )}
                </View>
            </View>
        );
    };
    checkNodalName = (pickupLocationSelected, Locations, POIAllowed) => {
        let newName;
        if (Locations && parseInt(POIAllowed) === 1) {
            Locations.map(location => {
                if (location.ID === "H") {
                    newName = location.Name + "-Nodal";
                }
            });
        }
        /*else {
                   if ((pickupLocationSelected.includes("Select")) && Locations.length === 2 ? Locations[1].ID === "O" : Locations.length === 1) {
                       newName = Locations[0].Name;
                   }
               }*/
        return newName ? newName : pickupLocationSelected;
    };
    _renderRosterType = () => {
        return (
            <View
                style={{
                    width: "100%",
                    height: 50,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10
                }}
            >
                <Card
                    style={{
                        flexDirection: "row",
                        borderRadius: 25,
                        justifyContent: "space-between",
                        marginLeft: 50,
                        marginRight: 50
                    }}
                >
                    <TouchableDebounce
                        style={this.state.rosterDetails.RosteringAllowedLogin === 1 ?
                            this.state.rosterType === rosterType.pickup
                                ? [viewSelectedStyle, {flexDirection: "row", width: 100}]
                                : {
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginLeft: 15,
                                    width: 80
                                }
                            : viewNotSelectedRosterTypeStyle
                        }
                        onPress={() => {
                            if (this.state.rosterDetails.RosteringAllowedLogin === 1) {
                                setTimeout(
                                    () =>
                                        this.setState({
                                            rosterType: rosterType.pickup,
                                            logoutSelected: "",
                                            dropLocationSelected: "",
                                            loginSelected: "",
                                            pickupLocationSelected: "",
                                            FromDate: "Select",
                                            ToDate: "Select",
                                        }),
                                    0
                                )
                            }
                        }}
                    >
                        {this.state.rosterType === rosterType.pickup && (
                            <Ionicons
                                name={"ios-checkmark-circle"}
                                style={{color: colors.WHITE}}
                                size={20}
                            />
                        )}
                        <Text
                            style={{
                                color: this.state.rosterDetails.RosteringAllowedLogin === 1 ?
                                    this.state.rosterType === rosterType.pickup
                                        ? colors.WHITE
                                        : colors.BLACK
                                    : colors.GRAY,
                                marginLeft: 12,
                                fontWeight: 'bold'
                            }}
                        >
                            Login
                        </Text>
                    </TouchableDebounce>

                    <TouchableDebounce
                        style={this.state.rosterDetails.RosteringAllowedLogout === 1 ?
                            this.state.rosterType === rosterType.drop
                                ? [viewSelectedStyle, {flexDirection: "row", width: 100}]
                                : {justifyContent: "center", alignItems: "center"}
                            : {
                                width: 80,
                                justifyContent: "center",
                                alignItems: "center",
                            }
                        }
                        onPress={() => {

                            if (this.state.rosterDetails.RosteringAllowedLogout === 1) {
                                setTimeout(
                                    () =>
                                        this.setState({
                                            rosterType: rosterType.drop,
                                            logoutSelected: "",
                                            dropLocationSelected: "",
                                            loginSelected: "",
                                            pickupLocationSelected: "",
                                            FromDate: "Select",
                                            ToDate: "Select",
                                        }),
                                    0
                                )
                            }
                        }}
                    >
                        {this.state.rosterType === rosterType.drop && (
                            <Ionicons
                                name={"ios-checkmark-circle"}
                                style={{
                                    color:
                                        this.state.rosterType === rosterType.drop
                                            ? colors.WHITE
                                            : colors.BLACK
                                }}
                                size={20}
                            />
                        )}
                        <Text
                            style={{
                                color: this.state.rosterDetails.RosteringAllowedLogout === 1 ?
                                    this.state.rosterType === rosterType.drop
                                        ? colors.WHITE
                                        : colors.BLACK
                                    : colors.GRAY,
                                marginLeft: 10,
                                marginRight: 10,
                                alignSelf: "center",
                                fontWeight: 'bold'
                            }}
                        >
                            Logout
                        </Text>
                    </TouchableDebounce>
                    <TouchableDebounce
                        style={this.state.rosterDetails.RosteringAllowedLogin === 1 && this.state.rosterDetails.RosteringAllowedLogout === 1 ?
                            this.state.rosterType === rosterType.both
                                ? [viewSelectedStyle, {flexDirection: "row", width: 100}]
                                : {
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginRight: 10,
                                    width: 80
                                }
                            : viewNotSelectedRosterTypeStyle
                        }
                        onPress={() => {
                            if (this.state.rosterDetails.RosteringAllowedLogin === 1 && this.state.rosterDetails.RosteringAllowedLogout === 1) {
                                setTimeout(() => this.setState({
                                        rosterType: rosterType.both,
                                        logoutSelected: "",
                                        dropLocationSelected: "",
                                        loginSelected: "",
                                        pickupLocationSelected: "",
                                        FromDate: "Select",
                                        ToDate: "Select",
                                    }),
                                    0
                                )
                            }
                        }}
                    >
                        {this.state.rosterType === rosterType.both && (
                            <Ionicons
                                name={"ios-checkmark-circle"}
                                style={{
                                    color:
                                        this.state.rosterType === rosterType.both
                                            ? colors.WHITE
                                            : colors.BLACK
                                }}
                                size={20}
                            />
                        )}
                        <Text
                            style={{
                                color: this.state.rosterDetails.RosteringAllowedLogin === 1 && this.state.rosterDetails.RosteringAllowedLogout === 1 ?
                                    this.state.rosterType === rosterType.both
                                        ? colors.WHITE
                                        : colors.BLACK
                                    : colors.GRAY,
                                marginLeft: 12,
                                fontWeight: 'bold'
                            }}
                        >
                            Both
                        </Text>
                    </TouchableDebounce>
                </Card>
            </View>
        );
    };

    constructor(props) {
        super(props);
        this.confirmDate = this.confirmDate.bind(this);
        this.openCalendar = this.openCalendar.bind(this);
    }

    /****************************** End of Pickup/Drop *****************************************/

    static isSelected(value: string): boolean {
        return !!(
            value &&
            value !== "" &&
            value !== "select" &&
            value !== "Select" &&
            value !== "SELECT"
        );
    }

    setLoader() {
        setTimeout(() => this.setState({isLoading: true}), 0);
    }

    UNSAFE_componentWillMount() {
        let rosterDetails = this.props.route.params.rosterDetails;
        let Locations = rosterDetails.Locations;

        let officeSelected = findName(
            rosterDetails.DefaultOffice,
            rosterDetails.Offices
        );
        let officeID = findID(
            this.state.officeSelected ? this.state.officeSelected : officeSelected,
            rosterDetails.Offices
        );
        let autoWeeklyOffCalculation = [];
        if (officeID !== "NA") {
            autoWeeklyOffCalculation = getAutoWeeklyOff(rosterDetails, officeID);
        }


        let rosterType = rosterDetails.RosteringAllowedLogin === 1 && rosterDetails.RosteringAllowedLogout === 1 ? "BOTH"
            : rosterDetails.RosteringAllowedLogin === 1 ? "PICK_UP" : "DROP";
        if (rosterDetails)
            this.setState({
                rosterDetails,
                officeSelected,
                Locations,
                weeklyOffStateValue: autoWeeklyOffCalculation.autoWeekDayArray,
                ToDate: "Select",
                FromDate: "Select",
                markedDates: getDaysInMonth(
                    moment().month(),
                    moment().year(),
                    autoWeeklyOffCalculation.autoWeekDayArray
                ),
                rosterType
            });
    }

    componentDidMount() {
        AsyncStorage.multiGet(
            [asyncString.ACCESS_TOKEN, asyncString.USER_ID, asyncString.CAPI, asyncString.isRosterOptOutEnabled,
                asyncString.DISCLAIMER_TYPE,],
            (err, savedData) => {
                let access_token = CryptoXor.decrypt(savedData[0][1], asyncString.ACCESS_TOKEN); // JSON.parse(JSON.stringify(savedData[0][1]));
                let CustomerUrl = savedData[2][1];
                let UserId = JSON.parse(JSON.stringify(savedData[1][1]));
                let isRosterOptOutEnabled = savedData[3][1];
                let disclaimerType = savedData[4][1];
                if (!access_token) return;
                if (!UserId) return;
                this.setState({
                    access_token,
                    UserId,
                    CustomerUrl,
                    isRosterOptOutEnabled,
                    disclaimerType
                });
                // Roster opt-out content to save
                if (isRosterOptOutEnabled === "true" && disclaimerType) {
                    API.newFetchXJSON(URL.Opt_Out_GET, true, (actionType, response, copyDataObj) => {
                        console.warn("opt-out response " + JSON.stringify(response.data.data));
                        if (!response || response.status === 401) {
                            handleResponse.expireSession(context);
                            return;
                        }
                        let data = response.data;
                        if (data.status.code === 500) {
                            Alert1.show("Opt-Out", data.status.message);
                        }
                        setTimeout(() => {
                            this.setState({
                                RosterContent: response.data.data.tcContent
                            });
                        });
                    }, TYPE.OPT_OUT);
                }
            }
        );
    }

    stopLoader() {
        setTimeout(() => this.setState({isLoading: false}), 10);
    }

    setPickupLocation(value: string) {
        this.setLoader();
        setTimeout(() => this.setState({pickupLocationSelected: value ? value : "Select", isLoading: false}), 10);
    }

    setDropLocation(value: string) {
        this.setLoader();
        setTimeout(() => this.setState({dropLocationSelected: value ? value : "Select", isLoading: false}), 10);
    }

    confirmDate({startDate, endDate}) {
        this.setState({
            FromDate: moment(startDate).format('YYYY-MM-DD'),
            ToDate: moment(endDate).format('YYYY-MM-DD'),
            RosterDate: moment(endDate).format('YYYY-MM-DD'),
            loginSelected: "Select",
            logoutSelected: "Select",
            pickupLocationSelected: "Select",
            dropLocationSelected: "Select"
        });
    }

    openCalendar() {
        this.calendar && this.calendar.open();
    }


    _renderStartDateCalendarPicker(newDates, EligibleRosterDays) {
        let customI18n = {
            'w': ['', 'M', 'T', 'W', 'T', 'F', 'S', 'S'],
            'weekday': ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            'text': {
                'start': 'Start',
                'end': 'End',
                'date': 'Date',
                'save': 'Done',
                'clear': 'Reset'
            },
            'date': 'DD / MM'  // date format
        };
        let color = {
            mainColor: colors.BACKGROUND,
            subColor: colors.BLACK,
            selectionColor: colors.BLUE_BRIGHT
        };
        let startDate = "Select";
        try {
            startDate = (this.state.FromDate && !this.state.FromDate.includes("Select")) ? this.state.FromDate :
                moment()
                    .add(1, "days")
                    .format();
        } catch (e) {
            startDate = this.state.FromDate;
        }
        let toDate = "Select";
        try {
            toDate = (this.state.ToDate && !this.state.ToDate.includes("Select")) ? this.state.ToDate : moment()
                .add(2, "days")
                .format()
        } catch (e) {
            toDate = this.state.ToDate;
        }
        let minDate, maxDate;
        if (EligibleRosterDays > 2) {
            minDate = moment().add(1, "days").format();
            maxDate = moment().add(EligibleRosterDays, "days").format();
        } else if ((EligibleRosterDays === 2)) {
            minDate = moment().add(1, "days").format("YYYY-MM-DD");
            maxDate = moment().add(2, "days").format("YYYY-MM-DD");
        } else if ((EligibleRosterDays === 1)) {

            minDate = moment().format("YYYY-MM-DD");
            maxDate = moment().add(1, "days").format("YYYY-MM-DD");
            toDate = startDate;
        }
        return (
            <Calendar
                i18n="en"
                ref={(calendar) => {
                    this.calendar = calendar;
                }}
                customI18n={customI18n}
                color={color}
                minDate={minDate}
                maxDate={maxDate}
                startDate={startDate}
                endDate={toDate}
                onConfirm={this.confirmDate}
            />
        );
    }

    addNewLocation(newLocation) {
        this.setLoader();
        if (newLocation)
            this.setState({
                ...this.state,
                Locations: [...this.state.Locations, ...newLocation],
                isLoading: false
            });
    }

    render() {
        /******************************* Calendar Date Manipulation/Marking *****************************************/
        let datesStartEnd;
        let weeklyOffStateValue;
        let rosterDetails = this.state.rosterDetails;
        let Locations = this.state.Locations;
        /********************* Weekdays in Number from start date/end date and weekly off *************************/
        calculateRoster = [
            {
                RosterRuleID: "",
                LoginShifts: "",
                LogoutShifts: "",
                AllowOtherLocationsLogin: 0,
                AllowOtherLocationsLogout: 0,
                WeekdaysAllowed: "",
                OfficeLocationsAllowed: "",
                EffectiveFrom: "",
                EffectiveTo: "",
                RestrictToPOILogin: 0,
                RestrictToPOILogout: 0
            }
        ];
        let rosterDetailsLocationsJSON = [];
        if (this.state.FromDate && this.state.ToDate) {
            weeklyOffStateValue = this.state.weeklyOffStateValue.join();
            let selectedDays = [];
            if (this.state.FromDate && this.state.ToDate) {
                datesStartEnd = getDates(
                    new Date(this.state.FromDate),
                    new Date(this.state.ToDate)
                );
                datesStartEnd.forEach(function (date) {
                    if (!weeklyOffStateValue.includes(moment(date).format("dddd"))) {
                        if (!selectedDays.includes(moment(date).format("dddd"))) {
                            selectedDays.push(moment(date).format("dddd"));
                        }
                    }
                });
            }
            let selectedDaysinNumber = [];
            for (let i = 0; i < selectedDays.length; i++) {
                selectedDaysinNumber.push(weeklyOffDaysToNumber[selectedDays[i]]);
            }
            let officeNumberSelected = findID(
                this.state.officeSelected,
                rosterDetails.Offices
            );
            if (officeNumberSelected) {
                let customisedRoster = filterShiftTimeBasedOnCutOffTime(
                    rosterDetails.Rosters,
                    this.state.FromDate,
                    this.state.ToDate,
                    officeNumberSelected,
                    officeNumberSelected
                );
                calculateRoster = getCalculatedCreateRoster(
                    customisedRoster,
                    selectedDaysinNumber,
                    officeNumberSelected,
                    this.state.loginSelected,
                    this.state.logoutSelected
                );
            }
            rosterDetailsLocationsJSON = Locations;
        }

        /********************* Weekdays in Number from start date/end date and Weekly off *************************/
        weeklyOffStateValue = this.state.weeklyOffStateValue.join();
        let startDateEndDateMarkerArray = {};
        if (this.state.FromDate && this.state.ToDate) {
            datesStartEnd = getDates(
                new Date(this.state.FromDate),
                new Date(this.state.ToDate)
            );
            datesStartEnd.forEach(function (date) {
                if (!weeklyOffStateValue.includes(moment(date).format("dddd"))) {
                    startDateEndDateMarkerArray[moment(date).format("YYYY-MM-DD")] = {
                        textColor: colors.WHITE,
                        selected: true,
                        selectedColor: colors.YELLOW
                    };
                }
            });
        }

        let dateArray;
        dateArray = rosterDetails.AvailableRosters.split("|");
        let dates = {};
        dateArray.forEach(val => {
            if (val === moment().format("YYYY-MM-DD")) {
                dates[val] = {
                    textColor: colors.WHITE,
                    selected: true,
                    selectedColor: colors.GREEN
                };
            } else
                dates[val] = {
                    textColor: colors.WHITE,
                    selected: true,
                    selectedColor: colors.BLUE
                };
        });

        //Merging Two array
        let newDates = Object.assign(
            //this.state.markedDates,
            dates,
            startDateEndDateMarkerArray
        );
        //console.warn("Calculated Roster : " + JSON.stringify(calculateRoster));

        rosterDetailsLocations = _.uniqBy(rosterDetailsLocationsJSON, "Name");

        rosterDetailsLocationsWithoutOthers = [];
        for (let i = 0; i < rosterDetailsLocations.length; i++) {
            if (rosterDetailsLocations[i].ID === "H") {
                rosterDetailsLocationsWithoutOthers.push(rosterDetailsLocations[i]);
            }
        }
        return (
            // <ViewLoader spinner={this.state.isLoading} style={{flex: 1}}>
                <SafeAreaView
                    style={{flex: 1, backgroundColor: colors.WHITE, paddingTop: Platform.OS === 'ios' ? 20 : 0}}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.BLUE}
                        barStyle="dark-content"
                    />
                    {this._renderStartDateCalendarPicker(
                        newDates,
                        rosterDetails.EligibleRosterDays
                    )}
                    <Modal
                        isVisible={this.state.visibleOptOutModal}
                        style={{justifyContent: 'center', marginVertical: 40, alignContent: 'center'}}
                    >
                        {this._renderDisclaimerType()}
                    </Modal>
                    <ScrollView style={{marginBottom: 50}}>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: colors.WHITE,
                                flexDirection: "column"
                            }}
                        >
                            {this._renderRosterType()}
                            <TouchableDebounce
                                onPress={() => {
                                    this.props.navigation.navigate("OfficePicker", {
                                        Offices: rosterDetails.Offices,
                                        setOfficeLocation: this.setOfficeLocation.bind(this),
                                        officeSelected: this.state.officeSelected
                                    });
                                }}
                            >
                                {_renderOffice("Office Location", this.state.officeSelected)}
                            </TouchableDebounce>
                            <View style={line}/>
                            {_renderWeeklyOff(
                                "Weekly Off",
                                this.state.weeklyOffStateValue,
                                this.addWeeklyOff.bind(this)
                            )}
                            <View style={line}/>
                            {this._renderStartEndDate()}
                            <View style={line}/>
                            {this._renderStartEndTime(
                                calculateRoster[0].LoginShifts,
                                calculateRoster[0].LogoutShifts
                            )}
                            <View style={line}/>
                            {this._renderPickupAndDrop(
                                Locations,
                                rosterDetails,
                                calculateRoster,
                                rosterDetailsLocations,
                                rosterDetailsLocationsWithoutOthers
                            )}
                            <View style={line}/>
                        </View>
                    </ScrollView>
                    <TouchableDebounce
                        style={buttonStyle}
                        onPress={() => {
                            this.createRoster();
                        }}
                    >
                        {this.state.showLoader && (
                            <ActivityIndicator
                                color={colors.WHITE}
                                animating={this.state.showLoader}
                            />
                        )}
                        <Text
                            style={{
                                color: colors.WHITE,
                                fontWeight: "500",
                                fontSize: 20,
                                marginLeft: 10
                            }}
                        >
                            {this.state.showLoader ? "Saving..." : "Save"}
                        </Text>
                    </TouchableDebounce>
                </SafeAreaView>
            // </ViewLoader>
        );
    }

    addWeeklyOff(item) {
        if (this.state.weeklyOffStateValue.join().includes(item)) {
            const removedArray = this.state.weeklyOffStateValue;
            const index = removedArray.indexOf(item);
            if (index > -1) {
                removedArray.splice(index, 1);
            }
            this.setState({
                weeklyOffStateValue: removedArray,
                DISABLED_DAYS: removedArray
            });

            setTimeout(() => {
                let markedDates = getDaysInMonth(
                    moment().month(),
                    moment().year(),
                    removedArray
                );
                this.setState({
                    markedDates,
                    loginSelected: "Select",
                    logoutSelected: "Select",
                    FromDate: "Select",
                    ToDate: "Select",
                    pickupLocationSelected: "Select",
                    dropLocationSelected: "Select"
                });
            }, 10);
        } else {
            if (this.state.weeklyOffStateValue.length > 2) {
                this.stopLoader();
                Alert.alert(null, "Only 3 weekly off allowed");
                return;
            }
            this.setState({
                weeklyOffStateValue: [...this.state.weeklyOffStateValue, item],
                DISABLED_DAYS: [...this.state.weeklyOffStateValue, item],
                loginSelected: "Select",
                logoutSelected: "Select",
                FromDate: "Select",
                ToDate: "Select",
                pickupLocationSelected: "Select",
                dropLocationSelected: "Select",
                markedDates: getDaysInMonth(moment().month(), moment().year(), [
                    ...this.state.weeklyOffStateValue,
                    item
                ])
            });
        }
    }

    /************************ Update roster ************************/
    createRoster() {
        /*********************** Validation *************************/
        if (!CreateRosterNew.isSelected(this.state.officeSelected)) {
            Alert.alert("Roster", "Select office");
            return;
        }

        if (
            !CreateRosterNew.isSelected(this.state.FromDate) &&
            !CreateRosterNew.isSelected(this.state.ToDate)
        ) {
            Alert.alert("Roster", "Select start/end date");
            return;
        }

        if (
            !CreateRosterNew.isSelected(this.state.FromDate) ||
            !CreateRosterNew.isSelected(this.state.ToDate)
        ) {
            if (!CreateRosterNew.isSelected(this.state.ToDate)) {
                Alert.alert("Roster", "Select End Date");
            } else if (!CreateRosterNew.isSelected(this.state.FromDate)) {
                Alert.alert("Roster", "Select Start Date");
            }
            return;
        }

        if (
            !CreateRosterNew.isSelected(this.state.logoutSelected) &&
            !CreateRosterNew.isSelected(this.state.loginSelected) &&
            !CreateRosterNew.isSelected(this.state.pickupLocationSelected) &&
            !CreateRosterNew.isSelected(this.state.dropLocationSelected)
        ) {
            Alert.alert("Roster", "Select login/logout time");
            return;
        }
        if (
            CreateRosterNew.isSelected(this.state.loginSelected) &&
            !CreateRosterNew.isSelected(this.state.pickupLocationSelected)
        ) {
            Alert.alert("Roster", "Select pickup location");
            return;
        } else if (
            !CreateRosterNew.isSelected(this.state.loginSelected) &&
            CreateRosterNew.isSelected(this.state.pickupLocationSelected)
        ) {
            Alert.alert("Roster", "Select login time");
            return;
        }

        if (
            CreateRosterNew.isSelected(this.state.logoutSelected) &&
            !CreateRosterNew.isSelected(this.state.dropLocationSelected)
        ) {
            Alert.alert("Roster", "Select drop location");
            return;
        } else if (
            !CreateRosterNew.isSelected(this.state.logoutSelected) &&
            CreateRosterNew.isSelected(this.state.dropLocationSelected)
        ) {
            Alert.alert("Roster", "Select logout time");
            return;
        }
        /*********************** End Validation *********************/

        let responseRosterDetails = this.state.Locations;
        const rosterDetailsLocations = _.uniqBy(responseRosterDetails, "Name");

        /*****************Start of Quick way to calculate ignore dates********************/
        const range = moment.range(this.state.FromDate, this.state.ToDate);
        let tempWeeeklyOff = this.state.weeklyOffStateValue.join();
        let tempIgnoreDates = [];
        for (let month of range.by("days")) {
            if (tempWeeeklyOff.includes(month.format("dddd"))) {
                tempIgnoreDates.push(month.format("YYYY-MM-DD"));
            }
        }
        /*****************End of Quick way to calculate ignore dates********************/
        let body = {
            RosterDate: this.state.RosterDate,
            DeviceID: this.state.UserId,
            FromDate: this.state.FromDate,
            ToDate: this.state.ToDate,
            IgnoreDates: tempIgnoreDates.join("|"),
            LoginLocID: (this.state.rosterType === rosterType.both || this.state.rosterType === rosterType.pickup)
                ? !this.state.pickupLocationSelected.includes("Select")
                    ? findID(this.state.pickupLocationSelected.includes("-Nodal") ? this.state.pickupLocationSelected.split("-")[0] : this.state.pickupLocationSelected, rosterDetailsLocations)
                    : ""
                : "",
            LogoutLocID: (this.state.rosterType === rosterType.both || this.state.rosterType === rosterType.drop)
                ? !this.state.dropLocationSelected.includes("Select")
                    ? findID(this.state.dropLocationSelected.includes("-Nodal") ? this.state.dropLocationSelected.split("-")[0] : this.state.dropLocationSelected, rosterDetailsLocations)
                    : ""
                : "",
            LoginTime: CreateRosterNew.isSelected(this.state.loginSelected)
                ? !this.state.loginSelected
                    ? ""
                    : this.state.loginSelected === "Cancel"
                        ? "NS"
                        : this.state.loginSelected
                : null,
            LogoutTime: CreateRosterNew.isSelected(this.state.logoutSelected)
                ? !this.state.logoutSelected
                    ? ""
                    : this.state.logoutSelected === "Cancel"
                        ? "NS"
                        : this.state.logoutSelected
                : null,
            LoginRouteType: CreateRosterNew.isSelected(this.state.loginSelected)
                ? "D"
                : "",
            LogoutRouteType: CreateRosterNew.isSelected(this.state.logoutSelected)
                ? "D"
                : "",
            LoginOffice: findID(
                this.state.officeSelected,
                this.state.rosterDetails.Offices
            ),
            LogoutOffice: findID(
                this.state.officeSelected,
                this.state.rosterDetails.Offices
            ),
            LoginLocName: this.state.pickupLocationSelected.includes("Select") ? "" : this.state.pickupLocationSelected.includes("-Nodal") ? this.state.pickupLocationSelected.split("-")[0] : this.state.pickupLocationSelected,
            LogoutLocName: this.state.dropLocationSelected.includes("Select") ? "" : this.state.dropLocationSelected.includes("-Nodal") ? this.state.dropLocationSelected.split("-")[0] : this.state.dropLocationSelected,
            LoginLocAddress: (this.state.rosterType === rosterType.both || this.state.rosterType === rosterType.pickup)
                ? !this.state.pickupLocationSelected.includes("Select")
                    ? findAddress(this.state.pickupLocationSelected, rosterDetailsLocations) : ""
                : "",
            LogoutLocAddress: (this.state.rosterType === rosterType.both || this.state.rosterType === rosterType.drop)
                ? !this.state.dropLocationSelected.includes("Select")
                    ? findAddress(this.state.dropLocationSelected, rosterDetailsLocations) : ""
                : "",
            LoginLocLat: (this.state.rosterType === rosterType.both || this.state.rosterType === rosterType.pickup)
                ? !this.state.pickupLocationSelected.includes("Select")
                    ? findLat(this.state.pickupLocationSelected, rosterDetailsLocations) : ""
                : "",
            LoginLocLng: (this.state.rosterType === rosterType.both || this.state.rosterType === rosterType.pickup)
                ? !this.state.pickupLocationSelected.includes("Select")
                    ? findLng(this.state.pickupLocationSelected, rosterDetailsLocations) : ""
                : "",
            LogoutLocLng: (this.state.rosterType === rosterType.both || this.state.rosterType === rosterType.drop)
                ? !this.state.dropLocationSelected.includes("Select")
                    ? findLat(this.state.dropLocationSelected, rosterDetailsLocations) : ""
                : "",
            LogoutLocLat: (this.state.rosterType === rosterType.both || this.state.rosterType === rosterType.drop)
                ? !this.state.dropLocationSelected.includes("Select")
                    ? findLng(this.state.dropLocationSelected, rosterDetailsLocations) : ""
                : ""
        };
        console.warn("body " + JSON.stringify(body));
        if (this.state.isRosterOptOutEnabled === "true" && this.state.disclaimerType.includes("LOGIN") && !this.state.optOutAccepted) {
            if (body.LoginTime === "NS") {
                this.setState({visibleOptOutModal: true, acceptedType: "LOGIN"});
            } else if (!body.LoginTime && body.LogoutTime !== "NS") {
                this.setState({visibleOptOutModal: true, acceptedType: "LOGIN"});
            } else {
                this.createRosterApiCall(body);
            }
        } else if (this.state.isRosterOptOutEnabled === "true" && this.state.disclaimerType.includes("LOGOUT") && !this.state.optOutAccepted) {
            if (body.LogoutTime === "NS") {
                this.setState({visibleOptOutModal: true, acceptedType: "LOGOUT"});
            } else if (!body.LogoutTime && body.LoginTime !== "NS") {
                this.setState({visibleOptOutModal: true, acceptedType: "LOGOUT"});
            } else {
                this.createRosterApiCall(body);
            }
        } else if (this.state.isRosterOptOutEnabled === "true" && this.state.disclaimerType.includes("BOTH") && !this.state.optOutAccepted) {
            if (!body.LoginTime || body.LoginTime === "" || body.LoginTime.includes("NS") || body.LoginTime === null) {
                this.setState({visibleOptOutModal: true, acceptedType: "LOGIN"});
            } else if (!body.LogoutTime || body.LogoutTime === "" || body.LogoutTime.includes("NS") || body.LogoutTime === null) {
                this.setState({visibleOptOutModal: true, acceptedType: "LOGOUT"});
            } else {
                this.createRosterApiCall(body);
            }
        } else {
            this.createRosterApiCall(body);
        }
    }

    createRosterApiCall(body) {
        this.setState({
            isLoading: true,
            showLoader: true
        });
        if (this.state.accepted === true && this.state.optOutAccepted === true) {
            if (this.state.acceptedType === "LOGIN") {
                body["LoginOptOutTCAccepted"] = "1"
            }
            if (this.state.acceptedType === "LOGOUT") {
                body["LogoutOptOutTCAccepted"] = "1"
            }
        }
        API.newFetchJSON(
            this.state.CustomerUrl + URL.SAVE_ROSTER_RANGE,
            body,
            true,
            this.callback.bind(this),
            TYPE.CREATE_ROSTER
        );
    }
}

CreateRosterNew.propTypes = {};

export default CreateRosterNew;
const line = {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: colors.GRAY
};
const buttonStyle = {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    backgroundColor: colors.BLUE_BRIGHT,
    flexDirection: "row"
};
