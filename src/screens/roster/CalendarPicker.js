import React, {Component} from "react";
import PropTypes from "prop-types";
import {CalendarList} from "react-native-calendars";
import Moment from "moment";
import moment from "moment";
import {asyncString} from "../../utils/ConstantString";
import {URL} from "../../network/apiConstants/index";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import {API} from "../../network/apiFetch/API";
import {colors} from "../../utils/Colors";
import _ from "lodash";
import {Dropdown} from "react-native-material-dropdown";

import {
    Body,
    Button,
    Card,
    CardItem,
    Container,
    Content,
    Form,
    Header,
    Icon,
    Input,
    Item,
    Left,
    Picker,
    Right,
    Text,
    Title
} from "native-base";
import {
    ActivityIndicator,
    Alert,
    findNodeHandle,
    Image,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PopupDialog, {DialogTitle, SlideAnimation} from "react-native-popup-dialog";
import {spinner} from "../../network/loader/Spinner";
import Modal from "react-native-modal";
import {withNavigation} from "@react-navigation/native";
import {filterShiftTimeBasedOnCutOffTime} from "../../utils/customFunction";
import {TYPE} from "../../model/ActionType";
import Ionicons from "react-native-vector-icons/Ionicons";
import { CryptoXor } from "crypto-xor";

const DISABLED_DAYS = [
    /*"saturday", "sunday"*/
];

const slideAnimation = new SlideAnimation({
    slideFrom: "bottom"
});

class CalendarPicker extends Component {
    static navigationOptions = {
        title: "View/Modify"
    };
    //Loader State Handle Call From Loader.Helps when back Key pressed while Loading
    onUpdate = () => {
        this.setState({
            isLoading: false
        });
    };
    setSelectedDate = () => {
        this.props.onSelectedDate();
    };
    _renderButton = (text, onPress) => (
        <Button full success onPress={onPress} style={{marginTop: 10}}>
            <Text
                style={{
                    fontSize: 13,
                    fontFamily: "Helvetica"
                }}
            >
                {text}
            </Text>
        </Button>
    );
    _renderAddNickNameModalContent = () => (
        <View
            style={{
                height: "60%",
                backgroundColor: "white",
                padding: 22,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 4,
                borderColor: "rgba(0, 0, 0, 0.1)"
            }}
        >
            <KeyboardAvoidingView style={{flex: 1}} behavior="padding" enabled>
                <View rounded style={{width: "100%"}}>
                    <Input
                        maxLength={15}
                        style={{color: colors.BLACK, height: 50, width: "80%"}}
                        placeholder={"Enter nick name under 15 character"}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        autoCorrect={false}
                        numberOfLines={1}
                        returnKeyType="next"
                        onChangeText={text =>
                            this.state.type == "from"
                                ? this.fromNickNameChangeHandler(text)
                                : this.toNickNameChangeHandler(text)
                        }
                        value={this.state.nickName}
                        blurOnSubmit={true}
                    />
                </View>
                {/*<View style={{ width: "100%", alignItems: "center" }}>
          <Text
            style={{
              width: "100%",
              alignSelf: "center"
            }}
          >
            {this.state.type === "from"
              ? this.state.fromNickName
                ? "[" + this.state.fromNickName.length + "/15]"
                : "[0/15]"
              : this.state.toNickName
                ? "[" + this.state.toNickName.length + "/15]"
                : "[0/15]"}
          </Text>
        </View>*/}
                {this._renderButton(this.state.isLoading ? "Adding..." : "Add", () => {
                    this.saveEmployeLocation();
                })}
                <Button
                    full
                    danger
                    onPress={() => {
                        this.setState({visibleModal: false});
                    }}
                    style={{marginTop: 10, backgroundColor: colors.RED}}
                >
                    <Text>Cancel</Text>
                </Button>
            </KeyboardAvoidingView>
        </View>
    );
    _renderDisplayAndEditModeRoster = (
        calculateRoster,
        Offices,
        rosterDetailsLocations,
        rosterDetailsLocationsWithoutOthers,
        RosteringAllowedLogin,
        RosteringAllowedLogout
    ) => {
        return (
            <Container>
                {spinner.visible(this.state.isLoading)}

                <Content style={{backgroundColor: colors.BACKGROUND}}>
                    <Form>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: "column",
                                justifyContent: "space-between",
                                marginRight: 20,
                                marginLeft: 20,
                                marginTop: 20
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    justifyContent: "space-between"
                                }}
                            >
                                <View style={{width: "45%"}}>
                                    <Text style={{fontSize: 13, fontFamily: "Helvetica"}}>
                                        LOGIN OFFICE
                                    </Text>
                                    <Card style={{width: "100%", height: 50}}>
                                        <CardItem>
                                            <Body>
                                            <Text style={{fontSize: 13, fontFamily: "Helvetica"}}>
                                                {this.state.officeLoginSelected
                                                    ? this.state.officeLoginSelected
                                                    : "SELECT"}
                                            </Text>
                                            </Body>
                                        </CardItem>
                                    </Card>
                                </View>
                                <View style={{width: "45%"}}>
                                    <Text style={{fontSize: 13, fontFamily: "Helvetica"}}>
                                        LOGOUT OFFICE
                                    </Text>
                                    <Card
                                        style={{width: "100%", height: 50, flexDirection: "row"}}
                                    >
                                        <Picker
                                            renderHeader={backAction => (
                                                <Header style={{backgroundColor: colors.BLUE}}>
                                                    <Left>
                                                        <Button transparent onPress={backAction}>
                                                            <Icon
                                                                name="arrow-back"
                                                                style={{color: "#fff"}}
                                                            />
                                                        </Button>
                                                    </Left>
                                                    <Body style={{flex: 3}}>
                                                    <Title style={{color: "#fff"}}>
                                                        Logout Office
                                                    </Title>
                                                    </Body>
                                                    <Right/>
                                                </Header>
                                            )}
                                            mode="dropdown"
                                            textStyle={{width: "100%"}}
                                            style={{width: "100%"}}
                                            placeholder="SELECT"
                                            placeholderStyle={{color: "#bfc6ea"}}
                                            placeholderIconColor="#007aff"
                                            selectedValue={this.state.officeLogoutSelected}
                                            onValueChange={this.onOfficeLogoutValueChange.bind(this)}
                                        >
                                            {[...[{Name: "SELECT"}], ...Offices].map((value, i) => {
                                                return (
                                                    <Picker.Item
                                                        key={value.Name}
                                                        label={value.Name}
                                                        value={value.Name === "SELECT" ? null : value.Name}
                                                    />
                                                );
                                            })}
                                        </Picker>
                                        {/* <View
                      style={{
                        width: "10%",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <Icon
                        style={{
                          fontSize: Platform.OS === "ios" ? 15 : 0,
                          marginRight: 5,
                          color: colors.BLACK
                        }}
                        name="ios-arrow-down-outline"
                      />
                    </View> */}
                                    </Card>
                                </View>
                            </View>

                            {/*----------------------------------Login Time---------------------------------------*/}
                            {calculateRoster.map((value, i) => {
                                let LogoutShifts = value.LogoutShifts + this.state.showCancel;
                                return (
                                    <View key={i}>
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: "row",
                                                justifyContent: "space-between"
                                            }}
                                        >
                                            <View style={{width: "45%"}}>
                                                <Text style={{fontSize: 13, fontFamily: "Helvetica"}}>
                                                    LOGIN SHIFT TIME
                                                </Text>
                                                <Card style={{width: "100%", height: 50}}>
                                                    <CardItem>
                                                        <Body>
                                                        <Text
                                                            style={{
                                                                fontSize: 13,
                                                                fontFamily: "Helvetica"
                                                            }}
                                                        >
                                                            {this.state.loginSelected
                                                                ? this.state.loginSelected.split(",")[0]
                                                                : "SELECT"}
                                                        </Text>
                                                        </Body>
                                                    </CardItem>
                                                </Card>
                                            </View>
                                            <View style={{width: "45%"}}>
                                                <Text style={{fontSize: 13, fontFamily: "Helvetica"}}>
                                                    LOGOUT SHIFT TIME
                                                </Text>

                                                <View style={{
                                                    width: "100%",
                                                    flexDirection: "row",
                                                    backgroundColor: colors.WHITE,
                                                    shadowColor: '#000',
                                                    shadowOffset: {width: 2, height: 2},
                                                    shadowOpacity: 0.8,
                                                    shadowRadius: 2,
                                                    elevation: 2,

                                                }}>
                                                    <Dropdown
                                                        ref={dropdown => {
                                                            this.dropdown3 = dropdown;
                                                        }}
                                                        style={{marginLeft: 8, marginRight: 8}}
                                                        baseColor={colors.WHITE}
                                                        containerStyle={{
                                                            width: "80%",
                                                            alignContent: "center",
                                                            backgroundColor: colors.WHITE
                                                        }}
                                                        rippleCentered={true}
                                                        dropdownOffset={{top: 8, left: 8, right: 8, bottom: 8}}
                                                        value={this.state.logoutSelected.split(",")[0]}
                                                        itemColor="#000000"
                                                        onChangeText={this.onLogoutValueChange.bind(this)}
                                                        data={shiftTimes(this.state.logoutSelected, LogoutShifts)
                                                            .split("|")
                                                            .filter(val => {
                                                                if (val) return val.split(",")[0];
                                                            }).map((item) => {
                                                                return {
                                                                    value: (item.split[0] === "SELECT" ? null : item),
                                                                    label: item.split(",")[0]
                                                                };
                                                            })}

                                                    />
                                                    <TouchableOpacity onPress={() => {
                                                        this.dropdown3.focus()
                                                    }}
                                                                      style={{
                                                                          alignSelf: "center"
                                                                      }}>
                                                        <Ionicons
                                                            name="md-arrow-dropdown"
                                                            style={{
                                                                width: 36,
                                                                height: 24,
                                                                fontSize: 20,
                                                                color: colors.GRAY,
                                                                alignSelf: "center",
                                                            }}

                                                        />
                                                    </TouchableOpacity>
                                                </View>


                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                            {/*---------------------------------------end of Logout Time-------------------------------------------*/}
                            {/*--------------------------------------- Pick Up Start --------------------------------------*/}

                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    justifyContent: "space-between"
                                }}
                            >
                                <View style={{width: "45%"}}>
                                    <Text style={{fontSize: 13, fontFamily: "Helvetica"}}>
                                        PICKUP - LOCATION
                                    </Text>
                                    <Card style={{width: "100%", height: 50}}>
                                        <CardItem>
                                            <Body>
                                            <Text style={{fontSize: 13, fontFamily: "Helvetica"}}>
                                                {this.state.pickupLocationSelected
                                                    ? calculateRoster[0].RestrictToPOILoginMap.get(this.state.loginSelected.split(",")[0]) === 1
                                                        ? findID(
                                                            this.state.pickupLocationSelected,
                                                            rosterDetailsLocations
                                                        ) === "H"
                                                            ? this.state.pickupLocationSelected + "-Nodal"
                                                            : this.state.pickupLocatioSelected
                                                        : this.state.pickupLocationSelected
                                                    : "SELECT"}
                                            </Text>
                                            </Body>
                                        </CardItem>
                                    </Card>
                                </View>
                                <View style={{width: "45%"}}>
                                    <Text style={{fontSize: 13, fontFamily: "Helvetica"}}>
                                        DROP - LOCATION
                                    </Text>
                                    <Card
                                        style={{width: "100%", height: 50, flexDirection: "row"}}
                                    >
                                        <Picker
                                            renderHeader={backAction => (
                                                <Header style={{backgroundColor: colors.BLUE}}>
                                                    <Left>
                                                        <Button transparent onPress={backAction}>
                                                            <Icon
                                                                name="arrow-back"
                                                                style={{color: "#fff"}}
                                                            />
                                                        </Button>
                                                    </Left>
                                                    <Body style={{flex: 3}}>
                                                    <Title style={{color: "#fff"}}>
                                                        DROP - LOCATION
                                                    </Title>
                                                    </Body>
                                                    <Right/>
                                                </Header>
                                            )}
                                            mode="dropdown"
                                            textStyle={{width: "100%"}}
                                            style={{width: "100%"}}
                                            placeholder="Select Drop location"
                                            placeholderStyle={{color: "#bfc6ea"}}
                                            placeholderIconColor="#007aff"
                                            selectedValue={this.state.dropLocationSelected}
                                            onValueChange={this.onDropLocationValueChange.bind(this)}
                                        >
                                            {[
                                                ...[{Name: "SELECT"}],
                                                ...(RosteringAllowedLogout === 1
                                                    ? calculateRoster[0].AllowOtherLocationsLogout === "1"
                                                        ? rosterDetailsLocations
                                                        : this.state.dropLocationSelected
                                                            ? [
                                                                ...rosterDetailsLocationsWithoutOthers,
                                                                {Name: this.state.dropLocationSelected}
                                                            ]
                                                            : rosterDetailsLocationsWithoutOthers
                                                    : this.state.dropLocationSelected
                                                        ? [
                                                            {
                                                                Name: this.state.dropLocationSelected
                                                            }
                                                        ]
                                                        : [])
                                            ].map((value, i) => {
                                                return (
                                                    <Picker.Item
                                                        key={value.Name}
                                                        label={
                                                            calculateRoster[0].RestrictToPOILogOutMap.get(this.state.logoutSelected.split(",")[0]) === 1
                                                                ? value.ID === "H"
                                                                ? value.Name + "-Nodal"
                                                                : value.Name
                                                                : value.Name
                                                        }
                                                        value={value.Name === "SELECT" ? null : value.Name}
                                                    />
                                                );
                                            })}
                                        </Picker>
                                        {/* <View
                      style={{
                        width: "10%",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <Icon
                        style={{
                          fontSize: Platform.OS === "ios" ? 15 : 0,
                          marginRight: 5,
                          color: colors.BLACK
                        }}
                        name="ios-arrow-down-outline"
                      />
                    </View> */}
                                    </Card>
                                </View>
                            </View>
                            {/*------------------------------------------ End of Drop ----------------------------------------*/}
                            <View
                                style={{
                                    marginTop: 10,
                                    flex: 1,
                                    flexDirection: "row",
                                    justifyContent: "space-between"
                                }}
                            >
                                <Button
                                    danger
                                    style={{flex: 0.45, backgroundColor: colors.RED, justifyContent: "center"}}
                                    onPress={() => {
                                        this.popupDialog.dismiss();
                                    }}
                                >
                                    <Text style={{fontSize: 13, fontFamily: "Helvetica"}}>
                                        CANCEL
                                    </Text>
                                </Button>
                                <Button
                                    success
                                    style={{flex: 0.45, justifyContent: "center"}}
                                    onPress={() => {
                                        this.updateRoster();
                                    }}
                                >
                                    <ActivityIndicator
                                        color={colors.WHITE}
                                        animating={this.state.showLoader}
                                    />
                                    <Text style={{fontSize: 13, fontFamily: "Helvetica"}}>
                                        {this.state.showLoader ? "SAVING" : "SAVE"}
                                    </Text>
                                </Button>
                            </View>
                        </View>
                    </Form>
                </Content>
            </Container>
        );
    };
    _renderEditSaveModeRoster = (
        calculateRoster,
        Offices,
        rosterDetailsLocations,
        rosterDetailsLocationsWithoutOthers,
        RosteringAllowedLogin,
        RosteringAllowedLogout
    ) => {

        return (
            <Container>
                {spinner.visible(this.state.isLoading)}

                <Content style={{backgroundColor: colors.BACKGROUND}}>
                    <Form>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: "column",
                                justifyContent: "space-between",
                                marginRight: 20,
                                marginLeft: 20,
                                paddingTop: 20
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    justifyContent: "space-between"
                                }}
                            >
                                <View style={{width: "45%"}}>
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            fontFamily: "Helvetica"
                                        }}
                                    >
                                        LOGIN OFFICE
                                    </Text>
                                    <Card
                                        style={{width: "100%", height: 50, flexDirection: "row"}}
                                    >
                                        <Picker
                                            renderHeader={backAction => (
                                                <Header style={{backgroundColor: colors.BLUE}}>
                                                    <Left>
                                                        <Button transparent onPress={backAction}>
                                                            <Icon
                                                                name="arrow-back"
                                                                style={{color: "#fff"}}
                                                            />
                                                        </Button>
                                                    </Left>
                                                    <Body style={{flex: 3}}>
                                                    <Title style={{color: "#fff"}}>
                                                        LOGIN OFFICE
                                                    </Title>
                                                    </Body>
                                                    <Right/>
                                                </Header>
                                            )}
                                            mode="dropdown"
                                            style={{width: "100%"}}
                                            placeholder="SELECT"
                                            placeholderStyle={{color: "#bfc6ea"}}
                                            placeholderIconColor="#007aff"
                                            selectedValue={this.state.officeLoginSelected}
                                            textStyle={{width: "100%"}}
                                            onValueChange={this.onOfficeLoginValueChange.bind(this)}
                                        >
                                            {[...[{Name: "SELECT"}], ...Offices].map((value, i) => {
                                                return (
                                                    <Picker.Item
                                                        key={value.Name}
                                                        label={value.Name}
                                                        value={value.Name === "SELECT" ? null : value.Name}
                                                    />
                                                );
                                            })}
                                        </Picker>
                                        {/* <View
                      style={{
                        width: "10%",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <Icon
                        style={{
                          fontSize: Platform.OS === "ios" ? 15 : 0,
                          marginRight: 5,
                          color: colors.BLACK
                        }}
                        name="ios-arrow-down-outline"
                      />
                    </View> */}
                                    </Card>
                                </View>
                                <View style={{width: "45%"}}>
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            fontFamily: "Helvetica"
                                        }}
                                    >
                                        LOGOUT OFFICE
                                    </Text>
                                    <Card
                                        style={{width: "100%", height: 50, flexDirection: "row"}}
                                    >
                                        <Picker
                                            renderHeader={backAction => (
                                                <Header style={{backgroundColor: colors.BLUE}}>
                                                    <Left>
                                                        <Button transparent onPress={backAction}>
                                                            <Icon
                                                                name="arrow-back"
                                                                style={{color: "#fff"}}
                                                            />
                                                        </Button>
                                                    </Left>
                                                    <Body style={{flex: 3}}>
                                                    <Title style={{color: "#fff"}}>
                                                        Logout Office
                                                    </Title>
                                                    </Body>
                                                    <Right/>
                                                </Header>
                                            )}
                                            mode="dropdown"
                                            style={{width: Platform.OS === "ios" ? "100%" : "100%"}}
                                            placeholder="SELECT"
                                            textStyle={{width: "100%"}}
                                            placeholderStyle={{color: "#bfc6ea"}}
                                            placeholderIconColor="#007aff"
                                            selectedValue={this.state.officeLogoutSelected}
                                            onValueChange={this.onOfficeLogoutValueChange.bind(this)}
                                        >
                                            {[...[{Name: "SELECT"}], ...Offices].map((value, i) => {
                                                return (
                                                    <Picker.Item
                                                        key={value.Name}
                                                        label={value.Name}
                                                        value={value.Name === "SELECT" ? null : value.Name}
                                                    />
                                                );
                                            })}
                                        </Picker>
                                        {/* <View
                      style={{
                        width: "10%",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <Icon
                        style={{
                          fontSize: Platform.OS === "ios" ? 15 : 0,
                          marginRight: 5,
                          color: colors.BLACK
                        }}
                        name="ios-arrow-down-outline"
                      />
                    </View> */}
                                    </Card>
                                </View>
                            </View>

                            {/*---------------------------------- Login Time ---------------------------------------*/}
                            {calculateRoster.map((value, i) => {
                                let LogoutShifts = "";
                                let LoginShifts = "";

                                const selectedDate = moment(
                                    new Date(
                                        this.state.RosterDate +
                                        "T" +
                                        this.state.loginSelected.split(",")[0]
                                    )
                                ).format("YYYY-MM-DDTHH:mm");

                                const currentDate = moment().format("YYYY-MM-DDTHH:mm");

                                if (this.state.loginSelected && selectedDate && currentDate)
                                    if (
                                        this.state.RosterDate &&
                                        /* selectedDate.split("T")[0]*/ this.state.RosterDate ===
                                        currentDate.split("T")[0]
                                    ) {
                                        let loginShiftsArray = value.LoginShifts.split("|"),
                                            min = moment().format("HH:mm"),
                                            customloginShiftArray = loginShiftsArray.filter(
                                                time => time > min
                                                //time => time > moment().add(parseInt(time.split(",")[1]), 'm').format("HH:mm")
                                            );

                                        let logoutShiftsArray = value.LogoutShifts.split("|");

                                        min =
                                            CalendarPicker.isSelected(this.state.loginSelected) &&
                                            selectedDate &&
                                            moment(selectedDate).isAfter(moment(currentDate))
                                                ? this.state.logoutSelected
                                                : moment().format("HH:mm");

                                        const customlogoutShiftArray = logoutShiftsArray.filter(
                                            time =>
                                                time.includes("*")
                                                    ? true
                                                    : time >
                                                    moment()
                                                        .add(parseInt(time.split(",")[1]), "m")
                                                        .format("HH:mm")
                                        );

                                        LogoutShifts =
                                            `${
                                                this.state.logoutSelected &&
                                                !this.state.logoutSelected.includes("Cancel")
                                                    ? this.state.logoutSelected
                                                    : "" //+ ",0,D"
                                                }|` +
                                            customlogoutShiftArray.join("|") +
                                            this.state.showCancel;
                                        LoginShifts =
                                            `${
                                                this.state.loginSelected &&
                                                !this.state.loginSelected.includes("Cancel")
                                                    ? this.state.loginSelected
                                                    : "" //+ ",0,D"
                                                }|` +
                                            customloginShiftArray.join("|") +
                                            this.state.showCancel;

                                        //LogoutShifts = uniq(LogoutShifts.split("|")).join("|");
                                        //LoginShifts = uniq(LoginShifts.split("|")).join("|");
                                    } else {
                                        LogoutShifts = value.LogoutShifts + this.state.showCancel;
                                        LoginShifts = value.LoginShifts + this.state.showCancel;
                                    }
                                return (
                                    <View key={i}>
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: "row",
                                                justifyContent: "space-between"
                                            }}
                                        >
                                            <View style={{width: "45%"}}>
                                                <Text style={{fontSize: 12, fontFamily: "Helvetica", marginBottom: 2}}>
                                                    LOGIN SHIFT TIME
                                                </Text>
                                                <View style={{
                                                    width: "100%",
                                                    flexDirection: "row",
                                                    backgroundColor: colors.WHITE,
                                                    shadowColor: '#000',
                                                    shadowOffset: {width: 2, height: 2},
                                                    shadowOpacity: 0.8,
                                                    shadowRadius: 2,
                                                    elevation: 2,

                                                }}>
                                                    <Dropdown
                                                        ref={dropdown => {
                                                            this.dropdown1 = dropdown;
                                                        }}
                                                        style={{marginLeft: 8, marginRight: 8}}
                                                        baseColor={colors.WHITE}
                                                        containerStyle={{
                                                            width: "80%",
                                                            alignContent: "center",
                                                            backgroundColor: colors.WHITE
                                                        }}
                                                        rippleCentered={true}
                                                        dropdownOffset={{top: 8, left: 8, right: 8, bottom: 8}}
                                                        value={this.state.loginSelected.split(",")[0]}
                                                        itemColor="#000000"
                                                        onChangeText={this.onLoginValueChange.bind(this)}
                                                        data={shiftTimes(this.state.loginSelected, LoginShifts)
                                                            .split("|")
                                                            .filter(val => {
                                                                if (val) return val.split(",")[0];
                                                            }).map((item) => {
                                                                return {
                                                                    value: (item.split[0] === "SELECT" ? null : item),
                                                                    label: item.split(",")[0]
                                                                };
                                                            })}

                                                    />
                                                    <TouchableOpacity onPress={() => {
                                                        this.dropdown1.focus()
                                                    }}
                                                                      style={{
                                                                          alignSelf: "center"
                                                                      }}>
                                                        <Ionicons
                                                            name="md-arrow-dropdown"
                                                            style={{
                                                                width: 36,
                                                                height: 24,
                                                                fontSize: 20,
                                                                color: colors.GRAY,
                                                                alignSelf: "center",
                                                            }}

                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            <View style={{width: "45%"}}>
                                                <Text style={{fontSize: 12, fontFamily: "Helvetica", marginBottom: 2}}>
                                                    LOGOUT SHIFT TIME
                                                </Text>
                                                <View style={{
                                                    width: "100%",
                                                    flexDirection: "row",
                                                    backgroundColor: colors.WHITE,
                                                    shadowColor: '#000',
                                                    shadowOffset: {width: 2, height: 2},
                                                    shadowOpacity: 0.8,
                                                    shadowRadius: 2,
                                                    elevation: 2,
                                                }}>
                                                    <Dropdown
                                                        ref={dropdown => {
                                                            this.dropdown2 = dropdown;
                                                        }}
                                                        style={{marginLeft: 8, marginRight: 8}}
                                                        containerStyle={{
                                                            width: "80%",
                                                            alignContent: "center",
                                                            backgroundColor: colors.WHITE
                                                        }}
                                                        baseColor={colors.WHITE}
                                                        rippleCentered={true}
                                                        dropdownOffset={{top: 8, left: 8, right: 8, bottom: 8}}
                                                        value={this.state.logoutSelected.split(",")[0]}
                                                        itemColor="#000000"
                                                        onChangeText={this.onLogoutValueChange.bind(this)}
                                                        data={shiftTimes(this.state.logoutSelected, LogoutShifts)
                                                            .split("|")
                                                            .filter(val => {
                                                                if (val) return val.split(",")[0];
                                                            }).map((item) => {
                                                                return {
                                                                    value: (item.split[0] === "SELECT" ? null : item),
                                                                    label: item.split(",")[0]
                                                                };
                                                            })}
                                                    />
                                                    <TouchableOpacity onPress={() => {
                                                        this.dropdown2.focus()
                                                    }}
                                                                      style={{
                                                                          alignSelf: "center"
                                                                      }}>
                                                        <Ionicons
                                                            name="md-arrow-dropdown"
                                                            style={{
                                                                width: 36,
                                                                height: 24,
                                                                fontSize: 20,
                                                                color: colors.GRAY,
                                                                alignSelf: "center",
                                                            }}

                                                        />
                                                    </TouchableOpacity>

                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                            {/*---------------------------------------end of Logout Time-------------------------------------------*/}
                            {/*--------------------------------------- Pick Up Start --------------------------------------*/}

                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    justifyContent: "space-between"
                                }}
                            >
                                <View style={{width: "45%"}}>
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            fontFamily: "Helvetica"
                                        }}
                                    >
                                        PICKUP - LOCATION
                                    </Text>
                                    <Card
                                        style={{width: "100%", height: 50, flexDirection: "row"}}
                                    >
                                        <Picker
                                            renderHeader={backAction => (
                                                <Header style={{backgroundColor: colors.BLUE}}>
                                                    <Left>
                                                        <Button transparent onPress={backAction}>
                                                            <Icon
                                                                name="arrow-back"
                                                                style={{color: "#fff"}}
                                                            />
                                                        </Button>
                                                    </Left>
                                                    <Body style={{flex: 3}}>
                                                    <Title style={{color: "#fff"}}>
                                                        PICKUP - LOCATION
                                                    </Title>
                                                    </Body>
                                                    <Right/>
                                                </Header>
                                            )}
                                            mode="dropdown"
                                            style={{width: Platform.OS === "ios" ? "100%" : "100%"}}
                                            textStyle={{width: "100%"}}
                                            placeholder="SELECT"
                                            placeholderStyle={{color: "#bfc6ea"}}
                                            placeholderIconColor="#007aff"
                                            selectedValue={this.state.pickupLocationSelected}
                                            onValueChange={this.onPickupLocationValueChange.bind(
                                                this
                                            )}
                                        >
                                            {[
                                                ...[{Name: "SELECT"}],
                                                ...(RosteringAllowedLogin === 1
                                                    ? calculateRoster[0].AllowOtherLocationsLogin === "1"
                                                        ? rosterDetailsLocations
                                                        : this.state.pickupLocationSelected
                                                            ? [
                                                                ...rosterDetailsLocationsWithoutOthers,
                                                                {Name: this.state.pickupLocationSelected}
                                                            ]
                                                            : rosterDetailsLocationsWithoutOthers
                                                    : this.state.pickupLocationSelected
                                                        ? [{Name: this.state.pickupLocationSelected}]
                                                        : [])
                                            ].map((value, i) => {
                                                console.warn("here" + JSON.stringify(calculateRoster[0].RestrictToPOILoginMap));
                                                console.warn("login value changed" + this.state.loginSelected);
                                                return (
                                                    <Picker.Item
                                                        key={value.Name}
                                                        label={
                                                            // calculateRoster[0].RestrictToPOILogin === "1"
                                                            calculateRoster[0].RestrictToPOILoginMap.get(this.state.loginSelected.split(",")[0]) === 1
                                                                ? value.ID === "H"
                                                                ? value.Name + "-Nodal"
                                                                : value.Name
                                                                : value.Name
                                                        }
                                                        value={value.Name === "SELECT" ? null : value.Name}
                                                    />
                                                );
                                            })}
                                        </Picker>
                                        {/* <View
                      style={{
                        width: "10%",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <Icon
                        style={{
                          fontSize: Platform.OS === "ios" ? 15 : 0,
                          marginRight: 5,
                          color: colors.BLACK
                        }}
                        name="ios-arrow-down-outline"
                      />
                    </View> */}
                                    </Card>
                                </View>
                                <View style={{width: "45%"}}>
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            fontFamily: "Helvetica"
                                        }}
                                    >
                                        DROP - LOCATION
                                    </Text>
                                    <Card
                                        style={{width: "100%", height: 50, flexDirection: "row"}}
                                    >
                                        <Picker
                                            renderHeader={backAction => (
                                                <Header style={{backgroundColor: colors.BLUE}}>
                                                    <Left>
                                                        <Button transparent onPress={backAction}>
                                                            <Icon
                                                                name="arrow-back"
                                                                style={{color: "#fff"}}
                                                            />
                                                        </Button>
                                                    </Left>
                                                    <Body style={{flex: 3}}>
                                                    <Title style={{color: "#fff"}}>
                                                        DROP - LOCATION
                                                    </Title>
                                                    </Body>
                                                    <Right/>
                                                </Header>
                                            )}
                                            mode="dropdown"
                                            textStyle={{width: "100%"}}
                                            style={{width: Platform.OS === "ios" ? "100%" : "100%"}}
                                            placeholder="SELECT"
                                            placeholderStyle={{color: "#bfc6ea"}}
                                            placeholderIconColor="#007aff"
                                            selectedValue={this.state.dropLocationSelected}
                                            onValueChange={this.onDropLocationValueChange.bind(this)}
                                        >
                                            {[
                                                ...[{Name: "SELECT"}],
                                                ...(RosteringAllowedLogout === 1
                                                    ? calculateRoster[0].AllowOtherLocationsLogout === "1"
                                                        ? rosterDetailsLocations
                                                        : this.state.dropLocationSelected
                                                            ? [
                                                                ...rosterDetailsLocationsWithoutOthers,
                                                                {Name: this.state.dropLocationSelected}
                                                            ]
                                                            : rosterDetailsLocationsWithoutOthers
                                                    : this.state.dropLocationSelected
                                                        ? [{Name: this.state.dropLocationSelected}]
                                                        : [])
                                            ].map((value, i) => {
                                                return (
                                                    <Picker.Item
                                                        key={value.Name}
                                                        label={
                                                            // calculateRoster[0].RestrictToPOILogout === "1"
                                                            calculateRoster[0].RestrictToPOILogOutMap.get(this.state.logoutSelected.split(",")[0]) === 1
                                                                ? value.ID === "H"
                                                                ? value.Name + "-Nodal"
                                                                : value.Name
                                                                : value.Name
                                                        }
                                                        value={value.Name === "SELECT" ? null : value.Name}
                                                    />
                                                );
                                            })}
                                        </Picker>
                                        {/* <View
                      style={{
                        width: "10%",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <Icon
                        style={{
                          fontSize: Platform.OS === "ios" ? 15 : 0,
                          marginRight: 5,
                          color: colors.BLACK
                        }}
                        name="ios-arrow-down-outline"
                      />
                    </View> */}
                                    </Card>
                                </View>
                            </View>
                            {/*------------------------------------------ End of Drop ----------------------------------------*/}
                            <View
                                style={{
                                    marginTop: 10,
                                    flex: 1,
                                    flexDirection: "row",
                                    justifyContent: "space-between"
                                }}
                            >
                                <Button
                                    danger
                                    style={{flex: 0.45, backgroundColor: colors.RED, justifyContent: "center"}}
                                    onPress={() => {
                                        this.popupDialog.dismiss();
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontFamily: "Helvetica"
                                        }}
                                    >
                                        CANCEL
                                    </Text>
                                </Button>
                                <Button
                                    success
                                    style={{flex: 0.45, justifyContent: "center"}}
                                    onPress={() => {
                                        this.updateRoster();
                                    }}
                                >
                                    <ActivityIndicator
                                        color={colors.WHITE}
                                        animating={this.state.showLoader}
                                    />
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontFamily: "Helvetica"
                                        }}
                                    >
                                        {this.state.showLoader ? "SAVING" : "SAVE"}
                                    </Text>
                                </Button>
                            </View>
                        </View>
                    </Form>
                </Content>
            </Container>
        );
    };
    _renderDisplayModeRoster = (
        calculateRoster,
        Offices,
        rosterDetailsLocations,
        rosterDetailsLocationsWithoutOthers,
        RosteringAllowedLogin,
        RosteringAllowedLogout
    ) => {
        return (
            <Container>
                {spinner.visible(this.state.isLoading)}

                <Content style={{backgroundColor: colors.BACKGROUND}}>
                    <Form>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: "column",
                                justifyContent: "space-between",
                                marginRight: 20,
                                marginLeft: 20,
                                paddingTop: 20
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    justifyContent: "space-between"
                                }}
                            >
                                <View style={{width: "45%"}}>
                                    <Text style={{fontSize: 12, fontFamily: "Helvetica"}}>
                                        LOGIN OFFICE
                                    </Text>
                                    <Card style={{width: "100%", height: 50}}>
                                        <CardItem>
                                            <Body>
                                            <Text style={{fontSize: 13, fontFamily: "Helvetica"}}>
                                                {this.state.officeLoginSelected
                                                    ? this.state.officeLoginSelected
                                                    : "SELECT"}
                                            </Text>
                                            </Body>
                                        </CardItem>
                                    </Card>
                                </View>
                                <View style={{width: "45%"}}>
                                    <Text style={{fontSize: 12, fontFamily: "Helvetica"}}>
                                        LOGOUT OFFICE
                                    </Text>
                                    <Card style={{width: "100%", height: 50}}>
                                        <CardItem>
                                            <Body>
                                            <Text style={{fontSize: 13, fontFamily: "Helvetica"}}>
                                                {this.state.officeLogoutSelected
                                                    ? this.state.officeLogoutSelected
                                                    : "SELECT"}
                                            </Text>
                                            </Body>
                                        </CardItem>
                                    </Card>
                                </View>
                            </View>

                            {/*----------------------------------Login Time---------------------------------------*/}
                            {calculateRoster.map((value, i) => {
                                return (
                                    <View key={i}>
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: "row",
                                                justifyContent: "space-between"
                                            }}
                                        >
                                            <View style={{width: "45%"}}>
                                                <Text style={{fontSize: 12, fontFamily: "Helvetica"}}>
                                                    LOGIN SHIFT TIME
                                                </Text>
                                                <Card style={{width: "100%", height: 50}}>
                                                    <CardItem>
                                                        <Body>
                                                        <Text
                                                            style={{
                                                                fontSize: 13,
                                                                fontFamily: "Helvetica"
                                                            }}
                                                        >
                                                            {this.state.loginSelected
                                                                ? this.state.loginSelected.split(",")[0]
                                                                    ? this.state.loginSelected.split(",")[0]
                                                                    : "SELECT"
                                                                : "SELECT"}
                                                        </Text>
                                                        </Body>
                                                    </CardItem>
                                                </Card>
                                            </View>
                                            <View style={{width: "45%"}}>
                                                <Text style={{fontSize: 12, fontFamily: "Helvetica"}}>
                                                    LOGOUT SHIFT TIME
                                                </Text>
                                                <Card style={{width: "100%", height: 50}}>
                                                    <CardItem>
                                                        <Body>
                                                        <Text
                                                            style={{
                                                                fontSize: 13,
                                                                fontFamily: "Helvetica"
                                                            }}
                                                        >
                                                            {this.state.logoutSelected
                                                                ? this.state.logoutSelected.split(",")[0]
                                                                    ? this.state.logoutSelected.split(",")[0]
                                                                    : "SELECT"
                                                                : "SELECT"}
                                                        </Text>
                                                        </Body>
                                                    </CardItem>
                                                </Card>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                            {/*---------------------------------------end of Logout Time-------------------------------------------*/}
                            {/*--------------------------------------- Pick Up Start --------------------------------------*/}

                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    justifyContent: "space-between"
                                }}
                            >
                                <View style={{width: "45%"}}>
                                    <Text style={{fontSize: 12, fontFamily: "Helvetica"}}>
                                        PICKUP - LOCATION
                                    </Text>
                                    <Card style={{width: "100%", height: 50}}>
                                        <CardItem>
                                            <Body>
                                            <Text style={{fontSize: 13, fontFamily: "Helvetica"}}>
                                                {this.state.pickupLocationSelected
                                                    ? calculateRoster[0].RestrictToPOILoginMap.get(this.state.loginSelected.split(",")[0]) === 1
                                                        ? findID(
                                                            this.state.pickupLocationSelected,
                                                            rosterDetailsLocations
                                                        ) === "H"
                                                            ? this.state.pickupLocationSelected + "-Nodal"
                                                            : this.state.pickupLocationSelected
                                                        : this.state.pickupLocationSelected
                                                    : "SELECT"}
                                            </Text>
                                            </Body>
                                        </CardItem>
                                    </Card>
                                </View>
                                <View style={{width: "45%"}}>
                                    <Text style={{fontSize: 12, fontFamily: "Helvetica"}}>
                                        DROP - LOCATION
                                    </Text>
                                    <Card style={{width: "100%", height: 50}}>
                                        <CardItem>
                                            <Body>
                                            <Text style={{fontSize: 13, fontFamily: "Helvetica"}}>
                                                {this.state.dropLocationSelected
                                                    ? calculateRoster[0].RestrictToPOILogOutMap.get(this.state.logoutSelected.split(",")[0]) === 1
                                                        ? findID(
                                                            this.state.dropLocationSelected,
                                                            rosterDetailsLocations
                                                        ) === "H"
                                                            ? this.state.dropLocationSelected + "-Nodal"
                                                            : this.state.dropLocationSelected
                                                        : this.state.dropLocationSelected
                                                    : "SELECT"}
                                            </Text>
                                            </Body>
                                        </CardItem>
                                    </Card>
                                </View>
                            </View>
                            {/*------------------------------------------ End of Drop ----------------------------------------*/}
                            <View
                                style={{
                                    marginTop: 10,
                                    flex: 1,
                                    flexDirection: "row",
                                    justifyContent: "space-between"
                                }}
                            >
                                <Button
                                    danger
                                    style={{flex: 1, backgroundColor: colors.RED, justifyContent: "center"}}
                                    onPress={() => {
                                        this.popupDialog.dismiss();
                                    }}
                                >
                                    <Text style={{fontSize: 13, fontFamily: "Helvetica"}}>
                                        CLOSE
                                    </Text>
                                </Button>
                            </View>
                        </View>
                    </Form>
                </Content>
            </Container>
        );
    };
    callback = async (actionType, response, copyDataObj) => {
        switch (actionType) {
            case TYPE.UPDATE_ROSTER: {
                handleResponse.updateRosterForSelectedDate(response, this);
                break;
            }
            case TYPE.ADD_CUSTOM_LOCATION: {
                handleResponse.saveEmployeeLocation(
                    response,
                    this,
                    this.state.type,
                    this.state.type === "from"
                        ? this.state.fromNickName
                        : this.state.toNickName
                );
                break;
            }

            case TYPE.GET_SELECTED_ROSTER: {
                handleResponse.getSelectedRoster(
                    response,
                    this,
                    copyDataObj.rosterDetails,
                    copyDataObj.RosterDate
                );
                break;
            }
        }
    };
    dropdown1: Dropdown;
    dropdown2: Dropdown;
    dropdown3: Dropdown;

    constructor(props) {
        super(props);
        this.state = {
            access_token: "",
            CustomerUrl: "",
            UserId: "",
            isLoading: false,
            showLoader: false,
            markedDates: this.getDaysInMonth(
                moment().month(),
                moment().year(),
                DISABLED_DAYS
            ),
            DISABLED_DAYS: [],
            RosterDate: "",
            showUpdateRosterWindow: false,
            /******************* Update Roster *************************/
            loginSelected: "",
            logoutSelected: "",
            availableRosters: "",
            loginShifts: "",
            rosterDetails: "",
            pickupLocationSelected: "",
            dropLocationSelected: "",
            officeLoginSelected: "",
            officeLogoutSelected: "",
            officeSelected: "",
            startDate: "",
            pickStartDate: false,
            endDate: "",
            pickEndDate: false,
            RosterID: "",
            autoFill: false,
            /********************* End of Update Roster *****************/
            toSelectedLocation: "",
            toSelectLat: "",
            toSelectLng: "",
            fromSelectedLocation: "",
            fromSelectLat: "",
            fromSelectLng: "",
            fromAddressID: "",
            toAddressID: "",
            toNickName: "",
            type: "",
            visibleModal: false,
            anyChangeInData: false,
            anyChangeInDataLogin: false,
            anyChangeInDataLogout: false,
            showCancel: "|Cancel,0,D",
            responsePopup: false
        };
    }

    static isSelected(value: string): boolean {
        return (
            value &&
            value.split(",")[0] &&
            value !== "SELECT" &&
            value !== "Select" &&
            value !== "SELECT" &&
            value !== "SELECT ,0,D" &&
            value !== "SELECT,0,D"
        );
    }

    /*********************** Update Roster ************************/
    onLoginValueChange(value: string) {
        if (value) {
            console.warn("Selected Value:" + JSON.stringify(value));
            this.setState({
                loginSelected: value,
                anyChangeInData: true,
                anyChangeInDataLogin: true
            }, () => {

                // this.onPickupLocationValueChange(this.state.pickupLocationSelected)
            });

        }
    }

    onLogoutValueChange(value: string) {
        if (value)
            this.setState({
                logoutSelected: value,
                anyChangeInData: true,
                anyChangeInDataLogout: true
            });
    }

    onOfficeLoginValueChange(value: string) {
        this.setState({
            officeLoginSelected: value,
            anyChangeInData: true,
            anyChangeInDataLogin: true
        });
    }

    onOfficeLogoutValueChange(value: string) {
        this.setState({
            officeLogoutSelected: value,
            anyChangeInData: true,
            anyChangeInDataLogout: true
        });
    }

    onPickupLocationValueChange(value: string) {

        this.setState({
            pickupLocationSelected: value,
            anyChangeInData: true,
            anyChangeInDataLogin: true
        });
        if (value === "Others") {
            this.goToLocationPicker("from");
        }
    }

    onDropLocationValueChange(value: string) {
        this.setState({
            dropLocationSelected: value,
            anyChangeInData: true,
            anyChangeInDataLogout: true
        });
        if (value === "Others") {
            this.goToLocationPicker("to");
        }
    }

    toNickNameChangeHandler(text) {
        if (text) {
            this.setState({
                toNickName: text
            });
        }
    }

    fromNickNameChangeHandler(text) {
        if (text) {
            this.setState({
                fromNickName: text
            });
        }
    }

    goToLocationPicker(type) {
        this.props.navigation.navigate("MapPicker", {
            getLocationPicker: this.getLocationPicker.bind(this),
            type: type
        });
    }

    getLocationPicker(selectedLocation, selectLat, selectLng, type) {
        //let recieveBody = { selectedLocation, selectLat, selectLng, type };
        //alert(JSON.stringify(recieveBody));
        if (type == "from")
            this.setState({
                fromSelectedLocation: selectedLocation,
                fromSelectLat: selectLat,
                fromSelectLng: selectLng,
                visibleModal: "AddNickName",
                type
            });
        else if (type == "to")
            this.setState({
                toSelectedLocation: selectedLocation,
                toSelectLat: selectLat,
                toSelectLng: selectLng,
                visibleModal: "AddNickName",
                type
            });
    }

    saveEmployeLocation() {
        if (
            !(this.state.type == "from"
                ? this.state.fromNickName
                : this.state.toNickName)
        ) {
            Alert.alert("Add location", "Place name cannot be blank");
            return;
        }
        /* else {
             this.setState({ visibleModal: false });
           }*/

        let body = {
            DeviceID: this.state.UserId,
            NickName:
                this.state.type == "from"
                    ? this.state.fromNickName
                    : this.state.toNickName,
            Latitude:
                this.state.type == "from"
                    ? this.state.fromSelectLat
                    : this.state.toSelectLat,
            Longitude:
                this.state.type == "from"
                    ? this.state.fromSelectLng
                    : this.state.toSelectLng,
            Location:
                this.state.type == "from"
                    ? this.state.fromSelectedLocation
                    : this.state.toSelectedLocation
        };
        //alert(JSON.stringify(body));
        setTimeout(() => {
            this.setState({isLoading: true});
        }, 0);

        API.newFetchJSON(
            this.state.CustomerUrl + URL.SAVE_LOCATION,
            body,
            true,
            this.callback.bind(this),
            TYPE.ADD_CUSTOM_LOCATION
        );
        /*if (response)
          handleResponse.saveEmployeeLocation(
            response,
            this,
            this.state.type,
            this.state.type == "from"
              ? this.state.fromNickName
              : this.state.toNickName
          );
        else this.setState({ isLoading: false });*/
    }

    /*********************** End of Update Roster **********************/
    componentDidMount() {
        AsyncStorage.multiGet(
            [asyncString.ACCESS_TOKEN, asyncString.USER_ID, asyncString.CAPI],
            (err, savedData) => {
                let access_token = CryptoXor.decrypt(savedData[0][1], asyncString.ACCESS_TOKEN); // JSON.parse(JSON.stringify(savedData[0][1]));
                let CustomerUrl = savedData[2][1];
                let UserId = JSON.parse(JSON.stringify(savedData[1][1]));
                if (!access_token) return;
                if (!UserId) return;
                this.setState({
                    access_token: access_token,
                    UserId: UserId,
                    CustomerUrl
                });
            }
        );
    }

    getDaysInMonth(month, year, days) {
        let pivot = moment()
            .month(month)
            .year(year)
            .startOf("month");
        const end = moment()
            .month(month)
            .year(year)
            .endOf("month");

        let dates = {};
        const disabled = {disabled: true, disableTouchEvent: true};
        while (pivot.isBefore(end)) {
            days.forEach(day => {
                dates[pivot.day(day).format("YYYY-MM-DD")] = disabled;
            });
            pivot.add(7, "days");
        }

        return dates;
    }

    /************************ Update roster ************************/
    updateRoster() {
        if (!this.state.anyChangeInData) {
            Alert.alert("Roster", "Roster not changed");
            return;
        }
        /*alert(
                          "anyChangeInData : " +
                            this.state.anyChangeInData +
                            "\nanyChangeInDataLogin : " +
                            this.state.anyChangeInDataLogout +
                            "\nanyChangeInDataLogin : " +
                            this.state.anyChangeInDataLogout
                        );*/

        let body = {
            officeLoginSelected: this.state.officeLoginSelected,
            officeLogoutSelected: this.state.officeLogoutSelected,
            loginSelected: this.state.loginSelected,
            logoutSelected: this.state.logoutSelected,
            pickupLocationSelected: this.state.pickupLocationSelected,
            dropLocationSelected: this.state.dropLocationSelected
        };
        //return;
        //console.warn(JSON.stringify(body));
        //return;
        /*********************************** Validation ***********************************/
        if (
            !CalendarPicker.isSelected(this.state.officeLoginSelected) &&
            !CalendarPicker.isSelected(this.state.officeLogoutSelected)
        ) {
            Alert.alert("Roster", "Select login/logout office");
            return;
        }

        if (
            !CalendarPicker.isSelected(this.state.logoutSelected) &&
            !CalendarPicker.isSelected(this.state.loginSelected) &&
            !CalendarPicker.isSelected(this.state.pickupLocationSelected) &&
            !CalendarPicker.isSelected(this.state.dropLocationSelected)
        ) {
            Alert.alert("Roster", "Select login/logout time");
            return;
        }

        if (
            CalendarPicker.isSelected(this.state.loginSelected) &&
            !CalendarPicker.isSelected(this.state.pickupLocationSelected)
        ) {
            Alert.alert("Roster", "Select pickup location");
            return;
        } else if (
            !CalendarPicker.isSelected(this.state.loginSelected) &&
            CalendarPicker.isSelected(this.state.pickupLocationSelected)
        ) {
            Alert.alert("Roster", "Select login time");
            return;
        }

        if (
            CalendarPicker.isSelected(this.state.logoutSelected) &&
            !CalendarPicker.isSelected(this.state.dropLocationSelected)
        ) {
            Alert.alert("Roster", "Select drop location");
            return;
        } else if (
            !CalendarPicker.isSelected(this.state.logoutSelected) &&
            CalendarPicker.isSelected(this.state.dropLocationSelected)
        ) {
            Alert.alert("Roster", "Select logout Time");
            return;
        }
        this.setState({isLoading: false, showLoader: true});
        /*********************************** End Validation ***********************************/
        const responseRosterDetails = JSON.parse(this.props.rosterDetails);
        /************************************ Manually Adding searched location ************************************/

        let pushToDataBody = [];
        let pushFromDataBody = [];
        if (this.state.toAddressID) {
            pushToDataBody = [
                {
                    ID: this.state.toAddressID,
                    Name: this.state.toNickName,
                    Address: this.state.toSelectedLocation,
                    Lat: this.state.toSelectLat,
                    Lng: this.state.toSelectLng
                }
            ];
        }

        if (this.state.fromAddressID) {
            pushFromDataBody = [
                {
                    ID: this.state.fromAddressID,
                    Name: this.state.fromNickName,
                    Address: this.state.fromSelectedLocation,
                    Lat: this.state.fromSelectLat,
                    Lng: this.state.fromSelectLng
                }
            ];
        }
        let newDate = [
            ...pushToDataBody,
            ...pushFromDataBody,
            ...responseRosterDetails.Locations
        ];
        //("New Data  : " + JSON.stringify(newDate));
        const rosterDetailsLocations = _.uniqBy(newDate, "Name");

        /******************************* End of Manual Adding Searched location *************************************/
        let updateBody = {};
        if (this.state.anyChangeInDataLogin && !this.state.anyChangeInDataLogout) {
            updateBody = {
                RosterDate: this.state.RosterDate,
                RosterID: this.state.RosterID,
                DeviceID: this.state.UserId,
                LoginLocID: findID(
                    this.state.pickupLocationSelected,
                    rosterDetailsLocations
                ),

                LoginTime:
                    splitData(this.state.loginSelected, 0).toUpperCase() === "SELECT"
                        ? ""
                        : splitData(this.state.loginSelected, 0) === "Cancel"
                        ? "NS"
                        : splitData(this.state.loginSelected, 0),

                LoginRouteType: splitData(this.state.loginSelected, 2),
                LoginOffice: findID(
                    this.state.officeLoginSelected,
                    responseRosterDetails.Offices
                ),

                LoginLocName:
                    !this.state.pickupLocationSelected |
                    (this.state.pickupLocationSelected === "SELECT") |
                    (this.state.pickupLocationSelected === "SELECT") |
                    (this.state.pickupLocationSelected === "NA")
                        ? ""
                        : this.state.pickupLocationSelected,

                LoginLocAddress: findAddress(
                    this.state.pickupLocationSelected,
                    rosterDetailsLocations
                ),

                LoginLocLat: findLat(
                    this.state.pickupLocationSelected,
                    rosterDetailsLocations
                ),
                LoginLocLng: findLng(
                    this.state.pickupLocationSelected,
                    rosterDetailsLocations
                )
            };
        } else if (
            !this.state.anyChangeInDataLogin &&
            this.state.anyChangeInDataLogout
        ) {
            updateBody = {
                RosterDate: this.state.RosterDate,
                RosterID: this.state.RosterID,
                DeviceID: this.state.UserId,

                LogoutLocID: findID(
                    this.state.dropLocationSelected,
                    rosterDetailsLocations
                ),
                LogoutTime:
                    splitData(this.state.logoutSelected, 0).toUpperCase() === "SELECT"
                        ? ""
                        : splitData(this.state.logoutSelected, 0) === "Cancel"
                        ? "NS"
                        : splitData(this.state.logoutSelected, 0),
                LogoutRouteType: splitData(this.state.logoutSelected, 2),

                LogoutOffice: findID(
                    this.state.officeLogoutSelected,
                    responseRosterDetails.Offices
                ),

                LogoutLocName:
                    !this.state.dropLocationSelected |
                    (this.state.dropLocationSelected === "SELECT") |
                    (this.state.dropLocationSelected === "SELECT") |
                    (this.state.dropLocationSelected === "NA")
                        ? ""
                        : this.state.dropLocationSelected,

                LogoutLocAddress: findAddress(
                    this.state.dropLocationSelected,
                    rosterDetailsLocations
                ),

                LogoutLocLng: findLat(
                    this.state.dropLocationSelected,
                    rosterDetailsLocations
                ),
                LogoutLocLat: findLng(
                    this.state.dropLocationSelected,
                    rosterDetailsLocations
                )
            };
        } else if (
            this.state.anyChangeInDataLogin &&
            this.state.anyChangeInDataLogout
        ) {
            updateBody = {
                RosterDate: this.state.RosterDate,
                RosterID: this.state.RosterID,
                DeviceID: this.state.UserId,
                LoginLocID: findID(
                    this.state.pickupLocationSelected,
                    rosterDetailsLocations
                ),
                LogoutLocID: findID(
                    this.state.dropLocationSelected,
                    rosterDetailsLocations
                ),
                LoginTime:
                    splitData(this.state.loginSelected, 0).toUpperCase() === "SELECT"
                        ? ""
                        : splitData(this.state.loginSelected, 0) === "Cancel"
                        ? "NS"
                        : splitData(this.state.loginSelected, 0),
                LogoutTime:
                    splitData(this.state.logoutSelected, 0).toUpperCase() === "SELECT"
                        ? ""
                        : splitData(this.state.logoutSelected, 0) === "Cancel"
                        ? "NS"
                        : splitData(this.state.logoutSelected, 0),
                LoginRouteType: splitData(this.state.loginSelected, 2),
                LogoutRouteType: splitData(this.state.logoutSelected, 2),
                LoginOffice: findID(
                    this.state.officeLoginSelected,
                    responseRosterDetails.Offices
                ),
                LogoutOffice: findID(
                    this.state.officeLogoutSelected,
                    responseRosterDetails.Offices
                ),
                LoginLocName:
                    !this.state.pickupLocationSelected |
                    (this.state.pickupLocationSelected === "SELECT") |
                    (this.state.pickupLocationSelected === "SELECT") |
                    (this.state.pickupLocationSelected === "NA")
                        ? ""
                        : this.state.pickupLocationSelected,
                LogoutLocName:
                    !this.state.dropLocationSelected |
                    (this.state.dropLocationSelected === "SELECT") |
                    (this.state.dropLocationSelected === "SELECT") |
                    (this.state.dropLocationSelected === "NA")
                        ? ""
                        : this.state.dropLocationSelected,
                LoginLocAddress: findAddress(
                    this.state.pickupLocationSelected,
                    rosterDetailsLocations
                ),
                LogoutLocAddress: findAddress(
                    this.state.dropLocationSelected,
                    rosterDetailsLocations
                ),
                LoginLocLat: findLat(
                    this.state.pickupLocationSelected,
                    rosterDetailsLocations
                ),
                LoginLocLng: findLng(
                    this.state.pickupLocationSelected,
                    rosterDetailsLocations
                ),
                LogoutLocLng: findLat(
                    this.state.dropLocationSelected,
                    rosterDetailsLocations
                ),
                LogoutLocLat: findLng(
                    this.state.dropLocationSelected,
                    rosterDetailsLocations
                )
            };
        }

        API.newFetchJSON(
            this.state.CustomerUrl + URL.SaveSingleRoster,
            updateBody,
            this.state.access_token,
            this.callback.bind(this),
            TYPE.UPDATE_ROSTER
        );
        /*if (response)
          handleResponse.updateRosterForSelectedDate(
            response,
            this,
            responseRosterDetails.AvailableRosters
          );
        else this.setState({ isLoading: false });*/
    }

    /************************End Update Roster********************/

    render() {

        //Reading props
        let rosterDetails = JSON.parse(this.props.rosterDetails);
        /************************** calculated Roster ************************/
        let calculateRoster = [
            {
                RosterRuleID: "",
                LoginShifts: "",
                LogoutShifts: "",
                AllowOtherLocationsLogin: 0,
                AllowOtherLocationsLogout: 0,
                WeekdaysAllowed: "",
                OfficeLocationsAllowed: "",
                EffectiveFrom: "",
                EffectiveTo: "",
                // RestrictToPOILogin: 0,
                RestrictToPOILoginMap: new Map(),
                RestrictToPOILogOutMap: new Map()
                // RestrictToPOILogout: 0
            }
        ];
        let selectedDaysinNumber = [];
        let Offices = [];
        const weeklyOffDaysToNumber = {
            Sunday: "0",
            Monday: "1",
            Tuesday: "2",
            Wednesday: "3",
            Thursday: "4",
            Friday: "5",
            Saturday: "6"
        };
        if (this.state.RosterDate) {
            selectedDaysinNumber.push(
                weeklyOffDaysToNumber[moment(this.state.RosterDate).format("dddd")]
            );

            /*calculateRoster = getCalculatedRoster(
                                      rosterDetails.Rosters,
                                      selectedDaysinNumber
                                    );*/
            let officeLoginSelectedNumber = findID(
                this.state.officeLoginSelected,
                rosterDetails.Offices
            );
            let officeLogoutSelectedNumber = findID(
                this.state.officeLogoutSelected,
                rosterDetails.Offices
            );
            if (officeLoginSelectedNumber && officeLogoutSelectedNumber) {
                let customisedRoster = filterShiftTimeBasedOnCutOffTime(
                    rosterDetails.Rosters,
                    this.state.RosterDate,
                    this.state.RosterDate,
                    officeLoginSelectedNumber,
                    officeLogoutSelectedNumber
                );
                console.warn("customisedRoster : " + JSON.stringify(customisedRoster));
                calculateRoster = getCalculatedRoster(
                    //rosterDetails.Rosters,
                    customisedRoster,
                    selectedDaysinNumber,
                    officeLoginSelectedNumber.toString(),
                    officeLogoutSelectedNumber.toString()
                );
                console.warn("calculateRoster-->" + JSON.stringify(calculateRoster[0].RestrictToPOILoginMap.get("07:00")));
            }
            for (i = 0; i < rosterDetails.Offices.length; i++) {
                let OfficeTotal = rosterDetails.Offices[i].ID.toString();

                //if (calculateRoster[0].OfficeLocationsAllowed.includes(OfficeTotal)) {
                Offices.push({
                    ID: rosterDetails.Offices[i].ID,
                    Name: rosterDetails.Offices[i].Name,
                    Address: rosterDetails.Offices[i].Address,
                    Lat: rosterDetails.Offices[i].Lat,
                    Lng: rosterDetails.Offices[i].Lng
                }); //rosterDetails.Offices
                // }
            }
        } else {
            Offices = rosterDetails.Offices;
        }
        /************************** calculated Roster ************************/

        let rosterDetailsLocationsJSON = rosterDetails.Locations;

        let dateArray;
        dateArray = rosterDetails.AvailableRosters.split("|");
        let dates = {};
        dateArray.forEach(val => {
            if (val === moment().format("YYYY-MM-DD")) {
                dates[val] = {
                    textColor: colors.WHITE,
                    selected: true,
                    selectedColor: colors.GREEN
                };
            } else
                dates[val] = {
                    textColor: colors.WHITE,
                    selected: true,
                    selectedColor: colors.BLUE
                };
        });

        //Merging Two array
        let newDates = Object.assign(this.state.markedDates, dates);

        /************************************ Manually Adding searched location ************************************/

        let pushToDataBody = [];
        let pushFromDataBody = [];
        if (this.state.toAddressID) {
            pushToDataBody = [
                {
                    ID: this.state.toAddressID,
                    Name: this.state.toNickName,
                    Address: this.state.toSelectedLocation,
                    Lat: this.state.toSelectLat,
                    Lng: this.state.toSelectLng
                }
            ];
        }

        if (this.state.fromAddressID) {
            pushFromDataBody = [
                {
                    ID: this.state.fromAddressID,
                    Name: this.state.fromNickName,
                    Address: this.state.fromSelectedLocation,
                    Lat: this.state.fromSelectLat,
                    Lng: this.state.fromSelectLng
                }
            ];
        }
        let newData = [
            ...pushToDataBody,
            ...pushFromDataBody,
            ...rosterDetailsLocationsJSON
        ];
        //console.warn("New Data  : " + JSON.stringify(newDate));
        const rosterDetailsLocations = _.uniqBy(newData, "Name");
        const rosterDetailsLocationsWithoutOthers = [];
        for (i = 0; i < rosterDetailsLocations.length; i++) {
            if (rosterDetailsLocations[i].ID === "H") {
                rosterDetailsLocationsWithoutOthers.push(rosterDetailsLocations[i]);
            }
        }

        /******************************* End of Manual Adding Searched location *************************************/

        return (
            <View>
                <Modal
                    isVisible={this.state.visibleModal === "AddNickName"}
                    style={{justifyContent: "flex-end", margin: 0}}
                >
                    {this._renderAddNickNameModalContent()}
                </Modal>
                <CalendarList
                    maxDate={moment()
                        .add(rosterDetails.EligibleRosterDays - 2, "days")
                        .format()}
                    markedDates={newDates}
                    displayLoadingIndicator={false}
                    markingType={"multi-dot"}
                    hideExtraDays={true}
                    onDayPress={day => {
                        this.setState({
                            isLoading: true,
                            RosterDate: day.dateString
                        });

                        let body = {
                            RosterDate: day.dateString,
                            DeviceID: this.state.UserId
                        };
                        API.newFetchJSON(
                            this.state.CustomerUrl + URL.GET_SELECTED_ROSTER,
                            body,
                            this.state.access_token,
                            this.callback.bind(this),
                            TYPE.GET_SELECTED_ROSTER,
                            {
                                rosterDetails: this.props.rosterDetails,
                                RosterDate: this.state.RosterDate
                            }
                        );

                        /*            if (response)
                          handleResponse.getSelectedRoster(
                            response,
                            this,
                            this.props.rosterDetails,
                            this.state.RosterDate
                          );
                        else this.setState({ isLoading: false });*/
                    }}
                    onVisibleMonthsChange={date => {
                    }}
                    pastScrollRange={
                        1 // Max amount of months allowed to scroll to the past. Default = 50
                    }
                    futureScrollRange={
                        12 // Max amount of months allowed to scroll to the future. Default = 50
                    }
                    scrollEnabled={
                        true // Enable or disable scrolling of calendar list
                    }
                    showScrollIndicator={
                        true // Enable or disable vertical scroll indicator. Default = false
                    }
                    theme={{todayTextColor: colors.GREEN}}
                />
                <PopupDialog
                    height={1}
                    width={1}
                    overlayOpacity={0.7}
                    containerStyle={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center",
                        backgroundColor: "transparent"
                    }}
                    dialogAnimation={slideAnimation}
                    dialogTitle={
                        <DialogTitle
                            title={Moment(this.state.RosterDate).format("MMM, DD")}
                        />
                    }
                    ref={popupDialog => {
                        this.popupDialog = popupDialog;
                    }}
                >

                    {this._renderViewOrModify(
                        calculateRoster,
                        Offices,
                        rosterDetailsLocations,
                        rosterDetailsLocationsWithoutOthers,
                        rosterDetails.RosteringAllowedLogin,
                        rosterDetails.RosteringAllowedLogout
                    )}
                </PopupDialog>
            </View>
        );
    }

    _renderViewOrModify(
        calculateRoster,
        Offices,
        rosterDetailsLocations,
        rosterDetailsLocationsWithoutOthers,
        RosteringAllowedLogin,
        RosteringAllowedLogout
    ) {
        console.warn("RenderViewModify" + JSON.stringify(calculateRoster[0].RestrictToPOILoginMap));
        //console.warn("calculateRoster : " + JSON.stringify(calculateRoster));
        //console.warn("LogoutShifts : " + calculateRoster[0].LogoutShifts);
        const date = this.state.RosterDate;
        const selectedDate = moment(new Date(date)).format("YYYY-MM-DD");
        const prevDate = moment()
            .subtract(1, "days")
            .format("YYYY-MM-DD");
        const currentDate = moment().format("YYYY-MM-DD");
        if (
            selectedDate &&
            selectedDate === prevDate &&
            this.state.logoutSelected &&
            (this.state.logoutSelected.includes("*") ||
                this.state.logoutSelected.includes("Cancel,0,D") ||
                (calculateRoster[0].LogoutShifts &&
                    calculateRoster[0].LogoutShifts.includes("*")))
        ) {
            return this._renderDisplayAndEditModeRoster(
                calculateRoster,
                Offices,
                rosterDetailsLocations,
                rosterDetailsLocationsWithoutOthers,
                RosteringAllowedLogin,
                RosteringAllowedLogout
            );
        } else {
            return selectedDate && moment(selectedDate).isBefore(currentDate)
                ? this._renderDisplayModeRoster(
                    calculateRoster,
                    Offices,
                    rosterDetailsLocations,
                    rosterDetailsLocationsWithoutOthers,
                    RosteringAllowedLogin,
                    RosteringAllowedLogout
                )
                : this._renderEditSaveModeRoster(
                    calculateRoster,
                    Offices,
                    rosterDetailsLocations,
                    rosterDetailsLocationsWithoutOthers,
                    RosteringAllowedLogin,
                    RosteringAllowedLogout
                );
        }
    }
}

