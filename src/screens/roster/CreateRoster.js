import React, {Component} from "react";
import PropTypes from "prop-types";
import {
    Body,
    Button,
    Card,
    Container,
    Content,
    Footer,
    Form,
    Header,
    Icon,
    Input,
    Item,
    Left,
    Picker,
    Right,
    Text,
    Title
} from "native-base";
import _ from "lodash";
import {
    ActivityIndicator,
    Alert,
    findNodeHandle,
    FlatList,
    Image,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {colors} from "../../utils/Colors";
import PopupDialog, {SlideAnimation} from "react-native-popup-dialog";
import Moment from "moment";
import {extendMoment} from "moment-range";
import {Calendar} from "react-native-calendars";
import {API} from "../../network/apiFetch/API";
import {URL} from "../../network/apiConstants";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import {asyncString} from "../../utils/ConstantString";
import Ionicons from "react-native-vector-icons/Ionicons";
import {spinner} from "../../network/loader/Spinner";
import {withNavigation} from "@react-navigation/native";
import Modal from "react-native-modal";
import TouchableDebounce from "../../utils/TouchableDebounce";
import * as Toast from "../../utils/Toast";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {filterShiftTimeBasedOnCutOffTime} from "../../utils/customFunction";
import {TYPE} from "../../model/ActionType";
import { CryptoXor } from "crypto-xor";

const moment = extendMoment(Moment);

const slideAnimation = new SlideAnimation({
    slideFrom: "bottom"
});

const weeklyOffDaysToNumber = {
    Sunday: "0",
    Monday: "1",
    Tuesday: "2",
    Wednesday: "3",
    Thursday: "4",
    Friday: "5",
    Saturday: "6"
};

class CreateRoster extends Component {
    static navigationOptions = {
        title: "Roster",
        headerTitleStyle: {fontFamily: "Roboto"}
    };
    callback = async (actionType, response) => {
        switch (actionType) {
            case TYPE.CREATE_ROSTER: {
                handleResponse.createRosterForSelectedDate(response, this);
                break;
            }
            case TYPE.ADD_CUSTOM_LOCATION: {
                handleResponse.saveEmployeeLocation(
                    response,
                    this,
                    this.state.type,
                    this.state.type === "from"
                        ? this.state.fromNickName
                        : this.state.toNickName
                );
                break;
            }
        }
    };
    onSelectedItemsChange = selectedItems => {
        this.setState({selectedItems});
    };
    _renderButton = (text, onPress) => (
        <Button full success onPress={onPress} style={{marginTop: 10}}>
            <Text>{text ? text : ""}</Text>
        </Button>
    );
    _renderAddNickNameModalContent = () => (
        <View
            style={{
                height: "60%",
                backgroundColor: "white",
                padding: 22,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 4,
                borderColor: "rgba(0, 0, 0, 0.1)"
            }}
        >
            <KeyboardAvoidingView style={{flex: 1}} behavior="padding" enabled>
                <View rounded style={{width: "100%"}}>
                    <Input
                        maxLength={15}
                        style={{color: colors.BLACK, height: 50, width: "80%"}}
                        placeholder={"Enter nick name under 15 character"}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        autoCorrect={false}
                        numberOfLines={1}
                        returnKeyType="next"
                        onChangeText={text =>
                            this.state.type == "from"
                                ? this.fromNickNameChangeHandler(text)
                                : this.toNickNameChangeHandler(text)
                        }
                        value={this.state.nickName}
                        blurOnSubmit={true}
                    />
                </View>
                {this._renderButton(this.state.isLoading ? "Adding..." : "Add", () => {
                    this.saveEmployeLocation();
                })}
                <Button
                    full
                    danger
                    onPress={() => {
                        this.setState({visibleModal: false});
                    }}
                    style={{marginTop: 10, backgroundColor: colors.RED}}
                >
                    <Text>Cancel</Text>
                </Button>
            </KeyboardAvoidingView>
        </View>
    );

    constructor(props) {
        super(props);
        this.state = {
            excludeDaysNumber: [],
            isLoading: false,
            access_token: "",
            CustomerUrl: "",
            UserId: "",
            DISABLED_DAYS: [],
            markedDates: this.getDaysInMonth(moment().month(), moment().year(), []),
            /******************* Update Roster *************************/
            loginSelected: "",
            logoutSelected: "",
            availableRosters: "",
            loginShifts: "",
            rosterDetails: "",
            pickupLocationSelected: "",
            dropLocationSelected: "",
            officeLoginSelected: "",
            officeLogoutSelected: "",
            officeSelected: "",
            startDate: "",
            pickStartDate: false,
            endDate: "",
            pickEndDate: false,
            RosterID: "",
            autoFill: false,
            weekOffSelected: "",
            ToDate: "",
            FromDate: "",
            weeklyOffStateValue: [],
            currentDate: moment()
                .add(-1, "days")
                .format("YYYY-MM-D")
                .toString(),
            toSelectedLocation: "",
            toSelectLat: "",
            toSelectLng: "",
            fromSelectedLocation: "",
            fromSelectLat: "",
            fromSelectLng: "",
            fromAddressID: "",
            toAddressID: "",
            toNickName: "",
            type: "",
            visibleModal: false,
            newLocation: [],
            tempWeeklyOff: [],
            tempWeeklyOffNumber: [],
            autoWeekDayCalculationBoolean: true,
            reset: false
            /********************* End of Update Roster *****************/
        };
    }

    static isSelected(value: string): boolean {
        if (
            value &&
            value !== "" &&
            value !== "select" &&
            value !== "Select" &&
            value !== "SELECT"
        )
            return true;
        else return false;
    }

    toNickNameChangeHandler(text) {
        if (text) {
            this.setState({
                toNickName: text
            });
        }
    }

    fromNickNameChangeHandler(text) {
        if (text) {
            this.setState({
                fromNickName: text
            });
        }
    }

    getLocationPicker(selectedLocation, selectLat, selectLng, type) {
        if (type == "from")
            this.setState({
                fromSelectedLocation: selectedLocation,
                fromSelectLat: selectLat,
                fromSelectLng: selectLng,
                visibleModal: "AddNickName",
                type
            });
        else if (type == "to")
            this.setState({
                toSelectedLocation: selectedLocation,
                toSelectLat: selectLat,
                toSelectLng: selectLng,
                visibleModal: "AddNickName",
                type
            });
    }

    /*********************** Update Roster ************************/
    onLoginValueChange(value: string) {
        this.setState({loginSelected: value});
    }

    onLogoutValueChange(value: string) {
        this.setState({
            logoutSelected: value
        });
    }

    onOfficeLoginValueChange(value: string) {
        this.setState({
            officeLoginSelected: value,
            officeLogoutSelected: value,
            autoWeekDayCalculationBoolean: true,
            reset: true
        });
    }

    onPickupLocationValueChange(value: string) {
        this.setState({pickupLocationSelected: value});
        if (value === "Others") {
            this.goToLocationPicker("from");
        }
    }

    onDropLocationValueChange(value: string) {
        this.setState({
            dropLocationSelected: value
        });
        if (value === "Others") {
            this.goToLocationPicker("to");
        }
    }

    onWeekOffValueChange(value: string) {
        this.setState({
            weekOffSelected: value
        });
    }

    goToLocationPicker(type) {
        this.props.navigation.navigate("MapPicker", {
            getLocationPicker: this.getLocationPicker.bind(this),
            type: type
        });
    }

    /*********************** End of Update Roster **********************/
    getDaysInMonth(month, year, days) {
        let pivot = moment()
            .month(month)
            .year(year)
            .startOf("month");
        const end = moment()
            .month(month)
            .year(year)
            .endOf("month");

        let dates = {};
        const disabled = {disabled: true, disableTouchEvent: true};
        while (pivot.isBefore(end)) {
            days.forEach(day => {
                dates[pivot.day(day).format("YYYY-MM-DD")] = disabled;
            });
            pivot.add(7, "days");
        }

        return dates;
    }

    /************************ Update roster ************************/
    createRoster() {
        /*********************** Validation *************************/
        this.setState({
            isLoading: true
        });
        if (!CreateRoster.isSelected(this.state.officeLoginSelected)) {
            Alert.alert("Roster", "Select office");
            return;
        }

        if (
            !CreateRoster.isSelected(this.state.FromDate) &&
            !CreateRoster.isSelected(this.state.ToDate)
        ) {
            Alert.alert("Roster", "Select start/end date");
            return;
        }

        if (
            !CreateRoster.isSelected(this.state.FromDate) ||
            !CreateRoster.isSelected(this.state.ToDate)
        ) {
            if (!CreateRoster.isSelected(this.state.ToDate)) {
                Alert.alert("Roster", "Select End Date");
            } else if (!CreateRoster.isSelected(this.state.FromDate)) {
                Alert.alert("Roster", "Select Start Date");
            }
            return;
        }

        if (
            !CreateRoster.isSelected(this.state.logoutSelected) &&
            !CreateRoster.isSelected(this.state.loginSelected) &&
            !CreateRoster.isSelected(this.state.pickupLocationSelected) &&
            !CreateRoster.isSelected(this.state.dropLocationSelected)
        ) {
            Alert.alert("Roster", "Select login/logout time");
            return;
        }
        if (
            CreateRoster.isSelected(this.state.loginSelected) &&
            !CreateRoster.isSelected(this.state.pickupLocationSelected)
        ) {
            Alert.alert("Roster", "Select pickup location");
            return;
        } else if (
            !CreateRoster.isSelected(this.state.loginSelected) &&
            CreateRoster.isSelected(this.state.pickupLocationSelected)
        ) {
            Alert.alert("Roster", "Select login time");
            return;
        }

        if (
            CreateRoster.isSelected(this.state.logoutSelected) &&
            !CreateRoster.isSelected(this.state.dropLocationSelected)
        ) {
            Alert.alert("Roster", "Select drop location");
            return;
        } else if (
            !CreateRoster.isSelected(this.state.logoutSelected) &&
            CreateRoster.isSelected(this.state.dropLocationSelected)
        ) {
            Alert.alert("Roster", "Select logout time");
            return;
        }
        /*********************** End Validation *********************/

        var responseRosterDetails = JSON.parse(this.props.rosterDetails);

        /************************************ Manually Adding searched location ************************************/

        let pushToDataBody = [];
        let pushFromDataBody = [];
        if (this.state.toAddressID) {
            pushToDataBody = [
                {
                    ID: this.state.toAddressID,
                    Name: this.state.toNickName,
                    Address: this.state.toSelectedLocation,
                    Lat: this.state.toSelectLat,
                    Lng: this.state.toSelectLng
                }
            ];
        }

        if (this.state.fromAddressID) {
            pushFromDataBody = [
                {
                    ID: this.state.fromAddressID,
                    Name: this.state.fromNickName,
                    Address: this.state.fromSelectedLocation,
                    Lat: this.state.fromSelectLat,
                    Lng: this.state.fromSelectLng
                }
            ];
        }
        let newDate = [
            ...pushToDataBody,
            ...pushFromDataBody,
            ...responseRosterDetails.Locations
        ];
        const rosterDetailsLocations = _.uniqBy(newDate, "Name");

        /******************************* End of Manual Adding Searched location *************************************/
        /*****************End of Quick way to calculate ignore dates********************/
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
            RosterDate: this.state.RosterDate, //"2018-06-22"
            //RosterID: this.state.RosterID,
            DeviceID: this.state.UserId,
            FromDate: this.state.FromDate,
            ToDate: this.state.ToDate,
            IgnoreDates: tempIgnoreDates.join("|"), //uniqueDates,
            LoginLocID: findID(
                this.state.pickupLocationSelected,
                rosterDetailsLocations
            ), //"H",
            LogoutLocID: findID(
                this.state.dropLocationSelected,
                rosterDetailsLocations
            ), //"H",
            LoginTime: CreateRoster.isSelected(this.state.loginSelected)
                ? !this.state.loginSelected.split(",")[0]
                    ? ""
                    : this.state.loginSelected.split(",")[0] === "Cancelled"
                        ? "NS"
                        : this.state.loginSelected.split(",")[0]
                : "", //7:00"Test,
            LogoutTime: CreateRoster.isSelected(this.state.logoutSelected)
                ? !this.state.logoutSelected.split(",")[0]
                    ? ""
                    : this.state.logoutSelected.split(",")[0] === "Cancelled"
                        ? "NS"
                        : this.state.logoutSelected.split(",")[0]
                : "", //19:30
            LoginRouteType: CreateRoster.isSelected(this.state.loginSelected)
                ? this.state.loginSelected.split(",")[2]
                : "", //"D",test
            LogoutRouteType: CreateRoster.isSelected(this.state.logoutSelected)
                ? this.state.logoutSelected.split(",")[2]
                : "", //D
            LoginOffice: findID(
                this.state.officeLoginSelected,
                responseRosterDetails.Offices
            ), //"171" Test,
            LogoutOffice: findID(
                this.state.officeLoginSelected,
                responseRosterDetails.Offices
            ), //171
            LoginLocName: this.state.pickupLocationSelected, //"Home"
            LogoutLocName: this.state.dropLocationSelected, //"Home"
            LoginLocAddress: findAddress(
                this.state.pickupLocationSelected,
                rosterDetailsLocations
            ),
            LogoutLocAddress: findAddress(
                this.state.dropLocationSelected,
                rosterDetailsLocations
            ),
            LoginLocLat: findLat(
                this.state.pickupLocationSelected,
                rosterDetailsLocations
            ), //"13.000141",
            LoginLocLng: findLng(
                this.state.pickupLocationSelected,
                rosterDetailsLocations
            ), //"77.675617",
            LogoutLocLng: findLat(
                this.state.dropLocationSelected,
                rosterDetailsLocations
            ),
            LogoutLocLat: findLng(
                this.state.dropLocationSelected,
                rosterDetailsLocations
            )
        };

        API.newFetchJSON(
            this.state.CustomerUrl + URL.SAVE_ROSTER_RANGE,
            body,
            this.state.access_token,
            this.callback.bind(this),
            TYPE.CREATE_ROSTER
        );
        /* if (response)
          handleResponse.createRosterForSelectedDate(
            response,
            this,
            responseRosterDetails.AvailableRosters
          );
        else
          this.setState({
            isLoading: false
          });*/
    }

    _goback() {
        const {goBack} = this.props.navigation;
        setTimeout(function () {
            goBack();
        }, 500);
    }

    /************************End Update Roster********************/
    componentDidMount() {
        this.setState({
            markedDates: this.getDaysInMonth(
                moment().month(),
                moment().year(),
            
                this.state.DISABLED_DAYS
            )
        });
        AsyncStorage.multiGet(
            [asyncString.ACCESS_TOKEN, asyncString.USER_ID, asyncString.CAPI],
            (err, savedData) => {
                let access_token = CryptoXor.decrypt(savedData[0][1], asyncString.ACCESS_TOKEN); // JSON.parse(JSON.stringify(savedData[0][1]));
                let UserId = JSON.parse(JSON.stringify(savedData[1][1]));
                let CustomerUrl = savedData[2][1];
                if (!access_token) return;
                if (!UserId) return;
                this.setState({
                    access_token: access_token,
                    UserId: UserId,
                    CustomerUrl
                });
            }
        );
    }

    render() {
        if (!this.props.rosterDetails)
            return (
                <View
                    style={{flex: 1, justifyContent: "center", alignContent: "center"}}
                >
                    <ActivityIndicator animating={true}/>
                </View>
            );
        //Reading props
        let rosterDetails = JSON.parse(this.props.rosterDetails);
        let officeSelected = findName(
            rosterDetails.DefaultOffice,
            rosterDetails.Offices
        );
        let autoWeekDayCalculation = getAutoWeeklyOff(
            rosterDetails,
            this.state.reset
                ? findID(this.state.officeLoginSelected, rosterDetails.Offices)
                : rosterDetails.DefaultOffice
        );

        if (!this.state.officeLoginSelected)
            this.setState({
                officeLoginSelected: officeSelected
            });
        if (this.state.autoWeekDayCalculationBoolean) {
            this.setState({
                weeklyOffStateValue: autoWeekDayCalculation.autoWeekDayArray,
                excludeDaysNumber: autoWeekDayCalculation.diff,
                DISABLED_DAYS: autoWeekDayCalculation.autoWeekDayArray,
                markedDates: this.getDaysInMonth(
                    moment().month(),
                    moment().year(),
                    autoWeekDayCalculation.autoWeekDayArray
                ),
                autoWeekDayCalculationBoolean: false,
                tempWeeklyOffNumber: autoWeekDayCalculation.diff,
                tempWeeklyOff: autoWeekDayCalculation.autoWeekDayArray,
                reset: false
            });
        }
        /********************* Weekdays in Number from start date/end date and weekly off *************************/
        let calculateRoster = [
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
                // RestrictToPOILogin: 0,
                // RestrictToPOILogout: 0
                RestrictToPOILoginMap: new Map(),
                RestrictToPOILogOutMap: new Map()
            }
        ];
        let rosterDetailsLocationsJSON = []; //rosterDetails.Locations;
        let Offices = [];
        if (this.state.FromDate && this.state.ToDate) {
            var weeklyOffStateValue = this.state.weeklyOffStateValue.join();
            let selectedDays = [];
            if (this.state.FromDate && this.state.ToDate) {
                var datesStartEnd = getDates(
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
            for (i = 0; i < selectedDays.length; i++) {
                selectedDaysinNumber.push(weeklyOffDaysToNumber[selectedDays[i]]);
            }
            let officeNumberSelected = findID(
                this.state.officeLoginSelected,
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
                calculateRoster = getCalculatedRoster(
                    customisedRoster,
                    selectedDaysinNumber,
                    officeNumberSelected
                );
            }
            rosterDetailsLocationsJSON = rosterDetails.Locations;
        } else {
            Offices = rosterDetails.Offices;
        }

        /********************* Weekdays in Number from start date/end date and Weekly off *************************/
        /************************************ Manually Adding searched location ************************************/

        let pushToDataBody = [];
        let pushFromDataBody = [];
        if (this.state.toAddressID) {
            pushToDataBody = [
                {
                    ID: this.state.toAddressID,
                    Name: this.state.toNickName,
                    Address: this.state.toSelectedLocation,
                    Lat: this.state.toSelectLat,
                    Lng: this.state.toSelectLng
                }
            ];
        }

        if (this.state.fromAddressID) {
            pushFromDataBody = [
                {
                    ID: this.state.fromAddressID,
                    Name: this.state.fromNickName,
                    Address: this.state.fromSelectedLocation,
                    Lat: this.state.fromSelectLat,
                    Lng: this.state.fromSelectLng
                }
            ];
        }
        let newData = [
            ...pushToDataBody,
            ...pushFromDataBody,
            ...rosterDetailsLocationsJSON
        ];
        const rosterDetailsLocations = _.uniqBy(newData, "Name");

        const rosterDetailsLocationsWithoutOthers = [];
        for (i = 0; i < rosterDetailsLocations.length; i++) {
            if (rosterDetailsLocations[i].ID === "H") {
                rosterDetailsLocationsWithoutOthers.push(rosterDetailsLocations[i]);
            }
        }
        /******************************* End of Manual Adding Searched location *************************************/
        /******************************* Calendar Date Manipulation/Marking *****************************************/
        var weeklyOffStateValue = this.state.weeklyOffStateValue.join();
        let startDateEndDateMarkerArray = {};
        if (this.state.FromDate && this.state.ToDate) {
            var datesStartEnd = getDates(
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
        /******************************* End of Calendar Date Manipulation/Marking ***********************************/
        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    Keyboard.dismiss();
                }}
                onPressIn={() => {
                    Keyboard.dismiss();
                }}
                onPressOut={() => {
                    Keyboard.dismiss();
                }}
            >
                <View style={{flex: 1}}>
                    <Container>
                        {spinner.visible(this.state.isLoading)}
                        {this._renderStartDateCalendarPicker(newDates, rosterDetails)}
                        {this._renderEndDateCalendarPicker(newDates, rosterDetails)}
                        <Modal
                            isVisible={this.state.visibleModal === "AddNickName"}
                            style={{justifyContent: "flex-end", margin: 0}}
                        >
                            {this._renderAddNickNameModalContent()}
                        </Modal>
                        <Modal
                            isVisible={this.state.visibleModal === "weeklyOff"}
                            style={{justifyContent: "flex-end", margin: 0}}
                        >
                            {this._renderWeeklyOffModalContent()}
                        </Modal>

                        <Content padder style={{backgroundColor: colors.BACKGROUND}}>
                            <Form>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: "column",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: "row",
                                            justifyContent: "space-between"
                                        }}
                                    >
                                        <View style={{width: "100%"}}>
                                            <Text>Office</Text>
                                            <Card
                                                style={{
                                                    width: "100%",
                                                    height: 50,
                                                    flexDirection: "row"
                                                }}
                                            >
                                                <Picker
                                                    renderHeader={backAction => (
                                                        <Header style={{backgroundColor: colors.BLUE}}>
                                                            <Left>
                                                                <Button transparent onPress={backAction}>
                                                                    <Icon
                                                                        name="arrow-back"
                                                                        style={{color: "#fff"}}
                                                                    />
                                                                </Button>
                                                            </Left>
                                                            <Body style={{flex: 3}}>
                                                            <Title style={{color: "#fff"}}>
                                                                Office Location
                                                            </Title>
                                                            </Body>
                                                            <Right/>
                                                        </Header>
                                                    )}
                                                    mode="dropdown"
                                                    textStyle={{width: "100%"}}
                                                    style={{
                                                        width: Platform.OS === "ios" ? "100%" : "100%"
                                                    }}
                                                    placeholder="SELECT"
                                                    placeholderStyle={{color: "#bfc6ea"}}
                                                    placeholderIconColor="#007aff"
                                                    selectedValue={this.state.officeLoginSelected}
                                                    onValueChange={this.onOfficeLoginValueChange.bind(
                                                        this
                                                    )}
                                                >
                                                    {[
                                                        ...[{Name: "SELECT"}],
                                                        ...rosterDetails.Offices
                                                    ].map((value, i) => {
                                                        return (
                                                            <Picker.Item
                                                                key={value.Name}
                                                                label={value.Name}
                                                                value={
                                                                    value.Name === "SELECT"
                                                                        ? "SELECT"
                                                                        : value.Name
                                                                }
                                                            />
                                                        );
                                                    })}
                                                </Picker>
                                            </Card>
                                        </View>
                                    </View>
                                    {/*{------------------------ Multiple select ------------------------------}*/}
                                    <View style={{width: "100%"}}>
                                        <Text>Select weekly off</Text>
                                        <Card style={{width: "100%", height: 50}}>
                                            <TouchableDebounce
                                                transparent
                                                style={{
                                                    width: "100%",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    flexDirection: "row",
                                                    height: 50
                                                }}
                                                onPress={() => {
                                                    //this.weeklyOffPopup.show();
                                                    this.setState({visibleModal: "weeklyOff"});
                                                }}
                                            >
                                                <Text
                                                    numberOfLines={1}
                                                    style={{width: "100%", left: 15}}
                                                >
                                                    {this.state.weeklyOffStateValue.length === 0 ||
                                                    this.state.officeLoginSelected === "SELECT"
                                                        ? //||this.state.weeklyOffStateValue.length > 3
                                                        "SELECT"
                                                        : sortWeekdays(this.state.weeklyOffStateValue)}
                                                </Text>
                                                {Platform.OS === "android" ? (
                                                    <Ionicons
                                                        name="md-arrow-dropright"
                                                        style={{
                                                            color: colors.BLACK,
                                                            marginRight: 20,
                                                            right: 20
                                                        }}
                                                        size={20}
                                                    />
                                                ) : null}
                                            </TouchableDebounce>
                                        </Card>
                                    </View>
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: "row",
                                            justifyContent: "space-between"
                                        }}
                                    >
                                        <View style={{width: "45%"}}>
                                            <Text> Start Date </Text>
                                            <Card
                                                style={{
                                                    width: "100%",
                                                    height: 50,
                                                    flexDirection: "row"
                                                }}
                                            >
                                                <Button
                                                    transparent
                                                    iconRight
                                                    style={{width: "100%"}}
                                                    onPress={() => {
                                                        this.startDatePicker.show();
                                                    }}
                                                >
                                                    <Text style={{color: colors.BLACK}}>
                                                        {this.state.FromDate
                                                            ? moment(this.state.FromDate).format("D/MM/YYYY")
                                                            : "SELECT"}
                                                    </Text>
                                                    <Ionicons
                                                        name="md-calendar"
                                                        style={{color: colors.BLACK, marginRight: 20}}
                                                        size={20}
                                                    />
                                                </Button>
                                            </Card>
                                        </View>
                                        <View style={{width: "45%"}}>
                                            <Text> End Date </Text>
                                            <Card
                                                style={{
                                                    width: "100%",
                                                    height: 50,
                                                    flexDirection: "row"
                                                }}
                                            >
                                                <Button
                                                    transparent
                                                    iconRight
                                                    style={{width: "100%"}}
                                                    onPress={() => {
                                                        if (!this.state.FromDate) {
                                                            Alert.alert(
                                                                "Roster",
                                                                "Please select start date."
                                                            );
                                                            return;
                                                        }
                                                        this.endDatePicker.show();
                                                    }}
                                                >
                                                    <Text style={{color: colors.BLACK}}>
                                                        {this.state.ToDate && this.state.FromDate
                                                            ? moment(this.state.ToDate).format("D/MM/YYYY")
                                                            : "SELECT"}
                                                    </Text>
                                                    <Ionicons
                                                        name="md-calendar"
                                                        style={{color: colors.BLACK, marginRight: 20}}
                                                        size={20}
                                                    />
                                                </Button>
                                            </Card>
                                        </View>
                                    </View>

                                    {/*--------------------------------Login Time---------------------------------------*/}
                                    {calculateRoster.map((value, i) => {
                                        let LogoutShifts = value.LogoutShifts
                                            ? value.LogoutShifts + "|Cancel"
                                            : "";
                                        let LoginShifts = value.LoginShifts
                                            ? value.LoginShifts + "|Cancel"
                                            : "";
                                        return (
                                            <View key={i}>
                                                <View
                                                    style={{
                                                        flex: 1,
                                                        flexDirection: "row",
                                                        justifyContent: "space-between"
                                                    }}
                                                >
                                                    <View style={{width: "45%"}}>
                                                        <Text>Login Time </Text>
                                                        <Card
                                                            style={{
                                                                width: "100%",
                                                                height: 50,
                                                                flexDirection: "row"
                                                            }}
                                                        >
                                                            {this._renderLoginPicker(LoginShifts)}
                                                        </Card>
                                                    </View>
                                                    <View style={{width: "45%"}}>
                                                        <Text>Logout Time </Text>
                                                        <Card
                                                            style={{
                                                                width: "100%",
                                                                height: 50,
                                                                flexDirection: "row"
                                                            }}
                                                        >
                                                            <Picker
                                                                renderHeader={backAction => (
                                                                    <Header
                                                                        style={{backgroundColor: colors.BLUE}}
                                                                    >
                                                                        <Left>
                                                                            <Button transparent onPress={backAction}>
                                                                                <Icon
                                                                                    name="arrow-back"
                                                                                    style={{color: "#fff"}}
                                                                                />
                                                                            </Button>
                                                                        </Left>
                                                                        <Body style={{flex: 3}}>
                                                                        <Title style={{color: "#fff"}}>
                                                                            Select logout time
                                                                        </Title>
                                                                        </Body>
                                                                        <Right/>
                                                                    </Header>
                                                                )}
                                                                mode="dropdown"
                                                                textStyle={{width: "100%"}}
                                                                style={{
                                                                    width: Platform.OS === "ios" ? "100%" : "100%"
                                                                }}
                                                                selectedValue={this.state.logoutSelected}
                                                                onValueChange={this.onLogoutValueChange.bind(
                                                                    this
                                                                )}
                                                                placeholder="SELECT"
                                                                placeholderStyle={{color: "#bfc6ea"}}
                                                                placeholderIconColor="#007aff"
                                                            >
                                                                {("SELECT, |" + LogoutShifts)
                                                                    .split("|")
                                                                    .filter(val => {
                                                                        if (val) return val;
                                                                    })

                                                                    .map(val => {
                                                                        return (
                                                                            <Picker.Item
                                                                                key={val.split(",")[0]}
                                                                                label={val.split(",")[0]}
                                                                                value={val === "SELECT, " ? null : val}
                                                                            />
                                                                        );
                                                                    })}
                                                            </Picker>
                                                        </Card>
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    })}
                                    {/*---------------------------------------Logout Time-------------------------------------------*/}
                                    {/*--------------------------------------- Pick Up Start --------------------------------------*/}

                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: "row",
                                            justifyContent: "space-between"
                                        }}
                                    >
                                        <View style={{width: "45%"}}>
                                            <Text>Pickup Location</Text>
                                            <Card
                                                style={{
                                                    width: "100%",
                                                    height: 50,
                                                    flexDirection: "row"
                                                }}
                                            >
                                                <Picker
                                                    renderHeader={backAction => (
                                                        <Header style={{backgroundColor: colors.BLUE}}>
                                                            <Left>
                                                                <Button transparent onPress={backAction}>
                                                                    <Icon
                                                                        name="arrow-back"
                                                                        style={{color: "#fff"}}
                                                                    />
                                                                </Button>
                                                            </Left>
                                                            <Body style={{flex: 3}}>
                                                            <Title style={{color: "#fff"}}>
                                                                Select pickup location
                                                            </Title>
                                                            </Body>
                                                            <Right/>
                                                        </Header>
                                                    )}
                                                    mode="dropdown"
                                                    textStyle={{width: "100%"}}
                                                    style={{
                                                        width: Platform.OS === "ios" ? "100%" : "100%"
                                                    }}
                                                    placeholder="SELECT"
                                                    placeholderStyle={{color: "#bfc6ea"}}
                                                    placeholderIconColor="#007aff"
                                                    selectedValue={this.state.pickupLocationSelected}
                                                    onValueChange={this.onPickupLocationValueChange.bind(
                                                        this
                                                    )}
                                                >
                                                    {[
                                                        ...[{Name: "SELECT"}],
                                                        ...(rosterDetails.RosteringAllowedLogin === 1
                                                            ? calculateRoster[0].AllowOtherLocationsLogin ===
                                                            "1"
                                                                ? rosterDetailsLocations
                                                                : rosterDetailsLocationsWithoutOthers
                                                            : [])
                                                    ].map((value, i) => {
                                                        return (
                                                            <Picker.Item
                                                                key={value.Name}
                                                                label={
                                                                    calculateRoster[0].RestrictToPOILoginMap.get(this.state.loginSelected == null ? "" : this.state.loginSelected.split(",")[0]) === 1
                                                                        ? value.ID === "H"
                                                                        ? value.Name + "-Nodal"
                                                                        : value.Name
                                                                        : value.Name
                                                                }
                                                                value={
                                                                    value.Name === "SELECT" ? null : value.Name
                                                                }
                                                            />
                                                        );
                                                    })}
                                                </Picker>
                                            </Card>
                                        </View>
                                        <View style={{width: "45%"}}>
                                            <Text> Drop Location </Text>
                                            <Card
                                                style={{
                                                    width: "100%",
                                                    height: 50,
                                                    flexDirection: "row"
                                                }}
                                            >
                                                <Picker
                                                    renderHeader={backAction => (
                                                        <Header style={{backgroundColor: colors.BLUE}}>
                                                            <Left>
                                                                <Button transparent onPress={backAction}>
                                                                    <Icon
                                                                        name="arrow-back"
                                                                        style={{color: "#fff"}}
                                                                    />
                                                                </Button>
                                                            </Left>
                                                            <Body style={{flex: 3}}>
                                                            <Title style={{color: "#fff"}}>
                                                                Select drop location
                                                            </Title>
                                                            </Body>
                                                            <Right/>
                                                        </Header>
                                                    )}
                                                    mode="dropdown"
                                                    textStyle={{width: "100%"}}
                                                    style={{
                                                        width: Platform.OS === "ios" ? "100%" : "100%"
                                                    }}
                                                    placeholder="SELECT"
                                                    placeholderStyle={{color: "#bfc6ea"}}
                                                    placeholderIconColor="#007aff"
                                                    selectedValue={this.state.dropLocationSelected}
                                                    onValueChange={this.onDropLocationValueChange.bind(
                                                        this
                                                    )}
                                                >
                                                    {[
                                                        ...[{Name: "SELECT"}],
                                                        ...(rosterDetails.RosteringAllowedLogout === 1
                                                            ? calculateRoster[0].AllowOtherLocationsLogout ===
                                                            "1"
                                                                ? rosterDetailsLocations
                                                                : rosterDetailsLocationsWithoutOthers
                                                            : [])
                                                    ].map((value, i) => {
                                                        if (value === "SELECT")
                                                            return (
                                                                <Picker.Item
                                                                    key={value.Name}
                                                                    label={value.Name}
                                                                    value={null}
                                                                />
                                                            );
                                                        else
                                                            return (
                                                                <Picker.Item
                                                                    key={value.Name}
                                                                    label={
                                                                        calculateRoster[0].RestrictToPOILogOutMap.get(this.state.logoutSelected == null ? "" : this.state.logoutSelected.split(",")[0]) === 1
                                                                            ? value.ID === "H"
                                                                            ? value.Name + "-Nodal"
                                                                            : value.Name
                                                                            : value.Name
                                                                    }
                                                                    value={
                                                                        value.Name === "SELECT" ? null : value.Name
                                                                    }
                                                                />
                                                            );
                                                    })}
                                                </Picker>
                                            </Card>
                                        </View>
                                    </View>
                                    {/*------------------------------------------ End of Drop ----------------------------------------*/}
                                </View>
                            </Form>
                        </Content>

                        <Footer style={{backgroundColor: colors.BACKGROUND}}>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginTop: 5
                                }}
                            >
                                <Button
                                    style={{
                                        width: "100%",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                    success
                                    onPress={() => {
                                        console.warn("Started " + moment);
                                        this.createRoster();
                                    }}
                                >
                                    <Text>SAVE</Text>
                                </Button>
                            </View>
                        </Footer>
                    </Container>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    saveEmployeLocation() {
        if (
            !(this.state.type === "from"
                ? this.state.fromNickName
                : this.state.toNickName)
        ) {
            Alert.alert("Add location", "Place name cannot be blank");
            return;
        }
        /*else {
             this.setState({ visibleModal: false });
           }*/

        let body = {
            DeviceID: this.state.UserId,
            NickName:
                this.state.type === "from"
                    ? this.state.fromNickName
                    : this.state.toNickName,
            Latitude:
                this.state.type === "from"
                    ? this.state.fromSelectLat
                    : this.state.toSelectLat,
            Longitude:
                this.state.type === "from"
                    ? this.state.fromSelectLng
                    : this.state.toSelectLng,
            Location:
                this.state.type === "from"
                    ? this.state.fromSelectedLocation
                    : this.state.toSelectedLocation
        };
        this.setState({isLoading: true});
        API.newFetchJSON(
            this.state.CustomerUrl + URL.SAVE_LOCATION,
            body,
            true,
            this.callback.bind(this),
            TYPE.ADD_CUSTOM_LOCATION
        );
        /*if (response)
          handleResponse.saveEmployeeLocation(
            response,
            this,
            this.state.type,
            this.state.type === "from"
              ? this.state.fromNickName
              : this.state.toNickName
          );
        else this.setState({ isLoading: false });*/
    }

    _renderWeeklyOffModalContent() {
        var WEEKDAYS = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ];
        return (
            <View
                style={{
                    height: "60%",
                    backgroundColor: "white",
                    padding: 22,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 4,
                    borderColor: "rgba(0, 0, 0, 0.1)"
                }}
            >
                <FlatList
                    keyExtractor={this._keyExtractor()}
                    data={WEEKDAYS}
                    renderItem={this.renderItem.bind(this)}
                    ListHeaderComponent={this.renderHeader}
                />
                <View
                    style={{
                        width: "100%",
                        height: 50,
                        paddingLeft: 10,
                        paddingRight: 10,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignContent: "center"
                    }}
                >
                    <Button
                        danger
                        style={{
                            width: "40%",
                            backgroundColor: colors.RED,
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                        onPress={() => {
                            /* console.warn(
                              "Cancel : " +
                                JSON.stringify({
                                  excludeDaysNumber: this.state.tempWeeklyOffNumber, //[], //newArray,
                                  weeklyOffStateValue: this.state.tempWeeklyOff, //[],
                                  visibleModal: null
                                })
                            );*/
                            this.setState({
                                excludeDaysNumber: this.state.tempWeeklyOffNumber, //[], //newArray,
                                weeklyOffStateValue: this.state.tempWeeklyOff, //[],
                                visibleModal: null
                            });
                        }}
                    >
                        <Text>Cancel</Text>
                    </Button>
                    <Button
                        success
                        style={{
                            width: "40%",
                            backgroundColor: colors.GREEN,
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                        onPress={() => {
                            if (this.state.weeklyOffStateValue.length > 3) {
                                Alert.alert("Roster", "Maximum 3 weekly off allowed ");
                            } else {
                                let dayIndexArray = [];
                                let i;
                                for (i = 0; i < this.state.weeklyOffStateValue.length; i++) {
                                    dayIndexArray.push(
                                        WEEKDAYS.indexOf(this.state.weeklyOffStateValue[i])
                                    );
                                }
                                /* console.warn(
                                  "Done : " +
                                    JSON.stringify({
                                      excludeDaysNumber: dayIndexArray, //newArray,
                                      markedDates: this.getDaysInMonth(
                                        moment().month(),
                                        moment().year(),
                                        this.state.weeklyOffStateValue
                                      ),
                                      visibleModal: null,
                                      tempWeeklyOffNumber: dayIndexArray,
                                      tempWeeklyOff: this.state.weeklyOffStateValue
                                    })
                                );*/
                                this.setState({
                                    excludeDaysNumber: dayIndexArray, //newArray,
                                    markedDates: this.getDaysInMonth(
                                        moment().month(),
                                        moment().year(),
                                        this.state.weeklyOffStateValue
                                    ),
                                    visibleModal: null,
                                    tempWeeklyOffNumber: dayIndexArray,
                                    tempWeeklyOff: this.state.weeklyOffStateValue
                                });
                            }
                        }}
                    >
                        <Text>Done</Text>
                    </Button>
                </View>
            </View>
        );
    }

    renderItem(data) {
        let {item, index} = data;
        var isSelected = false;
        if (this.state.weeklyOffStateValue.join().includes(item)) {
            isSelected = true;
        }
        return (
            <View style={styles.itemBlock}>
                <TouchableDebounce
                    style={{width: "100%", flexDirection: "row"}}
                    onPress={() => {
                        // console.warn("item : " + item);
                        this.addWeeklyOff(item);
                    }}
                >
                    {isSelected ? (
                        <MaterialIcons
                            name="check-box"
                            style={{color: colors.BLACK, marginRight: 20, padding: 5}}
                            size={20}
                        />
                    ) : (
                        <MaterialIcons
                            name="check-box-outline-blank"
                            style={{color: colors.BLACK, marginRight: 20, padding: 5}}
                            size={20}
                        />
                    )}
                    <Text style={styles.itemName}>{item}</Text>
                </TouchableDebounce>
            </View>
        );
    }

    renderSeparator() {
        return <View style={styles.separator}/>;
    }

    renderHeader() {
        return (
            <View style={styles.header}>
                <Text style={styles.headerText}>Select Weekly Off</Text>
            </View>
        );
    }

    _keyExtractor(item, index) {
        return index;
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
        } else {
            if (this.state.weeklyOffStateValue.length > 2) {
                Alert.alert(null, "Only 3 weekly off allowed");
                return;
            }
            // console.warn({
            //   weeklyOffStateValue: [...this.state.weeklyOffStateValue, item],
            //   DISABLED_DAYS: [...this.state.weeklyOffStateValue, item]
            // });
            this.setState({
                weeklyOffStateValue: [...this.state.weeklyOffStateValue, item],
                DISABLED_DAYS: [...this.state.weeklyOffStateValue, item]
            });
        }
    }

    _renderStartDateCalendarPicker(newDates, rosterDetails) {
        return (
            <PopupDialog
                height={1}
                width={1}
                overlayOpacity={0.7}
                containerStyle={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    alignSelf: "center",
                    backgroundColor: "transparent"
                }}
                dialogAnimation={slideAnimation}
                ref={popupDialog => {
                    this.startDatePicker = popupDialog;
                }}
            >
                <TouchableDebounce
                    style={{
                        width: 100,
                        margin: 10
                    }}
                    onPress={() => {
                        this.startDatePicker.dismiss();
                    }}
                >
                    <Icon
                        style={{color: colors.RED, marginRight: 10, fontSize: 40}}
                        name="ios-close-circle"
                    />
                </TouchableDebounce>
                <Calendar
                    style={{width: "100%", height: "90%"}}
                    minDate={moment()
                    //.add(1, "days")
                        .format()}
                    maxDate={moment()
                        .add(rosterDetails.EligibleRosterDays - 2, "days")
                        .format()}
                    markedDates={newDates}
                    displayLoadingIndicator={false}
                    markingType={"multi-dot"}
                    hideExtraDays={true}
                    onDayPress={day => {
                        const selectedDate = moment(new Date(day.dateString)).format(
                            "YYYY-MM-DD"
                        );
                        const currentDate = moment().format("YYYY-MM-DD");
                        if (selectedDate && selectedDate === currentDate) {
                            Toast.show(
                                "You can only select future dates here. To review or edit today's roster, go to 'View/Modify' Page"
                            );
                            return;
                        }
                        this.setState({
                            RosterDate: day.dateString,
                            FromDate: day.dateString,
                            ToDate: ""
                        });

                        this.startDatePicker.dismiss();
                    }}
                    onVisibleMonthsChange={date => {
                        if (date && date[0] && date[0].month && date[0].year) {
                            let a = this.getDaysInMonth(
                                date[0].month - 1,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );

                            let b = this.getDaysInMonth(
                                date[0].month,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );

                            let c = this.getDaysInMonth(
                                date[0].month + 1,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let d = this.getDaysInMonth(
                                date[0].month + 2,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let e = this.getDaysInMonth(
                                date[0].month + 3,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let f = this.getDaysInMonth(
                                date[0].month + 4,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let g = this.getDaysInMonth(
                                date[0].month + 5,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let h = this.getDaysInMonth(
                                date[0].month + 6,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let i = this.getDaysInMonth(
                                date[0].month + 7,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let j = this.getDaysInMonth(
                                date[0].month + 8,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let k = this.getDaysInMonth(
                                date[0].month + 9,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let l = this.getDaysInMonth(
                                date[0].month + 10,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let m = this.getDaysInMonth(
                                date[0].month + 11,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let n = this.getDaysInMonth(
                                date[0].month + 12,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );

                            let combo = Object.assign(
                                a,
                                b,
                                c,
                                d,
                                e,
                                f,
                                g,
                                h,
                                i,
                                j,
                                k,
                                l,
                                m,
                                n
                            );
                            this.setState({markedDates: combo});
                        }
                    }}
                    pastScrollRange={
                        1 // Max amount of months allowed to scroll to the past. Default = 50
                    }
                    futureScrollRange={
                        1 // Max amount of months allowed to scroll to the future. Default = 50
                    }
                    scrollEnabled={
                        true // Enable or disable scrolling of calendar list
                    }
                    showScrollIndicator={
                        true // Enable or disable vertical scroll indicator. Default = false
                    }
                />
            </PopupDialog>
        );
    }

    _renderEndDateCalendarPicker(newDates, rosterDetails) {
        return (
            <PopupDialog
                height={1}
                width={1}
                overlayOpacity={0.7}
                containerStyle={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    alignSelf: "center",
                    backgroundColor: "transparent"
                }}
                dialogAnimation={slideAnimation}
                ref={popupDialog => {
                    this.endDatePicker = popupDialog;
                }}
            >
                <TouchableDebounce
                    style={{
                        width: 100,
                        margin: 10
                    }}
                    onPress={() => {
                        this.endDatePicker.dismiss();
                    }}
                >
                    <Icon
                        style={{color: colors.RED, marginRight: 10, fontSize: 40}}
                        name="ios-close-circle"
                    />
                </TouchableDebounce>
                <Calendar
                    markedDates={newDates}
                    minDate={moment()
                    //.add(1, "days")
                        .format()}
                    maxDate={moment()
                        .add(rosterDetails.EligibleRosterDays - 2, "days")
                        .format()}
                    displayLoadingIndicator={false}
                    markingType={"multi-dot"}
                    hideExtraDays={true}
                    onDayPress={day => {
                        const selectedDate = moment(new Date(day.dateString)).format(
                            "yyyy-MM-DD"
                        );
                        const currentDate = moment().format();
                        if (
                            selectedDate &&
                            selectedDate.split("T")[0] === currentDate.split("T")[0]
                        ) {
                            Toast.show(
                                "You can only select future dates here. To review or edit today's roster, go to 'View/Modify' Page"
                            );
                            return;
                        }
                        if (!checkDate(this.state.FromDate, day.dateString)) {
                            Toast.show("End date should be always greater than start date");
                            return;
                        }
                        this.setState({
                            RosterDate: day.dateString,
                            ToDate: day.dateString
                        });
                        this.endDatePicker.dismiss();
                    }}
                    onVisibleMonthsChange={date => {
                        if (date && date[0] && date[0].month && date[0].year) {
                            let a = this.getDaysInMonth(
                                date[0].month - 1,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );

                            let b = this.getDaysInMonth(
                                date[0].month,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );

                            let c = this.getDaysInMonth(
                                date[0].month + 1,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let d = this.getDaysInMonth(
                                date[0].month + 2,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let e = this.getDaysInMonth(
                                date[0].month + 3,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let f = this.getDaysInMonth(
                                date[0].month + 4,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let g = this.getDaysInMonth(
                                date[0].month + 5,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let h = this.getDaysInMonth(
                                date[0].month + 6,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let i = this.getDaysInMonth(
                                date[0].month + 7,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let j = this.getDaysInMonth(
                                date[0].month + 8,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let k = this.getDaysInMonth(
                                date[0].month + 9,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let l = this.getDaysInMonth(
                                date[0].month + 10,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let m = this.getDaysInMonth(
                                date[0].month + 11,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );
                            let n = this.getDaysInMonth(
                                date[0].month + 12,
                                date[0].year,
                                this.state.DISABLED_DAYS
                            );

                            let combo = Object.assign(
                                a,
                                b,
                                c,
                                d,
                                e,
                                f,
                                g,
                                h,
                                i,
                                j,
                                k,
                                l,
                                m,
                                n
                            );
                            this.setState({markedDates: combo});
                        }
                    }}
                    pastScrollRange={
                        1 // Max amount of months allowed to scroll to the past. Default = 50
                    }
                    futureScrollRange={
                        1 // Max amount of months allowed to scroll to the future. Default = 50
                    }
                    scrollEnabled={
                        true // Enable or disable scrolling of calendar list
                    }
                    showScrollIndicator={
                        true // Enable or disable vertical scroll indicator. Default = false
                    }
                />
            </PopupDialog>
        );
    }

    _renderLoginPicker(LoginShifts) {
        return (
            <Picker
                renderHeader={backAction => (
                    <Header style={{backgroundColor: colors.BLUE}}>
                        <Left>
                            <Button transparent onPress={backAction}>
                                <Icon name="arrow-back" style={{color: "#fff"}}/>
                            </Button>
                        </Left>
                        <Body style={{flex: 3}}>
                        <Title style={{color: "#fff"}}>SELECT LOGIN TIME</Title>
                        </Body>
                        <Right/>
                    </Header>
                )}
                mode="dropdown"
                textStyle={{width: "100%"}}
                style={{
                    width: Platform.OS === "ios" ? "90%" : "100%"
                }}
                placeholder="SELECT"
                placeholderStyle={{color: "#bfc6ea"}}
                placeholderIconColor="#007aff"
                selectedValue={this.state.loginSelected}
                onValueChange={this.onLoginValueChange.bind(this)}
            >
                {("SELECT, |" + LoginShifts)
                    .split("|")
                    .filter(val => {
                        if (val) return val;
                    })
                    .map(val => {
                        return (
                            <Picker.Item
                                key={val.split(",")[0]}
                                label={val.split(",")[0]}
                                value={val === "SELECT, " ? null : val}
                            />
                        );
                    })}
            </Picker>
        );
    }
}

CreateRoster.propTypes = {
    rosterDetails: PropTypes.string
};

export default withNavigation(CreateRoster);

function findAddress(Name, array) {
    if (!Name) return;
    let i;
    for (i = 0; i < array.length; i++) {
        if (array[i].Name.toString().trim() === Name.toString().trim()) {
            return array[i].Address;
        }
    }
    return "";
}

function findLat(Name, array) {
    if (!Name) return;
    let i;
    for (i = 0; i < array.length; i++) {
        if (array[i].Name.toString().trim() === Name.toString().trim()) {
            return array[i].Lat;
        }
    }
    return "";
}

function findLng(Name, array) {
    if (!Name) return;
    let i;
    for (i = 0; i < array.length; i++) {
        if (array[i].Name.toString().trim() === Name.toString().trim()) {
            return array[i].Lng;
        }
    }
    return "";
}

Array.prototype.clean = function (deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};

function checkDate(start, end) {
    if (!start || !end) return;
    var mStart = moment(new Date(start).toISOString());
    var mEnd = moment(new Date(end).toISOString());
    return mStart.isSameOrBefore(mEnd);
}

function findName(id, array) {
    var i;
    for (i = 0; i < array.length; i++) {
        if (array[i].ID.toString().trim() == id.toString().trim()) {
            return array[i].Name;
        }
    }
    return "NA";
}

function findID(Name, array) {
    if (!Name) return;
    var i;
    for (i = 0; i < array.length; i++) {
        if (array[i].Name.toString().trim() == Name.toString().trim()) {
            return array[i].ID;
        }
    }
    return "NA";
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20
    },
    itemBlock: {
        flexDirection: "row",
        width: "100%"
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
        fontSize: 15,
        padding: 5,
        width: "90%"
    },
    itemLastMessage: {
        fontSize: 14,
        color: "#111"
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
        fontSize: 20,
        fontWeight: "700"
    }
});
let getDates = function (startDate, endDate) {
    let dates = [],
        currentDate = startDate,
        addDays = function (days) {
            let date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        };
    while (currentDate <= endDate) {
        dates.push(currentDate);
        currentDate = addDays.call(currentDate, 1);
    }
    return dates;
};

function sortWeekdays(weekdays) {
    if (weekdays.length <= 0) {
        return "";
    }
    const order = {
        Sunday: 1,
        Monday: 2,
        Tuesday: 3,
        Wednesday: 4,
        Thursday: 5,
        Friday: 6,
        Saturday: 7
    };

    weekdays.sort(function (a, b) {
        return order[a] - order[b];
    });
    return weekdays.join(",");
}

function getCalculatedRoster(
    Rosters,
    selectedDaysArray,
    selectedOfficeLocation
) {
    if (!selectedOfficeLocation) {
        return;
    }
    let rosterTotalWeekdaysAvailable = [];
    for (i = 0; i < Rosters.length; i++) {
        rosterTotalWeekdaysAvailable.push(Rosters[i].WeekdaysAllowed);
    }
    for (i = 0; i < selectedDaysArray.length; i++) {
        for (j = 0; j < Rosters.length; j++) {
            if (
                !rosterTotalWeekdaysAvailable.join("|").includes(selectedDaysArray[i])
            ) {
                return [
                    {
                        LoginShifts: "",
                        LogoutShifts: "",
                        OfficeLocationsAllowed: "",
                        AllowOtherLocationsLogin: 0,
                        AllowOtherLocationsLogout: 0
                    }
                ];
            }
        }
    }

    let newLoginShifts = [];
    for (k = 0; k < Rosters.length; k++) {
        let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
        let LoginShiftsArray = Rosters[k].LoginShifts.split("|");
        for (i = 0; i < WeekdaysAllowedArray.length; i++) {
            for (j = 0; j < LoginShiftsArray.length; j++) {
                newLoginShifts.push(
                    LoginShiftsArray[j] + "#" + WeekdaysAllowedArray[i]
                );
            }
        }
    }
    newLoginShifts = newLoginShifts.sort();
    //console.warn("newLoginShifts : " + newLoginShifts);
    let newLogoutShifts = [];
    for (k = 0; k < Rosters.length; k++) {
        let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
        let LogoutShiftsArray = Rosters[k].LogoutShifts.split("|");
        for (i = 0; i < WeekdaysAllowedArray.length; i++) {
            for (j = 0; j < LogoutShiftsArray.length; j++) {
                newLogoutShifts.push(
                    LogoutShiftsArray[j] + "#" + WeekdaysAllowedArray[i]
                );
            }
        }
    }
    newLogoutShifts = newLogoutShifts.sort();
    let newOfficeLocationsAllowed = [];
    for (k = 0; k < Rosters.length; k++) {
        let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
        let OfficeLocationsAllowedArray = Rosters[k].OfficeLocationsAllowed.split(
            "|"
        );
        for (i = 0; i < WeekdaysAllowedArray.length; i++) {
            for (j = 0; j < OfficeLocationsAllowedArray.length; j++) {
                //Need to Add Filter...(Based on Selected OfficeLocation
                newOfficeLocationsAllowed.push(
                    OfficeLocationsAllowedArray[j] + "#" + WeekdaysAllowedArray[i]
                );
                // }
            }
        }
    }
    let newAllowOtherLocationsLogin = [];
    for (k = 0; k < Rosters.length; k++) {
        let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
        let AllowOtherLocationsLoginArray = [Rosters[k].AllowOtherLocationsLogin];
        for (i = 0; i < WeekdaysAllowedArray.length; i++) {
            for (j = 0; j < AllowOtherLocationsLoginArray.length; j++) {
                newAllowOtherLocationsLogin.push(
                    AllowOtherLocationsLoginArray[j] + "#" + WeekdaysAllowedArray[i]
                );
            }
        }
    }
    let newAllowOtherLocationsLogout = [];
    for (k = 0; k < Rosters.length; k++) {
        let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
        let AllowOtherLocationsLogoutArray = [Rosters[k].AllowOtherLocationsLogout];
        for (i = 0; i < WeekdaysAllowedArray.length; i++) {
            for (j = 0; j < AllowOtherLocationsLogoutArray.length; j++) {
                newAllowOtherLocationsLogout.push(
                    AllowOtherLocationsLogoutArray[j] + "#" + WeekdaysAllowedArray[i]
                );
            }
        }
    }

    /* let RestrictToPOILogin = [];
    for (k = 0; k < Rosters.length; k++) {
      let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
      let AllowOtherLocationsLoginArray = [Rosters[k].RestrictToPOILogin];
      for (i = 0; i < WeekdaysAllowedArray.length; i++) {
        for (j = 0; j < AllowOtherLocationsLoginArray.length; j++) {
          RestrictToPOILogin.push(
            AllowOtherLocationsLoginArray[j] + "#" + WeekdaysAllowedArray[i]
          );
        }
      }
    }
    let RestrictToPOILogout = [];
    for (k = 0; k < Rosters.length; k++) {
      let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
      let AllowOtherLocationsLogoutArray = [Rosters[k].RestrictToPOILogout];
      for (i = 0; i < WeekdaysAllowedArray.length; i++) {
        for (j = 0; j < AllowOtherLocationsLogoutArray.length; j++) {
          RestrictToPOILogout.push(
            AllowOtherLocationsLogoutArray[j] + "#" + WeekdaysAllowedArray[i]
          );
        }
      }
    } */

    /*Author : Nipun
  Changes : for nodal
  */
    let RestrictToPOILoginMap = new Map();
    for (k = 0; k < Rosters.length; k++) {
        let LoginShiftsArray = Rosters[k].LoginShifts.split("|");
        for (j = 0; j < LoginShiftsArray.length; j++) {
            RestrictToPOILoginMap.set(LoginShiftsArray[j].split(",")[0], Rosters[k].RestrictToPOILogin);
        }
    }

    let RestrictToPOILogOutMap = new Map();
    for (k = 0; k < Rosters.length; k++) {
        let LogoutShiftsArray = Rosters[k].LogoutShifts.split("|");
        for (j = 0; j < LogoutShiftsArray.length; j++) {
            RestrictToPOILogOutMap.set(LogoutShiftsArray[j].split(",")[0], Rosters[k].RestrictToPOILogout);
        }
    }

    let OfficeLocationsAllowed = getCalculatedValue(
        newOfficeLocationsAllowed,
        selectedDaysArray,
        false
    );

    if (OfficeLocationsAllowed.includes(selectedOfficeLocation.toString())) {
        const addZeroCutoff = true;
        return [
            {
                LoginShifts: getCalculatedValue(
                    newLoginShifts,
                    selectedDaysArray,
                    addZeroCutoff
                ),
                LogoutShifts: getCalculatedValue(
                    newLogoutShifts,
                    selectedDaysArray,
                    addZeroCutoff
                ),
                OfficeLocationsAllowed: getCalculatedValue(
                    newOfficeLocationsAllowed,
                    selectedDaysArray
                ),
                AllowOtherLocationsLogin: getCalculatedValue(
                    newAllowOtherLocationsLogin,
                    selectedDaysArray
                ),
                AllowOtherLocationsLogout: getCalculatedValue(
                    newAllowOtherLocationsLogout,
                    selectedDaysArray
                ),
                RestrictToPOILoginMap,
                RestrictToPOILogOutMap
                /* RestrictToPOILogin: getCalculatedValue(
                  RestrictToPOILogin,
                  selectedDaysArray
                ),
                RestrictToPOILogout: getCalculatedValue(
                  RestrictToPOILogout,
                  selectedDaysArray
                ) */
            }
        ];
    } else
        return [
            {
                LoginShifts: "",
                LogoutShifts: "",
                AllowOtherLocationsLogin: getCalculatedValue(
                    newAllowOtherLocationsLogin,
                    selectedDaysArray
                ),
                AllowOtherLocationsLogout: getCalculatedValue(
                    newAllowOtherLocationsLogout,
                    selectedDaysArray
                ),
                RestrictToPOILogin: getCalculatedValue(
                    RestrictToPOILogin,
                    selectedDaysArray
                ),
                RestrictToPOILogout: getCalculatedValue(
                    RestrictToPOILogout,
                    selectedDaysArray
                )
            }
        ];
}

function getCalculatedValue(shifts, selectedDaysArray, addZeroCutoff) {
    let matched = [];
    for (i = 0; i < selectedDaysArray.length; i++) {
        for (j = 0; j < shifts.length; j++) {
            if (selectedDaysArray[i] === shifts[j].split("#")[1]) {
                matched.push(shifts[j]);
            }
        }
    }
    let onlyMatched = [];
    for (i = 0; i < matched.length; i++) {
        let mat = matched[i].substr(0, matched[i].lastIndexOf("#"));
        if (mat)
            onlyMatched.push(
                addZeroCutoff ? mat.split(",")[0] + ",0,D" : mat.split(",")[0]
            );
    }
    const count = {};
    onlyMatched.forEach(function (i) {
        count[i] = (count[i] || 0) + 1;
    });

    let common = [];
    let max = selectedDaysArray.length;
    Object.keys(count).forEach(function (key) {
        var value = count[key];
        if (value >= max) {
            common.push(key);
        }
    });
    common => common.sort;
    return common.join("|");
}

function getAutoWeeklyOff(rosterDetails, selectedOfficeLocation) {
    let autoWeekendArrayDuplicate = [];
    for (i = 0; i < Object.keys(rosterDetails.Rosters).length; i++) {
        if (
            rosterDetails.Rosters[i].OfficeLocationsAllowed.includes(
                selectedOfficeLocation
            )
        ) {
            let WeekdaysAllowed = rosterDetails.Rosters[i].WeekdaysAllowed.split("|");
            for (j = 0; j < WeekdaysAllowed.length; j++) {
                autoWeekendArrayDuplicate.push(WeekdaysAllowed[j]);
            }
        }
    }
    let autoWeekendArray = autoWeekendArrayDuplicate.filter(function (item, pos) {
        return autoWeekendArrayDuplicate.indexOf(item) == pos;
    });
    let tempWeeklyOffStateValue = [];
    let random = ["0", "1", "2", "3", "4", "5", "6"];
    let diff = arr_diff(autoWeekendArray, random).slice(0, -1);
    tempWeeklyOffStateValue.push(...diff);
    let autoWeekDayArray = [];
    for (i = 0; i < tempWeeklyOffStateValue.length; i++) {
        if (tempWeeklyOffStateValue[i] === "0") {
            autoWeekDayArray.push("Sunday");
        } else if (tempWeeklyOffStateValue[i] === "1") {
            autoWeekDayArray.push("Monday");
        } else if (tempWeeklyOffStateValue[i] === "2") {
            autoWeekDayArray.push("Tuesday");
        } else if (tempWeeklyOffStateValue[i] === "3") {
            autoWeekDayArray.push("Wednesday");
        } else if (tempWeeklyOffStateValue[i] === "4") {
            autoWeekDayArray.push("Thursday");
        } else if (tempWeeklyOffStateValue[i] === "5") {
            autoWeekDayArray.push("Friday");
        } else if (tempWeeklyOffStateValue[i] === "6") {
            autoWeekDayArray.push("Saturday");
        }
    }
    return {
        autoWeekDayArray,
        diff
    };
}

function arr_diff(a1, a2) {
    var a = [],
        diff = [];

    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }

    for (var k in a) {
        diff.push(k);
    }

    return diff;
}
