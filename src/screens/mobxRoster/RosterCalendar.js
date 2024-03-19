import React, {Component} from "react";
import {CalendarList} from "react-native-calendars";
import moment from "moment";
import {colors} from "../../utils/Colors";
import {Button, Box, Text} from "native-base";
import {Alert, FlatList, Keyboard, ScrollView, StatusBar, View} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import RBSheet from "react-native-raw-bottom-sheet";
import {spinner} from "../../network/loader/Spinner";
import {inject, observer} from "mobx-react";
import FAB from "react-native-fab";
import Modal from "react-native-modal";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import * as Toast from "../../utils/Toast";
import {rosterType} from "../roster/customeComponent/RosterType";
import {EventRegister} from "react-native-event-listeners";
import {TYPE} from "../../model/ActionType";
import { styles } from "../../utils/RegistartionStyle";
import TouchableDebounce from "../../utils/TouchableDebounce";

const draggableIcon = {
    width: 36,
    height: 5,
    borderRadius: 4,
    margin: 2,
    backgroundColor: "#ccc"
};

@inject("rosterStore")
@observer
class RosterCalendar extends Component {

    static navigationOptions = {
        title: "My Roster",
        headerTitleStyle: {fontFamily: "Roboto"}
    };
    _renderDisclaimerType = () => (
        <View padder style={{marginTop: 16, backgroundColor: "#FFFFFF"}}>
            <Box style={{padding: 10}}>
                <ScrollView>
                    {this._renderContent(this.props.rosterStore.optOutContent)}
                    {this._renderTC()}
                </ScrollView>
            </Box>
        </View>
    );
    _renderMultiRoster = () => (
        <View padder style={{marginTop: 16, backgroundColor: "#FFFFFF"}}>
            <Box style={{padding: 10}}>
            <View
                style={styles.viewNotSelectedStyle}
            >
                <Text style={{color: colors.BLACK, fontSize: 15, fontWeight:  "500", flex: 0.2}}>
                    #
                </Text>
                <Text style={{color: colors.BLACK, fontSize: 15, fontWeight:  "500", flex: 0.4}}>
                    Login
                </Text>
                <Text style={{color: colors.BLACK, fontSize: 15, fontWeight:  "500", flex: 0.4}}>
                    Logout
                </Text>
            </View>
            <FlatList
                data={this.props.rosterStore.selectedDateRosterData}
                contentcontainerstyle={styles.flatListContainer}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => {
                    return (
                        <React.Fragment>
                            <TouchableDebounce
                                key={index}
                                style={styles.viewNotSelectedStyle}
                                onPress={() => {
                                    this.props.rosterStore.setSelectedDateRoster(item);
                                    this.props.rosterStore.disableMultiRosterModal();
                                    console.warn('Action - ', this.props.rosterStore.rosterAction);
                                    if (this.props.rosterStore.rosterAction == 'UPDATE') {
                                        this.props.navigation.navigate("RosterUpdate");
                                    } else if (this.props.rosterStore.rosterAction == 'CANCELLOGIN') {
                                        this.props.rosterStore.selectedRoster.anyChangeInDataLogin = true;
                                        this.props.rosterStore.selectedRoster.loginSelected = 'Cancel';
                                        this.storeUpdate();
                                    } else if (this.props.rosterStore.rosterAction == 'CANCELLOGOUT') {
                                        this.props.rosterStore.selectedRoster.anyChangeInDataLogout = true;
                                        this.props.rosterStore.selectedRoster.logoutSelected = 'Cancel';
                                        this.storeUpdate();
                                    } else if (this.props.rosterStore.rosterAction == 'CANCELBOTH') {
                                        this.props.rosterStore.selectedRoster.anyChangeInDataLogin = true;
                                        this.props.rosterStore.selectedRoster.anyChangeInDataLogout = true;
                                        this.props.rosterStore.selectedRoster.loginSelected = 'Cancel';
                                        this.props.rosterStore.selectedRoster.logoutSelected = 'Cancel';
                                        this.storeUpdate();
                                    }
                                }}
                            >
                                <Text style={{color: colors.BLACK, fontSize: 14, fontWeight:  "400", flex: 0.2}}>
                                    {index + 1}
                                </Text>
                                <Text style={{color: colors.BLACK, fontSize: 14, fontWeight:  "400", flex: 0.4}}>
                                    {item.LoginShift == "NS" ? "Cancelled" : item.LoginShift}
                                </Text>
                                <Text style={{color: colors.BLACK, fontSize: 14, fontWeight:  "400", flex: 0.4}}>
                                    {item.LogoutShift == "NS" ? "Cancelled" : item.LogoutShift}
                                </Text>
                            </TouchableDebounce>
                        </React.Fragment>
                    )
                }}
                style={{marginTop: 10}}/>
            </Box>
        </View>
    );

    constructor(props) {
        super(props);
        props.rosterStore.setInitRosterValues(this);
    }

    _renderQuickActions() {
        let size;
        const store = this.props.rosterStore;
        if (store.MaxShiftsPerDay > 1 && store.selectedDateRosterData?.length < store.MaxShiftsPerDay) {
            (store.onlyLogin && store.onlyLogOut) ? (size = Platform.OS == 'android' ? 350 : 320) : size = 240;
        } else {
            (store.onlyLogin && store.onlyLogOut) ? size = 250 : size = 153;
        }
        let date = moment(store.RosterDate).format("DD-MMM");
        return (
            <RBSheet
                ref={ref => {
                    this.RBSheet = ref;
                }}
                date={date}
                height={size}
                duration={200}
                closeOnDragDown={true}
                closeOnPressMask={true}
                closeOnPressBack={true}
                customStyles={{
                    container: {
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom:25
                    }
                }}
            >
                {store.selectedDateRosterData?.length < store.MaxShiftsPerDay && (
                    <>
                    <Button
                        style={{backgroundColor: colors.WHITE}}
                        onPress={() => {
                            this.props.rosterStore.setNewRosterDay();
                            this.RBSheet.close();
                            this.props.navigation.navigate("RosterUpdate");
                        }}
                    >
                        <View
                        style={{
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                        <Text style={{color: colors.BLACK, textTransform: 'uppercase'}}>Create Additional Roster</Text>
                        <Text style={{color: colors.BLACK, fontSize: 11, fontStyle: 'italic'}}>(Same Work Shift Day)</Text>
                        </View>
                    </Button>
                    <View style={draggableIcon}/>
                    </>
                )}
                <Button
                    style={{backgroundColor: colors.WHITE}}
                    onPress={() => {
                        if (store.selectedDateRosterData?.length > 1) {
                            console.warn('update modal');
                            this.RBSheet.close();
                            setTimeout(() => {
                                store.enableMultiRosterModal('UPDATE');
                            }, 1000);
                        } else {
                            this.RBSheet.close();
                            this.props.navigation.navigate("RosterUpdate");
                        }
                    }}
                >
                    <Text style={{color: colors.BLACK}}>Update Roster</Text>
                </Button>
                <View style={draggableIcon}/>
                {store.onlyLogin && (
                    <Button
                        style={{backgroundColor: colors.WHITE}}
                        onPress={() => {
                            if (store.selectedDateRosterData?.length > 1) {
                                this.RBSheet.close();
                                setTimeout(() => {
                                    store.enableMultiRosterModal('CANCELLOGIN');
                                }, 1000);
                            } else {
                                this.props.rosterStore.selectedRoster.anyChangeInDataLogin = true;
                                this.props.rosterStore.selectedRoster.loginSelected = 'Cancel';
                                this.RBSheet.close();
                                this.storeUpdate();
                            }
                        }}
                    >
                        <Text style={{color: colors.BLACK}}>
                            Cancel Login
                        </Text>
                    </Button>
                )}
                {store.onlyLogin && (<View style={draggableIcon}/>)}
                {store.onlyLogOut && (
                    <Button
                        style={{backgroundColor: colors.WHITE}}
                        onPress={() => {
                            if (store.selectedDateRosterData?.length > 1) {
                                this.RBSheet.close();
                                setTimeout(() => {
                                    store.enableMultiRosterModal('CANCELLOGOUT');
                                }, 1000);
                            } else {
                                this.props.rosterStore.selectedRoster.anyChangeInDataLogout = true;
                                this.props.rosterStore.selectedRoster.logoutSelected = 'Cancel';
                                this.RBSheet.close();
                                this.storeUpdate();
                            }
                        }}
                    >
                        <Text style={{color: colors.BLACK}}>
                            Cancel Logout
                        </Text>
                    </Button>
                )}
                {store.onlyLogOut && (<View style={draggableIcon}/>)}
                {(store.onlyLogin && store.onlyLogOut) && (
                    <Button
                        style={{backgroundColor: colors.WHITE}}
                        onPress={() => {
                            if (store.selectedDateRosterData?.length > 1) {
                                this.RBSheet.close();
                                setTimeout(() => {
                                    store.enableMultiRosterModal('CANCELBOTH');
                                }, 1000);
                            } else {
                                this.props.rosterStore.selectedRoster.anyChangeInDataLogin = true;
                                this.props.rosterStore.selectedRoster.anyChangeInDataLogout = true;
                                this.props.rosterStore.selectedRoster.loginSelected = 'Cancel';
                                this.props.rosterStore.selectedRoster.logoutSelected = 'Cancel';
                                this.RBSheet.close();
                                this.storeUpdate();
                            }
                        }}
                    >
                        <Text style={{color: colors.BLACK}}>Cancel Both</Text>
                    </Button>
                )}
            </RBSheet>
        );
    };

    storeUpdate() {
        this.props.rosterStore.updateRosterStore(true).then((response) => {
            if (response === "NO-SHOW") {
                this.displayNoSHowAlerts(this.props.rosterStore.NoShowData.title,
                    this.props.rosterStore.NoShowData.message);
            } else if (this.props.rosterStore.rosterUpdated === true) {
                this.props.rosterStore.rosterUpdated = false;
                this.props.navigation.goBack();
            }
        });
    }

    displayNoSHowAlerts(title, message) {
        setTimeout(() => {
            Alert.alert(
                title,
                message,
                [
                    {
                        text: 'NO',
                        onPress: () => {
                            this.RBSheet.close();
                        },
                        style: 'cancel',
                    },
                    {
                        text: 'YES', onPress: () => {
                            this.props.rosterStore.noShowPerformed = true;
                            this.storeUpdate();
                        }
                    },
                ],
                {cancelable: false},
            )
        }, 400);
    }

    _renderContent(data) {
        return <Text style={{marginTop: 8}}>{data}</Text>;
    }

    _renderTC() {
        return (
            <React.Fragment>
                <Button
                    transparent
                    style={{
                        width: "100%",
                        backgroundColor: 'transparent',
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "row",
                        marginTop: 5,
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
                    <Text style={{marginLeft: 10, fontWeight: "700", color: "black",marginTop:1}}>
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
                        full
                        danger
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
        return (
            <View style={{flex: 1}}>
                <View>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.BLUE}
                        barStyle="dark-content"
                    />
                    {spinner.visible(this.props.rosterStore.isLoading)}
                    <Modal
                        isVisible={this.props.rosterStore.visibleOptOutModal === true}
                        style={{justifyContent: 'center', marginVertical: 40, alignContent: 'center'}}
                    >
                        {this._renderDisclaimerType()}
                    </Modal>

                    <Modal
                        isVisible={this.props.rosterStore.visibleMultiRosterModal}
                        onBackButtonPress={() => {
                            this.props.rosterStore.disableMultiRosterModal();
                        }}
                        onBackdropPress={() => {
                            this.props.rosterStore.disableMultiRosterModal();
                        }}
                        style={{justifyContent: 'center', marginTop: 10, alignContent: 'center'}}
                    >
                        {this._renderMultiRoster()}
                    </Modal>

                    {this._renderQuickActions()}
                    <CalendarList
                        minDate={moment().format("YYYY-MM-DD")}
                        maxDate={moment().add(this.props.rosterStore.EligibleRosterDays, "days").format("YYYY-MM-DD")}
                        markedDates={this.props.rosterStore.computedMarkedDates}
                        displayLoadingIndicator={false}
                        markingType={"multi-dot"}
                        hideExtraDays={true}
                        extraData={this.props.rosterStore.AvailableRosters}
                        onDayPress={day => {
                            this.props.rosterStore.getSelectedDateRoster(day.dateString).then(() => {
                                if (this.props.rosterStore.RBSheetOpen === true) {
                                    setTimeout(() => {
                                        this.RBSheet.open();
                                    }, 100);
                                } else {
                                    this.props.navigation.navigate("RosterUpdate");
                                }
                            });
                        }}
                        onVisibleMonthsChange={date => {
                        }}
                        pastScrollRange={1}
                        futureScrollRange={12}
                        scrollEnabled={true}
                        showScrollIndicator={true}
                        theme={{todayTextColor: colors.GREEN}}
                    />
                    {(this.props.rosterStore.RosteringAllowedLogout === 1 || this.props.rosterStore.RosteringAllowedLogin === 1) && (
                    <>
                        <TouchableDebounce
                            style={{
                                width: 130,
                                height: 40,
                                justifyContent: "center",
                                alignItems: "center",
                                position: "absolute",
                                bottom: 30,
                                left:30,
                                backgroundColor: colors.RED,
                                borderRadius: 5,
                                padding: 5,
                                flexDirection: "row"
                            }}
                            onPress={() => {
                                this.props.navigation.navigate("RosterMultiCancel");
                            }}
                        >
                        <Text
                            style={{
                                color: colors.WHITE,
                                fontWeight: "500",
                                fontSize: 20,
                                marginLeft: 10
                            }}
                        >No Show</Text>
                        </TouchableDebounce>
                        <FAB
                            buttonColor={colors.RED}
                            iconTextColor="#FFFFFF"
                            onClickAction={() => {
                                this.props.rosterStore.rosterType = rosterType.both;
                                this.props.navigation.navigate("RosterCreate");
                            }}
                            iconTextComponent={<Ionicons name="ios-add"/>}
                        />
                    </>
                    )}
                </View>
            </View>
        );
    }

    UNSAFE_componentWillMount() {
        this.rosterNotification = EventRegister.addEventListener(TYPE.ROSTER_CANCEL_PUSH_NOTIFICATION, (data) => {
            if (data && data.rosterDate) {
                setTimeout(() => {
                    console.warn("Notification Data ", "rosterDate " + data.rosterDate);
                    this.props.rosterStore.getSelectedDateRoster(data.rosterDate.toString()).then((response) => {
                        if (this.props.rosterStore.RBSheetOpen === true) {
                            this.RBSheet.open();
                        }
                    });
                }, 600);
            }
        });
    }

    componentDidMount() {
        console.warn('this.props.route.params --- ', this.props.route.params);
        const pushNotificationAction = this.props.route.params?.pushNotificationAction; // ", undefined);
        console.warn("componentDidMount "+JSON.stringify(pushNotificationAction));
        if (pushNotificationAction && pushNotificationAction.rosterDate) {
            setTimeout(() => {
                if (this.props.rosterStore.RBSheetOpen === false ) {
                    console.warn("Notification Data ", "rosterDate " + pushNotificationAction.rosterDate);
                    this.props.rosterStore.getSelectedDateRoster(pushNotificationAction.rosterDate.toString()).then((response) => {
                        if (this.props.rosterStore.RBSheetOpen === true) {
                            this.RBSheet.open();
                        }
                    });
                }
            }, 600);
        }
    }

    componentWillUnmount() {
        EventRegister.removeEventListener(this.rosterNotification);
    }

}

export default RosterCalendar;