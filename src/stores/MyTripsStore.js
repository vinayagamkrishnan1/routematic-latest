import {action, makeAutoObservable, observable, runInAction, when} from 'mobx';
import axios from "axios";
import {isLimitExceded, isWithinCutOff, isWithInTimeFrame} from "../utils/customFunction";
import {appVersion, loginString, noShow} from "../utils/ConstantString";
import {Alert, Platform} from "react-native";
import * as Alert1 from "../utils/Alert";
import {URL} from "../network/apiConstants";
import {handleResponse} from "../network/apiResponse/HandleResponse";
import { style } from 'deprecated-react-native-prop-types/DeprecatedViewPropTypes';
import moment from 'moment';

class MyTripsStore {
    @observable noTrips = false;
    @observable MyTripsErrorMessage = "";
    @observable MyTripsData = [];
    @observable isLoading = true;
    @observable visibleOptOutModal = false;
    @observable optOutAccepted = false;
    @observable disclaimerType = "";
    @observable isRosterOptOutEnabled = "true";
    @observable acceptedType = "";
    @observable accepted = false;
    @observable optOutContent = "";
    @observable selectedTrip = {};
    @observable LoginCutoffMinutes = 0;
    @observable LogoutCutoffMinutes = 0;
    @observable NoShowCount = {};
    @observable NoShowErrorMessage = "";
    @observable accessToken = null;
    @observable cancelUrl = null;
    @observable afterCancel = false;
    @observable visibleCheckInModal = false;
    @observable visibleCheckOutModal = false;
    @observable visiblePanicModal = false;
    @observable visibleSafeDropModal = false;
    @observable visibleFeedbackModal = false;
    @observable TripId;
    @observable programType;
    @observable location = "0,0";
    @observable customUrl = "";
    @observable trackingData={};
    @observable UserId="";
    @observable message="";
    @observable NoShowData={};
    @observable checkinCheckoutDisabled=false;
    @observable safeDropTrip={};

    constructor() {
        makeAutoObservable(this)
    }

    @action setInitMyTripsValues(disclaimerType, isRosterOptOutEnabled, accessToken, url,customUrl,userId) {
        console.warn('my trip init store ');
        this.disclaimerType = disclaimerType;
        this.isRosterOptOutEnabled = isRosterOptOutEnabled;
        this.accessToken = accessToken;
        this.cancelUrl = url;
        this.customUrl=customUrl;
        this.UserId=userId;
        // this.getMyTripData();
        this.isLoading = false;
    }

    clearMyTripProps(){
        this.NoShowData={};
        this.TripId=undefined;
        this.programType=undefined;
        this.selectedTrip={};
    }

    @action disableOptOutVisible() {
        this.visibleOptOutModal = false;
        this.accepted = false;
        this.optOutAccepted = false;
    }

    @observable countTimer=0;

    @action
    async getMyTripData() {
        console.warn("countTimer : "+this.countTimer++);
        if(this.accessToken) {
            this.MyTripsData = [];
            this.isLoading = true;
            await axios.get(URL.NEW_GET_UPCOMING_TRIPS, {
                headers: this.getHeader()
            }).then(response => {
                runInAction(() => {
                    this.isLoading = false;
                    let data = response.data;
                    console.warn('NEW_GET_UPCOMING_TRIPS res - ', data);
                    if (data.status.code === 200) {
                        if (data.hasOwnProperty("data") && data.data.data && data.data.data.length > 0) {
                            this.noTrips = false;
                            this.LoginCutoffMinutes = data.data.loginCutoffMinutes;
                            this.LogoutCutoffMinutes = data.data.logoutCutoffMinutes;
                            this.NoShowCount = data.data.noShowCount;
                            this.NoShowErrorMessage = data.data.noShowErrorMessage;
                            this.checkinCheckoutDisabled = data.data.checkinCheckoutDisabled;
                            let array =[];
                            data.data.data.map((item)=>{
                                array.push(item);
                            });
                            this.MyTripsData.replace(array);
                        } else {
                            this.noTrips = true;
                            this.MyTripsData = [];
                            this.MyTripsErrorMessage = data.status.message;
                        }
                    }
                });
            }).catch(error => {
                if (error) {
                    this.isLoading = false;
                    console.warn("Error Here in mytrips -> " + JSON.stringify(error));
                }
            });
        }
    }

