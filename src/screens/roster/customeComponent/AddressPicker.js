import React, {Component} from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {colors} from "../../../utils/Colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import TouchableDebounce from "../../../utils/TouchableDebounce";
import {API} from "../../../network/apiFetch/API";
import {URL} from "../../../network/apiConstants";
import {handleResponse} from "../../../network/apiResponse/HandleResponse";
import {Button, Input, Item} from "native-base";
import {asyncString} from "../../../utils/ConstantString";
import PleaseWaitLoader from "../../../network/loader/PleaseWaitLoader";
import {TYPE} from "../../../model/ActionType";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import _ from "lodash";
import { CryptoXor } from "crypto-xor";

class AddressPicker extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            headerStyle: {display: "none"}
        };
    };
    state = {
        isLoading: true,
        access_token: "",
        UserId: "",
        CustomerUrl: "",
        showAddNickName: false,
        nickName: "",
        selectLat: "",
        selectLng: "",
        type: "from",
        showOtherLocation: false,
        text: "",
        selectedLocation: "",
        MaxOtherLocationCount: 0,
        data: [
            {
                Name: ""
            }
        ],
        newLocation: {},
        RestrictToPOI: ""
    };
    callback = async (actionType, response) => {
        switch (actionType) {
            case TYPE.ADD_CUSTOM_LOCATION: {
                handleResponse.saveEmployeeLocation(
                    response,
                    this,
                    this.state.type,
                    this.state.nickName,
                    true
                );
                break;
            }
        }
    };

    UNSAFE_componentWillMount() {
        let Locations = this.props.route.params.Locations;
        let RestrictToPOI = this.props.route.params.RestrictToPOI;
        let type = this.props.route.params.type;
        let MaxOtherLocationCount = this.props.route.params.MaxOtherLocationCount;
        let showOtherLocation = this.props.route.params.showOtherLocation;
        let selectedLocation = this.props.route.params.selected;
        this.setState({
            type,
            data: Locations,
            selectedLocation,
            showOtherLocation,
            RestrictToPOI,
            MaxOtherLocationCount
        });
    }

    componentDidMount() {
        setTimeout(() => {
            AsyncStorage.multiGet(
                [asyncString.ACCESS_TOKEN, asyncString.USER_ID, asyncString.CAPI],
                (err, savedData) => {
                    this.setState({
                        access_token: CryptoXor.decrypt(savedData[0][1], asyncString.ACCESS_TOKEN), // savedData[0][1],
                        UserId: savedData[1][1],
                        CustomerUrl: savedData[2][1],
                        isLoading: false
                    });
                }
            );
        }, 100);
    }

    goToLocationPicker(type) {
        if (this.state.nickName) this.setState({nickName: ""});
        this.props.navigation.navigate("MapPicker", {
            getLocationPicker: this.getLocationPicker.bind(this),
            type: type,
            region: this.props.route.params.region
        });
    }

    getLocationPicker(selectedLocation, selectLat, selectLng, type) {
        this.setState({
            showAddNickName: true,
            type,
            selectedLocation,
            selectLat,
            selectLng
        });
    }

    nickNameChangeHandler(text) {
        if (text) {
            this.setState({
                nickName: text
            });
        } else {
            this.setState({
                nickName: ""
            });
        }
    }

    saveEmployeeLocation(NickName, Latitude, Longitude, Location) {
        if (!NickName) {
            Alert.alert("Add location", "Place name cannot be blank");
            return;
        }
        let body = {
            DeviceID: this.state.UserId,
            NickName,
            Latitude,
            Longitude,
            Location
        };
        this.setState({isLoading: true});
        API.newFetchJSON(
            this.state.CustomerUrl + URL.SAVE_LOCATION,
            body,
            true,
            this.callback.bind(this),
            TYPE.ADD_CUSTOM_LOCATION
        );

    }

    render() {
        let offices = this.state.data.filter(
            word =>
                word &&
                word.Name &&
                word.Name.toUpperCase().includes(this.state.text.toUpperCase())
        );
        if (this.state.isLoading) return <PleaseWaitLoader/>;
        let count = 0;
        for (let i = 0; i < offices.length; i++) {
            if (offices[i].ID !== "H" && offices[i].ID !== "O") {
                count++;
            }
        }
        console.warn("RestrictToPOI "+this.state.RestrictToPOI);
        if (!this.state.showAddNickName) {
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
                                onPress={() => {
                                    this.props.navigation.goBack()
                                }}
                            />
                            <Text
                                style={{
                                    fontFamily: "Helvetica",
                                    fontSize: 18,
                                    marginLeft: 5,
                                    color: colors.BLACK
                                }}
                            >
                                {`Select ${this.state.type} Location`}
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
                                    placeholder={"Search..."}
                                    underlineColorAndroid="transparent"
                                    autoCapitalize="none"
                                    multiline={false}
                                    autoCorrect={false}
                                    numberOfLines={1}
                                    returnKeyType="next"
                                />
                            </View>
                        </View>
                        {this.state.showOtherLocation && (count) < this.state.MaxOtherLocationCount && (
                            <TouchableDebounce
                                style={{
                                    borderColor: colors.BLACK,
                                    borderWidth: 0.5,
                                    backgroundColor: colors.BACKGROUND,
                                    height: 50,
                                    width: "100%",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}
                                onPress={() => this.goToLocationPicker(this.state.type)}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                >
                                    <Ionicons
                                        name="ios-add"
                                        style={{
                                            fontSize: 25,
                                            marginRight: 20,
                                            color: colors.BLACK,
                                            fontFamily: "Helvetica"
                                        }}
                                    />
                                    <Text style={{color: colors.BLACK}}>Tap to add other location</Text>
                                    <Ionicons
                                        name="chevron-forward"
                                        style={{
                                            fontSize: 25,
                                            marginLeft: 20,
                                            color: colors.BLACK,
                                            fontFamily: "Helvetica"
                                        }}
                                    />
                                </View>
                            </TouchableDebounce>
                        )}
                        <ScrollView keyboardShouldPersistTaps='always'
                                    contentContainerStyle={{paddingBottom: 80}}>
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
                                {offices.map((Item, index) => {
                                    let isSelected = this.state.selectedLocation === Item.Name;
                                    if (Item.Name !== "Others")
                                        return (
                                            <React.Fragment>
                                                <TouchableDebounce
                                                    key={index}
                                                    style={viewNotSelectedStyle}
                                                    onPress={() => {
                                                        this.setState({
                                                            ...this.state,
                                                            selectedLocation: Item.Name
                                                        });
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
                                                        {this.state.RestrictToPOI === 1
                                                            ? Item.ID === "H"
                                                                ? Item.Name + "-Nodal"
                                                                : Item.Name
                                                            : Item.Name}
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
                        <TouchableDebounce
                            style={{
                                backgroundColor: colors.BLUE_BRIGHT,
                                height: 50,
                                width: "100%",
                                justifyContent: "center",
                                alignItems: "center",
                                bottom: 0,
                                position: "absolute"
                            }}
                            onPress={() => {
                                this.mergeLocationWithRoster(this.state.newLocation)
                            }}
                        >
                            <View style={{flexDirection: "row"}}>
                                <Text style={{color: colors.WHITE, fontWeight: "700"}}>
                                    Confirm
                                </Text>
                            </View>
                        </TouchableDebounce>
                    </View>
                </SafeAreaView>
            );
        } else
            return (
                <View
                    style={{
                        height: "100%",
                        backgroundColor: "white",
                        padding: 22,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 4,
                        borderColor: "rgba(0, 0, 0, 0.1)"
                    }}
                >
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                    <KeyboardAvoidingView
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                        behavior="padding"
                        enabled
                    >
                        <Text style={{fontSize: 25, color: colors.BLACK}}>Set nick name for this place</Text>
                        <View rounded style={{width: "100%", marginTop: 20}}>
                            <Input
                                maxLength={15}
                                style={{color: colors.BLACK, height: 50, width: "80%"}}
                                placeholder={"Enter nick name under 15 character"}
                                placeholderStyle={{color: colors.GRAY, fontSize: 10}}
                                underlineColorAndroid="transparent"
                                autoCapitalize="none"
                                autoCorrect={false}
                                numberOfLines={1}
                                returnKeyType="next"
                                onChangeText={text => this.nickNameChangeHandler(text)}
                                value={this.state.nickName}
                                blurOnSubmit={true}
                            />
                        </View>

                        <Button
                            full
                            success
                            onPress={() => {
                                if (this.state.nickName.trim() !== "") {
                                    if (this.state.data.filter(e => e.Name === this.state.nickName.trim()).length > 0) {
                                        Alert.alert("Duplicate Name", "Name already Exist");
                                    } else {
                                        this.saveEmployeeLocation(
                                            this.state.nickName,
                                            this.state.selectLat,
                                            this.state.selectLng,
                                            this.state.selectedLocation,
                                            true
                                        );
                                    }
                                } else {
                                    alert("Nick Name cannot be blank");
                                }
                            }}
                            style={{marginTop: 10, backgroundColor: colors.GREEN}}
                        >
                            <Text style={{color: colors.WHITE, fontWeight: "500"}}>
                                Add
                            </Text>
                        </Button>
                        <Button
                            full
                            danger
                            onPress={() => {
                                this.setState({
                                    visibleModal: false,
                                    showAddNickName: false
                                });
                            }}
                            style={{marginTop: 10, backgroundColor: colors.RED}}
                        >
                            <Text style={{color: colors.WHITE, fontWeight: "500"}}>
                                Cancel
                            </Text>
                        </Button>
                    </KeyboardAvoidingView>
                </View>
            );
    }

    mergeLocationWithRoster(newLocation) {
        !_.isEmpty(newLocation) &&
        this.props.route.params.addNewLocation(newLocation);
        this.props.route.params.setLocation(this.state.selectedLocation);
        this.props.navigation.goBack();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: colors.WHITE
    }
});

export default AddressPicker;
const viewSelectedStyle = {
    borderRadius: 30,
    padding: 5,
    backgroundColor: colors.BLUE_BRIGHT,
    margin: 5,
    justifyContent: "center",
    alignItems: "center"
};
const viewNotSelectedStyle = {
    width: "100%",
    //borderWidth: 1,
    //borderRadius: 30,
    //borderColor: colors.GRAY,
    padding: 5,
    borderStyle: "solid",
    margin: 5,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row"
};
