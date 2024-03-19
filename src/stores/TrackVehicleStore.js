import {action, makeAutoObservable, observable, runInAction} from 'mobx';
import axios from "axios";
import {appVersion, loginString} from "../utils/ConstantString";
import {Platform} from "react-native";
import * as Alert1 from "../utils/Alert";
import {URL} from "../network/apiConstants";

class TrackVehicleStore {
    @observable isLoading = false;
    @observable accessToken = null;
    @observable visibleCheckInModal = false;
    @observable visibleCheckOutModal = false;
    @observable visiblePanicModal = false;
    @observable visibleFeedBackModal = false;
    @observable TripId;
    @observable programType;
    @observable location = "0,0";
    @observable visibleSafeDropModal = false;
    @observable trackingData={};
    @observable guardDetails={};

    constructor() {
        makeAutoObservable(this)
    }

    @action setInitValues(accessToken,tripID, _pt) {
        this.accessToken = accessToken;
        this.TripId=tripID;
        this.programType=_pt;
        this.guardDetails={};
        this.trackingData={};
    }


    @action enableCheckInModel(tripId, _pt) {
        this.visibleCheckInModal = true;
        this.TripId=tripId;
        this.programType=_pt;
    }

    @action enableCheckOutModel(tripId, _pt) {
        this.visibleCheckOutModal = true;
        this.TripId=tripId;
        this.programType=_pt;
    }

    @action enablePanicModel() {
        this.visiblePanicModal = true;
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
    @action enableFeedBackModel() {
        this.visibleFeedBackModal = true;
    }

    @action disableFeedBackModel() {
        this.visibleFeedBackModal = false;
    }

    @action enableSafeDropModel(tripId, _pt) {
        this.visibleSafeDropModal = true;
        this.TripId=tripId;
        this.programType=_pt;
    }

    @action disableSafeDropModel() {
        this.visibleSafeDropModal = false;
    }

    @action setLocation(locations) {
        this.location = locations;
    }

    @action
    async trackVehicleDoCheckIn() {
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
            await runInAction(async () => { // "Do CheckIn",
                this.isLoading = false;
                // this.TripId='';
                // this.programType='';
                this.visibleCheckInModal = false;
                await Alert1.show('Check In', response.data?.status?.message);
                return Promise.resolve();
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                this.visibleCheckInModal = false;
                Alert1.show('Check In', loginString.somethingWentWrong);
            }
        });
    }

    @action
    async getTripDetails(customUrl) {
        this.isLoading = true;
        let body = {
            OS: Platform.OS === "ios" ? "IOS" : "AOS",
            Version: appVersion.v,
            DeviceID: global.UserId
        };
        await axios.post(customUrl + URL.GetTripDetail, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => { // "Track-Vehicle",  
                this.isLoading = false;
                let data = response.data;
                if(response.hasOwnProperty("code") && response.code===401){
                    Alert1.show("Routematic", "Something went wrong");
                    this.trackingData={};
                    return;
                }
                if (data.Status === "200") {
                        this.trackingData=data;
                        return await new Promise.resolve(data);
                }
            });
        }).catch(error => {
            if (error) {
                this.trackingData={};
                this.isLoading = false;
                Alert1.show('Routematic', loginString.somethingWentWrong);
            }
        });
    }

    @action
    async getGuardDetails(tripID) {
        this.isLoading = true;
        await axios.get(URL.Get_GuardDetails+tripID, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => { // "Track-Vehicle",  
                this.isLoading = false;
                let data = response.data;
                if(response.hasOwnProperty("code") && response.code===401){
                    Alert1.show("Routematic", "Something went wrong");
                    this.guardDetails={};
                    return;
                }
                if (data.status.code === 200) {
                    this.guardDetails=data.data;
                    return await new Promise.resolve(data);
                }
            });
        }).catch(error => {
            if (error) {
                console.warn("Error "+JSON.stringify(error));
                this.trackingData={};
                this.isLoading = false;
            }
        });
    }

    @action
    async trackVehicleDoCheckOut_old() {
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
            console.warn('NEW_CHECKOUT res - ', response);
            await runInAction(async () => { // "Do CheckOut", 
                this.isLoading = false;
                this.TripId='';
                this.programType='';
                this.visibleCheckOutModal = false;
                await Alert1.show('Check Out', response.data?.status?.message);
                return Promise.resolve();
            });
        }).catch( error => {
            if (error) {
                this.isLoading = false;
                this.visibleCheckOutModal = false;
                Alert1.show('Check Out', loginString.somethingWentWrong);
            }
        });
    }

    @action
    async trackVehicleDoCheckOut() {
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

    @action clearData() {
        this.TripId='';
        this.programType='';
    }

    @action
    async trackVehicleDoPanic() {
        this.isLoading = true;
        let body = {
            Location: this.location,
            LocationDescription: "aaa",
            TripID: this.TripId
        };
        await axios.post(URL.NEW_PANIC, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => { // "Do Panic", 
                this.isLoading = false;
                this.TripId='';
                this.programType='';
                this.visiblePanicModal = false;
                await Alert1.show('SOS', response.data?.status?.message);
            });
        }).catch( error => {
            if (error) {
                this.isLoading = false;
                this.visiblePanicModal = false;
                Alert1.show('SOS', loginString.somethingWentWrong);
            }
        });
    }

    @action
    async trackVehicleSafeDrop_old() {
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
            console.warn('SAFE_DROP res - ', response);
            await runInAction(async () => { // "trackVehicleSafeDrop", 
                this.isLoading = false;
                this.TripId='';
                this.programType='';
                this.visibleSafeDropModal = false;
                await Alert1.show('Safe-Drop', response.data?.status?.message);
                return Promise.resolve();
            });
        }).catch(async error => {
            if (error) {
                this.isLoading = false;
                this.visibleSafeDropModal = false;
                await Alert1.show('Safe-Drop', loginString.somethingWentWrong);
            }
        });
    }

    @action
    async trackVehicleSafeDrop() {
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
        this.visibleSafeDropModal = false;
        console.warn('SAFE_DROP res - ', response);
        return response;
    }


    getHeader() {
        return {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.accessToken
        };
    }


}

export default new TrackVehicleStore;
