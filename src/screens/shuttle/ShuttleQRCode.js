import { Text, TouchableOpacity, View} from 'react-native';
import React, { Component } from "react";
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { TYPE } from "../../model/ActionType";
import { API } from "../../network/apiFetch/API";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import { URL } from "../../network/apiConstants";
import QRCodeScanner from 'react-native-qrcode-scanner';
import QRCode from "react-native-qrcode-svg";
import { Button, ScrollView } from "native-base";
import { colors } from "../../utils/Colors";

import Geolocation from '@react-native-community/geolocation';
import { RNCamera } from 'react-native-camera';
import moment from "moment";
// import { StackActions } from '@react-navigation/native';
let datas = [
    {
        "tripID": "000044104",
        "shuttleID": 2111,
        "scheduleID": 2692,
        "wayPointID": 24,
        "wayPointName": "Indiranagar",
        "latitude": "12.9777688",
        "longitude": "77.634582"
    },
    {
        "tripID": "000044104",
        "shuttleID": 2111,
        "scheduleID": 2692,
        "wayPointID": 39,
        "wayPointName": "Domlur fly over",
        "latitude": "12.959880",
        "longitude": "77.641656"
    },
    {
        "tripID": "000044104",
        "shuttleID": 2111,
        "scheduleID": 2692,
        "wayPointID": 40,
        "wayPointName": "Manipal",
        "latitude": "12.959719",
        "longitude": "77.650593"
    },
    {
        "tripID": "000044104",
        "shuttleID": 2111,
        "scheduleID": 2692,
        "wayPointID": 41,
        "wayPointName": "Murgesh palya",
        "latitude": "12.959207",
        "longitude": "77.656224"
    }];
class ShuttleQRCode extends Component {

    static navigationOptions = () => {
        return {
            title: "Scan QR"
        };
    };
    state = {
        isLoading: false,
        QRCode: '',
        passId: '',
        passName: '',
        isFacilityPass: false,
        isFlash: false,
        lat:0.0,
        lng:0.0,
        data:[],
        isEticket: false,
    };

    barcodeReceived = (event) => {
        console.log('Sugan QR',"-----"+JSON.stringify(event));
        this.setState({ QRCode: event.data }, () => {
            if (this.state.isFacilityPass)
                this.checkinFacility();
            else
                this.checkPermissions();
        });

    };

    callback = async (actionType, response) => {
        switch (actionType) {
            case TYPE.SHUTTLE_CHECKIN: {
                console.warn(response);
                console.log('Sugan QR',"response---nnnnnnn--"+JSON.stringify(response));
                handleResponse.QRWithoutPassCheckin(this, response,this.state.lat,this.state.lng);
                break;
            }
        }
    };

    UNSAFE_componentWillMount() {
        if (this.props.route.params) {
            this.setState({isEticket:this.props.route.params.isEticket});
            // this.setState({
            //     passId: this.props.route.params.passId,
            //     passName: this.props.route.params.passName,
            //     isFacilityPass: this.props.route.params.isFacilityPass,
            //     // QRCode: 'ft=1&sn=1&rn=Porche'
            //})
        }
        this.checkForFlash();
    }

    checkForFlash() {
        let startEnd = moment().format("HH");
        if (startEnd>="18" || startEnd<"06") {
            this.setState({
                isFlash: true
            })
        } else {
            this.setState({
                isFlash: false
            })
        }
    }

    render() {
        return (
            <ScrollView contentContainerStyle={{ 
                justifyContent: "center",
                alignItems: "center",
                marginTop: 50 }}>
              
            {/* <QRCode value={this.state.ticketID} size={190} /> */}
            <QRCodeScanner
                    onRead={this.barcodeReceived}
                    flashMode={this.state.isFlash ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
                    reactivate={true}
                    reactivateTimeout={5000}
                    showMarker={true}
                   // onPress={this.checkinFacility}
                />
            {this.state.isEticket?<></>:<><Text style={{ color: colors.RED,fontWeight:'bold',marginTop:70 }}>
                  OR
                </Text>

            <View style={{  width: "50%", marginTop: 30 }}>
              <Button
                backgroundColor={colors.BLUE}
                onPress={() => {
             
               //   this.props.navigation.navigate("ShuttleRouteListNEW");
                  this.props.navigation.navigate("ShuttleRouteListRoute",{
                        Lat:this.state.lat,
                        Lng:this.state.lng
                   });

                //    this.props.navigation.navigate("ShuttleQRCheckIn",{
                //     data:datas,
                //     Lat:this.state.lat,
                //     Lng:this.state.lng
                //    });
                 //this.checkinFacility();
                 // }
                }}
              >
                <Text style={{ color: colors.WHITE }}>
                  Check the next shuttle
                </Text>
              </Button>
            </View></>}

            </ScrollView>
        )
    }

    checkinFacility() {
        console.log('Sugan QR',"-QR Code----"+JSON.stringify(this.state.QRCode));
        console.log('Sugan QR',"-lat----"+JSON.stringify(this.state.lat));
        console.log('Sugan QR',"-lng----"+JSON.stringify(this.state.lng));

        let body = {
            QrCode: this.state.QRCode,
            Lat: this.state.lat,
            Lng: this.state.lng
        };
        let bodynew = {
            QRCode:"regno=OR051234",
            Lat:"12.978233",
            Lng:"77.638481"
        };
        API.newFetchJSON(
            URL.QR_WITHOUTPASS_CHECKINV2,
            body,
            true,
            this.callback.bind(this),
            TYPE.SHUTTLE_CHECKIN,
            null
        );
        // URL.FACILITY_PASS_CHECKIN,
        // body,
        // true,
        // this.callback.bind(this),
        // TYPE.FACILITY_PASS_CHECKIN,
        // null
    }
    checkPermissions() {
        check(Platform.OS === "ios" ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
            .then(result => {
                switch (result) {
                    case RESULTS.UNAVAILABLE:
                        this.checkIn(0.0, 0.0);
                        break;
                    case RESULTS.DENIED:
                        this.checkIn(0.0, 0.0);
                        break;
                    case RESULTS.GRANTED:
                        try {
                            Geolocation.getCurrentPosition((data) => {
                                this.checkIn(data.coords.latitude, data.coords.longitude);
                            }, (Error) => {
                                console.warn("Error " + JSON.stringify(Error));
                                this.checkIn(0.0, 0.0);
                            }, { enableHighAccuracy: false, timeout: 50000 });
                        } catch (e) {
                            this.checkIn(0.0, 0.0);
                        }
                        break;
                    case RESULTS.BLOCKED:
                        this.checkIn(0.0, 0.0);
                        break;
                }
            })
            .catch(error => {

            });
    }

    checkIn(lat, lng) {
        this.setState({lat:lat,lng:lng});
        let body = {
            QRCode: this.state.QRCode,
            // PassID: this.state.passId,
            lat: lat,
            lng: lng
        };
        console.warn('body - ', body);
        API.newFetchJSON(
            URL.QR_WITHOUTPASS_CHECKINV2,
            body,
            true,
            this.callback.bind(this),
            TYPE.SHUTTLE_CHECKIN,
            null
        );
    }

    // getFixedRouteDetailShowSOS(){
    //     API.newFetchXJSON(
    //         URL.GET_FixedRoute_Details,
    //         true,
    //         this.callback.bind(this),
    //         TYPE.SOS,
    //         null
    //     );
    // }

    // getMyTripsUpdate() {
    //     console.warn('callback to mytrips');
    //     this.props.route.params.returnData();
    //     this.props.navigation.goBack();
    // }

}

export default ShuttleQRCode;
