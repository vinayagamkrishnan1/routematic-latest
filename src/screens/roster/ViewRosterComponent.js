import React from "react";
import {Alert, SafeAreaView, StatusBar, Text, View} from "react-native";
import {colors} from "../../utils/Colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import TouchableDebounce from "../../utils/TouchableDebounce";
import {_renderTitleContent} from "./customeComponent/customComponent";
import moment from "moment";
import {Button} from "native-base";
import {mapDelta} from "../../utils/MapHelper";

class ViewRosterComponent extends React.PureComponent {
    static navigationOptions = ({navigation}) => {
        return {
            headerStyle: {display: "none"}
        };
    };
    _renderHeader = title => (
        <View style={{flexDirection: "row", marginTop: 10}}>
            <Text
                style={{
                    fontSize: 25,
                    fontWeight: "500",
                    marginLeft: 20,
                    marginTop: 10,
                    color: colors.BLACK,
                    fontFamily: "Roboto"
                }}
            >
                {title}
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
                onPress={() => this.props.close()}
            />
        </View>
    );
    _renderStartEndTime = (loginSelected, logoutSelected) => {
        let date = moment(this.props.RosterDate, "YYYY-MM-DD").format("DD MMM YYYY");
        return (
            <View style={startEndDate}>
                <TouchableDebounce
                    disabled={!this.props.editRule.login || (this.props.rosterDetails.RosteringAllowedLogin === 0 && (loginSelected.includes("Select") ||
                        loginSelected.includes("Cancelled") || loginSelected.includes("---")))}
                    activeOpacity={this.props.rosterDetails.RosteringAllowedLogin === 1 ? 0.5 : 1}
                    onPress={() => {
                        if (this.props.loginTime === "Select" && this.props.calculatedRoster.LoginShifts.length <= 0) {
                            Alert.alert("Update Roster", "Login Shifts are not available for " + date);
                        } else {
                            this.props.editRule.login &&
                            this.props.navigation.navigate("TimePicker", {
                                shiftType: "login",
                                shiftTimes: this.props.loginTime === "Select" ? this.props.calculatedRoster.LoginShifts :
                                    this.props.RosterID === "0" ? this.props.calculatedRoster.LoginShifts : this.props.calculatedRoster.LoginShifts + "|Cancel",
                                selectedShiftTime: this.props.loginTime,
                                setLoginTime: this.props.setLoginTime
                            })
                        }
                    }
                    }
                    style={{
                        width: "50%"
                    }}
                >
                    {_renderTitleContent(
                        "Login Time",
                        loginSelected.includes("Select") ? (!this.props.editRule.login || this.props.rosterDetails.RosteringAllowedLogin === 0) ? "---" : "Select" : loginSelected,
                        ""
                    )}
                </TouchableDebounce>
                <TouchableDebounce
                    disabled={!this.props.editRule.logout || (this.props.rosterDetails.RosteringAllowedLogout === 0 && (logoutSelected.includes("Select") ||
                        logoutSelected.includes("Cancelled") || logoutSelected.includes("---")))}
                    activeOpacity={this.props.rosterDetails.RosteringAllowedLogout === 1 ? 0.5 : 1}
                    onPress={() => {
                        if (this.props.logoutTime === "Select" && this.props.calculatedRoster.LogoutShifts.length <= 0) {
                            Alert.alert("Update Roster", "Logout Shifts are not available for " + date);
                        } else {
                            this.props.editRule.logout &&
                            this.props.navigation.navigate("TimePicker", {
                                shiftType: "logout",
                                shiftTimes: this.props.logoutTime === "Select" ? this.props.calculatedRoster.LogoutShifts :
                                    this.props.RosterID === "0" ? this.props.calculatedRoster.LogoutShifts : this.props.calculatedRoster.LogoutShifts + "|Cancel",
                                selectedShiftTime: this.props.logoutTime,
                                setLogoutTime: this.props.setLogoutTime
                            })
                        }
                    }
                    }
                    style={{
                        width: "50%"
                    }}
                >
                    {_renderTitleContent(
                        "Logout Time",
                        logoutSelected.includes("Select") ? (!this.props.editRule.logout || this.props.rosterDetails.RosteringAllowedLogout === 0) ? "---" : "Select" : logoutSelected,
                        logoutSelected && (logoutSelected.includes("*")) ? "*" : ""
                    )}
                </TouchableDebounce>
            </View>
        );
    };

