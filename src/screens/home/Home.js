import React, {Component} from "react";
import {
    ActivityIndicator,
    Alert,
    AppState,
    BackHandler,
    Dimensions,
    Image,
    Linking,
    NativeModules,
    PanResponder,
    PermissionsAndroid,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GlobalFont from 'react-native-global-font';
import LinearGradient from "react-native-linear-gradient";
import {colors} from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import {Stack, Button, Box, HStack} from "native-base";
import Carousel, {Pagination} from "react-native-snap-carousel";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {URL} from "../../network/apiConstants";
import {
    asyncStorageAllKeys,
    asyncString, loginString,
} from "../../utils/ConstantString";
import  remoteConfig  from '@react-native-firebase/remote-config';
import {API} from "../../network/apiFetch/API";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import moment from "moment";
import RNSlidingButton, {SlideDirection} from "../../features/RNSlidingButton";
import JailMonkey from "jail-monkey";
import RNExitApp from "react-native-exit-app";
import Menu from "../../utils/DrawerMenu";
import SideMenu from "react-native-side-menu-updated";
import {spinner} from "../../network/loader/Spinner";
import PopupDialog, {DialogTitle, SlideAnimation} from "react-native-popup-dialog";
import Modal from "react-native-modal";
import HTML from "react-native-render-html";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Shimmer from "react-native-shimmer";
import {EventRegister} from "react-native-event-listeners";
import {TYPE} from "../../model/ActionType";
import {inject, observer} from "mobx-react";
import {check, PERMISSIONS, request, RESULTS} from "react-native-permissions";
// import RNGooglePlaces from "react-native-google-places-native";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import Geolocation from "@react-native-community/geolocation";
import * as Toast from "../../utils/Toast";
import { checkSpecialCharacter } from "../../utils/Validators";
import Pushy from "pushy-react-native";
import PushNotification from "react-native-push-notification";

const he = require("he");
let FirstItem = 1;
const SliderWidth = Dimensions.get("screen").width;
const ItemWidth = 300.0;
import ScreenShot from '../../utils/ScreenShot';
import { requestPhoneCallPermission } from "../../utils/RequestPermissions";
import { Rating } from "react-native-ratings";
import Ionicons from "react-native-vector-icons/Ionicons";
import { showMessage } from "react-native-flash-message";
import { CryptoXor } from "crypto-xor";

const logo  = require("../../assets/routematic.png");
let PrivacySnapshot = require('react-native-privacy-snapshot');

const slideAnimation = new SlideAnimation({
    slideFrom: "bottom"
});
const { width, height } = Dimensions.get("window");

const GoogleKeyManager = NativeModules.GoogleKeyManager;

const HeaderRightWithIcon = ({bellHandler, bellCount}) => (
    <>
    <TouchableOpacity style={styles.bell}  onPress={bellHandler}>
       <FontAwesome
            name="bell"
            style={{
                    fontSize: 30,
                    padding: 2,
                    color: colors.WHITE,
             }}
        />
        {bellCount>0&&<View style={styles.circles}><Text style={styles.counts}>{bellCount}</Text></View>}
    </TouchableOpacity>
    </>
  );
  
// Later on in your styles..
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    linearGradient: {
        width: "100%",
        height: "40%",
        borderRadius: 0,
        opacity: 0.77
        //transform: [{ rotate: "90deg" }]
    },
    bell:{
        width:50,
        height:50,
        right:10,
        position:'absolute'     
    },
    circles:{
        width:22,
        height:22,
        borderRadius:50,
        backgroundColor: 'red',
        right: 10,
        top: -5,
        position:'absolute'
       },
       counts:{
        color: colors.WHITE,
        fontSize:13,
        fontFamily: 'Helvetica',
        textAlign: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
        padding: Platform.OS == 'ios' ? 3 : 0 
      },
    text: {
        fontSize: 12,
        fontFamily: "Helvetica",
        textAlign: "center",
        margin: 10,
        color: "#ffffff",
        backgroundColor: "transparent"
        //fontWeight: "700"
    },
    textHeader: {
        fontSize: 14,
        fontFamily: "Helvetica",
        fontWeight: "bold",
        textAlign: "center",
        margin: 10,
        color: "#ffffff",
        backgroundColor: "transparent"
    },
    circle: {
        width: 58,
        height: 58,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
        shadowColor: "rgba(0, 0, 0, 0.5)",
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowRadius: 8,
        shadowOpacity: 1,
        borderRadius: 29
    },
    barIcon: {
        width: 20,
        height: 20
    },
    barText: {
        fontSize: 10,
        fontFamily: "Helvetica",
        textAlign: "center",
        marginTop: 5,
        color: colors.GRAY,
        backgroundColor: "transparent"
    },
    notificationRectangle: {
        width: "100%",
        height: "15%",
        marginTop: 10,
        backgroundColor: "#ffffff"
    },
    bottomBar: {
        width: "100%",
        height: "10%",
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: "#ffffff",
        shadowColor: "#9b9b9b",
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowRadius: 2,
        shadowOpacity: 1,
        bottom: 0,
        left: 0,
        right: 0,
        position: "absolute"
    },
    smallIcon: {
        width: 25,
        height: 25
    },
    sosCircle: {
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 30,
        backgroundColor: colors.RED,
        shadowColor: "rgba(0, 0, 0, 0.5)",
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowRadius: 8,
        shadowOpacity: 1.5
        //marginLeft: "80%"
    },
    rootContainer: { backgroundColor: "white", flex: 1 },
    overlay: {
        flex: 1,
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        //opacity: 0.5,
        backgroundColor: "transparent",
        width: "100%"
    },
    modalContent: {
        height: "25%",
        backgroundColor: "transparent",
        justifyContent: "flex-end",
        alignItems: "flex-end",
        borderRadius: 4,
        borderColor: "rgba(0, 0, 0, 0.1)"
    },
    bottomModal: {
        justifyContent: "flex-end",
        margin: 0,
        flex: 1
    },
    button: {
        backgroundColor: "lightblue",
        padding: 12,
        marginTop: 10,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 4,
        borderColor: "rgba(0, 0, 0, 0.1)",
        flexDirection: "row",
        right: 0,
        alignSelf: "flex-end"
    },
    bodyViewStyle: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    headerLayoutStyle: {
        width,
        height: 50,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center"
    },
    slidingPanelLayoutStyle: {
        width,
        height,
        backgroundColor: "#7E52A0",
        justifyContent: "center",
        alignItems: "center"
    },
    commonTextStyle: {
        color: "white",
        fontSize: 18
    },
    itemBlock: {
        flexDirection: "row",
        paddingBottom: 10
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 25
    },
    itemMeta: {
        marginLeft: 10,
        justifyContent: "center"
    },
    itemName: {
        fontSize: 20
    },
    itemLastMessage: {
        fontSize: 16,
        color: "#111"
    },
    separator: {
        height: 0.5,
        width: "100%",
        alignSelf: "center",
        backgroundColor: "#555"
    },
    header: {
        padding: 10
    },
    headerText: {
        fontSize: 30,
        fontWeight: "900"
    },
    centerModal: {
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%"
    },
    imageContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    logo: {
        height: "70%",
        width: "60%",
        resizeMode: "contain",
        alignItems: "center",
        justifyContent: "center"
    }
});

@inject("homeStore")
@observer
class Home extends Component {
    static navigationOptions = () => {
        return {
            title: "Routematic",
            headerStyle: { display: "none" }
        };
    };
    state = {
        visible: false,
        visibleModal: null,
        timeWentInactive: null,
        inactive: false,
        isShuttleAllowed: "false",
        isFixedRouteAllowed: "false",
        isNewFixedRouteAllowed: "false",
        isChangeAddressAllowed: "false",
        isParkingAllowed: "true",
        isFlexiEnabled:false,
        notification_count: 0,
    };
    
    callback = async (actionType, response, copyDataObj) => {
        console.warn(actionType, response, copyDataObj);
        const { navigate } = this.props.navigation;
        switch (actionType) {
            case TYPE.LOGIN_INFO: {
                if (response.hasOwnProperty("data")) {
                    handleResponse.LOGIN_INFO(response, this);
                } else {
                    this.setState({
                        isLoading: false
                    });
                    this.clearAuthAndLogout();
                }
                break;
            }
            case TYPE.ANNOUNCEMENT: {
                handleResponse.announcement(response, this);
                break;
            }
            case TYPE.PARKING: {
                handleResponse.parkingAuth(response, this, NativeModules);
                break;
            }
            case TYPE.IVR: {
                handleResponse.getIVRDetails(
                    response,
                    this,
                    navigate,
                    copyDataObj.type
                );
                break;
            }
            case TYPE.FEEDBACK_PREVIOUS_DAY: {
                handleResponse.feedbackLast24hrTrip(
                    response,
                    this,
                    copyDataObj.access_token,
                    copyDataObj.UserId,
                    copyDataObj.CustomerUrl,
                    copyDataObj.lastTripId,
                    copyDataObj.lastRatedDate
                );
                break;
            }
            case TYPE.FEEDBACK_CATEGORIES: {
                handleResponse.getFeedbackCategories(
                    response,
                    this,
                    navigate,
                    copyDataObj.feedback,
                    copyDataObj.Last24hrTrips
                );
                break;
            }
            case TYPE.FEEDBACK_SUBMIT: {
                handleResponse.submitFeedback(
                    response,
                    this,
                    copyDataObj.rating,
                    copyDataObj.Last24hrTrips,
                    copyDataObj.lastRatedDate
                );
                break;
            }
            case TYPE.UPDATE_GEO_CODE: {
                handleResponse.updateGeoCode(response, this);
                break;
            }

            case TYPE.OPT_OUT: {
                handleResponse.optOut(response, this);
                break;
            }
            case TYPE.GET_FAV_ROUTES: {
                handleResponse.getFavFixedRoutes(response, this);
                break;
            }
            case TYPE.GET_USER_DETAILS: {
                handleResponse.userDetails(await response, this, navigate);
                break;
            }
        }
    };
    _handleAppStateChange = nextAppState => {
        this.setState({ appState: nextAppState });
        if (nextAppState === "active") {
            // this.setupConfig();
            // this.fetchRemoteConfig();
        }
    };

