import React, { Component } from "react";
import { Box, Text, } from "native-base";
import {
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    SafeAreaView,
    View
} from 'react-native';
import { colors } from "../../utils/Colors";
import { inject, observer } from "mobx-react";
import TouchableDebounce from "../../utils/TouchableDebounce";
import { _renderDate, _renderOffice, viewSelectedStyle, fullviewSelectedStyle } from "../roster/customeComponent/customComponent";
import Ionicons from "react-native-vector-icons/Ionicons";
import PleaseWaitLoader from "../../network/loader/PleaseWaitLoader";
import DatePicker from "react-native-modern-datepicker";
import moment from "moment";
import * as HOC from "../../components/hoc";
import { adhoc, Select } from "../../utils/ConstantString";
import { Button } from "react-native-paper";

const ViewLoader = HOC.LoaderHOC(View);
const _ = require("lodash");


export const adhocType = {
    login: "Login",
    logout: "Logout",
    nonShift: "Non Shift",
    travelDesk: "Travel Request"
};

const options = {
    backgroundColor: '#fff',
    textHeaderColor: '#212c35',
    textDefaultColor: '#2d4150',
    selectedTextColor: '#fff',
    mainColor: '#61dafb',
    textSecondaryColor: '#7a92a5',
    borderColor: 'rgba(122, 146, 165, 0.1)',
    defaultFont: 'System',
    headerFont: 'System',
    textFontSize: 15,
    textHeaderFontSize: 17,
    headerAnimationDistance: 100,
    daysAnimationDistance: 200,
};


