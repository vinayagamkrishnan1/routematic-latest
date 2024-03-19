import React, { Component } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Text,
    View,
    Alert,

} from "react-native";
import DateTimePicker from "react-native-modal-datetime-picker";
import * as AlertMsg from "../../utils/Alert";
import Moment from "moment";
import moment from "moment";
import { colors } from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { URL } from "../../network/apiConstants";
import { API } from "../../network/apiFetch/API";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { TYPE } from "../../model/ActionType";
import DatePicker from 'react-native-modern-datepicker';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import available_seat from "../../assets/available_seat.png";
import selected_seat from "../../assets/selected_seat.png";
import unavailable_seat from "../../assets/unavailable_seat.png";
import driver_seat from "../../assets/driver_seat.png";
import physicallychallange_seat from "../../assets/pc_seat.png";
import pregnentlady_seat from "../../assets/pl_seat.png";

import Tooltip from 'rn-tooltip';
import { Button } from "native-base";

const shiftTime = "Shift Time";
const category = "Category";
const option = {
    backgroundColor: '#FFFFFF',
    textHeaderColor: '#127CBF',
    textDefaultColor: '#127CBF',
    selectedTextColor: '#FFFFFF',
    mainColor: '#127CBF',
    textSecondaryColor: '#36C090',
    borderColor: 'rgba(122, 146, 165, 0.1)',
};

class SeatBooking extends Component {

    state = {
        isLoading: false,
        showPop: false,
        showTimePop: false,
        selectedOption: "",
        isDatePickerVisible: false,
        dateSelected: "Select",
        selectedShiftTime: "Select",
        selectedShiftId: "",
        selectedRouteId: "",
        selectedPassId: "",
        selectedSeatId: '',
        passes: {},
        shiftTimes: '',
        seatLayout: "",
        bookedSeats: [],
        advanceSeatBooking: 0,
        recentAvailableDate: ''
    };
    callback = async (actionType, response, copyDataObj) => {
        switch (actionType) {
            case TYPE.GENERATE_BUS_TICKET: {

                handleResponse.generateBusTickets(
                    response,
                    this
                );
                break;
            }
            case TYPE.GET_SEAT_LAYOUT: {
                handleResponse.getSeatLayout(this, response);
                break;
            }

        }
    };

    UNSAFE_componentWillMount() {
        if (this.props.route.params) {
            console.warn("times" + JSON.stringify(this.props.route.params.shiftTimes))
            this.setState({
                shiftTimes: this.props.route.params.shiftTimes,
                selectedRouteId: this.props.route.params.fixRouteId,
                selectedShiftTime: this.props.route.params.selectedShiftTime,
                passes: this.props.route.params.passes,
                selectedShiftId: this.props.route.params.selectedShiftId,
                advanceSeatBooking: this.props.route.params.advanceSeatBooking
            }, () => {
                this.getRecentAvailableDateFromPass();

            })
        }
    }