CalendarPicker.propTypes = {
    rosterDetails: PropTypes.string,
    access_token: PropTypes.string,
    UserId: PropTypes.string
};

CalendarPicker.defaultProps = {
    rosterDetails: [],
    access_token: "",
    UserId: ""
};

export default withNavigation(CalendarPicker);


function findID(Name, array) {
    if (!Name) return "";
    let i;
    for (i = 0; i < array.length; i++) {
        if (array[i].Name.trim() == Name.toString().trim()) {
            return array[i].ID;
        }
    }
    return "";
}

function findAddress(Name, array) {
    if (!Name) return "";
    let i;
    for (i = 0; i < array.length; i++) {
        if (array[i].Name.toString().trim() == Name.toString().trim()) {
            return array[i].Address;
        }
    }
    return "";
}

function findLat(Name, array) {
    if (!Name) return "";
    let i;
    for (i = 0; i < array.length; i++) {
        if (array[i].Name.toString().trim() == Name.toString().trim()) {
            return array[i].Lat;
        }
    }
    return "";
}

function findLng(Name, array) {
    if (!Name) return "";
    let i;
    for (i = 0; i < array.length; i++) {
        if (array[i].Name.toString().trim() == Name.toString().trim()) {
            return array[i].Lng;
        }
    }
    return "";
}

