import React, { Component } from "react";
import { Text, } from "native-base";
import {
    ActivityIndicator,
    Alert,
    PanResponder,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    View
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    getDaysInMonth,
} from "../roster/customeComponent/RosterCustomFunctions";
import { colors } from "../../utils/Colors";
import { inject, observer } from "mobx-react";
import {
    _renderWeeklyOff
} from "../roster/customeComponent/customComponent";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import * as HOC from "../../components/hoc";
import TouchableDebounce from "../../utils/TouchableDebounce";
import {
    _renderCountry,
    _renderDate,
    _renderOffice,
    _renderTitleContent
} from "../roster/customeComponent/customComponent";
import { rosterType } from "../roster/customeComponent/RosterType";
import Moment from "moment";
import { extendMoment } from "moment-range";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "react-native-modal-datetime-picker";
import * as Toast from "../../utils/Toast";
import { StackActions } from "@react-navigation/native";
import { adhoc } from "../../stores/modifiedAdHocStore";
import DatePicker from "react-native-modern-datepicker";
import { options } from "./AdhocLanding";
import { API } from "../../network/apiFetch/API";
import { URL } from "../../network/apiConstants";
import { TYPE } from "../../model/ActionType";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import { asyncString, Select } from "../../utils/ConstantString";
import { Button, List } from "react-native-paper";
import { CryptoXor } from "crypto-xor";

const ViewLoader = HOC.LoaderHOC(View);
const moment = extendMoment(Moment);
const alertMessage = "Please Select Request type and Trip type";
const _ = require("lodash");

