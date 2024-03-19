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
import {_renderDate, _renderOffice, _renderTitleContent} from "../roster/customeComponent/customComponent";
import Moment from "moment";
import {extendMoment} from "moment-range";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {adhoc} from "../../stores/modifiedAdHocStore";
import DatePicker from "react-native-modern-datepicker";
import { Select } from "../../utils/ConstantString";

const ViewLoader = HOC.LoaderHOC(View);
const moment = extendMoment(Moment);
const _ = require("lodash");

@inject("mAdHocStore")
@observer
class SearchFlexi extends Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: '' // navigation.getParam("title"),
        };
    };

    constructor(props) {
        super(props);
        this.state = ({
            title: "Adhoc"
        });
    }


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

    _renderShiftTime = (store) => {
        return (
            <View
                style={sourceStyle}
            >
                <TouchableDebounce
                    onPress={() => {
                        this.props.navigation.navigate("ShiftTimeSelector", {
                            time: store.shiftTimes,
                            selectedItem: store.selectedShiftTime,
                        });
                    }}
                    style={{width: "100%"}} s
                >
                    {_renderTitleContent(
                        "Shift Time",
                        store.selectedShiftTime,
                        store.timeSelected
                    )}
                </TouchableDebounce>
            </View>
        );
    };

    _renderSource = (store) => {
        return (
            <View
                style={sourceStyle}
            >
                <TouchableDebounce
                    onPress={() => {
                        if (store.dateSelected === Select) {
                            Alert.alert(adhoc, "Please select the date");
                        }else if (store.selectedShiftTime === Select) {
                            Alert.alert(adhoc, "Please select the shift time");
                        } else {
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
                        "Source",
                        store.selectedSource
                    )}
                </TouchableDebounce>
            </View>
        );
    };

    _renderDestination = (store) => {
        return (
            <View
                style={sourceStyle}
            >
                <TouchableDebounce
                    onPress={() => {
                        if (store.dateSelected === Select) {
                            Alert.alert(adhoc, "Please select the date");
                        }else if (store.selectedShiftTime === Select) {
                            Alert.alert(adhoc, "Please select the shift time");
                        }else {
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
                            }
                        }
                    }}
                >
                    {this._renderTitleContent(
                        "Destination",
                        store.selectedDestination,
                    )}
                </TouchableDebounce>
            </View>
        );
    };

    onFromValueChange(value: string) {
        this.props.mAdHocStore.setSourceLocation(value);
        if (value === "Others") {
            this.goToLocationPicker("from");
        }
    }

    onToValueChange(value: string) {
        this.props.mAdHocStore.setDestinationLocation(value);
        if (value === "Others") {
            this.goToLocationPicker("to");
        }
    }

    goToLocationPicker(type) {
        if (this.props.mAdHocStore.TDValidation.hasOwnProperty("TransportDistance")) {
            let TDValidation = this.props.mAdHocStore.TDValidation;
            this.props.navigation.navigate("MapPicker", {
                getLocationPicker: this.getLocationPicker.bind(this),
                clusterDetails: {
                    Clusterlat: TDValidation.OfficeLatitude,
                    Clusterlng: TDValidation.OfficeLongitude,
                    Clusterradius: TDValidation.TransportDistance,
                    ClusterOutOfRadiusMsg:TDValidation.Message
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
        let store = this.props.mAdHocStore;
        if (type === "from") {
            store.selectedSource = selectedLocation;
            store.fromSelectLat = selectLat;
            store.fromSelectLng = selectLng;
        } else if (type === "to") {
            store.selectedDestination = selectedLocation;
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

    render() {
        const adhocStoreObject = this.props.mAdHocStore;
        return (
            <View style={{flex: 1}}>
                {/* <ViewLoader spinner={adhocStoreObject.isLoading} style={{flex: 1}}> */}
                    <SafeAreaView
                        style={{flex: 1, backgroundColor: colors.WHITE, paddingTop: Platform.OS === 'ios' ? 20 : 0}}>
                        <StatusBar
                            translucent={false}
                            backgroundColor={colors.BLUE}
                            barStyle="dark-content"
                        />
                        <ScrollView style={{marginBottom: 50}}>
                            <View style={viewContainer}>
                                <View style={{marginTop: 20}}/>
                                {this._renderDate(adhocStoreObject)}
                                <View style={line}/>
                                {this._renderShiftTime(adhocStoreObject)}
                                <View style={line}/>
                                {this._renderSource(adhocStoreObject)}
                                 <View style={line}/>
                                {this._renderDestination(adhocStoreObject)}
                                 <View style={line}/>
                            </View>
                            {adhocStoreObject.isDatePickerVisible && this.renderDatePicker(adhocStoreObject)}
                        </ScrollView>
                        <TouchableDebounce
                            style={buttonStyle}
                            onPress={() => {
                                if (adhocStoreObject.isLoading) return;
                                this.searchFlexiCab(adhocStoreObject)
                            }}
                        >
                            {adhocStoreObject.isLoading ? (
                                <ActivityIndicator color={colors.WHITE} animating={true}/>
                            ) : (
                                <Text style={bottomButton}>{"Search"}</Text>
                            )}

                        </TouchableDebounce>
                    </SafeAreaView>
                {/* </ViewLoader> */}
            </View>
        );
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
                style={{borderRasdius: 10}}
            />
        );
    }

    renderTimePicker(store) {
        return (
            <DatePicker
                options={options}
                minimumDate={moment().format("YYYY-MM-DD")}
                maximumDate={moment(new Date()).add(30, 'days').format("YYYY-MM-DD")}
                mode="time"
                onSelectedChange={date => {
                    let dates = moment(date, "YYYY/MM/DD").format("YYYY-MM-DD");
                    store.handleDatePicked(dates);
                }}
                style={{borderRasdius: 10}}
            />
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


}

const sourceStyle = {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "column"
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
export default SearchFlexi;