    _renderPickupAndDrop = (pickupLocation, dropLocation) => {
        let region;
        for (let i = 0; i < this.props.homeAddress.length; i++) {
            if (this.props.homeAddress[i].ID === "H") {
                region = {
                    latitude: parseFloat(this.props.homeAddress[i].Lat),
                    longitude: parseFloat(this.props.homeAddress[i].Lng),
                    ...mapDelta
                };
            }
        }
        let loginOfficeId = "";
        let logoutOfficeId = "";
        for (let i = 0; i < this.props.Offices.length; i++) {
            if (this.props.Offices[i].Name === this.props.loginOffice) {
                loginOfficeId = this.props.Offices[i].ID;
            }
            if (this.props.Offices[i].Name === this.props.logoutOffice) {
                logoutOfficeId = this.props.Offices[i].ID;
            }
        }
        return (
            <View style={startEndDate}>
                <View
                    style={{
                        flexDirection: "row"
                    }}
                >
                    <TouchableDebounce
                        disabled={!this.props.editRule.login || this.props.rosterDetails.RosteringAllowedLogin === 0}
                        activeOpacity={this.props.rosterDetails.RosteringAllowedLogin === 1 ? 0.5 : 1}
                        onPress={() => {
                            if (!this.props.editRule.login) return;
                            if (!this.props.loginTime || this.props.loginTime === "Select") {
                                Alert.alert("Update Roster", "Please select Login Time");
                                return;
                            }
                            let otherLocation;
                            let loginTime = this.props.loginTime.includes("Cancel") ? "NS" : this.props.loginTime.substring(0, 5);
                            for (let i = 0; i < this.props.rosterDetails.Rosters.length; i++) {
                                let rosters = this.props.rosterDetails.Rosters[i];
                                if (rosters.OfficeLocationsAllowed.includes(loginOfficeId) && (loginTime.includes("NS") || rosters.LoginShifts.includes(loginTime))) {
                                    otherLocation = rosters.AllowOtherLocationsLogin;
                                }
                            }
                            this.props.navigation.navigate("AddressPicker", {
                                type: "Pickup",
                                Locations: this.props.rosterDetails.RosteringAllowedLogin === 1
                                    ? otherLocation === 1
                                        ? [...this.props.otherLocation]
                                        : [...this.props.homeAddress]
                                    : [],
                                setLocation: this.props.setPickupLocation,
                                selected: this.props.pickupLocation,
                                showOtherLocation:
                                    this.props.calculatedRoster.AllowOtherLocationsLogin === 1,
                                addNewLocation: this.props.saveEmployeeLocation,
                                RestrictToPOI: this.props.calculatedRoster.RestrictToPOILogin,
                                MaxOtherLocationCount: this.props.rosterDetails.MaxOtherLocationCount,
                                region: region
                            });
                        }}
                        style={{
                            width: "50%"
                        }}
                    >
                        {_renderTitleContent(
                            "Pick up",
                            ((pickupLocation && !pickupLocation.includes("Select")))
                                ? this.checkNodalName(
                                pickupLocation,
                                this.props.rosterDetails.Locations,
                                this.props.calculatedRoster.RestrictToPOILogin
                                )
                                : (!this.props.editRule.login || this.props.rosterDetails.RosteringAllowedLogin === 0) ? "---" :"Select"
                        )}
                    </TouchableDebounce>
                    <TouchableDebounce
                        disabled={!this.props.editRule.logout || this.props.rosterDetails.RosteringAllowedLogout === 0}
                        activeOpacity={this.props.rosterDetails.RosteringAllowedLogout === 1 ? 0.5 : 1}
                        onPress={() => {
                            if (!this.props.editRule.logout) return;
                            if (!this.props.logoutTime || this.props.logoutTime === "Select") {
                                Alert.alert("Update Roster", "Please select Logout Time");
                                return;
                            }
                            let otherLocation;
                            let logoutTime = this.props.logoutTime.includes("Cancel") ? "NS" : this.props.logoutTime.substring(0, 5);
                            for (let i = 0; i < this.props.rosterDetails.Rosters.length; i++) {
                                let rosters = this.props.rosterDetails.Rosters[i];
                                if (rosters.OfficeLocationsAllowed.includes(logoutOfficeId) && (logoutTime.includes("NS") || rosters.LogoutShifts.includes(logoutTime))) {
                                    otherLocation = rosters.AllowOtherLocationsLogout;
                                }
                            }
                            this.props.navigation.navigate("AddressPicker", {
                                type: "Drop",
                                Locations: this.props.rosterDetails.RosteringAllowedLogout === 1
                                    ? otherLocation == "1"
                                        ? [...this.props.otherLocation]
                                        : [...this.props.homeAddress]
                                    : [],
                                setLocation: this.props.setDropLocation,
                                selected: this.props.dropLocation,
                                showOtherLocation: this.props.calculatedRoster.AllowOtherLocationsLogout === 1,
                                addNewLocation: this.props.saveEmployeeLocation,
                                RestrictToPOI: this.props.calculatedRoster.RestrictToPOILogout,
                                MaxOtherLocationCount: this.props.rosterDetails.MaxOtherLocationCount,
                                region: region
                            });
                        }}
                        style={{
                            width: "50%"
                        }}
                    >
                        {_renderTitleContent(
                            "Drop",
                            ((dropLocation && !dropLocation.includes("Select")))
                                ? this.checkNodalName(
                                dropLocation,
                                this.props.rosterDetails.Locations,
                                this.props.calculatedRoster.RestrictToPOILogout
                                )
                                : (!this.props.editRule.logout || this.props.rosterDetails.RosteringAllowedLogout === 0) ? "---" : "Select"
                        )}
                    </TouchableDebounce>
                </View>
            </View>
        );
    };
    _renderOfficePickupDrop = (
        pickupLocationSelected,
        dropLocationSelected
    ) => {
        return (
            <View style={startEndDate}>
                <View style={{flexDirection: "row"}}>
                    <TouchableDebounce
                        disabled={!this.props.editRule.login || this.props.rosterDetails.RosteringAllowedLogin === 0}
                        onPress={() => {
                            this.props.editRule.login &&
                            this.props.navigation.navigate("OfficePicker", {
                                Offices: this.props.Offices, //rosterDetails.Offices,
                                setOfficeLocation: this.props.setLoginOffice,
                                officeSelected: this.props.loginOffice //this.state.officeSelected
                            })
                        }}
                        style={{
                            width: "50%"
                        }}
                    >
                        {_renderTitleContent(
                            "Login Office",
                            pickupLocationSelected ? pickupLocationSelected : "Select"
                        )}
                    </TouchableDebounce>

                    <TouchableDebounce
                        disabled={!this.props.editRule.logout || this.props.rosterDetails.RosteringAllowedLogout === 0}
                        onPress={() => {
                            this.props.editRule.logout &&
                            this.props.navigation.navigate("OfficePicker", {
                                Offices: this.props.Offices, //rosterDetails.Offices,
                                setOfficeLocation: this.props.setLogoutOffice,
                                officeSelected: this.props.logoutOffice //this.state.officeSelected
                            })
                        }}
                        style={{
                            width: "50%"
                        }}
                    >
                        {_renderTitleContent(
                            "Logout Office",
                            dropLocationSelected ? dropLocationSelected : "Select"
                        )}
                    </TouchableDebounce>
                </View>
            </View>
        );
    };
    checkNodalName = (pickupLocationSelected, Locations, POIAllowed) => {
        let newName = "";
        if (Locations && parseInt(POIAllowed) === 1)
            Locations.map(location => {
                if (location.ID === "H" && pickupLocationSelected === location.Name) {
                    newName = location.Name + "-Nodal";
                }
            });
        return newName ? newName : pickupLocationSelected;
    };

