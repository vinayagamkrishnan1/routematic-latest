import React, {Component} from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    PermissionsAndroid,
    Platform,
    RefreshControl,
    StatusBar,
    Text,
    View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import base64 from 'react-native-base64'
import qr_sample from "../../assets/static_qr.png";
import {colors} from "../../utils/Colors";
import moment from "moment";
import LinearGradient from "react-native-linear-gradient";
import {API} from "../../network/apiFetch/API";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import {URL} from "../../network/apiConstants";
import TouchableDebounce from "../../utils/TouchableDebounce";
import bus_loading from "../../assets/bus_loading.gif";
import {TYPE} from "../../model/ActionType";

var utf8 = require('utf8');

class MyUsage extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            title: "Usage"
            //headerStyle: { display: "none" }
        };
    };
    state = {
        isLoading: false,
        refreshing: false,
        passId: '',
        ticketID: "",
        bookings: [],
        pageState: '',
        loadingMessage: 'Fetching your data...'

    };
    callback = async (actionType, response) => {
        switch (actionType) {

            case TYPE.MY_USAGES: {
                handleResponse.getMyUsages(this, response);
                break;
            }
        }
    };
    renderEmptyList = () => {
        return (
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    margin: 10
                }}
            >
                <Text style={{textAlign: "center"}}>No data Available</Text>
            </View>
        );
    };
    _onRefresh = () => {
        this.setState({
            isLoading: true,
            pageState: '',
            bookings: [],
            loadingMessage: 'Fetching your data...'
        }, () => {
            this.getBookings();
        });
    }

    UNSAFE_componentWillMount() {
        if (this.props.route.params) {
            this.setState({
                passId: this.props.route.params.passId

            })
        }
    }

    componentDidMount() {

        this.willFocusSubscription = this.props.navigation.addListener(
            'focus',
            payload => {
                this.getBookings();
            }
        );
    }

    componentWillUnmount() {
        // this.willFocusSubscription.remove();

    }

    render() {

        if (this.state.isLoading && this.state.pageState === '') return this.showLoaderScreen();
        console.warn("final" + JSON.stringify(this.state.pageState));
        return (
            <View style={{flex: 1, flexDirection: 'column'}}>
                <StatusBar barStyle="dark-content"/>
                <View style={{marginBottom: 20, flexDirection: 'column'}}>
                    <FlatList
                        style={{minHeight: 100}}
                        keyExtractor={this._keyExtractor}
                        data={this.state.bookings}
                        renderItem={this.renderItem.bind(this)}
                        ListEmptyComponent={this.renderEmptyList}
                        refreshing={this.state.isLoading}
                        onRefresh={this._onRefresh}
                        onEndReachedThreshold={0}
                    />
                </View>
                {this.state.bookings && this.state.pageState !== null && this.state.bookings.length > 0 &&
                <TouchableDebounce
                    onPress={() => {
                        this.setState({
                            loadingMessage: 'Fetching more data...'
                        }, () => {
                            this.getBookings()
                        })

                    }}>

                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <Ionicons
                            name="md-refresh"
                            style={{color: colors.GREEN, padding: 10}}
                            size={20}
                        />
                        <Text style={{fontWeight: 'bold'}}>Load more</Text>
                    </View>
                </TouchableDebounce>}

            </View>
        );
    }

    renderItem(data) {
        return (
            <TouchableDebounce
                onPress={() => {
                    console.warn("orig " + JSON.stringify(data.item));

                }}
            >
                <StatusBar
                    barStyle="dark-content"
                    hidden={false}
                    backgroundColor={colors.WHITE}
                    translucent={false}
                />
                <LinearGradient
                    start={{x: 0, y: 0.75}}
                    end={{x: 1, y: 0.25}}
                    colors={[colors.BLUE, colors.GREEN]}
                    style={gradientView}
                >


                    <View style={{flexDirection: "row", alignContent: 'center', alignItems: 'center', padding: 10}}>

                        <View style={{flexDirection: "column", flex: 1}}>
                            <Text style={{fontSize: 15, color: 'white', marginTop: 10}}>{data.item.room}</Text>
                            <Text style={{
                                fontSize: 15,
                                color: 'white',
                                marginTop: 10
                            }}>{moment(data.item.scannedAt).format("hh:mm a, DD MMM")}</Text>
                        </View>
                        <View style={{flexDirection: "row", justifyContent: 'flex-end', alignItems: 'center', flex: 1}}>
                            <Image
                                defaultSource={qr_sample}
                                source={qr_sample}
                                style={{height: 25, width: 25}}
                            />
                            <Text style={{
                                marginLeft: 5,
                                fontSize: 20,
                                color: 'white',
                                fontWeight: 'bold'
                            }}>{data.item.seatNumber}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableDebounce>
        );
    }

    _keyExtractor(item, index) {
        return index.toString();
    }

    renderSeparator() {
        return <View style={styles.separator}/>;
    }

    getBookings() {
        this.setState({isLoading: true});
        let text = "td=" + encodeURIComponent(this.state.pageState);
        let bytes = utf8.encode(text);
        let encoded = base64.encode(bytes);
        let url = URL.GET_USAGE + "?ft=" + this.state.passId + "&l=50&ps=" + encoded;
        API.newFetchXJSON(
            url,
            true,
            this.callback.bind(this),
            TYPE.MY_USAGES
        );
    }

    showLoaderScreen() {
        return (
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    backgroundColor: colors.WHITE
                }}
            >
                <StatusBar
                    barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
                />

                <Image
                    defaultSource={bus_loading}
                    source={bus_loading}
                    resizeMethod="scale"
                    resizeMode="cover"
                    style={{height: 170, width: 170}}
                />
                <Text style={{color: colors.BLACK, marginTop: -20}}>
                    {this.state.loadingMessage}
                </Text>
            </View>
        );
    }
}

export default MyUsage;

const gradientView = {
    margin: 10,
    width: "95%",
    // height: 170,
    opacity: 0.95,
    borderRadius: 6,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
        width: 0,
        height: 2
    },
    shadowRadius: 4,
    shadowOpacity: 1,
    justifyContent: "space-between",
    paddingBottom: 20
};
