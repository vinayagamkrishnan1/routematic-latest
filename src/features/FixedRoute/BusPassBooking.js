import React, { Component } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    View
} from "react-native";
import * as Alert from "../../utils/Alert";
import moment from "moment";
import { colors } from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { URL } from "../../network/apiConstants";
import { API } from "../../network/apiFetch/API";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { TYPE } from "../../model/ActionType";
import DatePicker from 'react-native-modern-datepicker';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const passType = "Pass Type";
const category = "Category";
const option = {
    backgroundColor: '#FFFFFF',
    textHeaderColor: '#127CBF',
    textDefaultColor: '#127CBF',
    selectedTextColor: '#FFFFFF',
    mainColor: '#127CBF',
    textSecondaryColor: '#36C090',
    borderColor: 'rgba(122, 146, 165, 0.1)',
};

class BusPassBooking extends Component {
    state = {

        isLoading: false,
        showPop: false,
        showTimePop: false,
        selectedOption: "",
        isDatePickerVisible: false,
        categories: [],
        passTypes: [],
        selectedPassType: '',
        selectedCategory: '',
        suggestedCategory: '',
        showsuggestedCategory: false,
        dateSelected: "Select",
        weeklyPassCutoff: '',
        monthlyPassCutoff: '',
        monthlyPassAdvance: '',
        weeklyPassAdvance: '',
        dailyPassAdvance: '',

    };
    callback = async (actionType, response, copyDataObj) => {
        switch (actionType) {
            case TYPE.GENERATE_PASSES: {
                handleResponse.getBusPasses(
                    response,
                    this
                );
                break;
            }
        }
    };

    static navigationOptions = ({ navigation }) => {
        return {
            title: "Generate Pass",
            headerTitleStyle: { fontFamily: "Roboto" }
        };
    };

    toggleDatePicker() {
        if (!this.state.isDatePickerVisible) {
            this.setState({ isDatePickerVisible: true });
        } else {
            this.setState({ isDatePickerVisible: false });
        }
    }

    toggleModalVisible(type) {
        if (!this.state.showPop)
            this.setState({ showPop: true, selectedOption: type });
        else this.setState({ showPop: false });
    }

    UNSAFE_componentWillMount() {
        this.setState({
            dailyPassAdvance: this.props.route.params.dailyPassAdvance ? this.props.route.params.dailyPassAdvance : 0,
            weeklyPassAdvance: this.props.route.params.weeklyPassAdvance ? this.props.route.params.weeklyPassAdvance : 0,
            monthlyPassAdvance: this.props.route.params.monthlyPassAdvance ? this.props.route.params.monthlyPassAdvance : 0,


            weeklyPassCutoff: this.props.route.params.weeklyPassCutoff ? this.props.route.params.weeklyPassCutoff : 0,
            monthlyPassCutoff: this.props.route.params.monthlyPassCutoff ? this.props.route.params.monthlyPassCutoff : 0,

            passTypes: this.props.route.params.passTypes? this.props.route.params.passTypes : [],
            suggestedCategory: this.props.route.params.suggestedCategory ? this.props.route.params.suggestedCategory : "",
            selectedPassType: this.props.route.params.passTypes ? this.props.route.params.passTypes[0].code : '',
            selectedCategory: this.props.route.params.suggestedCategory ? this.props.route.params.suggestedCategory : "",
            categories: this.props.route.params.categories ? this.props.route.params.categories : []
        })
    }

