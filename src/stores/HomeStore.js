import {action, computed, makeAutoObservable, observable, runInAction} from 'mobx';
import axios from "axios";
import {Platform} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {URL} from "../network/apiConstants";
import {appVersion, asyncString, loginString} from "../utils/ConstantString";
import * as Alert from "../utils/Alert";
import moment from "moment";

class HomeStore {

    @observable location = "40.714224,73.961452";
    @observable isLoading = false;
    @observable accessToken='';
    @observable customUrl='';
    @observable tripId='';
    @observable termsChanged=false;
    @observable termsAndConditionHTMLContent="";
    @observable termsId;
    @observable fixedRouteData=undefined;

    constructor() {
        makeAutoObservable(this)
    }
    
    @action setAccessToken(accessToken, customUrl){
        // console.warn("Home store setAccessToken - ", accessToken);
        this.accessToken = accessToken;
        this.customUrl = customUrl;
        this.isLoading = false;
    }

    getHeader(){
        return {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.accessToken
        };
    }

    @action setLocation(locations) {
        this.location = locations;
    }

    @action enablePanicModel() {
        this.visiblePanicModal = true;
    }

    @action disablePanicModel() {
        this.visiblePanicModal = false;
    }

    @action setData(fixedRouteData){
        this.fixedRouteData=fixedRouteData;
    }

    @computed
    get isSOSVisible() {
        return false;
        if (this.fixedRouteData && this.fixedRouteData.hasOwnProperty('tripEndTime')) {
            let endTime = moment(this.fixedRouteData.tripEndTime, "YYYY-MM-DDTHH:mm").format("YYYY-MM-DDTHH:mm");
            let currentTime = moment().format("YYYY-MM-DDTHH:mm");
            return moment(currentTime).isSameOrBefore(endTime);
        } else {
            try {
                AsyncStorage.removeItem(asyncString.SOS);
            }catch (e) {
                console.warn("Async storage removed item "+e);
            }
            return false;
        }
    }

