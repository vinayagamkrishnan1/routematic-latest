import React, {Component} from "react";
import {Text,} from "native-base";
import {
    ActivityIndicator,
    Alert,
    PanResponder,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    View
} from 'react-native';
import {colors} from "../../utils/Colors";
import {inject, observer} from "mobx-react";
import * as HOC from "../../components/hoc";
import TouchableDebounce from "../../utils/TouchableDebounce";
import {
    _renderDate,
    _renderOffice,
    _renderTitleContent
} from "../roster/customeComponent/customComponent";
import {rosterType} from "../roster/customeComponent/RosterType";
import Moment from "moment";
import {extendMoment} from "moment-range";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "react-native-modal-datetime-picker";
import * as Toast from "../../utils/Toast";
import {StackActions} from "@react-navigation/native";
import {adhoc} from "../../stores/modifiedAdHocStore";
import DatePicker from "react-native-modern-datepicker";
import {adhocType, options} from "./AdhocLanding";
import { Select } from "../../utils/ConstantString";
import { Button } from "react-native-paper";

const ViewLoader = HOC.LoaderHOC(View);
const moment = extendMoment(Moment);
const alertMessage = "Please Select Request type and Trip type";
const _ = require("lodash");

@inject("adhocStore")
@observer
class Adhoc extends Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: '' // navigation.getParam("title"),
        };
    };

    _renderAdhocType (store) {
        return (
            <View style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 10,
                }}>
                    <View style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginHorizontal: 16
                    }}>
                        <Button 
                        mode="contained"
                        style={{
                            flex: 0.5,
                            borderRadius: 5,
                            marginRight: 5
                        }} 
                        buttonColor={this.state.type === adhocType.login ? colors.BLUE : colors.GRAY_1} 
                        onPress={() => {
                            // this.setState({ type: adhocType.login, selectedValue: undefined });
                            store.setTripType(adhocType.login);
                            this.props.navigation.replace("AdhocLanding", {
                                title: "Adhoc",
                                type: adhocType.login
                            });
                        }}
                        uppercase>
                            <Text style={{
                                fontSize: 10,
                                fontWeight: '900',
                                color: this.state.type === adhocType.login ? colors.WHITE : colors.BLACK
                            }}>{adhocType.login}</Text>
                        </Button>
                        <Button 
                        mode="contained"
                        style={{
                            flex: 0.5,
                            borderRadius: 5,
                            marginLeft: 5
                        }} 
                        buttonColor={this.state.type === adhocType.logout ? colors.BLUE : colors.GRAY_1} 
                        onPress={() => {
                            // this.setState({ type: adhocType.logout, selectedValue: undefined });
                            store.setTripType(adhocType.logout);
                            this.props.navigation.replace("AdhocLanding", {
                                title: "Adhoc",
                                type: adhocType.logout
                            });
                        }}
                        uppercase>
                            <Text style={{
                                fontSize: 10,
                                fontWeight: '900',
                                color: this.state.type === adhocType.logout ? colors.WHITE : colors.BLACK
                            }}>{adhocType.logout}</Text>
                        </Button>
                    </View>

                    <View style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 10,
                        marginHorizontal: 16
                    }}>
                        <Button 
                        mode="contained"
                        style={{
                            flex: 0.5,
                            borderRadius: 5,
                            marginRight: 5
                        }} 
                        buttonColor={this.state.type === adhocType.nonShift ? colors.BLUE : colors.GRAY_1} 
                        onPress={() => {
                            // this.setState({ type: adhocType.nonShift, selectedValue: undefined });
                            // store.setTripType(adhocType.nonShift);
                            // this.props.navigation.navigate("Adhoc", {
                            //     title: "Non Shift Adhoc"
                            // });
                        }}
                        uppercase>
                            <Text style={{
                                fontSize: 10,
                                fontWeight: '900',
                                color: this.state.type === adhocType.nonShift ? colors.WHITE : colors.BLACK
                            }}>{adhocType.nonShift}</Text>
                        </Button>
                        <Button 
                        mode="contained"
                        style={{
                            flex: 0.5,
                            borderRadius: 5,
                            marginLeft: 5
                        }} 
                        buttonColor={this.state.type === adhocType.travelDesk ? colors.BLUE : colors.GRAY_1} 
                        onPress={() => {
                            this.setState({ type: adhocType.travelDesk, selectedValue: undefined });
                            store.setTripType(adhocType.travelDesk);
                            this.props.navigation.replace("TravelDeskSite", {
                                title: "Travel Request"
                            });
                        }}
                        uppercase>
                            <Text style={{
                                fontSize: 10,
                                fontWeight: '900',
                                color: this.state.type === adhocType.travelDesk ? colors.WHITE : colors.BLACK
                            }}>{adhocType.travelDesk}</Text>
                        </Button>
                    </View>
            </View>
        )
    }

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
                            if (store.programSelected === "Select" || store.tripTypeSelected === "Select") {
                                Alert.alert(this.state.title, alertMessage);
                            } else {
                                let body = [];
                                if (store.fromAddressID) {
                                    body = [{
                                        LocationCode: store.fromAddressID,
                                        LocationName: store.fromSelectedLocation,
                                        LocationType: "S",
                                        GeoLocation: store.fromSelectLat + "," + store.fromSelectLng
                                    }];
                                }
                                let filteredLocations = [];
                                let homeFilter = [];
                                if (store.ProgramsDetails.SourceLocationHome === 0) {
                                    homeFilter = store.SourceLocations.filter(location => location.LocationCode !== "H");
                                } else {
                                    homeFilter = store.SourceLocations;
                                }
                                let office = [];
                                if (store.ProgramsDetails.SourceLocationOffice === 0) {
                                    office = homeFilter.filter(location =>
                                        location.LocationCode === "H" || location.LocationCode === "0"
                                    );
                                } else {
                                    office = homeFilter;
                                }
                                if (store.ProgramsDetails.SourceLocationOthers === 0) {
                                    filteredLocations = office.filter(location => location.LocationCode !== "0");
                                } else {
                                    filteredLocations = office;
                                }
                                let newDate = [
                                    ...body,
                                    ...filteredLocations
                                ];
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
                        "Pickup From",
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
                                            LocationCode: this.state.toAddressID,
                                            LocationName: this.state.toSelectedLocation,
                                            LocationType: "D",
                                            GeoLocation: this.state.toSelectLat + "," + this.state.toSelectLng
                                        }
                                    ];
                                }

                                let filteredLocations = [];
                                let homeFilter = [];
                                if (store.ProgramsDetails.DestinationLocationHome === 0) {
                                    homeFilter = store.DestinationLocations.filter(
                                        location => location.LocationCode !== "H"
                                    );
                                } else {
                                    homeFilter = store.DestinationLocations;
                                }
                                let office = [];
                                if (store.ProgramsDetails.DestinationLocationOffice === 0) {
                                    office = homeFilter.filter(
                                        location =>
                                            location.LocationCode === "H" || location.LocationCode === "0"
                                    );
                                } else {
                                    office = homeFilter;
                                }
                                if (store.ProgramsDetails.DestinationLocationOthers === 0) {
                                    filteredLocations = office.filter(
                                        location => location.LocationCode !== "0"
                                    );
                                } else {
                                    filteredLocations = office;
                                }

                                let newDate = [
                                    ...body,
                                    ...filteredLocations //responseGetProgramDetailsORresponseGetFlexiDetailsArray.Locations
                                ];
                                const Locations = _.uniqBy(newDate, "LocationName");
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
                        "Destination",
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
        console.warn('store.dateSelected -- ', store.dateSelected);
        if (moment(store.dateSelected) !== "Invalid date") {
            console.warn('Valid dates inside');
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
        console.warn('date, day, monthYear- ', date, day, monthYear);
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
                    style={{width: "50%"}}
                >
                    {_renderDate(
                        "Date",
                        date === "Invalid date" ? "Select" : date,
                        monthYear === "Invalid date" ? "" : monthYear,
                        day === "Invalid date" ? "" : day
                    )}
                </TouchableDebounce>
                {
                    <TouchableDebounce
                        onPress={() => {
                            if (store.programSelected !== "Select" || store.tripTypeSelected !== "Select") {
                                let data = this.typeCheck(store);
                                if (data) {
                                    store.showTimePicker()
                                } else {
                                    this.props.navigation.navigate("NonShiftTimeSelector", {
                                        time: [
                                            ..._.uniqWith(_.sortBy(store.ProgramsDetails.Timings, o => o.FromTime),
                                                _.isEqual
                                            )
                                        ],
                                        selectedItem: store.timeSelected,
                                    });
                                }
                            } else
                                Alert.alert(this.state.title, alertMessage);
                        }}
                        style={{
                            width: store.rosterType === rosterType.drop ? "100%" : "50%"
                        }}
                    >
                        {_renderTitleContent(
                            "Time",
                            store.timeSelected ? store.timeSelected : "Select",
                            store.timeSelected
                        )}
                    </TouchableDebounce>
                }
            </View>
        );
    };

    _renderLineManger = (store) => {
        return (
            <View>
                <View style={line}/>
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
                        disabled={store.ProgramsDetails.LineManagerEmails.length<=1}
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
                <View style={line}/>
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
                            this.props.navigation.navigate("CostCenterSelector", {
                                selectedValue: store.selectedCostCenter,
                            });
                        }}
                    >
                        {this._renderTitleContent(
                            "Cost Center",
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
            <View style={{flexDirection: "column", width: "90%"}}>
                <Text style={[titleStyle, {marginLeft: 3}]}>{title}</Text>
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
        let _date = moment(date, "YYYY/MM/DD").format("YYYY-MM-DD");
        this.props.adhocStore.handleDatePicked(_date);
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
        if(Platform.OS==='android'){
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
            type: adhocType.nonShift,
            isFlexi: true
        });
        this.props.adhocStore.setInitAdhoc(this);
    }

    _renderProgramTripType(store) {
        return (
            <View style={{flex: 1, flexDirection: "row",}}>
                <TouchableDebounce
                    style={{flex: 0.45}}
                    onPress={() => {
                        store.hideDateTimePicker();
                        this.props.navigation.navigate("ProgramSelector", {
                            selectedItem: store.programSelected,
                        });
                    }}
                >
                    {_renderOffice("Request Type", store.programSelected)}
                </TouchableDebounce>
                <TouchableDebounce
                    style={{flex: 0.55}}
                    onPress={() => {
                        if(store.programSelected!=="Select") {
                            store.hideDateTimePicker();
                            this.props.navigation.navigate("TripTypeSelector", {
                                selectedItem: store.tripTypeSelected,
                            });
                        }else{
                            Alert.alert(this.state.title, "Please select a request type");
                        }
                    }}
                >
                    {_renderOffice("Trip Type ", store.tripTypeSelected)}
                </TouchableDebounce>
            </View>)
    }

    returnData(StaffLocations) {
        this.props.adhocStore.StaffLocations = StaffLocations;
    }

    onFromValueChange(value: string) {
        this.props.adhocStore.setFromSelected(value);
        this.props.adhocStore.hideDateTimePicker();
        if (value === "Others") {
            this.goToLocationPicker("from");
        }

    }

    onToValueChange(value: string) {
        this.props.adhocStore.setToSelected(value);
        this.props.adhocStore.hideDateTimePicker();
        if (value === "Others") {
            this.goToLocationPicker("to");
        }
    }

    goToLocationPicker(type) {
        if (this.props.adhocStore.ProgramsDetails.TDValidation.hasOwnProperty("TransportDistance")) {
            let TDValidation = this.props.adhocStore.ProgramsDetails.TDValidation;
            this.props.navigation.navigate("MapPicker", {
                getLocationPicker: this.getLocationPicker.bind(this),
                clusterDetails: {
                    Clusterlat: TDValidation.OfficeLatitude,
                    Clusterlng: TDValidation.OfficeLongitude,
                    Clusterradius: TDValidation.TransportDistance,
                    ClusterOutOfRadiusMsg: this.props.adhocStore.ProgramsDetails.TDValidation.Message
                },
                enableCurrentLocation: false,
                type: type
            });
        } else {
            this.props.navigation.navigate("MapPicker", {
                getLocationPicker: this.getLocationPicker.bind(this),
                type: type
            });
        }
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
        store.savePOILocation(body, type,selectedLocation);
    }

    componentDidMount() {
        if (this.state.title.toString().length <= 0) {
            let title = this.props.route.params.title; // ", "Ad Hoc");
            this.setState({title});
        }
        this.setState({ type: adhocType.nonShift });
        this.props.adhocStore.setTripType(adhocType.nonShift);
    }

    render() {
        const adhocStoreObject = this.props.adhocStore;
        return (
            // <ViewLoader spinner={this.props.adhocStore.isLoading} style={{flex: 1}}>
                <SafeAreaView
                    style={{flex: 1, backgroundColor: colors.WHITE, paddingTop: Platform.OS === 'ios' ? 20 : 0}}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.BLUE}
                        barStyle="dark-content"
                    />
                    <ScrollView style={{marginBottom: 50}}>
                        <View
                            style={viewContainer}
                        >
                            {this._renderAdhocType(adhocStoreObject)}

                            <View style={{marginTop: 30}}/>

                            {this._renderProgramTripType(adhocStoreObject)}
                            <View style={line}/>
                            {this._renderSource(adhocStoreObject)}
                            <View style={line}/>
                            {this._renderDestination(adhocStoreObject)}
                            <View style={line}/>
                            {this._renderDateTime(adhocStoreObject)}
                            {adhocStoreObject.isTripPurposeVisible() &&<View style={line}/>}
                            {adhocStoreObject.isTripPurposeVisible() && this._renderTripPurpose(adhocStoreObject)}
                            {adhocStoreObject.isTripPurposeVisible() && <View style={line}/>}
                            {adhocStoreObject.isCostCenterVisible() && this._renderCostCenter(adhocStoreObject)}
                            {adhocStoreObject.isLineManagerVisible() && this._renderLineManger(adhocStoreObject)}
                            <View style={line}/>
                            {Platform.OS === 'ios' ? adhocStoreObject.isDatePickerVisible &&
                                <DatePicker
                                    options={options}
                                    minimumDate={moment().format()}
                                    maximumDate={moment(new Date()).add(30, 'days').format("YYYY-MM-DD")}
                                    mode="calendar"
                                    onSelectedChange={date => {
                                        this._handleDatePicked(date)
                                    }}
                                    style={{borderRasdius: 10}}
                                /> : <DateTimePicker
                                isVisible={adhocStoreObject.isDatePickerVisible}
                                onConfirm={this._handleDatePicked}
                                onCancel={this._hidePicker}
                                mode={"date"}
                                is24Hour={false}
                                presentationStyle={"pageSheet"}
                                minimumDate={adhocStoreObject.minDateAllowed}
                            />}

                            {Platform.OS === 'ios' ? adhocStoreObject.isTimePickerVisible &&
                                <DatePicker
                                    minuteInterval={3}
                                    options={options}
                                    mode="time"
                                    onTimeChange={selectedTime => {
                                        this._handleTimePicked(selectedTime)
                                    }}
                                    style={{borderRasdius: 10}}
                                /> : <DateTimePicker
                                isVisible={adhocStoreObject.isTimePickerVisible}
                                onConfirm={this._handleTimePicked}
                                onCancel={this._hidePicker}
                                mode={"time"}
                                presentationStyle={"pageSheet"}
                                is24Hour={false}
                            />}
                        </View>
                    </ScrollView>
                    <TouchableDebounce
                        style={buttonStyle}
                        onPress={() => {
                            if (adhocStoreObject.isLoading) return;
                            if (adhocStoreObject.programSelected) {
                                (adhocStoreObject.programSelected != null && adhocStoreObject.programSelected.includes("Others"))
                                    ? this.searchFlexiCab(adhocStoreObject)
                                    : adhocStoreObject.SaveAdhoc(this.state.title).then(()=>{
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
                            <ActivityIndicator color={colors.WHITE} animating={true}/>
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

    searchFlexiCab(adhocStoreObject) {
        adhocStoreObject.searchFlexiCab().then(()=>{
            if(adhocStoreObject.Cabs.length>0){
                this.showAvailableCabs(adhocStoreObject.Cabs);
            }
        })
    }

    showAvailableCabs(Cabs) {
        const {navigate} = this.props.navigation;
        navigate("GetFlexiCabs", {
            Cabs,
            refresh: this.searchFlexiCab.bind(this)
        });
    }

    _renderTripPurpose = (store) => {
        return (
            <View style={{flex: 1, flexDirection: "row",}}>
                <TouchableDebounce
                    onPress={() => {
                        store.hideDateTimePicker();
                        if (store.programSelected === Select) {
                            Alert.alert(adhoc, "Please select the program");
                        }  else {
                            this.props.navigation.navigate("TripPurpose",{
                                Purposes:store.TripPurpose,
                                adhoc:false,
                                selectedItem:store.tripPurposeSelected,
                                OnTripPurposeSelected:this.OnTripPurposeSelected.bind(this)
                            });
                        }
                    }}
                >
                    {_renderOffice(
                        "Trip Purpose",
                        store.tripPurposeSelected.hasOwnProperty('Purpose')?store.tripPurposeSelected.Purpose:Select,
                        "",
                        ""
                    )}
                </TouchableDebounce>
            </View>
        );
    };

    OnTripPurposeSelected(purpose){
        this.props.adhocStore.setTripPurpose(purpose);
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
    height: 50,
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
    marginLeft: 5
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
export default Adhoc;