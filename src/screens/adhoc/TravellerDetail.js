import React, { Component } from "react";
import { Text, } from "native-base";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Keyboard,
    PanResponder,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { colors } from "../../utils/Colors";
import { inject, observer } from "mobx-react";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import * as HOC from "../../components/hoc";
import TouchableDebounce from "../../utils/TouchableDebounce";
import {
    _renderCountry,
    _renderDate,
    _renderOffice,
    _renderTitleContent
} from "../roster/customeComponent/customComponent";
import { rosterType } from "../roster/customeComponent/RosterType";
import Moment from "moment";
import { extendMoment } from "moment-range";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { RadioButton } from "react-native-paper";
import Autocomplete from "react-native-autocomplete-input";
import { Select } from "../../utils/ConstantString";

const ViewLoader = HOC.LoaderHOC(View);
const moment = extendMoment(Moment);
const alertMessage = "Please Select Request type and Trip type";
const _ = require("lodash");
const {height} = Dimensions.get("window");

@inject("adhocStore")
@observer
class TravellerDetail extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: '' // navigation.getParam("title"),
        };
    };

    _renderLineManger = (store) => {
        return (
            <View>
                <View style={line} />
                <View
                    style={{
                        paddingLeft: 20,
                        paddingRight: 20,
                        paddingTop: 10,
                        paddingBottom: 10,
                        flexDirection: "column"
                    }}
                >
                    <TouchableDebounce
                        disabled={store.ProgramsDetails.LineManagerEmails.length <= 1}
                        onPress={() => {
                            store.hideDateTimePicker();
                            this.props.navigation.navigate("LineManagerSelector", {
                                selectedValue: store.lineManager,
                            });
                        }}
                    >
                        {this._renderTitleContent(
                            "Line Manager",
                            store.lineManager ? store.lineManager : "Select",
                            "lineManger"
                        )}
                    </TouchableDebounce>
                </View>
            </View>
        );
    };
    _renderCostCenter = (store) => {
        return (
            <View>
                <View style={line} />
                <View
                    style={{
                        paddingLeft: 20,
                        paddingRight: 20,
                        paddingTop: 10,
                        paddingBottom: 10,
                        flexDirection: "column"
                    }}
                >
                    <TouchableDebounce
                        onPress={() => {
                            store.hideDateTimePicker();
                            this.props.navigation.navigate("TDCostCenterSelector", {
                                selectedValue: store.selectedCostCenter,
                            });
                        }}
                    >
                        {this._renderTitleContent(
                            "Cost Center *",
                            store.selectedCostCenter ? store.selectedCostCenter : "Select",
                            undefined,
                            "cost"
                        )}
                    </TouchableDebounce>
                </View>
            </View>
        );
    };
    _renderTitleContent = (title, content, manager, cost) => {
        return (
            <View style={{ flexDirection: "column", width: "90%" }}>
                <Text style={[titleStyle, { marginLeft: 3 }]}>{title}</Text>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 5,
                        marginRight: 3
                    }}
                >
                    {manager ?
                        <MaterialCommunityIcons
                            name={"account-check"}
                            size={23}
                            color={colors.BLACK}
                        /> : cost ? <MaterialCommunityIcons
                            name={"bank"}
                            size={23}
                            color={colors.BLACK}
                        /> :
                            <MaterialCommunityIcons
                                name={"map-marker-outline"}
                                size={23}
                                color={colors.BLACK}
                            />}
                    <Text
                        numberOfLines={1}
                        style={dateStyle}
                    >{content}
                    </Text>
                </View>
            </View>
        );
    };
    typeCheck = store => {
        if (store.programSelected === null || store.programSelected === "Select") return true;
        if (store.programSelected.includes("Flexi") ||
            store.programSelected.includes("Others")) {
            return true;
        }
        if (store.ProgramsDetails.Timings) {
            if (store.ProgramsDetails.hasOwnProperty("Timings") && Object.keys(store.ProgramsDetails.Timings).length < 1) return true;
            return (
                Object.keys(store.ProgramsDetails.Timings).length === 1 &&
                store.ProgramsDetails.Timings[0].FromTime !== store.ProgramsDetails.Timings[0].ToTime
            );
        }
    };

    constructor(props) {
        super(props);
        this.state = ({
            title: "",
            query: '',
            showResults:false
        });
    }

    _renderSite(store) {
        return (
            <View>
                <View style={{ flex: 1, flexDirection: "row", }}>
                    <TouchableDebounce
                        onPress={() => {
                            store.hideDateTimePicker();
                            this.props.navigation.navigate("SiteSelector", {
                                selectedItem: store.siteSelected,
                            });
                        }}
                    >
                        {_renderOffice("Site *", store.siteSelected)}
                    </TouchableDebounce>
                </View>
                <View style={line} />
            </View>
            )
    }

    _renderBU(store) {
        return (
            <View style={{ flex: 1, flexDirection: "row", }}>
                <TouchableDebounce
                    onPress={() => {
                        store.hideDateTimePicker();
                        this.props.navigation.navigate("BusinessSelector", {
                            selectedItem: store.buSelected,
                        });
                    }}
                >
                    {_renderOffice("BU *", store.buSelected)}
                </TouchableDebounce>
            </View>)
    }

    _renderSubBU(store) {
        return (
            <View style={{ flex: 1, flexDirection: "row", }}>
                <TouchableDebounce
                    onPress={() => {
                        if (store.buSelected !== Select) {
                            store.hideDateTimePicker();
                            this.props.navigation.navigate("SubBusinessSelector", {
                                selectedItem: store.subbuSelected,
                            });
                        } else {
                            Alert.alert(this.state.title, "Please select a BU");
                        }
                    }}
                >
                    {_renderOffice("Sub BU", store.subbuSelected)}
                </TouchableDebounce>
            </View>)
    }

    _renderTravellerType(store) {
        return (
            <View style={{ flex: 1, flexDirection: "row", }}>
                <TouchableDebounce
                    onPress={() => {
                        if (store.buSelected !== "Select") {
                            this.props.navigation.navigate("TravellerTypeSelector", {
                                selectedItem: store.travellerSelected,
                            });
                        } else {
                            Alert.alert(this.state.title, "Please select a business unit");
                        }
                    }}
                >
                    {_renderOffice("Traveller Type *", store.travellerSelected)}
                </TouchableDebounce>
            </View>)
    }

    _renderCountry(store) {
        return (
            <View style={{ flex: 1, flexDirection: "row", }}>
                <TouchableDebounce
                    onPress={() => {
                        if (store.siteSelected !== "Select") {
                            store.hideDateTimePicker();
                            this.props.navigation.navigate("CountrySelector", {
                                selectedItem: store.countrySelected,
                            });
                        } else {
                            Alert.alert(this.state.title, "Please select a site");
                        }
                    }}
                >
                    {_renderCountry("Guest Country *", store.countrySelected)}
                </TouchableDebounce>
            </View>)
    }

    componentDidMount() {
        if (this.state.title.toString().length <= 0) {
            let title = this.props.route.params.title; // ", "Ad Hoc");
            this.setState({ title });
        }
    }

    render() {
        const adhocStoreObject = this.props.adhocStore;
        const { query } = this.state;
        if (query.length > 3) {
            adhocStoreObject.getProfiles(query);
        }
        return (
            // <ViewLoader spinner={this.props.adhocStore.isLoading} style={{ flex: 1 }}>
                <SafeAreaView
                    style={{ flex: 1, backgroundColor: colors.WHITE, paddingTop: Platform.OS === 'ios' ? 20 : 0 }}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.BLUE}
                        barStyle="dark-content"
                    />
                    <ScrollView style={{ marginBottom: 50 }}
                    // keyboardShouldPersistTaps='always'
                    keyboardShouldPersistTaps={true}
                    >
                        <View
                            style={viewContainer}
                        >
                            <View style={{ marginTop: 20 }} />
                            {this._renderTravellerType(adhocStoreObject)}
                            <View style={line} />
                            {adhocStoreObject.travellerSelected === 'Employee' && !adhocStoreObject.editMode && (
                                <>
                                <View style={Platform.OS === 'ios' ? {width:"90%",height:60, alignItems: "center", padding: 10,margin:16, zIndex: 1} : {width:"90%",height:60, alignItems: "center", padding: 10,margin:16}}
                                    nestedScrollEnabled={true}>
                                    <Autocomplete
                                        containerStyle={autocompleteContainer}
                                        data={adhocStoreObject.Profiles}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        defaultValue={query}
                                        placeholder={"Enter the Employee number "}
                                        nestedScrollEnabled={true}
                                        renderSeparator={
                                            <View style={{width:"100%",height:"4%",color:colors.BLACK}}/>
                                        }
                                        hideResults={this.state.showResults}
                                        onChangeText={text => this.setState({ query: text,showResults:false })}
                                        listStyle={{height:height-300}}
                                        // keyExtractor={item => item.employeeNumber}
                                        // flatListProps={{paddingBottom: 20}}
                                        flatListProps={{
                                            keyExtractor: (_, item) => item.employeeNumber,
                                            renderItem: ({ item }) => (
                                                <TouchableOpacity
                                                    style={{padding:6,margin:6}}
                                                    onPress={() => {
                                                        adhocStoreObject.setSelectedEmployee(item);
                                                        this.setState({ query:'',showResults:true });
                                                        Keyboard.dismiss();
                                                    }}>
                                                    <Text>{item.employeeNumber + ' ' + item.employeeName}</Text>
                                                </TouchableOpacity>
                                            ),
                                            padding: 10
                                          }}
                                    />
                                </View>
                                <View style={line} />
                                </>
                            )}

                            {this._renderBU(adhocStoreObject)}
                            <View style={line} />
                            {this._renderSubBU(adhocStoreObject)}
                            <View style={line} />
                            {adhocStoreObject.travellerSelected === 'Employee' && (
                                <>
                                <View style={{
                                    paddingLeft: 20,
                                    paddingRight: 20,
                                    paddingTop: 10,
                                    paddingBottom: 10,
                                    flex: 1,
                                    flexDirection: 'column'
                                }}>
                                    <Text style={itemNameLabel}>Emp No *</Text>
                                    <TextInput
                                        ref={numberRef => {
                                            this.numberRef = numberRef;
                                        }}
                                        style={itemName}
                                        numberOfLines={1}
                                        returnKeyType="done"
                                        maxLength={50}
                                        onChangeText={text => this.onNumberChange(adhocStoreObject, text)}
                                        value={adhocStoreObject.travellerNumber}
                                    />
                                </View>
                                <View style={line} />
                                </>
                            )}
                            <View style={{
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                                paddingBottom: 10,
                                flex: 1,
                                flexDirection: 'column'
                            }}>
                                <Text style={itemNameLabel}>Name *</Text>
                                <TextInput
                                    ref={nameRef => {
                                        this.nameRef = nameRef;
                                    }}
                                    style={itemName}
                                    numberOfLines={1}
                                    returnKeyType="done"
                                    maxLength={50}
                                    onChangeText={text => this.onNameChange(adhocStoreObject, text)}
                                    value={adhocStoreObject.travellerName}
                                />
                            </View>
                            <View style={line} />
                            <View style={{
                                flex: 1,
                                flexDirection: 'column',
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                                paddingBottom: 10,
                            }}>
                                <Text style={itemNameLabel}>Gender *</Text>
                                <RadioButton.Group onValueChange={value => {
                                    adhocStoreObject.travellerGender = value
                                }} value={adhocStoreObject.travellerGender}>
                                    <RadioButton.Item color="#000" label="Male" value="M" />
                                    <RadioButton.Item color="#000" label="Female" value="F" />
                                </RadioButton.Group>
                            </View>
                            <View style={line} />
                            <View style={{
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                                paddingBottom: 10,
                                flex: 1,
                                flexDirection: 'column'
                            }}>
                                <Text style={itemNameLabel}>Email *</Text>
                                <TextInput
                                    ref={emailRef => {
                                        this.emailRef = emailRef;
                                    }}
                                    style={itemName}
                                    numberOfLines={1}
                                    returnKeyType="done"
                                    maxLength={50}
                                    onChangeText={text => this.onEmailChange(adhocStoreObject, text)}
                                    value={adhocStoreObject.travellerEmail}
                                />
                            </View>
                            <View style={line} />
                            <View style={{
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                                paddingBottom: 10,
                                flex: 1,
                                flexDirection: 'column'
                            }}>
                                <Text style={itemNameLabel}>Mobile Number *</Text>
                                <TextInput
                                    ref={mobileRef => {
                                        this.mobileRef = mobileRef;
                                    }}
                                    style={itemName}
                                    numberOfLines={1}
                                    keyboardType="numeric"
                                    returnKeyType="done"
                                    maxLength={10}
                                    onChangeText={text => this.onMobileNumberChange(adhocStoreObject, text)}
                                    value={adhocStoreObject.travellerContactNo}
                                />
                            </View>
                            <View style={line} />
                            <View style={{
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                                paddingBottom: 10,
                                flex: 1,
                                flexDirection: 'column'
                            }}>
                                <Text style={itemNameLabel}>Alternative Contact No</Text>
                                <TextInput
                                    ref={altmobileRef => {
                                        this.altmobileRef = altmobileRef;
                                    }}
                                    style={itemName}
                                    numberOfLines={1}
                                    keyboardType="numeric"
                                    returnKeyType="done"
                                    maxLength={10}
                                    onChangeText={text => this.onAlterContactChange(adhocStoreObject, text)}
                                    value={adhocStoreObject.travellerAltContactNo}
                                />
                            </View>
                            <View style={line} />
                            {this._renderCountry(adhocStoreObject)}
                            <View style={line} />
                            <View style={{
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                                paddingBottom: 10,
                                flex: 1,
                                flexDirection: 'column'
                            }}>
                                <Text style={itemNameLabel}>Nationality *</Text>
                                <TextInput
                                    ref={nationalityRef => {
                                        this.nationalityRef = nationalityRef;
                                    }}
                                    style={itemName}
                                    numberOfLines={1}
                                    returnKeyType="done"
                                    onChangeText={text => this.onNationalityChange(adhocStoreObject, text)}
                                    value={adhocStoreObject.nationality}
                                />
                            </View>
                            <View style={line} />
                            {adhocStoreObject.isTDCostCenterVisible() && this._renderCostCenter(adhocStoreObject)}
                            {/* {(adhocStoreObject.travellerSelected === 'Employee' && adhocStoreObject.isLineManagerVisible()) && this._renderLineManger(adhocStoreObject)} */}
                        </View>
                    </ScrollView>
                    <TouchableDebounce
                        style={buttonStyle}
                        onPress={() => {
                            if (adhocStoreObject.isLoading) return;
                            if (adhocStoreObject.buSelected === Select) {
                                Alert.alert(this.state.title, "Please select BU");
                                return;
                            } else if (adhocStoreObject.travellerSelected === Select) {
                                Alert.alert(this.state.title, "Please select a traveller type");
                                return;
                            } else if (!adhocStoreObject.travellerName) {
                                Alert.alert('Travel Desk', "Please enter name");
                                return;
                            } else if (!adhocStoreObject.travellerNumber && adhocStoreObject.travellerSelected === 'Employee') {
                                Alert.alert('Travel Desk', "Please enter Employee number");
                                return;
                            } else if (!adhocStoreObject.travellerEmail) {
                                Alert.alert('Travel Desk', "Please enter email");
                                return;
                            } else if (!adhocStoreObject.travellerContactNo) {
                                Alert.alert('Travel Desk', "Please enter contact no");
                                return;
                            // } else if (!adhocStoreObject.travellerAltContactNo) {
                            //     Alert.alert('Travel Desk', "Please enter alternate contact no");
                            //     return;
                            } else if (!adhocStoreObject.travellerGender) {
                                Alert.alert('Travel Desk', "Please select gender");
                                return;
                            }

                            adhocStoreObject.setEmployee();
                            this.props.navigation.goBack();
                        }}
                    >
                        {adhocStoreObject.isLoading ? (
                            <ActivityIndicator color={colors.WHITE} animating={true} />
                        ) : (
                            <Text style={bottomButton}>
                                Save
                            </Text>
                        )}

                    </TouchableDebounce>
                </SafeAreaView>
            // </ViewLoader>
        );
    }

    onNumberChange(adhocStoreObject, value) {
        adhocStoreObject.travellerNumber = value;
    }

    onNameChange(adhocStoreObject, value) {
        adhocStoreObject.travellerName = value;
    }

    onEmailChange(adhocStoreObject, value) {
        adhocStoreObject.travellerEmail = value;
    }
    onMobileNumberChange(adhocStoreObject, value) {
        adhocStoreObject.travellerContactNo = value;
    }
    onAlterContactChange(adhocStoreObject, value) {
        adhocStoreObject.travellerAltContactNo = value;
    }
    onNationalityChange(adhocStoreObject, value) {
        adhocStoreObject.nationality = value;
    }

}

const line = {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: colors.GRAY
};
const buttonStyle = {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    backgroundColor: colors.BLUE_BRIGHT,
    flexDirection: "row"
};
const dateStyle = {
    fontFamily: "Helvetica",
    fontSize: 20,
    textAlign: "left",
    color: colors.BLACK,
    marginLeft: 5,
    width: '100%'
};
const titleStyle = {
    fontFamily: "Helvetica",
    fontSize: 13,
    textAlign: "left",
    color: colors.GRAY
};
const bottomButton = {
    color: colors.WHITE,
    fontWeight: "500",
    fontSize: 20,
    marginLeft: 10
};
const viewContainer = {
    flex: 1,
    backgroundColor: colors.WHITE,
    flexDirection: "column"
};
const itemNameLabel = {
    fontFamily: "Helvetica",
    fontSize: 13,
    textAlign: "left",
    color: colors.GRAY
};

const itemName = {
    fontSize: 16,
    fontWeight: '500',
    color: colors.BLACK,
    // borderBottomWidth: 1,
    // borderBottomColor: colors.GRAY
};

const autocompleteContainer = {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1
};

export default TravellerDetail;