    @action setSelectedTrip(trip){
        this.selectedTrip = trip;
    }

    @action isOptOutToShow(trip) {
        console.warn('Selected Trip ', trip);
        this.selectedTrip = trip;
        if (this.isRosterOptOutEnabled === "true" && !this.optOutAccepted) {
            if (this.disclaimerType === ("LOGIN") && trip.tripType === ("Pickup")) {
                this.acceptedType = "LOGIN";
                this.visibleOptOutModal = true;
            } else if (this.disclaimerType === ("LOGOUT") && trip.tripType === ("Drop")) {
                this.acceptedType = "LOGOUT";
                this.visibleOptOutModal = true;
            } else if (this.disclaimerType === ("BOTH")) {
                this.acceptedType = trip.tripType === ("Pickup") ? "LOGIN" : "LOGOUT";
                this.visibleOptOutModal = true;
            } else {
                this.isWithInNoShowAction(trip);
            }
        } else {
            this.isWithInNoShowAction(trip);
        }
    }

    @action
    async getOptOutData() {
        if (this.isRosterOptOutEnabled === "true" && this.disclaimerType) {
            await axios.get(URL.Opt_Out_GET, {
                headers: this.getHeader()
            })
                .then(async response => {
                    await runInAction(() => {
                        this.optOutContent = response.data.data.tcContent;
                    });
                })
                .catch(error => {
                    if (error) {
                        console.warn("Error Here " + JSON.stringify(error));
                    }
                });
        }
    }

    @action toggleAccept() {
        this.accepted = !this.accepted;
    }

    @action optOutSelected() {
        this.optOutAccepted = true;
        this.visibleOptOutModal = false;
        this.isWithInNoShowAction(this.selectedTrip);
    };

    @action isWithInNoShowAction(trip) {
        let cancelAlert = {};
        const loginLogoutCutoffMinutes =  trip.tripType.includes("Pickup") ? this.LoginCutoffMinutes : this.LogoutCutoffMinutes;
        const cancellationCutOffInMins = trip.metaData.programType === 'TD' ? trip.cancellationCutOffInMins : loginLogoutCutoffMinutes;

        if (isWithinCutOff(trip, cancellationCutOffInMins)) {
            if (this.NoShowCount && isLimitExceded(this.NoShowCount) && isWithInTimeFrame(this.NoShowCount, trip)) {
                cancelAlert = {
                    "title": noShow.no_show_title,
                    "desc": this.NoShowErrorMessage + noShow.are_you_sure
                };
            } else {
                cancelAlert = {
                    "title": noShow.no_show_title,
                    "desc": noShow.noShowMessage
                };
            }
            setTimeout(() => {
                Alert.alert(
                    cancelAlert.title,
                    cancelAlert.desc,
                    [
                        {
                            text: "No",
                            onPress: () => {
                                console.warn("canceled alert");
                                this.disableOptOutVisible();
                            },
                            style: "cancel"
                        },
                        {
                            text: "Yes",
                            onPress: () => {
                                return this.cancelTrips();
                            }
                        }
                    ],
                    { cancelable: true }
                );
            }, 400);
        } else {
            cancelAlert = { "title": "Cancel Alert", "desc": noShow.cancel_roster };
            setTimeout(() => {
                Alert.alert(
                    cancelAlert.title,
                    cancelAlert.desc,
                    [
                        {
                            text: "No",
                            onPress: () => {
                                console.warn("canceled alert");
                            },
                            style: "cancel"
                        },
                        {
                            text: "Yes",
                            onPress: () => {
                                return this.cancelTrips();
                            }
                        }
                    ],
                    { cancelable: true }
                );
            }, 400);
        }

    }