    componentDidMount() {
        /*try {
            if (this.state.selectedPassType === 'Weekly') {
                const dayINeed = 1; // for Monday
                const today = moment().isoWeekday();
                let dateSelected = "";
                // if we haven't yet passed the day of the week that I need:
                if (today <= dayINeed) {
                    // then just give me this week's instance of that day
                    dateSelected = moment().isoWeekday(dayINeed);
                } else {
                    // otherwise, give me *next week's* instance of that same day
                    dateSelected = moment().add(1, 'weeks').isoWeekday(dayINeed);
                }
                this.setState({
                    dateSelected: dateSelected.format("YYYY-MM-DD")
                });
            } else if (this.state.selectedPassType === 'Monthly') {
                let dateSelected = moment().format("YYYY-MM-01");
                this.setState({
                    dateSelected: dateSelected
                });
            } else {
                const dayINeed = 1; // for Monday
                const today = moment().isoWeekday();
                let dateSelected = "";
                // if we haven't yet passed the day of the week that I need:
                if (today <= dayINeed) {
                    // then just give me this week's instance of that day
                    dateSelected = moment().isoWeekday(dayINeed);
                } else {
                    // otherwise, give me *next week's* instance of that same day
                    dateSelected = moment().add(1, 'weeks').isoWeekday(dayINeed);
                }
                this.setState({
                    dateSelected: dateSelected.format("YYYY-MM-DD")
                });
            }
        } catch (e) {
            console.warn("error " + e);
        }*/
    }


    _renderRightArrow() {
        return (
            <FontAwesome
                name="chevron-right"
                style={{
                    fontSize: 20,
                    marginRight: 20,

                    color: colors.GRAY,
                    fontFamily: "Helvetica",
                    right: 0,
                    position: "absolute"
                }}
                onPress={() => {
                    setTimeout(() => this.setState({ showTimePop: false }), 0);
                }}
            />
        );
    }

    render() {
        console.warn("date" + this.state.dateSelected);
        return (
            <ScrollView>
                <View style={{ flex: 1, alignItems: "center", padding: 10 }}>
                    <View
                        style={(this.state.categories && this.state.categories.length > 1) ? rectangle14 : rectangle15}>


                        <TouchableDebounce
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 10


                            }}
                            onPress={() => {
                                if (this.state.passTypes && this.state.passTypes.length > 1) {
                                    this.setState({ isDatePickerVisible: false });
                                    this.toggleModalVisible(passType)
                                }

                            }}
                        >
                            <View
                                style={{ flex:1, marginLeft: 10, marginTop: 10 }}
                                onPress={() => this.toggleModalVisible(passType)}
                            >
                                {this.renderTitlePlace(passType, this.state.selectedPassType)}
                            </View>
                            {this._renderRightArrow()}
                        </TouchableDebounce>

