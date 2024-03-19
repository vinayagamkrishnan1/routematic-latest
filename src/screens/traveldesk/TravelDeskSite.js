import React, { Component } from "react";
import { Text, } from "native-base";
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    View
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../utils/Colors";
import { inject, observer } from "mobx-react";
import {
    _renderListInput,
    _renderWeeklyOff
} from "../roster/customeComponent/customComponent";
import TouchableDebounce from "../../utils/TouchableDebounce";
import {
    _renderCountry,
    _renderDate,
    _renderOffice,
    _renderTitleContent
} from "../roster/customeComponent/customComponent";
import { API } from "../../network/apiFetch/API";
import { URL } from "../../network/apiConstants";
import { TYPE } from "../../model/ActionType";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import { Select, asyncString } from "../../utils/ConstantString";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { adhocType } from "../adhoc/AdhocLanding";
import { Button } from "react-native-paper";

@inject("adhocStore")
@observer
class TravelDeskSite extends Component {

    constructor(props) {
        super(props);
        this.state = ({
            title: "",
            type: adhocType.travelDesk
        });
        this.props.adhocStore.resetStore();
        this.props.adhocStore.setInitAdhoc(this, false, 'TravelDesk');
    }

    _renderAdhocType (store) {
        return (
            <View style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 10,
                }}>
                    <View style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginHorizontal: 16
                    }}>
                        <Button 
                        mode="contained"
                        style={{
                            flex: 0.5,
                            borderRadius: 5,
                            marginRight: 5
                        }} 
                        buttonColor={this.state.type === adhocType.login ? colors.BLUE : colors.GRAY_1} 
                        onPress={() => {
                            // this.setState({ type: adhocType.login, selectedValue: undefined });
                            store.setTripType(adhocType.login);
                            this.props.navigation.replace("AdhocLanding", {
                                title: "Adhoc",
                                type: adhocType.login
                            });
                        }}
                        uppercase>
                            <Text style={{
                                fontSize: 10,
                                fontWeight: '900',
                                color: this.state.type === adhocType.login ? colors.WHITE : colors.BLACK
                            }}>{adhocType.login}</Text>
                        </Button>
                        <Button 
                        mode="contained"
                        style={{
                            flex: 0.5,
                            borderRadius: 5,
                            marginLeft: 5
                        }} 
                        buttonColor={this.state.type === adhocType.logout ? colors.BLUE : colors.GRAY_1} 
                        onPress={() => {
                            // this.setState({ type: adhocType.logout, selectedValue: undefined });
                            store.setTripType(adhocType.logout);
                            this.props.navigation.replace("AdhocLanding", {
                                title: "Adhoc",
                                type: adhocType.logout
                            });
                        }}
                        uppercase>
                            <Text style={{
                                fontSize: 10,
                                fontWeight: '900',
                                color: this.state.type === adhocType.logout ? colors.WHITE : colors.BLACK
                            }}>{adhocType.logout}</Text>
                        </Button>
                    </View>

                    <View style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 10,
                        marginHorizontal: 16
                    }}>
                        <Button 
                        mode="contained"
                        style={{
                            flex: 0.5,
                            borderRadius: 5,
                            marginRight: 5
                        }} 
                        buttonColor={this.state.type === adhocType.nonShift ? colors.BLUE : colors.GRAY_1} 
                        onPress={() => {
                            store.setTripType(adhocType.nonShift);
                            this.props.navigation.replace("Adhoc", {
                                title: "Non Shift Adhoc"
                            });
                        }}
                        uppercase>
                            <Text style={{
                                fontSize: 10,
                                fontWeight: '900',
                                color: this.state.type === adhocType.nonShift ? colors.WHITE : colors.BLACK
                            }}>{adhocType.nonShift}</Text>
                        </Button>
                        <Button 
                        mode="contained"
                        style={{
                            flex: 0.5,
                            borderRadius: 5,
                            marginLeft: 5
                        }} 
                        buttonColor={this.state.type === adhocType.travelDesk ? colors.BLUE : colors.GRAY_1} 
                        onPress={() => {
                            // this.setState({ type: adhocType.travelDesk, selectedValue: undefined });
                            // store.setTripType(adhocType.travelDesk);
                            // this.props.navigation.replace("TravelDeskSite", {
                            //     title: "Travel Request"
                            // });
                        }}
                        uppercase>
                            <Text style={{
                                fontSize: 10,
                                fontWeight: '900',
                                color: this.state.type === adhocType.travelDesk ? colors.WHITE : colors.BLACK
                            }}>{adhocType.travelDesk}</Text>
                        </Button>
                    </View>
            </View>
        )
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
                            sites: this.props.adhocStore.Sites,
                            onSiteSelected: this.onSiteSelected.bind(this),
                        });
                    }}
                >
                    {_renderListInput("Site *", store.siteSelected)}
                </TouchableDebounce>
            </View>
        )
    }

    _renderProgramType(store) {
        return (
            <View style={{
                marginHorizontal: 16,
                marginVertical: 8
            }}>
                <TouchableDebounce
                    onPress={() => {
                        if (store.siteSelected !== "Select") {
                            this.props.navigation.navigate("ProgramSelector", {
                                selectedItem: store.programSelected,
                            });
                        } else {
                            Alert.alert(this.state.title, "Please select a site");
                        }
                    }}
                >
                    {_renderListInput("Programs *", store.programSelected)}
                </TouchableDebounce>
            </View>
        )
    }

    _renderTermsCons(Store) {
        return (
            <View
                style={{
                    flexDirection: "row",
                    marginHorizontal: 16,
                    marginVertical: 8
                }}
            >
                <FontAwesome
                    style={{
                        marginRight: 5,
                    }}
                    name={Store.agreedTC ? "check-square-o" : "square-o"}
                    size={30}
                    color={colors.BLACK}
                    onPress={() => {
                        if (Store.programSelected != Select) { //  && Store.programTermsCons?.length > 0
                            Store.agreeTC();
                        } else {
                            Alert.alert(this.state.title, "Please select a program type");
                        }
                    }}
                />
                <Text style={{
                    fontFamily: "Helvetica",
                    fontSize: 13,
                    textAlign: "left",
                    color: colors.GRAY,
                    marginLeft: 10
                }}>I agree the </Text>
                <TouchableDebounce
                onPress={() => {
                    if (Store.programSelected != Select && Store.programTermsCons?.length > 0) {
                        this.props.navigation.navigate('TravelDeskTermsAndCons', {
                            termscons: Store.programTermsCons
                        })
                    }
                }}
                >
                <Text style={{
                    fontFamily: "Helvetica",
                    fontSize: 14,
                    fontWeight: '500',
                    textDecorationLine: 'underline',
                    color: colors.BLUE,
                }}>terms and conditions </Text>
                </TouchableDebounce>
            </View>
        )
    }

    onSiteSelected(_site) {
        this.props.adhocStore.setSite(_site.SiteName);
    }

    componentDidMount() {

        if (this.state.title.toString().length <= 0) {
            let title = this.props.route.params.title;
            this.setState({ title });
        }

        AsyncStorage.multiGet(
            [
                asyncString.ACCESS_TOKEN,
                asyncString.USER_ID,
                asyncString.DTOKEN,
                asyncString.CAPI,
                asyncString.IdleTimeOutInMins,
                asyncString.UserName
            ],
            (err, savedData) => {
                this.setState({
                    access_token: savedData[0][1],
                    UserId: savedData[1][1],
                    DToken: savedData[2][1],
                    CustomerUrl: savedData[3][1],
                    IdleTimeOutInMins: parseInt(savedData[4][1]),
                    guestName: savedData[5][1]
                });
                this.getUserDetails(savedData[0][1], savedData[1][1], savedData[3][1]);
            }
        );
    }

    getUserDetails(access_token) {
        this.setState({
            isLoading: true
        });
        API.newFetchXJSON(
            URL.GET_USER_DETAILS,
            access_token,
            this.callback.bind(this),
            TYPE.GET_USER_DETAILS
        );
    }

    callback = async (actionType, response) => {
        const { navigate } = this.props.navigation;
        switch (actionType) {
            case TYPE.GET_USER_DETAILS: {
                handleResponse.userDetails(await response, this, navigate);
                break;
            }
        }

        console.warn('Callback state updated ', this.state);
        this.props.adhocStore.setDefaultSite(this.state);
        this.props.adhocStore.setDefaultEmployee(this.state);
        console.warn('BU Site updated in store ', this.props.adhocStore.businessID, '    ', this.props.adhocStore.siteID);
    };

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
                            {this._renderAdhocType(adhocStoreObject)}

                            <View style={{ marginTop: 20 }} />
                            {adhocStoreObject.isSiteVisible && this._renderSite(adhocStoreObject) }
                            
                            {this._renderProgramType(adhocStoreObject)}

                            {this._renderTermsCons(adhocStoreObject)}
                        </View>
                    </ScrollView>
                    <TouchableDebounce
                        style={buttonStyle}
                        onPress={() => {
                            if (adhocStoreObject.isLoading) return;

                            if (adhocStoreObject.programSelected == Select) {
                                Alert.alert(this.state.title, "Please select a program type");
                                return;
                            } else if (!adhocStoreObject.agreedTC) {
                                Alert.alert(this.state.title, "Please accept terms and conditions");
                                return;
                            }
                            this.props.navigation.navigate('TravelDeskSponsor');
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
const bottomButton = {
    color: colors.WHITE,
    fontWeight: "500",
    fontSize: 20
};
const viewContainer = {
    flex: 1,
    backgroundColor: colors.WHITE,
    flexDirection: "column"
};
export default TravelDeskSite;