    @action
    async cancelTrips() {
        this.isLoading = true;
        let body = {
            DeviceCode: this.UserId,
            TripMetaData: this.selectedTrip.metaData
        };
        console.warn('Cancel Trip Body ', body);
        if (this.accepted === true && this.optOutAccepted === true) {
            if (this.acceptedType === "LOGIN") {
                body.TripMetaData["LoginOptOutTCAccepted"] = "1"
            }
            if (this.acceptedType === "LOGOUT") {
                body.TripMetaData["LogoutOptOutTCAccepted"] = "1"
            }
        }
        await axios.post(this.cancelUrl, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(() => {
                this.isLoading = false;
                let data = response.data;
                if (response.data.Status === 200) {
                    this.selectedTrip = {};
                    this.optOutAccepted = false;
                    this.accepted = false;
                    setTimeout(() => {
                        Alert.alert(
                            'My Trips',
                            data.Message,
                            [
                                {
                                    text: "OK",
                                    onPress: () => {
                                        setTimeout(() => {
                                            this.getMyTripData();
                                        }, 400)
                                    }
                                }
                            ],
                            { cancelable: true }
                        );

                    }, 400);
                } else {
                    setTimeout(() => {
                        this.getMyTripData();
                    }, 400)
                }
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                console.warn("failure")
            }
        });
    }

    @action
    async cancelFixedRouteTrip(_trip) {
        this.isLoading = true;
        let body = {
            TripID: _trip.metaData.groupID,
            SeatNumber: _trip.metaData.SeatNumber
        };
        console.warn('Cancel fixed Trip Body ', body);
        await axios.post(URL.CANCEL_FIXED_ROUTE_TRIP, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(() => {
                this.isLoading = false;
                let data = response.data;
                console.warn('fixed route cancel - res > ', response);
                if (data.Status.Code === 200) {
                    setTimeout(() => {
                        Alert.alert(
                            'My Trips',
                            data.Status.Message,
                            [
                                {
                                    text: "OK",
                                    onPress: () => {
                                        setTimeout(() => {
                                            this.getMyTripData();
                                        }, 400)
                                    }
                                }
                            ],
                            { cancelable: true }
                        );

                    }, 400);
                } else if (data.Status.Code === 400) {
                    setTimeout(() => {
                        Alert.alert(
                            'My Trips',
                            data.Status.Message,
                            [
                                {
                                    text: "OK",
                                    onPress: () => {
                                    },
                                    style: 'cancel'
                                }
                            ],
                            { cancelable: true }
                        );

                    }, 400);
                } else {
                    setTimeout(() => {
                        this.getMyTripData();
                    }, 400)
                }
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                console.warn("failure")
            }
        });
    }

    @action
    async cancelFixedRoutePass(_trip) {
        this.isLoading = true;
        let body = {
            SelectedDates: moment(_trip.tripTime).format("YYYY-MM-DD"),
            TripType: _trip.tripType === "Pickup" ? "P" : "D"
        };
        console.warn('Cancel fixedR pass Body ', body);
        await axios.post(URL.CANCEL_FIXED_ROUTE_PASS, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(() => {
                this.isLoading = false;
                let data = response.data;
                console.warn('fixed route cancel - res > ', response);
                if (data.Status.Code === 200) {
                    setTimeout(() => {
                        Alert.alert(
                            'My Trips',
                            data.Status.Message,
                            [
                                {
                                    text: "OK",
                                    onPress: () => {
                                        setTimeout(() => {
                                            this.getMyTripData();
                                        }, 400)
                                    }
                                }
                            ],
                            { cancelable: true }
                        );

                    }, 400);
                } else if (data.Status.Code === 400) {
                    setTimeout(() => {
                        Alert.alert(
                            'My Trips',
                            data.Status.Message,
                            [
                                {
                                    text: "OK",
                                    onPress: () => {
                                    },
                                    style: 'cancel'
                                }
                            ],
                            { cancelable: true }
                        );

                    }, 400);
                } else {
                    setTimeout(() => {
                        this.getMyTripData();
                    }, 400)
                }
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                console.warn("failure")
            }
        });
    }

