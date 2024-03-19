import React, { Component } from "react";
import { Text, TextArea, } from "native-base";
import {
    ActivityIndicator,
    Alert,
    Image,
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
import {
    _renderWeeklyOff
} from "../roster/customeComponent/customComponent";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import TouchableDebounce from "../../utils/TouchableDebounce";
import {
    _renderCountry,
    _renderDate,
    _renderOffice,
    _renderTitleContent
} from "../roster/customeComponent/customComponent";
import { StackActions } from "@react-navigation/native";
import MapView, {Marker, PROVIDER_GOOGLE, Polyline} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {mapDelta} from "../../utils/MapHelper";
import { Button, RadioButton } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
// import * as ImagePicker from 'react-native-image-picker';
import DocumentPicker, { isCancel, types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import normalize from "../../utilities/normalize";

const ip_options = {
    quality: 1,
    maxWidth: 1280,
    maxHeight: 720,
    presentationStyle: 'popover',
    selectionLimit: 0,
    mediaType: 'photo',
    includeBase64: false,
    includeExtra: true,
}

const options = {
    presentationStyle: 'fullScreen',
    copyTo: 'cachesDirectory',
    type: [types.images, types.pdf],
}

@inject("adhocStore")
@observer
class TravelDeskReview extends Component {

    constructor(props) {
        super(props);
        this.state = ({
            title: "",
            region: {latitude: 0.0, longitude: 0.0, ...mapDelta},
            coords: []
        });
    }

    componentDidMount() {
        // if (this.state.title.toString().length <= 0) {
        //     let title = this.props.route.params.title; // ", "Ad Hoc");
        //     this.setState({ title });
        // }
        let waypoints = this.props.adhocStore.tdWayPoints;
        let coords = []
        waypoints.forEach((point, index) => {
            if (point.Latitude && point.Longitude) {
                coords.push({
                    index: index.toString(),
                    latitude: parseFloat(point.Latitude),
                    longitude: parseFloat(point.Longitude)
                });
            }
        });
        this.setState({
            coords,
            region: {latitude: waypoints[0]?.Lat, longitude: waypoints[0]?.Lng, latitudeDelta: 0.05, longitudeDelta: 0.05},
        })
        const DEFAULT_PADDING = { top: 100, right: 50, bottom: 100, left: 50 };
        setTimeout(() => {
          if (this.map) {
            this.map.fitToSuppliedMarkers(['wp1', 'wp' + waypoints.length], {
              edgePadding: DEFAULT_PADDING,
              animated: true,
            });
          }
        }, 100);

    }

    _renderSecurity(Store) {
        return (
            <View
                style={{
                    flexDirection: "row",
                    // marginHorizontal: 16,
                    marginVertical: 8
                }}
            >
                <FontAwesome
                    style={{
                        marginRight: 5,
                    }}
                    name={Store.securityEscot ? "check-square-o" : "square-o"}
                    size={30}
                    color={colors.BLACK}
                    onPress={() => {
                        Store.securityEscot = !Store.securityEscot
                    }}
                />
                <Text style={{
                    fontFamily: "Helvetica",
                    fontSize: 13,
                    textAlign: "left",
                    color: colors.BLACK,
                    fontWeight: 'bold',
                    marginLeft: 10
                }}>Security Escort</Text>
            </View>
        )
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
                            
                            <View style={{
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>
                                <MapView
                                style={styles.map}
                                ref={map => (this.map = map)}
                                initialRegion={this.state.region}
                                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                                >
                                    {adhocStoreObject.tdWayPoints.map((data, index) => {
                                        console.warn('wp - ', index, data);
                                        if (data.Latitude && data.Longitude) {
                                            return (
                                                <Marker
                                                    identifier={'wp' + (index + 1)}
                                                    ref={marker => {
                                                        this.marker = marker;
                                                    }}
                                                    key={index}
                                                    title={data.WayPointName}
                                                    description={"Stage :  " + (index + 1)}
                                                    coordinate={{
                                                        latitude: parseFloat(data.Latitude),
                                                        longitude: parseFloat(data.Longitude)
                                                    }}
                                                >
                                                    <Image
                                                        source={require("../../assets/waypoint.png")}
                                                        style={styles.icon_image_style}
                                                    />
                                                </Marker>
                                            );
                                        }
                                    })}

                                    {/* <Polyline
                                        coordinates={this.state.coords.length > 0 ? this.state.coords : []}
                                        strokeWidth={3}
                                        strokeColor={colors.BLUE}
                                    /> */}
                                    <MapViewDirections
                                        origin={this.state.coords[0]}
                                        waypoints={ (this.state.coords.length > 2) ? this.state.coords.slice(1, -1): undefined}
                                        destination={this.state.coords[this.state.coords.length-1]}
                                        apikey={global.directionMapKey}
                                        strokeWidth={3}
                                        strokeColor={colors.BLUE}
                                        optimizeWaypoints={true}
                                    />
                                </MapView>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>
                                {adhocStoreObject.travelDistanceKm > 0 && (
                                    <View style={{
                                        flexDirection: 'row',
                                        width: '50%'
                                    }}>
                                        <Text style={[inputLabel, {width: '50%', fontSize: 10 }]}>Total Est. Kms</Text>
                                        <Text style={[itemName, {width: '50%'}]}>{adhocStoreObject.travelDistanceKm} Km</Text>
                                    </View>
                                )}

                                {adhocStoreObject.travelTimeHM != 0 && (
                                    <View style={{
                                        flexDirection: 'row',
                                        width: '50%'
                                    }}>
                                        <Text style={[inputLabel, {width: '60%', fontSize: 10 }]}>Total Travel Time</Text>
                                        <Text style={[itemName, {width: '40%'}]}>{adhocStoreObject.travelTimeHM}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                // alignItems: 'center',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>
                                <View style={{
                                    flex: 0.8
                                }}>
                                    <RadioButton.Group 
                                    onValueChange={value => {
                                        adhocStoreObject.approvalType = value
                                        if (adhocStoreObject.approvalType == 'POST') {
                                            adhocStoreObject.preApprovedDocType = '';
                                            adhocStoreObject.preApprovedDocData = '';
                                        }
                                    }} 
                                    value={adhocStoreObject.approvalType}>
                                        <RadioButton.Item labelStyle={inputText} color="#000" label="Pre Approved" value="PRE" />
                                        <RadioButton.Item labelStyle={inputText} color="#000" label="Post Approval" value="POST" />
                                    </RadioButton.Group>
                                </View>

                                {adhocStoreObject.approvalType == 'PRE' && (
                                    <TouchableOpacity style={{
                                        flex: 0.2,
                                        width: 60,
                                        height: 40,
                                        alignItems: 'center',
                                        marginTop: 8
                                        // borderColor: colors.GRAY,
                                        // borderWidth: 1,
                                        // borderRadius: 5,
                                        // backgroundColor: colors.LIGHT_GRAY
                                    }}
                                    onPress={() => {
                                        // ImagePicker.launchImageLibrary(options)
                                        // .then(res => {
                                        //   if (res.didCancel) {
                                        //     console.log('User cancelled');
                                        //   } else if (res.error) {
                                        //     console.log('Error', res.error);
                                        //   } else {
                                        //     console.log('Picker Response:', res);
                                        //     this.setState({imageObject: res});
                                        //   }
                                        // })
                                        // .catch(err => {
                                        //   console.log('err', err);
                                        // });

                                        DocumentPicker.pickSingle(options)
                                        .then(res => {
                                            console.warn('DocumentPicker - ', res);
                                            if (res) {
                                                console.log('Picker Response:', res);
                                                RNFS.readFile(res.uri, 'base64')
                                                .then(base64 => {
                                                console.log(base64);
                                                adhocStoreObject.preApprovedDocType = res.type;
                                                adhocStoreObject.preApprovedDocData = base64;
                                                });
                                            }
                                        })
                                        .catch(err => {
                                            if (isCancel(err)) {
                                                console.log('User cancelled');
                                            }
                                        console.log('err', err);
                                        });
                                    }}
                                    >
                                        <MaterialCommunityIcons
                                            name={"cloud-upload"}
                                            size={35}
                                            color={colors.BLUE}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {adhocStoreObject.approvalType == 'POST' && (
                                <View style={{
                                    flexDirection: 'column',
                                    marginHorizontal: 16,
                                    marginVertical: 8
                                }}>
                                    <Text style={[inputLabel]}>Line Manager</Text>
                                    <TextInput
                                        style={inputText}
                                        numberOfLines={1}
                                        editable={false}
                                        value={adhocStoreObject.lineManager}
                                    />
                                    <View style={line} />
                                </View>
                            )}

                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>
                                {this._renderSecurity(adhocStoreObject)}

                                <TouchableOpacity style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    width: 180,
                                    height: 40,
                                    alignItems: 'center',
                                    borderColor: colors.GRAY,
                                    borderWidth: 1,
                                    borderRadius: 5,
                                    paddingHorizontal: 10,
                                    backgroundColor: colors.LIGHT_GRAY
                                }}
                                onPress={() => {
                                    DocumentPicker.pickSingle(options)
                                    .then(res => {
                                        console.warn('DocumentPicker - ', res);
                                        if (res) {
                                            console.log('Picker Response:', res);
                                            RNFS.readFile(res.uri, 'base64')
                                            .then(base64 => {
                                            console.log(base64);
                                            adhocStoreObject.itineraryDocType = res.type;
                                            adhocStoreObject.itineraryDocData = base64;
                                            });
                                        }
                                    })
                                    .catch(err => {
                                        if (isCancel(err)) {
                                            console.log('User cancelled');
                                        }
                                    console.log('err', err);
                                    });
                                }}
                                >
                                    <Text style={inputLabel}>Upload Itinerary</Text>
                                    <MaterialCommunityIcons
                                        name={"cloud-upload"}
                                        size={35}
                                        color={colors.BLUE}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={{
                                flexDirection: 'column',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>
                                <Text style={[inputLabel, { marginBottom: 5 }]}>Note to Admin</Text>
                                <TextArea
                                    ref={adminremarkRef => {
                                        this.adminremarkRef = adminremarkRef;
                                    }}
                                    style={textInput}
                                    numberOfLines={4}
                                    maxLength={1000}
                                    onChangeText={text => {
                                        adhocStoreObject.noteToAdmin = text
                                    }}
                                    value={adhocStoreObject.noteToAdmin}
                                />
                            </View>

                            <View style={{
                                flexDirection: 'column',
                                marginHorizontal: 16,
                                marginVertical: 8
                            }}>
                                <Text style={[inputLabel, { marginBottom: 5 }]}>Note to Driver</Text>
                                <TextArea
                                    ref={driverNoteRef => {
                                        this.driverNoteRef = driverNoteRef;
                                    }}
                                    style={textInput}
                                    numberOfLines={3}
                                    returnKeyType="done"
                                    maxLength={1000}
                                    onChangeText={text => {
                                        adhocStoreObject.noteToDriver = text
                                    }}
                                    value={adhocStoreObject.noteToDriver}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <TouchableDebounce
                        style={buttonStyle}
                        onPress={() => {
                            if (adhocStoreObject.isLoading) return;

                            if (adhocStoreObject.approvalType == 'PRE' && !adhocStoreObject.preApprovedDocData) {
                                Alert.alert('Travel Desk', "Please upload pre approval document");
                                return;
                            }

                            adhocStoreObject.SaveTravelDesk(this.state).then(() => {
                                if (adhocStoreObject.apiSuccess.Status === "200") {
                                    adhocStoreObject.resetStore();
                                    this.props.navigation.dispatch(StackActions.popToTop());
                                }
                            });
                        }}
                    >
                        {adhocStoreObject.isLoading ? (
                            <ActivityIndicator color={colors.WHITE} animating={true} />
                        ) : (
                            <Text style={bottomButton}>
                                SUBMIT
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

const textInput = {
    fontSize: 16,
    fontWeight: '500',
    color: colors.BLACK,
    borderWidth: 1,
    borderRadius: 3,
    borderColor: colors.GRAY,
    backgroundColor: colors.LIGHT_GRAY,
    // marginTop: 5,
    padding: 10
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

const styles = StyleSheet.create({
    map: {
      width: '100%',
      height: normalize(200),
      // ...StyleSheet.absoluteFillObject,
    //   marginVertical: normalize(32),
      backgroundColor: colors.LIGHT_BLUE,
    },
    callout: {
      width: 300,
      backgroundColor: "white",
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
      padding: 4
    },
    title: {
      color: "black",
      fontSize: 14,
      lineHeight: 18,
      flex: 1,
      fontFamily: 'Poppins'
    },
    description: {
      color: "#707070",
      fontSize: 12,
      lineHeight: 16,
      flex: 1,
      fontFamily: 'Poppins'
    },
    icon_image_style: {
        width: 35,
        height: 35
    }
  });

export default TravelDeskReview;