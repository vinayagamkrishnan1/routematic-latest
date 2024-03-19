import React, { Component } from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Text,
    View,
    Alert,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { colors } from "../../utils/Colors";
import { URL } from "../../network/apiConstants";
import { API } from "../../network/apiFetch/API";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import { TYPE } from "../../model/ActionType";

import available_seat from "../../assets/available_seat.png";
import selected_seat from "../../assets/selected_seat.png";
import unavailable_seat from "../../assets/unavailable_seat.png";
import booked_seat from "../../assets/booked_seat.png";
import booked_seat_pc from "../../assets/booked_seat_pc.png";
import booked_seat_pl from "../../assets/booked_seat_pl.png";
import driver_seat from "../../assets/driver_seat.png";
import physicallychallange_seat from "../../assets/pc_seat.png";
import pregnentlady_seat from "../../assets/pl_seat.png";

class SeatLayout extends Component {

    state = {
        isLoading: false,
        selectedShiftTime: "",
        selectedShiftId: "",
        selectedRouteId: "",
        selectedSeatId: '',
        seatLayout: "",
        bookedSeats: [],
    };

    callback = async (actionType, response, copyDataObj) => {
        switch (actionType) {
            case TYPE.GET_SEAT_LAYOUT: {
                handleResponse.getSeatLayout(this, response);
                break;
            }
        }
    };

    UNSAFE_componentWillMount() {
        if (this.props.route.params) {
            console.warn("params" + JSON.stringify(this.props.route.params))
            this.setState({
                selectedRouteId: this.props.route.params.fixRouteId,
                selectedShiftTime: this.props.route.params.selectedShiftTime,
                selectedShiftId: this.props.route.params.selectedShiftId,
                selectedSeatId: this.props.route.params.selectedSeatId,
            }, () => {
                this.getSeatLayout();
            })
        }
    }

    getSeatLayout() {
        this.setState({
            seatLayout: "",
            bookedSeats: []
        })
        console.warn("shiftDate" + this.state.dateSelected)
        let url = URL.GET_SEAT_LAYOUT + "?routeId=" + this.state.selectedRouteId + "&shiftId=" + this.state.selectedShiftId + "&shiftTime=" + this.state.selectedShiftTime;
        console.warn('layout url - ', url);
        API.newFetchXJSON(
            url,
            true,
            this.callback.bind(this),
            TYPE.GET_SEAT_LAYOUT
        );
    }

    componentDidMount() {
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

            <SafeAreaView style={{ flex:1, flexDirection: "column", backgroundColor: "white", width: "100%", height: "100%"}}>
                <ScrollView>
                <View style={{
                        zIndex: 1,
                        width: '100%',
                        padding: 5,
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}>
                        <View style={{
                            flexDirection: "column",
                        }}>
                            <View style={{
                                flexDirection: "row",
                                alignItems: 'center',
                                padding: 5
                            }}>
                                <FontAwesome
                                    name={"close"}
                                    color={colors.GRAY}
                                    size={20}
                                />
                                <Text style={{
                                    marginLeft: 10,
                                    fontSize: 14,
                                    color: colors.BLACK
                                }}>Booked Seat</Text>
                            </View>
                            <View style={{
                                flexDirection: "row",
                                alignItems: 'center',
                                padding: 5
                            }}>
                                <FontAwesome
                                    name={"circle"}
                                    color={colors.BLUE}
                                    size={15}
                                />
                                <Text style={{
                                    marginLeft: 10,
                                    fontSize: 14,
                                    color: colors.BLACK
                                }}>Your Seat</Text>
                            </View>
                        </View>
                        <View style={{
                            flexDirection: "column",
                        }}>
                            <View style={{
                                flexDirection: "row",
                                alignItems: 'center',
                                padding: 5
                            }}>
                                <FontAwesome
                                    name={"circle"}
                                    color={colors.ORANGE}
                                    size={15}
                                />
                                <Text style={{
                                    marginLeft: 10,
                                    fontSize: 14,
                                    color: colors.BLACK
                                }}>Reserved (Differently Abled)</Text>
                            </View>
                            <View style={{
                                flexDirection: "row",
                                alignItems: 'center',
                                padding: 5
                            }}>
                                <FontAwesome
                                    name={"circle"}
                                    color={colors.PINK}
                                    size={15}
                                />
                                <Text style={{
                                    marginLeft: 10,
                                    fontSize: 14,
                                    color: colors.BLACK
                                }}>Reserved (Pregnant)</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ alignItems: "center", backgroundColor: "#FFFFFF", padding: 10 }}>

                        {(mainData && mainData.length > 0) &&
                            <View style={{ backgroundColor: '#FFFFFF', marginHorizontal: 40, paddingHorizontal: 30, alignItems: "center", flexDirection: 'column' }}>
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
                            </View>
                        }
                    </View>
                </ScrollView>
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
                                    <View style={{ flexDirection: 'column', alignItems: "center" }}>
                                        <Text style={{color: colors.GRAY}}>{item.id}</Text>
                                        <Image
                                            style={{ height: 30, width: 30, margin: 5, alignSelf: "center" }}
                                            source={this.state.selectedSeatId === parseInt(item.id) ? selected_seat : (item.isAvailable ? (item.pref == 'DE' ? physicallychallange_seat : (item.pref == 'PL' ? pregnentlady_seat : unavailable_seat)) : (item.pref == 'DE' ? booked_seat_pc : (item.pref == 'PL' ? booked_seat_pl : booked_seat)))}
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

}

export default SeatLayout;



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