    onMenuItemSelected = item => {
        this.setState({
            isOpen: false,
            selectedItem: item
        });
        if (item === "Logout") {
            let isManuallyLoggedOut = true;
            this.clearAuthAndLogout(isManuallyLoggedOut);
        }
        if (item === "feedback") {
            this.navigationHandler("Feedback");
        }
        if (item === "Change Password") {
            this.navigationHandler("ChangePassword");
        }
        if (item === "ParkZeus") {
            let body = {
                id: this.state.UserId,
                email: this.state.guestEmail,
                capi: this.state.CustomerUrl
            };
            API.newFetchJSON(
                URL.PARKING_AUTH,
                body,
                this.state.access_token,
                this.callback.bind(this),
                TYPE.PARKING
            );
        }
        if (item === "Opt-out") {
            this.setState({ isLoading: true });
            API.newFetchXJSON(URL.Opt_Out_GET, true, this.callback, TYPE.OPT_OUT);
        }
        if (item === "E-Ticket") {
            this.setState({ isLoading: true });
            if (this.state.isFixedRouteAllowed === "true") {
                this.props.homeStore.getFixedRouteConfig(this).then((response) => {
                    console.warn('getFixedRouteConfig res - ', response);
                    this.setState({ isLoading: false });
                    if (response.data.Status.Code === 200) {
                        if (response.data?.Data?.WorkFlowType == "1") {
                            this.navigationHandler("ETicketNEW", {
                                FRTrips: this.state.isFixedRouteAllowed,
                            });
                        } else {
                            this.navigationHandler("ETicket", {
                                FRTrips: this.state.isFixedRouteAllowed,
                            });
                        }
                    } else {
    
                    }
                });
            } else {
                this.props.homeStore.getShuttleConfig(this).then((response) => {
                    console.warn('getShuttleConfig res - ', response);
                    this.setState({ isLoading: false });
                    if (response.data.Status.Code === 200) {
                        if (response.data?.Data?.WorkFlowType == "1") {
                            this.navigationHandler("ETicketNEW", {
                                FRTrips: this.state.isFixedRouteAllowed,
                            });
                        } else {
                            this.navigationHandler("ETicket", {
                                FRTrips: this.state.isFixedRouteAllowed,
                            });
                        }
                    } else {
    
                    }
                });
            }
            
        }
        if (item === "FeedbackTabs") {
            this.navigationHandler("FeedbackTabs");
        }
        if (item === "VerifyGeoCode") {
            let empVerifyGeoCode = this.state.empVerifyGeoCode;
            this.navigationHandler("MapPicker", {
                getLocationPicker: this.getLocationPicker.bind(this),
                clusterDetails: {
                    Clusterlat: empVerifyGeoCode.officeLat,
                    Clusterlng: empVerifyGeoCode.officeLng,
                    Clusterradius: empVerifyGeoCode.transportDistance,
                    ClusterOutOfRadiusMsg: empVerifyGeoCode.distanceValidationMsg,
                    addressText: empVerifyGeoCode.addressText,
                    metaData: empVerifyGeoCode.metaData
                },
                enableCurrentLocation: true
            });
        }
    };

    doCallTransport = () => {
        this.setState({
            visibleModal: false
        });
        requestPhoneCallPermission(
            "+" + this.state.IVRNumber
            // "+" + this.state.IVRNumber + "," + this.state.Admin
        );
    };