@inject("adhocStore")
@observer
class TravelDesk extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: '' // navigation.getParam("title"),
        };
    };
    _renderSource = (store) => {
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
                <TouchableDebounce
                    onPress={() => {
                        store.hideDateTimePicker();
                        if (store.programSelected.includes("Others")) {
                            if (store.tripTypeSelected === "Login") {
                                let StaffLocations = store.FlexiDetails.StaffLocations;
                                if (StaffLocations.length > 0)
                                    this.props.navigation.navigate("MapPicker", {
                                        returnData: this.returnData.bind(this),
                                        StaffLocations,
                                        showNodalPoint: true
                                    });
                            } else if (store.tripTypeSelected === "Logout") {
                                let OfficeLocations = _.uniqBy(store.FlexiDetails.OfficeLocations, "Name");
                                this.props.navigation.navigate("LocationSelector", {
                                    locations: OfficeLocations,
                                    type: "from",
                                    onFromValueChange: this.onFromValueChange.bind(this),
                                    other: true,
                                    selectedValue: store.fromSelected,
                                });
                            } else {
                                Alert.alert(this.state.title, "Select trip type");
                            }
                        } else {
                            console.warn('In else ');
                            if (store.programSelected === "Select" || store.tripTypeSelected === "Select") {
                                Alert.alert(this.state.title, alertMessage);
                            } else {
                                console.warn('having data in ');
                                let body = [];
                                console.warn('from address', store.fromAddressID);
                                if (store.fromAddressID) {
                                    body = [{
                                        Id: store.fromAddressID,
                                        LocationName: store.fromSelectedLocation,
                                        LocationType: "S",
                                        GeoLocation: store.fromSelectLat + "," + store.fromSelectLng
                                    }];
                                }
                                let filteredLocations = [];
                                let homeFilter = [];
                                console.warn('store.ProgramsDetails.SourceLocationHome ', store.ProgramsDetails.SourceLocationHome);
                                if (store.ProgramsDetails.SourceLocationHome === 0) {
                                    homeFilter = store.SourceLocations.filter(location => location.Id !== "H");
                                } else {
                                    homeFilter = store.SourceLocations;
                                }
                                console.warn('store.SourceLocations ', store.SourceLocations);
                                console.warn('homeFilter ', homeFilter);
                                let office = [];
                                console.warn('store.ProgramsDetails.SourceLocationOffice ', store.ProgramsDetails.SourceLocationOffice);
                                if (store.ProgramsDetails.SourceLocationOffice === 0) {
                                    office = homeFilter.filter(location =>
                                        location.Id === "H" || location.Id === "0"
                                    );
                                } else {
                                    office = homeFilter;
                                }
                                console.warn('office ', office);
                                console.warn('store.ProgramsDetails.SourceLocationOthers ', store.ProgramsDetails.SourceLocationOthers);
                                if (store.ProgramsDetails.SourceLocationOthers === 0) {
                                    filteredLocations = office.filter(location => location.Id !== "0");
                                } else {
                                    filteredLocations = office;
                                }
                                console.warn(' Body ', body);
                                console.warn(' filteredLocations ', filteredLocations);
                                let newDate = [
                                    ...body,
                                    ...filteredLocations
                                ];
                                console.warn('Source Locations filter ', newDate);
                                let Locations = _.uniqBy(newDate, "LocationName");
                                this.props.navigation.navigate("LocationSelector", {
                                    locations: Locations,
                                    type: "from",
                                    onFromValueChange: this.onFromValueChange.bind(this),
                                    other: false,
                                    selectedValue: store.fromSelected,
                                });
                            }
                        }
                    }}
                >
                    {this._renderTitleContent(
                        "Pickup Location *",
                        store.programSelected.includes("Others")
                            ? store.tripTypeSelected === "Login"
                                ? store.StaffLocations ? store.StaffLocations : "SELECT"
                                : store.fromSelected
                            : store.fromSelected ? store.fromSelected : "Select",
                    )}
                </TouchableDebounce>
            </View>
        );
    };
    _renderDestination = (store) => {
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
                <TouchableDebounce
                    onPress={() => {
                        store.hideDateTimePicker();
                        if (store.programSelected && store.programSelected.includes("Others")) {
                            if (store.tripTypeSelected === "Logout") {
                                let StaffLocations = store.FlexiDetails.StaffLocations;
                                if (StaffLocations.length > 0)
                                    this.props.navigation.navigate("MapPicker", {
                                        returnData: this.returnData.bind(this),
                                        StaffLocations,
                                        showNodalPoint: true
                                    });

                            } else if (store.tripTypeSelected === "Login") {
                                let OfficeLocations = _.uniqBy(store.FlexiDetails.OfficeLocations, "Name");
                                this.props.navigation.navigate("LocationSelector", {
                                    locations: OfficeLocations,
                                    type: "to",
                                    onToValueChange: this.onToValueChange.bind(this),
                                    other: true,
                                    selectedValue: store.toSelected,
                                });
                            } else {
                                Alert.alert(this.state.title, "Select trip type");
                            }
                        } else {
                            if (store.tripTypeSelected === "Select" || store.programSelected === "Select") {
                                Alert.alert(this.state.title, alertMessage);
                            } else {
                                let body = [];
                                if (this.state.toAddressID) {
                                    body = [
                                        {
                                            Id: this.state.toAddressID,
                                            LocationName: this.state.toSelectedLocation,
                                            LocationType: "D",
                                            GeoLocation: this.state.toSelectLat + "," + this.state.toSelectLng
                                        }
                                    ];
                                }

                                console.warn('store.DestinationLocations - ', store.DestinationLocations);
                                let filteredLocations = [];
                                let homeFilter = [];
                                if (store.ProgramsDetails.DestinationLocationHome === 0) {
                                    homeFilter = store.DestinationLocations.filter(
                                        location => location.Id !== "H"
                                    );
                                } else {
                                    homeFilter = store.DestinationLocations;
                                }
                                console.warn('homeFilter - ', homeFilter);
                                let office = [];
                                console.warn('store.ProgramsDetails.DestinationLocationOffice - ', store.ProgramsDetails.DestinationLocationOffice);
                                if (store.ProgramsDetails.DestinationLocationOffice === 0) {
                                    office = homeFilter.filter(
                                        location =>
                                            location.Id === "H" || location.Id === "0"
                                    );
                                } else {
                                    office = homeFilter;
                                }
                                console.warn('office - ', office);
                                console.warn('store.ProgramsDetails.DestinationLocationOthers - ', store.ProgramsDetails.DestinationLocationOthers);
                                if (store.ProgramsDetails.DestinationLocationOthers === 0) {
                                    filteredLocations = office.filter(
                                        location => location.Id !== "0"
                                    );
                                } else {
                                    filteredLocations = office;
                                }
console.warn('filteredLocations - ', filteredLocations);
                                let dropLocations = [
                                    ...body,
                                    ...filteredLocations //responseGetProgramDetailsORresponseGetFlexiDetailsArray.Locations
                                ];
                                console.warn('destination locations - ', dropLocations);
                                const Locations = _.uniqBy(dropLocations, "LocationName");
                                this.props.navigation.navigate("LocationSelector", {
                                    locations: Locations,
                                    type: "to",
                                    onToValueChange: this.onToValueChange.bind(this),
                                    other: false,
                                    selectedValue: store.toSelected,
                                });
                            }
                        }
                    }}
                >
                    {this._renderTitleContent(
                        "Drop Location *",
                        store.programSelected.includes("Others")
                            ? store.tripTypeSelected === "Logout"
                                ? store.StaffLocations ? store.StaffLocations : "SELECT"
                                : store.toSelected
                            : store.toSelected ? store.toSelected : "Select",
                    )}
                </TouchableDebounce>
            </View>
        );
    };

    _renderDateTime = (store) => {
        let date = "Invalid date";
        let monthYear = "Invalid date";
        let day = "Invalid date";
        if (moment(store.dateSelected) !== "Invalid date") {
            date = moment(store.dateSelected)
                .add(store.dateSelected ? 0 : 1, "day")
                .format("DD");
            day = moment(store.dateSelected)
                .add(store.dateSelected ? 0 : 1, "day")
                .format("dddd");
            monthYear = moment(store.dateSelected)
                .add(store.dateSelected ? 0 : 1, "day")
                .format("MMM YYYY");
        }
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
                <TouchableDebounce
                    onPress={() => {
                        if (store.programSelected !== "Select" || store.tripTypeSelected !== "Select")
                            store.showDatePicker();
                        else
                            Alert.alert(this.state.title, alertMessage);
                    }}
                    style={{ width: "50%" }}
                >
                    {_renderDate(
                        "Date *",
                        date === "Invalid date" ? "Select" : date,
                        monthYear === "Invalid date" ? "" : monthYear,
                        day === "Invalid date" ? "" : day
                    )}
                </TouchableDebounce>
                {
                    <TouchableDebounce
                        onPress={() => {
                            if (store.programSelected !== "Select" || store.tripTypeSelected !== "Select") {
                                store.showTimePicker()
                            } else
                                Alert.alert(this.state.title, alertMessage);
                        }}
                        style={{
                            width: store.rosterType === rosterType.drop ? "100%" : "50%"
                        }}
                    >
                        {_renderTitleContent(
                            "Time *",
                            store.timeSelected ? store.timeSelected : "Select",
                            store.timeSelected
                        )}
                    </TouchableDebounce>
                }
            </View>
        );
    };

    _renderDates = (store) => {
        let date = "Invalid date";
        let monthYear = "Invalid date";
        let day = "Invalid date";
        if (moment(store.dateSelected) !== "Invalid date") {
            date = moment(store.dateSelected, "D MMM YYYY")
                .add(store.dateSelected ? 0 : 1, "day")
                .format("DD");
            day = moment(store.dateSelected, "D MMM YYYY")
                .add(store.dateSelected ? 0 : 1, "day")
                .format("dddd");
            monthYear = moment(store.dateSelected, "D MMM YYYY")
                .add(store.dateSelected ? 0 : 1, "day")
                .format("MMM YYYY");
        }

        let dateTo = "";
        let monthYearTo = "";
        let dayTo = "";
        if (moment(store.dateToSelected) !== "Invalid date") {
            dateTo = moment(store.dateToSelected, "D MMM YYYY")
                .add(store.dateToSelected ? 0 : 1, "day")
                .format("DD");
            dayTo = moment(store.dateToSelected, "D MMM YYYY")
                .add(store.dateToSelected ? 0 : 1, "day")
                .format("dddd");
            monthYearTo = moment(store.dateToSelected, "D MMM YYYY")
                .add(store.dateToSelected ? 0 : 1, "day")
                .format("MMM YYYY");
        }
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
                <TouchableDebounce
                    onPress={() => {
                        if (store.programSelected !== "Select" || store.tripTypeSelected !== "Select")
                            store.showDatePicker('FROM');
                        else
                            Alert.alert(this.state.title, alertMessage);
                    }}
                    style={{ width: "50%" }}
                >
                    {_renderDate(
                        "From Date *",
                        date === "Invalid date" ? "Select" : date,
                        monthYear === "Invalid date" ? "" : monthYear,
                        day === "Invalid date" ? "" : day
                    )}
                </TouchableDebounce>
                <TouchableDebounce
                    onPress={() => {
                        if (store.programSelected !== "Select" || store.tripTypeSelected !== "Select")
                            store.showDatePicker('TO');
                        else
                            Alert.alert(this.state.title, alertMessage);
                    }}
                    style={{ width: "50%" }}
                >
                    {_renderDate(
                        "To Date *",
                        date === "Invalid date" ? "Select" : dateTo,
                        monthYear === "Invalid date" ? "" : monthYearTo,
                        day === "Invalid date" ? "" : dayTo
                    )}
                </TouchableDebounce>
            </View>
        );
    };

    _renderLineManger = (store) => {
        return (
            <View>
                <View style={line} />
                <View
                    style={{
                        paddingLeft: 20,
                        paddingRight: 20,
                        paddingTop: 10,
                        paddingBottom: 10,
                        flexDirection: "column"
                    }}
                >
                    <TouchableDebounce
                        disabled={store.ProgramsDetails.LineManagerEmails.length <= 1}
                        onPress={() => {
                            store.hideDateTimePicker();
                            this.props.navigation.navigate("LineManagerSelector", {
                                selectedValue: store.lineManager,
                            });
                        }}
                    >
                        {this._renderTitleContent(
                            "Line Manager",
                            store.lineManager ? store.lineManager : "Select",
                            "lineManger"
                        )}
                    </TouchableDebounce>
                </View>
            </View>
        );
    };
    _renderCostCenter = (store) => {
        return (
            <View>
                <View style={line} />
                <View
                    style={{
                        paddingLeft: 20,
                        paddingRight: 20,
                        paddingTop: 10,
                        paddingBottom: 10,
                        flexDirection: "column"
                    }}
                >
                    <TouchableDebounce
                        onPress={() => {
                            store.hideDateTimePicker();
                            this.props.navigation.navigate("TDCostCenterSelector", {
                                selectedValue: store.selectedCostCenter,
                            });
                        }}
                    >
                        {this._renderTitleContent(
                            "Cost Center *",
                            store.selectedCostCenter ? store.selectedCostCenter : "Select",
                            undefined,
                            "cost"
                        )}
                    </TouchableDebounce>
                </View>
            </View>
        );
    };
    _renderTitleContent = (title, content, manager, cost) => {
        return (
            <View style={{ flexDirection: "column", width: "90%" }}>
                <Text style={[titleStyle, { marginLeft: 3 }]}>{title}</Text>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 5,
                        marginRight: 3
                    }}
                >
                    {manager ?
                        <MaterialCommunityIcons
                            name={"account-check"}
                            size={23}
                            color={colors.BLACK}
                        /> : cost ? <MaterialCommunityIcons
                            name={"bank"}
                            size={23}
                            color={colors.BLACK}
                        /> :
                            <MaterialCommunityIcons
                                name={"map-marker-outline"}
                                size={23}
                                color={colors.BLACK}
                            />}
                    <Text
                        numberOfLines={1}
                        style={dateStyle}
                    >{content}
                    </Text>
                </View>
            </View>
        );
    };
    _hidePicker = () => {
        this.props.adhocStore.hideDateTimePicker();
    };
    _handleDatePicked = date => {
        console.warn('_handleDatePicked -> ', date);
        this.props.adhocStore.handleDatePicked(date);
    };
    _handleTimePicked = date => {
        this._hidePicker();
        //const timeSelected = moment(date).format("HH:mm");
        const selectedDate = moment(new Date(date)).format("YYYY-MM-DD");
        const calculatedSelectedDate = moment(
            new Date(selectedDate + " " + date)
        ).format("YYYY-MM-DD HH:mm");
        const currentDate = moment().format("YYYY-MM-DD HH:mm");
        if (moment(calculatedSelectedDate).isBefore(moment(currentDate))) {
            Toast.show("Selected time should be greater than current time.");
            this.props.adhocStore.showTimePicker();
            return;
        }
        if (Platform.OS === 'android') {
            date = moment(date).format("HH:mm");
        }
        this.props.adhocStore.handleTimePicked(date);
    };
    typeCheck = store => {
        if (store.programSelected === null || store.programSelected === "Select") return true;
        if (store.programSelected.includes("Flexi") ||
            store.programSelected.includes("Others")) {
            return true;
        }
        if (store.ProgramsDetails.Timings) {
            if (store.ProgramsDetails.hasOwnProperty("Timings") && Object.keys(store.ProgramsDetails.Timings).length < 1) return true;
            return (
                Object.keys(store.ProgramsDetails.Timings).length === 1 &&
                store.ProgramsDetails.Timings[0].FromTime !== store.ProgramsDetails.Timings[0].ToTime
            );
        }
    };

    constructor(props) {
        super(props);
        this.state = ({
            title: "",
            pono: null,
            // nationality: 'Indian',
            contactNo: "",
            alternateContactNo: null,
            weeklyOffStateValue: [],
            guestName: null,
            guestEmail: null,
            singleLadyTravel: false,
            securityEscot: false,
            sez: false,
            oncharge: null,
            dayallow: null,
            adminremark: null,
            driverNote: null,
            employeeNumber: ''
        });
        this.props.adhocStore.resetStore();
        this.props.adhocStore.setInitAdhoc(this, false, 'TravelDesk');
    }

    getLocalityList(){}
    
    _renderSite(store) {
        return (
            <View>
                <View style={{ flex: 1, flexDirection: "row", }}>
                    <TouchableDebounce
                        onPress={() => {
                            store.hideDateTimePicker();
                            this.props.navigation.navigate("SiteSelector", {
                                selectedItem: store.siteSelected,
                            });
                        }}
                    >
                        {_renderOffice("Site *", store.siteSelected)}
                    </TouchableDebounce>
                </View>
                <View style={line} />
            </View>
            )
    }

    _renderBU(store) {
        return (
            <View style={{ flex: 1, flexDirection: "row", }}>
                <TouchableDebounce
                    onPress={() => {
                        store.hideDateTimePicker();
                        this.props.navigation.navigate("BusinessSelector", {
                            selectedItem: store.buSelected,
                        });
                    }}
                >
                    {_renderOffice("BU *", store.buSelected)}
                </TouchableDebounce>
            </View>)
    }

    _renderSubBU(store) {
        return (
            <View style={{ flex: 1, flexDirection: "row", }}>
                <TouchableDebounce
                    onPress={() => {
                        if (store.buSelected !== Select) {
                            store.hideDateTimePicker();
                            this.props.navigation.navigate("SubBusinessSelector", {
                                selectedItem: store.subbuSelected,
                            });
                        } else {
                            Alert.alert(this.state.title, "Please select a BU");
                        }
                    }}
                >
                    {_renderOffice("Sub BU", store.subbuSelected)}
                </TouchableDebounce>
            </View>)
    }

    _renderVisitorType(store) {
        return (
            <View style={{ flex: 1, flexDirection: "row", }}>
                <TouchableDebounce
                    onPress={() => {
                        if (store.siteSelected !== "Select") {
                            store.hideDateTimePicker();
                            this.props.navigation.navigate("VisitorSelector", {
                                selectedItem: store.visitorSelected,
                            });
                        } else {
                            Alert.alert(this.state.title, "Please select a site");
                        }
                    }}
                >
                    {_renderOffice("Visitor Type *", store.visitorSelected)}
                </TouchableDebounce>
            </View>)
    }

    _renderVehicleType(store) {
        return (
            <View style={{ flex: 1, flexDirection: "row", }}>
                <TouchableDebounce
                    onPress={() => {
                        if (store.programSelected !== "Select") {
                            store.hideDateTimePicker();
                            this.props.navigation.navigate("VehicleSelector", {
                                selectedItem: store.vehicleSelected,
                            });
                        } else {
                            Alert.alert(this.state.title, "Please select a program");
                        }
                    }}
                >
                    {_renderOffice("Vehicle Type *", store.vehicleSelected)}
                </TouchableDebounce>
            </View>)
    }

    _renderRentalModel(store) {
        return (
            <>
            <View style={line} />
            <View style={{ flex: 1, flexDirection: "row", }}>
                <TouchableDebounce
                    onPress={() => {
                        if (store.programSelected !== "Select") {
                            store.hideDateTimePicker();
                            this.props.navigation.navigate("RentalModelSelector", {
                                selectedItem: store.rentalModelSelected,
                            });
                        } else {
                            Alert.alert(this.state.title, "Please select a program");
                        }
                    }}
                >
                    {_renderOffice("Rental Model", store.rentalModelSelected)}
                </TouchableDebounce>
            </View>
            </>
            )
    }

    _renderCountry(store) {
        return (
            <View style={{ flex: 1, flexDirection: "row", }}>
                <TouchableDebounce
                    onPress={() => {
                        if (store.siteSelected !== "Select") {
                            store.hideDateTimePicker();
                            this.props.navigation.navigate("CountrySelector", {
                                selectedItem: store.countrySelected,
                            });
                        } else {
                            Alert.alert(this.state.title, "Please select a site");
                        }
                    }}
                >
                    {_renderCountry("Guest Country *", store.countrySelected)}
                </TouchableDebounce>
            </View>)
    }

    _renderProgramType(store) {
        return (
            <View style={{ flex: 1, flexDirection: "row", }}>
                <TouchableDebounce
                    onPress={() => {
                        if (store.siteSelected !== "Select") {
                            store.hideDateTimePicker();
                            this.props.navigation.navigate("ProgramSelector", {
                                selectedItem: store.programSelected,
                            });
                        } else {
                            Alert.alert(this.state.title, "Please select a site");
                        }
                    }}
                >
                    {_renderOffice("Programs *", store.programSelected)}
                </TouchableDebounce>
            </View>)
    }

    _renderTripType(store) {
        return (
            <View style={{ flex: 1, flexDirection: "row", }}>
                <TouchableDebounce
                    onPress={() => {
                        if (store.programSelected !== "Select") {
                            store.hideDateTimePicker();
                            this.props.navigation.navigate("TripSelector", {
                                selectedItem: store.tripSelected,
                            });
                        } else {
                            Alert.alert(this.state.title, "Please select a program type");
                        }
                    }}
                >
                    {_renderOffice("Trip Type *", store.tripSelected)}
                </TouchableDebounce>
            </View>)
    }

    returnData(StaffLocations) {
        this.props.adhocStore.StaffLocations = StaffLocations;
    }

    onFromValueChange(value: string) {
        console.warn('onFromValueChange ', value);
        this.props.adhocStore.setFromSelected(value);
        this.props.adhocStore.hideDateTimePicker();
        if (value === "Others") {
            this.goToLocationPicker("from");
        }

    }

    onToValueChange(value: string) {
        console.warn('onToValueChange ', value);
        this.props.adhocStore.setToSelected(value);
        this.props.adhocStore.hideDateTimePicker();
        if (value === "Others") {
            this.goToLocationPicker("to");
        }
    }

    goToLocationPicker(type) {
        this.props.navigation.navigate("MapPicker", {
            getLocationPicker: this.getLocationPicker.bind(this),
            enableCurrentLocation: true,
            type: type
        });
    }

    getLocationPicker(selectedLocation, selectLat, selectLng, type) {
        let store = this.props.adhocStore;
        if (type === "from") {
            store.fromSelectedLocation = selectedLocation;
            store.fromSelectLat = selectLat;
            store.fromSelectLng = selectLng;
        } else if (type === "to") {
            store.toSelectedLocation = selectedLocation;
            store.toSelectLat = selectLat;
            store.toSelectLng = selectLng;
        }
        else return;
        let body = {
            AddressType: "Others",
            Address: selectedLocation,
            GeoLocation: selectLat + "," + selectLng
        };
        store.savePOILocation(body, type, selectedLocation);
    }

    componentDidMount() {
        if (this.state.title.toString().length <= 0) {
            let title = this.props.route.params.title; // ", "Ad Hoc");
            this.setState({ title });
        }

        AsyncStorage.multiGet(
            [
                asyncString.ACCESS_TOKEN,
                asyncString.USER_ID,
                asyncString.DTOKEN,
                asyncString.CAPI,
                asyncString.IdleTimeOutInMins,
                asyncString.UserName
            ],
            (err, savedData) => {
                var _token = CryptoXor.decrypt(
                    savedData[0][1],
                    asyncString.ACCESS_TOKEN
                );
                this.setState({
                    access_token: _token,
                    UserId: savedData[1][1],
                    DToken: savedData[2][1],
                    CustomerUrl: savedData[3][1],
                    IdleTimeOutInMins: parseInt(savedData[4][1]),
                    guestName: savedData[5][1]
                });
                this.getUserDetails(_token, savedData[1][1], savedData[3][1]);
            }
        );
    }

    getUserDetails(access_token) {
        this.setState({
            isLoading: true
        });
        API.newFetchXJSON(
            URL.GET_USER_DETAILS,
            access_token,
            this.callback.bind(this),
            TYPE.GET_USER_DETAILS
        );
    }

    callback = async (actionType, response) => {
        const { navigate } = this.props.navigation;
        switch (actionType) {
            case TYPE.GET_USER_DETAILS: {
                handleResponse.userDetails(await response, this, navigate);
                break;
            }
        }

        console.warn('Callback state updated ', this.state);
        this.props.adhocStore.setDefaultSite(this.state);
        this.props.adhocStore.setDefaultEmployee(this.state);
        console.warn('BU Site updated in store ', this.props.adhocStore.businessID, '    ', this.props.adhocStore.siteID);
    };

    onAddPress = () => {
        console.warn('handle onAddPress');
        this.props.adhocStore.resetEmployee();
        this.props.navigation.navigate("TravellerDetail", {
            title: "Add Traveller"
        });
      }

     onEditPress = (_employee, _index) => {
        console.warn('handle onEditPress ', _employee);
        this.props.adhocStore.editEmployee(_employee, _index);
        setTimeout(() => {
            this.props.navigation.navigate("TravellerDetail", {
                title: "Edit Traveller"
            });
        }, 100);
      }
    
       onDeletePress = (_index) => {
        console.warn('handle onDeletePress');
        Alert.alert(
            'Delete',
            'Are you sure want to delete ?',
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
                        this.props.adhocStore.Employees.splice(_index, 1);
                    }
                },
            ],
            {cancelable: false},
        );
      }

    render() {
        const adhocStoreObject = this.props.adhocStore;
        adhocStoreObject.businessID = this.state.businessID;
        adhocStoreObject.siteID = this.state.siteID;
        return (
            // <ViewLoader spinner={this.props.adhocStore.isLoading} style={{ flex: 1 }}>
                <SafeAreaView
                    style={{ flex: 1, backgroundColor: colors.WHITE, paddingTop: Platform.OS === 'ios' ? 20 : 0 }}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.BLUE}
                        barStyle="dark-content"
                    />
                    <ScrollView style={{ marginBottom: 50 }}>
                        <View
                            style={viewContainer}
                        >
                            <View style={{ marginTop: 20 }} />
                            {adhocStoreObject.isSiteVisible && this._renderSite(adhocStoreObject) }
                            
                            {this._renderProgramType(adhocStoreObject)}
                            <View style={line} />
                            {/* {this._renderBU(adhocStoreObject)}
                            <View style={line} />
                            {this._renderSubBU(adhocStoreObject)}
                            <View style={line} /> */}
                            <View style={{
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                                paddingBottom: 10,
                                flex: 1,
                                flexDirection: 'column'
                            }}>
                                <Text style={itemNameLabel}>Requester Name *</Text>
                                <TextInput
                                    ref={nameRef => {
                                        this.nameRef = nameRef;
                                    }}
                                    style={itemName}
                                    numberOfLines={1}
                                    returnKeyType="done"
                                    maxLength={50}
                                    onChangeText={text => this.onNameChange(text)}
                                    value={this.state.guestName}
                                />
                            </View>
                            <View style={line} />
                            <View style={{
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                                paddingBottom: 10,
                                flex: 1,
                                flexDirection: 'column'
                            }}>
                                <Text style={itemNameLabel}>Requester Email *</Text>
                                <TextInput
                                    ref={emailRef => {
                                        this.emailRef = emailRef;
                                    }}
                                    style={itemName}
                                    numberOfLines={1}
                                    returnKeyType="done"
                                    maxLength={50}
                                    onChangeText={text => this.onEmailChange(text)}
                                    value={this.state.guestEmail}
                                />
                            </View>
                            <View style={line} />
                            <View style={{
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                                paddingBottom: 10,
                                flex: 1,
                                flexDirection: 'column'
                            }}>
                                <Text style={itemNameLabel}>Requester Mobile Number *</Text>
                                <TextInput
                                    ref={mobileRef => {
                                        this.mobileRef = mobileRef;
                                    }}
                                    style={itemName}
                                    numberOfLines={1}
                                    keyboardType="numeric"
                                    returnKeyType="done"
                                    maxLength={10}
                                    onChangeText={text => this.onMobileNumberChange(text)}
                                    value={this.state.contactNo}
                                />
                            </View>
                            <View style={line} />
                            {this._renderTripType(adhocStoreObject)}
                            <View style={line} />
                            {this._renderVehicleType(adhocStoreObject)}
                            {adhocStoreObject.isRentalModelVisible && this._renderRentalModel(adhocStoreObject)}
                            {/* <View style={line} />
                            {this._renderVisitorType(adhocStoreObject)} */}
                            <View style={line} />
                            {this._renderSource(adhocStoreObject)}
                            <View style={line} />
                            {this._renderDestination(adhocStoreObject)}
                            <View style={line} />
                            {this._renderDates(adhocStoreObject)}
                            {Platform.OS === 'ios' ? adhocStoreObject.isDatePickerVisible &&
                                <DatePicker
                                    options={options}
                                    minimumDate={moment().format()}
                                    maximumDate={moment(new Date()).add(30, 'days').format("YYYY-MM-DD")}
                                    mode="calendar"
                                    onSelectedChange={date => {
                                        let dates = moment(date, "YYYY/MM/DD").format("YYYY-MM-DD");
                                        this._handleDatePicked(dates)
                                    }}
                                    style={{ borderRasdius: 10 }}
                                /> : <DateTimePicker
                                isVisible={adhocStoreObject.isDatePickerVisible}
                                onConfirm={this._handleDatePicked}
                                onCancel={this._hidePicker}
                                mode={"date"}
                                is24Hour={false}
                                presentationStyle={"pageSheet"}
                                minimumDate={adhocStoreObject.minDateAllowed}
                            />}
                            <View style={line} />
                            {_renderWeeklyOff(
                                "Weekly Off",
                                this.state.weeklyOffStateValue,
                                this.addWeeklyOff.bind(this)
                            )}
                            <View style={line} />
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
                                <TouchableDebounce
                                    onPress={() => {
                                        if (adhocStoreObject.programSelected !== "Select" || adhocStoreObject.tripTypeSelected !== "Select") {
                                            let data = this.typeCheck(adhocStoreObject);
                                            if (data) {
                                                adhocStoreObject.showTimePicker()
                                            } else {
                                                this.props.navigation.navigate("NonShiftTimeSelector", {
                                                    time: [
                                                        ..._.uniqWith(_.sortBy(adhocStoreObject.ProgramsDetails.Timings, o => o.FromTime),
                                                            _.isEqual
                                                        )
                                                    ],
                                                    selectedItem: adhocStoreObject.timeSelected,
                                                });
                                            }
                                        } else
                                            Alert.alert(this.state.title, alertMessage);
                                    }}
                                    style={{
                                        width: adhocStoreObject.rosterType === rosterType.drop ? "100%" : "50%"
                                    }}
                                >
                                    {_renderTitleContent(
                                        "Time",
                                        adhocStoreObject.timeSelected ? adhocStoreObject.timeSelected : "Select",
                                        adhocStoreObject.timeSelected
                                    )}
                                </TouchableDebounce>
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'column'
                                }}>
                                    <Text style={itemNameLabel}>PO Number</Text>
                                    <TextInput
                                        ref={ponoRef => {
                                            this.ponoRef = ponoRef;
                                        }}
                                        style={itemName}
                                        numberOfLines={1}
                                        returnKeyType="done"
                                        maxLength={50}
                                        onChangeText={text => this.onPONoChange(text)}
                                        value={this.state.pono}
                                    />
                                </View>
                            </View>
                            {/* {this._renderDateTime(adhocStoreObject)} */}
                            {/* <View style={line} /> */}
                            {Platform.OS === 'ios' ? adhocStoreObject.isTimePickerVisible &&
                                <DatePicker
                                    minuteInterval={5}
                                    options={options}
                                    mode="time"
                                    onTimeChange={selectedTime => {
                                        // let dates = moment(date, "YYYY/MM/DD").format("YYYY-MM-DD");
                                        this._handleTimePicked(selectedTime)
                                    }}
                                    style={{ borderRasdius: 10 }}
                                /> : <DateTimePicker
                                isVisible={adhocStoreObject.isTimePickerVisible}
                                onConfirm={this._handleTimePicked}
                                onCancel={this._hidePicker}
                                mode={"time"}
                                presentationStyle={"pageSheet"}
                                is24Hour={false}
                            />}
                            <View style={line} />
                            <View
                                style={{
                                    paddingLeft: 20,
                                    paddingRight: 20,
                                    paddingTop: 10,
                                    paddingBottom: 10,
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignContent: "center",
                                }}
                            >
                                <Text style={[itemNameLabel, { marginTop: 10 }]}>Security Escort</Text>
                                {this.state.securityEscot ? (
                                    <FontAwesome
                                    style={{
                                        marginRight: 5,
                                        marginTop: 5
                                    }}
                                    name={this.state.securityEscot ? "check-square-o" : "square-o"}
                                    size={30}
                                        onPress={() => {
                                            this.setState({ securityEscot: false });
                                        }}
                                    />
                                ) : (
                                    <FontAwesome
                                        style={{
                                            marginRight: 5,
                                            marginTop: 5
                                        }}
                                        name={this.state.securityEscot ? "check-square-o" : "square-o"}
                                        size={30}
                                        onPress={() => {
                                            this.setState({ securityEscot: true });
                                        }}
                                    />
                                )}
                            </View>
                            <View style={line} />
                            <View
                                style={{
                                    paddingLeft: 20,
                                    paddingRight: 20,
                                    paddingTop: 10,
                                    paddingBottom: 10,
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignContent: "center",
                                }}
                            >
                                <Text style={[itemNameLabel, { marginTop: 10 }]}>SEZ</Text>
                                {this.state.sez ? (
                                    <FontAwesome
                                    style={{
                                        marginRight: 5,
                                        marginTop: 5
                                    }}
                                    name={this.state.sez ? "check-square-o" : "square-o"}
                                    size={30}
                                        onPress={() => {
                                            this.setState({ sez: false });
                                        }}
                                    />
                                ) : (
                                    <FontAwesome
                                        style={{
                                            marginRight: 5,
                                            marginTop: 5
                                        }}
                                        name={this.state.sez ? "check-square-o" : "square-o"}
                                        size={30}
                                        onPress={() => {
                                            this.setState({ sez: true });
                                        }}
                                    />
                                )}
                            </View>
                            <View style={line} />
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
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'column'
                                }}>
                                    <Text style={itemNameLabel}>Overnight Charges</Text>
                                    <TextInput
                                        ref={onchargeRef => {
                                            this.onchargeRef = onchargeRef;
                                        }}
                                        style={itemName}
                                        numberOfLines={1}
                                        keyboardType="numeric"
                                        returnKeyType="done"
                                        maxLength={10}
                                        onChangeText={text => this.onONChargeChange(text)}
                                        value={this.state.oncharge}
                                    />
                                </View>
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'column'
                                }}>
                                    <Text style={itemNameLabel}>Day Allowance</Text>
                                    <TextInput
                                        ref={dayallowRef => {
                                            this.dayallowRef = dayallowRef;
                                        }}
                                        style={itemName}
                                        numberOfLines={1}
                                        keyboardType="numeric"
                                        returnKeyType="done"
                                        maxLength={10}
                                        onChangeText={text => this.onDayAllowChange(text)}
                                        value={this.state.dayallow}
                                    />
                                </View>
                            </View>
                            <View style={line} />
                            <View style={{
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                                paddingBottom: 10,
                                flex: 1,
                                flexDirection: 'column'
                            }}>
                                <Text style={itemNameLabel}>Admin Remarks</Text>
                                <TextInput
                                    ref={adminremarkRef => {
                                        this.adminremarkRef = adminremarkRef;
                                    }}
                                    style={itemName}
                                    numberOfLines={3}
                                    returnKeyType="done"
                                    maxLength={1000}
                                    onChangeText={text => this.onAdminRemarkChange(text)}
                                    value={this.state.adminremark}
                                />
                            </View>
                            <View style={line} />
                            <View style={{
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                                paddingBottom: 10,
                                flex: 1,
                                flexDirection: 'column'
                            }}>
                                <Text style={itemNameLabel}>Note to Driver</Text>
                                <TextInput
                                    ref={driverNoteRef => {
                                        this.driverNoteRef = driverNoteRef;
                                    }}
                                    style={itemName}
                                    numberOfLines={3}
                                    returnKeyType="done"
                                    maxLength={1000}
                                    onChangeText={text => this.onDriverNoteChange(text)}
                                    value={this.state.driverNote}
                                />
                            </View>
                            <View style={line} />
                            <View
                                style={{
                                    paddingLeft: 20,
                                    paddingRight: 20,
                                    paddingTop: 10,
                                    paddingBottom: 10,
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignContent: "center",
                                }}
                            >
                                <Text style={[itemNameLabel, { marginTop: 10 }]}>Traveller Details</Text>
                                <Button mode="outlined" onPress={() => {
                                    this.onAddPress()
                                }}>
                                    Add
                                </Button>
                            </View>
                            <View style={line} />
                            {/* <List.Section title="Employee Details" >  */}
                            {adhocStoreObject.Employees.map((employee, index) => (
                                <List.Accordion
                                    title={employee.EmployeeName + ' ' + employee.ContactNo}
                                    left={props => <List.Icon {...props} icon={employee.Gender === 'M' ? 'human-male' : 'human-female'} />}>
                                    <List.Item title={`EMP No : ${employee.EmployeeNumber}`} />
                                    <List.Item title={`Name : ${employee.EmployeeName}`} />
                                    <List.Item title={`Gender : ${employee.Gender == 'M' ? 'Male' : 'Female'}`} />
                                    <List.Item title={`Email : ${employee.Email}`} />
                                    <List.Item title={`Mobile : ${employee.ContactNo}`} />
                                    <List.Item title={`Alternate Mobile : ${employee.AlternateContactNo}`} />
                                    <List.Item title={`BU : ${employee.Business}`} />
                                    <List.Item title={`Sub BU : ${employee.SubBusiness}`} />
                                    <List.Item title={`Cost Center : ${employee.CostCenter}`} />
                                    <List.Item title={`Country : ${employee.Country}`} />
                                    <List.Item title={`Nationality : ${employee.Nationality}`} />
                                    <List.Item title={`Traveller Type : ${employee.TravellerType}`} />
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginRight: 10
                                        }}>
                                        <Button mode="outlined" onPress={() => {
                                            this.onEditPress(employee, index)
                                        }}>
                                            Edit
                                        </Button>
                                        <Text>|</Text>
                                        <Button mode="outlined" onPress={() => {
                                            this.onDeletePress(index)
                                        }}>
                                            Delete
                                        </Button>
                                    </View>
                                    <View style={[line, {marginTop: 5}]} />
                                </List.Accordion>
                            ))}
                        </View>
                    </ScrollView>
                    <TouchableDebounce
                        style={buttonStyle}
                        onPress={() => {
                            if (adhocStoreObject.isLoading) return;
                            if (adhocStoreObject.programSelected) {
                                adhocStoreObject.SaveTravelDesk(this.state).then(() => {
                                    if (adhocStoreObject.apiSuccess.Status === "200") {
                                        adhocStoreObject.resetStore();
                                        this.props.navigation.dispatch(StackActions.popToTop());
                                    }
                                });
                            } else {
                                Alert.alert(this.state.title, "Please select a program type");
                            }
                        }}
                    >
                        {adhocStoreObject.isLoading ? (
                            <ActivityIndicator color={colors.WHITE} animating={true} />
                        ) : (
                            <Text style={bottomButton}>
                                {(adhocStoreObject.programSelected != null && adhocStoreObject.programSelected.includes("Others"))
                                    ? "Search"
                                    : "Submit"}
                            </Text>
                        )}

                    </TouchableDebounce>
                </SafeAreaView>
            // </ViewLoader>
        );
    }

    onNameChange(value) {
        this.setState({ guestName: value });
    }

    onEmailChange(value) {
        this.setState({ guestEmail: value });
    }
    onMobileNumberChange(value) {
        this.setState({ contactNo: value });
    }
    onAlterContactChange(value) {
        this.setState({ alternateContactNo: value });
    }
    onPONoChange(value) {
        this.setState({ pono: value });
    }
    onONChargeChange(value) {
        this.setState({ oncharge: value });
    }
    onDayAllowChange(value) {
        this.setState({ dayallow: value });
    }
    onNationalityChange(adhocStoreObject, value) {
        adhocStoreObject.nationality = value;
        // this.setState({ nationality: value });
    }
    onDriverNoteChange(value) {
        this.setState({ driverNote: value });
    }
    onAdminRemarkChange(value) {
        this.setState({ adminremark: value });
    }

    searchFlexiCab(adhocStoreObject) {
        adhocStoreObject.searchFlexiCab().then(() => {
            if (adhocStoreObject.Cabs.length > 0) {
                this.showAvailableCabs(adhocStoreObject.Cabs);
            }
        })
    }

    showAvailableCabs(Cabs) {
        const { navigate } = this.props.navigation;
        navigate("GetFlexiCabs", {
            Cabs,
            refresh: this.searchFlexiCab.bind(this)
        });
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
            });
        } else {
            if (this.state.weeklyOffStateValue.length > 2) {
                this.stopLoader();
                Alert.alert(null, "Only 3 weekly off allowed");
                return;
            }
            this.setState({
                weeklyOffStateValue: [...this.state.weeklyOffStateValue, item],
            });
        }
    }


    _renderTripPurpose = (store) => {
        return (
            <View style={{ flex: 1, flexDirection: "row", }}>
                <TouchableDebounce
                    onPress={() => {
                        store.hideDateTimePicker();
                        if (store.programSelected === Select) {
                            Alert.alert(adhoc, "Please select the program");
                        } else {
                            this.props.navigation.navigate("TripPurpose", {
                                Purposes: store.TripPurpose,
                                adhoc: false,
                                selectedItem: store.tripPurposeSelected,
                                OnTripPurposeSelected: this.OnTripPurposeSelected.bind(this)
                            });
                        }
                    }}
                >
                    {_renderOffice(
                        "Trip Purpose",
                        store.tripPurposeSelected.hasOwnProperty('Purpose') ? store.tripPurposeSelected.Purpose : Select,
                        "",
                        ""
                    )}
                </TouchableDebounce>
            </View>
        );
    };

    OnTripPurposeSelected(purpose) {
        this.props.adhocStore.setTripPurpose(purpose);
    }
    stopLoader() {
        setTimeout(() => this.setState({isLoading: false}), 10);
    }



}

const line = {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: colors.GRAY
};
const buttonStyle = {
    width: "100%",
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    backgroundColor: colors.BLUE_BRIGHT,
    flexDirection: "row"
};
const dateStyle = {
    fontFamily: "Helvetica",
    fontSize: 20,
    textAlign: "left",
    color: colors.BLACK,
    marginLeft: 5,
    width: '100%'
};
const titleStyle = {
    fontFamily: "Helvetica",
    fontSize: 13,
    textAlign: "left",
    color: colors.GRAY
};
const bottomButton = {
    color: colors.WHITE,
    fontWeight: "500",
    fontSize: 20,
    marginLeft: 10
};
const viewContainer = {
    flex: 1,
    backgroundColor: colors.WHITE,
    flexDirection: "column"
};
const itemNameLabel = {
    fontFamily: "Helvetica",
    fontSize: 13,
    textAlign: "left",
    color: colors.GRAY
};

const itemName = {
    fontSize: 16,
    fontWeight: '500',
    color: colors.BLACK,
    // borderBottomWidth: 1,
    // borderBottomColor: colors.GRAY
};
export default TravelDesk;