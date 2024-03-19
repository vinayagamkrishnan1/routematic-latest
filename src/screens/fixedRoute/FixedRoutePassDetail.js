import React, {Component} from "react";
import {CalendarList} from "react-native-calendars";
import moment from "moment";
import {colors} from "../../utils/Colors";
import {View} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {spinner} from "../../network/loader/Spinner";
import {inject, observer} from "mobx-react";
import { Text } from "react-native-paper";

@inject("fixedRouteStore")
@observer
class FixedRoutePassDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            passInfo: {},
            markedDates: {}
        }
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <View>
                    {spinner.visible(this.props.fixedRouteStore.isLoading || this.state.isLoading)}

                    <CalendarList
                        minDate={moment(this.state.passInfo.fromDate).format("YYYY-MM-DD")}
                        maxDate={moment(this.state.passInfo.toDate).format("YYYY-MM-DD")}
                        markedDates={this.state.markedDates}
                        displayLoadingIndicator={false}
                        markingType={"multi-dot"}
                        hideExtraDays={true}
                        onVisibleMonthsChange={date => {
                        }}
                        pastScrollRange={1}
                        futureScrollRange={1}
                        scrollEnabled={true}
                        showScrollIndicator={true}
                        theme={{
                            todayTextColor: colors.GREEN,
                            selectedDayBackgroundColor: '#00adf5',
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: '#00adf5',
                            dayTextColor: colors.BLACK
                        }}
                        // theme={{
                        //     indicatorColor: 'white',
                        //     textDayFontSize: 16,
                        //     textDayHeaderFontSize: 16,
                        //     'stylesheet.calendar.header': {
                        //         header: {
                        //             backgroundColor: colors.BLUE,
                        //             flexDirection: 'row',
                        //             justifyContent: 'space-between',
                        //             paddingVertical: 35,
                        //             paddingLeft: 10,
                        //             paddingRight: 10,
                        //             marginTop: 6,
                        //             alignItems: 'center',
                        //             // borderRadius: 4
                        //         },
                        //         headerContainer: {
                        //             flexDirection: 'row',
                        //         },
                        //         monthText: {
                        //             fontSize: 24,
                        //             fontFamily: 'raleway-medium',
                        //             fontWeight: 'normal',
                        //             color: 'white',
                        //             margin: 10
                        //         },
                        //         dayContainer: {
                        //             backgroundColor: 'red'
                        //         },
                        //         dayHeader: {
                        //             marginTop: 10,
                        //             marginBottom: 15,
                        //             width: 33,
                        //             textAlign: 'center',
                        //             fontSize: 14.5,
                        //             fontFamily: 'raleway',
                        //             fontWeight: 'normal',
                        //             color: 'black',
                        //         },
                        //         arrowImage: {
                        //             tintColor: 'white'
                        //         }
                        //     },
                        //     'stylesheet.calendar.main': {
                        //         container: {
                        //             paddingHorizontal: 5,
                        //             backgroundColor: colors.BACKGROUND,
                        //         },
                        //         monthView: {
                        //             backgroundColor: colors.GRAY,
                        //         },
                        //         week: {
                        //             marginTop: 20,
                        //             marginBottom: 20,
                        //             flexDirection: 'row',
                        //             justifyContent: 'space-around'
                        //         },
                        //     },
                        //     'stylesheet.day.single': {
                        //         today: {
                        //             backgroundColor: colors.GREEN
                        //         },
                        //         todayText: {
                        //             color: 'white',
                        //             fontWeight: 'bold',
                        //             fontSize: 19
                        //         },
                        //     }
                        // }}
                    />

                    <View style={{
                        position: 'absolute',
                        bottom: 10,
                        left: 20,
                        backgroundColor: colors.WHITE,
                        zIndex: 1,
                        width: '90%',
                        padding: 5,
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}>
                        <View style={{
                            flexDirection: "row",
                            alignItems: 'center'
                        }}>
                            <FontAwesome
                                name={"circle"}
                                color={colors.GREEN}
                                size={12}
                            />
                            <Text style={{
                                marginLeft: 10,
                                fontSize: 14,
                                color: colors.GREEN
                            }}>Login ({this.props.fixedRouteStore.PassTrips.login})</Text>
                        </View>
                        <View style={{
                            flexDirection: "row",
                            alignItems: 'center'
                        }}>
                            <FontAwesome
                                name={"circle"}
                                color={colors.BLUE}
                                size={12}
                            />
                            <Text style={{
                                marginLeft: 10,
                                fontSize: 14,
                                color: colors.BLUE
                            }}>Logout ({this.props.fixedRouteStore.PassTrips.logout})</Text>
                        </View>
                        <View style={{
                            flexDirection: "row",
                            alignItems: 'center'
                        }}>
                            <FontAwesome
                                name={"circle"}
                                color={colors.RED}
                                size={12}
                            />
                            <Text style={{
                                marginLeft: 10,
                                fontSize: 14,
                                color: colors.RED
                            }}>Cancelled ({this.props.fixedRouteStore.PassTrips.cancelled})</Text>
                        </View>
                    </View>

                    {/* <View style={{
                        position: 'absolute',
                        top: 10,
                        left: 20,
                        zIndex: 1,
                        backgroundColor: colors.WHITE,
                        borderColor: colors.BLACK,
                        borderWidth: 1,
                        borderRadius: 5,
                        padding: 5,
                        width: '90%',
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}>
                        <View style={{
                            flexDirection: "row",
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                marginRight: 10,
                                fontSize: 14,
                                color: colors.GREEN
                            }}>Logins</Text>
                            <Text style={{
                                fontSize: 14,
                                fontWeight: '500',
                                color: colors.BLACK
                            }}>2</Text>
                        </View>
                        <View style={{
                            flexDirection: "row",
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                marginRight: 10,
                                fontSize: 14,
                                color: colors.RED
                            }}>Logouts</Text>
                            <Text style={{
                                fontSize: 14,
                                fontWeight: '500',
                                color: colors.BLACK
                            }}>2</Text>
                        </View>
                        <View style={{
                            flexDirection: "row",
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                marginRight: 10,
                                fontSize: 14,
                                color: colors.BLACK
                            }}>Cancellations</Text>
                            <Text style={{
                                fontSize: 14,
                                fontWeight: '500',
                                color: colors.BLACK
                            }}>0</Text>
                        </View>
                    </View> */}
                </View>
            </View>
        );
    }

    UNSAFE_componentWillMount() {
        console.warn(this.props.route.params);
        this.setState({
            passInfo: this.props.route.params.passDtl
        });
        this.props.fixedRouteStore.setPassDates(this.props.route.params.passDtl.passDates)
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.reloadData();
    }

    componentWillUnmount() {
        this.props.fixedRouteStore.setPassDates([]);
    }

    reloadData() {
        setTimeout(() => {
            this.setState({
                markedDates: this.props.fixedRouteStore.computedPassDates,
                isLoading: false
            });
        }, 1000);
    }

}

export default FixedRoutePassDetail;