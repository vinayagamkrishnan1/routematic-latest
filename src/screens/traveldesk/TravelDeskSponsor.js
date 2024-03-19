import React, { Component } from "react";
import { Text, } from "native-base";
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    TextInput,
    View
} from 'react-native';
import { colors } from "../../utils/Colors";
import { inject, observer } from "mobx-react";
import {
    _renderListInput,
    _renderWeeklyOff
} from "../roster/customeComponent/customComponent";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import TouchableDebounce from "../../utils/TouchableDebounce";
import {
    _renderCountry,
    _renderDate,
    _renderTitleContent
} from "../roster/customeComponent/customComponent";
import { Select } from "../../utils/ConstantString";

@inject("adhocStore")
@observer
class TravelDeskSponsor extends Component {

    constructor(props) {
        super(props);
        this.state = ({
            title: "",
        });
    }

    _renderSponsorAsMe(Store) {
        return (
            <View
                style={{
                    flexDirection: "row",
                    marginHorizontal: 16,
                    marginVertical: 16
                }}
            >
                <FontAwesome
                    style={{
                        marginRight: 5,
                    }}
                    name={Store.iamSponsor ? "check-square-o" : "square-o"}
                    size={30}
                    color={colors.BLACK}
                    onPress={() => {
                        Store.setMeAsSponsor();
                    }}
                />
                <Text style={{
                    fontFamily: "Helvetica",
                    fontSize: 13,
                    textAlign: "left",
                    color: colors.GRAY,
                    marginLeft: 10
                }}>Sponsor same as me</Text>
            </View>
        )
    }

    _renderSite(store) {
        return (
            <View style={{
                width: '48%'
                // marginHorizontal: 16,
                // marginVertical: 8
            }}>
                <TouchableDebounce
                    onPress={() => {
                        this.props.navigation.navigate("SiteSelector", {
                            selectedItem: store.sponsorSite,
                            sites: this.props.adhocStore.Sites,
                            onSiteSelected: this.onSiteSelected.bind(this),
                        });
                    }}
                >
                    {_renderListInput("Site *", store.sponsorSite)}
                </TouchableDebounce>
            </View>
        )
    }

