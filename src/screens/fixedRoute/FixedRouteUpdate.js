import React, {Component} from "react";
import {Alert, Dimensions, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View} from "react-native";
import {colors} from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import {_renderInputContent} from "../roster/customeComponent/customComponent";
import moment from "moment";
import {Button, Card} from "native-base";

import {inject, observer} from "mobx-react";
import {roster} from "../../utils/ConstantString";
import {StackActions} from "@react-navigation/native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as Toast from "../../utils/Toast";
import { spinner } from "../../network/loader/Spinner";

@inject("fixedRouteStore")
@observer
class FixedRouteUpdate extends Component {

    constructor(props) {
        super(props);
        // props.fixedRouteStore.getFixedRouteLocations(this);
    }
    
    _renderSetDefault(Store) {
        return (
            <View
                style={[itemViewStyle, {
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignContent: "center",
                    alignItems: 'center'
                }]}
            >
                <FontAwesome
                    style={{
                        marginRight: 5,
                        // marginTop: 5
                    }}
                    name={Store.setFRDefault ? "check-square-o" : "square-o"}
                    size={30}
                    color={colors.BLACK}
                    onPress={() => {
                        Store.setAsDefault();
                    }}
                />
                <Text style={{
                    fontFamily: "Helvetica",
                    fontSize: 13,
                    textAlign: "left",
                    color: colors.GRAY,
                    marginLeft: 10
                }}>Remember this booking</Text>
            </View>
        )
    }