    getSeatLayout() {
        this.setState({
            selectedSeatId: '',
            seatLayout: "",
            bookedSeats: []
        })
        console.warn("shiftDate" + this.state.dateSelected)
        let url = URL.GET_SEAT_LAYOUT + "?routeId=" + this.state.selectedRouteId + "&shiftId=" + this.state.selectedShiftId + "&shiftTime=" + encodeURIComponent(this.state.dateSelected + "T" + this.state.selectedShiftTime + ":00+05:30");
        API.newFetchXJSON(
            url,
            true,
            this.callback.bind(this),
            TYPE.GET_SEAT_LAYOUT
        );
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: "Book Seat",

            // headerRight: (
            //     <Tooltip 
            //     backgroundColor="grey"
            //     pointerColor="white"
            //     // highlightColor="black"
            //      popover={
            //     <View style={{backgroundColor:'white',height:50, flexDirection:'row'}}>
            //         <View style={{flexDirection:'column',margin:10}}>
            //             <Image
            //                 style={{ height: 20, width: 20, margin : 5,alignSelf:"center"}}
            //                 source={available_seat}
            //             />
            //             <Text>Available</Text>
            //         </View>
            //         <View style={{flexDirection:'column',margin:10}}>
            //             <Image
            //                 style={{ height: 20, width: 20, margin : 5,alignSelf:"center"}}
            //                 source={selected_seat}
            //             />
            //             <Text>Selected</Text>
            //         </View>
            //         <View style={{flexDirection:'column',margin:10}}>
            //             <Image
            //                 style={{ height: 20, width: 20, margin : 5,alignSelf:"center"}}
            //                 source={unavailable_seat}
            //             />
            //             <Text>Booked</Text>
            //         </View>
            //     </View>


            //     }>
            //         <View style={{flexDirection:'column',marginRight : 10, alignItems:"center"}}>
            //         <Image
            //             style={{ height: 20, width: 20, alignSelf:"center"}}
            //             source={available_seat}
            //         />
            //         <Text style={{fontSize:12, color:"#127CBF"}}>Info</Text>
            //         </View>
            //       </Tooltip>

            //   )


            //headerStyle: { display: "none" }
        };
    };

    toggleDatePicker() {
        if (!this.state.isDatePickerVisible) {
            this.setState({ isDatePickerVisible: true });
        } else {
            this.setState({ isDatePickerVisible: false });
        }
    }

    toggleModalVisible(type) {
        if (!this.state.showPop)
            this.setState({ showPop: true, selectedOption: type });
        else this.setState({ showPop: false });
    }

    componentDidMount() {

    }

    _renderRightArrow() {
        return (
            <FontAwesome
                name="chevron-right"
                style={{
                    fontSize: 20,
                    marginRight: 20,

                    color: colors.GRAY,
                    fontFamily: "Helvetica",
                    right: 0,
                    position: "absolute"
                }}
                onPress={() => {
                    setTimeout(() => this.setState({ showTimePop: false }), 0);
                }}
            />
        );
    }

    render() {
        let mainData = (this.state.seatLayout && this.state.seatLayout.length > 0) ? [JSON.parse(this.state.seatLayout)] : [];

        let seatArray1 = [];
        let seatArray2 = [];
        let seatArray3 = [];
        let dummyArry = [];
        let leftsideSeats = [];
        let rightsideSeats = [];
        let driverArray = [];

        console.warn("data" + JSON.stringify(mainData))
        if (mainData.length > 0) {

            var rowdiff = mainData[0].leftside.rows - mainData[0].rightside.rows;
            console.warn('Row diff -> ', rowdiff);

            if (rowdiff != 0) {
                if (rowdiff < 0) {
                    rowdiff = rowdiff * -1;
                    console.warn('Left empty add');
                    for (let lr = 0; lr < rowdiff; lr++) {
                        for (let i = 0; i < mainData[0].leftside.columns; i++) {
                            leftsideSeats.push({id:0, isAvailable: false, type: 'empty', row: lr, col: i});
                        }
                    }
                    
                } else {
                    console.warn('Right empty add');
                    for (let rr = 0; rr < rowdiff; rr++) {
                        for (let i = 0; i < mainData[0].rightside.columns; i++) {
                            rightsideSeats.push({id:0, isAvailable: false, type: 'empty', row: rr, col: i});
                        }
                    }
                }
            }

            console.warn('leftsideSeats 1 - ', leftsideSeats);
            leftsideSeats = [
                ...leftsideSeats,
                ...mainData[0].leftside.seats
            ]
            console.warn('L Seat length ', leftsideSeats.length);
            console.warn('leftsideSeats 2 - ', leftsideSeats);
            console.warn('Seat length ', mainData[0].leftside.seats.length);

            for (let i = 0; i < mainData[0].leftside.columns; i++) {
                let row = [];

                for (let j = 0; j < leftsideSeats.length; j++) {
                    if (this.state.bookedSeats.length > 0) {
                        if (this.state.bookedSeats.includes(parseInt(leftsideSeats[j].id)))
                            leftsideSeats[j].isAvailable = false;
                    }

                    if (leftsideSeats[j].col == i) {
                        row.push(leftsideSeats[j]);
                    }
                }
                seatArray1.push({ row });

            }

            rightsideSeats = [
                ...rightsideSeats,
                ...mainData[0].rightside.seats
            ]
            console.warn('rightsideSeats  - ', rightsideSeats);
            console.warn('Seat R length ', mainData[0].rightside.seats.length);

            for (let i = 0; i < mainData[0].rightside.columns; i++) {
                let row = [];
                for (let j = 0; j < rightsideSeats.length; j++) {
                    if (this.state.bookedSeats.length > 0) {
                        if (this.state.bookedSeats.includes(parseInt(rightsideSeats[j].id)))
                            rightsideSeats[j].isAvailable = false;
                    }

                    if (rightsideSeats[j].col == i) {
                        row.push(rightsideSeats[j]);
                    }
                }
                seatArray2.push({ row });
            }

            for (let i = 0; i < mainData[0].backside.columns; i++) {
                let row = [];
                for (let j = 0; j < mainData[0].backside.seats.length; j++) {
                    if (this.state.bookedSeats.length > 0) {
                        if (this.state.bookedSeats.includes(parseInt(mainData[0].backside.seats[j].id)))
                            mainData[0].backside.seats[j].isAvailable = false;
                        // else 
                        //     mainData[0].backside.seats[j].isAvailable = true;
                    }
                    if (mainData[0].backside.seats[j].col == i) {
                        row.push(mainData[0].backside.seats[j]);
                    }
                }
                seatArray3.push({ row });
            }

            let pad = 0;
            if (mainData[0].backside.columns) {
                pad = parseInt(mainData[0].backside.columns) - (parseInt(mainData[0].rightside.columns) + parseInt(mainData[0].leftside.columns));
                for (let i = 0; i < mainData[0].backside.columns; i++) {
                    let row = [];
                    for (let j = 0; j < mainData[0].backside.seats.length; j++) {
                        if (mainData[0].backside.columns == (i + 1) && mainData[0].backside.seats[j].col == i) {
                            row.push(mainData[0].backside.seats[j]);
                        } else if (mainData[0].backside.seats[j].col == i){
                            row.push({id:0, isAvailable: false, type: 'driver', row: j, col: i});
                        }
                    }
                    driverArray.push({ row });
                }
                console.warn('Back side columns -- ', mainData[0].backside.columns);
            } else {
                pad = 1;
                let columns = pad + (parseInt(mainData[0].rightside.columns) + parseInt(mainData[0].leftside.columns));
                for (let i = 0; i < columns; i++) {
                    let row = [];
                    for (let j = 0; j < 1; j++) {
                        if (columns == (i + 1)) {
                            row.push({id:1, isAvailable: false, type: 'driver', row: j, col: i});
                        } else {
                            row.push({id:0, isAvailable: false, type: 'driver', row: j, col: i});
                        }
                    }
                    driverArray.push({ row });
                }
                console.warn('Back side empty columns');
            }

            for (let i = 0; i < pad; i++) {
                dummyArry.push(i);
            }
        }

        console.warn("seat1" + JSON.stringify(seatArray1))
        console.warn("seat2" + JSON.stringify(seatArray2))
        console.warn("seat3" + JSON.stringify(seatArray3))
        console.warn("driverArray " + JSON.stringify(driverArray))



        return (

            <SafeAreaView style={{ backgroundColor: "white",flex:1,flexDirection: "column", width: "100%", height: "100%", marginTop: 10 }}>
                <ScrollView>

                    <View style={{ alignItems: "center", backgroundColor: "#FFFFFF", padding: 10 }}>

                        <View
                            style={rectangle15}>
                            <TouchableDebounce
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",

                                }}
                                onPress={() => this.toggleDatePicker()}
                            >
                                <View
                                    style={{ height: 60, marginTop: 10, marginBottom: 10 }}
                                    onPress={() => {
                                        this.setState({ isDatePickerVisible: false });
                                        this.toggleDatePicker();
                                    }}
                                >

                                    {this.state.dateSelected !== "Select" ? this.renderDate(
                                        "Date",
                                        moment(this.state.dateSelected).format("DD"),
                                        moment(this.state.dateSelected).format("MMMM YYYY"),
                                        moment(this.state.dateSelected).format("dddd")
                                    ) : this.renderDate(
                                        "Date",
                                        "Select",
                                        "",
                                        ""
                                    )
                                    }
                                </View>
                                {this._renderRightArrow()}
                            </TouchableDebounce>
                            {this._renderLine()}
                            <TouchableDebounce
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",

                                }}
                                onPress={() => {
                                    if (this.state.dateSelected && this.state.dateSelected !== 'Select') {


                                        if (!this.checkPassExistence(this.state.dateSelected)) {
                                            AlertMsg.show("Warning!", "You do not have any passes available for the selected date. Please generate a pass to book a seat.");
                                        } else {
                                            this.setState({ isDatePickerVisible: false });
                                            this.toggleModalVisible(shiftTime)
                                        }
                                    } else {
                                        AlertMsg.show("Seat Booking", "Please select the Date");
                                    }


                                }}
                            >
                                <View
                                    style={{ flex: 1, marginBottom: 8 }}
                                    onPress={() => this.toggleModalVisible(shiftTime)}
                                >
                                    {this.renderTitlePlace(shiftTime, this.state.selectedShiftTime)}
                                </View>
                                {this._renderRightArrow()}
                            </TouchableDebounce>

                        </View>


                        {(mainData && mainData.length > 0) &&
                            <View style={{ backgroundColor: '#FFFFFF', margin: 40, padding: 30, alignItems: "center", flexDirection: 'column' }}>
                                <View style={{ flexDirection: 'row', paddingBottom: 15 }}>
                                    {this.renderDriverSeat(driverArray)}
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    {this.renderSeats(seatArray1)}
                                    <View style={{ flexDirection: 'row' }}>
                                        {dummyArry.map((item, index) => {
                                            return (<Image
                                                style={{ height: 30, width: 30, margin: 5, alignSelf: "center" }}
                                            />);
                                        })}
                                    </View>
                                    {this.renderSeats(seatArray2)}
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    {this.renderSeats(seatArray3)}
                                </View>
                            </View>}


                        {this.renderModalView()}
                        {this.state.isDatePickerVisible && this.renderDatePicker()}

                    </View>


                </ScrollView>


                    <View style={{ position: "absolute", backgroundColor: 'white', bottom: 0, right: 0, width: "100%" }}>
                        <Button
                            backgroundColor={colors.BLUE}
                            style={{
                                borderRadius: 10,
                                borderWidth: 1, margin: 20
                            }}
                            onPress={() =>
                                this.generateTicket()
                            }
                        >
                            <Text style={{ color: colors.WHITE }}>Book Seat</Text>
                        </Button>
                    </View>
            </SafeAreaView>

        );
    }

    render_old() {


        let mainData = (this.state.seatLayout && this.state.seatLayout.length > 0) ? [JSON.parse(this.state.seatLayout)] : [];

        let seatArray1 = [];
        let seatArray2 = [];
        let seatArray3 = [];
        let dummyArry = [];

        console.warn("data" + JSON.stringify(mainData))
        if (mainData.length > 0) {

            console.warn('Seat length ', mainData[0].leftside.seats.length);
            for (let i = 0; i < mainData[0].leftside.columns; i++) {
                let row = [];

                for (let j = 0; j < mainData[0].leftside.seats.length; j++) {
                    if (this.state.bookedSeats.length > 0) {
                        if (this.state.bookedSeats.includes(parseInt(mainData[0].leftside.seats[j].id)))
                            mainData[0].leftside.seats[j].isAvailable = false;
                        // else 
                        //     mainData[0].leftside.seats[j].isAvailable = true;
                    }


                    if (mainData[0].leftside.seats[j].col == i) {

                        row.push(mainData[0].leftside.seats[j]);
                    }
                }
                seatArray1.push({ row });

            }


            for (let i = 0; i < mainData[0].rightside.columns; i++) {
                let row = [];
                for (let j = 0; j < mainData[0].rightside.seats.length; j++) {
                    if (this.state.bookedSeats.length > 0) {
                        if (this.state.bookedSeats.includes(parseInt(mainData[0].rightside.seats[j].id)))
                            mainData[0].rightside.seats[j].isAvailable = false;
                        // else 
                        //     mainData[0].rightside.seats[j].isAvailable = true;
                    }
                    if (mainData[0].rightside.seats[j].col == i) {

                        row.push(mainData[0].rightside.seats[j]);
                    }
                }
                seatArray2.push({ row });
            }



            for (let i = 0; i < mainData[0].backside.columns; i++) {
                let row = [];
                for (let j = 0; j < mainData[0].backside.seats.length; j++) {
                    if (this.state.bookedSeats.length > 0) {
                        if (this.state.bookedSeats.includes(parseInt(mainData[0].backside.seats[j].id)))
                            mainData[0].backside.seats[j].isAvailable = false;
                        // else 
                        //     mainData[0].backside.seats[j].isAvailable = true;
                    }
                    if (mainData[0].backside.seats[j].col == i) {
                        row.push(mainData[0].backside.seats[j]);
                    }
                }
                seatArray3.push({ row });
            }

            let pad = parseInt(mainData[0].backside.columns) - (parseInt(mainData[0].rightside.columns) + parseInt(mainData[0].leftside.columns));

            for (let i = 0; i < pad; i++) {
                dummyArry.push(i);
            }
        }

        console.warn("seat1" + JSON.stringify(seatArray1))
        console.warn("seat2" + JSON.stringify(seatArray2))
        console.warn("seat3" + JSON.stringify(seatArray3))



        return (

            <SafeAreaView style={{ backgroundColor: "white" }}>
                <ScrollView>

                    <View style={{ alignItems: "center", backgroundColor: "#FFFFFF", padding: 10 }}>

                        <View
                            style={rectangle15}>
                            <TouchableDebounce
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",

                                }}
                                onPress={() => this.toggleDatePicker()}
                            >
                                <View
                                    style={{ height: 60, marginTop: 10, marginBottom: 10 }}
                                    onPress={() => {
                                        this.setState({ isDatePickerVisible: false });
                                        this.toggleDatePicker();
                                    }}
                                >

                                    {this.state.dateSelected !== "Select" ? this.renderDate(
                                        "Date",
                                        moment(this.state.dateSelected).format("DD"),
                                        moment(this.state.dateSelected).format("MMMM YYYY"),
                                        moment(this.state.dateSelected).format("dddd")
                                    ) : this.renderDate(
                                        "Date",
                                        "Select",
                                        "",
                                        ""
                                    )
                                    }
                                </View>
                                {this._renderRightArrow()}
                            </TouchableDebounce>
                            {this._renderLine()}
                            <TouchableDebounce
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",

                                }}
                                onPress={() => {
                                    if (this.state.dateSelected && this.state.dateSelected !== 'Select') {


                                        if (!this.checkPassExistence(this.state.dateSelected)) {
                                            AlertMsg.show("Warning!", "You do not have any passes available for the selected date. Please generate a pass to book a seat.");
                                        } else {
                                            this.setState({ isDatePickerVisible: false });
                                            this.toggleModalVisible(shiftTime)
                                        }
                                    } else {
                                        AlertMsg.show("Seat Booking", "Please select the Date");
                                    }


                                }}
                            >
                                <View
                                    style={{ flex: 1, marginBottom: 8 }}
                                    onPress={() => this.toggleModalVisible(shiftTime)}
                                >
                                    {this.renderTitlePlace(shiftTime, this.state.selectedShiftTime)}
                                </View>
                                {this._renderRightArrow()}
                            </TouchableDebounce>

                        </View>


                        {(mainData && mainData.length > 0) &&
                            <View style={{ backgroundColor: '#FFFFFF', margin: 40, padding: 30, alignItems: "center", flexDirection: 'column' }}>
                                <View style={{ flexDirection: 'row' }}>
                                    {this.renderSeats(seatArray1)}
                                    <View style={{ flexDirection: 'row' }}>
                                        {dummyArry.map((item, index) => {
                                            return (<Image
                                                style={{ height: 30, width: 30, margin: 5, alignSelf: "center" }}
                                            />);
                                        })}
                                    </View>
                                    {this.renderSeats(seatArray2)}
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    {this.renderSeats(seatArray3)}
                                </View>
                            </View>}


                        {this.renderModalView()}
                        {this.state.isDatePickerVisible && this.renderDatePicker()}

                    </View>


                </ScrollView>


                    <View style={{ position: "absolute", backgroundColor: 'white', bottom: 0, right: 0, width: "100%" }}>
                        <Button
                            backgroundColor={colors.BLUE}
                            style={{
                                borderRadius: 10,
                                borderWidth: 1, margin: 20
                            }}
                            onPress={() =>
                                this.generateTicket()
                            }
                        >
                            <Text style={{ color: colors.WHITE }}>Book Seat</Text>
                        </Button>
                    </View>
            </SafeAreaView>

        );
    }

    renderSeats(seatArray) {
        return (
            <View style={{ backgroundColor: '#FFFFFF', flexDirection: 'row' }}>
                {seatArray.map((column) => {
                    return (
                        <View style={{ flexDirection: 'column' }}>

                            {column.row.map((item, index) => {
                                return item.id === 0 ? (
                                    <View style={{ flexDirection: 'column', alignItems: "center" }}>
                                        <Text></Text>
                                        <Image
                                            style={{ height: 30, width: 30, margin: 5, alignSelf: "center" }}
                                        />
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (item.isAvailable){
                                                if (item.pref == 'DE') {
                                                    setTimeout(() => {
                                                        Alert.alert(
                                                            "Book Seat",
                                                            "This seat is reserved for Person with Disability. Are you sure you want to book this seat?",
                                                            [
                                                                {
                                                                    text: "No",
                                                                    onPress: () => {
                                                                        this.setState({});
                                                                    },
                                                                    style: "cancel"
                                                                },
                                                                {
                                                                    text: "Yes",
                                                                    onPress: () => {
                                                                        this.setState({ selectedSeatId: item.id });
                                                                    }
                                                                }
                                                            ],
                                                            { cancelable: true }
                                                        );
                                                    }, 100);
                                                } else if (item.pref == 'PL') {
                                                    setTimeout(() => {
                                                        Alert.alert(
                                                            "Book Seat",
                                                            "This seat is reserved for Expectant Mothers. Are you sure you want to book this seat?",
                                                            [
                                                                {
                                                                    text: "No",
                                                                    onPress: () => {
                                                                        this.setState({});
                                                                    },
                                                                    style: "cancel"
                                                                },
                                                                {
                                                                    text: "Yes",
                                                                    onPress: () => {
                                                                        this.setState({ selectedSeatId: item.id });
                                                                    }
                                                                }
                                                            ],
                                                            { cancelable: true }
                                                        );
                                                    }, 100);
                                                } else {
                                                    this.setState({ selectedSeatId: item.id });
                                                }
                                            }
                                        }}
                                    >
                                        {
                                            <View style={{ flexDirection: 'column', alignItems: "center" }}>
                                                <Text style={{color: colors.GRAY}}>{item.id}</Text>
                                                <Image
                                                    style={{ height: 30, width: 30, margin: 5, alignSelf: "center" }}
                                                    source={this.state.selectedSeatId === item.id ? selected_seat : (item.isAvailable ? (item.pref == 'DE' ? physicallychallange_seat : (item.pref == 'PL' ? pregnentlady_seat : available_seat)) : unavailable_seat)}
                                                />
                                            </View>

                                        }
                                    </TouchableOpacity>
                                )
                            }

                            )}

                        </View>
                    );
                })
                }
            </View>
        );
    }

    renderDriverSeat(seatArray) {
        return (
            <View style={{ backgroundColor: '#FFFFFF', flexDirection: 'row' }}>
                {seatArray.map((column) => {
                    return (
                        <View style={{ flexDirection: 'column' }}>

                            {column.row.map((item, index) => {
                                return item.id === 0 ? (
                                    <View style={{ flexDirection: 'column', alignItems: "center" }}>
                                        <Image
                                            style={{ height: 30, width: 30, margin: 5, alignSelf: "center" }}
                                        />
                                    </View>
                                ) : (
                                    <View style={{ flexDirection: 'column', alignItems: "center" }}>
                                        <Image
                                            style={{ height: 30, width: 30, margin: 5, alignSelf: "center" }}
                                            source={driver_seat}
                                        />
                                    </View>
                                )
                            }

                            )}

                        </View>
                    );
                })
                }
            </View>
        );
    }

    renderDate(title, date, monthYear, day) {
        return (
            <View style={{ flexDirection: "column" }}>
                <Text style={[titleStyle, { marginLeft: 10 }]}>{title}</Text>
                <View style={{ flexDirection: "row" }}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 10,
                            marginLeft: 10
                        }}
                    >
                        <MaterialCommunityIcons
                            name={"calendar-today"}
                            size={25}
                            color={colors.BLACK}
                        />
                        <Text style={date === "Select" ? sourceName : dateStyleBig}>
                            {date}
                        </Text>
                    </View>

                    <View style={{ flexDirection: "column", marginLeft: 5 }}>
                        <Text style={monthYearStyle}>{monthYear}</Text>
                        <Text style={dayStyle}>{day}</Text>
                    </View>
                </View>
            </View>
        );
    };


    renderTitlePlace(title, placeName) {
        return (
            <View style={{ flex: 1, marginLeft: 10, marginTop: 10 }}>
                <Text style={titleStyle}>{title}</Text>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 10,

                    }}
                >
                    <MaterialIcons
                        name={title.includes("Shift Time") ? "access-time" : "credit-card"}
                        style={{ fontSize: 25, color: colors.BLACK }}
                    />
                    <Text style={sourceName}>{placeName}</Text>


                </View>
            </View>
        );
    }

    _renderLine(size) {
        return (
            <View
                style={{
                    height: 0.5,
                    width: size ? size : "100%",
                    backgroundColor: colors.GRAY,
                    marginTop: 5
                }}
            />
        );
    }

    _keyExtractor(item, index) {
        return index.toString();
    }

    _renderSeparator() {
        return <View style={separator} />;
    }

    _onRefresh() {
        this.setState({
            refreshing: true
        });
    }

    _renderEmptyList = () => {
        return (
            //View to show when list is empty
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    margin: 10
                }}
            >
                <Text style={{ textAlign: "center", color: colors.GRAY }}>No data found</Text>x
            </View>
        );
    };

    _renderListItem(Item) {
        return (
            <View
                style={{
                    justifyContent: "center",
                    width: "100%",
                    height: 50,
                    paddingLeft: 10,
                    paddingRight: 10,
                    backgroundColor: colors.WHITE
                }}
            >
                <TouchableDebounce
                    onPress={() => {

                        this.toggleModalVisible();

                        this.setState({
                            selectedShiftTime: Item.item.shiftTime,
                            selectedShiftId: Item.item.shiftID,
                            selectedRouteId: Item.item.routeID

                        }, () => {
                            this.getSeatLayout();
                        })

                    }}
                >
                    <Text style={{color: colors.BLACK}}>{Item.item.shiftTime}</Text>
                </TouchableDebounce>
            </View>
        );
    }

    renderModalView() {

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.showPop}
                onRequestClose={() => {
                    this.setState({ showPop: false });
                }}
                backdropColor={colors.BLACK}
                backdropOpacity={1}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: colors.WHITE }}>
                    <View style={{ flex: 1, backgroundColor: colors.WHITE }}>
                        <View style={{ flexDirection: "row", height: 50, marginTop: 30 }}>
                            <Text
                                style={{
                                    marginTop: 10,
                                    fontSize: 20,
                                    marginLeft: 10,
                                    color: colors.BLUE
                                }}
                            >
                                Select{" "}
                                {this.state.selectedOption === shiftTime
                                    ? shiftTime
                                    : category}
                            </Text>
                            <Ionicons
                                name="close"
                                style={{
                                    fontSize: 40,
                                    marginRight: 20,
                                    marginTop: 10,
                                    color: colors.BLACK,
                                    fontFamily: "Helvetica",
                                    right: 0,
                                    position: "absolute"
                                }}
                                onPress={() => {
                                    setTimeout(() => this.setState({ showPop: false }), 0);
                                }}
                            />
                        </View>
                        <FlatList
                            keyExtractor={this._keyExtractor}
                            data={
                                this.state.shiftTimes
                            }
                            renderItem={this._renderListItem.bind(this)}
                            ItemSeparatorComponent={this._renderSeparator.bind(this)}
                            ListEmptyComponent={this._renderEmptyList}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.isLoading}
                                    onRefresh={this._onRefresh.bind(this)}
                                />
                            }
                        />
                    </View>
                </SafeAreaView>
            </Modal>
        );
    }



    generateTicket() {
        if (this.state.dateSelected === 'Select') {
            AlertMsg.show("Warning!", "Please select the date");
        } else if (this.state.selectedShiftTime === 'Select') {
            AlertMsg.show("Warning!", "Please select the shift");
        } else if (this.state.selectedSeatId === '') {
            AlertMsg.show("Warning!", "Please select the seat");
        } else {
            let body = {
                routeID: this.state.selectedRouteId,
                shiftID: this.state.selectedShiftId,
                seatNumber: this.state.selectedSeatId,
                passID: this.state.selectedPassId,
                shiftTime: this.state.dateSelected + "T" + this.state.selectedShiftTime + ":00+05:30",
                IsProfileStateCheck: 1
            };
            API.newFetchJSON(
                URL.GENERATE_BUS_TICKET,
                body,
                true,
                this.callback.bind(this),
                TYPE.GENERATE_BUS_TICKET,
                null
            );
        }

    }

    _handleDatePicked = date => {
        const dateSelected = Moment(date).format("YYYY-MM-DD");
        this.setState({
            dateSelected: dateSelected
        }, () => {
            if (!this.checkPassExistence(dateSelected)) {
                AlertMsg.show("Warning!", "You do not have any passes available for the selected date. Please generate a pass to book a seat.");
            } else {
                if (this.state.selectedShiftTime !== "Select")
                    this.getSeatLayout();
            }
        });
        this.toggleDatePicker();

    };

    checkPassExistence(dateSelected) {

        let passes = Array.isArray(this.state.passes.passes) ? this.state.passes.passes : [];
        let isPassAvailable = false;
        console.warn("time selected" + JSON.stringify(passes.fromDate))

        passes.map((pass) => {
            if (moment(dateSelected).isBetween(pass.fromDate, pass.toDate) || (moment(dateSelected).format("YYYY-MM-DD") === moment(pass.fromDate).format("YYYY-MM-DD")) || (moment(dateSelected).format("YYYY-MM-DD") === moment(pass.toDate).format("YYYY-MM-DD"))) {
                isPassAvailable = true;
                console.warn("pass id" + pass.id);
                this.setState({
                    selectedPassId: pass.id
                })
            }

        });

        return isPassAvailable;
    }

    getRecentAvailableDateFromPass() {
        let passes = Array.isArray(this.state.passes.passes) ? this.state.passes.passes : [];
        if (passes.length > 0) {
            for (let i = 0; i < passes.length; i++) {
                let pass = passes[i];
                if (moment().isBetween(pass.fromDate, pass.toDate) || (moment().format("YYYY-MM-DD") === moment(pass.fromDate).format("YYYY-MM-DD")) || (moment().format("YYYY-MM-DD") === moment(pass.toDate).format("YYYY-MM-DD"))) {
                    console.warn("date found" + this.state.recentAvailableDate)

                    this.setState({
                        recentAvailableDate: this.state.recentAvailableDate === '' ? moment().format("YYYY-MM-DD") : recentAvailableDate,
                        dateSelected: moment().format("YYYY-MM-DD"),
                        selectedPassId: pass.id
                    }, () => { this.getSeatLayout() })
                    break;
                } else if (moment().format("YYYY-MM-DD") < moment(pass.fromDate).format("YYYY-MM-DD")) {
                    this.setState({
                        recentAvailableDate: this.state.recentAvailableDate === '' ? moment(pass.fromDate).format("YYYY-MM-DD") : recentAvailableDate,
                        dateSelected: moment(pass.fromDate).format("YYYY-MM-DD"),
                        selectedPassId: pass.id
                    }, () => { this.getSeatLayout() })
                    break;
                } else {
                    if ((i + 1) === passes.length)
                        break;
                    else
                        continue;
                }
            }
        }

    }
    renderDatePicker() {

        return (

            <Modal
                style={{
                    position: 'absolute',
                    bottom: 0
                }}
                animationType="slide"
                transparent={true}
                visible={this.state.isDatePickerVisible}
                onRequestClose={() => {
                    this.setState({ isDatePickerVisible: false });
                }}
                backdropColor={colors.BLACK}
                backdropOpacity={1}

            >
                <SafeAreaView style={{
                    position: 'absolute', width: '100%',
                    bottom: 0, backgroundColor: colors.WHITE
                }}>
                    <View style={{ backgroundColor: colors.WHITE, flexDirection: 'column' }}>
                        <DatePicker
                            options={option}
                            minimumDate={"seatbooking~" + JSON.stringify(this.state.passes.passes)}
                            maximumDate={moment().add(this.state.advanceSeatBooking, 'days').format("YYYY-MM-DD")}
                            mode="calendar"
                            onSelectedChange={date => {
                                let dates = moment(date, "YYYY/MM/DD").format("YYYY-MM-DD");
                                this._handleDatePicked(dates)
                            }}
                            style={{ borderRadius: 10 }}
                        />

                        <Button 
                        backgroundColor={colors.BLUE}
                        style={{
                            marginRight: 20, marginLeft: 20, borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#fff'
                        }}
                            full onPress={() => {
                                this.setState({
                                    isDatePickerVisible: false
                                });
                            }}>
                            <Text style={{ color: "white" }}>Cancel</Text>
                        </Button>

                    </View>
                </SafeAreaView>
            </Modal>


            // <DateTimePicker
            //     isVisible={this.state.isDatePickerVisible}
            //     onConfirm={this._handleDatePicked}
            //     onCancel={() => this.setState({ isDatePickerVisible: false })}
            //     mode={"date"}
            //     is24Hour={false}

            //     minimumDate={new Date(moment().format())}
            //     maximumDate={new Date(moment().add("3","month").format())}
            //   />

        );
    }
}