    @action
    async checkActiveTrip(navigation){
        this.isLoading = true;
        await axios.get(URL.ACTIVE_TRIP, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => { // "ActiveTrip", 
                this.isLoading = false;
                let data = response.data;
                if (data.status.hasOwnProperty("code") && data.status.code === 401) {
                    Alert.show(type, "Something went wrong");
                    return;
                }
                if(data.status.code===200 && data.data.onTrip===1){
                    if(data.data.tripType==="FR"){
                        this.getFixedRouteDetails(data.data.url);
                    }else if(data.data.tripType==="Regular") {
                        return await this.getTripDetails(navigation);
                    }
                }
            })
        }).catch(error => {
            if (error) {
                this.isLoading = false;
            }
        });
    }

    @action
    async getFixedRouteDetails(url){
        this.isLoading = true;
        await axios.get(url, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => { // "getFixedRouteDetails", 
                this.isLoading = false;
                this.fixedRouteData = response.data.data;
            })
        }).catch(error => {
            if (error) {
                this.isLoading = false;
            }
        });
    }

    @action
    async getNotificationsCount(context) {
        console.warn('notificat calling ');
        this.isLoading = true;
        await axios.get(URL.NOTIFICATIONS, {
            headers: this.getHeader()
        }).then(async response => {
            console.warn("NOTIFICATIONS count ", response);
            await runInAction(async () => {
                let data = response.data;
                this.isLoading = false;
                console.warn("notifi count - ", data);
                if (data.status.code == 200) {
                     var count = data.data;
                     context.setState({
                        notification_count: count
                    });
                } else {
                    context.setState({
                        notification_count: 0
                    });
                }
            });
        }).catch(error => {
            console.warn('notification error - ', error);
            this.isLoading = false;
        });
    }

    @action
    async getNotificationsList(context) {
        this.isLoading = true;
        let _headers = this.getHeader();
        // console.warn("note headers --> ", _headers);
        await axios.post(URL.NOTIFICATIONS, {}, {
            headers: this.getHeader()
        }).then(async response => {
            console.warn("NOTIFICATIONS list ", response);
            await runInAction(async () => {
                let data = response.data;
                this.isLoading = false;
                console.warn("notifi list - ", data);
                
                if (data.status.code == 200) {
                    context.setState({
                        notifications: data.data
                   });
               } else {
                   context.setState({
                        notifications: []
                   });
               }
            });
        }).catch(error => {
            console.warn('notification error - ', error);
            this.isLoading = false;
        });
    }

    @action
    async getFixedRouteConfig(context) {
        console.warn('getFixedRouteConfig calling ');
        return await axios.get(URL.FIXED_ROUTE_CONFIG, {
            headers: this.getHeader()
        });
        // .then(async response => {
        //     console.warn("FIXED_ROUTE_CONFIG res ", response);
        //     await runInAction(async () => {
        //         let data = response.data;
        //         this.isLoading = false;
        //         console.warn(" - ", data);
        //         if (data.Status.Code == 200) {
        //              var wf = data.Data?.WorkFlowType;
        //              console.warn('--- ', wf);
        //              return await Promise.resolve(true)
        //         } else {
        //             return await Promise.resolve(false)
        //         }
        //     });
        // }).catch(error => {
        //     console.warn('notification error - ', error);
        //     this.isLoading = false;
        // });
    }

    @action
    async getShuttleConfig(context) {
        console.warn('getShuttleConfig calling ');
        return await axios.get(URL.SHUTTLE_CONFIG, {
            headers: this.getHeader()
        });
    }

    @action
    async getTripDetails(navigation) {
        this.isLoading = true;
        let body = {
            OS: Platform.OS === "ios" ? "IOS" : "AOS",
            Version: appVersion.v,
            DeviceID: global.UserId
        };
        await axios.post(this.customUrl + URL.GetTripDetail, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => { // "GetTripDetails", 
                this.isLoading = false;
                // console.warn("TripDetails Response  " + JSON.stringify(response));
                let data = response.data;
                if (!response || response.status === 401 || response.hasOwnProperty("code") && response.code === 401) {
                    Alert.show(type, "Something went wrong");
                    return;
                }
                if(data.Status==="2000"){
                    return;
                }
                if (data.Status === "200") {
                    if (data.Trips[0].CheckinStatus === "2") {
                        return;
                    }
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
                            await navigation.navigate("TrackVehicle", {
                                Trips: data.Trips[0],
                                CustomerUrl: this.customUrl,
                                UserId: global.UserId,
                                DMapKey: global.directionMapKey,
                                ChatEnabled: data.Trips[0].ChatEnabled,
                                access_token: this.accessToken,
                                CheckinCheckoutDisabled:data.hasOwnProperty("CheckinCheckoutDisabled")?data.CheckinCheckoutDisabled:null,
                            });
                        } else {
                            alert(loginString.somethingWentWrong);
                        }
                } else if (data.Description) {
                    Alert.show(type, data.Description);
                }
            });
        }).catch(error => {
            this.isLoading = false;
        });
    }

    setTermsAndConditionRequired(){
        this.termsChanged=true;
        this.isLoading=false;
    }


    @action
    async getTermsAndConditionContent() {
        this.isLoading = true;
        await axios.get(URL.GET_TERMS, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => { // "getTermsContent", 
                let data = response.data;
                this.isLoading = false;
                if(data.data && data.hasOwnProperty("data") && data.data.text) {
                    this.termsAndConditionHTMLContent = data.data.text;
                    this.termsId=data.data.id;
                    return await Promise.resolve();
                }else{
                    this.termsChanged=false;
                    return await Promise.resolve();
                }
            });
        }).catch(error => {
             this.isLoading = false;
        });
    }

    @action
    async acceptTermsAndCondition() {
        let body = {
            EmpTncId: this.termsId
        };
        await axios.post(URL.GET_TERMS, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(() => { // "acceptedTerms", 
                this.termsChanged = false;
                return Promise.resolve("Done");
            });
        }).catch(async error => {
            if (error) {
                Alert.show('Routematic',  loginString.somethingWentWrong);
            }
        });
    }

    @action
    async doPanic() {
        this.isLoading = true;
        let body = {
            Location: this.location,
            LocationDescription: "aaa",
            TripID: this.fixedRouteData.tripID
        };
        await axios.post(URL.NEW_PANIC, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => { // "doPanic", 
                this.tripId = '';
                this.isLoading = false;
                this.visiblePanicModal = false;
                await Alert.show('Routematic', response.data?.status?.message);
                return await new Promise.resolve(response);
            });
        }).catch(async error => {
            if (error) {
                this.isLoading = false;
                this.visiblePanicModal = false;
                return await new Promise.reject(error);
            }
        });
    }

}

export default new HomeStore();