@inject("mAdHocStore")
@observer
class AdhocLanding extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: '' // navigation.getParam("title"),
        };
    };

    // _renderAdhocType_old = (store) => {
    //     return (
    //         <View
    //             style={{
    //                 height: 50,
    //                 flexDirection: "row",
    //                 justifyContent: "center",
    //                 alignItems: "center",
    //                 marginTop: 10
    //             }}
    //         >
    //             <Box
    //                 style={{
    //                     flexDirection: "row",
    //                     borderRadius: 20,
    //                     justifyContent: "space-between",
    //                     marginLeft: 40,
    //                     marginRight: 40
    //                 }}
    //             >
    //                 <TouchableDebounce
    //                     style={
    //                         this.state.type === adhocType.login
    //                             ? [viewSelectedStyle, { flexDirection: "row", width: 100 }]
    //                             : {
    //                                 justifyContent: "center",
    //                                 alignItems: "center",
    //                                 marginLeft: 15,
    //                                 width: 80
    //                             }
    //                     }
    //                     onPress={() => {
    //                         this.setState({ type: adhocType.login, selectedValue: undefined });
    //                         store.setTripType(adhocType.login);
    //                     }}
    //                 >
    //                     {this.state.type === adhocType.login && (
    //                         <Ionicons
    //                             name={"ios-checkmark-circle"}
    //                             style={{
    //                                 color: this.state.type === adhocType.login
    //                                     ? colors.WHITE
    //                                     : colors.BLACK
    //                             }}
    //                             size={20}
    //                         />
    //                     )}
    //                     <Text
    //                         style={{
    //                             color: this.state.type === adhocType.login
    //                                 ? colors.WHITE
    //                                 : colors.BLACK,
    //                             marginLeft: 12,
    //                             fontWeight: 'bold'
    //                         }}
    //                     >
    //                         {adhocType.login}
    //                     </Text>
    //                 </TouchableDebounce>

    //                 <TouchableDebounce
    //                     style={
    //                         this.state.type === adhocType.logout
    //                             ? [viewSelectedStyle, { flexDirection: "row", width: 100 }]
    //                             : { justifyContent: "center", alignItems: "center", marginLeft: 8, marginRight: 8 }
    //                     }
    //                     onPress={() => {
    //                         this.setState({ type: adhocType.logout, selectedValue: undefined });
    //                         store.setTripType(adhocType.logout);
    //                     }}
    //                 >
    //                     {this.state.type === adhocType.logout && (
    //                         <Ionicons
    //                             name={"ios-checkmark-circle"}
    //                             style={{
    //                                 color:
    //                                     this.state.type === adhocType.logout
    //                                         ? colors.WHITE
    //                                         : colors.BLACK
    //                             }}
    //                             size={20}
    //                         />
    //                     )}
    //                     <Text
    //                         style={{
    //                             color:
    //                                 this.state.type === adhocType.logout
    //                                     ? colors.WHITE
    //                                     : colors.BLACK,
    //                             marginLeft: 10,
    //                             marginRight: 10,
    //                             alignSelf: "center",
    //                             fontWeight: 'bold'
    //                         }}
    //                     >
    //                         {adhocType.logout}
    //                     </Text>
    //                 </TouchableDebounce>

    //                 <TouchableDebounce
    //                     style={
    //                         this.state.type === adhocType.nonShift
    //                             ? [viewSelectedStyle, { flexDirection: "row", width: 110 }]
    //                             : {
    //                                 justifyContent: "center",
    //                                 alignItems: "center",
    //                                 marginRight: 10,
    //                                 width: 100
    //                             }
    //                     }
    //                     onPress={() => {
    //                         this.setState({ type: adhocType.nonShift, selectedValue: undefined });
    //                         store.setTripType(adhocType.nonShift);
    //                         this.props.navigation.navigate("Adhoc", {
    //                             title: "Non Shift Adhoc"
    //                         });

    //                     }}
    //                 >
    //                     {this.state.type === adhocType.nonShift && (
    //                         <Ionicons
    //                             name={"ios-checkmark-circle"}
    //                             style={{
    //                                 color:
    //                                     this.state.type === adhocType.nonShift
    //                                         ? colors.WHITE
    //                                         : colors.BLACK
    //                             }}
    //                             size={20}
    //                         />
    //                     )}
    //                     <Text
    //                         style={{
    //                             color:
    //                                 this.state.type === adhocType.nonShift
    //                                     ? colors.WHITE
    //                                     : colors.BLACK,
    //                             marginLeft: 12,
    //                             fontWeight: 'bold'
    //                         }}
    //                     >
    //                         {adhocType.nonShift}
    //                     </Text>
    //                 </TouchableDebounce>
    //             </Box>
    //         </View>
    //     );
    // };

    _renderAdhocType (store) {
        return (
            <View style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 10,
                height: 100
                }}>
                    <View style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignContent: 'center',
                        alignItems: 'center',
                        marginHorizontal: 16,
                    }}>
                        <Button 
                        mode="contained"
                        style={{
                            flex: 0.5,
                            borderRadius: 5,
                            marginRight: 5,
                        }} 
                        buttonColor={this.state.type === adhocType.login ? colors.BLUE : colors.GRAY_1} 
                        onPress={() => {
                            this.setState({ type: adhocType.login, selectedValue: undefined });
                            store.setTripType(adhocType.login);
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
                            this.setState({ type: adhocType.logout, selectedValue: undefined });
                            store.setTripType(adhocType.logout);
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
                            this.setState({ type: adhocType.nonShift, selectedValue: undefined });
                            store.setTripType(adhocType.nonShift);
                            this.props.navigation.replace("Adhoc", {
                                title: "Non Shift Adhoc"
                            });
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

    // _renderAdhocType_old1 = (store) => {
    //     return (
    //         <View
    //             style={{
    //                 height: 100,
    //                 flexDirection: "row",
    //                 justifyContent: "center",
    //                 alignItems: "center",
    //                 marginTop: 10,
    //             }}
    //         >
    //             <Box
    //                 style={{
    //                     flexDirection: "column",
    //                     borderRadius: 20,
    //                     justifyContent: "center",
    //                     width: '95%',
    //                     marginTop: 10,
    //                     padding: 2
    //                 }}
    //             >
    //                 <View
    //                     style={{
    //                         flexDirection: "row",
    //                         justifyContent: "space-between",
    //                         width: '100%'
    //                     }}
    //                 >


    //                     <TouchableDebounce
    //                         style={
    //                             this.state.type === adhocType.login
    //                                 ? [fullviewSelectedStyle, { flexDirection: "row", width: '50%' }]
    //                                 : {
    //                                     justifyContent: "center",
    //                                     alignItems: "flex-start",
    //                                     marginLeft: 5,
    //                                     width: 150
    //                                 }
    //                         }
    //                         onPress={() => {
    //                             this.setState({ type: adhocType.login, selectedValue: undefined });
    //                             store.setTripType(adhocType.login);
    //                         }}
    //                     >
    //                         {this.state.type === adhocType.login && (
    //                             <Ionicons
    //                                 name={"ios-checkmark-circle"}
    //                                 style={{
    //                                     color: this.state.type === adhocType.login
    //                                         ? colors.WHITE
    //                                         : colors.BLACK
    //                                 }}
    //                                 size={20}
    //                             />
    //                         )}
    //                         <Text
    //                             style={{
    //                                 color: this.state.type === adhocType.login
    //                                     ? colors.WHITE
    //                                     : colors.BLACK,
    //                                 marginLeft: 5,
    //                                 fontWeight: 'bold'
    //                             }}
    //                         >
    //                             {adhocType.login}
    //                         </Text>
    //                     </TouchableDebounce>

    //                     <TouchableDebounce
    //                         style={
    //                             this.state.type === adhocType.logout
    //                                 ? [fullviewSelectedStyle, { flexDirection: "row", width: '50%' }]
    //                                 : {
    //                                     justifyContent: "center",
    //                                     alignItems: "flex-start",
    //                                     marginLeft: 5,
    //                                     width: 150
    //                                 }
    //                         }
    //                         onPress={() => {
    //                             this.setState({ type: adhocType.logout, selectedValue: undefined });
    //                             store.setTripType(adhocType.logout);
    //                         }}
    //                     >
    //                         {this.state.type === adhocType.logout && (
    //                             <Ionicons
    //                                 name={"ios-checkmark-circle"}
    //                                 style={{
    //                                     color:
    //                                         this.state.type === adhocType.logout
    //                                             ? colors.WHITE
    //                                             : colors.BLACK
    //                                 }}
    //                                 size={20}
    //                             />
    //                         )}
    //                         <Text
    //                             style={{
    //                                 color:
    //                                     this.state.type === adhocType.logout
    //                                         ? colors.WHITE
    //                                         : colors.BLACK,
    //                                 marginLeft: 15,
    //                                 fontWeight: 'bold'
    //                             }}
    //                         >
    //                             {adhocType.logout}
    //                         </Text>
    //                     </TouchableDebounce>
    //                 </View>

    //                 <View
    //                     style={{
    //                         flexDirection: "row",
    //                         justifyContent: "space-between",
    //                         width: '100%'
    //                     }}
    //                 >
    //                     <TouchableDebounce
    //                         style={
    //                             this.state.type === adhocType.nonShift
    //                                 ? [fullviewSelectedStyle, { flexDirection: "row", width: '50%' }]
    //                                 : {
    //                                     justifyContent: "center",
    //                                     alignItems: "flex-start",
    //                                     marginLeft: 5,
    //                                     width: 150
    //                                 }
    //                         }
    //                         onPress={() => {
    //                             this.setState({ type: adhocType.nonShift, selectedValue: undefined });
    //                             store.setTripType(adhocType.nonShift);
    //                             this.props.navigation.navigate("Adhoc", {
    //                                 title: "Non Shift Adhoc"
    //                             });

    //                         }}
    //                     >
    //                         {this.state.type === adhocType.nonShift && (
    //                             <Ionicons
    //                                 name={"ios-checkmark-circle"}
    //                                 style={{
    //                                     color:
    //                                         this.state.type === adhocType.nonShift
    //                                             ? colors.WHITE
    //                                             : colors.BLACK
    //                                 }}
    //                                 size={20}
    //                             />
    //                         )}
    //                         <Text
    //                             style={{
    //                                 color:
    //                                     this.state.type === adhocType.nonShift
    //                                         ? colors.WHITE
    //                                         : colors.BLACK,
    //                                 marginLeft: 5,
    //                                 fontWeight: 'bold'
    //                             }}
    //                         >
    //                             {adhocType.nonShift}
    //                         </Text>
    //                     </TouchableDebounce>

    //                     <TouchableDebounce
    //                         style={
    //                             // this.state.type === adhocType.travelDesk
    //                             //     ? [fullviewSelectedStyle, { flexDirection: "row", width: '50%' }]
    //                             //     : 
    //                                 {
    //                                     justifyContent: "center",
    //                                     alignItems: "flex-start",
    //                                     marginLeft: 5,
    //                                     width: 150
    //                                 }
    //                         }
    //                         onPress={() => {
    //                             this.setState({ type: adhocType.travelDesk, selectedValue: undefined });
    //                             store.setTripType(adhocType.travelDesk);
    //                             this.props.navigation.navigate("TravelDesk", {
    //                                 title: "Travel Request"
    //                             });
    //                         }}
    //                     >
    //                         {/* {this.state.type === adhocType.travelDesk && (
    //                             <Ionicons
    //                                 name={"ios-checkmark-circle"}
    //                                 style={{
    //                                     color:
    //                                         this.state.type === adhocType.travelDesk
    //                                             ? colors.WHITE
    //                                             : colors.BLACK
    //                                 }}
    //                                 size={20}
    //                             />
    //                         )} */}
    //                         <Text
    //                             style={{
    //                                 color:
    //                                     // this.state.type === adhocType.travelDesk
    //                                     //     ? colors.WHITE
    //                                     //     : 
    //                                         colors.BLACK,
    //                                 marginLeft: 5,
    //                                 fontWeight: 'bold'
    //                             }}
    //                         >
    //                             Travel Request
    //                         </Text>
    //                     </TouchableDebounce>
    //                 </View>
    //             </Box>
    //         </View>
    //     );
    // };
    _renderDate = (store) => {
        let date = "Invalid date";
        let monthYear = "Invalid date";
        let day = "Invalid date";
        if (store.dateSelected && !store.dateSelected.includes(Select)) {
            date = moment(store.dateSelected)
                .format("DD");
            day = moment(store.dateSelected)
                .format("dddd");
            monthYear = moment(store.dateSelected)
                .format("MMM YYYY");
        }
        return (
            <View
                style={{
                    padding: 16,
                }}
            >
                <TouchableDebounce
                    onPress={() => {
                        store.showDatePicker();
                    }}
                >
                    {_renderDate(
                        "Date",
                        date === "Invalid date" ? "Select" : date,
                        monthYear === "Invalid date" ? "" : monthYear,
                        day === "Invalid date" ? "" : day
                    )}
                </TouchableDebounce>
            </View>
        );
    };

    constructor(props) {
        super(props);
        this.state = ({
            title: "",
            type: "Login",
            selectedValue: "",
            text: "",
            isDatePickerVisible: false,
        });
        // this.props.mAdHocStore.setInitObject(this, this.props.navigation);
        this.props.mAdHocStore.setInitAdhoc(this);
    }

    renderDatePicker(store) {
        return (
            <DatePicker
                options={options}
                minimumDate={moment().format("YYYY-MM-DD")}
                maximumDate={moment(new Date()).add(30, 'days').format("YYYY-MM-DD")}
                mode="calendar"
                onSelectedChange={date => {
                    let dates = moment(date, "YYYY/MM/DD").format("YYYY-MM-DD");
                    store.handleDatePicked(dates);
                }}
                style={{ borderRasdius: 10 }}
            />
        );
    }

    componentDidMount() {
        if (this.state.title.toString().length <= 0) {
            let title = this.props.route.params.title; // ", "Ad Hoc");
            this.setState({ title });
        }
        if (this.props.route.params?.type) {
            console.warn('adhoc type set from params - ', this.props.route.params?.type);
            this.setState({ type: this.props.route.params?.type });
            this.props.mAdHocStore.clearDate();
            this.props.mAdHocStore.setTripType(this.props.route.params?.type);
        }
        this.willFocusSubscription = this.props.navigation.addListener(
            'focus',
            () => {
                console.warn('did focus --- adhoc');
                if (this.state.type === adhocType.nonShift) {
                    this.setState({ type: adhocType.login });
                    this.props.mAdHocStore.clearDate();
                    this.props.mAdHocStore.setTripType(adhocType.login);
                }
            }
        );
    }

    componentWillUnmount() {
        // this.willFocusSubscription.remove();
    }

    render() {
        let store = this.props.mAdHocStore;
        if (this.state.isLoading) return <PleaseWaitLoader />;
        return (
            // <ViewLoader spinner={store.isLoading} style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1, flexDirection: 'column', backgroundColor: colors.WHITE }}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                        {this._renderAdhocType(store)}
                        {this._renderOfficeLayout(store)}
                        {this._renderDate(store)}
                    </View>
                    {store.isDatePickerVisible && this.renderDatePicker(store)}
                    {!store.isDatePickerVisible && (
                        <TouchableDebounce
                            style={buttonStyle}
                            onPress={() => {
                                if (!store.selectedOffice || !store.selectedOffice.hasOwnProperty("officeLocationName")) {
                                    Alert.alert(adhoc, "Please select the office");
                                    return
                                } else if (!store.dateSelected || store.dateSelected.includes(Select)) {
                                    Alert.alert(adhoc, "Please select the date");
                                    return;
                                }
                                store.getProgramsForDate().then(async () => {
                                    if (store.programs.length > 0) {
                                        await this.props.navigation.navigate("AdhocDataSelection", {
                                            title: this.state.type + " Adhoc"
                                        });
                                    } else {
                                        Alert.alert(adhoc, "No adhoc shifts available for selected day and office");
                                    }
                                });
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.WHITE,
                                    fontWeight: "500",
                                    fontSize: 20,
                                    marginLeft: 10
                                }}
                            >
                                {"Next"}
                            </Text>
                        </TouchableDebounce>
                    )}

                </SafeAreaView>
            // </ViewLoader>
        );
    }

    _renderOfficeLayout(store) {
        return (
            <View>
                <TouchableDebounce
                    onPress={() => {
                        store.hideDatePicker();
                        this.props.navigation.navigate("AdhocOfficeSelection", {
                            locations: store.Offices,
                            type: this.state.type,
                            selectedValue: (store.selectedOffice && store.selectedOffice.hasOwnProperty("officeLocationName")) ? store.selectedOffice.officeLocationName : Select
                        });
                    }}
                >
                    {_renderOffice("Office", (store.selectedOffice && store.selectedOffice.hasOwnProperty("officeLocationName")) ? store.selectedOffice.officeLocationName : Select)}
                </TouchableDebounce>
            </View>)
    }
}

const buttonStyle = {
    width: "100%",
    height: 50,
    backgroundColor: colors.BLUE_BRIGHT,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    flexDirection: "row"
};

export default AdhocLanding;