                        {this._renderLine()}
                        {(this.state.categories && this.state.categories.length > 1) && <TouchableDebounce
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                
                            }}
                            onPress={() => {
                                this.setState({ isDatePickerVisible: false });
                                this.toggleModalVisible(category);
                            }}
                        >
                            <View  style={{ flex:1, marginLeft: 10, marginTop: 10 }}>
                                {this.renderTitlePlace(category, this.state.selectedCategory)}
                            </View>
                            {this._renderRightArrow()}
                        </TouchableDebounce>}
                        {(this.state.categories && this.state.categories.length > 1) && <TouchableDebounce
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginTop: 2
                            }}
                            onPress={() => {
                                this.setState({ isDatePickerVisible: false });
                                this.props.navigation.navigate("FindMyCategory", {
                                    suggestedCategory: this.statesuggestedCategory,
                                })
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.BLUE,
                                    marginLeft: 10
                                }}
                            >
                                Find my category?
                            </Text>
                        </TouchableDebounce>}

                        {(this.state.categories && this.state.categories.length > 1) && this._renderLine("100%")}
                        <TouchableDebounce
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 10
                            }}
                            onPress={() => this.toggleDatePicker()}
                        >
                            <View
                                style={{ height: 60, marginLeft: 10, marginTop: 10 }}
                                onPress={() => {
                                    this.setState({ isDatePickerVisible: false });
                                    this.toggleDatePicker();
                                }}
                            >

                                {this.state.dateSelected !== "Select" ? this.renderDate(
                                    "Date",
                                    moment(this.state.dateSelected).format("DD"),
                                    moment(this.state.dateSelected).format("MMMM YYYY"),
                                    moment(this.state.dateSelected).format("dddd")
                                ) : this.renderDate(
                                    "Date",
                                    "Select",
                                    "",
                                    ""
                                )
                                }
                            </View>
                            {this._renderRightArrow()}
                        </TouchableDebounce>

                    </View>

                    <TouchableDebounce
                        style={oval}
                        onPress={() => {
                            this.generatePass();
                        }}
                    >
                        <MaterialIcons
                            name={"navigate-next"}
                            style={{ fontSize: 25, color: colors.WHITE, fontWeight: "700" }}
                        />
                    </TouchableDebounce>
                    {this.renderModalView()}
                    {this.state.isDatePickerVisible && this.renderDatePicker()}
                </View>
            </ScrollView>

        );
    }

    renderDate(title, date, monthYear, day) {
        return (
            <View style={{ flex: 1}}>
                <Text style={from}>{title}</Text>
                <View style={{ flexDirection: "row" }}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 10,
                            marginLeft: 10
                        }}
                    >
                        <MaterialCommunityIcons
                            name={"calendar-today"}
                            size={25}
                            color={colors.BLACK}
                        />
                        <Text style={date === "Select" ? sourceName : dateStyleBig}>
                            {date}
                        </Text>
                    </View>

                    <View style={{ flexDirection: "column", marginLeft: 5 }}>
                        <Text style={monthYearStyle}>{monthYear}</Text>
                        <Text style={dayStyle}>{day}</Text>
                    </View>
                </View>
            </View>
        );
    };


    renderTitlePlace(title, placeName) {
        return (
            <View style={{ flex: 1 }}>
                <Text style={from}>{title}</Text>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 10,
                        marginLeft: 10
                    }}
                >
                    <MaterialIcons
                        name={title.includes("Pass Type") ? "credit-card" : "list"}
                        style={{ fontSize: 25, color: colors.BLACK }}
                    />
                    <Text style={sourceName}>{placeName}</Text>


                </View>
            </View>
        );
    }

    _renderLine(size) {
        return (
            <View
                style={{
                    height: 0.5,
                    width: size ? size : "100%",
                    backgroundColor: colors.GRAY,
                    marginTop: 5
                }}
            />
        );
    }

    _keyExtractor(item, index) {
        return index.toString();
    }

    _renderSeparator() {
        return <View style={separator} />;
    }

    _onRefresh() {
        this.setState({
            refreshing: true
        });
    }

    _renderEmptyList = () => {
        return (
            //View to show when list is empty
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    margin: 10
                }}
            >
                <Text style={{ textAlign: "center" }}>No data found</Text>x
            </View>
        );
    };

    _renderListItem(Item) {
        return (
            <View
                style={{
                    justifyContent: "center",
                    width: "100%",
                    height: 50,
                    paddingLeft: 10,
                    paddingRight: 10,
                    backgroundColor: colors.WHITE
                }}
            >
                <TouchableDebounce
                    onPress={() => {

                        this.toggleModalVisible();

                        this.state.selectedOption === passType ?
                            this.setState({
                                selectedPassType: Item.item.code,
                                dateSelected: "Select"
                            })
                            : this.setState({
                                selectedCategory: Item.item.code,
                            })

                    }}
                >
                    <Text style={{color: colors.BLACK}}>{Item.item.description}</Text>

                </TouchableDebounce>
            </View>
        );
    }

    renderModalView() {

        return (
            <Modal

                animationType="slide"
                transparent={true}
                visible={this.state.showPop}
                onRequestClose={() => {
                    this.setState({ showPop: false });
                }}
                backdropColor={colors.BLACK}
                backdropOpacity={1}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: colors.WHITE }}>
                    <View style={{ flex: 1, backgroundColor: colors.WHITE }}>
                        <View style={{ flexDirection: "row", height: 50, marginTop: 30 }}>
                            <Text
                                style={{
                                    marginTop: 10,
                                    fontSize: 20,
                                    marginLeft: 10,
                                    color: colors.BLUE
                                }}
                            >
                                Select{" "}
                                {this.state.selectedOption === passType
                                    ? passType
                                    : category}
                            </Text>
                            <Ionicons
                                name="close"
                                style={{
                                    fontSize: 40,
                                    marginRight: 20,
                                    marginTop: 10,
                                    color: colors.BLACK,
                                    fontFamily: "Helvetica",
                                    right: 0,
                                    position: "absolute"
                                }}
                                onPress={() => {
                                    setTimeout(() => this.setState({ showPop: false }), 0);
                                }}
                            />
                        </View>
                        <FlatList
                            keyExtractor={this._keyExtractor}
                            data={
                                this.state.selectedOption === passType
                                    ? this.state.passTypes
                                    : this.state.categories
                            }
                            renderItem={this._renderListItem.bind(this)}
                            ItemSeparatorComponent={this._renderSeparator.bind(this)}
                            ListEmptyComponent={this._renderEmptyList}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.isLoading}
                                    onRefresh={this._onRefresh.bind(this)}
                                />
                            }
                        />
                    </View>
                </SafeAreaView>
            </Modal>
        );
    }

    generatePass() {
        if (this.state.dateSelected !== "Select") {
            let body = {
                passType: this.state.selectedPassType,
                fromDate: this.state.dateSelected,
                category: this.state.selectedCategory,
                IsProfileStateCheck:1
            };
            API.newFetchJSON(
                URL.GENERATE_BUS_PASS,
                body,
                true,
                this.callback.bind(this),
                TYPE.GENERATE_PASSES,
                null
            );
        } else {
            Alert.show("Generate Pass", "Please select Date");
        }
    }

    _handleDatePicked = date => {
        try {
            let day = moment(date).format("ddd");
            let date1 = moment(date).format("DD");
            console.warn('day ', day, date1);
            if (this.state.selectedPassType === 'Weekly') {
                if (day === 'Mon') {
                    const dateSelected = moment(date).format("YYYY-MM-DD");
                    this.setState({
                        dateSelected: dateSelected
                    });
                    this.toggleDatePicker();
                } else {
                    Alert.alert(
                        "Warning", "Weekly pass can be generated only from 'Monday'");
                }
            } else if (this.state.selectedPassType === 'Monthly') {
                if (date1 === '01') {
                    const dateSelected = moment(date).format("YYYY-MM-DD");
                    this.setState({
                        dateSelected: dateSelected
                    });
                    this.toggleDatePicker();
                } else {
                    Alert.alert(
                        "Warning", "Monhtly pass can be generated only for calendar month");
                }
            } else {
                const dateSelected = moment(date).format("YYYY-MM-DD");
                this.setState({
                    dateSelected: dateSelected
                });
                this.toggleDatePicker();
            }
        } catch (e) {
            console.warn("error " + e);
        }
    };

    renderDatePicker() {
        if (this.state.selectedPassType === "Monthly") {


            let demoDate = moment().format("YYYY-MM-DD");
            // let demoDate = "2020-02-12";
            let monthsToAdd =
                (moment(demoDate).format("DD") > this.state.monthlyPassCutoff && this.state.monthlyPassCutoff !== -1) ? 2 : 1;

            demoDate = moment(demoDate).format("YYYY") + "-" + moment(demoDate).format("MM") + "-01"
            console.warn("current" + demoDate);
            return (

                <DatePicker
                    options={option}
                    mode="monthYear"
                    current={moment(demoDate).add(monthsToAdd, 'months').format("YYYY-MM-DD")}
                    // selected={moment().add(this.state.monthlyPassCutoff,'months').format("YYYY-MM-DD")}
                    minimumDate={moment(demoDate).add(monthsToAdd, 'months').format("YYYY-MM-DD")}
                    maximumDate={moment(demoDate).add(this.state.monthlyPassAdvance, 'months').format("YYYY-MM-DD")}
                    selectorStartingYear={moment(demoDate).add(monthsToAdd, 'months').format("YYYY")}
                    selectorEndingYear={moment(demoDate).add(this.state.monthlyPassAdvance, 'months').format("YYYY")}
                    onMonthYearChange={month => {
                        console.warn('selected month - ', month);
                        var mon = month.toString() + " " + "01";
                        var replaced = mon.split(' ').join('/');
                        console.warn('replaced - ', replaced);
                        let dates = moment(replaced, "YYYY/MM/DD").format("YYYY-MM-DD");
                        this._handleDatePicked(dates)
                    }}
                    style={{ borderRadius: 10 }}
                />
            );
        } else if (this.state.selectedPassType === "Weekly") {
            let demoDate = moment().format("YYYY-MM-DD");
            // let demoDate = "2020-02-20";
            console.warn("test" + JSON.stringify(moment(demoDate).day()))

            let daysToAdd = (moment(demoDate).day() === 0 || moment(demoDate).day() === 1) ? 7 : (((moment(demoDate).day() > this.state.weeklyPassCutoff) && (this.state.weeklyPassCutoff !== -1)) ? 7 : 0);
            console.warn("test1" + JSON.stringify(daysToAdd))
            return (
                <DatePicker
                    options={option}
                    current={moment(demoDate).add(daysToAdd, 'days').format("YYYY-MM-DD")}
                    minimumDate={"Mon," + JSON.stringify(moment(demoDate).add(daysToAdd, 'days').format("YYYY-MM-DD"))}
                    //   maximumDate={moment((this.getDayNumber((moment(demoDate).format("ddd")) >= this.state.weeklyPassCutoff && this.state.weeklyPassCutoff!==-1)? moment(demoDate).add(daysToAdd,"days").format("YYYY-MM-DD"): moment(demoDate).format("YYYY-MM-DD"))).add(this.state.weeklyPassAdvance,'weeks').format("YYYY-MM-DD")}
                    maximumDate={moment(demoDate).add(this.state.weeklyPassAdvance, 'weeks').format("YYYY-MM-DD")}
                    mode="calendar"
                    // onSelectedChange={datestring => this._handleDatePicked(datestring)}
                    onSelectedChange={date => {
                        let dates = moment(date, "YYYY/MM/DD").format("YYYY-MM-DD");
                        this._handleDatePicked(dates)
                    }}
                    style={{ borderRadius: 10 }}
                />
            );
        } else {
            return (
                <DatePicker
                    options={option}
                    minimumDate={moment().format("YYYY-MM-DD")}
                    maximumDate={moment(new Date()).add(this.state.dailyPassAdvance, 'days').format("YYYY-MM-DD")}
                    mode="calendar"
                    // onSelectedChange={datestring => this._handleDatePicked(datestring)}
                    onSelectedChange={date => {
                        let dates = moment(date, "YYYY/MM/DD").format("YYYY-MM-DD");
                        this._handleDatePicked(dates)
                    }}
                    style={{ borderRadius: 10 }}
                />
            );
        }
    }
}

