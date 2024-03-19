import React, {Component} from "react";
import {ActivityIndicator, Alert, StatusBar, Text, View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Box} from "native-base";
import {StackActions} from '@react-navigation/native';
import {colors} from "../../utils/Colors";
import {
    viewNotSelectedRosterTypeStyle,
    viewSelectedStyle
} from "../roster/customeComponent/customComponent";
import TouchableDebounce from "../../utils/TouchableDebounce";
import Moment from "moment";
import {extendMoment} from "moment-range";
import Ionicons from "react-native-vector-icons/Ionicons";
import {rosterType} from "../roster/customeComponent/RosterType";
import {inject, observer} from "mobx-react";
import CocoCalendar from '../../components/Calendar/CocoCalendar';
import { spinner } from "../../network/loader/Spinner";
import SafeAreaView from "react-native-safe-area-view";

const moment = extendMoment(Moment);

@inject("rosterStore")
@observer
class RosterMultiCancel extends Component {

    static navigationOptions = {
        title: "Cancel Roster",
        headerTitleStyle: {fontFamily: "Roboto"}
    };

    constructor(props) {
        super(props);
        this.state= {
            initDate: moment().format('YYYY-MM-DD'), // Get Current Day
            selectedDates: [],
            markedDates: this.props.rosterStore.computedAvailableRosterDates, // {},
            UserId:"",
            selectedRosters:[],
        };
    }

    componentDidMount() {
        AsyncStorage.multiGet(
            [
              asyncString.USER_ID,
            ],
            (err, savedData) => {
              this.setState({
                UserId: savedData[0][1],
              });
            });
    }

    getMinimumDate() {
        return this.state.initDate;
      }
    
      getSelectedRoster = rosterval =>{   
        var alreadySelected = this.state.selectedRosters.find((data) => data.RosterID === rosterval.RosterID);
        if (alreadySelected) {
            this.state.selectedRosters = this.state.selectedRosters.filter((data) => data.RosterID !== rosterval.RosterID)
        } else {
            this.state.selectedRosters.push(rosterval);
        }
        console.warn('selectedRosters -> ', this.state.selectedRosters);
      }
    
      getSelectedDay = date => {
        let markedDates = this.state.markedDates;
        console.warn('Marked dates ', markedDates);
        const userSelectDay = moment(date).format('YYYY-MM-DD');
    
        const alreadySelectedDate = Object.keys(markedDates)
          .filter(key => key === userSelectDay)
          .reduce((obj, key) => {
            return Object.assign(obj, {
              [key]: markedDates[key],
            });
          }, {});
    
          console.warn('alreadySelectedDate ', alreadySelectedDate);
          console.warn('alreadySelectedDate Marked dates ', markedDates);
        let isSelected =
          alreadySelectedDate[userSelectDay] &&
          alreadySelectedDate[userSelectDay].selected;
    
        markedDates[userSelectDay] = {
          selected: isSelected && isSelected ? false : true,
          marked: true, dotColor: colors.BLUE,
          customStyles: {
            container:
              isSelected && isSelected
                ? {}
                : {
                    backgroundColor: colors.BLUE,
                    // borderWidth: 1,
                    // borderColor: '#4a90e2',
                  },
            text:
              isSelected && isSelected
                ? {}
                : {
                    color: 'white',
                    fontWeight: '400',
                    fontFamily: 'Poppins',
                  },
          },
        };
        console.warn('Marked dates updated -> ', markedDates);
        console.warn('this.state.selectedDates -> ', this.state.selectedDates);
    
        var alreadySelected = this.state.selectedDates.find((_date) => _date === date);
        console.warn('alreadySelected ', alreadySelected);
        if (alreadySelected) {
          this.state.selectedDates = this.state.selectedDates.filter((_date) => _date !== date)
        } else {
          this.state.selectedDates.push(date);
        }
          console.warn('this.state.selectedDates final -> ', this.state.selectedDates);
        // this.state.selectedDates.push(date);
        this.setState(
          {
            markedDates: markedDates,
          },
          () => {
            console.log('updated', this.state.markedDates);
          },
        );
      };
    
      resetSelection() {
        this.setState({
          selectedDates: [],
          markedDates: this.props.rosterStore.computedAvailableRosterDates, // {},
          selectedRosters: []
        },
        () => {
          console.warn('updated resetSelection', JSON.stringify(this.state.markedDates));
        },);
      }

