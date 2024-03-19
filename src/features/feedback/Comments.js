import React, {Component} from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    SafeAreaView,
    TouchableWithoutFeedback,
    View
} from "react-native";
import Textarea from "react-native-textarea";
import {Button, Container, Text} from "native-base";
import {spinner} from "../../network/loader/Spinner";
import * as Toast from "../../utils/Toast";
import {colors} from "../../utils/Colors";
import {inject, observer} from "mobx-react";
import {NavigationActions, StackActions} from "@react-navigation/native";
import { checkSpecialCharacter } from "../../utils/Validators";

@inject("feedbackStore")
@observer
export default class Comments extends Component<Props> {
    static navigationOptions = {
        title: "Comments",
        headerTitleStyle: {fontFamily: "Roboto"}
    };
    state = {
        text: "",
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
    // static checkSpecialCharacter(comments) {
    //     var format = /[!#%^&()_+=\[\]{};'"\\|<>\/]/;
    //     return format.test(comments);
    // }


    submitFeedbackWithComments() {
        console.warn("Comments ")
        var commentOptional = this.props.route.params?.commentOptional ? true : false;
console.warn('commentOptional - ', commentOptional);
        if(!commentOptional && this.state.text.toString().length < 1 ){
            Alert.alert(
                "Feedback",
                "Comments are mandatory!.."
            );
        // } else if (Comments.checkSpecialCharacter(this.state.text)) {
        //     Alert.alert(
        //         "Feedback",
        //         "Special character are not allowed except .,:?*-$"
        //     );
        } else {
            this.setState({isLoading: false, showLoader: true});
            if (this.props.feedbackStore.reOpenId !== "") {
                this.props.feedbackStore.reopenTicket(this.state.text);
            } else {
                this.props.feedbackStore.submitFeedback(this.state.text);
            }
        }
    }

    render() {
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
                    <View style={{flex: 1, backgroundColor:'#e6e5eb'}}>
                        <StatusBar
                            translucent={false}
                            backgroundColor={colors.WHITE}
                            barStyle="dark-content"
                        />
                        <KeyboardAvoidingView style={{flex: 1}} behavior="padding" enabled>
                            <View style={styles.container}>
                                {spinner.visible(this.state.isLoading)}
                                <StatusBar barStyle="dark-content"/>
                                <Text style={{marginBottom: 20, fontSize: 20}}>{this.props.feedbackStore.selectedCategory.name}</Text>
                                <Text style={{marginBottom: 20}}>
                                    Additional Comments <Text style={{color:colors.RED}}>*</Text>
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
                                            this.props.navigation.goBack();
                                                // .dispatch(StackActions.reset({
                                                //     index: 1,
                                                //     actions: [
                                                //         NavigationActions.navigate({routeName: 'App'}),
                                                //         NavigationActions.navigate({routeName: 'FeedbackTabs'}),
                                                //     ],
                                                // }))
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
                                           this.submitFeedbackWithComments();
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
        backgroundColor: colors.WHITE
    },
    textarea: {
        textAlignVertical: "top", // hack android
        height: 170,
        fontSize: 14,
        color: "#333"
    }
});
