import React, { Component } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    NativeModules,
    PanResponder,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { colors } from "../../utils/Colors";
import { spinner } from "../../network/loader/Spinner";
import { Button, Input, Item, Text } from "native-base";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { loginString, setupMandatoryFields, setupPin } from "../../utils/ConstantString";
import { API } from "../../network/apiFetch/API";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import { URL } from "../../network/apiConstants/index";
import moment from "moment";
import axios from "axios";
import TouchableDebounce from "../../utils/TouchableDebounce";

const GoogleKeyManager = NativeModules.GoogleKeyManager;

export default class UserMandatoryData extends Component {
    static navigationOptions = {
        headerStyle: { display: "none" },
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            contactNo1: undefined,
            gender: undefined,
            genderValue: undefined,
            pickupLocationData: [],
            pickupLocationID: undefined,
            pickupLocationName: undefined,
            dropLocationData: [],
            dropLocationID: undefined,
            dropLocationName: undefined,
            seededByEmp: [],
            registrationToken: "",
            //Initializing Prev.Page constants & Setting in ViewDidMount
            Password: "",
            SiteLat: "",
            SiteLong: "",
            GeoCode: "",
            Hadd: "",
            HomeLat: "",
            HomeLong: "",
            Url: "",
            pin: undefined,
            selectedValue: ""
        };
    }

    UNSAFE_componentWillMount() {
        this._panResponder = PanResponder.create({
            onMoveShouldSetPanResponderCapture: () => {
                return false;
            }
        });
        this.subs = [
            this.props.navigation.addListener("focus", () =>
                this.setState({ isUserProfile: true })
            ),
            this.props.navigation.addListener("blur", () =>
                this.setState({ isUserProfile: false })
            )
        ];
        this.image = (<Image
            style={{ width: 120, height: 120, borderRadius: 60, borderColor: colors.BLUE }}
            source={{
                uri: 'https://homepages.cae.wisc.edu/~ece533/images/girl.png'
            }}
        />);
    }

    componentDidMount() {
        if (this.props.route.params) {
            const {
                password,
                SiteLat,
                SiteLong,
                GeoCode,
                Hadd,
                HomeLat,
                HomeLong,
                Url,
                clusterDetails,
                seededByEmp,
                registrationToken,
                pin
            } = this.props.route.params;
            this.setState({
                Password: password,
                Url,
                SiteLat,
                SiteLong,
                GeoCode,
                Hadd,
                HomeLat,
                HomeLong,
                clusterDetails,
                seededByEmp,
                registrationToken,
                pin
            });
            if (seededByEmp.includes('pickupLocation') || seededByEmp.includes('dropLocation') || seededByEmp.includes('pickupLocationName') || seededByEmp.includes('dropLocationName')) {
                this.setState({ isLoading: true });
                setTimeout(() => {
                    console.warn("Here i am in pickup/drop locations");
                    let url = URL.GET_REGISTRATION_LOCATIONS + registrationToken;
                    console.warn('locations API - ', url);
                    let header = {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    };
                    axios.get(url, {
                        headers: header
                    }).then(async response => {
                        if (response) {
                            console.warn('location api response - ', response);
                            let locationResponse = response.data;
                            let dropLocationData = locationResponse.data.filter(function (data) {
                                return data.tripTypeCode === "B" || data.tripTypeCode === "D";
                            });

                            let pickupLocationData = locationResponse.data.filter(function (data) {
                                return data.tripTypeCode === "B" || data.tripTypeCode === "P";
                            });
                            this.setState({
                                isLoading: false,
                                dropLocationData,
                                pickupLocationData
                            })
                        } else {
                            this.setState({ isLoading: false });
                            Alert.show('Routematic', loginString.somethingWentWrong);
                        }
                    }).catch(async error => {
                        this.setState({ isLoading: false });
                        if (error) {
                            Alert.show('Routematic', loginString.somethingWentWrong);
                        }
                    });
                }, 300);
            }
        } else {
            const seededByEmp = [
                "contactNo1",
                "gender",
                "latLong",
            ];
            this.setState({ seededByEmp });
        }
    }


    contactNo1ChangeHandler(text) {
        this.setState({
            contactNo1: text,
        });
    }


    setPickup(location) {
        this.setState({
            pickupLocationID: location.pickupDropPointID,
            pickupLocationName: location.pickupDropPointName,
        });
    }

    setDrop(location) {
        this.setState({
            dropLocationID: location.pickupDropPointID,
            dropLocationName: location.pickupDropPointName,
        });
    }

    setGender(genderValue) {
        console.warn('Selected gender ', genderValue);
        this.setState({ gender: genderValue === "Male" ? "M" : "F", genderValue: genderValue });
    }

    render() {
        const {
            contactNo1,
            pickupLocationName,
            pickupLocationData,
            dropLocationName,
            dropLocationData,
            validPin,
            inValidPin,
            validConfirmPin,
            inValidConfirmPin,
            genderValue,
        } = this.state;
        return (
            <View style={{ flex: 1, justifyContent: 'center' }} {...this._panResponder.panHandlers}>
                <StatusBar barStyle="dark-content" />
                {spinner.visible(this.state.isLoading)}
                <ImageBackground
                    source={require("../../assets/cp_background.jpg")}
                    defaultSource={require("../../assets/cp_background.jpg")}
                    resizeMethod="scale"
                    resizeMode="cover"
                    style={styles.fixed}
                />
                <View style={styles.container} {...this._panResponder.panHandlers}>
                    <View style={styles.top}>
                        <View style={styles.handleMargin}>
                            <Image
                                source={require("../../assets/routematic.png")}
                                defaultSource={require("../../assets/routematic.png")}
                                resizeMethod="scale"
                                resizeMode="cover"
                                style={styles.logo}
                            />
                        </View>
                    </View>
                    <Text style={styles.loginTxtUp}>{setupMandatoryFields.title}</Text>
                    <View style={{
                        width: "90%",
                        padding: "4%",
                        borderRadius: 10,
                        alignSelf: 'center',
                        alignContent: 'center',
                        shadowColor: colors.GRAY,
                        shadowOffset: {
                            width: 0,
                            height: 5
                        },
                        shadowRadius: 5,
                        shadowOpacity: 0.2
                    }}>
                        {this.state.seededByEmp.includes('contactNo1') && (
                            <View
                                success={validPin}
                                error={inValidPin}
                                style={[styles.inputText, {marginVertical: 15}]}
                            >
                                <Ionicons
                                    name="md-phone-portrait"
                                    style={[styles.vectorIconBlue, { marginRight: 8, marginLeft: 7 }]}
                                />
                                <Input
                                    style={{ color: colors.WHITE, flex: 1 }}
                                    placeholder={setupMandatoryFields.mobileNO}
                                    maxLength={10}
                                    borderWidth={0}
                                    fontSize={16}
                                    underlineColorAndroid="transparent"
                                    autoCorrect={false}
                                    keyboardType="numeric"
                                    returnKeyType="done"
                                    onChangeText={text => this.contactNo1ChangeHandler(text)}
                                    value={contactNo1}
                                />
                            </View>
                        )}
                        {this.state.seededByEmp.includes('gender') && (
                            <View
                                success={validConfirmPin}
                                error={inValidConfirmPin}
                                style={[styles.inputText, {marginVertical: 15}]}
                                onPress={() => {
                                    this.props.navigation.navigate('GenderSelector', {
                                        selectedItem: genderValue,
                                        setGender: this.setGender.bind(this),
                                    });
                                }}
                            >
                                <Icon type="MaterialCommunityIcons"
                                    name="gender-male-female"
                                    style={styles.vectorIconBlue}
                                />

                                {/* <TouchableOpacity
                                    onPress={() => {
                                        this.props.navigation.navigate('GenderSelector', {
                                            selectedItem: genderValue,
                                            setGender: this.setGender.bind(this),
                                        });
                                    }}> */}
                                    <Input
                                        style={{ color: '#FFFFFF', flex: 1 }}
                                        placeholder={setupMandatoryFields.gender}
                                        underlineColorAndroid="transparent"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        disabled={true}
                                        borderWidth={0}
                                        fontSize={16}
                                        onTouchStart={() => {
                                            this.props.navigation.navigate('GenderSelector', {
                                                selectedItem: genderValue,
                                                setGender: this.setGender.bind(this),
                                            });
                                        }}
                                        value={genderValue}
                                    />
                                {/* </TouchableOpacity> */}
                            </View>
                        )}

                        {this.state.seededByEmp.includes('pickupLocationName') && (
                            <TouchableOpacity
                            onPress={() => {
                                this.props.navigation.navigate('PickupLocationSelector', {
                                    selectedItem: pickupLocationName,
                                    data: pickupLocationData,
                                    setPickup: this.setPickup.bind(this),
                                });
                            }}>
                            <View
                                success={validConfirmPin}
                                error={inValidConfirmPin}
                                style={[styles.inputText, {marginVertical: 15}]}
                            >
                                <Ionicons
                                    name="md-locate"
                                    style={styles.vectorIconBlue}
                                />
                                
                                    <Input
                                        style={{ color: colors.WHITE, flex: 1 }}
                                        placeholder={setupMandatoryFields.pickupLocationID}
                                        underlineColorAndroid="transparent"
                                        autoCapitalize="none"
                                        autoComplete={false}
                                        autoCorrect={false}
                                        disabled={true}
                                        borderWidth={0}
                                        fontSize={16}
                                        onTouchStart={() => {
                                            this.props.navigation.navigate('PickupLocationSelector', {
                                                selectedItem: pickupLocationName,
                                                data: pickupLocationData,
                                                setPickup: this.setPickup.bind(this),
                                            });
                                        }}
                                        value={pickupLocationName}
                                    />
                            </View>
                            </TouchableOpacity>
                        )}
                        
                        {this.state.seededByEmp.includes('dropLocationName') && (
                            <TouchableOpacity
                                onPress={() => {
                                    this.props.navigation.navigate('DropLocationSelector', {
                                        selectedItem: dropLocationName,
                                        data: dropLocationData,
                                        setDrop: this.setDrop.bind(this),
                                    });
                                }}>
                                <View
                                    success={validConfirmPin}
                                    error={inValidConfirmPin}
                                    style={[styles.inputText, {marginVertical: 15}]}
                                >
                                    <Ionicons
                                        name="md-locate"
                                        style={styles.vectorIconBlue}
                                    />

                                    <Input
                                        style={{ color: colors.WHITE, flex: 1 }}
                                        placeholder={setupMandatoryFields.dropLocationID}
                                        underlineColorAndroid="transparent"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        autoComplete={false}
                                        disabled={true}
                                        borderWidth={0}
                                        fontSize={16}
                                        onTouchStart={() => {
                                            this.props.navigation.navigate('DropLocationSelector', {
                                                selectedItem: dropLocationName,
                                                data: dropLocationData,
                                                setDrop: this.setDrop.bind(this),
                                            });
                                        }}
                                        value={dropLocationName}
                                    />
                                </View>
                            </TouchableOpacity>
                        )}
                        <Button
                            backgroundColor={colors.BLUE}
                            style={{ width: "100%", marginTop: 20 }}
                            onPress={() => {
                                Keyboard.dismiss();
                                if (!this.validateInput()) {
                                    if (this.state.seededByEmp.includes('latLong'))
                                        this.goToLocationPicker();
                                    else {
                                        this.createUser();
                                    }
                                }
                            }}
                        >
                            <Text>{this.state.seededByEmp.includes('latLong') ? setupPin.nextButtonText : "Save"}</Text>
                        </Button>
                    </View>
                </View>
                <View style={[styles.buttonContainer, { marginBottom: 6 }]}>

                </View>
            </View>
        );
    }

    goToLocationPicker() {
        this.props.navigation.navigate("MapPicker", {
            getLocationPicker: this.getLocationPicker.bind(this),
            enableCurrentLocation: true,
            title: 'Select Home location',
            clusterDetails: this.state.clusterDetails
        });
    }

    getLocationPicker(selectedLocation, selectLat, selectLng) {
        this.setState({
            HomeLat: selectLat,
            HomeLong: selectLng,
            Hadd: selectedLocation
        });
        this.createUser(selectedLocation, selectLat, selectLng);
    }


    validateInput() {
        // return true if the test case failed
        if (this.state.seededByEmp.includes('contactNo1')) {
            if (!this.state.contactNo1 || this.state.contactNo1.toString().trim().length !== 10) {
                Alert.alert(setupMandatoryFields.mobileNO, setupMandatoryFields.mobileNoInvalid);
                return true;
            }
        }
        if (this.state.seededByEmp.includes('gender')) {
            if (!this.state.gender || !this.state.gender.toString().trim().length === 0) {
                Alert.alert(setupMandatoryFields.gender, setupMandatoryFields.genderBlank);
                return true;
            }
        }
        if (this.state.seededByEmp.includes('pickupLocationName')) {
            if (!this.state.pickupLocationID || this.state.pickupLocationName.toString().trim().length === 0) {
                Alert.alert(setupMandatoryFields.pickupLocationID, setupMandatoryFields.pickupLocationBlank);
                return true;
            }
        }
        if (this.state.seededByEmp.includes('dropLocationName')) {
            if (!this.state.dropLocationID || !this.state.dropLocationName.toString().trim().length === 0) {
                Alert.alert(setupMandatoryFields.dropLocationID, setupMandatoryFields.dropLocationBlank);
                return true;
            }
        }
        return false;
    }

    createUser(selectedLocation, selectLat, selectLng) {
        let termsId = global.termsId;
        let body = {
            Password: this.state.Password.toString().length > 0 ? this.state.Password : undefined,
            Pin: this.state.pin,
            Platform: Platform.OS === "android" ? 0 : 1,
            HomeLat: selectLat,
            HomeLong: selectLng,
            Hadd: selectedLocation,
            TCAccept: moment().toISOString(),
            EmployeeTncId: termsId,
            RegistrationToken: this.state.registrationToken,

            Gender: this.state.gender,
            ContactNo: this.state.contactNo1,
            PickupLocationID: this.state.pickupLocationID,
            DropLocationID: this.state.dropLocationID
        };
        this.setState({ isLoading: true });
        let response = API.fetchJSON(URL.SET_CREDENTIAL, body);
        if (response) handleResponse.setCredential(response, this);
        else alert(loginString.somethingWentWrong);
    }
}
UserMandatoryData.propTypes = {};

