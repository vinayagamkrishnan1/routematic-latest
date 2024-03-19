import React, {Component} from "react";
import {Alert, FlatList, StatusBar, StyleSheet, View,} from "react-native";
import {Button, Box, Input, Text, ScrollView} from 'native-base';
import {colors} from "../../utils/Colors";
import {inject, observer} from "mobx-react";
import moment from "moment";
import {TouchableOpacity} from "./GeneralFeedback";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Rating } from "react-native-ratings";

@inject("feedbackStore")
@observer
export default class MyTicketDetails extends Component {

    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: "Details",
            headerRight: (
                <Button
                    onPress={this.props.route.params.increaseCount}
                    title="+1"
                    color="#fff"
                />
            ),
        };
    };

    render() {
        let store = this.props.feedbackStore;
        console.warn('store.MyTicketData - ', store.MyTicketData);
        let raisedDate = moment(store.MyTicketData.createdDate).format("DD MMM hh:mm A");
        let closedDate = moment(store.MyTicketData.closedDate).format("DD MMM hh:mm A");
        let shiftDate = store.MyTicketData.shiftDate ? moment(store.MyTicketData.shiftDate).format("DD MMM hh:mm A") : undefined;
        return (
            <View style={{flex: 1}}>
                <StatusBar
                    barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
                />
                <ScrollView style={{margin: 10, padding: 10, backgroundColor: colors.WHITE}}>

                        <View  underline={false}>
                            <Text>Ticket #</Text>
                            <Input value={store.MyTicketData.id} disabled={true}/>
                        </View>

                        <View >
                            <Text>Status</Text>
                            <Input value={store.MyTicketData.status} disabled={true}/>
                        </View>

                        {/* Swidetech 11/11/2021 udhay 
                        fix updated for feedback ticket open */}
                        <View style={{borderColor: 'transparent'}}>
                            {/*   */}
                            <View style={{borderColor: 'transparent',width:'90%',marginLeft:14}}>
                                <Text>Rating</Text>
                            </View>
                            <View>
                                {this.getRating(store.MyTicketData.rating)}
                            </View>
                        </View>

                        <View  last>
                            <Text>Issue</Text>
                            <Input value={store.MyTicketData.issue} disabled={true}/>

                        </View>

                        <View >
                            <Text>Raised Date</Text>
                            <Input value={raisedDate} disabled={true}/>

                        </View>
                        {store.MyTicketData.closedDate && (
                            <View >
                                <Text>Closed Date</Text>
                                <Input value={closedDate} disabled={true}/>

                            </View>
                        )}
                        {store.MyTicketData.tripId && (
                            <View >
                                <Text>Trip Id</Text>
                                <Input value={store.MyTicketData.tripId} disabled={true}/>

                            </View>
                        )}
                        {shiftDate && (
                            <View >
                                <Text>Trip Date</Text>
                                <Input value={shiftDate} disabled={true}/>

                            </View>
                        )}
                        {store.MyTicketData.tripType && (
                            <View >
                                <Text>Trip Type</Text>
                                <Input value={store.MyTicketData.tripType} disabled={true}/>

                            </View>
                        )}

                        {(store.MyTicketData.issueDescription && store.MyTicketData.issueDescription.length > 0) && (
                            <Box >
                                <View  style={{borderColor: 'transparent',width:'90%',marginLeft:14}}>
                                    <Text>Issue description</Text>
                                </View>
                                <Box>
                                    <FlatList
                                        style={{ flex: 0 }}
                                        initialNumToRender={store.myTickets.length}
                                        keyExtractor={this._keyExtractor}
                                        data={store.MyTicketData.issueDescription}
                                        renderItem={this.renderItem.bind(this)}
                                        ListEmptyComponent={this._renderNoComments()}
                                    />
                                </Box>
                            </Box>
                        )}
                        {(store.MyTicketData.resolutionComment && store.MyTicketData.resolutionComment.length > 0) && (
                            <Box >
                                <View  style={{borderColor: 'transparent',width:'90%',marginLeft:14}}>
                                    <Text>Admin resolution comments</Text>
                                </View>
                                <Box>
                                    <FlatList
                                        style={{ flex: 0 }}
                                        initialNumToRender={store.myTickets.length}
                                        keyExtractor={this._keyExtractor}
                                        data={store.MyTicketData.resolutionComment}
                                        renderItem={this.renderItem.bind(this)}
                                        ListEmptyComponent={this._renderNoComments()}
                                    />
                                </Box>
                            </Box>
                        )}


                        {store.MyTicketData.status === 'Closed' && (
                            <Button backgroundColor={colors.BLUE} style={{margin: 12, justifyContent: 'center'}}
                                    onPress={() => {
                                        store.setReOpen(store.MyTicketData.id);
                                        this.props.navigation.navigate('Comments');
                                    }}
                            >
                                <Text>Re-Open</Text>
                            </Button>
                        )}
                    {/* </Form> */}
                </ScrollView>
            </View>
        );
    }

    _renderNoComments() {
        return (
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <Text>No Comments</Text>
            </View>
        );
    }

    getStartIcon(isBlocked) {
        return (
            isBlocked ?
                <Ionicons
                    name="ios-star"
                    style={styles.vectorIconBlack}
                /> : <Ionicons
                    name="ios-star-outline"
                    style={styles.vectorIconOuter}
                />)
    }

    renderItem(data) {
        let {item}=data;
        let date = moment(item.createdAt).format("DD MMM [at] HH:mm");
        return (
            <View style={{flex: 1, flexDirection: 'column'}}>
                <Text style={styles.commentHeader}>{date}</Text>
                <Text style={styles.commentLabel}>{item.comment}</Text>
            </View>
        );
    }

    getRating(rating) {
        console.warn('my ticket details rating -- ', rating);
        return (
            <View >
                <Rating
                            type='star'
                            ratingColor='#3498db'
                            ratingBackgroundColor='#c8c7c8'
                            ratingCount={5}
                            imageSize={30}
                            startingValue={
                                rating
                            }
                            style={{ paddingVertical: 10 }}
                        />

                    {/* {this.getStartIcon(rating > 0)}
                    {this.getStartIcon(rating > 1)}
                    {this.getStartIcon(rating > 2)}
                    {this.getStartIcon(rating > 3)}
                    {this.getStartIcon(rating > 4)} */}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    textAreaContainer: {
        padding: 5,
        backgroundColor: colors.WHITE,
        marginLeft: 2,
        marginRight: -4

    },
    textArea: {
        textAlignVertical: "top", // hack android
        fontSize: 14,
        color: "#333",
    }, vectorIconBlack: {
        fontSize: 30,
        color: colors.GRAY
    },
    vectorIconOuter: {
        fontSize: 30,
        color: colors.GRAY
    },commentHeader: {
        flex: 1,
        fontSize: 16,
        color: colors.BLACK
    }, commentLabel:{
        flex: 1,
        fontSize: 16,
        color: colors.GRAY
    }

});