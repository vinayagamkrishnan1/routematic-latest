import React, { Component } from "react";
import { Text, } from "native-base";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Keyboard,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { colors } from "../../utils/Colors";
import { inject, observer } from "mobx-react";
import TouchableDebounce from "../../utils/TouchableDebounce";
import {
    _renderCountry,
    _renderDate,
    _renderListInput,
    _renderOffice,
    _renderTitleContent
} from "../roster/customeComponent/customComponent";
import { RadioButton } from "react-native-paper";
import Autocomplete from "react-native-autocomplete-input";
import { Select } from "../../utils/ConstantString";

const alertMessage = "Please Select Request type and Trip type";
const _ = require("lodash");
const {height} = Dimensions.get("window");

@inject("adhocStore")
@observer
class TravelDeskTraveller extends Component {

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
            <View style={{
                marginHorizontal: 16,
                marginVertical: 8
            }}>
                <TouchableDebounce
                    onPress={() => {
                        this.props.navigation.navigate("SiteSelector", {
                            selectedItem: store.siteSelected,
                        });
                    }}
                >
                    {_renderListInput("Site *", store.siteSelected)}
                </TouchableDebounce>
            </View>
        )
    }

    _renderBU(store) {
        return (
            <View style={{
                width: '48%'
                // marginHorizontal: 16,
                // marginVertical: 8
            }}>
                <TouchableDebounce
                    onPress={() => {
                        this.props.navigation.navigate("BusinessSelector", {
                            selectedItem: store.travellerBU,
                            businesses : store.Businesses,
                            onBusinessSelected: this.onBusinessSelected.bind(this),
                        });
                    }}
                >
                    {_renderListInput("BU *", store.travellerBU)}
                </TouchableDebounce>
            </View>
        )
    }

    _renderSubBU(store) {
        return (
            <View style={{
                width: '48%'
                // marginHorizontal: 16,
                // marginVertical: 8
            }}>
                <TouchableDebounce
                    onPress={() => {
                        if (store.travellerBU !== Select) {
                            this.props.navigation.navigate("SubBusinessSelector", {
                                selectedItem: store.travellerSubbu,
                                subBusinesses: store.SubBusinesses,
                                onSubBusinessSelected: this.onSubBusinessSelected.bind(this)
                            });
                        } else {
                            Alert.alert(this.state.title, "Please select a BU");
                        }
                    }}
                >
                    {_renderListInput("Sub BU", store.travellerSubbu)}
                </TouchableDebounce>
            </View>
        )
    }

    _renderTravellerType(store) {
        return (
            <View style={{
                flexDirection: 'column',
                marginHorizontal: 16,
                marginVertical: 8
            }}>
                {/* <TouchableDebounce
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
                    {_renderListInput("Traveller Type *", store.travellerSelected)}
                </TouchableDebounce> */}
                <Text style={inputLabel}>Traveller Type *</Text>
                <TextInput
                    style={inputText}
                    numberOfLines={1}
                    editable={false}
                    value={store.travellerSelected}
                />
                <View style={line} />
            </View>
        )
    }

    _renderCountry(store) {
        return (
            <View style={{
                width: '48%'
                // marginHorizontal: 16,
                // marginVertical: 8
            }}>
                <TouchableDebounce
                    onPress={() => {
                        if (store.siteSelected !== "Select") {
                            this.props.navigation.navigate("CountrySelector", {
                                selectedItem: store.travellerCountry,
                                countries: store.Countries,
                                onCountrySelected: this.onCountrySelected.bind(this)
                            });
                        } else {
                            Alert.alert(this.state.title, "Please select a site");
                        }
                    }}
                >
                    {_renderListInput("Country *", store.travellerCountry)}
                </TouchableDebounce>
            </View>
        )
    }

    _renderSource = (store) => {
        return (
            <View
                style={{
                    width: '48%'
                }}
            >
                <TouchableDebounce
                    onPress={() => {
                        let sources = store.tripSelected == 'From Airport' ? store.AirportLocations : store.SourceLocations;
                        console.warn('Source Locations filter ', sources);
                        let Locations = _.uniqBy(sources, "LocationName");
                        this.props.navigation.navigate("LocationSelector", {
                            locations: Locations,
                            type: "from",
                            onFromValueChange: this.onFromValueChange.bind(this),
                            other: false,
                            selectedValue: store.fromSelected,
                        });
                    }}
                >
                    {_renderListInput("Pickup *", store.fromSelected)}
                </TouchableDebounce>
            </View>
        );
    };

    _renderDestination = (store) => {
        return (
            <View
                style={{
                    width: '48%'
                }}
            >
                <TouchableDebounce
                    onPress={() => {
                        let dropLocations = store.tripSelected == 'To Airport' ? store.AirportLocations : store.DestinationLocations;
                        console.warn('destination locations - ', dropLocations);
                        const Locations = _.uniqBy(dropLocations, "LocationName");
                        this.props.navigation.navigate("LocationSelector", {
                            locations: Locations,
                            type: "to",
                            onToValueChange: this.onToValueChange.bind(this),
                            other: false,
                            selectedValue: store.toSelected,
                        });
                    }}
                >
                    {_renderListInput("Drop *", store.toSelected)}
                </TouchableDebounce>
            </View>
        );
    };

    returnData(StaffLocations) {
        this.props.adhocStore.StaffLocations = StaffLocations;
    }

    onFromValueChange(value) {
        console.warn('onFromValueChange ', value);
        if (value === "Others") {
            this.goToLocationPicker("from");
        } else {
            this.props.adhocStore.setFromSelected(value);
        }
    }

    onToValueChange(value) {
        console.warn('onToValueChange ', value);
        if (value === "Others") {
            this.goToLocationPicker("to");
        } else {
            this.props.adhocStore.setToSelected(value);
        }
    }

    goToLocationPicker(type) {
        this.props.navigation.navigate("MapPicker", {
            getLocationPicker: this.getLocationPicker.bind(this),
            enableCurrentLocation: true,
            type: type
        });
    }

    getLocationPicker(selectedLocation, selectLat, selectLng, type) {
        let store = this.props.adhocStore;
        if (type === "from") {
            store.fromSelectedLocation = selectedLocation;
            store.fromSelectLat = selectLat;
            store.fromSelectLng = selectLng;
        } else if (type === "to") {
            store.toSelectedLocation = selectedLocation;
            store.toSelectLat = selectLat;
            store.toSelectLng = selectLng;
        }
        else return;
        let body = {
            AddressType: "Others",
            Address: selectedLocation,
            GeoLocation: selectLat + "," + selectLng
        };
        store.savePOILocation(body, type, selectedLocation);
    }

    onBusinessSelected(_bu) {
        this.props.adhocStore.travellerBU = _bu.Name;
    }

    onSubBusinessSelected(_subbu) {
        this.props.adhocStore.travellerSubbu = _subbu.Name;
    }

    onCountrySelected(_country) {
        if (_country.Name != "India") {
            this.props.adhocStore.travellerNationality = '';
        }
        this.props.adhocStore.travellerCountry = _country.Name;
    }

    componentDidMount() {
        // if (this.state.title.toString().length <= 0) {
        //     let title = this.props.route.params.title; // ", "Ad Hoc");
        //     this.setState({ title });
        // }
    }

    render() {
        const adhocStoreObject = this.props.adhocStore;
        const { query } = this.state;
        if (query.length > 3) {
            adhocStoreObject.getProfiles(query);
        }
        return (
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

                            <View style={{
                                flexDirection: 'row',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>
                                <Text style={[inputLabel, {width: '30%'}]}>Trip Type</Text>
                                <Text style={[itemName, {width: '60%'}]}>{adhocStoreObject.tripSelected}</Text>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>
                                <Text style={titleStyle}>Traveller Details</Text>
                            </View>

                            {this._renderTravellerType(adhocStoreObject)}

                            {/* <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}> */}
                            {/* {adhocStoreObject.travellerSelected === 'Employee' && !adhocStoreObject.editMode && (
                                <View style={Platform.OS === 'ios' ? 
                                {width:"90%",height:60, alignItems: "center", padding: 10,margin:16, zIndex: 1} : 
                                {width:"90%",height:60, alignItems: "center", padding: 10,margin:16}}
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
                            )} */}

                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>

                                {adhocStoreObject.travellerSelected === 'Employee' && (
                                <View style={{
                                    flexDirection: 'column',
                                    width: '35%'
                                    // marginHorizontal: 16,
                                    // marginVertical: 8
                                }}>
                                    <Text style={inputLabel}>Employee No. *</Text>
                                    <TextInput
                                        ref={numberRef => {
                                            this.numberRef = numberRef;
                                        }}
                                        style={inputText}
                                        numberOfLines={1}
                                        returnKeyType="next"
                                        maxLength={20}
                                        placeholder="Search here"
                                        onChangeText={text => {
                                            adhocStoreObject.travellerNumber = text
                                        }}
                                        value={adhocStoreObject.travellerNumber}
                                    />
                                    <View style={line} />
                                </View>
                                )}

                                <View style={{
                                    flexDirection: 'column',
                                    width: '60%'
                                    // marginHorizontal: 16,
                                    // marginVertical: 8
                                }}>
                                    <Text style={inputLabel}>Name *</Text>
                                    <TextInput
                                        ref={nameRef => {
                                            this.nameRef = nameRef;
                                        }}
                                        style={inputText}
                                        numberOfLines={1}
                                        returnKeyType="next"
                                        maxLength={50}
                                        onChangeText={text => {
                                            adhocStoreObject.travellerName = text
                                        }}
                                        value={adhocStoreObject.travellerName}
                                    />
                                    <View style={line} />
                                </View>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>
                                <View style={{
                                    flexDirection: 'column',
                                    width: '48%'
                                    // marginHorizontal: 16,
                                    // marginVertical: 8
                                }}>
                                    <Text style={inputLabel}>Contact No. *</Text>
                                    <TextInput
                                        ref={mobileRef => {
                                            this.mobileRef = mobileRef;
                                        }}
                                        style={inputText}
                                        numberOfLines={1}
                                        keyboardType="numeric"
                                        returnKeyType="next"
                                        maxLength={10}
                                        onChangeText={text => {
                                            adhocStoreObject.travellerContactNo = text
                                        }}
                                        value={adhocStoreObject.travellerContactNo}
                                    />
                                    <View style={line} />
                                </View>

                                <View style={{
                                    flexDirection: 'column',
                                    width: '50%'
                                    // marginHorizontal: 16,
                                    // marginVertical: 8
                                }}>
                                    <Text style={inputLabel}>Alternate Contact No.</Text>
                                    <TextInput
                                        ref={altmobileRef => {
                                            this.altmobileRef = altmobileRef;
                                        }}
                                        style={inputText}
                                        numberOfLines={1}
                                        keyboardType="numeric"
                                        returnKeyType="next"
                                        maxLength={10}
                                        onChangeText={text => {
                                            adhocStoreObject.travellerAltContactNo = text
                                        }}
                                        value={adhocStoreObject.travellerAltContactNo}
                                    />
                                    <View style={line} />
                                </View>
                            </View>

                            <View style={{
                                flexDirection: 'column',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>
                                <Text style={inputLabel}>Email ID *</Text>
                                <TextInput
                                    ref={emailRef => {
                                        this.emailRef = emailRef;
                                    }}
                                    style={inputText}
                                    numberOfLines={1}
                                    returnKeyType="next"
                                    maxLength={50}
                                    onChangeText={text => {
                                        adhocStoreObject.travellerEmail = text
                                    }}
                                    value={adhocStoreObject.travellerEmail}
                                />
                                <View style={line} />
                            </View>

                            <View style={{
                                flexDirection: 'column',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>
                                <Text style={inputLabel}>Gender *</Text>
                                <RadioButton.Group onValueChange={value => {
                                    adhocStoreObject.travellerGender = value
                                }} value={adhocStoreObject.travellerGender}>
                                    <RadioButton.Item labelStyle={inputText} color="#000" label="Male" value="M" />
                                    <RadioButton.Item labelStyle={inputText} color="#000" label="Female" value="F" />
                                </RadioButton.Group>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>
                                {this._renderBU(adhocStoreObject)}

                                {this._renderSubBU(adhocStoreObject)}
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>
                                {this._renderCountry(adhocStoreObject)}

                                <View style={{
                                    flexDirection: 'column',
                                    width: '48%'
                                    // marginHorizontal: 16,
                                    // marginVertical: 8
                                }}>
                                    <Text style={inputLabel}>Nationality *</Text>
                                    <TextInput
                                        ref={nationalityRef => {
                                            this.nationalityRef = nationalityRef;
                                        }}
                                        style={inputText}
                                        numberOfLines={1}
                                        returnKeyType="next"
                                        onChangeText={text => {
                                            adhocStoreObject.travellerNationality = text
                                        }}
                                        value={adhocStoreObject.travellerNationality}
                                    />
                                    <View style={line} />
                                </View>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginHorizontal: 16,
                                marginVertical: 8,
                                marginBottom: 50
                            }}>
                                {this._renderSource(adhocStoreObject)}

                                {this._renderDestination(adhocStoreObject)}
                            </View>
                        </View>
                    </ScrollView>

                    <TouchableDebounce
                        style={buttonStyle}
                        onPress={() => {
                            if (adhocStoreObject.isLoading) return;

                            if (adhocStoreObject.travellerBU === Select) {
                                Alert.alert(this.state.title, "Please select BU");
                                return;
                            // } else if (adhocStoreObject.travellerSelected === Select) {
                            //     Alert.alert(this.state.title, "Please select a traveller type");
                            //     return;
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
                            } else if (!adhocStoreObject.travellerNationality) {
                                Alert.alert('Travel Desk', "Please enter nationality");
                                return;
                            } else if (!adhocStoreObject.travellerGender) {
                                Alert.alert('Travel Desk', "Please select gender");
                                return;
                            } else if (adhocStoreObject.fromSelected == Select) {
                                Alert.alert('Travel Desk', "Please select pickup");
                                return;
                            } else if (adhocStoreObject.toSelected == Select) {
                                Alert.alert('Travel Desk', "Please select drop");
                                return;
                            }
                            // adhocStoreObject.setTravellerWaypoints();
                            adhocStoreObject.addTraveller();
                            
                            this.props.navigation.navigate('TravelDeskMetadata');
                        }}
                    >
                        {adhocStoreObject.isLoading ? (
                            <ActivityIndicator color={colors.WHITE} animating={true} />
                        ) : (
                            <Text style={bottomButton}>
                                NEXT
                            </Text>
                        )}

                    </TouchableDebounce>
                </SafeAreaView>
        );
    }

}

const line = {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 0.25,
    backgroundColor: colors.GRAY,
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

const titleStyle = {
    fontFamily: "Helvetica",
    fontSize: 16,
    fontWeight: '900',
    textAlign: "left",
    color: colors.BLACK,
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

const itemName = {
    fontSize: 16,
    fontWeight: '500',
    color: colors.BLACK,
    // borderBottomWidth: 1,
    // borderBottomColor: colors.GRAY
};

const inputLabel = {
    fontFamily: "Helvetica",
    fontSize: 13,
    textAlign: "left",
    color: colors.GRAY
};

const inputText = {
    fontFamily: "Helvetica",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "left",
    color: colors.BLACK,
    padding: 5
};

const autocompleteContainer = {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1
};

export default TravelDeskTraveller;