import React, {Component} from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    PanResponder,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import {URL} from "../../network/apiConstants/index";
import {asyncString} from "../../utils/ConstantString";
import {API} from "../../network/apiFetch/API";
import {TYPE} from "../../model/ActionType";
import {colors} from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MapView, {Marker, PROVIDER_GOOGLE} from "react-native-maps";
import {focus, mapDelta} from "../../utils/MapHelper";
import wayPoint from "../../assets/waypoint.png";
import nodalPoint from "../../assets/nodalpoint.png";
import {spinner} from "../../network/loader/Spinner";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import RBSheet from "react-native-raw-bottom-sheet";
import {Button} from "native-base";
import {EventRegister} from "react-native-event-listeners";
import { CryptoXor } from "crypto-xor";

const rightText={color: 'white',
    alignSelf:'center',
    fontFamily: "Helvetica",
    fontSize: 18,
    fontWeight: "bold",
};

const rightTouch={marginRight: 10,
    width:32,
    height:32,
    borderRadius:16,
    backgroundColor:colors.ORANGE,
    justifyContent:'center',
    alignContent: 'center'
};

const draggableIcon = {
    width: 36,
    height: 5,
    borderRadius: 4,
    margin: 2,
    backgroundColor: "#ccc"
};

const EVENT = "OPEN";
const Data = true;

export default class EmployeeProfile extends Component {

    static navigationOptions =() => {
        return {
            title: "User Profile",
            headerTitleStyle: {fontFamily: "Roboto"},
            options:true,
            // headerRight:(
            //     <TouchableOpacity rounded={true}
            //         onPress={()=>{
            //             EventRegister.emit(EVENT, Data);
            //         }}
            //         style={rightTouch}>
            //         <Text style={rightText}>V</Text>
            //     </TouchableOpacity>
            // )
        }
    };




    openBottomSheet(){
        this.setState({openSheet:true});
    }

    _renderVaccineActions() {
        console.warn("vaccinationStatus  222"+JSON.stringify(this.state.vaccinationStatus));
        let localData=["Not Vaccinated","Partially Done","Completed"];
        let vaccinationData =this.state.vaccinations.length>0?this.state.vaccinations:localData;
        return (
            <RBSheet
                ref={ref => {
                    this.RBSheet = ref;
                }}
                date={'Vaccine Status'}
                height={230}
                duration={200}
                closeOnDragDown={true}
                closeOnPressMask={true}
                closeOnPressBack={true}
                customStyles={{
                    container: {
                        justifyContent: "center",
                        alignItems: "center"
                    }
                }}
            >
                <Button
                    full
                    transparent
                    onPress={() => {
                        console.warn("Not vaccinated");
                        this.setState({selectedVaccine:vaccinationData[0].code,thereIsNoChange:false});
                        this.RBSheet.close();
                    }}
                >
                    <Text style={{color: this.state.vaccinationStatus===vaccinationData[0].code?colors.BLUE_BRIGHT:colors.BLACK}}>
                        {vaccinationData.length>0?vaccinationData[0].code:"Not Vaccinated"}
                        </Text>
                </Button>
                <View style={draggableIcon}/>
                <Button
                    full
                    transparent
                    onPress={() => {
                        console.warn("Partially Done");
                        this.setState({selectedVaccine:vaccinationData[1].code,thereIsNoChange:false});
                        this.RBSheet.close();
                    }}
                >
                    <Text style={{color: this.state.vaccinationStatus===vaccinationData[1].code?colors.BLUE_BRIGHT:colors.BLACK}}>
                        {vaccinationData.length>0?vaccinationData[1].code:"Partially Done"}
                    </Text>
                </Button>
                <View style={draggableIcon}/>
                <Button
                    full
                    transparent
                    onPress={() => {
                        console.warn("Not vaccinated");
                        this.setState({selectedVaccine:vaccinationData[2].code,thereIsNoChange:false});
                        this.RBSheet.close();
                    }}
                >
                    <Text style={{color: this.state.vaccinationStatus===vaccinationData[2].code?colors.BLUE_BRIGHT:colors.BLACK}}>
                        {vaccinationData.length>0?vaccinationData[2].code:"Fully Vaccinated"}
                    </Text>
                </Button>
            </RBSheet>
        );
    };

