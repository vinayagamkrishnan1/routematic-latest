import React, {Component} from "react";
import {CalendarList} from "react-native-calendars";
import moment from "moment";
import {asyncString, noShow as noshow, pushClearKeys} from "../../utils/ConstantString";
import {URL} from "../../network/apiConstants/index";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import {API} from "../../network/apiFetch/API";
import {colors} from "../../utils/Colors";
import FAB from "react-native-fab";
import {Button, Card, Input, Item, Text} from "native-base";
import {Alert, BackHandler, KeyboardAvoidingView, StatusBar, ScrollView, View} from "react-native";
import PopupDialog, {SlideAnimation} from "react-native-popup-dialog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {
    filterShiftTimeBasedOnCutOffTime,
    isLimitExceded,
    isLoginNoShowPerformed,
    isLogoutNoShowPerformed,
    isNoShowActionPerformed,
    isWithinCutOff,
    isWithInTimeFrame
} from "../../utils/customFunction";
import Ionicons from "react-native-vector-icons/Ionicons";
import {TYPE} from "../../model/ActionType";
import {rosterType} from "./customeComponent/RosterType";
import RBSheet from "react-native-raw-bottom-sheet";
import * as HOC from "../../components/hoc";
import ViewRosterComponent from "./ViewRosterComponent";
import _ from "lodash";
import {spinner} from "../../network/loader/Spinner";
import * as Toast from "../../utils/Toast";
import { CryptoXor } from "crypto-xor";

const ViewLoader = HOC.LoaderHOC(View);

const DISABLED_DAYS = [
    // "saturday", "sunday"
];

let loginLocation = [];
let logoutLocation = [];

const slideAnimation = new SlideAnimation({
    slideFrom: "bottom"
});

