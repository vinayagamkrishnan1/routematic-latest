import React, {Component} from "react";
import {InteractionManager, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View} from "react-native";
import {colors} from "../../../utils/Colors";
import TouchableDebounce from "../../../utils/TouchableDebounce";
import Ionicons from "react-native-vector-icons/Ionicons";
import PleaseWaitLoader from "../../../network/loader/PleaseWaitLoader";
import moment from "moment";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";

// create a component
class TimePicker extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            headerStyle: {display: "none"}
        };
    };
    state = {
        isLoading: true,
        shiftType: "",
        text: "",
        selectedShiftTime: "",
        shiftTimes: []
    };

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            // ...long-running synchronous task...
            let shiftTimes = this.props.route.params.shiftTimes;
            let shiftType = this.props.route.params.shiftType;
            let selectedShiftTime = this.props.route.params
                .selectedShiftTime;

            setTimeout(() => {
                if (shiftTimes)
                    this.setState({
                        shiftTimes: shiftTimes.split("|"),
                        shiftType,
                        selectedShiftTime,
                        isLoading: false
                    });
            }, 100);
        });
    }

    render() {
        if (this.state.isLoading) return <PleaseWaitLoader/>;

        let shiftTimes = this.state.text
            ? this.state.shiftTimes.filter(word =>
                word.toUpperCase().includes(this.state.text.toUpperCase())
            )
            : this.state.shiftTimes;

        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.WHITE}}>
                <View style={styles.container}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                    <View
                        style={{
                            height: 60,
                            width: "100%",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            flexDirection: "row",
                            backgroundColor: colors.WHITE
                        }}
                    >
                        <Ionicons
                            name="close"
                            style={{
                                fontSize: 30,
                                color: colors.BLACK,
                                marginLeft: 10,
                                fontFamily: "Helvetica"
                            }}
                            onPress={() => this.props.navigation.goBack()}
                        />
                        <Text
                            style={{
                                fontFamily: "Helvetica",
                                fontSize: 18,
                                marginLeft: 5,
                                color: colors.BLACK
                            }}
                        >
                            {this.props.route.params.shiftType === "login"
                                ? "Select Login Time"
                                : "Select Logout Time"}
                        </Text>
                    </View>
                    <View
                        style={{
                            backgroundColor: colors.BACKGROUND,
                            height: 50,
                            width: "100%",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                paddingLeft: 10,
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <Ionicons name="md-search" color={colors.GRAY} size={20}/>
                            <TextInput
                                style={{
                                    borderColor: "gray",
                                    width: "100%",
                                    flex: 1,
                                    paddingLeft: 10
                                }}
                                onChangeText={text => this.setState({text})}
                                value={this.state.text}
                                placeholder="Search..."
                                underlineColorAndroid="transparent"
                                autoCapitalize="none"
                                multiline={false}
                                autoCorrect={false}
                                numberOfLines={1}
                                returnKeyType="next"
                            />
                        </View>
                    </View>
                    <ScrollView keyboardShouldPersistTaps='always'>
                        <View
                            style={{
                                flexDirection: "column",
                                flexWrap: "wrap",
                                alignItems: "flex-start",
                                marginTop: 20,
                                marginLeft: 20,
                                marginRight: 20
                            }}
                        >
                            {shiftTimes.map((Item, index) => {
                                if (!Item) return;
                                let isSelected;
                                if (this.state.selectedShiftTime)
                                    isSelected = Item && Item.includes(this.state.selectedShiftTime);
                                return (
                                    <React.Fragment>
                                        <TouchableDebounce
                                            key={index}
                                            style={viewNotSelectedStyle}
                                            onPress={() => {
                                                setTimeout(() => {
                                                    this.setState({
                                                        selectedShiftTime: Item
                                                    });
                                                }, 0);
                                                setTimeout(() => {
                                                    this.props.navigation.goBack();
                                                }, 10);
                                                setTimeout(() => {
                                                    this.state.shiftType === "login"
                                                        ? this.props.route.params.setLoginTime(
                                                        Item
                                                        )
                                                        : this.props.route.params.setLogoutTime(
                                                        Item
                                                        );
                                                }, 50);
                                            }}
                                        >
                                            <Text
                                                numberOfLines={1}
                                                style={{
                                                    color: colors.BLACK,
                                                    fontSize: 20,
                                                    fontWeight: isSelected ? "700" : "400"
                                                }}
                                            >
                                                {Item === "Cancel"
                                                    ? Item
                                                    : this.state.shiftType === "login"
                                                        ? moment(Item, "HH:mm").format("HH:mm")
                                                        : Item.includes("*")
                                                            ? moment(Item, "HH:mm").format("HH:mm") + " *"
                                                            : moment(Item, "HH:mm").format("HH:mm")
                                                }
                                            </Text>
                                            {isSelected ? (
                                                <FontAwesome
                                                    name={"check-circle"}
                                                    color={colors.GREEN}
                                                    style={{marginLeft: 10}}
                                                    size={26}
                                                    key={index.toString() + "icon"}
                                                />
                                            ) : (
                                                <FontAwesome name={"circle-thin"} size={26}/>
                                            )}
                                        </TouchableDebounce>
                                    </React.Fragment>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: colors.WHITE
    }
});

export default TimePicker;
const viewNotSelectedStyle = {
    width: "100%",
    padding: 5,
    borderStyle: "solid",
    margin: 5,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row"
};