export default SeatBooking;



const rectangle14 = {
    height: 280,
    width: "100%",
    backgroundColor: colors.WHITE,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
        width: 1,
        height: 1
    },
    shadowRadius: 2,
    shadowOpacity: 1,
    flexDirection: "column",
    borderRadius: 5,
    overflow: "hidden"
};
const rectangle15 = {
    height: 170,
    width: "100%",
    backgroundColor: "#ebebeb",
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
        width: 1,
        height: 1
    },
    shadowRadius: 2,
    shadowOpacity: 1,
    flexDirection: "column",
    borderRadius: 5,
    overflow: "hidden"
};
const from = {
    fontFamily: "Helvetica",
    fontSize: 14,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.GRAY
};
const sourceName = {
    fontFamily: "Helvetica",
    fontSize: 18,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#000000",
    marginLeft: 10
};
const oval = {
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderRadius: 30,
    width: 60,
    height: 60,
    backgroundColor: colors.BLUE_BRIGHT,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
        width: 0,
        height: 2
    },
    shadowRadius: 4,
    shadowOpacity: 1
};
const separator = {
    height: 0.5,
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#555"
};
const titleStyle = {
    fontFamily: "Helvetica",
    fontSize: 13,
    textAlign: "left",
    color: colors.BLACK
};
const dateStyleBig = {
    fontFamily: "Helvetica",
    fontSize: 25,
    textAlign: "left",
    color: colors.BLACK,
    marginLeft: 5
};
const dateStyle = {
    fontFamily: "Helvetica",
    fontSize: 20,
    // fontWeight: "500",
    textAlign: "left",
    color: colors.BLACK,
    marginLeft: 5
};
const monthYearStyle = {
    fontFamily: "Helvetica",
    fontSize: 12,
    fontWeight: "300",
    textAlign: "center",
    color: colors.BLACK,
    marginTop: 5
};
const dayStyle = {
    fontFamily: "Helvetica",
    fontSize: 12,
    fontWeight: "300",
    textAlign: "left",
    color: colors.GRAY
};