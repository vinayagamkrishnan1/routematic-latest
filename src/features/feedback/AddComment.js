import React, {Component} from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    TouchableWithoutFeedback,
    View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Textarea from "react-native-textarea";
import {Button, Container, Text} from "native-base";
import {API} from "../../network/apiFetch/API";
import {URL} from "../../network/apiConstants";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import {asyncString} from "../../utils/ConstantString";
import {spinner} from "../../network/loader/Spinner";
import * as Toast from "../../utils/Toast";
import {colors} from "../../utils/Colors";
import {SafeAreaView} from "../../screens/roster/CreateRosterNew";
import {TYPE} from "../../model/ActionType";
import { checkSpecialCharacter } from "../../utils/Validators";
import { CryptoXor } from "crypto-xor";

type Props = {};
export default class AddComment extends Component<Props> {
    static navigationOptions = {
        title: "Submit",
        headerTitleStyle: {fontFamily: "Roboto"}
    };
    state = {
        text: "",
        access_token: "",
        UserId: "",
        DToken: "",
        CustomerUrl: "",
        isLoading: false,
        action: "",
        showLoader: false,
        lastRatedDate: ""
    };
    onChange = value => {
        if (value != "" && checkSpecialCharacter(value)) {
            Toast.show("Special character are not allowed except -_.,:?*$@");
        } else {
            this.setState({text: value});
        }
    };
    callback = async (actionType, response, copyDataObj) => {
        switch (actionType) {
            case TYPE.FEEDBACK_SUBMIT: {
                if(copyDataObj.action) {
                    let object = {
                        tripId: copyDataObj.tripId,
                        rating: copyDataObj.rating
                    };
                    AsyncStorage.getItem(asyncString.FEEDBACK, (err, result) => {
                        if (result !== null) {
                            let array = JSON.parse(result);
                            let hasData = true;
                            array.map((item) => {
                                if (item.tripId === object.tripId) {
                                    hasData = false;
                                }
                            });
                            if (hasData) {
                                array.push(object);
                            }
                            AsyncStorage.setItem(asyncString.FEEDBACK, JSON.stringify(array));
                        } else {
                            let array = [];
                            array.push(object);
                            AsyncStorage.setItem(asyncString.FEEDBACK, JSON.stringify(array));
                        }
                    });
                }
                handleResponse.submitFeedback(
                    response,
                    this,
                    copyDataObj.rating,
                    copyDataObj.action,
                    copyDataObj.lastRatedDate
                );
                break;
            }
        }
    };

    // static checkSpecialCharacter(comments) {
    //     var format = /[!#%^&()_+=\[\]{};'"\\|<>\/]/;
    //     return format.test(comments);
    // }

    componentDidMount() {
        AsyncStorage.multiGet(
            [
                asyncString.ACCESS_TOKEN,
                asyncString.USER_ID,
                asyncString.DTOKEN,
                asyncString.CAPI,
                asyncString.lastRatedDate
            ],
            (err, savedData) => {
                this.setState({
                    access_token: CryptoXor.decrypt(
                        savedData[0][1],
                        asyncString.ACCESS_TOKEN
                    ),
                    UserId: savedData[1][1],
                    DToken: savedData[2][1],
                    CustomerUrl: savedData[3][1],
                    lastRatedDate: savedData[4][1]
                });
            }
        );
    }

    submitFeedbackWithComments(
        tripId,
        shiftDate,
        shiftTime,
        rating,
        devicecode,
        apiurl,
        categoryId,
        subCategoryId,
        comments,
        action
    ) {
        if(this.state.text.toString().length<1){
            Alert.alert(
                "Feedback",
                "Comments are mandatory!.."
            );
            return;
        // }else if (AddComment.checkSpecialCharacter(comments)) {
        //     Alert.alert(
        //         "Feedback",
        //         "Special character are not allowed except .,:?*-$"
        //     );
        //     return;
        }
        this.setState({isLoading: false, showLoader: true});
        let body = {
            tripId,
            shiftDate,
            shiftTime,
            rating,
            devicecode,
            categoryId,
            subCategoryId,
            comments,
            apiurl
        };
        API.newFetchJSON(
            URL.FEEDBACK_SUBMIT,
            body,
            this.state.access_token,
            this.callback.bind(this),
            TYPE.FEEDBACK_SUBMIT,
            {
                rating,
                action,
                lastRatedDate: this.state.lastRatedDate,
                tripId:tripId
            }
        );
    }

