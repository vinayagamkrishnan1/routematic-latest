import React, {Component} from "react";
import {ActivityIndicator, Alert, ScrollView, StatusBar, Text, View} from "react-native";
import {Button, Box} from "native-base";
import {StackActions} from '@react-navigation/native';
import {colors} from "../../utils/Colors";
import {
    _renderDate,
    _renderOffice,
    _renderTitleContent,
    _renderWeeklyOff,
    viewNotSelectedRosterTypeStyle,
    viewSelectedStyle
} from "../roster/customeComponent/customComponent";
import TouchableDebounce from "../../utils/TouchableDebounce";
import Moment from "moment";
import {extendMoment} from "moment-range";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as HOC from "../../components/hoc";
import {rosterType} from "../roster/customeComponent/RosterType";
import Calendar from "react-native-calendar-select";
import Modal from "react-native-modal";
import {inject, observer} from "mobx-react";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import * as Toast from "../../utils/Toast";
import {roster} from "../../utils/ConstantString";
import SafeAreaView from "react-native-safe-area-view";

const moment = extendMoment(Moment);
const customI18n = {
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
const colorObject = {
    mainColor: colors.BACKGROUND,
    subColor: colors.BLACK,
    selectionColor: colors.BLUE_BRIGHT
};

@inject("rosterStore")
@observer
class RosterCreate extends Component {
    static navigationOptions = {
        title: "Create Roster",
        headerTitleStyle: {fontFamily: "Roboto"}
    };

    constructor(props) {
        super(props);
        this.confirmDate = this.confirmDate.bind(this);
        this.openCalendar = this.openCalendar.bind(this);
    }

    _renderStartEndTime = (store) => {
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
                {(store.rosterType === rosterType.pickup ||
                    store.rosterType === rosterType.both) && (
                    <TouchableDebounce
                        onPress={() => {
                            if (!store.fromDate || store.fromDate === "Select" || !store.toDate || store.toDate === "Select") {
                                Alert.alert(
                                    "Create Roster",
                                    "Please select Start Date & End Date"
                                );
                                return;
                            }
                            if (store.CRN_calculateRoster[0].LoginShifts.length <= 0) {
                                Alert.alert("Update Roster", "Login Shifts are not available.");
                            } else {
                                this.props.navigation.navigate("RosterShiftPicker", {
                                    from: true,
                                    type: roster.login,
                                    selectedItem: store.CRN_loginSelected,
                                    data: store.CRN_calculateRoster[0].LoginShifts + "|Cancel"
                                });
                            }
                        }}
                        style={{
                            width:
                                store.rosterType === rosterType.pickup ? "100%" : "50%"
                        }}
                    >
                        {_renderTitleContent(
                            "Login Time",
                            store.CRN_loginSelected ? store.CRN_loginSelected : "Select",
                            ""
                        )}
                    </TouchableDebounce>
                )}
                {(store.rosterType === rosterType.drop ||
                    store.rosterType === rosterType.both) && (
                    <TouchableDebounce
                        onPress={() => {
                            if (!store.fromDate || store.fromDate === "Select" || !store.fromDate || store.toDate === "Select") {
                                Alert.alert(
                                    "Create Roster",
                                    "Please select Start Date & End Date"
                                );
                                return;
                            }
                            if (store.CRN_calculateRoster[0].LogoutShifts.length <= 0) {
                                Alert.alert("Update Roster", "Logout Shifts are not available. ");
                            } else {
                                this.props.navigation.navigate("RosterShiftPicker", {
                                    from: true,
                                    type: roster.logout,
                                    selectedItem: store.CRN_logOutSelected,
                                    data: store.CRN_calculateRoster[0].LogoutShifts + "|Cancel"
                                });
                            }
                        }}
                        style={{
                            width: store.rosterType === rosterType.drop ? "100%" : "50%"
                        }}
                    >
                        {_renderTitleContent(
                            "Logout Time",
                            store.CRN_logOutSelected ? store.CRN_logOutSelected : "Select",
                            store.CRN_logOutSelected && (store.CRN_logOutSelected.includes("*"))
                                ? "*"
                                : ""
                        )}
                    </TouchableDebounce>
                )}
            </View>
        );
    };

    _renderStartEndDate = (store) => {
        let endDayNumber = moment(store.toDate)
            .add(store.toDate ? 0 : 1, "day")
            .format("DD");
        let endDayName = moment(store.toDate)
            .add(store.toDate ? 0 : 1, "day")
            .format("dddd");
        let endDayMonthYear = moment(store.toDate)
            .add(store.toDate ? 0 : 1, "day")
            .format("MMM YYYY");
        let startDayNumber = moment(store.fromDate)
            .add(store.fromDate ? 0 : 1, "day")
            .format("DD");
        let startDayName = moment(store.fromDate)
            .add(store.fromDate ? 0 : 1, "day")
            .format("dddd");
        let startDayMonthYear = moment(store.fromDate)
            .add(store.fromDate ? 0 : 1, "day")
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

    _renderDisclaimerType = () => (
        <View padder style={{marginTop: 16, backgroundColor: "#FFFFFF"}}>
            <Box style={{padding: 10}}>
                <ScrollView>
                    {this._renderContent(this.props.rosterStore.optOutContent)}
                    {this._renderTC()}
                </ScrollView>
            </Box>
        </View>
    );

    _renderContent(data) {
        return <Text style={{marginTop: 8}}>{data}</Text>;
    }

    _renderTC() {
        return (
            <React.Fragment>
               
                <Button
                    style={{
                        justifyContent: "center",
                        flexDirection: "row",
                        marginTop: 5,
                        backgroundColor: 'transparent',
                    }}
                    onPress={() => this.props.rosterStore.toggleAccept()}
                >
                    <View 
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                    >
                    <FontAwesome
                        name={this.props.rosterStore.accepted ? "check-square-o" : "square-o"}
                        color={colors.BLACK}
                        size={25}
                    />
                    <Text style={{marginLeft: 10, fontWeight: "700", color: "black",marginTop:5}}>
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
                            this.props.rosterStore.disableOptOutVisible();
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
                            backgroundColor: this.props.rosterStore.accepted
                                ? "rgba(50,205,50,1)"
                                : "rgba(192,192,192,0.5)"
                        }}
                        onPress={() => {
                            if (!this.props.rosterStore.accepted) {
                                Toast.show("Please Accept the Opt-Out");
                                return;
                            }
                            this.props.rosterStore.rosterOptOutSelected();
                            this.createRoster();
                        }}
                    >
                        <Text style={{color: colors.WHITE}}>Accept</Text>
                    </Button>
                </View>
            </React.Fragment>
        );
    }


    _renderPickupAndDrop = (store) => {
        let login = store.rosterType === rosterType.both ? "Login Pickup Location" : "Pickup Location";
        let logout = store.rosterType === rosterType.both ? "Logout Drop Location" : "Drop Location";
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
                    {(store.rosterType === rosterType.pickup ||
                        store.rosterType === rosterType.both) && (<Text style={[{
                        fontFamily: "Helvetica",
                        fontSize: 13,
                        textAlign: "left",
                        color: colors.GRAY
                    }, {marginLeft: 3}]}>{login}</Text>)}

                    {(store.rosterType === rosterType.drop ||
                        store.rosterType === rosterType.both) && (
                        <Text style={[{
                            fontFamily: "Helvetica",
                            fontSize: 13,
                            textAlign: "left",
                            color: colors.GRAY
                        }, {marginLeft: store.rosterType === rosterType.drop ? 0 : 25}]}>{logout}</Text>)}
                </View>
                <View
                    style={{
                        flexDirection: "row"
                    }}
                >
                    {(store.rosterType === rosterType.pickup ||
                        store.rosterType === rosterType.both) && (
                        <TouchableDebounce
                            disabled={!!store.pickupDisabled}
                            onPress={() => {
                                if (!store.fromDate || store.fromDate === "Select") {
                                    Alert.alert(
                                        "Create Roster",
                                        "Please select Start Date & End Date"
                                    );
                                    return;
                                } else if (!store.CRN_loginSelected || store.CRN_loginSelected === "Select") {
                                    Alert.alert("Create Roster", "Please select Login Time");
                                    return
                                }
                                // need to call address-picker
                                console.warn("Calc "+JSON.stringify(store.CRN_calculateRoster[0]));
                                this.props.navigation.navigate("RosterPickUpDrop", {
                                    from: true,
                                    type: roster.login,
                                    selectedItem: store.CRN_pickupSelected,
                                    allowOtherLocation: store.CRN_calculateRoster[0].AllowOtherLocationsLogin === 1,
                                    restrictToPOI: store.CRN_calculateRoster[0].RestrictToPOILogin === 1
                                });
                            }}
                            style={{
                                width:
                                    store.rosterType === rosterType.pickup ? "100%" : "50%"
                            }}
                        >
                            {_renderTitleContent(
                                "Login:Pickup location",
                                store.CRN_pickupSelected ? store.CRN_pickupSelected : "Select",
                                null,
                                "something"
                            )}
                        </TouchableDebounce>
                    )}
                    {(store.rosterType === rosterType.drop ||
                        store.rosterType === rosterType.both) && (
                        <TouchableDebounce
                            disabled={!!store.dropDisabled}
                            onPress={() => {
                                if (!store.toDate || store.toDate === "Select") {
                                    Alert.alert(
                                        "Create Roster",
                                        "Please select Start Date & End Date"
                                    );
                                    return;
                                } else if (!store.CRN_logOutSelected || store.CRN_logOutSelected === "Select") {
                                    Alert.alert("Create Roster", "Please select Logout Time");
                                    return;
                                }
                                // need to call address- picker
                                console.warn("Calc "+JSON.stringify(store.CRN_calculateRoster[0]));
                                this.props.navigation.navigate("RosterPickUpDrop", {
                                    from: true,
                                    type: roster.logout,
                                    selectedItem: store.CRN_dropSelected,
                                    allowOtherLocation: store.CRN_calculateRoster[0].AllowOtherLocationsLogout === 1,
                                    restrictToPOI: store.CRN_calculateRoster[0].RestrictToPOILogout === 1
                                });
                            }}
                            style={{
                                width:
                                    store.rosterType === rosterType.drop ? "100%" : "50%"
                            }}
                        >
                            {_renderTitleContent(
                                "Logout : Drop location",
                                store.CRN_dropSelected ? store.CRN_dropSelected : "Select",
                                null,
                                "something"
                            )}
                        </TouchableDebounce>
                    )}
                </View>
            </View>
        );
    };

    _renderRosterType = (store) => {
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
                <Box
                    style={{
                        flexDirection: "row",
                        borderRadius: 25,
                        justifyContent: "space-between",
                        marginLeft: 50,
                        marginRight: 50
                    }}
                >
                    <TouchableDebounce
                        style={store.RosteringAllowedLogin === 1 ?
                            store.rosterType === rosterType.pickup
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
                            if (store.RosteringAllowedLogin === 1) {
                                store.setOnlyLogin();
                            }
                        }}
                    >
                        {store.rosterType === rosterType.pickup && (
                            <Ionicons
                                name={"ios-checkmark-circle"}
                                style={{color: colors.WHITE}}
                                size={20}
                            />
                        )}
                        <Text
                            style={{
                                color: store.RosteringAllowedLogin === 1 ?
                                    store.rosterType === rosterType.pickup
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
                        style={store.RosteringAllowedLogout === 1 ?
                            store.rosterType === rosterType.drop
                                ? [viewSelectedStyle, {flexDirection: "row", width: 100}]
                                : {justifyContent: "center", alignItems: "center"}
                            : {
                                width: 80,
                                justifyContent: "center",
                                alignItems: "center",
                            }
                        }
                        onPress={() => {

                            if (store.RosteringAllowedLogout === 1) {
                                store.setOnlyLogOut()
                            }
                        }}
                    >
                        {store.rosterType === rosterType.drop && (
                            <Ionicons
                                name={"ios-checkmark-circle"}
                                style={{
                                    color:
                                        store.rosterType === rosterType.drop
                                            ? colors.WHITE
                                            : colors.BLACK
                                }}
                                size={20}
                            />
                        )}
                        <Text
                            style={{
                                color: store.RosteringAllowedLogout === 1 ?
                                    store.rosterType === rosterType.drop
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
                        style={store.RosteringAllowedLogin === 1 && store.RosteringAllowedLogout === 1 ?
                            store.rosterType === rosterType.both
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
                            if (store.RosteringAllowedLogin === 1 && store.RosteringAllowedLogout === 1) {
                                store.setBoth()
                            }
                        }}
                    >
                        {store.rosterType === rosterType.both && (
                            <Ionicons
                                name={"ios-checkmark-circle"}
                                style={{
                                    color:
                                        store.rosterType === rosterType.both
                                            ? colors.WHITE
                                            : colors.BLACK
                                }}
                                size={20}
                            />
                        )}
                        <Text
                            style={{
                                color: store.RosteringAllowedLogin === 1 && store.RosteringAllowedLogout === 1 ?
                                    store.rosterType === rosterType.both
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
                </Box>
            </View>
        );
    };

    componentDidMount() {
        this.props.rosterStore.setCreateNewRosterInit();
    }

    confirmDate({startDate, endDate}) {
        this.props.rosterStore.setFromToDates(startDate, endDate);
    }

    openCalendar() {
        this.calendar && this.calendar.open();
    }


    _renderStartDateCalendarPicker(store) {
        if (store.startDate && store.endDate) {

            return (
                <Calendar
                    i18n="en"
                    ref={(calendar) => {
                        this.calendar = calendar;
                    }}
                    customI18n={customI18n}
                    color={colorObject}
                    minDate={store.minDate}
                    maxDate={store.maxDate}
                    startDate={store.startDate}
                    endDate={store.endDate}
                    onConfirm={this.confirmDate}
                />
            );
        } else {
            store.getDatesInit()
        }

    }


    render() {
        console.warn("store.CRN_calculateRoster[0] "+JSON.stringify(this.props.rosterStore.CRN_calculateRoster[0]))
        return (
                <SafeAreaView
                    style={{flex: 1, backgroundColor: colors.WHITE, paddingTop: Platform.OS === 'ios' ? 20 : 0}}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.BLUE}
                        barStyle="dark-content"
                    />
                    {this._renderStartDateCalendarPicker(this.props.rosterStore)}
                    <Modal
                        isVisible={this.props.rosterStore.visibleOptOutModal === true}
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
                            {this._renderRosterType(this.props.rosterStore)}
                            <TouchableDebounce
                                onPress={() => {
                                    this.props.navigation.navigate("RosterOfficePicker", {
                                        createRosterNew: true,
                                        selectedItem: this.props.rosterStore.CRN_officeSelected
                                    });
                                }}
                            >
                                {_renderOffice("Office Location", this.props.rosterStore.CRN_officeSelected)}
                            </TouchableDebounce>
                            <View style={line}/>
                            {_renderWeeklyOff(
                                "Weekly Off",
                                this.props.rosterStore.CRN_weeklyOffSelected,
                                this.addWeeklyOff.bind(this)
                            )}
                            <View style={line}/>
                            {this._renderStartEndDate(this.props.rosterStore)}
                            <View style={line}/>
                            {this._renderStartEndTime(this.props.rosterStore)}
                            <View style={line}/>
                            {this._renderPickupAndDrop(this.props.rosterStore)}
                            <View style={line}/>
                        </View>
                    </ScrollView>
                    <TouchableDebounce
                        style={buttonStyle}
                        onPress={() => {
                            this.createRoster();
                        }}
                    >
                        {this.props.rosterStore.isLoading && (
                            <ActivityIndicator
                                color={colors.WHITE}
                                animating={this.props.rosterStore.isLoading}
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
                            {this.props.rosterStore.isLoading ? "Saving..." : "Save"}
                        </Text>
                    </TouchableDebounce>
                </SafeAreaView>
        );
    }

    static isSelected(value: string): boolean {
        return !!(value && value !== "" && value !== "Select");
    }

    createRoster(){
        const store = this.props.rosterStore;
        /*********************** Validation *************************/
        if (!RosterCreate.isSelected(store.CRN_officeSelected)) {
            Alert.alert("Roster", "Select office");
            return;
        }

        if (
            !RosterCreate.isSelected(store.fromDate) &&
            !RosterCreate.isSelected(store.toDate)
        ) {
            Alert.alert("Roster", "Select start/end date");
            return;
        }

        if (
            !RosterCreate.isSelected(store.fromDate) ||
            !RosterCreate.isSelected(store.toDate)
        ) {
            if (!RosterCreate.isSelected(store.toDate)) {
                Alert.alert("Roster", "Select End Date");
            } else if (!RosterCreate.isSelected(store.fromDate)) {
                Alert.alert("Roster", "Select Start Date");
            }
            return;
        }

        if (
            !RosterCreate.isSelected(store.CRN_logOutSelected) &&
            !RosterCreate.isSelected(store.CRN_loginSelected) &&
            !RosterCreate.isSelected(store.CRN_pickupSelected) &&
            !RosterCreate.isSelected(store.CRN_dropSelected)
        ) {
            Alert.alert("Roster", "Select login/logout time");
            return;
        }
        if (
            RosterCreate.isSelected(store.CRN_loginSelected) &&
            (!RosterCreate.isSelected(store.CRN_pickupSelected)&&store.pickupDisabled===false)
        ) {
            Alert.alert("Roster", "Select pickup location");
            return;
        } else if (
            !RosterCreate.isSelected(store.CRN_loginSelected) &&
            RosterCreate.isSelected(store.CRN_pickupSelected)
        ) {
            Alert.alert("Roster", "Select login time");
            return;
        }

        if (
            RosterCreate.isSelected(store.CRN_logOutSelected) &&
            (!RosterCreate.isSelected(store.CRN_dropSelected) && store.dropDisabled===false)
        ) {
            Alert.alert("Roster", "Select drop location");
            return;
        } else if (
            !RosterCreate.isSelected(store.CRN_logOutSelected) &&
            RosterCreate.isSelected(store.CRN_dropSelected)
        ) {
            Alert.alert("Roster", "Select logout time");
            return;
        }
        /*********************** End Validation *********************/
        const range = moment.range(store.fromDate, store.toDate);
        let tempWeeeklyOff = store.CRN_weeklyOffSelected.join();
        let tempIgnoreDates = [];
        for (let month of range.by("days")) {
            if (tempWeeeklyOff.includes(month.format("dddd"))) {
                tempIgnoreDates.push(month.format("YYYY-MM-DD"));
            }
        }
        this.storeCreateRoster(tempIgnoreDates);
    }

    storeCreateRoster(tempIgnoreDates){
        this.props.rosterStore.createNewRoster(tempIgnoreDates).then(()=>{
            if(this.props.rosterStore.rosterUpdated===true){
                this.props.rosterStore.rosterUpdated=false;
                this.props.navigation.dispatch(StackActions.popToTop());
            }
        });
    }

    addWeeklyOff(item) {
        const store = this.props.rosterStore;
        if (store.CRN_weeklyOffSelected.join().includes(item)) {
            const removedArray = store.CRN_weeklyOffSelected;
            const index = removedArray.indexOf(item);
            if (index > -1) {
                removedArray.splice(index, 1);
            }
            store.AddWeeklyOff(removedArray)
        } else {
            if (store.CRN_weeklyOffSelected.length > 5) {
                Alert.alert(null, "Only 6 weekly off allowed");
                return;
            }
            const newArray = store.CRN_weeklyOffSelected;
            newArray.push(item);
            store.AddWeeklyOff(newArray);
        }
    }
}

RosterCreate.propTypes = {};

export default RosterCreate;
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