    buildCancelRequest = async (day, store, isMultiRoster) => {
        console.warn('--- isMultiRoster ------- ', isMultiRoster);
        if (store.rosterType == rosterType.pickup) {
            if (store.onlyLogin) {
                this.getSelectedDay(day.dateString);
                store.noShowPerformed = true;
                
                store.selectedRoster.anyChangeInDataLogin = true;
                store.selectedRoster.loginSelected = 'Cancel';
            } else {
                setTimeout(() => {
                    Alert.alert("Cancel Roster", "No login shift available for the selected date");
                }, 500);
                return;
            }
        } else if (store.rosterType == rosterType.drop) {
            if (store.onlyLogOut) {
                this.getSelectedDay(day.dateString);
                store.noShowPerformed = true;

                store.selectedRoster.anyChangeInDataLogout = true;
                store.selectedRoster.logoutSelected = 'Cancel';
            } else {
                setTimeout(() => {
                    Alert.alert("Cancel Roster", "No logout shift available for the selected date");
                }, 500);
                return;
            }
        } else if (store.rosterType == rosterType.both) {
            if (store.onlyLogin && store.onlyLogOut) {
                this.getSelectedDay(day.dateString);
                store.noShowPerformed = true;

                store.selectedRoster.anyChangeInDataLogin = true;
                store.selectedRoster.anyChangeInDataLogout = true;

                store.selectedRoster.loginSelected = 'Cancel';
                store.selectedRoster.logoutSelected = 'Cancel';
            } else {
                setTimeout(() => {
                    if (store.onlyLogin) {
                        Alert.alert("Cancel Roster", "Selected date having only login shift");
                    } else if (store.onlyLogOut) {
                        Alert.alert("Cancel Roster", "Selected date having only logout shift");
                    } else {
                        Alert.alert("Cancel Roster", "No roster available");
                    }
                }, 500);
                return;
            }
        } else {

        }
        store.setMultiRosterCancelData().then(() => {
            this.getSelectedRoster(store.multiRosterCancel);
            // if (isMultiRoster == 0) {
            //     this.getSelectedDay(day.dateString);
            // }
        });
    }

    _renderRosterType = (store) => {
        return (
            <View
                style={{
                    width: "100%",
                    height: 50,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10
                }}
            >
                <Box
                    style={{
                        flexDirection: "row",
                        borderRadius: 25,
                        justifyContent: "space-between",
                        marginLeft: 50,
                        marginRight: 50
                    }}
                >
                    <TouchableDebounce
                        style={store.RosteringAllowedLogin === 1 ?
                            store.rosterType === rosterType.pickup
                                ? [viewSelectedStyle, {flexDirection: "row", width: 100}]
                                : {
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginLeft: 15,
                                    width: 80
                                }
                            : viewNotSelectedRosterTypeStyle
                        }
                        onPress={() => {
                            if (store.RosteringAllowedLogin === 1) {
                                this.resetSelection();
                                store.setOnlyLogin();
                            }
                        }}
                    >
                        {store.rosterType === rosterType.pickup && (
                            <Ionicons
                                name={"ios-checkmark-circle"}
                                style={{color: colors.WHITE}}
                                size={20}
                            />
                        )}
                        <Text
                            style={{
                                color: store.RosteringAllowedLogin === 1 ?
                                    store.rosterType === rosterType.pickup
                                        ? colors.WHITE
                                        : colors.BLACK
                                    : colors.GRAY,
                                marginLeft: 12,
                                fontWeight: 'bold'
                            }}
                        >
                            Login
                        </Text>
                    </TouchableDebounce>

                    <TouchableDebounce
                        style={store.RosteringAllowedLogout === 1 ?
                            store.rosterType === rosterType.drop
                                ? [viewSelectedStyle, {flexDirection: "row", width: 100}]
                                : {justifyContent: "center", alignItems: "center"}
                            : {
                                width: 80,
                                justifyContent: "center",
                                alignItems: "center",
                            }
                        }
                        onPress={() => {

                            if (store.RosteringAllowedLogout === 1) {
                                this.resetSelection();
                                store.setOnlyLogOut()
                            }
                        }}
                    >
                        {store.rosterType === rosterType.drop && (
                            <Ionicons
                                name={"ios-checkmark-circle"}
                                style={{
                                    color:
                                        store.rosterType === rosterType.drop
                                            ? colors.WHITE
                                            : colors.BLACK
                                }}
                                size={20}
                            />
                        )}
                        <Text
                            style={{
                                color: store.RosteringAllowedLogout === 1 ?
                                    store.rosterType === rosterType.drop
                                        ? colors.WHITE
                                        : colors.BLACK
                                    : colors.GRAY,
                                marginLeft: 10,
                                marginRight: 10,
                                alignSelf: "center",
                                fontWeight: 'bold'
                            }}
                        >
                            Logout
                        </Text>
                    </TouchableDebounce>
                    <TouchableDebounce
                        style={store.RosteringAllowedLogin === 1 && store.RosteringAllowedLogout === 1 ?
                            store.rosterType === rosterType.both
                                ? [viewSelectedStyle, {flexDirection: "row", width: 100}]
                                : {
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginRight: 10,
                                    width: 80
                                }
                            : viewNotSelectedRosterTypeStyle
                        }
                        onPress={() => {
                            if (store.RosteringAllowedLogin === 1 && store.RosteringAllowedLogout === 1) {
                                this.resetSelection();
                                store.setBoth()
                            }
                        }}
                    >
                        {store.rosterType === rosterType.both && (
                            <Ionicons
                                name={"ios-checkmark-circle"}
                                style={{
                                    color:
                                        store.rosterType === rosterType.both
                                            ? colors.WHITE
                                            : colors.BLACK
                                }}
                                size={20}
                            />
                        )}
                        <Text
                            style={{
                                color: store.RosteringAllowedLogin === 1 && store.RosteringAllowedLogout === 1 ?
                                    store.rosterType === rosterType.both
                                        ? colors.WHITE
                                        : colors.BLACK
                                    : colors.GRAY,
                                marginLeft: 12,
                                fontWeight: 'bold'
                            }}
                        >
                            Both
                        </Text>
                    </TouchableDebounce>
                </Box>
            </View>
        );
    };