    render() {
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: colors.LIGHT_GRAY
                }}
            >
                <View style={{flexDirection: "column", flex: 1}}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                    {this._renderHeader("Update Roster")}
                    <View style={dateStyle}>
                        <Text
                            style={{color: colors.GRAY, fontWeight: "700", fontSize: 15}}
                        >
                            {moment(this.props.RosterDate, "YYYY-MM-DD").format(
                                "DD MMM YYYY"
                            )}
                        </Text>
                    </View>

                    <View style={[itemStyle, {marginTop: 20}]}>
                        {this._renderOfficePickupDrop(
                            this.props.loginOffice,
                            this.props.logoutOffice
                        )}
                    </View>
                    <View style={itemStyle}>
                        {this._renderStartEndTime(
                            moment(this.props.RosterDate, "YYYY-MM-DD").isBefore(moment().format("YYYY-MM-DD"))
                                ? this.props.loginTime === "NS" ? "Cancelled" : this.props.loginTime === "Select" ? "No schedule" : this.props.loginTime
                                : this.props.loginTime,
                            moment(this.props.RosterDate, "YYYY-MM-DD").isBefore(moment().format("YYYY-MM-DD"))
                                ? this.props.logoutTime.includes("NS")
                                ? "Cancelled"
                                : this.props.logoutTime === "Select"
                                    ? (moment(this.props.RosterDate, "YYYY-MM-DD").isSame(moment().subtract(1, 'days').format("YYYY-MM-DD")) && this.props.calculatedRoster.LogoutShifts.includes("*"))
                                        ? "Select" : "No schedule" : this.props.logoutTime
                                : this.props.logoutTime
                        )}
                    </View>
                    <View style={itemStyle}>
                        {this._renderPickupAndDrop(
                            this.props.pickupLocation,
                            this.props.dropLocation
                        )}
                    </View>

                    {(!!this.props.showUpdateButton || !!this.props.showUpdateLoginButton || !!this.props.showUpdateLogoutButton) && (
                        <Button
                            full
                            style={{margin: 10}}
                            onPress={this.props.updateRoster}
                        >
                            <Text style={{color: colors.WHITE, fontWeight: "700"}}>
                                Update Roster
                            </Text>
                        </Button>
                    )}
                    {
                        (this.props.rosterDetails.RosteringAllowedLogin === 0 || this.props.rosterDetails.RosteringAllowedLogout === 0) && (
                            <Text style={{color: colors.GRAY, margin: 6, alignSelf: "center", fontWeight: "700"}}>
                                {(this.props.rosterDetails.RosteringAllowedLogin === 0 && this.props.rosterDetails.RosteringAllowedLogout === 0)
                                    ? "NOTE : Login & Logout Roster can be scheduled only by your SPOC"
                                    : this.props.rosterDetails.RosteringAllowedLogin === 0
                                        ? "NOTE : Login Roster can be scheduled only by your SPOC"
                                        : "NOTE : Logout Roster can be scheduled only by your SPOC"}
                            </Text>
                        )
                    }
                </View>
            </SafeAreaView>
        );
    }
}

ViewRosterComponent.propTypes = {};
const itemStyle = {
    marginTop: 8,
    marginLeft: 10,
    marginRight: 10,
    justifyContent: "center",
    height: 90,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2
};
const startEndDate = {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
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
    opacity: 0.8
};

export default ViewRosterComponent;
