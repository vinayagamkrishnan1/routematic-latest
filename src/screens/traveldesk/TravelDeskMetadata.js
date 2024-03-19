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
    TouchableOpacity,
    View
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    getDaysInMonth,
} from "../roster/customeComponent/RosterCustomFunctions";
import { colors } from "../../utils/Colors";
import { inject, observer } from "mobx-react";
import {
    _renderListInput,
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
import { options } from "../adhoc/AdhocLanding";
import { API } from "../../network/apiFetch/API";
import { URL } from "../../network/apiConstants";
import { TYPE } from "../../model/ActionType";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import { asyncString, Select } from "../../utils/ConstantString";
import { Button, List } from "react-native-paper";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";

const ViewLoader = HOC.LoaderHOC(View);
const moment = extendMoment(Moment);
const alertMessage = "Please Select Request type and Trip type";
const _ = require("lodash");

@inject("adhocStore")
@observer
class TravelDeskMetadata extends Component {

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
                    // paddingLeft: 20,
                    // paddingRight: 20,
                    // paddingTop: 10,
                    // paddingBottom: 10,
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    marginHorizontal: 16,
                    marginVertical: 8
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

    goToLocationPicker() {
        this.props.navigation.navigate("MapPicker", {
            getLocationPicker: this.getLocationPicker.bind(this),
            enableCurrentLocation: true,
            type: 'WP'
        });
    }

    getLocationPicker(selectedLocation, selectLat, selectLng, type) {
        let store = this.props.adhocStore;
        store.tdWayPoints.push({
            ID: 'N' + Math.floor(Math.random() * (1000 - 1 + 1) + 1),
            WayPointType: 'Others',
            WayPointName: selectedLocation,
            Latitude: selectLat,
            Longitude: selectLng,
            Remarks: 'WP'
        });
        this.setState({
            data: store.tdWayPoints,
        });
    }

    constructor(props) {
        super(props);
        this.state = ({
            title: "Travel Desk",
            weeklyOffStateValue: [],
            data: [] // ['Place 1', 'Place 2', 'Place 3', 'Place 4', 'Place 5', 'Place 6']
        });
    }

    _renderVehicleType(store) {
        return (
            <View style={{
                width: '48%'
                // marginHorizontal: 20,
                // marginVertical: 8
            }}>
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
                    {_renderListInput("Vehicle Type *", store.vehicleSelected)}
                </TouchableDebounce>
            </View>
        )
    }

    _renderVendor(store) {
        return (
            <View style={{
                width: '48%'
                // marginHorizontal: 20,
                // marginVertical: 8
            }}>
                <TouchableDebounce
                    onPress={() => {
                        if (store.programSelected !== "Select") {
                            store.hideDateTimePicker();
                            this.props.navigation.navigate("VendorSelector", {
                                selectedItem: store.vendorSelected,
                            });
                        } else {
                            Alert.alert(this.state.title, "Please select a program");
                        }
                    }}
                >
                    {_renderListInput("Vendor", store.vendorSelected)}
                </TouchableDebounce>
            </View>
        )
    }

    _renderRentalModel(store) {
        return (
            <View style={{
                marginHorizontal: 16,
                marginVertical: 8
            }}>
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
                    {_renderListInput("Rental Model", store.rentalModelSelected)}
                </TouchableDebounce>
            </View>
        )
    }

    componentDidMount() {
        // if (this.state.title.toString().length <= 0) {
        //     let title = this.props.route.params.title; // ", "Ad Hoc");
        //     this.setState({ title });
        // }
        this.props.adhocStore.tdWayPoints
        this.setState({data: this.props.adhocStore.tdWayPoints});
    }

    onAddPress = () => {
        console.warn('handle onAddPress');
        this.goToLocationPicker();
    }

    onDeletePress = (_wp) => {
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
                        // this.props.adhocStore.Employees.splice(_index, 1);
                        var data = this.state.data.filter(wp => wp.ID != _wp);
                        this.setState({data});
                        this.props.adhocStore.tdWayPoints = data;
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

                            <View style={{
                                flexDirection: 'row',
                                marginHorizontal: 20,
                                marginVertical: 8
                            }}>
                                <Text style={[inputLabel, {width: '30%'}]}>Trip Type</Text>
                                <Text style={[itemName, {width: '60%'}]}>{adhocStoreObject.tripSelected}</Text>
                            </View>
                            
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

                            {_renderWeeklyOff(
                                "Weekly Off",
                                this.state.weeklyOffStateValue,
                                this.addWeeklyOff.bind(this)
                            )}

                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginHorizontal: 20,
                                    marginVertical: 8
                                }}
                            >
                                <TouchableDebounce
                                    onPress={() => {
                                        if (adhocStoreObject.programSelected !== "Select" || adhocStoreObject.tripTypeSelected !== "Select") {
                                            adhocStoreObject.tripType = 'P';
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
                                        width: "50%"
                                    }}
                                >
                                    {_renderTitleContent(
                                        "Pickup Time *",
                                        adhocStoreObject.timeSelected ? adhocStoreObject.timeSelected : "Select",
                                        adhocStoreObject.timeSelected
                                    )}
                                </TouchableDebounce>

                                {adhocStoreObject.tripTypeSelected == "Outstation Round Trip" && (
                                    <TouchableDebounce
                                        onPress={() => {
                                            if (adhocStoreObject.programSelected !== "Select" || adhocStoreObject.tripTypeSelected !== "Select") {
                                                adhocStoreObject.tripType = 'D';
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
                                                        selectedItem: adhocStoreObject.timeToSelected,
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
                                            "Drop Time *",
                                            adhocStoreObject.timeToSelected ? adhocStoreObject.timeToSelected : "Select",
                                            adhocStoreObject.timeToSelected
                                        )}
                                    </TouchableDebounce>
                                )}
                            </View>
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

                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginHorizontal: 16,
                                marginVertical: 8,
                            }}>
                                {this._renderVehicleType(adhocStoreObject)}

                                {adhocStoreObject.Vendors?.length > 0 && (this._renderVendor(adhocStoreObject))}
                            </View>

                            {(adhocStoreObject.isRentalModelVisible && adhocStoreObject.tripTypeSelected == "Daily Rental")&& this._renderRentalModel(adhocStoreObject)}

                            {adhocStoreObject.ProgramsDetails?.AllowWayPoints && (
                                <View
                                    style={{
                                        marginHorizontal: 20,
                                        marginVertical: 8
                                    }}
                                >
                                    <Button 
                                    mode="outlined" 
                                    style={{
                                        borderRadius: 5,
                                        width: 150
                                    }}
                                    onPress={() => {
                                        this.onAddPress()
                                    }}>
                                        Add Stop
                                    </Button>
                                </View>
                            )}

                            <View
                                style={{
                                    marginHorizontal: 20,
                                    marginVertical: 8,
                                    marginBottom: 50
                                }}
                            >
                                <View
                                style={styles.row}
                                >
                                    {/* <Text style={[inputLabel, {width: '15%', padding: 5}]}>S.No</Text> */}
                                    <Text style={[inputLabel, {width: '84%', padding: 5}]}>Pickup/Drop</Text>
                                    <Text style={[inputLabel, {width: '16%', padding: 5}]}>Delete</Text>
                                </View>
                                <DraggableFlatList 
                                    data={this.state.data}
                                    onDragEnd={({ data }) => {
                                        console.warn('dragged data - ', data);
                                        adhocStoreObject.tdWayPoints = data
                                        this.setState({data});
                                    }}
                                    keyExtractor={(item) => item.ID}
                                    renderItem={this.renderItem.bind(this)}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <TouchableDebounce
                        style={buttonStyle}
                        onPress={() => {
                            if (adhocStoreObject.isLoading) return;

                            if (adhocStoreObject.dateSelected === Select) {
                                Alert.alert('Travel Desk', "Please select From Date");
                                return;
                            } else if (adhocStoreObject.dateToSelected === Select) {
                                Alert.alert('Travel Desk', "Please select To Date");
                                return;
                            } else if (adhocStoreObject.timeSelected === Select) {
                                Alert.alert('Travel Desk', "Please enter Pickup Time");
                                return;
                            } else if (moment(adhocStoreObject.dateToSelected, 'DD MMM YYYY').isBefore(moment(adhocStoreObject.dateSelected, 'DD MMM YYYY'))) {
                                Alert.alert('Travel Desk', "Please select valid To date");
                                return;
                            } else if (adhocStoreObject.vehicleSelected === Select) {
                                Alert.alert('Travel Desk', "Please select Vehicle Type");
                                return;
                            }

                            adhocStoreObject.weeklyOffStateValue = this.state.weeklyOffStateValue;
                            adhocStoreObject.getTravelTimeDistance();

                            this.props.navigation.navigate('TravelDeskReview');
                        }}
                    >
                        {adhocStoreObject.isLoading ? (
                            <ActivityIndicator color={colors.WHITE} animating={true} />
                        ) : (
                            <Text style={bottomButton}>NEXT</Text>
                        )}

                    </TouchableDebounce>
                </SafeAreaView>
        );
    }

    renderItem = ({ item, index, drag, isActive }) => { // : RenderItemParams<Item>
        return (
          <ScaleDecorator>
            <TouchableOpacity
              onLongPress={drag}
              disabled={isActive}
              style={[
                styles.row,
                { 
                    height: 'auto',
                    marginVertical: 1, 
                    borderStartWidth: 5,
                    borderStyle: Platform.OS == 'ios' ? 'solid' : 'dotted',
                    backgroundColor: isActive ? colors.GRAY : colors.WHITE 
                }
              ]}
            >
                {/* <Text style={[inputText, {width: '15%', padding: 5, textAlign: 'center'}]}>{index}</Text> */}
                <Text style={[inputText, {width: '84%', padding: 5}]}>{item.WayPointName}</Text>
                <View style={[inputText, {width: '16%', padding: 5, alignItems: 'center'}]}>
                    {item.Remarks == 'WP' && (
                        <TouchableOpacity
                        onPress={() => {
                            this.onDeletePress(item.ID)
                        }}
                        >
                        <MaterialCommunityIcons
                            name={"delete"}
                            size={25}
                            color={colors.BLACK}
                        />
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
          </ScaleDecorator>
        );
    };

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

    stopLoader() {
        setTimeout(() => this.setState({isLoading: false}), 10);
    }

}

const styles = StyleSheet.create({
    row: {
        width: '100%',
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.GRAY
    },
    text: {
      color: colors.BLACK,
      fontSize: 13,
      fontWeight: "bold",
      padding: 5
    },
});

const dateStyle = {
    fontFamily: "Helvetica",
    fontSize: 20,
    textAlign: "left",
    color: colors.BLACK,
    marginLeft: 5,
    width: '100%'
};

const line = {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 0.25,
    backgroundColor: colors.GRAY,
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

const titleStyle = {
    fontFamily: "Helvetica",
    fontSize: 16,
    fontWeight: '900',
    textAlign: "left",
    color: colors.BLACK,
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

const itemName = {
    fontSize: 16,
    fontWeight: '500',
    color: colors.BLACK,
    // borderBottomWidth: 1,
    // borderBottomColor: colors.GRAY
};

const inputLabel = {
    fontFamily: "Helvetica",
    fontSize: 13,
    textAlign: "left",
    color: colors.GRAY
};

const inputText = {
    fontFamily: "Helvetica",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "left",
    color: colors.BLACK,
    padding: 5
};

export default TravelDeskMetadata;