    @action enableCheckInModel(item) {
        this.visibleCheckInModal = true;
        if (item.tripMode === "Adhoc" && item.metaData.programType) {
            this.TripId=item.metaData.programID;
        } else {
            this.TripId=item.metaData.routeID+"-"+item.metaData.groupID;
        }
        this.programType=item.metaData.programType;
    }

    @action enableCheckOutModel(item) {
        this.visibleCheckOutModal = true;
        if (item.tripMode === "Adhoc" && item.metaData.programType) {
            this.TripId=item.metaData.programID;
        } else {
            this.TripId=item.metaData.routeID+"-"+item.metaData.groupID;
        }
        this.programType=item.metaData.programType;
    }

    @action enablePanicModel(item) {
        this.visiblePanicModal = true;
        if (item.tripMode === "Adhoc" && item.metaData.programType) {
            this.TripId=item.metaData.programID;
        } else {
            this.TripId=item.metaData.routeID+"-"+item.metaData.groupID;
        }
        this.programType=item.metaData.programType;
    }
    @action enableSafeDropModel(item) {
        this.visibleSafeDropModal = true;
        this.safeDropTrip=item;
        if (item.tripMode === "Adhoc" && item.metaData.programType) {
            this.TripId=item.metaData.programID;
        } else {
            this.TripId=item.metaData.routeID+"-"+item.metaData.groupID;
        }
        this.programType=item.metaData.programType;
    }

    @action disableCheckInModel() {
        this.visibleCheckInModal = false;
    }

    @action disableCheckOutModel() {
        this.visibleCheckOutModal = false;
    }

    @action disablePanicModel() {
        this.visiblePanicModal = false;
    }

    @action disableSafeDropModel() {
        this.visibleSafeDropModal = false;
    }

    @action enableFeedbackModal(context) {
        context.showPreviousdayTrip();
        this.visibleFeedbackModal = true;
    }

    @action disableFeedbackModal() {
        this.visibleFeedbackModal = false;
    }

    @action setLocation(locations) {
        this.location = locations;
    }