    _renderOffice(store) {
        return (
            <View style={{
                width: '48%'
                // marginHorizontal: 16,
                // marginVertical: 8
            }}>
                <TouchableDebounce
                    onPress={() => {
                        this.props.navigation.navigate("OfficeSelector", {
                            selectedItem: store.sponsorOffice,
                            offices: store.Offices,
                            onOfficeSelected: this.onOfficeSelected.bind(this),
                        });
                    }}
                >
                    {_renderListInput("Office Location *", store.sponsorOffice)}
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
                            selectedItem: store.sponsorBU,
                            businesses: store.Businesses,
                            onBusinessSelected: this.onBusinessSelected.bind(this),
                        });
                    }}
                >
                    {_renderListInput("BU *", store.sponsorBU)}
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
                    {_renderListInput("Sub BU", store.subbuSelected)}
                </TouchableDebounce>
            </View>
        )
    }

    _renderCostCenter = (store) => {
        return (
            <View style={{
                width: '48%'
                // marginHorizontal: 16,
                // marginVertical: 8
            }}>
                <TouchableDebounce
                    onPress={() => {
                        this.props.navigation.navigate("TDCostCenterSelector", {
                            selectedValue: store.sponsorCostCenter,
                            costCenters: store.CostCenters,
                            onCostCenterSelected: this.onCostCenterSelected.bind(this),
                        });
                    }}
                >
                    {_renderListInput("Cost Center *", store.sponsorCostCenter)}
                </TouchableDebounce>
            </View>
        )
    };

    onSiteSelected(_site) {
        console.warn(_site);
        this.props.adhocStore.sponsorSiteId = _site.SiteID;
        this.props.adhocStore.sponsorSite = _site.SiteName;
    }

    onOfficeSelected(_office) {
        console.warn(_office);
        this.props.adhocStore.sponsorOfficeId = _office.officeLocationID;
        this.props.adhocStore.sponsorOffice = _office.officeLocationName;
    }

    onBusinessSelected(_bu) {
        console.warn(_bu);
        this.props.adhocStore.sponsorBUId = _bu.Id;
        this.props.adhocStore.sponsorBU = _bu.Name;
    }

    onCostCenterSelected(_cc) {
        console.warn(_cc);
        this.props.adhocStore.sponsorCostCenterId = _cc.CostCenterID;
        this.props.adhocStore.sponsorCostCenter = _cc.Name;
    }

    componentDidMount() {

    }

    render() {
        const adhocStoreObject = this.props.adhocStore;
        adhocStoreObject.businessID = this.state.businessID;
        adhocStoreObject.siteID = this.state.siteID;
        return (
                <SafeAreaView
                    style={{ flex: 1, backgroundColor: colors.WHITE, paddingTop: Platform.OS === 'ios' ? 20 : 0 }}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.BLUE}
                        barStyle="dark-content"
                    />
                    <ScrollView style={{ marginBottom: 50 }}>
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

                            {this._renderSponsorAsMe(adhocStoreObject)}

                            <View style={{
                                flexDirection: 'row',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>
                                <Text style={titleStyle}>Sponsor Details</Text>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>
                                <TouchableDebounce
                                style={{
                                    width: '35%'
                                }}
                                onPress={() => {
                                    if (!adhocStoreObject.iamSponsor) {
                                        this.props.navigation.navigate("EmployeeSelector", {
                                            selectedValue: '',
                                            dataFor: 'SPONSOR'
                                        });
                                    }
                                }}
                                >
                                <View style={{
                                    flexDirection: 'column',
                                    width: '100%'
                                    // marginHorizontal: 16,
                                    // marginVertical: 8
                                }}>
                                    <Text style={inputLabel}>Employee No. *</Text>
                                    <TextInput
                                        ref={noRef => {
                                            this.noRef = noRef;
                                        }}
                                        style={inputText}
                                        numberOfLines={1}
                                        maxLength={20}
                                        placeholder="Search here"
                                        returnKeyType="next"
                                        editable={false}
                                        // onChangeText={text => {
                                        //     adhocStoreObject.sponsorNumber = text
                                        // }}
                                        value={adhocStoreObject.sponsorNumber}
                                    />
                                    <View style={line} />
                                </View>
                                </TouchableDebounce>

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
                                            adhocStoreObject.sponsorName = text
                                        }}
                                        value={adhocStoreObject.sponsorName}
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
                                        ref={cnoRef => {
                                            this.cnoRef = cnoRef;
                                        }}
                                        style={inputText}
                                        numberOfLines={1}
                                        maxLength={10}
                                        returnKeyType="next"
                                        onChangeText={text => {
                                            adhocStoreObject.sponsorContactNo = text
                                        }}
                                        value={adhocStoreObject.sponsorContactNo}
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
                                        ref={acnoRef => {
                                            this.acnoRef = acnoRef;
                                        }}
                                        style={inputText}
                                        numberOfLines={1}
                                        maxLength={10}
                                        returnKeyType="next"
                                        onChangeText={text => {
                                            adhocStoreObject.sponsorAltContactNo = text
                                        }}
                                        value={adhocStoreObject.sponsorAltContactNo}
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
                                    maxLength={50}
                                    returnKeyType="next"
                                    onChangeText={text => {
                                        adhocStoreObject.sponsorEmail = text
                                    }}
                                    value={adhocStoreObject.sponsorEmail}
                                />
                                <View style={line} />
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>
                                {/* <View style={{
                                    flexDirection: 'column',
                                    width: '48%'
                                    // marginHorizontal: 16,
                                    // marginVertical: 8
                                }}>
                                    <Text style={inputLabel}>Site *</Text>
                                    <TextInput
                                        ref={siteRef => {
                                            this.siteRef = siteRef;
                                        }}
                                        style={inputText}
                                        numberOfLines={1}
                                        maxLength={50}
                                        returnKeyType="next"
                                        onChangeText={text => {
                                            adhocStoreObject.sponsorSite = text
                                        }}
                                        value={adhocStoreObject.sponsorSite}
                                    />
                                    <View style={line} />
                                </View>

                                <View style={{
                                    flexDirection: 'column',
                                    width: '48%'
                                    // marginHorizontal: 16,
                                    // marginVertical: 8
                                }}>
                                    <Text style={inputLabel}>Office Location *</Text>
                                    <TextInput
                                        ref={officeRef => {
                                            this.officeRef = officeRef;
                                        }}
                                        style={inputText}
                                        numberOfLines={1}
                                        maxLength={50}
                                        returnKeyType="next"
                                        onChangeText={text => {
                                            adhocStoreObject.sponsorOffice = text
                                        }}
                                        value={adhocStoreObject.sponsorOffice}
                                    />
                                    <View style={line} />
                                </View> */}

                                {this._renderSite(adhocStoreObject)}

                                {this._renderOffice(adhocStoreObject)}
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>
                                {/* <View style={{
                                    flexDirection: 'column',
                                    width: '48%'
                                    // marginHorizontal: 16,
                                    // marginVertical: 8
                                }}>
                                    <Text style={inputLabel}>BU *</Text>
                                    <TextInput
                                        ref={buRef => {
                                            this.buRef = buRef;
                                        }}
                                        style={inputText}
                                        numberOfLines={1}
                                        maxLength={50}
                                        returnKeyType="next"
                                        onChangeText={text => {
                                            adhocStoreObject.sponsorBU = text
                                        }}
                                        value={adhocStoreObject.sponsorBU}
                                    />
                                    <View style={line} />
                                </View>

                                <View style={{
                                    flexDirection: 'column',
                                    width: '48%'
                                    // marginHorizontal: 16,
                                    // marginVertical: 8
                                }}>
                                    <Text style={inputLabel}>Cost Center *</Text>
                                    <TextInput
                                        ref={ccRef => {
                                            this.ccRef = ccRef;
                                        }}
                                        style={inputText}
                                        numberOfLines={1}
                                        maxLength={50}
                                        returnKeyType="done"
                                        onChangeText={text => {
                                            adhocStoreObject.sponsorCostCenter = text
                                        }}
                                        value={adhocStoreObject.sponsorCostCenter}
                                    />
                                    <View style={line} />
                                </View> */}
                                {this._renderBU(adhocStoreObject)}

                                {this._renderCostCenter(adhocStoreObject)}
                            </View>
                        </View>
                    </ScrollView>

                    <TouchableDebounce
                        style={buttonStyle}
                        onPress={() => {
                            if (adhocStoreObject.isLoading) return;

                            if (!adhocStoreObject.sponsorNumber && adhocStoreObject.iamSponsor) {
                                Alert.alert(this.state.title, "Please enter sponsor number");
                                return;
                            } else if (!adhocStoreObject.sponsorName) {
                                Alert.alert('Travel Desk', "Please enter name");
                                return;
                            } else if (!adhocStoreObject.sponsorEmail) {
                                Alert.alert('Travel Desk', "Please enter email");
                                return;
                            } else if (!adhocStoreObject.sponsorContactNo) {
                                Alert.alert('Travel Desk', "Please enter contact no");
                                return;
                            } else if (adhocStoreObject.sponsorSite == Select) {
                                Alert.alert('Travel Desk', "Please select site");
                                return;
                            } else if (adhocStoreObject.sponsorOffice == Select) {
                                Alert.alert('Travel Desk', "Please select office");
                                return;
                            } else if (adhocStoreObject.sponsorBU == Select) {
                                Alert.alert('Travel Desk', "Please select business unit");
                                return;
                            } else if (adhocStoreObject.sponsorCostCenter == Select) {
                                Alert.alert('Travel Desk', "Please select cost center");
                                return;
                            }

                            this.props.navigation.navigate('TravelDeskTraveller');
                        }}
                    >
                        {adhocStoreObject.isLoading ? (
                            <ActivityIndicator color={colors.WHITE} animating={true} />
                        ) : (
                            <Text style={bottomButton}>NEXT</Text>
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
export default TravelDeskSponsor;