    _renderReset = (Store) => {
        return (
            <View style={itemViewStyle}>
                <View style={{
                    width: '50%'
                }}>
                    <TouchableDebounce
                        disabled={Store.selectedRoster.loginDisabled}
                        onPress={() => {
                            Store.updateLoginOffice({Name: "Select"});
                        }}
                    >
                        <View
                            style={{
                                paddingTop: 2,
                                paddingBottom: 2,
                                backgroundColor: colors.WHITE,
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                alignContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <MaterialIcons name={"refresh"} size={25} color={colors.BLACK}/>
                            <Text style={{
                                fontFamily: "Helvetica",
                                fontSize: 14,
                                textAlign: "left",
                                color: colors.BLACK,
                                fontWeight: 'bold',
                                marginLeft: 10
                            }}>Reset Login</Text>
                        </View>
                    </TouchableDebounce>
                </View>
                <View style={{
                    width: '50%',
                    marginLeft: 5
                }}>
                    <TouchableDebounce
                        disabled={Store.selectedRoster.logoutDisabled}
                        onPress={() => {
                            Store.updateLogOutOffice({Name: "Select"});
                        }}
                    >
                        <View
                            style={{
                                paddingTop: 2,
                                paddingBottom: 2,
                                backgroundColor: colors.WHITE,
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                alignContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <MaterialIcons name={"refresh"} size={25} color={colors.BLACK}/>
                            <Text style={{
                                fontFamily: "Helvetica",
                                fontSize: 14,
                                textAlign: "left",
                                color: colors.BLACK,
                                fontWeight: 'bold',
                                marginLeft: 10
                            }}>Reset Logout</Text>
                        </View>
                    </TouchableDebounce>
                </View>
            </View>
        );
    };

    _renderStartEndTime = (Store) => {
        return (
            <View style={itemViewStyle}>
                <View
                    style={{
                        flexDirection: "row"
                    }}
                >
                    <TouchableDebounce
                        disabled={Store.selectedRoster.loginDisabled}
                        onPress={() => {
                            if (!Store.isSelected(Store.selectedRoster.pickupLocationSelected)) {
                                Alert.alert("Fixed Route", "Please select pickup location");
                                return;
                            }

                            this.props.navigation.navigate("FixedRouteShiftPicker", {
                                type: roster.login,
                                selectedItem: Store.selectedRoster.loginSelected,
                                data: Store.LoginShifts
                            });
                        }}
                        style={{width: "50%"}}
                    >
                        {_renderInputContent("Login Time", Store.selectedRoster.loginSelected ? Store.selectedRoster.loginSelected : "")}
                    </TouchableDebounce>
                    <TouchableDebounce
                        disabled={Store.selectedRoster.logoutDisabled}
                        onPress={() => {
                            if (!Store.isSelected(Store.selectedRoster.dropLocationSelected)) {
                                Alert.alert("Fixed Route", "Please select drop location");
                                return;
                            }

                            this.props.navigation.navigate("FixedRouteShiftPicker", {
                                type: roster.logout,
                                selectedItem: Store.selectedRoster.logoutSelected,
                                data: Store.LogoutShifts
                            });
                        }}
                        style={{width: "50%", marginLeft: 5}}
                    >
                        {_renderInputContent("Logout Time", Store.selectedRoster.logoutSelected ? Store.selectedRoster.logoutSelected : "")}
                    </TouchableDebounce>
                </View>
            </View>
        );
    };

    _renderPickupAndDrop(Store) {
        return (
            <View style={itemViewStyle}>
                <View
                    style={{
                        flexDirection: "row"
                    }}
                >
                    <TouchableDebounce
                        disabled={Store.selectedRoster.loginDisabled}
                        onPress={() => {
                            if (!Store.isSelected(Store.selectedRoster.officeLoginSelected)) {
                                Alert.alert("Fixed Route", "Please select login office");
                                return;
                            }

                            this.props.navigation.navigate("FixedRoutePickUpDrop", {
                                type: roster.login,
                                selectedItem: Store.selectedRoster.pickupLocationSelected,
                                locations: Store.LoginLocations,
                                allowOtherLocation: false,
                                restrictToPOI : false
                            });
                        }}
                        style={{width: "50%"}}
                    >
                        {_renderInputContent(
                            "Pick up",
                            Store.selectedRoster.pickupLocationSelected
                        )}
                    </TouchableDebounce>
                    <TouchableDebounce
                        disabled={Store.selectedRoster.logoutDisabled}
                        onPress={() => {
                            if (!Store.isSelected(Store.selectedRoster.officeLogoutSelected)) {
                                Alert.alert("Fixed Route", "Please select logout office");
                                return;
                            }
                            this.props.navigation.navigate("FixedRoutePickUpDrop", {
                                type: roster.logout,
                                selectedItem: Store.selectedRoster.dropLocationSelected,
                                locations: Store.LogoutLocations,
                                allowOtherLocation: false,
                                restrictToPOI : false
                            });
                        }}
                        style={{width: "50%", marginLeft: 5}}
                    >
                        {_renderInputContent(
                            "Drop",
                            Store.selectedRoster.dropLocationSelected
                        )}
                    </TouchableDebounce>
                </View>
            </View>
        );
    };

    _renderRoutes(Store) {
        return (
            <View style={itemViewStyle}>
                <View
                    style={{
                        flexDirection: "row"
                    }}
                >
                    <TouchableDebounce
                        disabled={Store.selectedRoster.loginDisabled}
                        onPress={() => {
                            if (!Store.isSelected(Store.selectedRoster.loginSelected)) {
                                Alert.alert("Fixed Route", "Please select login time");
                                return;
                            }

                            this.props.navigation.navigate("FixedRoutePicker", {
                                type: roster.login,
                                selectedItem: Store.selectedRoster.loginRouteSelected,
                                routesList: Store.LoginRoutes
                            });
                        }}
                        style={{width: "50%"}}
                    >
                        {_renderInputContent(
                            "Login Route",
                            Store.selectedRoster.loginRouteSelected
                        )}
                    </TouchableDebounce>
                    <TouchableDebounce
                        disabled={Store.selectedRoster.logoutDisabled}
                        onPress={() => {
                            if (!Store.isSelected(Store.selectedRoster.logoutSelected)) {
                                Alert.alert("Fixed Route", "Please select logout time");
                                return;
                            }
                            this.props.navigation.navigate("FixedRoutePicker", {
                                type: roster.logout,
                                selectedItem: Store.selectedRoster.logoutRouteSelected,
                                routesList: Store.LogoutRoutes
                            });
                        }}
                        style={{width: "50%", marginLeft: 5}}
                    >
                        {_renderInputContent(
                            "Logout Route",
                            Store.selectedRoster.logoutRouteSelected
                        )}
                    </TouchableDebounce>
                </View>
            </View>
        );
    };

    _renderOfficePickupDrop(Store) {
        return (
            <View style={itemViewStyle}>
                <View style={{flexDirection: "row"}}>
                    <TouchableDebounce
                        disabled={Store.selectedRoster.loginDisabled}
                        onPress={() => {
                            this.props.navigation.navigate("FixedRouteOfficePicker", {
                                type: roster.login,
                                selectedItem: Store.selectedRoster.officeLoginSelected
                            });
                        }}
                        style={{width: "50%"}}
                    >
                        {_renderInputContent(
                            "Login Office",
                            Store.selectedRoster.officeLoginSelected
                        )}
                    </TouchableDebounce>

                    <TouchableDebounce
                        disabled={Store.selectedRoster.logoutDisabled}
                        onPress={() => {
                            this.props.navigation.navigate("FixedRouteOfficePicker", {
                                type: roster.logout,
                                selectedItem: Store.selectedRoster.officeLogoutSelected
                            });
                        }}
                        style={{width: "50%", marginLeft: 5}}
                    >
                        {_renderInputContent(
                            "Logout Office",
                            Store.selectedRoster.officeLogoutSelected
                        )}
                    </TouchableDebounce>
                </View>
            </View>
        );
    };

    _renderSelectedDates(Store) {
        let startDateText = Store.fromDate;
        let endDateText = Store.toDate;
        var startDate = moment(Store.fromDate);
        var endDate = moment(Store.toDate);
        return (
            <View style={styles.result}>
                <View style={styles.resultPart}>
                    <Text style={[styles.resultText, styles.startText, selection]}>
                        FROM DATE
                    </Text>
                    <View style={{flexDirection: "row"}}>
                        <Text
                            style={[styles.resultText, styles.startText, {
                                fontFamily: "Helvetica",
                                fontSize: 25,
                                alignSelf: "center"
                            },
                                startDateText ? selection : subFontColor]}>
                            {startDateText ? this.dayNumber(startDate) : "--"}
                        </Text>
                        <View style={{flexDirection: "column", marginLeft: 5, justifyContent: "center"}}>
                            <Text
                                style={[styles.startText, subFontColor]}>
                                {startDateText ? this.dayMonthYear(startDate) : ""}
                            </Text>
                            <Text
                                style={[styles.startText, subFontColor]}>
                                {startDateText ? this.dayName(startDate) : ""}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.resultSlash]}>
                    <Text
                        style={{
                            fontSize: 14,
                            alignSelf: "center",
                            marginVertical: 2,
                            alignItems: "center",
                            color: '#FFFFFF'
                        }}>
                        {this.numberOfDaysBetweenDates(Store)}
                    </Text>
                </View>
                <View style={styles.resultPart}>
                    <Text style={[styles.resultText, styles.endText, selection]}>
                        TO DATE
                    </Text>
                    <View style={{flexDirection: "row", justifyContent: "flex-end"}}>
                        <Text
                            style={[styles.resultText, styles.endText, {
                                fontFamily: "Helvetica",
                                fontSize: 25,
                                alignSelf: "center"
                            },
                                endDateText ? selection : subFontColor]}>
                            {endDateText ? this.dayNumber(endDate) : "--"}
                        </Text>
                        <View style={{flexDirection: "column", marginLeft: 5, justifyContent: "center"}}>
                            <Text
                                style={[styles.startText, subFontColor]}>
                                {endDateText ? this.dayMonthYear(endDate) : ""}
                            </Text>
                            <Text
                                style={[styles.startText, subFontColor]}>
                                {endDateText ? this.dayName(endDate) : ""}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    dayNumber(date) {
        return moment(date).format("DD");
    }

    dayName(date) {
        return moment(date).format("dddd")
    }

    dayMonthYear(date) {
        return moment(date).format("MMM YYYY");
    }

    numberOfDaysBetweenDates_(start, end) {
        console.warn('numberOfDaysBetweenDates - ', start, end);
        return end.diff(start, 'days') + 1;
    }

    numberOfDaysBetweenDates(Store) {
        var _days = Store.bookingDates.length;
        if (_days > 1) {
            return (_days + ' days');
        } else {
            return (_days + ' day');
        }
    }

    _renderDisclaimerUpdateType = () => (
        <View padder style={{marginTop: 16, backgroundColor: "#FFFFFF"}}>
            <Card style={{padding: 10}}>
                <ScrollView>
                    {this._renderContent(this.props.fixedRouteStore.optOutContent)}
                    {this._renderTC()}
                </ScrollView>
            </Card>
        </View>
    );

    _renderContent(data) {
        return <Text style={{marginTop: 8}}>{data}</Text>;
    }

    _renderTC() {
        return (
            <React.Fragment>
                <Button
                    style={{
                        width: "100%",
                        backgroundColor: colors.WHITE,
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "row",
                        marginTop: 5
                    }}
                    onPress={() => this.props.fixedRouteStore.toggleAccept()}
                >
                        <View 
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                    >
                    <FontAwesome
                        name={this.props.fixedRouteStore.accepted ? "check-square-o" : "square-o"}
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
                        style={{width: "45%", backgroundColor: colors.RED}}
                        onPress={() => {
                            this.props.fixedRouteStore.disableOptOutVisible();
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
                            backgroundColor: this.props.fixedRouteStore.accepted
                                ? "rgba(50,205,50,1)"
                                : "rgba(192,192,192,0.5)"
                        }}
                        onPress={() => {
                            console.warn('--- this.props.fixedRouteStore.accepted --- ', this.props.fixedRouteStore.accepted);
                            if (!this.props.fixedRouteStore.accepted) {
                                Toast.show("Please Accept the Opt-Out");
                                return;
                            }
                            this.props.fixedRouteStore.rosterOptOutSelected();
                            this.storeUpdate();
                        }}
                    >
                        <Text style={{color: colors.WHITE}}>Accept</Text>
                    </Button>
                </View>
            </React.Fragment>
        );
    }


    render() {
        const Store = this.props.fixedRouteStore;
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: colors.LIGHT_GRAY
                }}
            >
                <ScrollView>
                <View style={{flexDirection: "column", flex: 1}}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                    
                    {spinner.visible(this.props.fixedRouteStore.isLoading)}

                    {this._renderSelectedDates(Store)}

                    <View style={[itemStyle, {marginTop: 5}]}>
                        {this._renderOfficePickupDrop(Store)}
                    </View>
                    <View style={itemStyle}>
                        {this._renderPickupAndDrop(Store)}
                    </View>
                    <View style={itemStyle}>
                        {this._renderStartEndTime(Store)}
                    </View>
                    <View style={itemStyle}>
                        {this._renderRoutes(Store)}
                    </View>
                    <View style={[itemStyle, {height: 50, marginTop: 25}]}>
                        {this._renderReset(Store)}
                    </View>

                    {(!Store.selectedRoster.loginDisabled && !Store.selectedRoster.loginDisabled) && (
                        <View style={[itemStyle, {height: 50}]}>
                            {this._renderSetDefault(Store)}
                        </View>
                    )}

                    {(Store.selectedRoster.anyChangeInDataLogin || Store.selectedRoster.anyChangeInDataLogout) && (
                        <Button
                            backgroundColor={colors.BLUE}
                            style={{margin: 10}}
                            onPress={()=>{
                                this.storeUpdate();
                            }}
                        >
                            <Text style={{color: colors.WHITE, fontWeight: "700"}}>
                                Next
                            </Text>
                        </Button>
                    )}
                </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
    
    storeUpdate(){
        const store = this.props.fixedRouteStore;
        console.warn('Selected Roster -> ', store.selectedRoster);
        // if (!store.selectedRoster.anyChangeInDataLogin || !store.selectedRoster.anyChangeInDataLogout) {
        //     Alert.alert("Fixed Route", "Roster not changed");
        //     return;
        // }
        /*********************************** Validation ***********************************/
        if (store.isSelected(store.selectedRoster.officeLoginSelected) && store.isSelected(store.selectedRoster.officeLogoutSelected)) {
            if (!store.isSelected(store.selectedRoster.officeLoginSelected)) {
                Alert.alert("Fixed Route", "Select login office");
                return;
            }
            if (!store.isSelected(store.selectedRoster.officeLogoutSelected)) {
                Alert.alert("Fixed Route", "Select logout office");
                return;
            }
    
            if (!store.isSelected(store.selectedRoster.pickupLocationSelected)) {
                Alert.alert("Fixed Route", "Select pickup location");
                return;
            }
            if (!store.isSelected(store.selectedRoster.dropLocationSelected)) {
                Alert.alert("Fixed Route", "Select drop location");
                return;
            }
    
            if (!store.isSelected(store.selectedRoster.loginSelected)) {
                Alert.alert("Fixed Route", "Select login time");
                return;
            }
            if (!store.isSelected(store.selectedRoster.logoutSelected)) {
                Alert.alert("Fixed Route", "Select logout time");
                return;
            }
    
            if (!store.isSelected(store.selectedRoster.loginRouteSelected)) {
                Alert.alert("Fixed Route", "Select login route");
                return;
            }
            if (!store.isSelected(store.selectedRoster.logoutRouteSelected)) {
                Alert.alert("Fixed Route", "Select logout route");
                return;
            }
        } else if (store.isSelected(store.selectedRoster.officeLoginSelected) && !store.isSelected(store.selectedRoster.officeLogoutSelected)) {
            if (
                !store.isSelected(store.selectedRoster.pickupLocationSelected)
            ) {
                Alert.alert("Fixed Route", "Select pickup location");
                return;
            }
    
            if (
                !store.isSelected(store.selectedRoster.loginSelected)
            ) {
                Alert.alert("Fixed Route", "Select login time");
                return;
            }
    
            if (
                !store.isSelected(store.selectedRoster.loginRouteSelected)
            ) {
                Alert.alert("Fixed Route", "Select login route");
                return;
            }
        } else if (!store.isSelected(store.selectedRoster.officeLoginSelected) && store.isSelected(store.selectedRoster.officeLogoutSelected)) {
            if (
                !store.isSelected(store.selectedRoster.dropLocationSelected)
            ) {
                Alert.alert("Fixed Route", "Select drop location");
                return;
            }
    
            if (
                !store.isSelected(store.selectedRoster.logoutSelected)
            ) {
                Alert.alert("Fixed Route", "Select logout time");
                return;
            }
    
            if (
                !store.isSelected(store.selectedRoster.logoutRouteSelected)
            ) {
                Alert.alert("Fixed Route", "Select logout route");
                return;
            }
        } else {
            if (
                !store.isSelected(store.selectedRoster.officeLoginSelected) ||
                !store.isSelected(store.selectedRoster.officeLogoutSelected)
            ) {
                Alert.alert("Fixed Route", "Select login or logout office");
                return;
            }
        }
       
        this.props.fixedRouteStore.getFixedRouteDetail(this).then((response)=>{
            this.props.navigation.navigate("FixedRouteDetailsNEW");
        });
    }

    displayNoSHowAlerts(title, message) {
        Alert.alert(
            title,
            message,
            [
                {
                    text: 'NO',
                    onPress: () => {
                        if (this.RBSheet)
                            this.RBSheet.close();
                    },
                    style: 'cancel',
                },
                {
                    text: 'YES', onPress: () => {
                        this.props.fixedRouteStore.noShowPerformed=true;
                        this.storeUpdate();
                    }
                },
            ],
            {cancelable: false},
        )
    }

}

FixedRouteUpdate.propTypes = {};

const itemStyle = {
    marginVertical: 2,
    marginLeft: 10,
    marginRight: 10,
    justifyContent: "center",
    height: 70,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2
};
const itemViewStyle = {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    backgroundColor: colors.WHITE,
    justifyContent: "center",
    alignItems: "center"
};
const dateStyle = {
    backgroundColor: colors.LIGHT_GRAY,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    opacity: 0.8,
    marginTop: 10
};

const color = {
    mainColor: '#F6F6F6',
    subColor: '#000',
    borderColor: 'rgba(255, 255, 255, 0.50)',
    selectionColor: '#4a90e2'
  };
//   let color = {mainColor, subColor, borderColor, selectionColor};
  let mainBack = {backgroundColor: color.mainColor};
  let subBack = {backgroundColor: color.subColor};
  let mainFontColor = {color: color.mainColor};
  let subFontColor = {color: color.subColor};
  let selection = {color: color.selectionColor}

const {scale, width} = Dimensions.get('window');
let iconSize = 26;
let resultFontSize = 22;
let weekTextFontSize = 14;
let slashLength = 60;
let divideLength = width;
if (width < 350) {
    resultFontSize = 18;
    weekTextFontSize = 12;
    iconSize = 20;
    slashLength = 50;
}
const styles = StyleSheet.create({
      result: {
        paddingVertical: 5,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      },
      resultSlash: {
        width: 60,
        backgroundColor: '#9C9C9C',
        borderRadius: 8
      },
    //   divider: {
    //       width: divideLength,
    //       height: 1,
    //       backgroundColor: 'rgba(131,131,131,0.4)'
    //   },
      resultPart: {
        flex: 1
      },
      resultText: {
        // fontSize: resultFontSize,
        // marginVertical: 4,
        // fontWeight: '200'
    
        marginVertical: 2,
        alignItems: "center"
      },
    //   clearText: {
    //     fontSize: 18,
    //     fontWeight: '400'
    //   },
      startText: {
        textAlign: 'left',
    
        // fontSize: 12
      },
      endText: {
        textAlign: 'right'
      },
});

export default FixedRouteUpdate;
