import React, {Component} from "react";
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
    View,
    Fab,
    Icon
} from "react-native";
import {colors} from "../../utils/Colors";
import moment from "moment";
import {Box, Text} from "native-base";
import {inject, observer} from "mobx-react";
import TouchableDebounce from "../../utils/TouchableDebounce";
import Ionicons from "react-native-vector-icons/Ionicons";
import FAB from "react-native-fab";

@inject("feedbackStore")
@observer
export default class MyTickets extends Component<{}> {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            IdleTimeOutInMins: 0,
            isFeedback: true,
            lastRatedDate: ""
        };
    }

    _keyExtractor(item, index) {
        return item.id + index;
    }


    renderItem(data) {
        let {item} = data;
        let dateTime = moment(item.createdDate).format("DD MMM");
        return (
            <View padder>
                <TouchableDebounce
                    onPress={() => {
                        this.props.feedbackStore.getTicketDetails(item.id);
                    }}
                >
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
                        <Box bordered>
                            <View style={{flex: 1, flexDirection: 'column'}}>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <Text style={styles.itemLastMessage}>{dateTime}</Text>
                                    <Text style={styles.itemLastMessage}>{item.id}</Text>
                                    <View style={[styles.label, {backgroundColor: this.getColor(item.status)}]}>
                                        <Text style={[styles.itemLastMessage, {color: colors.WHITE}]}>
                                            {item.status === "In-Progress" ? "Assigned" : item.status}</Text>
                                    </View>
                                </View>
                                <Text style={styles.itemLastMessage}>{item.category}</Text>
                            </View>
                        </Box>
                    </Box>
                </TouchableDebounce>
            </View>
        );
    }

    getColor(status) {
        if (status === "Open" || status === "Reopened") {
            return colors.ORANGE;
        } else if (status === 'In-Progress') {
            return colors.GREEN;
        } else {
            return colors.BLACK;
        }
    }

    renderSeparator() {
        return <View style={styles.separator}/>;
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
                    <ActivityIndicator/>
                    <Text style={{color: colors.BLACK, marginTop: 20}}>
                        Please wait...
                    </Text>
                </View>
            );
        return (
            <View style={styles.container}>
                {/* <StatusBar
                    barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
                /> */}
                <FlatList
                    style={{ flex: 0 }}
                    initialNumToRender={store.myTickets.length}
                    keyExtractor={this._keyExtractor}
                    data={store.myTickets}
                    renderItem={this.renderItem.bind(this)}
                    ListEmptyComponent={this._renderNoFeedback()}
                />
                {/* <Fab
                    style={{ backgroundColor: colors.GREEN }}
                    position="bottomRight"
                    onPress={() => {
                        this.props.navigation.navigate('GeneralFeedback');
                    }}>
                    <Icon name="add" />
                </Fab> */}
                <FAB
                    buttonColor={colors.GREEN}
                    iconTextColor="#FFFFFF"
                    onClickAction={() => {
                        // this.gotpGeneralFB(store);
                        console.warn('feedback store - ', store.toString());
                        store.generalFeedback();
                    }}
                    iconTextComponent={<Ionicons name="ios-add" />}
                />
                {store.pagestate && store.pagestate !== undefined && store.myTickets.length > 0 &&
                <TouchableDebounce
                    onPress={() => {
                        this.props.feedbackStore.getMyTickets().then(() => {
                        }).catch(() => {
                        });
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

    _renderNoFeedback() {
        return (
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <Text style={{color: colors.GRAY}}>No Tickets are available</Text>
            </View>
        );
    }

    gotpGeneralFB(_feedbackStore) {
        _feedbackStore.generalFeedback();
        // .then(() => {
        // }).catch(() => {
        // });
        // this.props.navigation.navigate("GeneralFeedback");
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20
    },
    itemLastMessage: {
        flex: 1,
        fontSize: 16,
        color: "#111"
    }, label: {
        padding: 4,
        borderRadius: 4,
        flex: 1,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    },
    separator: {
        height: 0.5,
        width: "100%",
        alignSelf: "center",
        backgroundColor: "#555"
    },
});