function splitData(value, index) {
    if (value && value.includes(",")) return value.split(",")[index];
    return "";
}

function getCalculatedRoster(
    Rosters,
    selectedDaysArray,
    officeLoginSelectedNumber,
    officeLogoutSelectedNumber
) {
    let rosterTotalWeekdaysAvailable = [];
    for (i = 0; i < Rosters.length; i++) {
        rosterTotalWeekdaysAvailable.push(Rosters[i].WeekdaysAllowed);
    }
    for (i = 0; i < selectedDaysArray.length; i++) {
        for (j = 0; j < Rosters.length; j++) {
            if (
                !rosterTotalWeekdaysAvailable.join("|").includes(selectedDaysArray[i])
            ) {
                return [
                    {
                        LoginShifts: "",
                        LogoutShifts: "",
                        OfficeLocationsAllowed: "",
                        AllowOtherLocationsLogin: 0,
                        AllowOtherLocationsLogout: 0,
                        RestrictToPOILogin: 0,
                        RestrictToPOILogout: 0
                    }
                ];
            }
        }
    }

    let newLoginShifts = [];
    for (k = 0; k < Rosters.length; k++) {
        let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
        let LoginShiftsArray = Rosters[k].LoginShifts.split("|");
        for (i = 0; i < WeekdaysAllowedArray.length; i++) {
            for (j = 0; j < LoginShiftsArray.length; j++) {
                newLoginShifts.push(
                    LoginShiftsArray[j] + "#" + WeekdaysAllowedArray[i]
                );
            }
        }
    }
    newLoginShifts = newLoginShifts.sort();
    let newLogoutShifts = [];
    for (k = 0; k < Rosters.length; k++) {
        let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
        let LogoutShiftsArray = Rosters[k].LogoutShifts.split("|");
        for (i = 0; i < WeekdaysAllowedArray.length; i++) {
            for (j = 0; j < LogoutShiftsArray.length; j++) {
                newLogoutShifts.push(
                    LogoutShiftsArray[j] + "#" + WeekdaysAllowedArray[i]
                );
            }
        }
    }
    newLogoutShifts = newLogoutShifts.sort();
    let newOfficeLocationsAllowed = [];
    for (k = 0; k < Rosters.length; k++) {
        let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
        let OfficeLocationsAllowedArray = Rosters[k].OfficeLocationsAllowed.split(
            "|"
        );
        for (i = 0; i < WeekdaysAllowedArray.length; i++) {
            for (j = 0; j < OfficeLocationsAllowedArray.length; j++) {
                newOfficeLocationsAllowed.push(
                    OfficeLocationsAllowedArray[j] + "#" + WeekdaysAllowedArray[i]
                );
            }
        }
    }
    let newAllowOtherLocationsLogin = [];
    for (k = 0; k < Rosters.length; k++) {
        let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
        let AllowOtherLocationsLoginArray = [Rosters[k].AllowOtherLocationsLogin];
        for (i = 0; i < WeekdaysAllowedArray.length; i++) {
            for (j = 0; j < AllowOtherLocationsLoginArray.length; j++) {
                newAllowOtherLocationsLogin.push(
                    AllowOtherLocationsLoginArray[j] + "#" + WeekdaysAllowedArray[i]
                );
            }
        }
    }
    let newAllowOtherLocationsLogout = [];
    for (k = 0; k < Rosters.length; k++) {
        let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
        let AllowOtherLocationsLogoutArray = [Rosters[k].AllowOtherLocationsLogout];
        for (i = 0; i < WeekdaysAllowedArray.length; i++) {
            for (j = 0; j < AllowOtherLocationsLogoutArray.length; j++) {
                newAllowOtherLocationsLogout.push(
                    AllowOtherLocationsLogoutArray[j] + "#" + WeekdaysAllowedArray[i]
                );
            }
        }
    }

    /* let RestrictToPOILogin = [];
    for (k = 0; k < Rosters.length; k++) {
      let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
      let AllowOtherLocationsLoginArray = [Rosters[k].RestrictToPOILogin];
      for (i = 0; i < WeekdaysAllowedArray.length; i++) {
        for (j = 0; j < AllowOtherLocationsLoginArray.length; j++) {
          RestrictToPOILogin.push(
            AllowOtherLocationsLoginArray[j] + "#" + WeekdaysAllowedArray[i]
          );
        }
      }
    } */

    /* let RestrictToPOILogout = [];
    for (k = 0; k < Rosters.length; k++) {
      let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
      let AllowOtherLocationsLogoutArray = [Rosters[k].RestrictToPOILogout];
      for (i = 0; i < WeekdaysAllowedArray.length; i++) {
        for (j = 0; j < AllowOtherLocationsLogoutArray.length; j++) {
          RestrictToPOILogout.push(
            AllowOtherLocationsLogoutArray[j] + "#" + WeekdaysAllowedArray[i]
          );
        }
      }
    } */

    /*Author : Nipun
    Changes : for nodal
    */
    let RestrictToPOILoginMap = new Map();
    for (k = 0; k < Rosters.length; k++) {
        let LoginShiftsArray = Rosters[k].LoginShifts.split("|");
        for (j = 0; j < LoginShiftsArray.length; j++) {
            RestrictToPOILoginMap.set(LoginShiftsArray[j].split(",")[0], Rosters[k].RestrictToPOILogin);
        }
    }

    let RestrictToPOILogOutMap = new Map();
    for (k = 0; k < Rosters.length; k++) {
        let LogoutShiftsArray = Rosters[k].LogoutShifts.split("|");
        for (j = 0; j < LogoutShiftsArray.length; j++) {
            RestrictToPOILogOutMap.set(LogoutShiftsArray[j].split(",")[0], Rosters[k].RestrictToPOILogout);
        }
    }


    let OfficeLocationsAllowed = getCalculatedValue(
        newOfficeLocationsAllowed,
        selectedDaysArray
    );
    let LoginShifts = getCalculatedValue(newLoginShifts, selectedDaysArray);
    let LogoutShifts = getCalculatedValue(newLogoutShifts, selectedDaysArray);
    return [
        {
            LoginShifts: OfficeLocationsAllowed.includes(officeLoginSelectedNumber)
                ? LoginShifts
                : "",
            LogoutShifts: OfficeLocationsAllowed.includes(officeLogoutSelectedNumber)
                ? LogoutShifts
                : "",
            OfficeLocationsAllowed: getCalculatedValue(
                newOfficeLocationsAllowed,
                selectedDaysArray
            ),
            AllowOtherLocationsLogin: getCalculatedValue(
                newAllowOtherLocationsLogin,
                selectedDaysArray
            ),
            AllowOtherLocationsLogout: getCalculatedValue(
                newAllowOtherLocationsLogout,
                selectedDaysArray
            ),
            /* RestrictToPOILogin: getCalculatedValue(
              RestrictToPOILogin,
              selectedDaysArray
            ), */
            RestrictToPOILoginMap,
            RestrictToPOILogOutMap
            /* RestrictToPOILogout: getCalculatedValue(
              RestrictToPOILogout,
              selectedDaysArray
            ) */
        }
    ];
}

