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
import {_renderOffice} from "../roster/customeComponent/customComponent";
import moment from "moment";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {adhocType} from "./AdhocLanding";
import {adhoc} from "../../stores/modifiedAdHocStore";
import { noShow, Select} from "../../utils/ConstantString";

const ViewLoader = HOC.LoaderHOC(View);
const _ = require("lodash");

@inject("mAdHocStore")
@observer
class AdhocDataSelection extends Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: '' // navigation.getParam("title"),
        };
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
                    {this._renderTitleContent(
                        "Shift Time",
                        store.selectedShiftTime,
                        store.selectedShiftTime
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
                        console.warn('Source - ', store.selectedShiftTime, store.selectedProgram);
                        if (store.selectedShiftTime === Select) {
                            Alert.alert(adhoc, "Please select the shift time");
                        } else if (store.selectedProgram === Select) {
                            Alert.alert(adhoc, "Please select the program");
                        } else {
                            this.props.navigation.navigate("LocationSelector", {
                                locations: store.sourceLocations,
                                type: "from",
                                onFromValueChange: this.onFromValueChange.bind(this),
                                other: false,
                                selectedValue: store.selectedSource,
                            });
                        }
                    }}
                >
                    {this._renderTitleContent(
                        "Pickup From",
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
                        if (store.selectedShiftTime === Select) {
                            Alert.alert(adhoc, "Please select the shift time");
                        } else if (store.selectedProgram === Select) {
                            Alert.alert(adhoc, "Please select the program");
                        } else {
                            this.props.navigation.navigate("LocationSelector", {
                                locations: store.destinationLocation,
                                type: "to",
                                onToValueChange: this.onToValueChange.bind(this),
                                other: false,
                                selectedValue: store.selectedDestination,
                            });
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
    _renderLineManger = (store) => {
        return (
            <View
                style={sourceStyle}
            >
                <TouchableDebounce
                    disabled={store.lineManagers.length <= 1}
                    onPress={() => {
                        this.props.navigation.navigate("LineManagerSelector", {
                            selectedValue: store.lineManager,
                            lineManagerArray:store.lineManagers,
                            onLineManagerSelected: this.onLineManagerSelected.bind(this),
                            adhoc:true
                        });
                    }}
                >
                    {this._renderTitleContent(
                        "Line Manager",
                        store.selectedLineManager,
                        "lineManger"
                    )}
                </TouchableDebounce>
            </View>
        );
    };
    _renderCostCenter = (store) => {
        return (
            <View style={sourceStyle}>
                <TouchableDebounce
                    onPress={() => {
                        this.props.navigation.navigate("CostCenterSelector", {
                            selectedValue: store.selectedCostCenter,
                            onCostCenterSelected: this.onCostCenterSelected.bind(this),
                            costCenterList:store.costCentersArray,
                            adhoc:true
                        });
                    }}
                >
                    {this._renderTitleContent(
                        "Cost Center",
                        store.selectedCostCenter.hasOwnProperty('Name') ? store.selectedCostCenter.Name : Select,
                        undefined,
                        "cost"
                    )}
                </TouchableDebounce>
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
                        marginRight: 3,
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
    _renderTripPurpose = (store) => {
        return (
            <View style={{flex: 1, flexDirection: "row",}}>
                <TouchableDebounce
                    onPress={() => {
                        if (store.selectedShiftTime === Select) {
                            Alert.alert(adhoc, "Please select the shift time");
                        } else if (store.selectedProgram === Select) {
                            Alert.alert(adhoc, "Please select the program");
                        } else if (!store.isLocationSelected()) {
                            Alert.alert(adhoc, "Please select the Locations");
                        } else {
                            this.props.navigation.navigate("TripPurpose",{
                                adhoc:true,
                            });
                        }
                    }}
                >
                    {_renderOffice(
                        "Trip Purpose",
                        (store.selectedTripPurposes !== {} && store.selectedTripPurposes.hasOwnProperty("Purpose")) ?
                            store.selectedTripPurposes.Purpose : Select,
                        "",
                        ""
                    )}
                </TouchableDebounce>
            </View>
        );
    };

    constructor(props) {
        super(props);
        this.state = ({
            title: "Adhoc"
        });
        this.props.mAdHocStore.setNavigation(this.props.navigation);
    }

    _renderProgram(store) {

        return (
            <View style={{flex: 1, flexDirection: "row",}}>
                <TouchableDebounce
                    style={{flex: 1}}
                    onPress={() => {
                        if (store.selectedShiftTime === Select) {
                            Alert.alert(adhoc, "Please select shift time");
                        } else {
                            this.props.navigation.navigate("ProgramSelector", {
                                selectedItem: store.selectedProgram.hasOwnProperty("ProgramName") ? store.selectedProgram.ProgramName : Select,
                                programs: store.programsArray,
                                onProgramSelected: this.onProgramSelected.bind(this)
                            });
                        }
                    }}
                >
                    {_renderOffice("Program", store.selectedProgram.ProgramName ? store.selectedProgram.ProgramName : Select)}
                </TouchableDebounce>
            </View>)
    }

    onProgramSelected(program) {
        this.props.mAdHocStore.setSelectedProgram(program);
    }

    onFromValueChange(value: string) {

        this.props.mAdHocStore.setSourceLocation(value);
        if (value === "Others") {
            this.goToLocationPicker("from");
        }
    }

    onLineManagerSelected(lineManager){
        this.props.mAdHocStore.setLineManager(lineManager);
    }

    onCostCenterSelected(costCenter){
        this.props.mAdHocStore.setCostCenter(costCenter);
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
                    ClusterOutOfRadiusMsg: TDValidation.Message
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
        let program = adhocStoreObject.selectedProgram;
        return (
            <View style={{flex: 1}}>
                {/* <ViewLoader spinner={this.props.mAdHocStore.isLoading} style={{flex: 1}}> */}
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
                                {this._renderShiftTime(adhocStoreObject)}
                                <View style={line}/>
                                {this._renderProgram(adhocStoreObject)}
                                <View style={line}/>
                                {(adhocStoreObject.tripType === adhocType.login) && this._renderSource(adhocStoreObject)}
                                {(adhocStoreObject.tripType === adhocType.login) && <View style={line}/>}
                                {(adhocStoreObject.tripType === adhocType.logout) && this._renderDestination(adhocStoreObject)}
                                {(adhocStoreObject.tripType === adhocType.logout) && <View style={line}/>}
                                {(program.hasOwnProperty('TripPurposeDisplay') && program.TripPurposeDisplay === "1") && this._renderTripPurpose(adhocStoreObject)}
                                {(program.hasOwnProperty('TripPurposeDisplay') && program.TripPurposeDisplay === "1") &&
                                <View style={line}/>}
                                {(program.hasOwnProperty('IsCostCenterSelection') && program.IsCostCenterSelection === true && adhocStoreObject.isApproverNameEditable === true) && this._renderCostCenter(adhocStoreObject)}
                                {(program.hasOwnProperty('IsCostCenterSelection') && program.IsCostCenterSelection === true && adhocStoreObject.isApproverNameEditable === true) &&
                                <View style={line}/>}
                                {adhocStoreObject.isLocationSelected() && this._renderLineManger(adhocStoreObject)}
                            </View>
                        </ScrollView>
                        <TouchableDebounce
                            style={buttonStyle}
                            onPress={() => {
                                let date = moment(adhocStoreObject.dateSelected).format("DD-MMM");
                                let message  = noShow.adhocAlert1.replace("LOGIN",adhocStoreObject.tripType).replace("DATE",date);
                                this.displayRosterCancelAlert(adhocStoreObject,message);
                            }}
                        >
                            {adhocStoreObject.isLoading ? (
                                <ActivityIndicator color={colors.WHITE} animating={true}/>
                            ) : (
                                <Text style={bottomButton}>Submit</Text>
                            )}

                        </TouchableDebounce>
                    </SafeAreaView>
                {/* </ViewLoader> */}
            </View>
        );
    }

    displayRosterCancelAlert(store,message) {
        Alert.alert(
            adhoc,
            message,
            [
                {
                    text: 'NO',
                    style: 'cancel',
                },
                {
                    text: 'YES', onPress: () => {
                        store.SaveShiftAdHoc(this.state.title);
                    }
                },
            ],
            {cancelable: false},
        )
    }

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
export default AdhocDataSelection;