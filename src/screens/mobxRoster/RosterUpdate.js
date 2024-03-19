import React, {Component} from "react";
import {Alert, Platform, SafeAreaView, ScrollView, StatusBar, Text, View} from "react-native";
import {colors} from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import {_renderTitleContent} from "../roster/customeComponent/customComponent";
import moment from "moment";
import {Box, Button, Card} from "native-base";
import Modal from "react-native-modal";

import {inject, observer} from "mobx-react";
import {roster} from "../../utils/ConstantString";
import {StackActions} from "@react-navigation/native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import * as Toast from "../../utils/Toast";

@inject("rosterStore")
@observer
class RosterUpdate extends Component {

    static navigationOptions = {
        title: "Update Roster",
        headerTitleStyle: {fontFamily: "Roboto"}
    };

    _renderStartEndTime = (Store) => {
        return (
            <View style={startEndDate}>
                <TouchableDebounce
                    disabled={Store.selectedRoster.loginDisabled}
                    activeOpacity={Store.selectedRoster.loginDisabled ? 0.5 : 1}
                    onPress={() => {
                        if (Store.selectedRoster.loginSelected === "Select" && Store.calculateRoster[0].LoginShifts.trim().length <= 0) {
                            Alert.alert("Update Roster", "Login Shifts are not available for " + Store.RosterDate);
                        } else {
                            this.props.navigation.navigate("RosterShiftPicker", {
                                type: roster.login,
                                selectedItem: Store.selectedRoster.loginSelected,
                                data: Store.selectedRoster.RosterID === "0"
                                    ? Store.calculateRoster[0].LoginShifts :
                                    Store.calculateRoster[0].LoginShifts + "|Cancel"
                            });
                        }
                    }}
                    style={{width: "50%"}}
                >
                    {_renderTitleContent("Login Time", Store.selectedRoster.loginSelected ? Store.selectedRoster.loginSelected : "")}
                </TouchableDebounce>
                <TouchableDebounce
                    disabled={Store.selectedRoster.logOutDisabled}
                    activeOpacity={Store.selectedRoster.loginDisabled ? 0.5 : 1}
                    onPress={() => {
                        console.warn("Logout "+Store.calculateRoster[0].LogoutShifts);
                        if (Store.selectedRoster.loginSelected === "Select" && Store.calculateRoster[0].LogoutShifts.trim().length <= 0) {
                            Alert.alert("Update Roster", "Logout Shifts are not available for " + Store.RosterDate);
                        } else {
                            this.props.navigation.navigate("RosterShiftPicker", {
                                type: roster.logout,
                                selectedItem: Store.selectedRoster.logoutSelected,
                                data: Store.selectedRoster.RosterID === "0"
                                    ? Store.calculateRoster[0].LogoutShifts
                                    : Store.calculateRoster[0].LogoutShifts + "|Cancel"
                            });
                        }
                    }}
                    style={{width: "50%"}}
                >
                    {_renderTitleContent("Logout Time", Store.selectedRoster.logoutSelected ? Store.selectedRoster.logoutSelected : "",
                        Store.selectedRoster.logoutSelected ? Store.selectedRoster.logoutSelected : "")}
                </TouchableDebounce>
            </View>
        );
    };

    checkNodalName = (selected,Locations, POIAllowed) => {
        let newName = "";
        if (Locations.length>0 && parseInt(POIAllowed) === 1)
            Locations.map(location => {
                if (location.ID === "H" && selected === location.Name) {
                    newName = location.Name + "-Nodal";
                }
            });
        return newName ? newName : selected;
    };

