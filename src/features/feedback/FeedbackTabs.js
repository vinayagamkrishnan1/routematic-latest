import React, {Component} from 'react';
import {Container, Fab, Icon, Tab, TabHeading, Tabs, Text} from 'native-base';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import RecentTrips from './RecentTrips';
import  MyTickets from './MyTickets';
import {colors} from "../../utils/Colors";
import {Dimensions, PanResponder, View,} from "react-native";
import {API} from "../../network/apiFetch/API";
import {URL} from "../../network/apiConstants";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import {inject, observer} from "mobx-react";


const RecentRides = () => (
    <RecentTrips />
);
const MyTicket = () => (
    <MyTickets />
);

@inject("feedbackStore")
@observer
export default class FeedbackTabs extends Component {

    static navigationOptions = {
        title: "Feedback",
        headerTitleStyle: { fontFamily: "Roboto" }
    };

    state = {
        index: 0,
        routes: [
            { key: 'rides', title: 'Recent Rides' },
            { key: 'tickets', title: 'My Tickets' },
        ],
    };

    _handleIndexChange = (index) => this.setState({ index });

    _renderTabBar = (props) => {
        const inputRange = props.navigationState.routes.map((x, i) => i);

        return (
            <TabBar
                {...props}
                renderLabel={({ route, focused, color }) => (
                    <Text style={{ color: colors.BLACK, margin: 8 }}>
                        {route.title}
                    </Text>
                )}
                // getLabelText={({ route }) => route.title}
                indicatorStyle={{ backgroundColor: 'blue' }}
                style={{ backgroundColor: 'white', color: colors.BLACK }}
            />
            // <View style={{flexDirection: 'row',
            // paddingTop: 50}}>
            //     {props.navigationState.routes.map((route, i) => {
            //         const opacity = props.position.interpolate({
            //             inputRange,
            //             outputRange: inputRange.map((inputIndex) =>
            //                 inputIndex === i ? 1 : 0.5
            //             ),
            //         });

            //         return (
            //             <TouchableOpacity
            //                 style={{flex: 1,
            //                     alignItems: 'center',
            //                     padding: 16}}
            //                 onPress={() => this.setState({ index: i })}>
            //                 <Text style={{ opacity }}>{route.title}</Text>
            //             </TouchableOpacity>
            //         );
            //     })}
            // </View>
        );
    };

    _renderScene = SceneMap({
        rides: RecentRides,
        tickets: MyTicket,
    });

    render() {
        return (
            <TabView
                navigationState={this.state}
                renderScene={this._renderScene}
                renderTabBar={this._renderTabBar}
                onIndexChange={this._handleIndexChange}
            >
            </TabView>
        );
    }

    renderold() {
        return (
            <View style={{...this._panResponder.panHandlers}}>
                <Tabs
                    onChangeTab={() => {
                }}>
                    <Tab
                        heading={<TabHeading><Text>Recent Trips</Text></TabHeading>}>
                        <RecentTrips/>
                    </Tab>
                    <Tab heading={<TabHeading><Text>My Tickets</Text></TabHeading>}>
                        <MyTickets/>
                    </Tab>
                </Tabs>

                <Fab
                    style={{backgroundColor: colors.GREEN}}
                    position="bottomRight"
                    onPress={() => {
                        this.props.navigation.navigate('GeneralFeedback');
                    }}>
                    <Icon name="add"/>
                </Fab>
            </View>
        );
    }

    clearAuthAndLogout() {
        if (!this.state.isFeedback) return;
        const { navigate } = this.props.navigation;
        let body = {
            UserId: this.state.UserId,
            DToken: this.state.DToken,
            DType: 1
        };
        this.setState({ isLoading: true, inactive: true });
        let response = API.fetchJSON(URL.SIGN_OUT, body);
        if (response) handleResponse.Logout(response, this, navigate);
        else this.setState({ isLoading: false });
        clearInterval(this.timer);
    }

    UNSAFE_componentWillMount() {
        this._panResponder = PanResponder.create({
            onMoveShouldSetPanResponderCapture: () => {
                clearTimeout(this.timeout);
                if (this.state.IdleTimeOutInMins > 0)
                    this.timeout = setTimeout(() => {
                        this.clearAuthAndLogout();
                    }, this.state.IdleTimeOutInMins);
                return false;
            }
        });
        this.subs = [
            this.props.navigation.addListener("focus", () =>
                this.setState({ isFeedback: true })
            ),
            this.props.navigation.addListener("blur", () =>
                this.setState({ isFeedback: false })
            )
        ];
    }
    componentWillUnmount() {
        this.props.feedbackStore.clearSession();
        // this.subs.forEach(sub => {
        //     sub.remove();
        // });
        clearTimeout(this.timeout);
        // this.willFocusSubscription.remove();
    }

    componentDidMount() {
        this.willFocusSubscription = this.props.navigation.addListener(
            'focus',
            () => {
                this.props.feedbackStore.setInitFeedBack(this,this.props.navigation);
            }
        );
    }
}