class ViewModifyRoster extends Component {
    static navigationOptions = {
        title: "My Roster",
        headerTitleStyle: {fontFamily: "Roboto"}
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
            this.updateRoster(this.state.isTested)
        }, 60);
    };

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
                            this.state.type === "from"
                                ? this.fromNickNameChangeHandler(text)
                                : this.toNickNameChangeHandler(text)
                        }
                        value={this.state.nickName}
                        blurOnSubmit={true}
                    />
                </View>

                {this._renderButton("Add", () => {
                    this.saveEmployeeLocation();
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
    )
    //Loader State Handle Call From Loader.Helps when back Key pressed while Loading
    onUpdate = () => {
        this.setState({
            isLoading: false
        });
    };
    setSelectedDate = () => {
        this.props.onSelectedDate();
    };
    _renderButton = (text, onPress) => (
        <Button full success onPress={onPress} style={{marginTop: 10}}>
            <Text
                style={{
                    fontSize: 13,
                    fontFamily: "Helvetica"
                }}
            >
                {text}
            </Text>
        </Button>
    );
    callback = async (actionType, response, copyDataObj) => {
        const {navigate} = this.props.navigation;
        switch (actionType) {
            case TYPE.GET_ROSTER_DETAILS: {
                handleResponse.getRosterDetails(response, this, navigate, true);
                break;
            }
            case TYPE.GET_SELECTED_ROSTER: {
                handleResponse.getSelectedRoster(
                    response,
                    this,
                    JSON.stringify(this.state.rosterDetails),
                    copyDataObj
                );
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
            case TYPE.UPDATE_ROSTER: {
                handleResponse.updateRosterForSelectedDate(response, this);
                break;
            }
        }
    };
    getRosterDetails = () => {
        const {navigate} = this.props.navigation;
        AsyncStorage.multiGet(
            [
                asyncString.ACCESS_TOKEN,
                asyncString.USER_ID,
                asyncString.IdleTimeOutInMins,
                asyncString.CAPI,
                asyncString.isRosterOptOutEnabled,
                asyncString.DISCLAIMER_TYPE,
            ],
            (err, savedData) => {
                let access_token = CryptoXor.decrypt(savedData[0][1], asyncString.ACCESS_TOKEN); // JSON.parse(JSON.stringify(savedData[0][1]));
                let UserId = JSON.parse(JSON.stringify(savedData[1][1]));
                let CustomerUrl = savedData[3][1];
                let isRosterOptOutEnabled = savedData[4][1];
                let disclaimerType = savedData[5][1];
                if (!access_token) return;
                if (!UserId) return;
                setTimeout(() => {
                    this.setState({
                        isLoading: true,
                        access_token,
                        CustomerUrl,
                        UserId,
                        IdleTimeOutInMins: parseInt(savedData[2][1]),
                        isRosterOptOutEnabled: savedData[4][1],
                        disclaimerType: savedData[5][1],
                    });
                }, 100);

                let body = {DeviceID: UserId};
                API.newFetchJSON(
                    CustomerUrl + URL.GET_ROSTER_DETAILS,
                    body,
                    true,
                    this.callback.bind(this),
                    TYPE.GET_ROSTER_DETAILS
                );
                // Roster opt-out content to save
                if (isRosterOptOutEnabled === "true" && disclaimerType) {
                    API.newFetchXJSON(URL.Opt_Out_GET, true, (actionType, response, copyDataObj) => {
                        // console.warn("opt-out response " + JSON.stringify(response.data.data));
                        if (!response || response.status === 401) {
                            handleResponse.expireSession(context);
                            return;
                        }
                        let data = response.data;
                        if (data.status.code === 500) {
                            Alert.alert("Opt-Out", data.status.message);
                        }else if(data.status.code === 200) {
                            setTimeout(() => {
                                this.setState({
                                    RosterContent: response.data.data.tcContent
                                });
                            });
                        }
                    }, TYPE.OPT_OUT);
                }
            }
        );
    };
    checkRosterEditRule = calculateRoster => {
        let rosterEditRule = {
            isLoginModifyAllowed: false,
            isLogoutModifyAllowed: false
        };

        const selectedDate = moment(this.state.RosterDate).format("YYYY-MM-DD");
        const prevDate = moment()
            .subtract(1, "days")
            .format("YYYY-MM-DD");
        const currentDate = moment().format("YYYY-MM-DD");
        if (
            selectedDate &&
            selectedDate === prevDate &&
            this.state.logoutSelected &&
            !this.state.logoutSelected === "Cancelled" &&
            (this.state.logoutSelected.includes("*") ||
                this.state.logoutSelected.includes("Cancel,0,D") ||
                (calculateRoster.LogoutShifts && calculateRoster.LogoutShifts.includes("*")))
        ) {
            rosterEditRule = {
                isLoginModifyAllowed: false,
                isLogoutModifyAllowed: true
            };
        } else if (selectedDate && moment(selectedDate).isSameOrAfter(currentDate)) {
            rosterEditRule = {
                isLoginModifyAllowed: this.state.loginSelected ? this.state.loginSelected !== "Select" && this.state.loginSelected !== "Cancelled" : false,
                isLogoutModifyAllowed: this.state.logoutSelected ? this.state.logoutSelected !== "Select" && this.state.logoutSelected !== "Cancelled" : false
            };
        }
        return rosterEditRule;
    };

    _renderQuickActions = calculateRoster => {
        let rosterEditRule = this.checkRosterEditRule(calculateRoster);
        let size = 180;
        (rosterEditRule.isLoginModifyAllowed && rosterEditRule.isLogoutModifyAllowed) ? size = 250 : size = 180;
        let date = moment(this.state.RosterDate).format("DD-MMM");
        let selectedRoster = this.state.selectDateRoster;
        return (
            <RBSheet
                ref={ref => {
                    this.RBSheet = ref;
                }}
                height={size}
                duration={200}
                closeOnDragDown={true}
                closeOnPressMask={true}
                closeOnPressBack={true}
                customStyles={{
                    container: {
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom:25
                    }
                }}
            >
                <Button
                    full
                    transparent
                    onPress={() => {
                        this.setState({FabVisible: false});
                        this.RBSheet.close();
                        this.popupDialog.show();
                    }}
                >
                    <Text style={{color: colors.BLACK}}>Update Roster</Text>
                </Button>
                {rosterEditRule.isLoginModifyAllowed && (
                    <Button
                        full
                        transparent
                        onPress={() => {
                            let isProperNoShowObject = !!(this.state.rosterDetails.NoShowCount && this.state.rosterDetails.NoShowCount.Limit !== -1);
                            let cancelRoster = {
                                TripType: "Pickup",
                                tripTime: new moment(this.state.RosterDate + "T" + this.state.selectDateRoster.LoginShift, "YYYY-MM-DDTHH:mm")
                            };
                            if (isWithinCutOff(cancelRoster, this.state.rosterDetails.LoginCutoffMinutes)) {
                                if (isProperNoShowObject && isLimitExceded(this.state.rosterDetails.NoShowCount) && isWithInTimeFrame(this.state.rosterDetails.NoShowCount, cancelRoster)) {
                                    this.displayNoSHowAlerts(noshow.no_show_title, this.state.rosterDetails.NoShowErrorMessage + noshow.are_you_sure, true, false, false);
                                    return;
                                } else {
                                    this.displayNoSHowAlerts(noshow.no_show_title, noshow.noShowMessage, true, false, false);
                                    return;
                                }
                            } else {
                                this.displayNoSHowAlerts(noshow.normal_title, noshow.normal + date + "?", true, false, false);
                            }
                        }}
                    >
                        <Text style={{color: colors.BLACK}}>
                            Cancel Login
                        </Text>
                    </Button>
                )}

                {rosterEditRule.isLogoutModifyAllowed && (
                    <Button
                        full
                        transparent
                        onPress={() => {
                            let tripTime;
                            if (selectedRoster.LogoutShift.includes("*")) {
                                let RosterDate = new moment(this.state.RosterDate, "YYYY-MM-DD").format("YYYY-MM-DD");
                                let previous = moment().subtract(1, 'days').format("YYYY-MM-DD");
                                let presentDate = moment().format("YYYY-MM-DD");
                                if (RosterDate === previous) {
                                    tripTime = presentDate + "T" + selectedRoster.LogoutShift.replace("*", "");
                                } else {
                                    tripTime = moment().add(1, 'days').format("YYYY-MM-DD") + selectedRoster.LogoutShift.replace("*", "")
                                }
                            }
                            let isProperNoShowObject = !!(this.state.rosterDetails.NoShowCount && this.state.rosterDetails.NoShowCount.Limit !== -1);
                            let cancelRoster = {
                                TripType: "Drop",
                                tripTime: tripTime ? tripTime : new moment(this.state.RosterDate + "T" + this.state.selectDateRoster.LogoutShift, "YYYY-MM-DDTHH:mm")
                            };
                            if (isWithinCutOff(cancelRoster, this.state.rosterDetails.LogoutCutoffMinutes)) {
                                if (isProperNoShowObject && isLimitExceded(this.state.rosterDetails.NoShowCount) && isWithInTimeFrame(this.state.rosterDetails.NoShowCount, cancelRoster)) {
                                    this.displayNoSHowAlerts(noshow.no_show_title, this.state.rosterDetails.NoShowErrorMessage + noshow.are_you_sure, false, true, false);
                                } else {
                                    this.displayNoSHowAlerts(noshow.no_show_title, noshow.noShowMessage, false, true, false);
                                }
                            } else {
                                this.displayNoSHowAlerts(noshow.normal_title, noshow.normal + date + "?", false, true, false);
                            }
                        }}
                    >
                        <Text style={{color: colors.BLACK}}>
                            Cancel Logout
                        </Text>
                    </Button>
                )}
                {rosterEditRule.isLoginModifyAllowed &&
                rosterEditRule.isLogoutModifyAllowed && (
                    <Button
                        full
                        transparent
                        onPress={() => {
                            let isProperNoShowObject = !!(this.state.rosterDetails.NoShowCount && this.state.rosterDetails.NoShowCount.Limit !== -1);
                            let cancelRoster = {
                                TripType: "Pickup",
                                tripTime: new moment(this.state.RosterDate + "T" + this.state.selectDateRoster.LoginShift, "YYYY-MM-DDTHH:mm")
                            };
                            let tripTime;
                            if (selectedRoster.LogoutShift.includes("*")) {
                                let RosterDate = new moment(this.state.RosterDate, "YYYY-MM-DD").format("YYYY-MM-DD");
                                let previous = moment().subtract(1, 'days').format("YYYY-MM-DD");
                                let presentDate = moment().format("YYYY-MM-DD");
                                if (RosterDate === previous) {
                                    tripTime = presentDate + "T" + selectedRoster.LogoutShift.replace("*", "");
                                } else {
                                    tripTime = moment().add(1, 'days').format("YYYY-MM-DD") + selectedRoster.LogoutShift.replace("*", "")
                                }
                            }
                            let cancelLogoutRoster = {
                                TripType: "Drop",
                                tripTime: tripTime ? tripTime : new moment(this.state.RosterDate + "T" + this.state.selectDateRoster.LogoutShift, "YYYY-MM-DDTHH:mm")
                            };
                            if (isWithinCutOff(cancelRoster, this.state.rosterDetails.LoginCutoffMinutes)) {
                                if (isProperNoShowObject && isLimitExceded(this.state.rosterDetails.NoShowCount) && isWithInTimeFrame(this.state.rosterDetails.NoShowCount, cancelRoster)) {
                                    this.displayNoSHowAlerts(noshow.no_show_title, this.state.rosterDetails.NoShowErrorMessage + noshow.are_you_sure, true, false, false);
                                } else {
                                    this.displayNoSHowAlerts(noshow.no_show_title, noshow.noShowMessage, false, false, true);
                                }
                            } else if (isWithinCutOff(cancelLogoutRoster, this.state.rosterDetails.LogoutCutoffMinutes)) {
                                if (isProperNoShowObject && isLimitExceded(this.state.rosterDetails.NoShowCount) && isWithInTimeFrame(this.state.rosterDetails.NoShowCount, cancelLogoutRoster)) {
                                    this.displayNoSHowAlerts(this.state.rosterDetails.NoShowErrorMessage + noshow.are_you_sure, false, false, true);
                                } else {
                                    this.displayNoSHowAlerts(noshow.noShowMessage, false, false, true);
                                }
                            } else {
                                this.displayNoSHowAlerts(noshow.normal_title, noshow.normal + date + "?", false, false, true);
                            }
                        }}
                    >
                        <Text style={{color: colors.BLACK}}>Cancel Both</Text>
                    </Button>
                )}
            </RBSheet>
        );
    };

    constructor(props) {
        super(props);
        this.state = {
            access_token: "",
            CustomerUrl: "",
            UserId: "",
            isLoading: false,
            showLoader: false,
            FabVisible: true,
            markedDates: this.getDaysInMonth(
                moment().month(),
                moment().year(),
                DISABLED_DAYS
            ),
            DISABLED_DAYS: [],
            RosterDate: "",
            showUpdateRosterWindow: false,
            /******************* Update Roster *************************/
            loginSelected: "",
            logoutSelected: "",
            availableRosters: "",
            loginShifts: "",
            rosterDetails: {
                Locations: [],
                Offices: [],
                Rosters: [],
                AvailableRosters: "",
                EligibleRosterDays: 0,
                RosteringAllowedLogin: 0,
                RosteringAllowedLogout: 0
            },
            pickupLocationSelected: "",
            pickupLocationEnabled:false,
            dropLocationSelected: "",
            dropLocationEnabled:false,
            officeLoginSelected: "",
            officeLogoutSelected: "",
            officeSelected: "",
            startDate: "",
            pickStartDate: false,
            endDate: "",
            pickEndDate: false,
            RosterID: "",
            autoFill: false,
            FromQuickAction: false,
            /********************* End of Update Roster *****************/
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
            anyChangeInData: false,
            anyChangeInDataLogin: false,
            anyChangeInDataLogout: false,
            showCancel: "|Cancel,0,D",
            responsePopup: false,
            isRosterOptOutEnabled: false,
            disclaimerType: "",
            accepted: false,
            optOutAccepted: false,
            visibleOptOutModal: false,
            RosterContent: "",
            acceptedType: ""

        };
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    static isSelected(value) {
        return (
            value &&
            value.split(",")[0] &&
            value !== "SELECT" &&
            value !== "Select" &&
            value !== "SELECT" &&
            value !== "SELECT ,0,D" &&
            value !== "SELECT,0,D"
        );
    }

    displayNoSHowAlerts(title, message, login, logout, both) {
        Alert.alert(
            title,
            message,
            [
                {
                    text: 'NO',
                    onPress: () => {
                        this.RBSheet.close();
                        console.log('Cancel Pressed')
                    },
                    style: 'cancel',
                },
                {
                    text: 'YES', onPress: () => {
                        setTimeout(() => {
                            if (login) {
                                this.setState({
                                    loginSelected: "Cancel,0,D",
                                    FromQuickAction: true,
                                    anyChangeInData: true,
                                    anyChangeInDataLogin: true,
                                    anyChangeInDataLogout: false
                                });
                            }
                            if (logout) {
                                this.setState({
                                    logoutSelected: "Cancel,0,D",
                                    FromQuickAction: true,
                                    anyChangeInData: true,
                                    anyChangeInDataLogin: false,
                                    anyChangeInDataLogout: true
                                });
                            }
                            if (both) {
                                this.setState({
                                    loginSelected: "Cancel,0,D",
                                    logoutSelected: "Cancel,0,D",
                                    FromQuickAction: true,
                                    anyChangeInData: true,
                                    anyChangeInDataLogin: true,
                                    anyChangeInDataLogout: true
                                });
                            }
                        }, 0);
                        this.RBSheet.close();
                        setTimeout(() => {
                            this.updateRoster(false);
                        }, 10);
                    }
                },
            ],
            {cancelable: false},
        )
    }

    UNSAFE_componentWillMount() {
        this.getRosterDetails();
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        if (!this.state.FabVisible) {
            this.popupDialog.dismiss();
            this.setState({FabVisible: true});
            return true;
        } else {
            this.props.navigation.goBack(null);
            return true;
        }

    }

    /*********************** Update Roster ************************/
    onLoginValueChange(value) {
        if (value) {
            if (value.includes("Cancel")) {
                this.setState({
                    loginSelected: value,
                    anyChangeInData: true,
                    anyChangeInDataLogin: true
                });
            } else if (value.includes("Select")) {
                this.setState({
                    loginSelected: value,
                    pickupLocationSelected: "Select"
                });
            } else {
                setTimeout(() => {
                    this.setState({
                        loginSelected: value,
                        anyChangeInData: true,
                        anyChangeInDataLogin: true
                    });
                    let selected = loginLocation.length === 1 ? loginLocation[0].Name :
                        (loginLocation.length === 2 && loginLocation[1].ID === "O") ? loginLocation[0].Name : "Select";
                    this.setState({
                        pickupLocationSelected: selected,
                        isLoading: false
                    });
                }, 10);
            }
        }
    }

    onLogoutValueChange(value) {
        if (value) {
            if (value.includes("Cancel")) {
                this.setState({
                    logoutSelected: value,
                    anyChangeInData: true,
                    anyChangeInDataLogout: true
                });
            } else if (value.includes("Select")) {
                this.setState({
                    logoutSelected: value,
                    dropLocationSelected: "Select"
                });
            } else {
                setTimeout(() => {
                    this.setState({
                        logoutSelected: value,
                        anyChangeInData: true,
                        anyChangeInDataLogout: true
                    });
                    let selected = logoutLocation.length === 1 ? logoutLocation[0].Name :
                        (logoutLocation.length === 2 && logoutLocation[1].ID === "O") ? logoutLocation[0].Name : "Select";
                    this.setState({
                        dropLocationSelected: selected,
                        isLoading: false
                    });
                }, 10);
            }
        }
    }

    onOfficeLoginValueChange(value) {
        this.setState({
            officeLoginSelected: value,
            loginSelected: "Select",
            pickupLocationSelected: "Select",
            anyChangeInData: false,
            anyChangeInDataLogin: false
        });
    }

    onOfficeLogoutValueChange(value) {
        this.setState({
            officeLogoutSelected: value,
            logoutSelected: "Select",
            dropLocationSelected: "Select",
            anyChangeInData: false,
            anyChangeInDataLogout: false
        });
    }

    onPickupLocationValueChange(value) {
        this.setState({
            pickupLocationSelected: value,
            anyChangeInData: true,
            anyChangeInDataLogin: true
        });
        if (value === "Others") {
            this.goToLocationPicker("from");
        }
    }

    onDropLocationValueChange(value) {
        this.setState({
            dropLocationSelected: value,
            anyChangeInData: true,
            anyChangeInDataLogout: true
        });
        if (value === "Others") {
            this.goToLocationPicker("to");
        }
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

    goToLocationPicker(type) {
        this.props.navigation.navigate("MapPicker", {
            getLocationPicker: this.getLocationPicker.bind(this),
            type: type
        });
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

    /*********************** End of Update Roster **********************/
    componentDidMount() {
        AsyncStorage.multiGet(
            [asyncString.ACCESS_TOKEN, asyncString.USER_ID, asyncString.CAPI],
            (err, savedData) => {
                let access_token = CryptoXor.decrypt(savedData[0][1], asyncString.ACCESS_TOKEN); // JSON.parse(JSON.stringify(savedData[0][1]));
                let CustomerUrl = savedData[2][1];
                let UserId = JSON.parse(JSON.stringify(savedData[1][1]));
                if (!access_token) return;
                if (!UserId) return;
                this.setState({
                    access_token: access_token,
                    UserId: UserId,
                    CustomerUrl
                });
            }
        );
        try {
            const deleteData = this.props.route.params.deleteData;
            if (deleteData && deleteData === true) {
                // clear the data
                AsyncStorage.multiRemove(pushClearKeys, err => {
                    console.warn("removed successfully");
                });
            }
        }catch (e) {
            console.warn("no data ");
        }
    }

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

    setLoader() {
        setTimeout(() => this.setState({isLoading: true}), 0);
    }

    stopLoader() {
        setTimeout(() => this.setState({isLoading: false}), 10);
    }

    saveEmployeeLocation(newLocation) {
        let rosterDetails = this.state.rosterDetails;
        rosterDetails.Locations.push(newLocation[0]);
        this.setState({
            rosterDetails
        });
    }

    /************************ Update roster ************************/
    updateRoster(tested) {
        if (!this.state.anyChangeInDataLogin && !this.state.anyChangeInDataLogout) {
            Alert.alert("Roster", "Roster not changed");
            return;
        }
        /*********************************** Validation ***********************************/
        if (
            !ViewModifyRoster.isSelected(this.state.officeLoginSelected) &&
            !ViewModifyRoster.isSelected(this.state.officeLogoutSelected)
        ) {
            Alert.alert("Roster", "Select login/logout office");
            return;
        }

        if (
            !ViewModifyRoster.isSelected(this.state.logoutSelected) &&
            !ViewModifyRoster.isSelected(this.state.loginSelected) &&
            !ViewModifyRoster.isSelected(this.state.pickupLocationSelected) &&
            !ViewModifyRoster.isSelected(this.state.dropLocationSelected)
        ) {
            Alert.alert("Roster", "Select login/logout time");
            return;
        }

        if (
            ViewModifyRoster.isSelected(this.state.loginSelected) &&
            !ViewModifyRoster.isSelected(this.state.pickupLocationSelected)
        ) {
            Alert.alert("Roster", "Select pickup location");
            return;
        } else if (
            !ViewModifyRoster.isSelected(this.state.loginSelected) &&
            ViewModifyRoster.isSelected(this.state.pickupLocationSelected)
        ) {
            Alert.alert("Roster", "Select login time");
            return;
        }

        if (
            ViewModifyRoster.isSelected(this.state.logoutSelected) &&
            !ViewModifyRoster.isSelected(this.state.dropLocationSelected)
        ) {
            Alert.alert("Roster", "Select drop location");
            return;
        } else if (
            !ViewModifyRoster.isSelected(this.state.logoutSelected) &&
            ViewModifyRoster.isSelected(this.state.dropLocationSelected)
        ) {
            Alert.alert("Roster", "Select logout Time");
            return;
        }
        // this.setState({ isLoading: true, showLoader: true });

        /*********************************** End Validation ***********************************/
        const responseRosterDetails = this.state.rosterDetails;
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
        let updateBody = {};
        let selectedRoster = this.state.selectDateRoster;
        console.warn("selectedRoster  " + JSON.stringify(selectedRoster));
        console.warn("this.state.isRosterOptOutEnabled " + this.state.isRosterOptOutEnabled);
        if (this.state.anyChangeInDataLogin && !this.state.anyChangeInDataLogout) {
            updateBody = {
                RosterDate: this.state.RosterDate,
                RosterID: this.state.RosterID,
                DeviceID: this.state.UserId,
                LoginLocID: findID(
                    this.state.pickupLocationSelected,
                    rosterDetailsLocations
                ),
                LoginTime:
                    splitData(this.state.loginSelected, 0).toUpperCase() === "SELECT"
                        ? ""
                        : splitData(this.state.loginSelected, 0) === "Cancel"
                        ? "NS"
                        : this.state.loginSelected.includes(",") ? splitData(this.state.loginSelected, 0) : (this.state.loginSelected === "Cancel" || this.state.loginSelected === "Cancelled") ? "NS" : this.state.loginSelected,
                LoginRouteType: this.state.loginSelected === "Cancel" ? "D" : splitData(this.state.loginSelected, 2),
                LoginOffice: findID(
                    this.state.officeLoginSelected,
                    responseRosterDetails.Offices
                ),

                LoginLocName:
                    !this.state.pickupLocationSelected |
                    (this.state.pickupLocationSelected === "SELECT") |
                    (this.state.pickupLocationSelected === "SELECT") |
                    (this.state.pickupLocationSelected === "NA")
                        ? ""
                        : this.state.pickupLocationSelected,

                LoginLocAddress: findAddress(
                    this.state.pickupLocationSelected,
                    rosterDetailsLocations
                ),

                LoginLocLat: findLat(
                    this.state.pickupLocationSelected,
                    rosterDetailsLocations
                ),
                LoginLocLng: findLng(
                    this.state.pickupLocationSelected,
                    rosterDetailsLocations
                )
            };
            if (this.state.isRosterOptOutEnabled === "true" && !this.state.optOutAccepted) {
                if (this.state.disclaimerType === "LOGIN") {
                    if (updateBody.LoginTime === "" || updateBody.LoginTime === "NS") {
                        this.setState({visibleOptOutModal: true, acceptedType: "LOGIN"});
                        return;
                    }
                } else if (this.state.disclaimerType === "LOGOUT") {
                    if (updateBody.LoginTime !== "NS" && (!selectedRoster || selectedRoster.LogoutShift === "NS" || selectedRoster.LogoutShift === "")) {
                        this.setState({visibleOptOutModal: true, acceptedType: "LOGOUT"});
                        return;
                    }
                } else if (this.state.disclaimerType === ("BOTH")) {
                    if (!selectedRoster || selectedRoster.LogoutShift === "" || selectedRoster.LogoutShift === "NS" || updateBody.LoginTime === "" || updateBody.LoginTime === "NS") {
                        this.setState({visibleOptOutModal: true, acceptedType: "LOGOUT"});
                        return;
                    }
                }
                if (selectedRoster && selectedRoster.LoginShift && !selectedRoster.LoginShift.includes("NS")) {
                    let isProperNoShowObject = !!(this.state.rosterDetails.NoShowCount && this.state.rosterDetails.NoShowCount.Limit !== -1);
                    let cancelLoginRoster = {
                        TripType: "Pickup",
                        tripTime: new moment(this.state.RosterDate + "T" + this.state.selectDateRoster.LoginShift, "YYYY-MM-DDTHH:mm")
                    };
                    if (tested && isLoginNoShowPerformed(updateBody, selectedRoster) && isWithinCutOff(cancelLoginRoster, this.state.rosterDetails.LoginCutoffMinutes)) {
                        if (isProperNoShowObject && isLimitExceded(this.state.rosterDetails.NoShowCount) && isWithInTimeFrame(this.state.rosterDetails.NoShowCount, cancelLoginRoster)) {
                            this.displayNoShowDeactivationAlert(updateBody);
                        } else {
                            this.displayNoShowAlert(updateBody);
                        }
                    } else {
                        this.updateApiCall(updateBody);
                    }
                } else {
                    this.updateApiCall(updateBody);
                }
            } else {
                if (selectedRoster && selectedRoster.LoginShift && !selectedRoster.LoginShift.includes("NS")) {
                    let isProperNoShowObject = !!(this.state.rosterDetails.NoShowCount && this.state.rosterDetails.NoShowCount.Limit !== -1);
                    let cancelLoginRoster = {
                        TripType: "Pickup",
                        tripTime: new moment(this.state.RosterDate + "T" + this.state.selectDateRoster.LoginShift, "YYYY-MM-DDTHH:mm")
                    };
                    if (tested && isLoginNoShowPerformed(updateBody, selectedRoster) && isWithinCutOff(cancelLoginRoster, this.state.rosterDetails.LoginCutoffMinutes)) {
                        if (isProperNoShowObject && isLimitExceded(this.state.rosterDetails.NoShowCount) && isWithInTimeFrame(this.state.rosterDetails.NoShowCount, cancelLoginRoster)) {
                            this.displayNoShowDeactivationAlert(updateBody);
                        } else {
                            this.displayNoShowAlert(updateBody);
                        }
                    } else {
                        this.updateApiCall(updateBody);
                    }
                } else {
                    this.updateApiCall(updateBody);
                }
            }
        } else if (
            !this.state.anyChangeInDataLogin &&
            this.state.anyChangeInDataLogout
        ) {
            updateBody = {
                RosterDate: this.state.RosterDate,
                RosterID: this.state.RosterID,
                DeviceID: this.state.UserId,

                LogoutLocID: findID(
                    this.state.dropLocationSelected,
                    rosterDetailsLocations
                ),
                LogoutTime:
                    splitData(this.state.logoutSelected, 0).toUpperCase() === "SELECT"
                        ? ""
                        : splitData(this.state.logoutSelected, 0) === "Cancel"
                        ? "NS"
                        : this.state.logoutSelected.includes(",") ? splitData(this.state.logoutSelected, 0) : this.state.logoutSelected === "Cancel" || this.state.logoutSelected === "Cancelled" ? "NS" : this.state.logoutSelected,

                LogoutRouteType: this.state.logoutSelected === "Cancel" ? "D" : splitData(this.state.logoutSelected, 2),
                LogoutOffice: findID(
                    this.state.officeLogoutSelected,
                    responseRosterDetails.Offices
                ),

                LogoutLocName:
                    !this.state.dropLocationSelected |
                    (this.state.dropLocationSelected === "SELECT") |
                    (this.state.dropLocationSelected === "SELECT") |
                    (this.state.dropLocationSelected === "NA")
                        ? ""
                        : this.state.dropLocationSelected,

                LogoutLocAddress: findAddress(
                    this.state.dropLocationSelected,
                    rosterDetailsLocations
                ),

                LogoutLocLng: findLat(
                    this.state.dropLocationSelected,
                    rosterDetailsLocations
                ),
                LogoutLocLat: findLng(
                    this.state.dropLocationSelected,
                    rosterDetailsLocations
                )
            };
            if (this.state.isRosterOptOutEnabled === "true" && !this.state.optOutAccepted) {
                if (this.state.disclaimerType === "LOGIN") {
                    if (!selectedRoster || (selectedRoster.LoginShift === "NS" || selectedRoster.LoginShift === "")) {
                        this.setState({visibleOptOutModal: true, acceptedType: "LOGIN"});
                        return;
                    }
                } else if (this.state.disclaimerType === "LOGOUT") {
                    if (updateBody.LogoutTime === "" || updateBody.LogoutTime === ("NS")) {
                        this.setState({visibleOptOutModal: true, acceptedType: "LOGOUT"});
                        return;
                    }
                } else if (this.state.disclaimerType === ("BOTH")) {
                    if ((!selectedRoster || selectedRoster.LoginShift === "" || selectedRoster.LoginShift === "NS") || updateBody.LogoutTime === "" || updateBody.LogoutTime === "NS") {
                        this.setState({visibleOptOutModal: true, acceptedType: "LOGIN"});
                        return;
                    }
                }
                if (selectedRoster && selectedRoster.LogoutShift && !selectedRoster.LogoutShift === ("NS")) {
                    let tripTime;
                    if (selectedRoster.LogoutShift.includes("*")) {
                        let RosterDate = new moment(this.state.RosterDate, "YYYY-MM-DD").format("YYYY-MM-DD");
                        let previous = moment().subtract(1, 'days').format("YYYY-MM-DD");
                        let presentDate = moment().format("YYYY-MM-DD");
                        if (RosterDate === previous) {
                            tripTime = presentDate + "T" + selectedRoster.LogoutShift.replace("*", "");
                        } else {
                            tripTime = moment().add(1, 'days').format("YYYY-MM-DD") + selectedRoster.LogoutShift.replace("*", "")
                        }
                    }
                    let isProperNoShowObject = !!(this.state.rosterDetails.NoShowCount && this.state.rosterDetails.NoShowCount.Limit !== -1);
                    let cancelLogoutRoster = {
                        TripType: "Drop",
                        TripTime: tripTime ? tripTime : new moment(this.state.RosterDate + "T" + this.state.selectDateRoster.LogoutShift, "YYYY-MM-DDTHH:mm")
                    };
                    if (tested && isLogoutNoShowPerformed(updateBody, this.state.selectDateRoster) && isWithinCutOff(cancelLogoutRoster, this.state.rosterDetails.LogoutCutoffMinutes)) {
                        if (isProperNoShowObject && isLimitExceded(this.state.rosterDetails.NoShowCount) && isWithInTimeFrame(this.state.rosterDetails.NoShowCount, cancelLogoutRoster)) {
                            this.displayNoShowDeactivationAlert(updateBody);
                        } else {
                            this.displayNoShowAlert(updateBody);
                        }
                    } else {
                        this.updateApiCall(updateBody);
                    }
                } else {
                    this.updateApiCall(updateBody);
                }
            } else {
                if (selectedRoster && selectedRoster.LogoutShift && !selectedRoster.LogoutShift === ("NS")) {
                    let tripTime;
                    if (selectedRoster.LogoutShift.includes("*")) {
                        let RosterDate = new moment(this.state.RosterDate, "YYYY-MM-DD").format("YYYY-MM-DD");
                        let previous = moment().subtract(1, 'days').format("YYYY-MM-DD");
                        let presentDate = moment().format("YYYY-MM-DD");
                        if (RosterDate === previous) {
                            tripTime = presentDate + "T" + selectedRoster.LogoutShift.replace("*", "");
                        } else {
                            tripTime = moment().add(1, 'days').format("YYYY-MM-DD") + selectedRoster.LogoutShift.replace("*", "")
                        }
                    }
                    console.warn("trip " + tripTime);
                    let isProperNoShowObject = !!(this.state.rosterDetails.NoShowCount && this.state.rosterDetails.NoShowCount.Limit !== -1);
                    let cancelLogoutRoster = {
                        TripType: "Drop",
                        tripTime: tripTime ? tripTime : new moment(this.state.RosterDate + "T" + this.state.selectDateRoster.LogoutShift, "YYYY-MM-DDTHH:mm")
                    };
                    console.warn("cancelLogoutRoster " + moment(cancelLogoutRoster.TripTime).format("YYYY-MM-DDTHH:mm"));
                    if (tested && isLogoutNoShowPerformed(updateBody, this.state.selectDateRoster) && isWithinCutOff(cancelLogoutRoster, this.state.rosterDetails.LogoutCutoffMinutes)) {
                        if (isProperNoShowObject && isLimitExceded(this.state.rosterDetails.NoShowCount) && isWithInTimeFrame(this.state.rosterDetails.NoShowCount, cancelLogoutRoster)) {
                            this.displayNoShowDeactivationAlert(updateBody);
                        } else {
                            this.displayNoShowAlert(updateBody);
                        }
                    } else {
                        this.updateApiCall(updateBody);
                    }
                } else {
                    this.updateApiCall(updateBody);
                }
            }
        } else if (
            this.state.anyChangeInDataLogin &&
            this.state.anyChangeInDataLogout
        ) {
            updateBody = {
                RosterDate: this.state.RosterDate,
                RosterID: this.state.RosterID,
                DeviceID: this.state.UserId,
                LoginLocID: findID(
                    this.state.pickupLocationSelected,
                    rosterDetailsLocations
                ),
                LogoutLocID: findID(
                    this.state.dropLocationSelected,
                    rosterDetailsLocations
                ),
                LoginTime:
                    splitData(this.state.loginSelected, 0).toUpperCase() === "SELECT"
                        ? ""
                        : splitData(this.state.loginSelected, 0) === "Cancel"
                        ? "NS"
                        : this.state.loginSelected.includes(",") ? splitData(this.state.loginSelected, 0) : (this.state.loginSelected === "Cancel" || this.state.loginSelected === "Cancelled") ? "NS" : this.state.loginSelected,
                LogoutTime:
                    splitData(this.state.logoutSelected, 0).toUpperCase() === "SELECT"
                        ? ""
                        : splitData(this.state.logoutSelected, 0) === "Cancel"
                        ? "NS"
                        : this.state.logoutSelected.includes(",") ? splitData(this.state.logoutSelected, 0) : (this.state.logoutSelected === "Cancel" || this.state.logoutSelected === "Cancelled") ? "NS" : this.state.logoutSelected,
                LogoutRouteType: this.state.logoutSelected === "Cancel" ? "D" : splitData(this.state.logoutSelected, 2),
                LoginRouteType: this.state.loginSelected === "Cancel" ? "D" : splitData(this.state.loginSelected, 2),
                LoginOffice: findID(
                    this.state.officeLoginSelected,
                    responseRosterDetails.Offices
                ),
                LogoutOffice: findID(
                    this.state.officeLogoutSelected,
                    responseRosterDetails.Offices
                ),
                LoginLocName:
                    !this.state.pickupLocationSelected |
                    (this.state.pickupLocationSelected === "SELECT") |
                    (this.state.pickupLocationSelected === "SELECT") |
                    (this.state.pickupLocationSelected === "NA")
                        ? ""
                        : this.state.pickupLocationSelected,
                LogoutLocName:
                    !this.state.dropLocationSelected |
                    (this.state.dropLocationSelected === "SELECT") |
                    (this.state.dropLocationSelected === "SELECT") |
                    (this.state.dropLocationSelected === "NA")
                        ? ""
                        : this.state.dropLocationSelected,
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
                ),
                LoginLocLng: findLng(
                    this.state.pickupLocationSelected,
                    rosterDetailsLocations
                ),
                LogoutLocLng: findLat(
                    this.state.dropLocationSelected,
                    rosterDetailsLocations
                ),
                LogoutLocLat: findLng(
                    this.state.dropLocationSelected,
                    rosterDetailsLocations
                )
            };
            if (this.state.isRosterOptOutEnabled === "true" && !this.state.optOutAccepted) {
                if (this.state.disclaimerType === "LOGIN" && (updateBody.LoginTime === "" || updateBody.LoginTime === ("NS"))) {
                    this.setState({visibleOptOutModal: true, acceptedType: "LOGIN"});
                    return;
                } else if (this.state.disclaimerType === "LOGOUT" && (updateBody.LogoutTime === "" || updateBody.LogoutTime === ("NS"))) {
                    this.setState({visibleOptOutModal: true, acceptedType: "LOGOUT"});
                    return;
                } else if (this.state.disclaimerType === ("BOTH")) {
                    if (updateBody.LoginTime !== "NS" || updateBody.LogoutTime !== "NS") {
                        if (updateBody.LoginTime === "" || updateBody.LogoutTime === "" || updateBody.LoginTime === "NS" || updateBody.LogoutTime === "NS") {
                            this.setState({visibleOptOutModal: true, acceptedType: "BOTH"});
                            return;
                        }
                    }
                }
                if (this.state.selectDateRoster) {
                    let isProperNoShowObject = !!(this.state.rosterDetails.NoShowCount && this.state.rosterDetails.NoShowCount.Limit !== -1);
                    if (this.state.selectDateRoster.LoginShift && !this.state.selectDateRoster.LoginShift === ("NS")) {
                        let cancelLoginRoster = {
                            TripType: "Pickup",
                            tripTime: new moment(this.state.RosterDate + "T" + this.state.selectDateRoster.LoginShift, "YYYY-MM-DDTHH:mm")
                        };
                        if (tested && isLoginNoShowPerformed(updateBody, this.state.selectDateRoster) && isWithinCutOff(cancelLoginRoster, this.state.rosterDetails.LoginCutoffMinutes)) {
                            if (isProperNoShowObject && isLimitExceded(this.state.rosterDetails.NoShowCount) && isWithInTimeFrame(this.state.rosterDetails.NoShowCount, cancelLoginRoster)) {
                                this.displayNoShowDeactivationAlert(updateBody);
                                return;
                            } else {
                                this.displayNoShowAlert(updateBody);
                                return;
                            }
                        }
                    }
                    let tripTime;
                    if (selectedRoster.LogoutShift.includes("*")) {
                        let RosterDate = new moment(this.state.RosterDate, "YYYY-MM-DD").format("YYYY-MM-DD");
                        let previous = moment().subtract(1, 'days').format("YYYY-MM-DD");
                        let presentDate = moment().format("YYYY-MM-DD");
                        if (RosterDate === previous) {
                            tripTime = presentDate + "T" + selectedRoster.LogoutShift.replace("*", "");
                        }
                    }
                    if (this.state.selectDateRoster.LogoutShift && !this.state.selectDateRoster.LogoutShift.includes("NS")) {
                        let cancelLogoutRoster = {
                            TripType: "Drop",
                            tripTime: tripTime ? tripTime : new moment(this.state.RosterDate + "T" + this.state.selectDateRoster.LogoutShift, "YYYY-MM-DDTHH:mm")
                        };
                        if (tested && isLogoutNoShowPerformed(updateBody, this.state.selectDateRoster) && isWithinCutOff(cancelLogoutRoster, this.state.rosterDetails.LogoutCutoffMinutes)) {
                            if (isProperNoShowObject && isLimitExceded(this.state.rosterDetails.NoShowCount) && isWithInTimeFrame(this.state.rosterDetails.NoShowCount, cancelLogoutRoster)) {
                                this.displayNoShowDeactivationAlert(updateBody);
                            } else {
                                this.displayNoShowAlert(updateBody);
                            }
                        }
                    }
                } else {
                    this.updateApiCall(updateBody);
                }
                this.updateApiCall(updateBody);
            } else {
                if (this.state.selectDateRoster) {
                    let isProperNoShowObject = !!(this.state.rosterDetails.NoShowCount && this.state.rosterDetails.NoShowCount.Limit !== -1);
                    if (this.state.selectDateRoster.LoginShift && !this.state.selectDateRoster.LoginShift === ("NS")) {
                        let cancelLoginRoster = {
                            TripType: "Pickup",
                            tripTime: new moment(this.state.RosterDate + "T" + this.state.selectDateRoster.LoginShift, "YYYY-MM-DDTHH:mm")
                        };
                        if (tested && isLoginNoShowPerformed(updateBody, this.state.selectDateRoster) && isWithinCutOff(cancelLoginRoster, this.state.rosterDetails.LoginCutoffMinutes)) {
                            if (isProperNoShowObject && isLimitExceded(this.state.rosterDetails.NoShowCount) && isWithInTimeFrame(this.state.rosterDetails.NoShowCount, cancelLoginRoster)) {
                                this.displayNoShowDeactivationAlert(updateBody);
                                return;
                            } else {
                                this.displayNoShowAlert(updateBody);
                                return;
                            }
                        }
                    }
                    let tripTime;
                    if (selectedRoster.LogoutShift.includes("*")) {
                        let RosterDate = new moment(this.state.RosterDate, "YYYY-MM-DD").format("YYYY-MM-DD");
                        let previous = moment().subtract(1, 'days').format("YYYY-MM-DD");
                        let presentDate = moment().format("YYYY-MM-DD");
                        if (RosterDate === previous) {
                            tripTime = presentDate + "T" + selectedRoster.LogoutShift.replace("*", "");
                        }
                    }
                    if (this.state.selectDateRoster.LogoutShift && !this.state.selectDateRoster.LogoutShift.includes("NS")) {
                        let cancelLogoutRoster = {
                            TripType: "Drop",
                            tripTime: tripTime ? tripTime : new moment(this.state.RosterDate + "T" + this.state.selectDateRoster.LogoutShift, "YYYY-MM-DDTHH:mm")
                        };
                        if (tested && isLogoutNoShowPerformed(updateBody, this.state.selectDateRoster) && isWithinCutOff(cancelLogoutRoster, this.state.rosterDetails.LogoutCutoffMinutes)) {
                            if (isProperNoShowObject && isLimitExceded(this.state.rosterDetails.NoShowCount) && isWithInTimeFrame(this.state.rosterDetails.NoShowCount, cancelLogoutRoster)) {
                                this.displayNoShowDeactivationAlert(updateBody);
                            } else {
                                this.displayNoShowAlert(updateBody);
                            }
                        }
                    } else {
                        this.updateApiCall(updateBody);
                    }
                }
                this.updateApiCall(updateBody);
            }
        }
    }


    displayNoShowDeactivationAlert(updateBody) {
        Alert.alert(
            'No Show Alert',
            this.state.rosterDetails.NoShowErrorMessage + noshow.are_you_sure,
            [
                {
                    text: 'Cancel',
                    onPress: () => {
                        console.log('Cancel Pressed')
                    },
                    style: 'cancel',
                },
                {
                    text: 'OK', onPress: () => {
                        this.updateApiCall(updateBody);
                    }
                },
            ],
            {cancelable: false},
        )
    }

    displayNoShowAlert(updateBody) {
        Alert.alert(
            'No Show Alert',
            noshow.noShowMessage,
            [
                {
                    text: 'NO',
                    onPress: () => {
                        console.log('Cancel Pressed')
                    },
                    style: 'cancel',
                },
                {
                    text: 'YES', onPress: () => {
                        this.updateApiCall(updateBody);
                    }
                },
            ],
            {cancelable: false},
        )
    }

    updateApiCall(updateBody) {
        if (this.state.accepted === true && this.state.optOutAccepted === true) {
            if (this.state.acceptedType === "LOGIN") {
                updateBody["LoginOptOutTCAccepted"] = "1"
            }
            if (this.state.acceptedType === "LOGOUT") {
                updateBody["LogoutOptOutTCAccepted"] = "1"
            }
        }
        console.warn("inside updateApiCall " + JSON.stringify(updateBody));
        this.setLoader();
        API.newFetchJSON(
            this.state.CustomerUrl + URL.SaveSingleRoster,
            updateBody,
            true,
            this.callback.bind(this),
            TYPE.UPDATE_ROSTER
        );
    }

    /************************End Update Roster********************/

    render() {
        //Reading props
        let rosterDetails = this.state.rosterDetails;
        console.warn("this.state.disclaimerType " + this.state.disclaimerType);
        /************************** calculated Roster ************************/
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
                RestrictToPOILogin: 0,
                RestrictToPOILogout: 0
            }
        ];
        let selectedDaysinNumber = [];
        let Offices = [];
        const weeklyOffDaysToNumber = {
            Sunday: "0",
            Monday: "1",
            Tuesday: "2",
            Wednesday: "3",
            Thursday: "4",
            Friday: "5",
            Saturday: "6"
        };
        if (this.state.RosterDate) {
            selectedDaysinNumber.push(
                weeklyOffDaysToNumber[moment(this.state.RosterDate).format("dddd")]
            );

            let officeLoginSelectedNumber = findID(
                this.state.officeLoginSelected,
                rosterDetails.Offices
            );

            let officeLogoutSelectedNumber = findID(
                this.state.officeLogoutSelected,
                rosterDetails.Offices
            );
            if (officeLoginSelectedNumber && officeLogoutSelectedNumber) {
                let customisedRoster = filterShiftTimeBasedOnCutOffTime(
                    rosterDetails.Rosters,
                    this.state.RosterDate,
                    this.state.RosterDate,
                    officeLoginSelectedNumber,
                    officeLogoutSelectedNumber
                );
                calculateRoster = getCalculatedRoster(
                    customisedRoster,
                    selectedDaysinNumber,
                    officeLoginSelectedNumber.toString(),
                    officeLogoutSelectedNumber.toString(),
                    this.state.loginSelected,
                    this.state.logoutSelected
                );
            }
            for (let i = 0; i < rosterDetails.Offices.length; i++) {
                Offices.push({
                    ID: rosterDetails.Offices[i].ID,
                    Name: rosterDetails.Offices[i].Name,
                    Address: rosterDetails.Offices[i].Address,
                    Lat: rosterDetails.Offices[i].Lat,
                    Lng: rosterDetails.Offices[i].Lng
                });
                // }
            }
        } else {
            Offices = rosterDetails.Offices;
        }
        /************************** calculated Roster ************************/

        let rosterDetailsLocationsJSON = rosterDetails.Locations;

        let dateArray;
        dateArray = this.state.rosterDetails.AvailableRosters
            ? this.state.rosterDetails.AvailableRosters.split("|")
            : false;

        let dates = {};
        if (dateArray)
            dateArray.forEach(val => {
                if (val === moment().format("YYYY-MM-DD")) {
                    dates[val] = {
                        textColor: colors.WHITE,
                        selected: true,
                        selectedColor: colors.GREEN
                    };
                } else if (val)
                    dates[val] = {
                        textColor: colors.WHITE,
                        selected: true,
                        selectedColor: colors.BLUE
                    };
            });

        //Merging Two array
        let newDates = Object.assign(this.state.markedDates, dates);
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
        for (let i = 0; i < rosterDetailsLocations.length; i++) {
            if (rosterDetailsLocations[i].ID === "H") {
                rosterDetailsLocationsWithoutOthers.push(rosterDetailsLocations[i]);
            }
        }
        /******************************* End of Manual Adding Searched location *************************************/

        loginLocation = rosterDetails.RosteringAllowedLogin === 1
            ? calculateRoster[0].AllowOtherLocationsLogin === 1
                ? [...rosterDetailsLocations]
                : [...rosterDetailsLocationsWithoutOthers]
            : [];
        logoutLocation = rosterDetails.RosteringAllowedLogout === 1
            ? calculateRoster[0].AllowOtherLocationsLogout === 1
                ? [...rosterDetailsLocations]
                : [...rosterDetailsLocationsWithoutOthers]
            : [];
        return (
            <View style={{flex: 1}}>
                <View>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.BLUE}
                        barStyle="dark-content"
                    />
                    {spinner.visible(this.state.isLoading)}
                    <Modal
                        isVisible={this.state.visibleModal === "AddNickName"}
                        style={{justifyContent: "flex-end", margin: 0}}
                    >
                        {this._renderAddNickNameModalContent()}
                    </Modal>
                    <Modal
                        isVisible={this.state.visibleOptOutModal}
                        style={{justifyContent: 'center', marginVertical: 40, alignContent: 'center'}}
                    >
                        {this._renderDisclaimerType()}
                    </Modal>
                    {this._renderQuickActions(calculateRoster[0])}
                    <PopupDialog
                        style={{flex: 1}}
                        height={1}
                        width={1}
                        overlayOpacity={0.7}
                        dialogAnimation={slideAnimation}
                        ref={popupDialog => {
                            this.popupDialog = popupDialog;
                        }}
                        dismissOnHardwareBackPress={false}
                    >
                        {(!this.state.FabVisible && <ViewRosterComponent
                                close={() => {
                                    this.popupDialog.dismiss();
                                    this.setState({FabVisible: true});
                                }}
                                RosterID={this.state.RosterID}
                                editRule={this.checkRosterUpdateMode(calculateRoster)}
                                calculatedRoster={calculateRoster[0]}
                                rosterDetails={rosterDetails}
                                navigation={this.props.navigation}
                                RosterDate={this.state.RosterDate}
                                rosterType={rosterType.both}
                                Offices={Offices}
                                loginOffice={this.state.officeLoginSelected}
                                setLoginOffice={loginOffice => {
                                    this.onOfficeLoginValueChange(loginOffice);
                                }}
                                logoutOffice={this.state.officeLogoutSelected}
                                setLogoutOffice={logoutOffice =>
                                    this.onOfficeLogoutValueChange(logoutOffice)
                                }
                                loginTime={this.state.loginSelected}
                                setLoginTime={loginTime => this.onLoginValueChange(loginTime)}
                                logoutTime={this.state.logoutSelected}
                                setLogoutTime={logoutTime => this.onLogoutValueChange(logoutTime)}
                                pickupLocation={this.state.pickupLocationSelected}
                                dropEnabled={this.state.dropLocationEnabled}
                                pickupEnabled={this.state.pickupLocationEnabled}
                                setPickupLocation={pickupLocation =>
                                    this.onPickupLocationValueChange(pickupLocation)
                                }
                                dropLocation={this.state.dropLocationSelected}
                                setDropLocation={dropLocation =>
                                    this.onDropLocationValueChange(dropLocation)
                                }
                                saveEmployeeLocation={newLocation =>
                                    this.saveEmployeeLocation(newLocation)
                                }
                                homeAddress={rosterDetailsLocationsWithoutOthers}
                                otherLocation={rosterDetailsLocations}
                                showUpdateButton={this.state.anyChangeInData}
                                showUpdateLoginButton={this.state.anyChangeInDataLogin}
                                showUpdateLogoutButton={this.state.anyChangeInDataLogout}
                                updateRoster={updateRoster => this.updateRoster(updateRoster, true)}
                            />
                        )}
                    </PopupDialog>
                    <CalendarList
                        maxDate={moment().add(rosterDetails.EligibleRosterDays, "days").format("YYYY-MM-DD")}
                        markedDates={newDates}
                        displayLoadingIndicator={false}
                        markingType={"multi-dot"}
                        hideExtraDays={true}
                        onDayPress={day => {
                            this.setState({
                                isLoading: true,
                                RosterDate: day.dateString
                            });

                            let body = {
                                RosterDate: day.dateString,
                                DeviceID: this.state.UserId
                            };
                            API.newFetchJSON(
                                this.state.CustomerUrl + URL.GET_SELECTED_ROSTER,
                                body,
                                true,
                                this.callback.bind(this),
                                TYPE.GET_SELECTED_ROSTER,
                                calculateRoster
                            );
                        }}
                        onVisibleMonthsChange={date => {
                        }}
                        pastScrollRange={1}
                        futureScrollRange={12}
                        scrollEnabled={true}
                        showScrollIndicator={true}
                        theme={{todayTextColor: colors.GREEN}}
                    />
                    {
                        (rosterDetails.RosteringAllowedLogout === 1 || rosterDetails.RosteringAllowedLogin === 1) && (
                            <FAB
                                buttonColor={colors.RED}
                                iconTextColor="#FFFFFF"
                                onClickAction={() => {
                                    this.props.navigation.navigate("CreateRosterNew", {
                                        rosterDetails: this.state.rosterDetails,
                                        getRosterDetails: this.getRosterDetails.bind(this)
                                    });
                                }}

                                visible={this.state.FabVisible}
                                iconTextComponent={<Ionicons name="ios-add"/>}
                            />
                        )}
                </View>
            </View>
        );
    }

    checkRosterUpdateMode(calculateRoster) {
        const date = this.state.RosterDate;
        const selectedDate = moment(new Date(date)).format("YYYY-MM-DD");
        const prevDate = moment()
            .subtract(1, "days")
            .format("YYYY-MM-DD");
        const currentDate = moment().format("YYYY-MM-DD");
        if (
            selectedDate &&
            selectedDate === prevDate &&
            this.state.logoutSelected &&
            (this.state.logoutSelected.includes("*") ||
                this.state.logoutSelected.includes("Cancel,0,D") ||
                (calculateRoster[0].LogoutShifts &&
                    calculateRoster[0].LogoutShifts.includes("*")))
        )
            return {
                login: false,
                logout: true
            };
        else {
            return selectedDate && moment(selectedDate).isBefore(currentDate)
                ? {
                    login: false,
                    logout: false
                }
                : {
                    login: true,
                    logout: true
                };
        }
    }
}

export default ViewModifyRoster;

function findID(Name, array) {
    if (!Name) return "";
    let i;
    for (i = 0; i < array.length; i++) {
        if (array[i].Name.trim() === Name.toString().trim()) {
            return array[i].ID;
        }
    }
    return "";
}

function findAddress(Name, array) {
    if (!Name) return "";
    let i;
    for (i = 0; i < array.length; i++) {
        if (array[i].Name.toString().trim() === Name.toString().trim()) {
            return array[i].Address;
        }
    }
    return "";
}

function findLat(Name, array) {
    if (!Name) return "";
    let i;
    for (i = 0; i < array.length; i++) {
        if (array[i].Name.toString().trim() === Name.toString().trim()) {
            return array[i].Lat;
        }
    }
    return "";
}

function findLng(Name, array) {
    if (!Name) return "";
    let i;
    for (i = 0; i < array.length; i++) {
        if (array[i].Name.toString().trim() === Name.toString().trim()) {
            return array[i].Lng;
        }
    }
    return "";
}

function splitData(value, index) {
    if (value && value.includes(",")) return value.split(",")[index];
    return "";
}

function getCalculatedRoster(
    Rosters,
    selectedDaysArray,
    officeLoginSelectedNumber,
    officeLogoutSelectedNumber,
    selectedLoginShift,
    selectedLogoutShift
) {
    let rosterTotalWeekdaysAvailable = [];
    for (let i = 0; i < Rosters.length; i++) {
        rosterTotalWeekdaysAvailable.push(Rosters[i].WeekdaysAllowed);
    }
    for (let i = 0; i < selectedDaysArray.length; i++) {
        for (let j = 0; j < Rosters.length; j++) {
            if (
                !rosterTotalWeekdaysAvailable.join("|").includes(selectedDaysArray[i])
            ) {
                return [
                    {
                        LoginShifts: "",
                        LogoutShifts: "",
                        OfficeLocationsAllowed: "",
                        AllowOtherLocationsLogin: 0,
                        AllowOtherLocationsLogout: 0,
                        RestrictToPOILogin: 0,
                        RestrictToPOILogout: 0
                    }
                ];
            }
        }
    }

    let newLoginShifts = [];
    for (let k = 0; k < Rosters.length; k++) {
        let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
        let LoginShiftsArray = Rosters[k].LoginShifts.split("|");
        for (let i = 0; i < WeekdaysAllowedArray.length; i++) {
            for (let j = 0; j < LoginShiftsArray.length; j++) {
                newLoginShifts.push(
                    LoginShiftsArray[j] + "#" + WeekdaysAllowedArray[i]
                );
            }
        }
    }
    newLoginShifts = newLoginShifts.sort();
    let newLogoutShifts = [];
    for (let k = 0; k < Rosters.length; k++) {
        let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
        let LogoutShiftsArray = Rosters[k].LogoutShifts.split("|");
        for (let i = 0; i < WeekdaysAllowedArray.length; i++) {
            for (let j = 0; j < LogoutShiftsArray.length; j++) {
                newLogoutShifts.push(
                    LogoutShiftsArray[j] + "#" + WeekdaysAllowedArray[i]
                );
            }
        }
    }
    newLogoutShifts = newLogoutShifts.sort();
    let newOfficeLocationsAllowed = [];
    for (let k = 0; k < Rosters.length; k++) {
        let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
        let OfficeLocationsAllowedArray = Rosters[k].OfficeLocationsAllowed.split(
            "|"
        );
        for (let i = 0; i < WeekdaysAllowedArray.length; i++) {
            for (let j = 0; j < OfficeLocationsAllowedArray.length; j++) {
                newOfficeLocationsAllowed.push(
                    OfficeLocationsAllowedArray[j] + "#" + WeekdaysAllowedArray[i]
                );
            }
        }
    }
    let newAllowOtherLocationsLogin = [];
    for (let k = 0; k < Rosters.length; k++) {
        let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
        let AllowOtherLocationsLoginArray = [Rosters[k].AllowOtherLocationsLogin];
        for (let i = 0; i < WeekdaysAllowedArray.length; i++) {
            for (let j = 0; j < AllowOtherLocationsLoginArray.length; j++) {
                newAllowOtherLocationsLogin.push(
                    AllowOtherLocationsLoginArray[j] + "#" + WeekdaysAllowedArray[i]
                );
            }
        }
    }
    let newAllowOtherLocationsLogout = [];
    for (let k = 0; k < Rosters.length; k++) {
        let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
        let AllowOtherLocationsLogoutArray = [Rosters[k].AllowOtherLocationsLogout];
        for (let i = 0; i < WeekdaysAllowedArray.length; i++) {
            for (let j = 0; j < AllowOtherLocationsLogoutArray.length; j++) {
                newAllowOtherLocationsLogout.push(
                    AllowOtherLocationsLogoutArray[j] + "#" + WeekdaysAllowedArray[i]
                );
            }
        }
    }

    let RestrictToPOILogin = [];
    for (let k = 0; k < Rosters.length; k++) {
        let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
        let AllowOtherLocationsLoginArray = [Rosters[k].RestrictToPOILogin];
        for (let i = 0; i < WeekdaysAllowedArray.length; i++) {
            for (let j = 0; j < AllowOtherLocationsLoginArray.length; j++) {
                RestrictToPOILogin.push(
                    AllowOtherLocationsLoginArray[j] + "#" + WeekdaysAllowedArray[i]
                );
            }
        }
    }
    let RestrictToPOILogout = [];
    for (let k = 0; k < Rosters.length; k++) {
        let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
        let AllowOtherLocationsLogoutArray = [Rosters[k].RestrictToPOILogout];
        for (let i = 0; i < WeekdaysAllowedArray.length; i++) {
            for (let j = 0; j < AllowOtherLocationsLogoutArray.length; j++) {
                RestrictToPOILogout.push(
                    AllowOtherLocationsLogoutArray[j] + "#" + WeekdaysAllowedArray[i]
                );
            }
        }
    }
    let OfficeLocationsAllowed = getCalculatedValue(
        newOfficeLocationsAllowed,
        selectedDaysArray
    );
    let LoginShifts = getCalculatedValue(newLoginShifts, selectedDaysArray);
    let LogoutShifts = getCalculatedValue(newLogoutShifts, selectedDaysArray);
    return [
        {
            LoginShifts: OfficeLocationsAllowed.includes(officeLoginSelectedNumber)
                ? LoginShifts
                : "",
            LogoutShifts: OfficeLocationsAllowed.includes(officeLogoutSelectedNumber)
                ? LogoutShifts
                : "",
            OfficeLocationsAllowed: getCalculatedValue(
                newOfficeLocationsAllowed,
                selectedDaysArray
            ),
            AllowOtherLocationsLogin: getAllowOtherLocationsLogin(
                newAllowOtherLocationsLogin,
                selectedDaysArray,
                selectedLoginShift,
                Rosters,
                officeLoginSelectedNumber
            ),
            AllowOtherLocationsLogout: getAllowOtherLocationsLogout(
                newAllowOtherLocationsLogout,
                selectedDaysArray,
                selectedLogoutShift,
                Rosters,
                officeLogoutSelectedNumber
            ),
            RestrictToPOILogin: getLoginPOI(
                RestrictToPOILogin,
                selectedDaysArray,
                selectedLoginShift,
                Rosters,
                officeLoginSelectedNumber
            ),
            RestrictToPOILogout: getLogOutPOI(
                RestrictToPOILogout,
                selectedDaysArray,
                selectedLogoutShift,
                Rosters,
                officeLogoutSelectedNumber
            )
        }
    ];
}

function getCalculatedValue(shifts, selectedDaysArray) {
    let matched = [];
    for (let i = 0; i < selectedDaysArray.length; i++) {
        for (let j = 0; j < shifts.length; j++) {
            if (selectedDaysArray[i] === shifts[j].split("#")[1]) {
                matched.push(shifts[j]);
            }
        }
    }
    let onlyMatched = [];
    for (let i = 0; i < matched.length; i++) {
        onlyMatched.push(matched[i].substr(0, matched[i].lastIndexOf("#")));
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
    let removeDuplicate = [...new Set(common)];
    return removeDuplicate.join("|");
}

function getLoginPOI(shifts, selectedDaysArray, selectedLoginShift, Rosters, officeLoginSelectedNumber) {
    if (selectedLoginShift.includes("Select")) {
        let matched = [];
        for (let i = 0; i < selectedDaysArray.length; i++) {
            for (let j = 0; j < shifts.length; j++) {
                if (selectedDaysArray[i] === shifts[j].split("#")[1]) {
                    matched.push(shifts[j]);
                }
            }
        }
        let onlyMatched = [];
        for (let i = 0; i < matched.length; i++) {
            onlyMatched.push(matched[i].substr(0, matched[i].lastIndexOf("#")));
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
        let removeDuplicate = [...new Set(common)];
        return removeDuplicate.join("|");
    } else {
        let customRoster = Rosters.find(function (item) {
            return (item.OfficeLocationsAllowed.includes(officeLoginSelectedNumber) && item.WeekdaysAllowed.includes(selectedDaysArray) && item.LoginShifts.includes(selectedLoginShift));
        });
        return customRoster ? customRoster.RestrictToPOILogin : 0;
    }
}

function getLogOutPOI(shifts, selectedDaysArray, selectedLogoutShift, Rosters, officeLogoutSelectedNumber) {
    if (selectedLogoutShift.includes("Select")) {
        let matched = [];
        for (let i = 0; i < selectedDaysArray.length; i++) {
            for (let j = 0; j < shifts.length; j++) {
                if (selectedDaysArray[i] === shifts[j].split("#")[1]) {
                    matched.push(shifts[j]);
                }
            }
        }
        let onlyMatched = [];
        for (let i = 0; i < matched.length; i++) {
            onlyMatched.push(matched[i].substr(0, matched[i].lastIndexOf("#")));
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
        let removeDuplicate = [...new Set(common)];
        return removeDuplicate.join("|");
    } else {
        let customRoster = Rosters.find(function (item) {
            return (item.OfficeLocationsAllowed.includes(officeLogoutSelectedNumber) && item.WeekdaysAllowed.includes(selectedDaysArray) && item.LogoutShifts.includes(selectedLogoutShift));
        });
        return customRoster ? customRoster.RestrictToPOILogout : 0;
    }
}

function getAllowOtherLocationsLogin(shifts, selectedDaysArray, selectedLoginShift, Rosters, officeLoginSelectedNumber) {
    if (selectedLoginShift.includes("Select")) {
        let matched = [];
        for (let i = 0; i < selectedDaysArray.length; i++) {
            for (let j = 0; j < shifts.length; j++) {
                if (selectedDaysArray[i] === shifts[j].split("#")[1]) {
                    matched.push(shifts[j]);
                }
            }
        }
        let onlyMatched = [];
        for (let i = 0; i < matched.length; i++) {
            onlyMatched.push(matched[i].substr(0, matched[i].lastIndexOf("#")));
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
        let removeDuplicate = [...new Set(common)];
        return removeDuplicate.join("|");
    } else {
        let customRoster = Rosters.find(function (item) {
            return (item.OfficeLocationsAllowed.includes(officeLoginSelectedNumber) && item.WeekdaysAllowed.includes(selectedDaysArray) && item.LoginShifts.includes(selectedLoginShift));
        });
        return customRoster ? customRoster.AllowOtherLocationsLogin : 0;
    }
}

function getAllowOtherLocationsLogout(shifts, selectedDaysArray, selectedLogoutShift, Rosters, officeLogoutSelectedNumber) {
    if (selectedLogoutShift.includes("Select")) {
        let matched = [];
        for (let i = 0; i < selectedDaysArray.length; i++) {
            for (let j = 0; j < shifts.length; j++) {
                if (selectedDaysArray[i] === shifts[j].split("#")[1]) {
                    matched.push(shifts[j]);
                }
            }
        }
        let onlyMatched = [];
        for (let i = 0; i < matched.length; i++) {
            onlyMatched.push(matched[i].substr(0, matched[i].lastIndexOf("#")));
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
        let removeDuplicate = [...new Set(common)];
        return removeDuplicate.join("|");
    } else {
        let customRoster = Rosters.find(function (item) {
            return (item.OfficeLocationsAllowed.includes(officeLogoutSelectedNumber) && item.WeekdaysAllowed.includes(selectedDaysArray) && item.LogoutShifts.includes(selectedLogoutShift));
        });
        return customRoster ? customRoster.AllowOtherLocationsLogout : 0;
    }
}