    callback = async (actionType, response) => {
        const {navigate} = this.props.navigation;
        switch (actionType) {
            case TYPE.GET_USER_DETAILS: {
                // this.enableTextRef();
                handleResponse.userDetails(await response, this, navigate);
                break;
            }
            case TYPE.SAVE_USER_DETAILS: {
                handleResponse.saveUserDetails(
                    await response,
                    this,
                    navigate
                );
                break;
            }
            case TYPE.GET_LOCALITY:{
                handleResponse.getLocalityList(await response, this, navigate);
                break;
            }
            case TYPE.GET_VACCINE_DETAILS: {
                this.setState({isLoading:false});
                break;
            }
            case TYPE.POST_VACCINE_DETAILS: {
                this.setState({isLoading:false});
                break;
            }
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            access_token: "",
            UserId: "",
            DToken: "",
            CustomerUrl: "",
            errorMessage: "",
            isLoading: true,
            IdleTimeOutInMins: 0,
            isUserProfile: true,
            address: "",
            employeePin: "",
            contactNo: "",
            emergencyContactNo: null,
            latitude: null,
            longitude: null,
            addressId: "",
            officeLatitude: "",
            officeLongitude: "",
            officeRadius: 30,
            isProfileApproved: false,
            isEmployeePinEditable: false,
            isContactNoEditable: false,
            isEmergencyContactNoEditable: false,
            isAddressEditable: false,
            isGeocodeEditable: false,
            emergencyInputEditable: false,
            mobileNumberInputEditable: false,
            addressInputEditable: false,
            tPinInputEditable: false,
            thereIsNoChange: true,
            height: 0,
            heightpick:0,
            heightdrop:0,
            heightboth:0,
            showLocality:undefined,
            localityId:undefined,
            localityName:undefined,
            localityNameInputEditable:false,
            localityNameEditable:false,
            localityList:[],
            calledPreviously:false,
            vaccinations:[],
            selectedVaccine:undefined,
            vaccinationStatus:"",
            pickupLocationAddress:undefined,
            dropLocationAddress:undefined,
            pickupLatitude:undefined,
            pickupLongitude:undefined,
            dropLatitude:undefined,
            dropLongitude:undefined,
            isPickupAndDropSameLocation:0,
            pickupDropEditable:false,
            pickupEditable:false,
            DropEditable:false,

        };
        this.RBSheet =undefined;
    }

    clearAuthAndLogout() {
        if (!this.state.isMyTrips) return;
        const {navigate} = this.props.navigation;
        let body = {
            UserId: this.state.UserId,
            DToken: this.state.DToken,
            DType: 1
        };
        this.setState({isLoading: true, inactive: true});
        let response = API.fetchJSON(this.state.CustomerUrl + URL.SIGN_OUT, body);
        if (response) handleResponse.Logout(response, this, navigate);
        else this.setState({isLoading: false});
        clearInterval(this.timer);
    }

    UNSAFE_componentWillMount() {
        this._panResponder = PanResponder.create({
            onMoveShouldSetPanResponderCapture: () => {
                clearTimeout(this.timeout);
                if (this.state.IdleTimeOutInMins > 0)
                    this.timeout = setTimeout(() => {
                        this.clearAuthAndLogout();
                    }, this.state.IdleTimeOutInMins);
                return false;
            }
        });
        this.subs = [
            this.props.navigation.addListener("focus", () =>
                this.setState({isUserProfile: true})
            ),
            this.props.navigation.addListener("blur", () =>
                this.setState({isUserProfile: false})
            )
        ];

        this.navigationEvent = EventRegister.addEventListener(EVENT, (data) => {
            if (data && data===true) {
                setTimeout(() => {
                    this.RBSheet.open();
                }, 10);
            }
        });
    }

    componentWillUnmount() {
        // this.subs.forEach(sub => {
        //     sub.remove();
        // });
        clearTimeout(this.timeout);
        EventRegister.removeEventListener(this.navigationEvent);
    }