    _renderPickupAndDrop(Store) {
        return (
            <View style={startEndDate}>
                <View
                    style={{
                        flexDirection: "row"
                    }}
                >
                    <TouchableDebounce
                        disabled={Store.selectedRoster.loginDisabled || !!Store.pickupDisabled}
                        activeOpacity={Store.selectedRoster.loginDisabled === 1 ? 0.5 : 1}
                        onPress={() => {
                            if (Store.selectedRoster.loginDisabled) return;
                            if (!Store.selectedRoster.loginSelected || Store.selectedRoster.loginSelected === "Select") {
                                Alert.alert("Update Roster", "Please select Login Time");
                                return;
                            }
                            console.warn("AllowOtherLocationsLogin "+(Store.calculateRoster[0].AllowOtherLocationsLogin));
                            console.warn("RestrictToPOILogin "+JSON.stringify(Store.calculateRoster[0].RestrictToPOILogin));

                            this.props.navigation.navigate("RosterPickUpDrop", {
                                type: roster.login,
                                selectedItem: Store.selectedRoster.pickupLocationSelected,
                                allowOtherLocation:parseInt(Store.calculateRoster[0].AllowOtherLocationsLogin) === 1,
                                restrictToPOI : parseInt(Store.calculateRoster[0].RestrictToPOILogin)===1
                            });
                        }}
                        style={{width: "50%"}}
                    >
                        {_renderTitleContent(
                            "Pick up",
                            this.checkNodalName(Store.selectedRoster.pickupLocationSelected,Store.Locations,Store.calculateRoster[0].RestrictToPOILogin)
                        )}
                    </TouchableDebounce>
                    <TouchableDebounce
                        disabled={Store.selectedRoster.logOutDisabled|| !!Store.dropDisabled}
                        activeOpacity={Store.selectedRoster.logOutDisabled ? 0.5 : 1}
                        onPress={() => {
                            if (Store.selectedRoster.logOutDisabled) return;
                            if (Store.selectedRoster.logoutSelected === "Select") {
                                Alert.alert("Update Roster", "Please select Logout Time");
                                return;
                            }
                            this.props.navigation.navigate("RosterPickUpDrop", {
                                type: roster.logout,
                                selectedItem: Store.selectedRoster.dropLocationSelected,
                                allowOtherLocation:Store.calculateRoster[0].AllowOtherLocationsLogout === 1,
                                restrictToPOI : Store.calculateRoster[0].RestrictToPOILogout===1
                            });
                        }}
                        style={{width: "50%"}}
                    >
                        {_renderTitleContent(
                            "Drop",
                            this.checkNodalName(Store.selectedRoster.dropLocationSelected,Store.Locations,Store.calculateRoster[0].RestrictToPOILogout)
                        )}
                    </TouchableDebounce>
                </View>
            </View>
        );
    };

    _renderOfficePickupDrop(Store) {
        return (
            <View style={startEndDate}>
                <View style={{flexDirection: "row"}}>
                    <TouchableDebounce
                        disabled={Store.selectedRoster.loginDisabled}
                        onPress={() => {
                            this.props.navigation.navigate("RosterOfficePicker", {
                                type: roster.login,
                                selectedItem: Store.selectedRoster.officeLoginSelected
                            });
                        }}
                        style={{width: "50%"}}
                    >
                        {_renderTitleContent(
                            "Login Office",
                            Store.selectedRoster.officeLoginSelected
                        )}
                    </TouchableDebounce>

                    <TouchableDebounce
                        disabled={Store.selectedRoster.logOutDisabled}
                        onPress={() => {
                            this.props.navigation.navigate("RosterOfficePicker", {
                                type: roster.logout,
                                selectedItem: Store.selectedRoster.officeLogoutSelected
                            });
                        }}
                        style={{width: "50%"}}
                    >
                        {_renderTitleContent(
                            "Logout Office",
                            Store.selectedRoster.officeLogoutSelected
                        )}
                    </TouchableDebounce>
                </View>
            </View>
        );
    };

