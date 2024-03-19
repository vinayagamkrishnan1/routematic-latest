import { Text, TouchableOpacity, View, } from 'react-native';
import React, { Component } from "react";
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { TYPE } from "../../model/ActionType";
import { API } from "../../network/apiFetch/API";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import { URL } from "../../network/apiConstants";
import QRCodeScanner from 'react-native-qrcode-scanner';
import Geolocation from '@react-native-community/geolocation';
import { RNCamera } from 'react-native-camera';
import moment from "moment";
// import { StackActions } from '@react-navigation/native';

class QRScanner extends Component {

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
        isShuttlePass: false,
        isFlash: false
    };

    barcodeReceived = (event) => {
        this.setState({ QRCode: event.data }, () => {
            if (this.state.isFacilityPass)
                this.checkinFacility();
            else
                this.checkPermissions();
        });

    };

    callback = async (actionType, response) => {
        switch (actionType) {
            case TYPE.FIXED_ROUTE_CHECKIN: {
                handleResponse.fixedRouteCheckin(this, response);
                break;
            }
            case TYPE.SHUTTLE_CHECKIN: {
                handleResponse.shuttleCheckin(this, response);
                break;
            }
            case TYPE.FACILITY_PASS_CHECKIN: {
                console.warn(response);
                handleResponse.facilityPassCheckin(this, response);
                break;
            }
            case TYPE.SOS: {
                handleResponse.fixedRouteSOS(this, response);
                break;
            }
        }
    };

    UNSAFE_componentWillMount() {
        if (this.props.route.params) {
        console.log('QR params - ', this.props.route.params);
            this.setState({
                passId: this.props.route.params.passId,
                passName: this.props.route.params.passName,
                isFacilityPass: this.props.route.params.isFacilityPass,
                isShuttlePass: this.props.route.params.isShuttlePass,
            })
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
            <View style={{ flex: 1 }}>
                <QRCodeScanner
                    onRead={this.barcodeReceived}
                    flashMode={this.state.isFlash ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
                    reactivate={true}
                    reactivateTimeout={5000}
                    showMarker={true}
                />
            </View>
        )
    }

    checkinFacility() {
        let body = {
            QrCode: this.state.QRCode,
            facilityTypeId: this.state.passId.toString(),
            facilityTypeName: this.state.passName
        };
        API.newFetchJSON(
            URL.FACILITY_PASS_CHECKIN,
            body,
            true,
            this.callback.bind(this),
            TYPE.FACILITY_PASS_CHECKIN,
            null
        );
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
        if (this.state.isShuttlePass) {
            let body = {
                QRCode: this.state.QRCode,
                ticketID: this.state.passId,
                lat: lat,
                lng: lng
            };
            console.warn('checkin body - ', body);
            API.newFetchJSON(
                URL.SHUTTLE_CHECKIN,
                body,
                true,
                this.callback.bind(this),
                TYPE.SHUTTLE_CHECKIN,
                null
            );
        } else {
            let body = {
                QRCode: this.state.QRCode,
                lat: lat,
                lng: lng
            };
            API.newFetchJSON(
                URL.FIXED_ROUTE_CHECKIN,
                body,
                true,
                this.callback.bind(this),
                TYPE.FIXED_ROUTE_CHECKIN,
                null
            );
        }
    }

    getFixedRouteDetailShowSOS(){
        API.newFetchXJSON(
            URL.GET_FixedRoute_Details,
            true,
            this.callback.bind(this),
            TYPE.SOS,
            null
        );
    }

    getMyTripsUpdate() {
        console.warn('callback to mytrips');
        this.props.route.params.returnData();
        this.props.navigation.goBack();
    }

}

export default QRScanner;