const styles = StyleSheet.create({
    fixed: {
        width: Dimensions.get("window").width, //for full screen
        height: Dimensions.get("window").height, //for full screen
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    }, inputText: {
        height: 50,
        padding: 4,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomColor:colors.WHITE,
        borderBottomWidth:1,
        marginVertical: 10
    },
    container: {
        flex: 1,
        paddingBottom: 20,
        paddingLeft: 6,
        paddingRight: 6,
        paddingTop: 6,
    },
    itemContainer: {
        flexDirection: 'row',
        padding: 10
    },
    itemNameLabel: {
        fontSize: 14,
        color: colors.GREEN,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.BLACK,
        borderBottomWidth: 1,
        borderBottomColor: colors.GRAY
    },
    addressName: {
        fontSize: 16,
        fontWeight: '500',
        height: 65,
        color: colors.BLACK,
        borderBottomWidth: 1,
        borderColor: colors.GRAY
    },
    buttonContainer: {
        flex: 1,
        margin: 20,
        position: "absolute",
        bottom: 10,
        justifyContent: 'center',
        flexDirection: 'row',
        alignContent: 'center'
    },
    button: {
        backgroundColor: colors.GREEN,
        borderRadius: 8,
        width: "100%",
        padding: 12,
        alignSelf: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        alignSelf: 'center',
        color: colors.WHITE,
    }, map: {
        marginTop: 2,
        width: '100%',
        ...StyleSheet.absoluteFillObject
    }, mapContainer: {
        flexGrow: 1,
        height: 300,
        flexWrap: 'wrap',
        marginTop: 18,
        marginLeft: 6,
        marginRight: 6,
        marginBottom: 30,
    }, icon_image_style: {
        width: 32,
        height: 38
    }, loginTxtUp: {
        width: "90%",
        marginTop: "10%",
        alignSelf: 'center',
        alignContent: 'center',
        alignItems: 'center',
        fontSize: 20,
        fontWeight: "bold",
        color: colors.WHITE,
        textAlign: "center",
    }, vectorIconBlue: {
        fontSize: 30,
        color: colors.WHITE
    }, top: {
        width: "95%",
        height: "15%",
        justifyContent: "center",
        alignItems: "center"
        // backgroundColor: colors.WHITE
    }, handleMargin: {
        marginTop: "-10%",
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    }, logo: {
        height: "100%",
        width: "60%",
        marginTop: "40%",
        resizeMode: "contain",
        alignItems: "center",
        justifyContent: "center"
    },

});