    componentDidMount() {
        this.props.navigation.setParams({ openBottomSheet: this.openBottomSheet });
        AsyncStorage.multiGet(
            [
                asyncString.ACCESS_TOKEN,
                asyncString.USER_ID,
                asyncString.DTOKEN,
                asyncString.CAPI,
                asyncString.IdleTimeOutInMins
            ],
            (err, savedData) => {
                var _token = CryptoXor.decrypt(
                    savedData[0][1],
                    asyncString.ACCESS_TOKEN
                );
                this.setState({
                    access_token: _token,
                    UserId: savedData[1][1],
                    DToken: savedData[2][1],
                    CustomerUrl: savedData[3][1],
                    IdleTimeOutInMins: parseInt(savedData[4][1])
                });
                this.getUserDetails(_token, savedData[1][1], savedData[3][1]);
            }
        );
    }

    enableTextRef () {
        console.warn('enableTextRef called');
        this.tPinRef.focus();
        this.mobileRef.focus();
        this.emergencyRef.focus();
    }

    getLocalityList(){
        API.newFetchXJSON(
            URL.GET_LOCALITY,
            this.state.DToken,
            this.callback.bind(this),
            TYPE.GET_LOCALITY
        );
    }

    onSaveUserDetails() {
        let employeePin = this.state.employeePin;
        let ContactNo = this.state.contactNo;
        let emergencyContactNo = this.state.emergencyContactNo;
        if (!employeePin) {
            Alert.alert('User Profile', "Employee T-PIN is mandatory", [{
                text: 'OK',
                onPress: () => this.tPinRef.focus()
            }]);
            return;
        }
        if (ContactNo) {
            if (ContactNo.length !== 10) {
                Alert.alert('User Profile', "Invalid Mobile number", [{
                    text: 'OK',
                    onPress: () => this.mobileRef.focus()
                }]);
                return;
            }
        } else {
            Alert.alert('User Profile', "Employee Mobile number is mandatory", [{
                text: 'OK',
                onPress: () => this.mobileRef.focus()
            }]);
            return;
        }
        if (emergencyContactNo) {
            if (emergencyContactNo.length !== 10) {
                Alert.alert('User Profile', "Invalid Emergency Contact number", [{
                    text: 'OK',
                    onPress: () => this.emergencyRef.focus()
                }]);
                return;
            }
        // } else {
        //     Alert.alert('User Profile', "Emergency Contact number is mandatory ", [{
        //         text: 'OK',
        //         onPress: () => this.emergencyRef.focus()
        //     }]);
        //     return;
        }
        this.setState({
            isLoading: true
        });
        let body = {
            EmployeePin: this.state.employeePin,
            ContactNo: this.state.contactNo,
            EmergencyContactNo: this.state.emergencyContactNo,
            Address: this.state.address,
            Latitude: this.state.latitude,
            Longitude: this.state.longitude,
            LocalityId:this.state.localityId,
            vaccinationStatus:this.state.selectedVaccine?this.state.selectedVaccine:this.state.vaccinationStatus
        };
        API.newFetchJSON(
            URL.SAVE_USER_DETAILS,
            body,
            this.state.access_token,
            this.callback.bind(this),
            TYPE.SAVE_USER_DETAILS
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


    onMobileNumberChange(value) {
        this.setState({contactNo: value, thereIsNoChange: false});
    }

    onEmergencyContactNumberChange(value) {
        this.setState({emergencyContactNo: value, thereIsNoChange: false});
    }
    onLocalityChange(value) {
        this.setState({localityName: value.localityName,localityId:value.localityId, thereIsNoChange: false});
    }

    onAddressChange(value) {
        this.setState({address: value, 
            thereIsNoChange: false});
    }

    onTpinChange(value) {
        this.setState({employeePin: value, thereIsNoChange: false});
    }

    getLocationPicker(selectedLocation, selectLat, selectLng) {
        setTimeout(() => {
            this.setState({
                address: selectedLocation,
                latitude: selectLat,
                longitude: selectLng,
                thereIsNoChange: false
            })
        }, 10);
        focus(this, ["identifier"]);
    }


    render() {
        const sourceLocation = this.state.latitude ? {
            latitude: parseFloat(this.state.latitude),
            longitude: parseFloat(this.state.longitude),
            latitudeDelta: mapDelta.latitudeDelta,
            longitudeDelta: mapDelta.longitudeDelta,
        } : null;
        return (
            <View style={{flex: 1, backgroundColor: colors.WHITE}} {...this._panResponder.panHandlers}>
                <StatusBar barStyle="dark-content"/>
                {spinner.visible(this.state.isLoading)}
                {this._renderVaccineActions()}
                <ScrollView style={styles.container} {...this._panResponder.panHandlers}>
                    <View>
                        <View style={styles.itemContainer}>
                            <View style={{flex: 1, flexDirection: 'column'}}>
                                <Text style={styles.itemNameLabel}>Mobile number</Text>
                                <TextInput
                                    ref={mobileRef => {
                                        this.mobileRef = mobileRef;
                                    }}
                                    style={styles.itemName}
                                    numberOfLines={1}
                                    contextMenuHidden={true}
                                    keyboardType="phone-pad"
                                    returnKeyType="done"
                                    maxLength={10}
                                    editable={this.state.mobileNumberInputEditable === true}
                                    onChangeText={text => this.onMobileNumberChange(text)}
                                    value={this.state.contactNo}
                                />
                            </View>
                            {this.state.isContactNoEditable &&
                            <TouchableDebounce
                                onPress={() => {
                                    console.warn('mobile ref');
                                    this.setState({mobileNumberInputEditable: true});
                                    this.mobileRef.focus();
                                    setTimeout(() => {
                                        console.warn('mobile ref 500');
                                        this.setState({mobileNumberInputEditable: true});
                                        this.mobileRef.focus();
                                    }, 500);
                                }}>
                                <FontAwesome
                                    name={"pencil"}
                                    color={colors.GREEN}
                                    style={{margin: 10}}
                                    size={26}
                                    key={1 + "icon"}
                                />
                            </TouchableDebounce>
                            }
                        </View>
                        <View style={styles.itemContainer}>
                            <View style={{flex: 1, flexDirection: 'column'}}>
                                <Text style={styles.itemNameLabel}>Emergency-Contact Number</Text>
                                <TextInput
                                    ref={emergencyRef => {
                                        this.emergencyRef = emergencyRef;
                                    }}
                                    style={styles.itemName}
                                    numberOfLines={1}
                                    contextMenuHidden={true}
                                    keyboardType="phone-pad"
                                    returnKeyType="done"
                                    maxLength={10}
                                    editable={this.state.emergencyInputEditable === true}
                                    onChangeText={text => this.onEmergencyContactNumberChange(text)}
                                    value={this.state.emergencyContactNo}
                                />
                            </View>
                            {this.state.isEmergencyContactNoEditable &&
                            <TouchableDebounce
                                onPress={() => {
                                    this.setState({emergencyInputEditable: true});
                                    this.emergencyRef.focus();
                                    setTimeout(() => {
                                        this.setState({emergencyInputEditable: true});
                                        this.emergencyRef.focus();
                                    }, 100);
                                }}>
                                <FontAwesome
                                    name={"pencil"}
                                    color={colors.GREEN}
                                    style={{margin: 10}}
                                    size={26}
                                    key={1 + "icon"}
                                />
                            </TouchableDebounce>
                            }
                        </View>
                        <View style={[styles.itemContainer]}>
                            <View style={{flex: 1, flexDirection: 'column'}}>
                                <Text style={styles.itemNameLabel}>T-PIN</Text>
                                <TextInput
                                    ref={tPinRef => {
                                        this.tPinRef = tPinRef;
                                    }}
                                    contextMenuHidden={true}
                                    style={styles.itemName}
                                    numberOfLines={1}
                                    keyboardType="numeric"
                                    returnKeyType="done"
                                    maxLength={4}
                                    editable={this.state.tPinInputEditable === true}
                                    onChangeText={text => this.onTpinChange(text)}
                                    value={this.state.employeePin}
                                />
                            </View>
                            {this.state.isEmployeePinEditable &&
                            <TouchableDebounce
                                onPress={() => {
                                    this.setState({tPinInputEditable: true});
                                    this.tPinRef.focus();
                                    setTimeout(() => {
                                        this.setState({tPinInputEditable: true});
                                        this.tPinRef.focus();
                                    }, 100);
                                }}>
                                <FontAwesome
                                    name={"pencil"}
                                    color={colors.GREEN}
                                    style={{margin: 10}}
                                    size={26}
                                    key={2 + "icon"}
                                />
                            </TouchableDebounce>
                            }
                        </View>
                        {this.state.showLocality&&(
                            <View style={styles.itemContainer}>
                                <View style={{flex: 1, flexDirection: 'column'}}>
                                    <Text style={styles.itemNameLabel}>Locality</Text>
                                    <TextInput
                                        ref={localityRef => {
                                            this.locality = localityRef;
                                        }}
                                        contextMenuHidden={true}
                                        style={styles.itemName}
                                        numberOfLines={1}
                                        keyboardType="phone-pad"
                                        returnKeyType="done"
                                        editable={false}
                                        disableFullscreenUI={true}
                                        elipseMode={'tail'}
                                        onChangeText={text => this.onLocalityChange(text)}
                                        value={this.state.localityName}
                                    />
                                </View>
                                {this.state.localityNameEditable &&
                                <TouchableDebounce
                                    onPress={() => {
                                        // need to call another page
                                        this.props.navigation.navigate("LocalityList", {
                                            onLocalityChange: this.onLocalityChange.bind(this),
                                            localityName:this.state.localityName,
                                            localityId:this.state.localityId,
                                            localityList:this.state.localityList
                                        });
                                    }}>
                                    <FontAwesome
                                        name={"pencil"}
                                        color={colors.GREEN}
                                        style={{margin: 10}}
                                        size={26}
                                        key={1 + "icon"}
                                    />
                                </TouchableDebounce>
                                }
                            </View>
                        )}
                        <View style={[styles.itemContainer]}>
                            <View style={{flex: 1, flexDirection: 'column'}}>
                                <Text style={styles.itemNameLabel}>Address</Text>
                                <TextInput
                                    style={[styles.addressName, {height: Math.max(35, this.state.height)}]}
                                    contextMenuHidden={true}
                                    editable={false}
                                    returnKeyType="done"
                                    multiline={true}
                                    onChangeText={text => this.onAddressChange(text)}
                                    value={this.state.address}
                                    onContentSizeChange={(event) => {
                                        if (event && event.nativeEvent && event.nativeEvent.contentSize) {
                                            this.setState({
                                                height: event.nativeEvent.contentSize.height
                                            })
                                        }
                                        this.props.onContentSizeChange && this.props.onContentSizeChange(event)
                                    }}
                                    ellipsizeMode='tail'
                                />
                            </View>
                            {this.state.isGeocodeEditable &&
                            <TouchableDebounce
                                style={{alignSelf: 'flex-end'}}
                                onPress={() => {
                                    this.props.navigation.navigate("MapPicker", {
                                        getLocationPicker: this.getLocationPicker.bind(this),
                                        clusterDetails: {
                                            Clusterlat: this.state.officeLatitude,
                                            Clusterlng: this.state.officeLongitude,
                                            Clusterradius: this.state.officeRadius,
                                            ClusterOutOfRadiusMsg: "Geocode cannot exceed " + parseFloat(this.state.officeRadius) + " kms from the office.",
                                            addressText: this.state.address,
                                        },
                                        fromProfile: true,
                                        enableCurrentLocation: true
                                    });
                                }}>
                                <FontAwesome
                                    name={"pencil"}
                                    color={colors.GREEN}
                                    style={{margin: 10}}
                                    size={26}
                                    key={3 + "icon"}
                                />
                            </TouchableDebounce>
                            }
                        </View>
                        {this.state.isPickupAndDropSameLocation ===1&&this.state.pickupLocationAddress!=undefined &&(
                            <View style={styles.itemContainer}>
                                <View style={{flex: 1, flexDirection: 'column'}}>
                                    <Text style={styles.itemNameLabel}>Pickup/Drop Location</Text>
                                    <TextInput
                                         style={[styles.addressName, {height: Math.max(35, this.state.heightboth)}]}
                                         contextMenuHidden={true}
                                         editable={false}
                                         returnKeyType="done"
                                         multiline={true}
                                         onChangeText={text => this.onAddressChange(text)}
                                         value={this.state.pickupLocationAddress}
                                         onContentSizeChange={(event) => {
                                             if (event && event.nativeEvent && event.nativeEvent.contentSize) {
                                                 this.setState({
                                                     heightboth: event.nativeEvent.contentSize.height
                                                 })
                                             }
                                             this.props.onContentSizeChange && this.props.onContentSizeChange(event)
                                         }}
                                         ellipsizeMode='tail'
                                    />
                                </View>
                                {this.state.pickupDropEditable &&
                                <TouchableDebounce
                                    style={{alignSelf: 'flex-end'}}
                                    onPress={() => {
                                        // need to call another page
                                        // this.props.navigation.navigate("LocalityList", {
                                        //     onLocalityChange: this.onLocalityChange.bind(this),
                                        //     localityName:this.state.localityName,
                                        //     localityId:this.state.localityId,
                                        //     localityList:this.state.localityList
                                        // });
                                    }}>
                                    <FontAwesome
                                        name={"pencil"}
                                        color={colors.GREEN}
                                        style={{margin: 10}}
                                        size={26}
                                        key={1 + "icon"}
                                    />
                                </TouchableDebounce>
                                }
                            </View>
                        )}
                           {this.state.isPickupAndDropSameLocation ===0&&this.state.pickupLocationAddress!=undefined  &&(
                           <><View style={styles.itemContainer}>
                                <View style={{flex: 1, flexDirection: 'column'}}>
                                    <Text style={styles.itemNameLabel}>Pickup Location</Text>
                                    <TextInput
                                         style={[styles.addressName, {height: Math.max(35, this.state.heightpick)}]}
                                         contextMenuHidden={true}
                                         editable={false}
                                         returnKeyType="done"
                                         multiline={true}
                                         onChangeText={text => this.onAddressChange(text)}
                                         value={this.state.pickupLocationAddress}
                                         onContentSizeChange={(event) => {
                                             if (event && event.nativeEvent && event.nativeEvent.contentSize) {
                                                 this.setState({
                                                     heightpick: event.nativeEvent.contentSize.height
                                                 })
                                             }
                                             this.props.onContentSizeChange && this.props.onContentSizeChange(event)
                                         }}
                                         ellipsizeMode='tail'
                                    />
                                </View>
                                {this.state.pickupEditable &&
                                <TouchableDebounce
                                    style={{alignSelf: 'flex-end'}}
                                    onPress={() => {
                                        // need to call another page
                                        // this.props.navigation.navigate("LocalityList", {
                                        //     onLocalityChange: this.onLocalityChange.bind(this),
                                        //     localityName:this.state.localityName,
                                        //     localityId:this.state.localityId,
                                        //     localityList:this.state.localityList
                                        // });
                                    }}>
                                    <FontAwesome
                                        name={"pencil"}
                                        color={colors.GREEN}
                                        style={{margin: 10}}
                                        size={26}
                                        key={1 + "icon"}
                                    />
                                </TouchableDebounce>
                                }
                            </View>
                            <View style={styles.itemContainer}>
                                <View style={{flex: 1, flexDirection: 'column'}}>
                                    <Text style={styles.itemNameLabel}>Drop Location</Text>
                                    <TextInput
                                         style={[styles.addressName, {height: Math.max(35, this.state.heightdrop)}]}
                                         contextMenuHidden={true}
                                         editable={false}
                                         returnKeyType="done"
                                         multiline={true}
                                         onChangeText={text => this.onAddressChange(text)}
                                         value={this.state.dropLocationAddress}
                                         onContentSizeChange={(event) => {
                                             if (event && event.nativeEvent && event.nativeEvent.contentSize) {
                                                 this.setState({
                                                     heightdrop: event.nativeEvent.contentSize.height
                                                 })
                                             }
                                             this.props.onContentSizeChange && this.props.onContentSizeChange(event)
                                         }}
                                         ellipsizeMode='tail'
                                    />
                                 </View>
                                {this.state.DropEditable &&
                                <TouchableDebounce
                                    style={{alignSelf: 'flex-end'}}
                                    onPress={() => {
                                        // need to call another page
                                        // this.props.navigation.navigate("LocalityList", {
                                        //     onLocalityChange: this.onLocalityChange.bind(this),
                                        //     localityName:this.state.localityName,
                                        //     localityId:this.state.localityId,
                                        //     localityList:this.state.localityList
                                        // });
                                    }}>
                                    <FontAwesome
                                        name={"pencil"}
                                        color={colors.GREEN}
                                        style={{margin: 10}}
                                        size={26}
                                        key={1 + "icon"}
                                    />
                                </TouchableDebounce>
                                }
                            </View>
                            </> 
                        )}

                        <View style={[styles.mapContainer]}>
                            {sourceLocation && (
                                <MapView
                                    ref={ref => {
                                        this.map = ref;
                                    }}
                                    style={styles.map}
                                    zoom={15}
                                    initialRegion={{...sourceLocation, ...mapDelta}}
                                    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                                >
                                    <Marker
                                        identifier={"identifier"}
                                        ref={marker => {
                                            this.marker = marker
                                        }}
                                        title={" Your location "}
                                        description={this.state.address}
                                        coordinate={sourceLocation}
                                    >
                                        <Image
                                            source={wayPoint}
                                            style={styles.icon_image_style}
                                        />
                                    </Marker>
                                    {this.state.isPickupAndDropSameLocation ===1 &&this.state.pickupLocationAddress!=undefined  && (
                                    <Marker
                                        identifier={'identifier'}
                                        ref={marker => {
                                        this.marker = marker;
                                        }}
                                        // image={require('../../assets/nodalpoint.png')}
                                        title={'Pickup/Drop Location'}
                                        description={this.state.pickupLocationAddress}
                                        coordinate={{
                                        latitude: parseFloat(this.state.pickupLatitude),
                                        longitude: parseFloat(this.state.pickupLongitude)
                                        }}
                                        >
                                        <Image source={nodalPoint} style={{ height: 35, width: 35 }} />
                                        </Marker>
                                    )}

                                    {this.state.isPickupAndDropSameLocation ===0 &&this.state.pickupLocationAddress!=undefined  && (
                                     <><Marker
                                     identifier={'identifier'}
                                     ref={marker => {
                                     this.marker = marker;
                                     }}
                                     // image={require('../../assets/nodalpoint.png')}
                                     title={'Pickup Location'}
                                     description={this.state.pickupLocationAddress}
                                     coordinate={{
                                     latitude: parseFloat(this.state.pickupLatitude),
                                     longitude: parseFloat(this.state.pickupLongitude)
                                     }}
                                     >
                                     <Image source={nodalPoint} style={{ height: 35, width: 35 }} />
                                     </Marker>
                                     <Marker
                                        identifier={'identifier'}
                                        ref={marker => {
                                        this.marker = marker;
                                        }}
                                        // image={require('../../assets/nodalpoint.png')}
                                        title={'Drop Location'}
                                        description={this.state.dropLocationAddress}
                                        coordinate={{
                                        latitude: parseFloat(this.state.dropLatitude),
                                        longitude: parseFloat(this.state.dropLongitude)
                                        }}
                                        >
                                        <Image source={nodalPoint} style={{ height: 35, width: 35 }} />
                                        </Marker>
                                        </>
                                    )}
                                </MapView>
                                )}
                            <TouchableDebounce
                                style={{
                                    position: "absolute",
                                    right: 20,
                                    top: 20,
                                    backgroundColor: colors.WHITE,
                                    height: 40,
                                    width: 40,
                                    borderRadius: 20,
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}
                                onPress={() => focus(this, ["identifier"])}
                            >
                                <MaterialCommunityIcons
                                    name="crosshairs-gps"
                                    style={{fontSize: 35, color: colors.BLACK}}
                                />
                            </TouchableDebounce>
                        </View>
                    </View>
                </ScrollView>
                <View style={[styles.buttonContainer,{marginBottom:6}]}>
                    <TouchableDebounce
                        style={[styles.button, {opacity: this.state.thereIsNoChange ? 0.5 : 1}]}
                        disabled={this.state.thereIsNoChange}
                        onPress={() => {
                            this.onSaveUserDetails()
                        }}
                    ><Text style={styles.buttonText}>Save</Text>

                    </TouchableDebounce>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom:20,
        paddingLeft:6,
        paddingRight:6,
        paddingTop:6
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
    }
});
