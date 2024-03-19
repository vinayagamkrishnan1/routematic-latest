import React, { Component } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    PanResponder,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    View
} from "react-native";
import StarRating from "react-native-star-rating";
import { colors } from "../../utils/Colors";
import moment from "moment";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import { URL } from "../../network/apiConstants/index";
import { asyncString } from "../../utils/ConstantString";
import { API } from "../../network/apiFetch/API";
import { Stack, Box, Text } from "native-base";
import { TYPE } from "../../model/ActionType";
import { inject, observer } from "mobx-react";
import { Rating } from "react-native-ratings";

@inject("feedbackStore")
@observer
export default class RecentTrips extends Component<{}> {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            refreshing: false,
            access_token: "",
            UserId: "",
            DToken: "",
            CustomerUrl: "",
            isArray: true,
            isLoading: true,
            IdleTimeOutInMins: 0,
            isFeedback: true,
            lastRatedDate: ""
        };
    }


    _keyExtractor(item, index) {
        return index.toString();
    }

    onStarRatingPress(rating, item) {
        if (item.feedbackRating > 0) return;
        this.props.feedbackStore.onStarRatingPressEvent(rating,item).then(() => {
            this.props.navigation.navigate('Categories')
        })
    }

    getFeedbackData() {

    }


    renderItem(data) {
        let { item } = data;
        let dateTime = moment(item.shiftTime).format("DD MMM YYYY hh:mmA");
        return (
            <View padder>
                <Box margin="2"
                    padding="3"
                    rounded="lg"
                    overflow="hidden"
                    borderColor="coolGray.200"
                    borderWidth="1"
                    _dark={{
                        borderColor: "coolGray.600",
                        backgroundColor: "gray.700",
                    }}
                    _light={{
                        backgroundColor: "gray.50",
                    }}>
                    <Box header bordered>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                justifyContent: "space-between"
                            }}
                        >
                            <Text style={styles.itemName}>{item.tripType}</Text>

                            <Text style={[styles.itemName, { fontSize: 18 }]}>
                                {item.tripId}
                            </Text>
                        </View>
                    </Box>
                    <Box bordered>
                        <Stack>
                            <Text style={styles.itemLastMessage}>{dateTime}</Text>
                            <Text style={styles.itemLastMessage}>{item.driverName}</Text>
                            <Text style={styles.itemLastMessage}>{item.vehicleRegNo}</Text>
                        </Stack>
                    </Box>
                    <Box
                        footer
                        bordered
                        style={{
                            justifyContent: "center",
                            alignItems: "center",
                            alignSelf: "center"
                        }}
                    >
                        {/* <StarRating
                            disabled={false}
                            emptyStar={"ios-star-outline"}
                            fullStar={"ios-star"}
                            halfStar={"ios-star-half"}
                            iconSet={"Ionicons"}
                            maxStars={5}
                            rating={item.feedbackRating}
                            selectedStar={rating => this.onStarRatingPress(rating, item)}
                            fullStarColor={colors.YELLOW}
                            starSize={35}
                        /> */}
                        <Rating
                            type='star'
                            ratingColor='#3498db'
                            ratingBackgroundColor='#c8c7c8'
                            ratingCount={5}
                            imageSize={30}
                            startingValue={
                                item.feedbackRating
                            }
                            onFinishRating={rating =>
                                this.onStarRatingPress(rating, item)
                            }
                            style={{ paddingVertical: 10 }}
                        />
                    </Box>
                </Box>
            </View>
        );
    }

    renderSeparator() {
        return <View style={styles.separator} />;
    }


    _onRefresh() {
        this.setState({
            refreshing: true
        });
        this.props.feedbackStore.getRecentTrips().then(()=>{
            this.setState({refreshing: false});
        }).catch(()=>{
            this.setState({refreshing: false});
        });
    }

    render() {
        let store = this.props.feedbackStore;
        if (store.isLoading)
            return (
                <View
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1
                    }}
                >
                    <StatusBar
                        barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
                    />
                    <ActivityIndicator />
                    <Text style={{ color: colors.BLACK, marginTop: 20 }}>
                        Please wait...
                    </Text>
                </View>
            );
        return (
            <View style={styles.container}>
                <StatusBar
                    barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
                />
                <FlatList
                    keyExtractor={this._keyExtractor}
                    data={store.recentTrips}
                    renderItem={this.renderItem.bind(this)}
                    ListEmptyComponent={this._renderNoFeedback()}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh.bind(this)}
                        />
                    }
                />
            </View>
        );
    }

    _renderNoFeedback() {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={{color: colors.GRAY}}>No trips to rate</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20
    },
    itemBlock: {
        flexDirection: "row",
        paddingBottom: 10
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 25
    },
    itemMeta: {
        marginLeft: 10,
        justifyContent: "center"
    },
    itemName: {
        fontSize: 20
    },
    itemLastMessage: {
        fontSize: 16,
        color: "#111"
    },
    separator: {
        height: 0.5,
        width: "100%",
        alignSelf: "center",
        backgroundColor: "#555"
    },
    header: {
        padding: 10
    },
    headerText: {
        fontSize: 30,
        fontWeight: "900"
    }
});