function getCalculatedValue(shifts, selectedDaysArray) {
    let matched = [];
    for (i = 0; i < selectedDaysArray.length; i++) {
        for (j = 0; j < shifts.length; j++) {
            if (selectedDaysArray[i] === shifts[j].split("#")[1]) {
                matched.push(shifts[j]);
            }
        }
    }
    let onlyMatched = [];
    for (i = 0; i < matched.length; i++) {
        onlyMatched.push(matched[i].substr(0, matched[i].lastIndexOf("#")));
    }
    const count = {};
    onlyMatched.forEach(function (i) {
        count[i] = (count[i] || 0) + 1;
    });

    let common = [];
    let max = selectedDaysArray.length;
    Object.keys(count).forEach(function (key) {
        var value = count[key];
        if (value >= max) {
            common.push(key);
        }
    });
    let removeDuplicate = [...new Set(common)];
    return removeDuplicate.join("|");
}

function shiftTimes(selected, Shifts) {
    //console.warn("Selected Value : "+selected)
    //var shiftArray = Shifts.split("|");
    //let calculatedSelectedDate = findShiftTime(selected.split(",")[0],shiftArray);
    // console.warn("Selected :: "+selected.split(",")[0]
    // +"\nShifts :: "+Shifts
    // +"\nincludes ::"+Shifts.includes(selected.split(",")[0])
    // +"\ncalculatedSelectedDate : "+calculatedSelectedDate);
    console.warn("Selected Value : " + selected);
    return selected.includes("SELECT")
        ? Shifts.includes(selected.split(",")[0])
            ? Shifts + "|"
            : selected + "|" + Shifts + "|"
        : Shifts.includes(selected.split(",")[0])
            ? "SELECT,0,D|" + "|" + Shifts + "|"
            : "SELECT,0,D|" + selected + "|" + Shifts + "|";
}

function findShiftTime(time, array) {
    for (i = 0; i < array.length; i++) {
        if (array[i].includes(time)) {
            return array[i];
        }
    }
    return "";
}