    _renderDisclaimerUpdateType = () => (
        <View padder style={{marginTop: 16, backgroundColor: "#FFFFFF"}}>
            <Box style={{padding: 10}}>
                <ScrollView>
                    {this._renderContent(this.props.rosterStore.optOutContent)}
                    {this._renderTC()}
                </ScrollView>
            </Box>
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
                        backgroundColor: 'transparent',
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "row",
                        marginTop: 5
                    }}
                    onPress={() => this.props.rosterStore.toggleAccept()}
                >
                        <View 
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                    >
                    <FontAwesome
                        name={this.props.rosterStore.accepted ? "check-square-o" : "square-o"}
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
                            this.props.rosterStore.disableOptOutVisible();
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
                            backgroundColor: this.props.rosterStore.accepted
                                ? "rgba(50,205,50,1)"
                                : "rgba(192,192,192,0.5)"
                        }}
                        onPress={() => {
                            console.warn('--- this.props.rosterStore.accepted --- ', this.props.rosterStore.accepted);
                            if (!this.props.rosterStore.accepted) {
                                Toast.show("Please Accept the Opt-Out");
                                return;
                            }
                            this.props.rosterStore.rosterOptOutSelected();
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
        const Store = this.props.rosterStore;
        console.warn("Calculated Roster "+JSON.stringify(Store.calculateRoster))
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
                    <Modal
                        isVisible={this.props.rosterStore.visibleOptOutModal === true && Platform.OS == 'ios'}
                        style={{justifyContent: 'center', marginVertical: 40, alignContent: 'center'}}
                    >
                        {this._renderDisclaimerUpdateType()}
                    </Modal>
                    <View style={dateStyle}>
                        <Text style={{color: colors.GRAY, fontWeight: "700", fontSize: 15}}>
                            {moment(this.props.rosterStore.RosterDate, "YYYY-MM-DD").format("DD MMM YYYY")}
                        </Text>
                    </View>

                    <View style={[itemStyle, {marginTop: 20}]}>
                        {this._renderOfficePickupDrop(this.props.rosterStore)}
                    </View>
                    <View style={itemStyle}>
                        {this._renderStartEndTime(this.props.rosterStore)}
                    </View>
                    <View style={itemStyle}>
                        {this._renderPickupAndDrop(this.props.rosterStore)}
                    </View>

                    {(Store.selectedRoster.anyChangeInDataLogin ===true||
                        Store.selectedRoster.anyChangeInDataLogout===true)&& (
                        <Button
                            backgroundColor={colors.BLUE}
                            style={{margin: 10}}
                            onPress={()=>{
                                this.storeUpdate();
                            }}
                        >
                            <Text style={{color: colors.WHITE, fontWeight: "700"}}>
                                Update Roster
                            </Text>
                        </Button>
                    )}
                    {
                        (Store.RosteringAllowedLogin === 0 || Store.RosteringAllowedLogout === 0) && (
                            <Text style={{color: colors.GRAY, margin: 6, alignSelf: "center", fontWeight: "700"}}>
                                {(Store.RosteringAllowedLogin === 0 && Store.RosteringAllowedLogout === 0)
                                    ? "NOTE : Login & Logout Roster can be scheduled only by your SPOC"
                                    : Store.RosteringAllowedLogin === 0
                                        ? "NOTE : Login Roster can be scheduled only by your SPOC"
                                        : "NOTE : Logout Roster can be scheduled only by your SPOC"}
                            </Text>
                        )
                    }
                </View>
            </SafeAreaView>
        );
    }
    storeUpdate(){
        const store = this.props.rosterStore;
        if (!store.selectedRoster.anyChangeInDataLogin && !store.selectedRoster.anyChangeInDataLogout) {
            Alert.alert("Roster", "Roster not changed");
            return;
        }
        /*********************************** Validation ***********************************/
        if (
            !store.isSelected(store.selectedRoster.officeLoginSelected) &&
            !store.isSelected(store.selectedRoster.officeLogoutSelected)
        ) {
            Alert.alert("Roster", "Select login/logout office");
            return;
        }

        if (
            !store.isSelected(store.selectedRoster.logoutSelected) &&
            !store.isSelected(store.selectedRoster.loginSelected) &&
            !store.isSelected(store.selectedRoster.pickupLocationSelected) &&
            !store.isSelected(store.selectedRoster.dropLocationSelected)
        ) {
            Alert.alert("Roster", "Select login/logout time");
            return;
        }

        if (
            store.isSelected(store.selectedRoster.loginSelected) &&
            (!store.isSelected(store.selectedRoster.pickupLocationSelected)&& store.pickupDisabled ===false)
        ) {
            Alert.alert("Roster", "Select pickup location");
            return;
        } else if (
            !store.isSelected(store.selectedRoster.loginSelected) &&
            store.isSelected(store.selectedRoster.pickupLocationSelected)
        ) {
            Alert.alert("Roster", "Select login time");
            return;
        }

        if (
            store.isSelected(store.selectedRoster.logoutSelected) &&
            (!store.isSelected(store.selectedRoster.dropLocationSelected)&&store.dropDisabled===false)
        ) {
            Alert.alert("Roster", "Select drop location");
            return;
        } else if (
            !store.isSelected(store.selectedRoster.logoutSelected) &&
            store.isSelected(store.selectedRoster.dropLocationSelected)
        ) {
            Alert.alert("Roster", "Select logout Time");
            return;
        }
        this.props.rosterStore.updateRosterStore().then((response)=>{
            if(response ==="NO-SHOW") {
                if (this.props.rosterStore.NoShowData.hasOwnProperty("title") &&
                    this.props.rosterStore.NoShowData.title.toString().length>0) {
                    this.displayNoSHowAlerts(this.props.rosterStore.NoShowData.title,
                        this.props.rosterStore.NoShowData.message);
                } else {
                    this.props.rosterStore.noShowPerformed=true;
                    this.storeUpdate();
                }
            } else if(this.props.rosterStore.rosterUpdated===true){
                this.props.rosterStore.rosterUpdated=false;
                this.props.navigation.dispatch(StackActions.popToTop());
            }
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
                        this.props.rosterStore.noShowPerformed=true;
                        this.storeUpdate();
                    }
                },
            ],
            {cancelable: false},
        )
    }

}

RosterUpdate.propTypes = {};
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

export default RosterUpdate;