    componentDidMount() {
        console.warn('computed ', this.props.rosterStore.computedAvailableRosterDates);
        console.warn('available ', this.props.rosterStore.AvailableRosters);
        console.warn('eligible days ', this.props.rosterStore.EligibleRosterDays);
        // this.props.rosterStore.setCreateNewRosterInit();
    }

    render() {
        return (
                <SafeAreaView
                    style={{flex: 1, backgroundColor: colors.WHITE, paddingTop: Platform.OS === 'ios' ? 20 : 0}}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.BLUE}
                        barStyle="dark-content"
                    />
                    {spinner.visible(this.props.rosterStore.isLoading)}
                 
                    {this._renderRosterType(this.props.rosterStore)}
                           
                    <CocoCalendar
                        current={this.state.initDate}
                        minDate={this.getMinimumDate()}
                        maxDate={moment().add(this.props.rosterStore.EligibleRosterDays, "days").format("YYYY-MM-DD")}
                        firstDay={1}
                        hideExtraDays={true}
                        disableAllTouchEventsForDisabledDays
                        markingType={'period'} // simple/period/multi-dot/single
                        markedDates={this.state.markedDates}
                        onDayPress={day => {
                            let store = this.props.rosterStore;
                            store.getSelectedDateRoster(day.dateString).then(async () => {
                                if(store.selectedRoster.RosterID != 0) {
                                    // this.getSelectedDay(day.dateString);
                                    // store.noShowPerformed = true;
                                    if (store.selectedDateRosterData?.length > 1) {
                                        var index = 0;
                                        for (const _roster of store.selectedDateRosterData) {
                                            console.warn('Roster -> ', ' --> ', _roster);
                                            await store.setSelectedDateRoster(_roster);
                                            await this.buildCancelRequest(day, store, index++);
                                        } 
                                    } else {
                                        this.buildCancelRequest(day, store, 0);
                                    }
                                } else {
                                    setTimeout(() => {
                                        Alert.alert("Cancel Roster", "No roster available for the selected date");
                                    }, 500);
                                    console.warn('selected isloading alert ', store.isLoading);
                                    return;
                                }
                            });
                        }}
                    />
                       
                    <TouchableDebounce
                        style={{
                            width: "100%",
                            height: 50,
                            justifyContent: "center",
                            alignItems: "center",
                            position: "absolute",
                            bottom: 0,
                            backgroundColor: colors.BLUE_BRIGHT,
                            flexDirection: "row"
                        }}
                        onPress={() => {
                            if (this.state.selectedRosters.length == 0) {
                                Alert.alert("Cancel Roster", "Please select dates");
                                return;
                            } else {
                                this.displayNoSHowAlerts('Cancel Roster', 'Are you sure, you want to cancel roster for selected dates?');
                            }
                        }}
                    >
                        {this.props.rosterStore.showLoader && (
                            <ActivityIndicator
                                color={colors.WHITE}
                                animating={this.props.rosterStore.showLoader}
                            />
                        )}
                        <Text
                            style={{
                                color: colors.WHITE,
                                fontWeight: "500",
                                fontSize: 20,
                                marginLeft: 10
                            }}
                        >
                            {this.props.rosterStore.showLoader ? "Submiting..." : "Submit"}
                        </Text>
                    </TouchableDebounce>
                </SafeAreaView>
        );
    }

    cancelRoster() {
        let body = {
            Rosters: this.state.selectedRosters,
        };
      
        console.warn("API-----"+JSON.stringify(body));
        this.props.rosterStore.storeMultiCancelRoster(body).then(()=>{
            if(this.props.rosterStore.rosterUpdated===true){
                this.props.rosterStore.rosterUpdated=false;
                // this.props.navigation.goBack();
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
                    },
                    style: 'cancel',
                },
                {
                    text: 'YES', onPress: () => {
                        this.cancelRoster();
                    }
                },
            ],
            {cancelable: false},
        )
    }
}

export default RosterMultiCancel;