    @action
    async myTripsDoCheckIn() {
        this.isLoading = true;
        let body = {
            Location: this.location,
            LocationDescription: "aa",
            TripID: this.TripId,
            ProgramType: this.programType
        };
        await axios.post(URL.NEW_CHECKIN, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                this.visibleCheckInModal = false;
                this.tripId='';
                this.programType='';
                this.getMyTripData();
                Alert1.show('Check-in', response.data?.status?.message);
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                this.visibleCheckInModal = false;
                Alert1.show('Check-in', loginString.somethingWentWrong);
            }
        });
    }


    @action
    async myTripsDoCheckOut_old(context) {
        this.isLoading = true;
        let body = {
            Location: this.location,
            LocationDescription: "aaa",
            TripID: this.TripId,
            ProgramType: this.programType
        };
        await axios.post(URL.NEW_CHECKOUT, body, {
            headers: this.getHeader()
        }).then(async response => {
            // console.warn('Checkout res ', response);
            await runInAction(async () => {
                this.isLoading = false;
                this.visibleCheckOutModal = false;
                this.tripId='';
                this.programType='';
                this.getMyTripData();
                Alert1.show('Check-out', response.data?.status?.message);
                

                if (response.data?.status?.message.includes('Sorry')) {
                    console.warn('Checkout failed');
                } else {
                    context.showPreviousdayTrip();
                    setTimeout(() => {
                        this.visibleFeedbackModal = true;
                    }, 2000);
                }
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                this.visibleCheckOutModal = false;
                Alert1.show('Check-out', loginString.somethingWentWrong);
            }
        });
    }
    @action
    async myTripsDoCheckOut() {
        this.isLoading = true;
        let body = {
            Location: this.location,
            LocationDescription: "aaa",
            TripID: this.TripId,
            ProgramType: this.programType
        };
        const response = await axios.post(URL.NEW_CHECKOUT, body, {
            headers: this.getHeader()
        });
        this.isLoading = false;
        this.visibleCheckOutModal = false;
        console.warn('NEW_CHECKOUT res - ', response);
        return response;
    }

    @action
    async myTripsSafeDrop_old(context) {
        this.isLoading = true;
        let body = {
            tripId: this.TripId,
            locationDescription: "aaa",
            locGeocode: this.location,
            ProgramType: this.programType
        };
        await axios.post(URL.SAFE_DROP, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                this.visibleSafeDropModal=false;
                this.tripId='';
                this.programType='';
                this.getMyTripData();
                await Alert1.show('Safe-Drop', response.data?.status?.message);
                context.showPreviousdayTrip();
                setTimeout(() => {
                    this.visibleFeedbackModal = true;
                }, 2000);
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                this.visibleSafeDropModal=false;
                Alert1.show('Safe-Drop', loginString.somethingWentWrong);
            }
        });
    }
    @action
    async myTripsSafeDrop() {
        this.isLoading = true;
        let body = {
            tripId: this.TripId,
            locationDescription: "aaa",
            locGeocode: this.location,
            ProgramType: this.programType
        };
        const response = await axios.post(URL.SAFE_DROP, body, {
            headers: this.getHeader()
        });
        this.isLoading = false;
        this.visibleCheckOutModal = false;
        console.warn('SAFE_DROP res - ', response);
        return response;
    }



    @action
    async myTripsDoCheckPanic() {
        this.isLoading = true;
        let body = {
            Location: this.location,
            LocationDescription: "aaa",
            TripID: this.TripId,
            ProgramType: this.programType
        };
        console.warn('SOS body ', body);
        await axios.post(URL.NEW_PANIC, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.tripId='';
                this.programType='';
                this.isLoading = false;
                this.visiblePanicModal = false;
                await Alert1.show('SOS', response.data?.status?.message);
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                this.visiblePanicModal = false;
                Alert1.show('SOS',  loginString.somethingWentWrong);
            }
        });
    }

    @action
    async getTrackVehicleDetails(context) {
        this.isLoading = true;
        let body = {
            OS: Platform.OS === "ios" ? "IOS" : "AOS",
            Version: appVersion.v,
            DeviceID: global.UserId
        };
        await axios.post(this.customUrl + URL.GetTripDetail, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                // console.warn("Api response  "+JSON.stringify(data));
                if(response.hasOwnProperty("code") && response.code===401){
                    Alert1.show("My-Trips", "Something went wrong");
                    return;
                }
                if (data.Status === "200") {
                        if (
                            data &&
                            data.Trips[0] &&
                            data.Trips[0].PickupLocation &&
                            data.Trips[0].PickupLocation.includes(",") &&
                            data.Trips[0].PickupLocation.split(",")[0] !== "0.0" &&
                            data.Trips[0].DestinationLocation &&
                            data.Trips[0].DestinationLocation.includes(",") &&
                            data.Trips[0].DestinationLocation.split(",")[0] !== "0.0"
                        ) {
                            this.trackingData=data;
                            return await new Promise.resolve(data);
                        } else {
                            this.trackingData={};
                            Alert.alert(loginString.somethingWentWrong);
                        }
                } else if (data.Description) {
                    this.trackingData={};
                    Alert1.show("My-Trips", data.Description);
                } else {
                    this.trackingData={};
                    Alert1.show("My-Trips", loginString.somethingWentWrong);
                }

            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                this.trackingData={};
                Alert1.show('My-Trips', loginString.somethingWentWrong);
            }
        });
    }

    getHeader(){
        return {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.accessToken
        };
    }


}

export default new MyTripsStore();
