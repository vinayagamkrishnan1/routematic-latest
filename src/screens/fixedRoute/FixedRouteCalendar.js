import React, {Component} from "react";
import {CalendarList} from "react-native-calendars";
import moment from "moment";
import {colors} from "../../utils/Colors";
import {Alert, FlatList, Platform, StatusBar, TouchableOpacity, View} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {spinner} from "../../network/loader/Spinner";
import {inject, observer} from "mobx-react";
import FAB from "react-native-fab";
import { Text } from "react-native-paper";
import Modal from "react-native-modal";

const draggableIcon = {
    width: 36,
    height: 5,
    borderRadius: 4,
    margin: 2,
    backgroundColor: "#ccc"
};

const fixedRouteHelp = [
    "You can select a single date or a range of dates to roster.",
    "Dates need not be consecutive.",
    "When a login roster is created, a green dot appears below the date.",
    "When a logout roster is created, a blue dot appears below the date.",
    "When login and logout rosters are created, both green and blue dots appear below the date.",
    "You can roster for login or logout or both trips on a date with no rosters.",
    "You can roster only for a login trip on a date that already has a logout roster.",
    "You can roster only for a logout trip on a date that already has a login roster.",
    "If you select a date when both login and logout trips exist, you can only cancel the pass.",
    "If you want to update a trip, you must select the date, cancel the previous trip and then create a new roster for that date."
]

@inject("fixedRouteStore")
@observer
class FixedRouteCalendar extends Component {

    static navigationOptions = {
        title: "My Roster",
        headerTitleStyle: {fontFamily: "Roboto"}
    };

    constructor(props) {
        super(props);
        props.fixedRouteStore.setInitRosterValues(this);
        this.state = {
            isLoading: false,
            selectedDates: [],
            markedDates: this.props.fixedRouteStore.computedMarkedDates,
            loginDisabled: false,
            logoutDisabled: false,
            visibleInfoModal: false
        }
    }