    refreshCallBack() {
        this.props.route.params.feedbackRefreshCallback();
    }

    render() {
        const {navigation, route} = this.props;
        const tripId = route.params.tripId ? route.params.tripId : "No tripId ";
        const shiftDate = route.params.shiftDate ? route.params.shiftDate : "No shiftDate ";
        const shiftTime = route.params.shiftTime ? route.params.shiftTime : "No shiftTime ";
        const rating = route.params.rating ? route.params.rating : "No rating ";
        const devicecode = route.params.devicecode ? route.params.devicecode : "No devicecode ";
        const apiurl = route.params.apiurl ? route.params.apiurl : "No apiurl ";
        const action = route.params.action ? route.params.action : "No action ";
        const categoryId = route.params.categoryId ? route.params.categoryId : "No categoryId ";
        const subCategoryId = route.params.subCategoryId ? route.params.subCategoryId : "No subCategoryId ";

        const topic = route.params.topic ? route.params.topic : "No topic ";
        if (this.state.showLoader)
            return (
                <View
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1
                    }}
                >
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                    <ActivityIndicator/>
                    <Text style={{color: colors.BLACK, marginTop: 20}}>
                        Submitting your feedback...
                    </Text>
                </View>
            );
        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    Keyboard.dismiss();
                }}
                onPressIn={() => {
                    Keyboard.dismiss();
                }}
                onPressOut={() => {
                    Keyboard.dismiss();
                }}
            >
                    <View style={{flex: 1, backgroundColor:'#dbdae0'}}>
                        <StatusBar
                            translucent={false}
                            backgroundColor={colors.WHITE}
                            barStyle="dark-content"
                        />
                        <KeyboardAvoidingView style={{flex: 1}} behavior="padding" enabled>
                            <View style={styles.container}>
                                {spinner.visible(this.state.isLoading)}
                                <StatusBar barStyle="dark-content"/>
                                <Text style={{marginTop: 20, marginBottom: 20, fontSize: 20}}>{topic}</Text>
                                <Text style={{marginBottom: 20}}>
                                    Additional Comments(optional)
                                </Text>
                                <Textarea
                                    containerStyle={styles.textareaContainer}
                                    style={styles.textarea}
                                    onChangeText={this.onChange}
                                    defaultValue={this.state.text}
                                    value={this.state.text}
                                    maxLength={120}
                                    placeholder={"Write your additional comments here"}
                                    placeholderTextColor={"#c7c7c7"}
                                    underlineColorAndroid={"transparent"}
                                />
                                <View
                                    style={{
                                        marginTop: 20,
                                        flex: 1,
                                        flexDirection: "row",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <Button
                                        danger
                                        style={{
                                            flex: 1,
                                            backgroundColor: colors.RED,
                                            justifyContent: "center",
                                            alignItems: "center",
                                            marginRight: 10,
                                            height: 50
                                        }}
                                        onPress={() => {
                                            const {navigate, reset} = this.props.navigation;
                                            let action = route.params.action; // ", "NA");
                                            // if (action === "Last24hrTrips") navigate("Last24hrTrip");
                                            if (action === "Last24hrTrips") {
                                                navigate("Home");
                                                route.params.showPreviousTripPopup();
                                            }else if(action==="TrackVehicle"){
                                                // navigate("TrackVehicle");
                                                reset({routes: [{name: 'App'}]});
                                            } else navigate("Feedback", {refreshData: true});
                                        }}
                                    >
                                        <Text style={{fontSize: 12}}>Cancel</Text>
                                    </Button>
                                    <Button
                                        backgroundColor={colors.BLUE}
                                        style={{
                                            flex: 1,
                                            justifyContent: "center",
                                            alignItems: "center",
                                            marginLeft: 10,
                                            height: 50
                                        }}
                                        onPress={() => {
                                            this.submitFeedbackWithComments(
                                                tripId,
                                                shiftDate,
                                                shiftTime,
                                                rating,
                                                devicecode,
                                                apiurl,
                                                categoryId,
                                                subCategoryId,
                                                this.state.text,
                                                action
                                            );
                                        }}
                                    >
                                        <Text style={{fontSize: 12}}>Submit</Text>
                                    </Button>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        justifyContent: "center",
        alignItems: "center"
    },
    textareaContainer: {
        height: 180,
        padding: 5,
        backgroundColor: "#F5FCFF"
    },
    textarea: {
        textAlignVertical: "top", // hack android
        height: 170,
        fontSize: 14,
        color: "#333"
    }
});
