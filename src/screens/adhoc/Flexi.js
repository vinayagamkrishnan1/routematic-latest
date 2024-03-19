import React, {Component} from "react";
import {Box, Text,} from "native-base";
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
    _renderTitleContent,
} from "../roster/customeComponent/customComponent";
import Moment from "moment";
import {extendMoment} from "moment-range";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "react-native-modal-datetime-picker";
import * as Toast from "../../utils/Toast";
import {StackActions} from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DatePicker from "react-native-modern-datepicker";
import {options} from "./AdhocLanding";

const ViewLoader = HOC.LoaderHOC(View);
const moment = extendMoment(Moment);
const alertMessage = "Please Select Request type and Trip type";
const _ = require("lodash");

export const flexiType = {
    login: "Login",
    logout: "Logout",
    nonShift: "Non Shift"
};



@inject("adhocStore")
@observer
class Flexi extends Component {

    static navigationOptions = ({navigation}) => {
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
                        if (store.programSelected.includes("Others")) {
                            console.warn("tripTypeSelected "+store.tripTypeSelected);
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
                        }
                    }}
                >
                    {this._renderTitleContent(
                        "From Location",
                        store.programSelected.includes("Others")
                            ? store.tripTypeSelected === flexiType.login
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
                        if (store.programSelected && store.programSelected.includes("Others")) {
                            if (store.tripTypeSelected === flexiType.logout) {
                                let StaffLocations = store.FlexiDetails.StaffLocations;
                                if (StaffLocations.length > 0)
                                    this.props.navigation.navigate("MapPicker", {
                                        returnData: this.returnData.bind(this),
                                        StaffLocations,
                                        showNodalPoint: true
                                    });

                            } else if (store.tripTypeSelected === flexiType.login) {
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
                        }
                    }}
                >
                    {this._renderTitleContent(
                        "To Location",
                        store.programSelected.includes("Others")
                            ? store.tripTypeSelected === flexiType.logout
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
                                console.warn("Data " + JSON.stringify(data));
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
                            width: "50%"
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
        }if(Platform.OS==='android'){
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
            isFlexi: true,
            type:flexiType.login
        });
        this.props.adhocStore.setInitAdhoc(this,true,flexiType.login);
    }

    returnData(StaffLocations) {
        this.props.adhocStore.StaffLocations = StaffLocations;
    }

    onFromValueChange(value: string) {
        this.props.adhocStore.setFromSelected(value);
        if (value === "Others") {
            this.goToLocationPicker("from");
        }
    }

    onToValueChange(value: string) {
        this.props.adhocStore.setToSelected(value);
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
        this.willFocusSubscription = this.props.navigation.addListener(
            'focus',
            () => {
                if(this.state.type===flexiType.nonShift) {
                    this.setState({type: flexiType.login});
                    this.props.adhocStore.setInitAdhoc(this,true,flexiType.login);
                }
            }
        );
    }

    componentWillUnmount() {
        // this.willFocusSubscription.remove();
    }

    _renderFlexiType = (store) => {
        return (
            <View
                style={{
                    height: 50,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10
                }}>
                <Box
                    style={{
                        flexDirection: "row",
                        borderRadius: 20,
                        justifyContent: "space-between",
                        marginLeft: 40,
                        marginRight: 40
                    }}
                >
                    <TouchableDebounce
                        style={
                            this.state.type === flexiType.login
                                ? [viewSelectedStyle, {flexDirection: "row", width: 100}]
                                : {
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginLeft: 15,
                                    width: 80
                                }
                        }
                        onPress={() => {
                            this.setState({type: flexiType.login, selectedValue: undefined});
                            this.props.adhocStore.setInitAdhoc(this,true,flexiType.login);
                        }}
                    >
                        {this.state.type === flexiType.login && (
                            <Ionicons
                                name={"ios-checkmark-circle"}
                                style={{
                                    color: this.state.type === flexiType.login
                                        ? colors.WHITE
                                        : colors.BLACK
                                }}
                                size={20}
                            />
                        )}
                        <Text
                            style={{
                                color: this.state.type === flexiType.login
                                    ? colors.WHITE
                                    : colors.BLACK,
                                marginLeft: 12,
                                fontWeight: 'bold'
                            }}
                        >
                            {flexiType.login}
                        </Text>
                    </TouchableDebounce>

                    <TouchableDebounce
                        style={
                            this.state.type === flexiType.logout
                                ? [viewSelectedStyle, {flexDirection: "row", width: 100}]
                                : {justifyContent: "center", alignItems: "center", marginLeft: 8, marginRight: 8}
                        }
                        onPress={() => {
                            this.setState({type: flexiType.logout, selectedValue: undefined});
                            this.props.adhocStore.setInitAdhoc(this,true,flexiType.logout);

                        }}
                    >
                        {this.state.type === flexiType.logout && (
                            <Ionicons
                                name={"ios-checkmark-circle"}
                                style={{
                                    color:
                                        this.state.type === flexiType.logout
                                            ? colors.WHITE
                                            : colors.BLACK
                                }}
                                size={20}
                            />
                        )}
                        <Text
                            style={{
                                color:
                                    this.state.type === flexiType.logout
                                        ? colors.WHITE
                                        : colors.BLACK,
                                marginLeft: 10,
                                marginRight: 10,
                                alignSelf: "center",
                                fontWeight: 'bold'
                            }}
                        >
                            {flexiType.logout}
                        </Text>
                    </TouchableDebounce>

                    <TouchableDebounce
                        style={
                            this.state.type === flexiType.nonShift
                                ? [viewSelectedStyle, {flexDirection: "row", width: 110}]
                                : {
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginRight: 10,
                                    width: 100
                                }
                        }
                        onPress={() => {
                            this.setState({type: flexiType.nonShift, selectedValue: undefined});
                            store.resetStore();
                            this.props.navigation.navigate("Adhoc",{
                                title:"Non Shift Adhoc"
                            });

                        }}
                    >
                        {this.state.type === flexiType.nonShift && (
                            <Ionicons
                                name={"ios-checkmark-circle"}
                                style={{
                                    color:
                                        this.state.type === flexiType.nonShift
                                            ? colors.WHITE
                                            : colors.BLACK
                                }}
                                size={20}
                            />
                        )}
                        <Text
                            style={{
                                color:
                                    this.state.type === flexiType.nonShift
                                        ? colors.WHITE
                                        : colors.BLACK,
                                marginLeft: 12,
                                fontWeight: 'bold'
                            }}
                        >
                            {flexiType.nonShift}
                        </Text>
                    </TouchableDebounce>
                </Box>
            </View>
        );
    };

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
                            {this._renderFlexiType(adhocStoreObject)}
                            <View style={{marginTop: 30}}/>
                            {this._renderSource(adhocStoreObject)}
                            <View style={line}/>
                            {this._renderDestination(adhocStoreObject)}
                            <View style={line}/>
                            {this._renderDateTime(adhocStoreObject)}
                            <View style={line}/>

                            {Platform.OS === 'ios' ?this.state.type!==flexiType.nonShift  &&  adhocStoreObject.isDatePickerVisible &&
                                <DatePicker
                                    options={options}
                                    minimumDate={moment().format()}
                                    maximumDate={moment(new Date()).add(30, 'days').format("YYYY-MM-DD")}
                                    mode="calendar"
                                    onSelectedChange={date => {
                                        let dates = moment(date, "YYYY/MM/DD").format("YYYY-MM-DD");
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

                            {Platform.OS === 'ios' ? this.state.type!==flexiType.nonShift  && adhocStoreObject.isTimePickerVisible &&
                                <DatePicker
                                    minuteInterval={3}
                                    options={options}
                                    mode="time"
                                    onTimeChange={selectedTime => {
                                        // let dates = moment(date, "YYYY/MM/DD").format("YYYY-MM-DD");
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
                            {/*<DateTimePicker
                                isVisible={this.state.type!==flexiType.nonShift && adhocStoreObject.isDatePickerVisible}
                                onConfirm={this._handleDatePicked}
                                onCancel={this._hidePicker}
                                mode={"date"}
                                is24Hour={false}
                                minimumDate={adhocStoreObject.minDateAllowed}
                            />
                            <DateTimePicker
                                isVisible={this.state.type!==flexiType.nonShift &&  adhocStoreObject.isTimePickerVisible}
                                onConfirm={this._handleTimePicked}
                                onCancel={this._hidePicker}
                                mode={"time"}
                                is24Hour={false}
                            />*/}
                        </View>
                    </ScrollView>
                    <TouchableDebounce
                        style={buttonStyle}
                        onPress={() => {
                            if (adhocStoreObject.isLoading) return;
                            if (adhocStoreObject.programSelected) {
                                (adhocStoreObject.programSelected != null && adhocStoreObject.programSelected.includes("Others"))
                                    ? this.searchFlexiCab()
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

    searchFlexiCab() {
        let store = this.props.adhocStore;
        store.searchFlexiCab().then(()=>{
            if(store.Cabs.length>0){
                this.showAvailableCabs(store.Cabs);
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


}
const viewSelectedStyle = {
    borderRadius: 30,
    width: 90,
    padding: 5,
    backgroundColor: colors.BLUE_BRIGHT,
    margin: 5,
    justifyContent: "center",
    alignItems: "center"
};
const viewNotSelectedStyle = {
    width: 60,
    padding: 5,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 30,
    borderColor: colors.GRAY,
    borderStyle: "solid",
    flexDirection: "row"

};
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
    marginLeft: 5,
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
export default Flexi;