export default BusPassBooking;

const rectangle14 = {
    height: 280,
    width: "100%",
    backgroundColor: colors.WHITE,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
        width: 1,
        height: 1
    },
    shadowRadius: 2,
    shadowOpacity: 1,
    flexDirection: "column",
    borderRadius: 5,
    overflow: "hidden"
};
const rectangle15 = {
    height: 170,
    width: "100%",
    backgroundColor: colors.WHITE,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
        width: 1,
        height: 1
    },
    shadowRadius: 2,
    shadowOpacity: 1,
    flexDirection: "column",
    borderRadius: 5,
    overflow: "hidden"
};
const from = {
    fontFamily: "Helvetica",
    fontSize: 14,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.GRAY
};
const sourceName = {
    fontFamily: "Helvetica",
    fontSize: 18,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#4a4a4a",
    marginLeft: 10
};
const oval = {
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderRadius: 30,
    width: 60,
    height: 60,
    backgroundColor: colors.BLUE_BRIGHT,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
        width: 0,
        height: 2
    },
    shadowRadius: 4,
    shadowOpacity: 1
};
const separator = {
    height: 0.5,
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#555"
};
const titleStyle = {
    fontFamily: "Helvetica",
    fontSize: 13,
    textAlign: "left",
    color: colors.GRAY
};
const dateStyleBig = {
    fontFamily: "Helvetica",
    fontSize: 25,
    textAlign: "left",
    color: colors.BLACK,
    marginLeft: 5
};
const dateStyle = {
    fontFamily: "Helvetica",
    fontSize: 20,
    // fontWeight: "500",
    textAlign: "left",
    color: colors.BLACK,
    marginLeft: 5
};
const monthYearStyle = {
    fontFamily: "Helvetica",
    fontSize: 12,
    fontWeight: "300",
    textAlign: "center",
    color: colors.BLACK,
    marginTop: 5
};
const dayStyle = {
    fontFamily: "Helvetica",
    fontSize: 12,
    fontWeight: "300",
    textAlign: "left",
    color: colors.GRAY
};