    _renderDirectAppLaunchContent = () => (
        <View style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'stretch',
        }}>
            <Box
                style={{
                    width: "100%",
                    height: "50%",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <HStack header bordered>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "space-between"
                        }}
                    >
                        <Text style={[styles.itemName, { fontWeight: "700" }]}>
                            Warning !
                        </Text>

                        <Text style={[styles.itemName, { fontSize: 18 }]}>
                        </Text>
                    </View>
                </HStack>
                <HStack bordered>
                    <Stack>
                        <Text style={styles.itemLastMessage}>
                            Dear User, you are not allowed to directly open the app.Please use your official app to launch Routematic.
                        </Text>
                    </Stack>
                </HStack>
            </Box>
        </View>
    );
    
    _renderFeedbackContent = () => (
        <View style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'stretch',
        }}>
            <Box
                style={{
                    width: "100%",
                    // height: "52%",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: colors.WHITE,
                    padding: 10,
                    borderRadius: 8
                }}
            >
                <HStack>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: '100%',
                            marginBottom: 10
                        }}
                    >
                        <Text style={[styles.itemName, { fontWeight: "700", color: colors.BLACK }]}>
                            {this.state.feedbackLast24hrTrip.tripType}
                        </Text>

                        <Text style={[styles.itemName, { fontSize: 18, color: colors.GRAY }]}>
                            {this.state.feedbackLast24hrTrip.tripId}
                        </Text>
                    </View>
                </HStack>
                <HStack >
                    <Stack>
                        <Text style={styles.itemLastMessage}>
                            Driver Name : {this.state.feedbackLast24hrTrip.driverName}
                        </Text>
                        <Text style={styles.itemLastMessage}>
                            Vehicle No. : {this.state.feedbackLast24hrTrip.vehicleRegNo}
                        </Text>
                        <Text style={styles.itemLastMessage}>
                            {moment(this.state.feedbackLast24hrTrip.shiftTime).format(
                                "DD MMM YYYY hh:mmA"
                            )}
                        </Text>
                    </Stack>
                </HStack>
                {/* <HStack
                    footer
                    bordered
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center"
                    }}
                > */}
                    {/* <StarRating
                        disabled={false}
                        emptyStar={"ios-star-outline"}
                        fullStar={"ios-star"}
                        halfStar={"ios-star-half"}
                        iconSet={"Ionicons"}
                        maxStars={5}
                        rating={
                            this.state.tempRating /*feedbackLast24hrTrip.feedbackRating*
                        }
                        selectedStar={rating =>
                            this.onStarRatingPress(rating, this.state.feedbackLast24hrTrip)
                        }
                        fullStarColor={colors.YELLOW}
                        starSize={35}
                        containerStyle={{
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    /> */}

                    <Rating
                        type='star'
                        ratingColor='#3498db'
                        ratingBackgroundColor='#c8c7c8'
                        ratingCount={5}
                        imageSize={30}
                        startingValue={
                            this.state.tempRating
                        }
                        onFinishRating={rating =>
                            this.onStarRatingPress(rating, this.state.feedbackLast24hrTrip)
                        }
                        style={{ paddingVertical: 10 }}
                    />
                {/* </HStack> */}
                {this.state.enableComment && (
                    <>
                    <Stack style={{flexDirection: "column", width: "100%", alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{width:"90%", paddingVertical:12, alignSelf:"center", fontSize: 16, color: colors.BLACK}} >Comments</Text>
                        <TextInput style={{width: "90%", padding: 12, alignSelf: "center", color: colors.BLACK}}
                        placeholder={"Comments (Optional)"}
                        maxLength={600}
                        multiline={true}
                        borderBottomWidth={1}
                        borderBottomColor={colors.BLACK}
                        ref= {(el) => { this.comment = el; }}
                        onChangeText={(comment) => {
                            if (comment != "" && checkSpecialCharacter(comment)) {
                                Toast.show("Special character are not allowed except -_.,:?*$@");
                            } else {
                                this.setState({comment})
                            }
                        }}
                        value={this.state.comment}
                        returnKeyType={'done'}
                        />
                    </Stack>
                    <View style={{flexDirection: 'row',width:'90%',padding:12,justifyContent:'flex-end'}}>
                        <Button style={{backgroundColor: colors.GREEN, width: '50%'}} onPress={() => {
                            this.onStarRatingPress(this.state.tempRating, this.state.feedbackLast24hrTrip, true);
                        }}>
                            <Text>
                                SUBMIT
                            </Text>
                        </Button>
                    </View>
                    </>
                )}
            </Box>
        </View>
    );
    _renderCallTransportModalContent = () => (
        <View style={styles.modalContent}>
            <RNSlidingButton
                style={{
                    borderColor: colors.GREEN,
                    borderWidth: 1,
                    width: "100%",
                    backgroundColor: colors.GREEN
                }}
                height={70}
                onSlidingSuccess={() => this.doCallTransport()}
                slideDirection={SlideDirection.RIGHT}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignContent: "center"
                    }}
                >
                    <Shimmer duration={2000}>
                    <View style={{ borderBottomWidth: 0, flexDirection: 'row', justifyContent: 'flex-start' }}>
                                {(Platform.OS == 'android') ? <Text
                                        numberOfLines={1}
                                        style={{
                                            fontSize: 14,
                                            fontWeight: "normal",
                                            textAlign: "center",
                                            color: colors.WHITE,
                                            fontFamily: "Roboto",
                                            marginBottom:5
                                        }}
                                    >
                                        Slide right to call Help Desk 
                                        <Text
                                        style={{
                                            fontSize: 25,
                                            fontWeight: "700",
                                            color: colors.WHITE,
                                            fontFamily: "Roboto",
                                            marginHorizontal: 10,
                                            right:0,
                                        }}
                                    > &gt;&gt; 
                                    </Text>        
                                    </Text>:<><Text
                                   numberOfLines={1}
                                   style={{
                                       fontSize: 14,
                                       fontWeight: "normal",
                                       textAlign: "center",
                                       color: colors.WHITE,
                                       fontFamily: "Roboto",
                                       marginTop:5
                                   }}
                               >
                                   Slide right to call Help Desk
                                   </Text>
                                   <FontAwesome
                                        name="angle-double-right"
                                        style={{
                                            fontSize: 30,
                                            color: colors.WHITE,
                                            marginHorizontal: 10,
                                            marginBottom:20,
                                            

                                        }}
                                    />
                                    </>}
                              </View>
                        {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text
                                numberOfLines={1}
                                style={{
                                    fontSize: 14,
                                    fontWeight: "normal",
                                    textAlign: "center",
                                    color: colors.WHITE,
                                    fontFamily: "Roboto",
                                    marginTop:5
                                }}
                            >
                                Slide right to call Help Desk  
                            </Text>
                            <FontAwesome
                                        name="angle-double-right"
                                        style={{
                                            fontSize: 30,
                                            color: colors.WHITE,
                                            marginHorizontal: 10,
                                            marginBottom:20
                                        }}
                                    />
                             <FontAwesome
                                name="angle-double-right"
                                style={{ fontSize: 30, color: colors.WHITE, marginRight: 20 }}
                            /> 
                        </View> */}
                    </Shimmer>
                </View>
            </RNSlidingButton>
        </View>
    );
    _renderNoAnnouncementOrTips = type => {
        return (
            <Box transparent style={{ flex: 0.8, margin: 10,
                padding: 10 }}>
                <HStack header>
                    <View style={styles.smallIcon}>
                        {type === "tips" ? (
                            <Image
                                defaultSource={require("../../assets/dashboard/tips.png")}
                                source={require("../../assets/dashboard/tips.png")}
                                resizeMethod="scale"
                                resizeMode="cover"
                                style={styles.smallIcon}
                            />
                        ) : (
                                <Image
                                    defaultSource={require("../../assets/dashboard/annoumnet.png")}
                                    source={require("../../assets/dashboard/annoumnet.png")}
                                    resizeMethod="scale"
                                    resizeMode="cover"
                                    style={styles.smallIcon}
                                />
                            )}
                    </View>
                    <Text
                        style={{
                            marginLeft: 10,
                            fontFamily: "Helvetica",
                            fontWeight: "700",
                            fontSize: 12,
                            color: colors.BLACK
                        }}
                    >
                        {type === "tips" ? "Tips" : "Important Transport Announcement"}
                    </Text>
                </HStack>
                <HStack>
                    <Stack>
                        <Text style={{ fontFamily: "Helvetica", fontSize: 12, color: colors.BLACK }}>
                            {type === "tips" ? "No current tips" : "No current announcements"}
                        </Text>
                    </Stack>
                </HStack>
            </Box>
        );
    };
    _renderCardsView = (data, config) => {
        return (
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    margin: 10,
                    padding: 10
                }}
            >
                <Carousel
                    ref={c => (this._slider1Ref = c)}
                    data={data}
                    firstItem={FirstItem}
                    itemWidth={ItemWidth}
                    sliderWidth={SliderWidth}
                    activeSlideAlignment="center"
                    renderItem={this._renderItem}
                    loop={true}
                    loopClonesPerSide={2}
                    autoplay={config.autoplay}
                    autoplayDelay={500}
                    autoplayInterval={5000}
                    onSnapToItem={index => this.setState({ currentSliderIndex: index })}
                />
                <Pagination
                    activeDotIndex={this.state.currentSliderIndex}
                    dotsLength={data.length}
                    dotColor={colors.BLACK}
                    inactiveDotColor={colors.BLACK}
                    inactiveDotOpacity={0.4}
                    inactiveDotScale={0.6}
                    containerStyle={styles.paginationContainer}
                    dotStyle={styles.paginationDot}
                    carouselRef={this._slider1Ref}
                    tappableDots={!!this._slider1Ref}
                />
            </View>
        );
    };

    _renderAnnouncementCardsView = (data, config) => {
        return (
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    margin: 10,
                    padding: 10
                }}
            >
                <Carousel
                    data={data}
                    firstItem={FirstItem}
                    itemWidth={ItemWidth}
                    sliderWidth={SliderWidth}
                    activeSlideAlignment="center"
                    renderItem={this._renderAnnouncementItem}
                    loop={true}
                    loopClonesPerSide={1}
                    autoplay={config.autoplay}
                    autoplayDelay={500}
                    autoplayInterval={5000}
                    onSnapToItem={index => this.setState({ currentSliderIndex: index })}
                />
            </View>
        );
    };


    constructor(props) {
        super(props);
        this._renderItem = this._renderItem.bind(this);
        this._renderAnnouncementItem = this._renderAnnouncementItem.bind(this);
        this.toggle = this.toggle.bind(this);
        this.state = {
            currentSliderIndex: 1,
            isOpen: false,
            selectedItem: "",
            isLoading: false,
            access_token: "",
            UserId: "",
            DToken: "",
            CustomerUrl: "",
            slidingMessage: "",
            VehicleID: "",
            CheckinStatus: "",
            alertDescription: "",
            alertTitle: "",
            IVRNumber: "",
            Admin: "",
            UserName: "",
            feedbackLast24hrTrip: {},
            tempRating: 0.0,
            JBDevicesAllowed: true,
            active: "",
            background: "",
            LvTime: 0,
            IdleTimeOutInMins: 0,
            tips: [],
            announcements: [],
            lastRefreshedAnnouncementsTips: "",
            isHome: true,
            recentlyLoggedIn: false,
            swipeEnabled: false,
            rated: false,
            lastRatedDate: "",
            appState: AppState.currentState,
            isSliderLoading: false,
            didReLogin: "",
            feedbackPreviousDayLastSavedShiftTime: "",
            empVerifyGeoCode: {},
            activeTrip:true,
            deepLink: null,
            disableAppDirectLaunch: []
        };
        this.checkPermissions();
    }

    componentDidMount() {
        Linking.getInitialURL().then(url => {
            this.state.deepLink = url;
            console.warn('Deeplink init url ', url);
            if (url) {
                this.navigate(url);
            }
        });

        if (Platform.OS === 'android') {
            PushNotification.configure({
                // (required) Called when a remote or local notification is opened or received
                onNotification: function(notification) {
                  console.log('LOCAL NOTIFICATION ==>', notification)
                },
                popInitialNotification: true,
                requestPermissions: true
            });
    
            PushNotification.createChannel({ 
                channelId: "rmemp-app", 
                channelName: "Routematic Employee", 
                channelDescription: "A channel to categorise your notifications", 
                playSound: false, 
                soundName: "default",
                vibrate: true, 
            },
            (created) => console.log(`createChannel returned '${created}'`) 
            );
        }

        // if (Platform.OS === 'android') {
        //     Linking.getInitialURL().then(url => {
        //         console.warn('Android url ', url);
        //         this.navigate(url);
        //     });
        // } else {
        //     Linking.addEventListener('url', this.handleOpenURL);
        // }

        let fontName = 'Poppins-Regular';
        GlobalFont.applyGlobal(fontName);
        this.subs = [
            this.props.navigation.addListener("focus", () => {
                this.setState({
                    isHome: true,
                    visibleModal: this.state.recentlyLoggedIn ? "feedback" : null 
                });
                this.setupConfig();
                this.fetchRemoteConfig();
                this.notifyListener(); 
                this.getNotificationCount();
            }),
            
            this.props.navigation.addListener("blur", () =>
                this.setState({ isHome: false, visibleModal: null })
            )
        ];

        this.props.navigation.setParams({
            headerToggle: () => this.toggle
        });
        // this.setupConfig();
        // this.notifyListener();
        // this.fetchRemoteConfig();
        AppState.addEventListener("change", this._handleAppStateChange);
    }

    UNSAFE_componentWillMount() {
        // Linking.removeEventListener('url', this.handleOpenURL);

        const HomeStore = this.props.homeStore;
        this._panResponder = PanResponder.create({
            onMoveShouldSetPanResponderCapture: () => {
                clearTimeout(this.timeout);
                this.setState(state => {
                    if (state.inactive === false) return null;
                    return {
                        inactive: false
                    };
                });

                if (this.state.IdleTimeOutInMins > 0)
                    this.timeout = setTimeout(() => {
                        this.clearAuthAndLogout();
                    }, this.state.IdleTimeOutInMins);
                return false;
            }
        });
        this.alertNotification = EventRegister.addEventListener(TYPE.NOTIFICATION_TEXT, (data) => {
            setTimeout(() => {
                Alert.alert(
                    data.title,
                    data.content,
                    [
                        {
                            text: "Ok",
                            onPress: () => {
                            },
                            style: "cancel"
                        }
                    ],
                    {
                        cancelable: false
                    }
                );
            }, 50);
            this.refreshAnnouncment();
        });
        this.adhocNotification = EventRegister.addEventListener(TYPE.AD_HOC_PUSH_NOTIFICATION, (data) => {
            if(HomeStore.termsChanged===true){
                this.checkForTermsFlag(HomeStore,"MyTripsMobx");
            }else {
                this.navigationHandler("MyTripsMobx");
            }
        });
        this.rosterNotification = EventRegister.addEventListener(TYPE.ROSTER_CANCEL_PUSH_NOTIFICATION, (data) => {
            if(HomeStore.termsChanged===true){
                this.checkForTermsFlag(this.props.homeStore,"RosterCalendar", {
                    pushNotificationAction: data,
                });
            }else {
                this.navigationHandler("RosterCalendar", {
                    pushNotificationAction: data,
                });
            }
        });
        this.feedbackNotification = EventRegister.addEventListener(TYPE.FEEDBACK_PUSH_NOTIFICATION, (data) => {
            this.navigationHandler("FeedbackTabs");
        });
        this.panicListener = EventRegister.addEventListener(TYPE.SOS,(data)=>{
            this.props.homeStore.setData(data);
            AsyncStorage.setItem(asyncString.SOS,JSON.stringify(data));
        });
        this.getUserDetails();
    }

    notifyListener = async() => {
        Pushy.setNotificationListener(async pushData => {
            console.warn("Home PushData ------------>>>>> " + JSON.stringify(pushData));
            this.getNotificationCount();

            let data;
            let pushAllowed = await AsyncStorage.getItem(asyncString.IS_PUSH_ALLOWED);
            if (pushAllowed === "true") {
                if (pushData.hasOwnProperty("Args")) {
                    data = JSON.parse(pushData.Args);
                } else {
                    data = pushData;
                }
                if (data.me === "1") {
                    return;
                }
                if (data.hasOwnProperty("waypointstatus")) {
                    if (AppState.currentState === "active") {
                        let tripTime = moment.utc(data.waypointstatus).format("YYYY-MM-DD HH:mm:ss");
                        let currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
                        if (AppState.currentState === "active" && global.isTrackVehicle) {
                            if (moment(currentTime).isSameOrAfter(tripTime)) {
                                EventRegister.emit('wayPointApiEvent', 'call waypoint api from pushy')
                            }
                        }
                    }
                } else if (pushData.hasOwnProperty("T")) {
                    if (pushData.T === "TC") {
                        let notificationTitle = data.hasOwnProperty("sender") ? data.sender : "";
                        let notificationText = data.hasOwnProperty("text") ? data.text || data.message  : "";
                        if (notificationText != '') {
                            if (AppState.currentState === "active") {
                                if (global.isChatScreen) {
                                    EventRegister.emit(TYPE.CHAT, data)
                                } else {
                                    if (Platform.OS === 'ios') {
                                        showMessage({
                                            message: "Co-passenger " + data.sender + " says:",
                                            type: "info",
                                            description: data.text || data.message || "",
                                            onPress: () => {
                                                EventRegister.emit(TYPE.CHAT, data);
                                            }
                                        });
                                    } else if (Platform.OS === "android") {
                                        // Pushy.setNotificationIcon("ic_launcher");
                                        // Pushy.notify(notificationTitle, notificationText, pushData);
                                        PushNotification.localNotification({
                                            channelId : "rmemp-app",
                                            autoCancel: true,
                                            largeIcon: "ic_launcher", // (optional) 
                                            smallIcon: "ic_launcher",
                                            title: "Co-passenger " + data.sender + " says:",
                                            message: notificationText,
                                            bigText: notificationText,
                                            // subText: pushData.T,
                                        });
                                        EventRegister.emit(TYPE.CHAT, data);
                                    }
                                }
                            } else {
                                if (Platform.OS === "ios") {
                                    showMessage({
                                        message: notificationTitle,
                                        type: "info",
                                        description: notificationText,
                                        onPress: () => {
                                            EventRegister.emit(TYPE.CHAT, data);
                                        }
                                    });
                                } else if (Platform.OS === "android") {
                                    // Pushy.setNotificationIcon("ic_launcher");
                                    // Pushy.notify(notificationTitle, notificationText, pushData);
                                    PushNotification.localNotification({
                                        channelId : "rmemp-app",
                                        autoCancel: true,
                                        largeIcon: "ic_launcher", // (optional) 
                                        smallIcon: "ic_launcher",
                                        title: notificationTitle,
                                        message: notificationText,
                                        bigText: notificationText,
                                        // subText: pushData.T,
                                    });
                                    EventRegister.emit(TYPE.CHAT, data);
                                }
                            }
                        }
                    } else if (pushData.T === "ERCN") {
                        let notificationTitle = data.hasOwnProperty('Title') ? data.Title : (data.hasOwnProperty("title") ? data.title : "");
                        let notificationText = data.hasOwnProperty("Content") ? data.Content : (data.hasOwnProperty("content") ? data.content : "");
                        let TimeToShow = moment.utc(data.timeToShow).format("YYYY-MM-DD HH:mm:ss");
                        let currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
                        // if (moment(currentTime).isSameOrBefore(TimeToShow)) {
                        if (notificationText != '') {
                            if (AppState.currentState === "active") {
                                if (Platform.OS === 'ios') {
                                    showMessage({
                                        message: notificationTitle,
                                        type: "warn",
                                        autoHide:false,
                                        hideOnPress:true,
                                        description: notificationText,
                                        onPress: () => {
                                            EventRegister.emit(TYPE.ROSTER_CANCEL_PUSH_NOTIFICATION, data);
                                        }
                                    });
                                } else if (Platform.OS === "android") {
                                    // Pushy.setNotificationIcon("ic_launcher");
                                    // Pushy.notify(notificationTitle, notificationText, pushData);
                                    PushNotification.localNotification({
                                        channelId : "rmemp-app",
                                        autoCancel: true,
                                        largeIcon: "ic_launcher", // (optional) 
                                        smallIcon: "ic_launcher",
                                        title: notificationTitle,
                                        message: notificationText,
                                        bigText: notificationText,
                                        // subText: pushData.T,
                                    });
                                    EventRegister.emit(TYPE.ROSTER_CANCEL_PUSH_NOTIFICATION, data);
                                }
                            } else {
                                if (Platform.OS === "ios") {
                                    showMessage({
                                        message: notificationTitle,
                                        type: "info",
                                        autoHide:false,
                                        hideOnPress:true,
                                        description: notificationText,
                                        onPress: () => {
                                            EventRegister.emit(TYPE.ROSTER_CANCEL_PUSH_NOTIFICATION, data);
                                        }
                                    });
                                } else if (Platform.OS === "android") {
                                    // Pushy.setNotificationIcon("ic_launcher");
                                    // Pushy.notify(notificationTitle, notificationText, pushData);
                                    PushNotification.localNotification({
                                        channelId : "rmemp-app",
                                        autoCancel: true,
                                        largeIcon: "ic_launcher", // (optional) 
                                        smallIcon: "ic_launcher",
                                        title: notificationTitle,
                                        message: notificationText,
                                        bigText: notificationText,
                                        // subText: pushData.T,
                                    });
                                    EventRegister.emit(TYPE.ROSTER_CANCEL_PUSH_NOTIFICATION, data);
                                }
                            }
                        } else {
                            console.warn('Time not matched note pushy');
                        }
                    } else if(pushData.T === "EUTN") {
                        let notificationTitle = data.hasOwnProperty("Title") ? data.Title : (data.hasOwnProperty("title") ? data.title : "");
                        let notificationText = data.hasOwnProperty("Content") ? data.Content : (data.hasOwnProperty("content") ? data.content : "");
                        if (notificationText != '') {
                            if (Platform.OS === "ios") {
                                EventRegister.emit('wayPointApiEvent', 'Call Way Point Api from Pushy.')
                            } else if (Platform.OS === "android") {
                                // Pushy.setNotificationIcon("ic_launcher");
                                // Pushy.notify(notificationTitle, notificationText, pushData);
                                PushNotification.localNotification({
                                    channelId : "rmemp-app",
                                    autoCancel: true,
                                    largeIcon: "ic_launcher", // (optional) 
                                    smallIcon: "ic_launcher",
                                    title: notificationTitle,
                                    message: notificationText,
                                    bigText: notificationText,
                                    // subText: pushData.T,
                                });
                                EventRegister.emit('wayPointApiEvent', 'Call Way Point Api from Pushy.')
                            }
                        }
                    } else {
                        let notificationTitle = data.hasOwnProperty("Title") ? data.Title : (data.hasOwnProperty("title") ? data.title : "");
                        let notificationText = data.hasOwnProperty("Content") ? data.Content : (data.hasOwnProperty("content") ? data.content : "");
                        if (notificationText != '') {
                            if (Platform.OS === "ios") {
                                showMessage({
                                    message: notificationTitle,
                                    type: "info",
                                    autoHide:true,
                                    hideOnPress:false,
                                    description: notificationText,
                                    onPress: () => {
                                        if (pushData.hasOwnProperty("T") && pushData.T === "EUNP") {
                                            EventRegister.emit(TYPE.NOTIFICATION_TEXT, data);
                                        } else if (pushData.hasOwnProperty("T") && pushData.T === "EASP") {
                                            EventRegister.emit(TYPE.AD_HOC_PUSH_NOTIFICATION, data);
                                        } else if (pushData.hasOwnProperty("T") && pushData.T === "ERCN") {
                                            EventRegister.emit(TYPE.ROSTER_CANCEL_PUSH_NOTIFICATION, data);
                                        }else if(data.hasOwnProperty("T") && data.T === "EUTN"){
                                            EventRegister.emit('wayPointApiEvent', 'call waypoint api from pushy')
                                        }
                                    }
                                });
                            } else if (Platform.OS === "android") {
                                // Pushy.setNotificationIcon("ic_launcher");
                                // Pushy.notify(notificationTitle, notificationText, pushData);
                                PushNotification.localNotification({
                                    channelId : "rmemp-app",
                                    autoCancel: true,
                                    largeIcon: "ic_launcher", // (optional) 
                                    smallIcon: "ic_launcher",
                                    title: notificationTitle,
                                    message: notificationText,
                                    bigText: notificationText,
                                    // subText: pushData.T,
                                });
                                if (pushData.hasOwnProperty("T") && pushData.T === "EUNP") {
                                    EventRegister.emit(TYPE.NOTIFICATION_TEXT, data);
                                } else if (pushData.hasOwnProperty("T") && pushData.T === "EASP") {
                                    EventRegister.emit(TYPE.AD_HOC_PUSH_NOTIFICATION, data);
                                } else if (pushData.hasOwnProperty("T") && pushData.T === "ERCN") {
                                    EventRegister.emit(TYPE.ROSTER_CANCEL_PUSH_NOTIFICATION, data);
                                }else if(data.hasOwnProperty("T") && data.T === "EUTN"){
                                    EventRegister.emit('wayPointApiEvent', 'call waypoint api from pushy')
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    getNotificationCount() {
        this.props.homeStore.getNotificationsCount(this);
    }

    handleDirectLaunch() {
        setTimeout(() => {
            // console.warn('calling DirectAppLaunch modal ', this.state.disableAppDirectLaunch);
            // console.warn('DL ', this.state.deepLink);
            // console.warn('CAPI- ', this.state.CustomerUrl);
            if (this.state.deepLink == null && this.state.disableAppDirectLaunch && this.state.disableAppDirectLaunch.includes(this.state.CustomerUrl)) {
                this.setState({
                    visibleModal: "DirectAppLaunch" 
                })
            }
        }, 200);
    }

    handleOpenURL = (event) => { // D
        if (event.url) {
            this.navigate(event.url);
        }
    }

    navigate = (url) => { // E
        // console.warn('URL ', url);
        const { navigate } = this.props.navigation;
        const route = url ? url.replace(/.*?:\/\//g, '') : '';
        const id = route.match(/\/([^\/]+)\/?$/)[1];
        const routeName = route.split('/')[0];

        console.warn('route - ', route, ' | id - ', id, ' | routeName - ', routeName);
        if (routeName === 'roster') {
            navigate('RosterCalendar') // , { id, name: 'chris' }
        };
    }

    showLoaderScreen() {
        return (
            <View
                style={{
                    justifyContent: "center",
                    alignContent: "flex-start",
                    flex: 1,
                    backgroundColor: colors.BACKGROUND
                }}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={logo}
                        defaultSource={logo}
                        resizeMethod="scale"
                        resizeMode="cover"
                        style={styles.logo}
                    />
                    <ActivityIndicator size={"large"} color={colors.BLACK}/>
                    <Text style={[styles.text,{color:colors.BLACK}]}>Please wait...</Text>
                    <StatusBar barStyle="default"/>
                </View>
            </View>
        );
    }

    checkForActiveTrips(){
        // this.setState({activeTrip:true});
        if (this.state.activeTrip) {
            this.props.homeStore.checkActiveTrip(this.props.navigation).then((response)=>{
                console.warn('res active trip - ', response);
                    this.setState({activeTrip:false});
            }).catch(()=>{
                // this.setState({activeTrip:false});
            })
        }
    }

    getLocationPicker(selectedLocation, selectLat, selectLng) {
        let body = {
            Latitude: selectLat,
            Longitude: selectLng,
            MetaData: this.state.empVerifyGeoCode.metaData
        };
        this.setState({ isLoading: true });
        API.newFetchJSON(
            URL.UPDATE_GEO_CODE,
            body,
            true,
            this.callback,
            TYPE.UPDATE_GEO_CODE
        );
    }

    navigationHandler(page, body) {
        const { navigate } = this.props.navigation;
        navigate(page, body);
    }

    toggle() {
        console.warn('sidemenu clicked');
        if (!this.state.isOpen) {
            this.refreshAnnouncment();
        }
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    updateMenuState(isOpen) {
        this.setState({ isOpen });
    }

    _onRefresh() {
        //Dummy method to override Feedback method
    }
    showPreviousTripPopup() {
        setTimeout(() => {
            this.setState({ visibleModal: "feedback", tempRating: 0.0 });
        }, 0);
    }

    showPreviousdayTrip(
        UserId,
        CustomerUrl,
        access_token,
        lastTripId,
        lastRatedDate
    ) {
        if (!this.state.isHome) return;
        if (!UserId) return;
        let url =
            URL.FEEDBACK_PREVIOUS_DAY +
            "devicecode=" +
            UserId +
            "&apiurl=" +
            CustomerUrl;
        API.newFetchXJSON(
            url,
            access_token,
            this.callback.bind(this),
            TYPE.FEEDBACK_PREVIOUS_DAY,
            {
                access_token,
                UserId,
                CustomerUrl,
                lastTripId,
                lastRatedDate
            }
        );
    }

    clearAuthAndLogout(isManuallyLoggedOut) {
        if (!this.state.isHome) return;
        const { navigate, reset } = this.props.navigation;
        AsyncStorage.clear(() => {
            reset({
                routes: [{ name: 'Auth' }]
            })
        });
        // AsyncStorage.multiRemove(asyncStorageAllKeys, err => {
        //     if (isManuallyLoggedOut) {
        //         // navigate("Auth"); // SSOEmail
        //         reset({
        //             routes: [{ name: 'Auth' }]
        //         })
        //     } else {
        //         AsyncStorage.getItem(asyncString.DOMAIN_NAME).then(domainName => {
        //             if (domainName) {
        //                 let response = API.fetchGET(URL.SSO_CHECK + domainName);
        //                 if (response) handleResponse.checkSSO(response, this, domainName);
        //             } else {
        //                 // navigate("Auth"); // SSOEmail
        //                 reset({
        //                     routes: [{ name: 'Auth' }]
        //                 })
        //             }
        //         });
        //     }
        // });
        clearInterval(this.timer);
    }

    GetMenuOptionIVR(navigate, type) {
        console.warn("here i am ");
        this.setState({ isLoading: true });
        let body = {
            CustomerUrl: this.state.CustomerUrl,
            userId: this.state.UserId
        };
        API.newFetchJSON(URL.IVR, body, false, this.callback.bind(this), TYPE.IVR, {
            type
        });
    }

    _renderItem(tip) {
        if (tip.item.contentType === "text/plain")
            return (
                <Box
                    transparent
                    style={
                        { width: ItemWidth, backgroundColor: colors.WHITE, padding: 15 } //height: ItemHeight,
                    }
                >
                    <HStack >
                        <View style={styles.smallIcon}>
                            <Image
                                defaultSource={require("../../assets/dashboard/tips.png")}
                                source={require("../../assets/dashboard/tips.png")}
                                resizeMethod="scale"
                                resizeMode="cover"
                                style={styles.smallIcon}
                            />
                        </View>
                        <Text
                            style={{
                                marginLeft: 10,
                                marginRight: 10,
                                fontSize: 12,
                                fontWeight: "700",
                                fontFamily: "Helvetica",
                                color: colors.BLACK
                            }}
                        >
                            {tip.item.title}
                        </Text>
                    </HStack>
                    <HStack>
                        <Stack>
                            <Text style={{ fontSize: 12, fontFamily: "Helvetica", color: colors.BLACK }}>
                                {tip.item.content}
                            </Text>
                        </Stack>
                    </HStack>
                </Box>
            );
        else {
            return (
                <Box
                    transparent
                    style={{ width: ItemWidth, backgroundColor: colors.WHITE }}
                >
                    <HStack>
                        <Text
                            style={{
                                marginLeft: 10,
                                marginRight: 10,
                                fontSize: 12,
                                fontWeight: "700",
                                fontFamily: "Helvetica",
                                color: colors.BLACK
                            }}
                        >
                            {tip.item.title}
                        </Text>
                    </HStack>
                    <HStack style={{ height: ItemWidth / 2 }}>
                        <Stack>
                            <View style={{ flex: 1 }}>
                                <View
                                    style={{
                                        height: "70%",
                                        width: "100%",
                                        paddingHorizontal: 10
                                    }}
                                >
                                    <HTML
                                        source={{html: he.decode(tip.item.content)}}
                                        imagesMaxWidth={Dimensions.get("window").width}
                                        contentWidth={Dimensions.get("window").width}
                                        tagsStyles={{
                                            html: {
                                                color: colors.BLACK
                                            }
                                        }}
                                    />
                                </View>
                                <LinearGradient
                                    start={{ x: 0, y: 0.75 }}
                                    end={{ x: 1, y: 0.25 }}
                                    colors={[colors.WHITE, colors.WHITE]}
                                    style={{
                                        flex: 1,
                                        height: "40%",
                                        width: "100%",
                                        justifyContent: "flex-end",
                                        opacity: 0.9
                                    }}
                                >
                                    <Button
                                        transparent
                                        style={{ height: "100%", backgroundColor: 'transparent' }}
                                        onPress={() => {
                                            this.navigationHandler("FullHTMLView", {
                                                html: tip.item.content,
                                                type: tip.item.contentType
                                            });
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: colors.BLUE,
                                                fontWeight: "700",
                                                width: "100%",
                                                textAlign: "left"
                                            }}
                                        >
                                            More &gt;&gt;
                                    </Text>
                                    </Button>
                                </LinearGradient>
                            </View>
                        </Stack>
                    </HStack>
                </Box>
            );
        }
    }

    _renderAnnouncementItem(announcement) {
        return (
            <View style={{ flex: 1, marginLeft: 8 }}>
                <Box transparent>
                    <HStack>
                        <View style={styles.smallIcon}>
                            <Image
                                defaultSource={require("../../assets/dashboard/annoumnet.png")}
                                source={require("../../assets/dashboard/annoumnet.png")}
                                resizeMethod="scale"
                                resizeMode="cover"
                                style={styles.smallIcon}
                            />
                        </View>
                        <Text
                            style={{
                                marginLeft: 10,
                                fontFamily: "Helvetica",
                                fontWeight: "700",
                                fontSize: 12,
                                color: colors.BLACK
                            }}
                            numberOfLines={1}
                        >
                            {announcement.item.title}
                        </Text>
                    </HStack>
                    <Stack style={{ margin: 10 }}> 
                        <Stack>
                            {/* <View height: ItemWidth / 4
                                style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}
                            > */}
                                <View
                                    style={{
                                        // height: "100%",
                                        width: "100%",
                                        flexDirection: "column",
                                        padding: 5,
                                        overflow: "hidden"
                                    }}
                                >
                                    {announcement.item.contentType.includes("text/html") ? (
                                        <HTML
                                            source={{html: he.decode(announcement.item.content)}}
                                            imagesMaxWidth={Dimensions.get("window").width}
                                            contentWidth={Dimensions.get("window").width}
                                        />
                                    ) : (
                                            <Text
                                                style={{
                                                    flex: 1,
                                                    alignSelf: "center",
                                                    marginLeft: 10,
                                                    fontSize: 12,
                                                    color: colors.BLACK
                                                }}
                                                numberOfLines={4}
                                            >
                                                {announcement.item.content}
                                            </Text>
                                        )}
                                </View>
                                </Stack>
                                <Stack>

                                {/* <LinearGradient
                                    start={{ x: 0, y: 0.75 }}
                                    end={{ x: 1, y: 0.25 }}
                                    colors={[colors.WHITE, colors.WHITE]}
                                    style={{
                                        // height: 100,
                                        width: "100%",
                                        justifyContent: "flex-end",
                                        opacity: 0.9
                                    }}
                                > */}
                                    <Button
                                        transparent
                                        style={{ backgroundColor: colors.WHITE }}
                                        onPress={() => {
                                            this.navigationHandler("FullHTMLView", {
                                                html: announcement.item.content,
                                                type: announcement.item.contentType,
                                            });
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: colors.BLUE,
                                                fontWeight: "700",
                                                width: "100%",
                                                textAlign: "left"
                                            }}
                                        >
                                            More &gt;&gt;
                                        </Text>
                                    </Button>
                                {/* </LinearGradient> */}
                                </Stack>
                            {/* </View> */}
                        {/* </Stack> */}
                    </Stack>
                </Box>
            </View>)
    }

    header() {
        return (
            <View
                style={{ marginTop: 15, height: 50, width: "100%" }}
            >
                <View>
                    <StatusBar backgroundColor={colors.BLUE} barStyle="light-content" />
                </View>
                <View
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        marginTop: Platform.OS === "ios" ? 20 : 0
                    }}
                >
                    <View style={{ flex: 1, flexDirection: "row" }}>
                        <TouchableDebounce style={{ flex: 1, flexDirection: "row" }}
                                onPress={this.toggle}
                        >
                        <MaterialIcons
                            name="menu"
                            style={{ fontSize: 30, color: "white", marginLeft: 5 }}
                        />
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: "700",
                                color: colors.WHITE,
                                marginLeft: 5,
                                marginTop: 3,
                                width: "100%"
                            }}
                            onPress={this.toggle}
                        >
                            Routematic
                        </Text>
                        </TouchableDebounce>
                        <HeaderRightWithIcon
                            bellHandler={() => {
                            //handle bell click here
                                this.props.navigation.navigate('Notifications');
                            }}
                            bellCount ={this.state.notification_count}
                          />
                    </View>
                </View>
            </View>
        );
    }

    componentWillUnmount() {
        // this.subs.forEach(sub => {
        //     sub.remove();
        // });
        clearTimeout(this.timeout);
        // AppState.removeEventListener("change", this._handleAppStateChange);
        EventRegister.removeEventListener(this.alertNotification);
        EventRegister.removeEventListener(this.adhocNotification);
        EventRegister.removeEventListener(this.rosterNotification);
        EventRegister.removeEventListener(this.feedbackNotification);
        EventRegister.removeEventListener(this.panicListener);

    }

    onStarRatingPress(rating, item, directSubmit) {
        console.warn("RATING "+JSON.stringify(item));
        this.setState({/*visibleModal: null,*/ tempRating: rating }, () => {
            if (item.feedbackRating > 0) return;
            var momentDate = moment(item.shiftTime);
            var hour = momentDate.hours();
            var minutes = momentDate.minutes();
            const { navigate } = this.props.navigation;
            let body = {
                tripId: item.tripId,
                shiftDate: item.shiftTime,
                shiftTime: hour + ":" + minutes,
                rating: rating,
                devicecode: this.state.UserId,
                categoryId: "",
                subCategoryId: "",
                comments: this.state.comment,
                apiurl: this.state.CustomerUrl
            };
            var additionalFB = false;
            var enableComment = false;
            var baseRating = 3;
            if (item.baseRating == "0") {
                baseRating = 0;
            } else if (Number(item.baseRating)) {
                baseRating = Number(item.baseRating);
            } 
            if(rating <= baseRating) additionalFB = true;
            if(!additionalFB && rating >= 4) enableComment = true;
            console.warn('additionalFB - ', additionalFB, ' | enableComment - ', enableComment);
            if (additionalFB) { // rating < 4
                this.setState({
                    isLoading: true
                });
                let feedback = {
                    tripId: item.tripId,
                    shiftDate: item.shiftTime,
                    shiftTime: hour + ":" + minutes,
                    rating: rating
                };
                setTimeout(() => {
                    let url = URL.FEEDBACK_CATEGORIES +
                    "devicecode=" +
                    this.state.UserId +
                    "&apiurl=" +
                    this.state.CustomerUrl;
                    console.warn('fburl - ', url);
                    API.newFetchXJSON(
                        url,
                        true,
                        this.callback.bind(this),
                        TYPE.FEEDBACK_CATEGORIES,
                        {
                            feedback,
                            Last24hrTrips: "Last24hrTrips"
                        }
                    );
                }, 100);
            } else if (enableComment && !directSubmit) {
                this.setState({enableComment});
                return;
            } else {
                setTimeout(() => {
                    Alert.alert(
                        "Feedback",
                        "Do you want to submit the rating?",
                        [
                            {
                                text: "No",
                                onPress: () => {
                                    this.setState({ tempRating: 0.0, enableComment: false });
                                },
                                style: "cancel"
                            },
                            {
                                text: "Yes",
                                onPress: () => {
                                    this.setState({
                                        isLoading: true
                                    });
                                    API.newFetchJSON(
                                        URL.FEEDBACK_SUBMIT,
                                        body,
                                        this.state.access_token,
                                        this.callback.bind(this),
                                        TYPE.FEEDBACK_SUBMIT,
                                        {
                                            rating,
                                            Last24hrTrips: "Last24hrTrips",
                                            lastRatedDate: this.state.lastRatedDate
                                        }
                                    );
                                }
                            }
                        ],
                        { cancelable: true }
                    );
                }, 300);
            }
        });
    }


    _renderMainScreen() {
        const HomeStore = this.props.homeStore;
        const menu = (
            <Menu
                UserName={this.state.UserName}
                isShuttleAllowed={this.state.isShuttleAllowed}
                isFixedRouteAllowed={this.state.isFixedRouteAllowed}
                isChangeAddressAllowed={this.state.isChangeAddressAllowed}
                isParkingAllowed={this.state.isParkingAllowed}
                onItemSelected={this.onMenuItemSelected}
            />
        );
        if (HomeStore.isLoading===true) return this.showLoaderScreen();
        const { navigate } = this.props.navigation;
        return (
            <SideMenu
                menu={menu}
                isOpen={this.state.isOpen}
                onChange={isOpen => this.updateMenuState(isOpen)}
                disableGestures={this.state.swipeEnabled}
            >
                {spinner.visible(this.state.isLoading || this.props.homeStore.isLoading)}
                <View
                    style={{
                        flex: 1,
                        flexDirection: "column",
                        backgroundColor: colors.BACKGROUND
                    }}
                >
                    <LinearGradient
                        start={{x: 0, y: 0.75}}
                        end={{x: 1, y: 0.25}}
                        colors={[colors.BLUE, colors.GREEN]}
                        style={styles.linearGradient}
                    >
                        {this.header()}
                        <View
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                justifyContent: "space-around",
                                alignItems: "center",
                                padding: 10
                            }}
                        >
                            <TouchableDebounce
                                style={{justifyContent: "center", alignItems: "center"}}
                                onPress={() => {
                                    this.navigationHandler("EmployeeProfile");
                                }}
                            >
                                <View style={styles.circle}>
                                    <View style={{flexDirection: "row"}}>
                                        <Image
                                            defaultSource={require("../../assets/profile/myprofilegreen.png")}
                                            source={require("../../assets/profile/myprofilegreen.png")}
                                            resizeMethod="scale"
                                            resizeMode="contain"
                                            style={{width: 64, height: 64}}
                                        />
                                    </View>
                                </View>
                                <Text style={styles.text}>My Profile</Text>
                            </TouchableDebounce>
                            <TouchableDebounce
                                    style={{ justifyContent: "center", alignItems: "center" }}
                                    onPress={() => {
                                        this.navigationHandler("MyStats", {
                                            Token: this.state.access_token
                                        });
                                    }}
                                >
                                    <View style={styles.circle}>
                                        <View style={{ flexDirection: "row" }}>
                                            <Image
                                                defaultSource={require("../../assets/actions/mystats.png")}
                                                source={require("../../assets/actions/mystats.png")}
                                                resizeMethod="scale"
                                                resizeMode="contain"
                                                style={{ width: 64, height:64}}
                                            />
                                        </View>
                                    </View>
                                    <Text style={styles.text}>My Stats</Text>
                                </TouchableDebounce>
                            {(this.state.isShuttleAllowed === "true" || this.state.isFixedRouteAllowed === "true") && (
                                <TouchableDebounce
                                    style={{justifyContent: "center", alignItems: "center"}}
                                    onPress={() => {
                                        this.setState({ isLoading: true });
                                        if (this.state.isFixedRouteAllowed === "true") {
                                            this.props.homeStore.getFixedRouteConfig(this).then((response) => {
                                                console.warn('getFixedRouteConfig res - ', response);
                                                this.setState({ isLoading: false });
                                                if (response.data.Status.Code === 200) {
                                                    if (response.data?.Data?.WorkFlowType == "1") {
                                                        this.navigationHandler("ETicketNEW", {
                                                            FRTrips: this.state.isFixedRouteAllowed
                                                        });
                                                    } else {
                                                        this.navigationHandler("ETicket", {
                                                            FRTrips: this.state.isFixedRouteAllowed
                                                        });
                                                    }
                                                } else {
    
                                                }
                                            });
                                        } else {
                                            this.props.homeStore.getShuttleConfig(this).then((response) => {
                                                console.warn('getShuttleConfig res - ', response);
                                                this.setState({ isLoading: false });
                                                if (response.data.Status.Code === 200) {
                                                    if (response.data?.Data?.WorkFlowType == "1") {
                                                        this.navigationHandler("ETicketNEW", {
                                                            FRTrips: this.state.isFixedRouteAllowed
                                                        });
                                                    } else {
                                                        this.navigationHandler("ETicket", {
                                                            FRTrips: this.state.isFixedRouteAllowed
                                                        });
                                                    }
                                                } else {
    
                                                }
                                            });
                                        }
                                    }}
                                >
                                    <View style={styles.circle}>
                                        <View style={{flexDirection: "row"}}>
                                            <Image
                                                defaultSource={require("../../assets/dashboard/pass_icon.png")}
                                                source={require("../../assets/dashboard/pass_icon.png")}
                                                resizeMethod="scale"
                                                resizeMode="contain"
                                                style={{width: 40, height: 40}}
                                            />
                                        </View>
                                    </View>
                                    <Text style={styles.text}>e-Pass</Text>
                                </TouchableDebounce>
                            )}
                            {/* <TouchableDebounce
                                style={{ justifyContent: "center", alignItems: "center" }}
                                onPress={() => {
                                    this.navigationHandler("HelpLandingPage", {
                                        Token: this.state.access_token
                                    });
                                }}
                            >
                                <View style={styles.circle}>
                                    <View style={{ flexDirection: "row" }}>
                                        <Image
                                            defaultSource={require("../../assets/covid/covidhelp.png")}
                                            source={require("../../assets/covid/covidhelp.png")}
                                            resizeMethod="scale"
                                            resizeMode="contain"
                                            style={{ width: 64, height:64}}
                                        />
                                    </View>
                                </View>
                                <Text style={styles.text}>Covid Help</Text>
                            </TouchableDebounce> */}
                            {/*<TouchableDebounce
                                style={{ justifyContent: "center", alignItems: "center" }}
                                onPress={() => {
                                    this.navigationHandler("ListScreen");
                                }}
                            >
                                <View style={styles.circle}>
                                    <View style={{ flexDirection: "row" }}>
                                        <Image
                                            defaultSource={require("../../assets/covid/covidhelp.png")}
                                            source={require("../../assets/covid/covidhelp.png")}
                                            resizeMethod="scale"
                                            resizeMode="contain"
                                            style={{ width: 64, height:64}}
                                        />
                                    </View>
                                </View>
                                <Text style={styles.text}>Test</Text>
                            </TouchableDebounce>*/}
                        </View>
                    </LinearGradient>
                    <ScrollView style={{ marginTop: 5, marginBottom: 5 }}>
                        <Box style={{ flexDirection: "row", flex: 1 }}>
                            {this.state.announcements && this.state.announcements.length > 0
                                ? this._renderAnnouncementCardsView(this.state.announcements, {
                                    autoplay: true
                                }
                                )
                                : this._renderNoAnnouncementOrTips("announcement")
                            }
                            {this.props.homeStore.isSOSVisible===true && <View
                                style={{
                                    flex: 0.2,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginRight: 10
                                }}
                            >
                                <TouchableDebounce
                                    style={{
                                        width: 60,
                                        height: 60,
                                        justifyContent: "center",
                                        alignItems: "center",
                                        borderRadius: 30,
                                        backgroundColor: colors.RED,
                                        shadowColor: "rgba(0, 0, 0, 0.5)",
                                        shadowOffset: {width: 0, height: 3},
                                        shadowRadius: 8,
                                        shadowOpacity: 1.5
                                    }}
                                    onPress={() => {
                                        this.setState({visibleModal:"panic"});
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: colors.WHITE,
                                            fontWeight: "700",
                                            fontSize: 12
                                        }}
                                    >
                                        SOS{" "}
                                    </Text>
                                </TouchableDebounce>
                            </View>}
                        </Box>
                        {Object.keys(this.state.tips).length > 0
                            ? this._renderCardsView(this.state.tips, {
                                autoplay: true
                            })
                            : this._renderNoAnnouncementOrTips("tips")}
                    </ScrollView>
                    <View style={styles.bottomBar}>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: 10,
                                paddingLeft: 20,
                                paddingRight: 20
                            }}
                        >
                            <TouchableDebounce
                                style={{ justifyContent: "center", alignItems: "center" }}
                                onPress={() => {
                                    if (HomeStore.termsChanged === true) {
                                        this.checkForTermsFlag(HomeStore,"MyTripsMobx");
                                    } else {
                                        this.navigationHandler("MyTripsMobx");
                                    }
                                }}
                            >
                                <View style={styles.barIcon}>
                                    <Image
                                        defaultSource={require("../../assets/dashboard/taxi-driver.png")}
                                        source={require("../../assets/dashboard/taxi-driver.png")}
                                        resizeMethod="scale"
                                        resizeMode="contain"
                                        style={styles.barIcon}
                                    />
                                </View>
                                <Text style={styles.barText}>My Trips</Text>
                            </TouchableDebounce>
                            <TouchableDebounce
                                style={{ justifyContent: "center", alignItems: "center" }}
                                onPress={() => {
                                    if(this.props.homeStore.termsChanged===true){
                                        this.checkForTermsFlag(this.props.homeStore,"RosterCalendar");
                                    }else {
                                        this.navigationHandler("RosterCalendar");
                                    }
                                }}
                            >
                                <View style={styles.barIcon}>
                                    <Image
                                        defaultSource={require("../../assets/dashboard/calendar.png")}
                                        source={require("../../assets/dashboard/calendar.png")}
                                        resizeMethod="scale"
                                        resizeMode="contain"
                                        style={styles.barIcon}
                                    />
                                </View>
                                <Text style={styles.barText}>Roster</Text>
                            </TouchableDebounce>
                            <TouchableDebounce
                                style={{ justifyContent: "center", alignItems: "center" }}
                                onPress={() => {
                                    if(this.props.homeStore.termsChanged===true){
                                        if(this.state.isFlexiEnabled){
                                            this.checkForTermsFlag(this.props.homeStore,"Flexi",{title:"Flexi"});
                                        }else {
                                            this.checkForTermsFlag(this.props.homeStore, "AdhocLanding", {title:  "Adhoc"});
                                        }
                                    }else {
                                        if(this.state.isFlexiEnabled){
                                            this.navigationHandler("Flexi",{title:"Flexi"});
                                        }else{
                                            this.navigationHandler("AdhocLanding",{title:"Adhoc"});
                                        }

                                    }
                                }}
                            >
                                <View style={styles.barIcon}>
                                    <Image
                                        defaultSource={require("../../assets/dashboard/flexi.png")}
                                        source={require("../../assets/dashboard/flexi.png")}
                                        resizeMethod="scale"
                                        resizeMode="contain"
                                        style={styles.barIcon}
                                    />
                                </View>
                                <Text style={styles.barText}>{this.state.isFlexiEnabled===true?"Flexi":"Adhoc"}</Text>
                            </TouchableDebounce>
                            {this.state.isFixedRouteAllowed === "true" && (
                                <TouchableDebounce
                                    style={{ justifyContent: "center", alignItems: "center" }}
                                    onPress={() => {
                                        this.setState({ isLoading: true });
                                        this.props.homeStore.getFixedRouteConfig(this).then((response) => {
                                            console.warn('getFixedRouteConfig res - ', response);
                                            this.setState({ isLoading: false });
                                            if (response.data.Status.Code === 200) {
                                                if (response.data?.Data?.WorkFlowType == "1") {
                                                    this.navigationHandler("FixedRouteCalendar");
                                                } else {
                                                    if(this.props.homeStore.termsChanged===true){
                                                        this.checkForTermsFlag(this.props.homeStore,undefined,"");
                                                    }else {
                                                        this.getFavFixedRoutes();
                                                    }
                                                }
                                            } else {

                                            }
                                        });
                                        // if (this.state.isNewFixedRouteAllowed === "true") {
                                        //     this.navigationHandler("FixedRouteCalendar");
                                        // } else {
                                        //     if(this.props.homeStore.termsChanged===true){
                                        //         this.checkForTermsFlag(this.props.homeStore,undefined,"");
                                        //     }else {
                                        //         this.getFavFixedRoutes();
                                        //     }
                                        // }
                                    }}
                                >
                                    <View style={styles.barIcon}>
                                        <Image
                                            defaultSource={require("../../assets/dashboard/bus_black.png")}
                                            source={require("../../assets/bus2.png")}
                                            resizeMethod="scale"
                                            resizeMode="contain"
                                            style={styles.barIcon}
                                        />
                                    </View>
                                    <Text style={styles.barText}>Bus</Text>
                                </TouchableDebounce>
                            )}
                            {this.state.isShuttleAllowed === "true" && (
                                <TouchableDebounce
                                    style={{ justifyContent: "center", alignItems: "center" }}
                                    onPress={() => {
                                        this.setState({ isLoading: true });
                                        this.props.homeStore.getShuttleConfig(this).then((response) => {
                                            console.warn('getShuttleConfig res - ', response);
                                            this.setState({ isLoading: false });
                                            if (response.data.Status.Code === 200) {
                                                if (response.data?.Data?.WorkFlowType == "1") {
                                                    if (response.data?.Data?.DirectCheckIn == "1") {
                                                        this.navigationHandler("ShuttleQRCode",{isEticket:false});
                                                    } else {
                                                        this.navigationHandler("ShuttleRouteListNEW");
                                                    }
                                                } else {
                                                    if(this.props.homeStore.termsChanged===true){
                                                        this.checkForTermsFlag(this.props.homeStore,"ShuttleRouteList");
                                                    }else {
                                                        this.navigationHandler("ShuttleRouteList");
                                                    }
                                                }
                                            } else {

                                            }
                                        });
                                    }}
                                >
                                    <View style={styles.barIcon}>
                                        <Image
                                            defaultSource={require("../../assets/dashboard/bus_black.png")}
                                            source={require("../../assets/dashboard/bus_black.png")}
                                            resizeMethod="scale"
                                            resizeMode="contain"
                                            style={styles.barIcon}
                                        />
                                    </View>
                                    <Text style={styles.barText}>Shuttle</Text>
                                </TouchableDebounce>
                            )}


                            <TouchableDebounce
                                style={{ justifyContent: "center", alignItems: "center" }}
                                onPress={() => this.GetMenuOptionIVR(navigate, "callTransport")}
                            >
                                <View style={styles.barIcon}>
                                    <Image
                                        defaultSource={require("../../assets/helpdesk2.png")}
                                        source={require("../../assets/helpdesk2.png")}
                                        resizeMethod="scale"
                                        resizeMode="contain"
                                        style={styles.barIcon}
                                    />
                                </View>
                                <Text style={styles.barText}>Help Desk</Text>
                            </TouchableDebounce>
                        </View>
                    </View>
                    <PopupDialog
                        height={Platform.OS === "ios" ? 0.3 : 0.25}
                        width={0.8}
                        overlayOpacity={0.7}
                        containerStyle={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            alignSelf: "center",
                            backgroundColor: "transparent"
                        }}
                        dialogAnimation={slideAnimation}
                        dialogTitle={<DialogTitle title={this.state.alertTitle} />}
                        ref={popupDialog => {
                            this.popupDialog = popupDialog;
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: "#fff",
                                justifyContent: "center",
                                alignItems: "center",
                                flex: 1,
                                flexDirection: "column"
                            }}
                        >
                            <Text
                                style={{
                                    marginTop: 20,
                                    marginLeft: 20,
                                    marginRight: 20,
                                    marginBottom: 10,
                                    justifyContent: "center",
                                    alignContent: "center",
                                    alignSelf: "center"
                                }}
                            >
                                {this.state.alertDescription}
                            </Text>
                            <Button
                                style={{
                                    width: "100%",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    bottom: 0,
                                    left: 0,
                                    right: 0
                                }}
                                onPress={() => {
                                    this.popupDialog.dismiss();
                                }}
                            >
                                <Text>Ok</Text>
                            </Button>
                        </View>
                    </PopupDialog>
                    <Modal
                        isVisible={this.state.visibleModal === "DirectAppLaunch"}
                        style={{ flex: 1, flexDirection: "column" }}
                        onRequestClose={() => {
                            RNExitApp.exitApp();
                        }}
                    >
                        <TouchableDebounce
                            style={{
                                width: "100%",
                                position: "absolute",
                                right: 10,
                                top: 25,
                                justifyContent: "center",
                                alignItems: "flex-end"
                            }}
                            onPress={() => {
                                // BackHandler.exitApp();
                                RNExitApp.exitApp();
                                this.setState({ visibleModal: null, recentlyLoggedIn: false })
                                }
                            }
                        >
                            <Text
                                style={{ color: colors.WHITE, fontWeight: "700", fontSize: 20 }}
                            >
                                Close
                            </Text>
                        </TouchableDebounce>
                        {this._renderDirectAppLaunchContent()}
                    </Modal>
                    <Modal
                        isVisible={this.state.visibleModal === "feedback"}
                        style={{ flex: 1, flexDirection: "column" }}
                        onRequestClose={() => {
                            this.setState({ visibleModal: false });
                        }}
                    >
                        {(this.state.feedbackLast24hrTrip?.isFeedbackMandatory !== "1") && (
                        <TouchableDebounce
                            style={{
                                width: "100%",
                                position: "absolute",
                                right: 10,
                                top: 25,
                                justifyContent: "center",
                                alignItems: "flex-end"
                            }}
                            onPress={() =>
                                this.setState({ visibleModal: null, recentlyLoggedIn: false })
                            }
                        >
                            <Text
                                style={{ color: colors.WHITE, fontWeight: "700", fontSize: 20 }}
                            >
                                Skip
                            </Text>
                        </TouchableDebounce>
                        )}
                        {this._renderFeedbackContent()}
                    </Modal>
                    <Modal
                        isVisible={this.state.visibleModal === "callTransport"}
                        style={styles.bottomModal}
                        onRequestClose={() => {
                            this.setState({ visibleModal: false });
                        }}
                    >
                        <TouchableDebounce
                            style={{ height: "75%", width: "100%" }}
                            onPress={() => this.setState({ visibleModal: null })}
                        />
                        {this._renderCallTransportModalContent()}
                    </Modal>
                    <Modal
                        isVisible={this.state.visibleModal==="panic"}
                        style={styles.bottomModal}
                        onRequestClose={() => {
                            this.setState({visibleModal: false});
                        }}
                    >
                        <TouchableDebounce
                            style={{height: "75%", width: "100%"}}
                            onPress={() => this.setState({visibleModal: null})}
                        />
                        {this._renderPanicModalContent()}
                    </Modal>
                </View>
            </SideMenu>
        );
    }

    _renderPanicModalContent = () => (
        <View style={styles.modalContent}>
            <RNSlidingButton
                style={{
                    borderColor: colors.RED,
                    borderWidth: 1,
                    width: "100%",
                    backgroundColor: colors.RED
                }}
                height={70}
                onSlidingSuccess={() => {
                    this.setState({visibleModal: null});
                    !this.state.isSliderLoading && this.props.homeStore.doPanic(this.state.access_token).then(()=>{
                        this.setState({visibleModal: null})
                    }).catch((error)=>{
                        if(error){
                            this.setState({visibleModal: null});
                            Alert.alert('Routematic',  loginString.somethingWentWrong);
                        }
                    });
                }}
                slideDirection={SlideDirection.RIGHT}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignContent: "center"
                    }}
                >
                    <ActivityIndicator
                        color={colors.WHITE}
                        animating={this.props.homeStore.isLoading}
                    />
                    {this.props.homeStore.isLoading && (
                        <Text
                            numberOfLines={1}
                            style={{
                                fontSize: 14,
                                fontWeight: "normal",
                                textAlign: "center",
                                color: colors.WHITE,
                                marginLeft: 10,
                                marginTop: 3
                            }}
                        >
                            REGISTERING SOS...
                        </Text>
                    )}
                    {!this.props.homeStore.isLoading && (
                        <Shimmer duration={2000}>
                          <View style={{ borderBottomWidth: 0, flexDirection: 'row', justifyContent: 'flex-start' }}>
                                {(Platform.OS == 'android')?<Text
                                        numberOfLines={1}
                                        style={{
                                            fontSize: 14,
                                            fontWeight: "normal",
                                            textAlign: "center",
                                            color: colors.WHITE,
                                            fontFamily: "Roboto",
                                            marginBottom:5
                                        }}
                                    >
                                        SLIDE RIGHT TO REGISTER SOS 
                                        <Text
                                        style={{
                                            fontSize: 25,
                                            fontWeight: "700",
                                            color: colors.WHITE,
                                            fontFamily: "Roboto",
                                            marginHorizontal: 10,
                                            right:0,
                                        }}
                                    > &gt;&gt; 
                                    </Text>        
                                    </Text>:<><Text
                                   numberOfLines={1}
                                   style={{
                                       fontSize: 14,
                                       fontWeight: "normal",
                                       textAlign: "center",
                                       color: colors.WHITE,
                                       fontFamily: "Roboto",
                                       marginTop:5
                                   }}
                               >
                                   Slide right to register SOS
                                   </Text>
                                   <FontAwesome
                                        name="angle-double-right"
                                        style={{
                                            fontSize: 30,
                                            color: colors.WHITE,
                                            marginHorizontal: 10,
                                            marginBottom:20,
                                            

                                        }}
                                    />
                                    </>}
                              </View>
                            {/* <View style={{borderBottomWidth: 0, flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        fontSize: 14,
                                        fontWeight: "normal",
                                        textAlign: "center",
                                        color: colors.WHITE,
                                        fontFamily: "Roboto",
                                        marginTop:5

                                    }}
                                >
                                    SLIDE RIGHT TO REGISTER SOS
                                </Text>
                                <FontAwesome
                                    name="angle-double-right"
                                    style={{fontSize: 30, color: colors.WHITE,marginHorizontal: 10,
                                        marginBottom:20
                                    }}
                                />
                            </View> */}
                        </Shimmer>
                    )}
                </View>
            </RNSlidingButton>
        </View>
    );

    checkForTermsFlag(HomeStore,page,body){
        HomeStore.getTermsAndConditionContent().then((value)=>{
            if(HomeStore.termsAndConditionHTMLContent.length>4){
                setTimeout(()=>{
                    Alert.alert(
                        "Routematic",
                        "Your terms and condition got changed,Please accept it to proceed further.",
                        [
                            { text: "OK", onPress: () => {
                                    this.navigationHandler("TermsAndConditions");
                                }
                            }
                        ],
                        { cancelable: false }
                    )},400);
            }else{
                if(page) this.navigationHandler(page,body);
                else this.getFavFixedRoutes();
            }
        }).catch((err)=>{
            if(err) {
                if(page)
                    this.navigationHandler(page,body);
                else this.getFavFixedRoutes();
            }
        });
    }

    checkRooted(JBDevicesAllowed) {
        if (__DEV__) return;
        let isRooted = JailMonkey.isJailBroken();
        if (!JBDevicesAllowed) {
            if (isRooted) {
                Alert.alert(
                    "Security Alert",
                    "This device is jailbroken. As per your company policy, this app cannot be used on jailbroken devices",
                    [
                        {
                            text: "Ok",
                            onPress: () => {
                                if (isRooted) {
                                    this.clearAuthAndLogout();
                                    setTimeout(() => {
                                        RNExitApp.exitApp();
                                    }, 100);
                                }
                            },
                            style: "cancel"
                        }
                    ],
                    {
                        cancelable: false
                    }
                );
            }
        }
    }


    getFavFixedRoutes() {
        let url = URL.GET_FAV_ROUTES + "?searchType=ByUserLocation";
        this.setState({ isLoading: true });
        API.newFetchXJSON(
            url,
            true,
            this.callback.bind(this),
            TYPE.GET_FAV_ROUTES
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

    render() {
        return (
            <View style={styles.container} {...this._panResponder.panHandlers}>
                {this._renderMainScreen()}
            </View>
        );
    }

    async fetchRemoteConfig() {
        console.warn('calling remoteconfig');
        await remoteConfig().fetch(0);
        setTimeout(() => {
            const activated = remoteConfig().activate();
            console.warn('remote activate ', activated);
            if (activated) {
                this.state.disableAppDirectLaunch = remoteConfig().getValue('disable_app_direct_launch').asString();

                console.warn('disable_app_direct_launch -- ', this.state.disableAppDirectLaunch);
                this.handleDirectLaunch();
            }
        }, 1000)
    }

    setupConfig() {
        AsyncStorage.multiGet(
            [
                asyncString.ACCESS_TOKEN,
                asyncString.USER_ID,
                asyncString.DTOKEN,
                asyncString.CAPI,
                asyncString.UserName,
                asyncString.JBDevicesAllowed,
                asyncString.LvTime,
                asyncString.IdleTimeOutInMins,
                asyncString.CAPI,
                asyncString.tripId,
                asyncString.lastRatedDate,
                asyncString.DMapKey,
                asyncString.DID_RE_LOGIN,
                asyncString.FEEDBACK_PREVIOUS_DAY_LAST_SAVED_SHIFT_TIME,
                asyncString.CACHED_ANNOUNCEMENTS,
                asyncString.CACHED_TIPS,
                asyncString.LAST_CACHED_ANNOUNCEMENTS_TIPS_DATE,
                asyncString.IS_SHUTTLE_ENABLED,
                asyncString.IS_FIXED_ROUTE_ENABLED,
                asyncString.IPKey,
                asyncString.REFRESH_TOKEN,
                asyncString.LV_TIME_EXPIRY_DATE,
                asyncString.PKey,
                asyncString.IS_VERIFY_GEO_CODE_ENABLED,
                asyncString.empVerifyGeoCode,
                asyncString.ScreenShotAllowed,
                asyncString.EnableFlexi,
                asyncString.SOS,
                asyncString.IS_NEW_FIXED_ROUTE_ENABLED
            ],
            (err, savedData) => {
                //Verify Geo Code
                let isVerifyGeoCode = savedData[23][1];
                let empVerifyGeoCode = savedData[24][1]
                    ? JSON.parse(savedData[24][1])
                    : false;

                if (
                    isVerifyGeoCode === "true" &&
                    empVerifyGeoCode &&
                    empVerifyGeoCode.hasOwnProperty("required") &&
                    empVerifyGeoCode.required === 1
                ) {
                    //console.warn("empVerifyGeoCode->" + JSON.stringify(empVerifyGeoCode));
                    this.setState({
                        empVerifyGeoCode,
                        isChangeAddressAllowed: "true"
                    });
                    this.openVerifyGeoCode(empVerifyGeoCode);
                }
                var _token = CryptoXor.decrypt(
                    savedData[0][1],
                    asyncString.ACCESS_TOKEN
                );
                this.setState({
                    access_token: _token,
                    UserId: savedData[1][1],
                    DToken: savedData[2][1],
                    CustomerUrl: savedData[3][1],
                    UserName: savedData[4][1],
                    JBDevicesAllowed: JSON.parse(savedData[5][1]),
                    LvTime: parseInt(savedData[6][1]),
                    IdleTimeOutInMins: parseInt(savedData[7][1]),
                    lastRatedDate: savedData[10][1],
                    DMapKey: savedData[11][1],
                    didReLogin: savedData[12][1],
                    feedbackPreviousDayLastSavedShiftTime: savedData[13][1],
                    announcements: savedData[14][1] ? JSON.parse(savedData[14][1]) : [],
                    tips: savedData[15][1] ? JSON.parse(savedData[15][1]) : [],
                    lastRefreshedAnnouncementsTips: savedData[16][1],
                    isShuttleAllowed: savedData[17][1],
                    isFixedRouteAllowed: savedData[18][1],
                    isFlexiEnabled : savedData[26][1] === "1",
                    isNewFixedRouteAllowed: savedData[28][1]
                });
                this.props.homeStore.setAccessToken(_token, savedData[3][1]);
                // this.getNotificationCount();
                let LV_TIME_EXPIRY_DATE = savedData[21][1];
                if (LV_TIME_EXPIRY_DATE) {
                    if (moment().isSameOrAfter(LV_TIME_EXPIRY_DATE)) {
                        handleResponse.expireSession(this);
                        return;
                    }
                }
                if (!savedData[1][1]) {
                    this.setState({
                        isLoading: true
                    });
                    let body = { DType: "1" };
                    API.newFetchJSON(
                        savedData[3][1] + URL.LOGIN_INFO,
                        body,
                        this.state.access_token,
                        this.callback.bind(this),
                        TYPE.LOGIN_INFO
                    );
                } else {
                    if (!global.byPassJailBroken) this.checkRooted(JSON.parse(savedData[5][1]));
                    if (savedData[11][1]) global.directionMapKey = savedData[11][1];
                    //Exposing Globally...
                    if (savedData[3][1]) global.CustomerUrl = savedData[3][1];
                    if (savedData[1][1]) global.UserId = savedData[1][1];
                    if (savedData[2][1]) global.DToken = savedData[2][1];
                    if (savedData[19][1]) {
                        if (Platform.OS === "ios") {
                            GoogleKeyManager.addEvent("Places_API_Key", savedData[19][1]);
                        }
                    }
                    if (savedData[22][1]) {
                        global.PKey = savedData[22][1];
                    }
                }
                let ScreenShotEnabled = savedData[25][1];
                if(ScreenShotEnabled==="false") {
                    if (Platform.OS === 'ios') {
                        PrivacySnapshot.enabled(true);
                    } else {
                        ScreenShot.enabled(true);
                    }
                }
                if (parseInt(savedData[6][1]) > 0) {
                    const { navigate } = this.props.navigation;
                    setTimeout(() => {
                        this.clearAuthAndLogout(navigate);
                    }, parseInt(savedData[6][1]));
                }
                if (this.state.isHome) {
                    this.checkForActiveTrips();
                    let currentTime = moment().format("YYYY-MM-DD HH:mm:ss");

                    if (
                        !this.state.lastRefreshedAnnouncementsTips ||
                        moment(currentTime).isAfter(
                            JSON.parse(this.state.lastRefreshedAnnouncementsTips)
                        )
                    ) {
                        this.refreshAnnouncment();
                    }
                }

                /************* Reducing Api calls for [Shift Time+8 hours] *************/
                let prevShiftTime = moment(
                    this.state.feedbackPreviousDayLastSavedShiftTime
                )
                    .add(8, "hours")
                    .format("YYYY-MM-DD HH:mm:ss");

                let currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
                if (
                    (this.state.isHome && moment(currentTime).isAfter(prevShiftTime)) ||
                    prevShiftTime === "Invalid date"
                ) {
                    this.showPreviousdayTrip(
                        savedData[1][1],
                        savedData[3][1],
                        _token,
                        savedData[9][1],
                        savedData[10][1]
                    );
                }

                /********** End of Reducing Api calls for Shift Time+8 hours *************/
                try {
                    let objectSOS =JSON.parse(savedData[27][1]);
                    this.props.homeStore.setData(objectSOS);
                }catch (e) {
                    console.warn("Error no data "+JSON.stringify(e));
                }

                console.warn('Saved data setup loaded ', savedData[3][1]);
            }
        );
    }

    refreshAnnouncment() {
        API.newFetchXJSON(
            URL.announcements,
            true,
            this.callback.bind(this),
            TYPE.ANNOUNCEMENT
        );
    }

    openVerifyGeoCode(empVerifyGeoCode) {
        if (!empVerifyGeoCode) return;
        this.navigationHandler("MapPicker", {
            getLocationPicker: this.getLocationPicker.bind(this),
            clusterDetails: {
                Clusterlat: empVerifyGeoCode.officeLat,
                Clusterlng: empVerifyGeoCode.officeLng,
                Clusterradius: empVerifyGeoCode.transportDistance,
                ClusterOutOfRadiusMsg: empVerifyGeoCode.distanceValidationMsg,
                addressText: empVerifyGeoCode.addressText,
                metaData: empVerifyGeoCode.metaData
            },
            enableCurrentLocation: true
        });
    }

    async checkPermissions() {
        if (Platform.OS === "android") {
            const checkPermission = await this.checkNotificationPermission();
            if (checkPermission !== RESULTS.GRANTED) {
            const request = await this.requestNotificationPermission();
                if(request !== RESULTS.GRANTED){
                    // permission not granted
                }
            }

            RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
                interval: 10000,
                fastInterval: 5000
            })
                .then(requestStatus => {
                    try {
                        PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                            {
                                title: "Current Location Permission",
                                message:
                                    "Please allow us with current location permission"
                            }
                        ).then(granted => {
                            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                                Geolocation.getCurrentPosition((data) => {
                                    this.props.homeStore.setLocation(data.coords.latitude + "," + data.coords.longitude);
                                }, (Error) => {
                                    console.warn("Error " + JSON.stringify(Error));
                                });
                            } else {
                                Alert.alert(
                                    "Oops!",
                                    "Please give permission to access your location"
                                );
                            }
                        });
                        console.warn("requestStatus " + JSON.stringify(requestStatus));
                    } catch (err) {
                        console.warn(err);
                    }
                }).catch(err => {
                console.warn("requestStatus " + JSON.stringify(err));
            });
        } else {
            Geolocation.requestAuthorization();
            Geolocation.getCurrentPosition((data) => {
                this.props.homeStore.setLocation(data.coords.latitude + "," + data.coords.longitude);
            }, (Error) => {
                console.warn("Error " + JSON.stringify(Error));
            });
        }
        console.warn("i am at checkPermissions");
        check(Platform.OS === "ios" ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
            .then(result => {
                switch (result) {
                    case RESULTS.UNAVAILABLE:
                        this.props.homeStore.setLocation("0.0,0.0");
                        break;
                    case RESULTS.DENIED:
                        this.props.homeStore.setLocation("0.0,0.0");
                        break;
                    case RESULTS.GRANTED:
                        Geolocation.getCurrentPosition((data) => {
                            this.props.homeStore.setLocation(data.coords.latitude + "," + data.coords.longitude);
                        }, (Error) => {
                            this.props.homeStore.setLocation("0.0,0.0");
                            console.warn("Error " + JSON.stringify(Error));
                        });
                        // RNGooglePlaces.getCurrentPlace()
                        //     .then(place => {
                        //         this.props.homeStore.setLocation(place[0].location.latitude + "," + place[0].location.longitude);
                        //     })
                        //     .catch(error => {
                        //         this.props.homeStore.setLocation("0.0,0.0");
                        //         console.warn(error.message)
                        //     });
                        break;
                    case RESULTS.BLOCKED:
                        this.props.homeStore.setLocation("0.0,0.0");
                        console.warn('The permission is denied and not requestable anymore');
                        break;
                }
            })
            .catch(error => {

            });
    }

    requestNotificationPermission = async () => {
      const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
      return result;
    };
    
    checkNotificationPermission = async () => {
      const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
      return result;
    };
}

Home.propTypes = {};

export default Home;