    _renderInfo = () => (
        <View style={{marginTop: 16, backgroundColor: "#FFFFFF", borderRadius: 10, padding: 10}}>
            <View style={{
                position: 'absolute',
                top: 5,
                right: 10,
                zIndex: 1
            }}>
                <TouchableOpacity
                    onPress={() => {
                        setTimeout(() => {
                            this.setState({visibleInfoModal: false});
                        }, 10);
                    }}
                >
                    <Ionicons name="close-circle" size={35} color={colors.BLUE}/>
                </TouchableOpacity>
            </View>
            <Text style={{
                textAlign: 'center',
                fontSize: 20,
                fontWeight: '500'
            }}>Help</Text>
            <FlatList 
                data={fixedRouteHelp}
                renderItem={({ item }) => {
                    return (
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ fontSize: 16 }}>{`\u25AA ${item}`}</Text>
                    </View>
                    );
                }}
            />
        </View>
    );

    render() {
        return (
            <View style={{flex: 1}}>
                <View>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.BLUE}
                        barStyle="dark-content"
                    />
                    {spinner.visible(this.props.fixedRouteStore.isLoading || this.state.isLoading)}

                    {/* {this._renderQuickActions()} */}
                    <Modal
                        isVisible={this.state.visibleInfoModal === true}
                        style={{justifyContent: 'center', marginVertical: 40, alignContent: 'center'}}
                        onDismiss={() => {
                            this.setState({visibleInfoModal: false});
                        }}
                    >
                        {this._renderInfo()}
                    </Modal>

                    <CalendarList
                        minDate={moment().format("YYYY-MM-DD")}
                        maxDate={moment().add(this.props.fixedRouteStore.EligibleRosterDays, "days").format("YYYY-MM-DD")}
                        markedDates={this.state.markedDates}
                        displayLoadingIndicator={false}
                        markingType={"multi-dot"}
                        hideExtraDays={true}
                        // extraData={this.props.fixedRouteStore.AvailableRosters}
                        onDayPress={day => this.getSelectedDay(day.dateString)}
                        onVisibleMonthsChange={date => {
                        }}
                        pastScrollRange={1}
                        futureScrollRange={3}
                        scrollEnabled={true}
                        showScrollIndicator={true}
                        theme={{
                            todayTextColor: colors.GREEN,
                            selectedDayBackgroundColor: '#00adf5',
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: '#00adf5',
                            dayTextColor: colors.BLACK
                        }}
                    />
                    <FAB
                        buttonColor={colors.GREEN}
                        onClickAction={() => {
                            console.warn('+ve handler dates -> ', this.state.selectedDates);
                            if (this.state.selectedDates && this.state.selectedDates.length > 0) {
                                var loginDisabled = false;
                                var logoutDisabled = false;
                                if (this.props.fixedRouteStore.AvailableRosters) {
                                    this.props.fixedRouteStore.AvailableRosters.forEach((roster) => {
                                        console.warn('roster - ', roster);
                                        if (this.state.selectedDates.includes(roster.Date)) {
                                            console.warn('selectedDate - ', roster.Date);
                                            if (roster.LoginTime != "") {
                                                loginDisabled = true;
                                            }
                                            if (roster.LogoutTime != "") {
                                                logoutDisabled = true
                                            }
                                        }
                                        console.warn(loginDisabled, logoutDisabled);
                                    })
                                }
                                this.setState({loginDisabled, logoutDisabled});
                                if (loginDisabled || logoutDisabled) {
                                    this.buildPopup(loginDisabled, logoutDisabled);
                                } else {
                                    this.props.fixedRouteStore.getSelectedDateRoster(this.state.selectedDates, loginDisabled, logoutDisabled);
                                    this.props.navigation.navigate("FixedRouteUpdate");
                                }
                            } else {
                                console.warn('Select date');
                                Alert.alert("Fixed Route", "Please select dates to book pass");
                            }
                        }}
                        iconTextColor={colors.WHITE}
                        iconTextComponent={<Text>GO</Text>}
                        // <Ionicons name="ios-add"/>
                    />

                    <View style={{
                        position: 'absolute',
                        top: 10,
                        right: 20,
                        zIndex: 1
                    }}>
                        <TouchableOpacity
                            onPress={() => {
                                setTimeout(() => {
                                    this.setState({visibleInfoModal: true});
                                }, 100);
                            }}
                        >
                            <Ionicons name="information-circle" size={35} color={colors.BLUE}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    getSelectedDay = date => {
        let markedDates = this.state.markedDates;
        console.warn('Marked dates ', markedDates);
        const selectedDay = moment(date).format('YYYY-MM-DD');
    
        const selectedDayObj = Object.keys(markedDates)
          .filter(key => key === selectedDay)
          .reduce((obj, key) => {
            return Object.assign(obj, {
              [key]: markedDates[key],
            });
          }, {});
        console.warn('selectedDayObj ', selectedDayObj);

        let isSelected = false;
        if (selectedDayObj[selectedDay]) {
            var _dateObj = selectedDayObj[selectedDay];
            if (_dateObj.dots && !_dateObj.isNew) {
                console.warn('1');
                // selected for cancel/modify - need to add selected state blue
                selectedDayObj[selectedDay].isNew = true;
                selectedDayObj[selectedDay].selectedColor = colors.LIGHT_BLUE;
                selectedDayObj[selectedDay].selectedTextColor = colors.WHITE;
            } else if (_dateObj.dots && _dateObj.isNew) {
                console.warn('2');
                // already selected for cancel/modify - need to update old state gray
                selectedDayObj[selectedDay].isNew = false;
                selectedDayObj[selectedDay].selectedColor = colors.BACKGROUND;
                selectedDayObj[selectedDay].selectedTextColor = colors.BLACK;
            } else if (!_dateObj.dots && _dateObj.isNew && _dateObj.selected) {
                console.warn('3'); // done
                // new selection for booking - need to add customstyle
                selectedDayObj[selectedDay] = {}
            } else {
                console.warn('4'); // done
                // else
                selectedDayObj[selectedDay] = {
                    isNew: true,
                    selected: true,
                    selectedColor: colors.LIGHT_BLUE,
                    selectedTextColor: colors.WHITE
                }
            }
        } else {
            console.warn('0'); // done
            isSelected = true;
            // new selection for booking - need to add customstyle
            selectedDayObj[selectedDay] = {
                isNew: true,
                selected: true,
                selectedColor: colors.LIGHT_BLUE,
                selectedTextColor: colors.WHITE
            }
        }
    
        markedDates[selectedDay] = selectedDayObj[selectedDay];
    
        var alreadySelected = this.state.selectedDates.find((_date) => _date === date);
        // console.warn('alreadySelected ', alreadySelected);
        if (alreadySelected) {
          this.state.selectedDates = this.state.selectedDates.filter((_date) => _date !== date)
        } else {
          this.state.selectedDates.push(date);
        }
        //   console.warn('this.state.selectedDates -> ', this.state.selectedDates);
        this.setState(
          {
            markedDates: markedDates,
          },
          () => {
            // console.log('updated', this.state.markedDates);
          },
        );
    };

    buildPopup(loginDisabled, logoutDisabled) {
        var alertButtons = [
            {
                text: 'Close',
                onPress: () => {
                },
                style: 'cancel',
            },
            {
                text: 'Cancel Pass',
                onPress: () => {
                    var cancelButtons = [];
                    if (Platform.OS == 'ios') {
                        cancelButtons.push({
                            text: 'Close',
                            onPress: () => {
                            },
                            style: 'cancel',
                        });
                    }
                    if (loginDisabled) {
                        cancelButtons.push({
                            text: 'Cancel Login',
                            onPress: () => {
                                this.props.fixedRouteStore.cancelFixedRoutePass(this, this.state.selectedDates, 'P');
                            },
                        });
                    }
                    if (logoutDisabled) {
                        cancelButtons.push({
                            text: 'Cancel Logout',
                            onPress: () => {
                                this.props.fixedRouteStore.cancelFixedRoutePass(this, this.state.selectedDates, 'D');
                            },
                        });
                    }
                    if (loginDisabled && logoutDisabled) {
                        cancelButtons.push({
                            text: 'Cancel Both',
                            onPress: () => {
                                this.props.fixedRouteStore.cancelFixedRoutePass(this, this.state.selectedDates, 'B');
                            },
                        });
                    }
                    Alert.alert(
                        'Cancel Pass',
                        'Please select a trip type to proceed',
                        cancelButtons,
                        {cancelable: true},
                    );
                },
            }
        ];
        if (loginDisabled && logoutDisabled) {
        // } else if (loginDisabled && !logoutDisabled) {
        // } else if (!loginDisabled && logoutDisabled) {
        } else {
            alertButtons.push({
                text: 'Book Pass', 
                onPress: () => {
                    this.props.fixedRouteStore.getSelectedDateRoster(this.state.selectedDates, loginDisabled, logoutDisabled);
                    this.props.navigation.navigate("FixedRouteUpdate");
                }
            })
        }
        Alert.alert(
            'Fixed Route',
            'Please select an option to continue',
            alertButtons,
            {cancelable: false},
        );
    }

    UNSAFE_componentWillMount() {
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.reloadData();
    }

    componentWillUnmount() {
        // EventRegister.removeEventListener(this.rosterNotification);
    }

    reloadData() {
        this.props.fixedRouteStore.getBookedRosters(this);
        setTimeout(() => {
            this.setState({
                isLoading: false,
                markedDates: this.props.fixedRouteStore.computedMarkedDates
            });
        }, 1000);
    }

}

export default FixedRouteCalendar;