import {action, makeAutoObservable, observable, runInAction} from "mobx";
import {Platform} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {adhoc, appVersion, asyncString, loginString, Select} from "../utils/ConstantString";
import axios from "axios";
import {URL} from "../network/apiConstants";
import * as Alert from "../utils/Alert";
import {adhocType} from "../screens/adhoc/AdhocLanding";
import * as Toast from "../utils/Toast";
import moment from "moment";
import {findAutoFill} from "../utils/customFunction";
import {handleResponse} from "../network/apiResponse/HandleResponse";
import {StackActions} from "@react-navigation/native";
import { CryptoXor } from "crypto-xor";

const queryString = require("query-string");
const _ = require("lodash");

const requestFlexiCab = "Request flexi cab";

class modifiedAdHocStore {

    /*-------App tokens and config -------*/
    @observable isLoading = false;
    @observable accessToken = '';
    @observable customUrl = '';
    @observable UserId = '';
    @observable IdleTimeOutInMins = 0;
    /*-------End of tokens and config -------*/


    @observable Offices=[];
    @observable isDatePickerVisible=false;
    @observable dateSelected=Select;
    @observable tripType=adhocType.login;
    @observable selectedOffice={};
    @observable programs=[];
    @observable sourceLocations=[];
    @observable selectedSource=Select;
    @observable destinationLocation=[];
    @observable selectedDestination=Select;
    @observable shiftTimes=[];
    @observable selectedShiftTime=Select;
    @observable programsArray=[];
    @observable selectedProgram={};
    @observable isTripPurposeVisible=false;
    @observable isCostCenterVisible=false;
    @observable tripPurposesArray=[];
    @observable selectedTripPurposes={};
    @observable costCentersArray=[];
    @observable selectedCostCenter={};
    @observable lineManagers=[];
    @observable selectedLineManager=Select;
    @observable isApproverNameEditable=false;
    @observable enableCostCenterSelection=false;
    @observable TDValidation = {};


    // dynamic from location
    @observable fromSelectLat;
    @observable fromSelectLng;
    @observable fromAddressID;

    // dynamic to location
    @observable toSelectLat;
    @observable toSelectLng;
    @observable toAddressID;
    @observable apiSuccess={};

    //flexi Dertails
    @observable FlexiDetails = {OfficeLocations: [], StaffLocations: []};

    constructor() {
        makeAutoObservable(this)
    }

    getHeader() {
        return {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.accessToken
        };
    }

    @action setInitObject_(context) {
        this.isLoading = true;
        this.clearAll();
        this.clearDate();
        AsyncStorage.multiGet(
            [
                asyncString.ACCESS_TOKEN,
                asyncString.USER_ID,
                asyncString.IdleTimeOutInMins,
                asyncString.CAPI
            ],
            (err, savedData) => {
                this.accessToken = CryptoXor.decrypt(savedData[0][1], asyncString.ACCESS_TOKEN); // JSON.parse(JSON.stringify(savedData[0][1]));
                this.UserId = JSON.parse(JSON.stringify(savedData[1][1]));
                this.customUrl = savedData[3][1];
                this.IdleTimeOutInMins = parseInt(savedData[2][1]);
                if (!this.accessToken) return;
                if (!this.UserId) return;
                this.getAdHocOffices();
                this.tripType=adhocType.login;
            }
        );
    }

    @action setInitAdhoc(context) {
        this.isLoading = true;
        this.clearAll();
        this.clearDate();
        AsyncStorage.multiGet(
            [
                asyncString.ACCESS_TOKEN,
                asyncString.USER_ID,
                asyncString.IdleTimeOutInMins,
                asyncString.CAPI
            ],
            (err, savedData) => {
                this.accessToken = CryptoXor.decrypt(savedData[0][1], asyncString.ACCESS_TOKEN); // JSON.parse(JSON.stringify(savedData[0][1]));
                this.UserId = JSON.parse(JSON.stringify(savedData[1][1]));
                this.customUrl = savedData[3][1];
                this.IdleTimeOutInMins = parseInt(savedData[2][1]);
                if (!this.accessToken) return;
                if (!this.UserId) return;
                this.getAdHocOffices();
                this.tripType=adhocType.login;
            }
        );
    }

    @action
    setNavigation(navigation){
        this.navigation=navigation;
    }

    @action
    setSelectedOffice(office){
        this.selectedOffice=office;
    }

    @action
    setSelectedShiftTime(shiftTime){
        this.selectedShiftTime=shiftTime;
        let shiftProgramsArray=[];
        console.warn('programs - ', this.programs);
        this.programs.map((item)=>{
            if(item.ShiftTimes.includes(shiftTime))
                shiftProgramsArray.push(item);
        });
        this.programsArray=shiftProgramsArray;
        console.warn('programsArray ', this.programsArray);
        if(this.programsArray.length===1){
            this.setSelectedProgram(this.programsArray[0]);
        }else{
            this.selectedProgram={};
        }
    }

    @action
    setSelectedProgram(program){
        this.selectedProgram=program;
        if(this.tripType===adhocType.login){
            this.sourceLocations=[];
            program.Locations.map(item=>{
                if(item.LocationType==="S"){
                    if(program.SourceLocationOthers==="1"){
                        this.sourceLocations.push(item);
                    }else if(item.LocationCode!=="0"){
                        this.sourceLocations.push(item);
                    }
                }
            });
            if(this.sourceLocations.length===1){
                this.selectedSource=this.sourceLocations[0].LocationName;
            }else{
                this.selectedSource=Select;
            }
        }
        if(this.tripType===adhocType.logout){
            this.destinationLocation=[];
            program.Locations.map(item=>{
                if(item.LocationType==="D"){
                    if(program.DestinationLocationOthers==="1"){
                        this.destinationLocation.push(item);
                    }else if(item.LocationCode!=="0"){
                        this.destinationLocation.push(item);
                    }
                }
            });
            if(this.destinationLocation.length===1){
                this.selectedDestination=this.destinationLocation[0].LocationName;
            }else{
                this.selectedDestination=Select;
            }
        }
        if(program.hasOwnProperty('TripPurposeDisplay')) {
            this.isTripPurposeVisible = program.TripPurposeDisplay === "1";
            this.selectedTripPurposes={};
        }else{
            this.isTripPurposeVisible=false;
        }
        if(program.hasOwnProperty('IsCostCenterSelection')) {
            this.isCostCenterVisible = program.IsCostCenterSelection === true;
            this.selectedCostCenter={};
        }else{
            this.isCostCenterVisible = false;
        }
        this.selectedLineManager = this.selectedProgram.ApproverEmailID ? this.selectedProgram.ApproverEmailID : this.lineManagers[0];
    }

    isLocationSelected(){
        if(this.tripType===adhocType.login){
            return this.selectedSource !== Select;
        }else if(this.tripType===adhocType.logout){
            return this.selectedDestination !== Select;
        }
    }


    @action
    setSourceLocation(sourceLocation){
        this.selectedSource=sourceLocation;
        this.selectedLineManager = this.selectedProgram.ApproverEmailID ? this.selectedProgram.ApproverEmailID : this.lineManagers[0];
    }

    @action
    setDestinationLocation(destinationLocation){
        this.selectedDestination=destinationLocation;
        this.selectedLineManager = this.selectedProgram.ApproverEmailID ? this.selectedProgram.ApproverEmailID : this.lineManagers[0];
    }

    @action
    handleDatePicked(date) {
        this.dateSelected =date;
        this.isDatePickerVisible= false;
    };

    @action
    showDatePicker(){
        this.isDatePickerVisible= true;
    };

    @action
    hideDatePicker(){
        this.isDatePickerVisible= false;
    };



    @action
    setTripPurpose(tripPurpose){
        this.selectedTripPurposes=tripPurpose;
    }

    @action
    setCostCenter(costCenter){
        this.selectedCostCenter=costCenter;
        this.selectedLineManager=costCenter.ApproverEmail===null?this.lineManagers[0]:costCenter.ApproverEmail;
    }

    @action
    setLineManager(lineManager){
        this.selectedLineManager=lineManager;
    }

    @action
    setTripType(tripType) {
        this.tripType = tripType;
        this.dateSelected = Select;
        this.selectedOffice = undefined;
        this.clearAll();
    }

    clearAll(){
        this.selectedProgram={};
        this.sourceLocations = [];
        this.destinationLocation = [];
        this.programs = [];
        this.programsArray = [];
        this.costCentersArray = [];
        this.lineManagers = [];
        this.selectedSource = Select;
        this.selectedDestination = Select;
        this.selectedShiftTime = Select;
        this.tripPurposesArray = [];
        this.isTripPurposeVisible = false;
        this.isCostCenterVisible = false;
        this.selectedTripPurposes = {};
        this.selectedCostCenter = {};
        this.selectedLineManager = Select;
        this.isApproverNameEditable = false;
        this.enableCostCenterSelection = false;
        this.FlexiDetails = {OfficeLocations: [], StaffLocations: []};
    }

    clearDate(){
        this.dateSelected=Select;
        this.selectedOffice=undefined;
        this.tripType=adhocType.login;
        this.isDatePickerVisible=false
    }

    @action
    async getAdHocOffices() {
        this.isLoading = true;
        await axios.get( URL.AdHoc_Offices, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn('adhoc offices ', response);
                this.Offices = response.data.data;
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                Alert.show(adhoc, loginString.somethingWentWrong);
            }
        });
    }

    @action
    async getProgramsForDate() {
        this.isLoading = true;
        console.warn("ADHOC "+this.tripType);
        let type=this.tripType.includes(adhocType.login)?"P":"D";
        let url = URL.Adhoc_Programs + "officeId=" + this.selectedOffice.officeLocationID +
            "&reqDate=" + this.dateSelected + "&programType="+type;
        this.clearAll();
        await axios.get(url, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn('Get Programs for Adhoc - ', response.data.Data);
                this.programs = response.data.Data.Programs;
                let shiftTimesArray = [];
                this.programs.map((item) => {
                    shiftTimesArray = shiftTimesArray.concat(item.ShiftTimes);
                });
                this.shiftTimes =[...new Set(shiftTimesArray)].sort();
                this.tripPurposesArray = response.data.Data.TripPurposes;
                this.costCentersArray = response.data.Data.CostCenters;
                this.lineManagers = response.data.Data.LineManagers;
                this.isApproverNameEditable = response.data.Data.IsApproverNameEditable;
                this.enableCostCenterSelection = response.data.Data.EnableCostCenterSelection;
                this.TDValidation = response.data.Data.TDValidation;
                if(this.lineManagers.length===1)
                    this.selectedLineManager=this.lineManagers[0];
            });
            return new Promise.resolve();
        }).catch(error => {
            if (error) {
                console.warn("Error "+JSON.stringify(error));
                this.isLoading = false;
                Alert.show(adhoc, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async savePOILocation(body, type,selectedLocation) {
        this.isLoading = true;
        await axios.post(URL.SAVE_POI_NEW, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                let data = response.data;
                if (data.status === "200") {
                    if (type === "from") {
                        this.fromAddressID = data.addressID;
                        this.selectedSource = selectedLocation;
                        Toast.show("From Location: " + data.description);
                    } else if (type === "to") {
                        this.toAddressID = data.addressID;
                        this.selectedDestination = selectedLocation;
                        Toast.show("To Location: " + data.description);
                    }
                } else if (data.description) {
                    Alert.show(adhoc + " Other Location", data.description);
                } else {
                    Alert.show(adhoc + " Other Location", loginString.somethingWentWrong);
                }
            });
        }).catch(error => {
            this.isLoading = false;
            if (error) {
                Alert.show(adhoc, loginString.somethingWentWrong);
            }
        });
    }

    @action
    async SaveShiftAdHoc(title) {
        const date = this.dateSelected + " " + this.selectedShiftTime;
        const selectedDate = moment(new Date(date)).toISOString();
        const currentDate = moment()
            .add(
                this.tripType === adhocType.login
                    ? this.selectedProgram.PickupCutOffTime
                    : this.selectedProgram.DropCutOffTime,
                "minutes"
            ).toISOString();

        if (!this.selectedProgram || this.selectedProgram==={} ) {
            Alert.show(title, "Please select a Request Type");
            return;
        } else if (this.tripType === Select) {
            Alert.show(title, "Please select a Trip Type");
            return;
        } else if (this.tripType === adhocType.login && this.selectedSource === Select) {
            Alert.show(title, "Please select Source Location");
            return;
        } else if (this.tripType === adhocType.logout && this.selectedDestination === Select) {
            Alert.show(title, "Please select Destination Location");
            return;
        } else if (!this.selectedShiftTime || this.selectedShiftTime === Select) {
            Alert.show(title, "Please select time");
            return;
        } else if (moment(selectedDate).isBefore(currentDate)) {
            let time =
                this.tripType === adhocType.login
                    ? this.selectedProgram.PickupCutOffTime
                    : this.selectedProgram.DropCutOffTime;
            Alert.show(title,
                "Program request must be made " + time + " mins prior to the shift time"
            );
            return;
        } else if (this.selectedProgram.IsCostCenterSelection &&this.selectedProgram.IsCostCenterSelection===true&&this.isApproverNameEditable===true&& (!this.selectedCostCenter.hasOwnProperty("CostCenterID")
            || !this.selectedCostCenter.CostCenterID)) {
            Alert.show("Cost Center", "Please select Cost Center");
            return;
        } else if (this.lineManagers.length > 0 && this.selectedLineManager===Select) {
            Alert.show("Line Manager", "Please select Line Manager");
            return;
        }
        if(this.isTripPurposeVisible===true && (!this.selectedTripPurposes.hasOwnProperty('ID'))){
            Alert.show(title, "Please select trip purpose");
            return;
        }
        let pushToDataBody = [];
        let pushFromDataBody = [];
        if (this.toAddressID) {
            pushToDataBody = [
                {
                    LocationCode: this.toAddressID,
                    LocationName: this.selectedDestination,
                    LocationType: "D",
                    GeoLocation: this.toSelectLat + "," + this.toSelectLng
                }
            ];
        }
        if (this.fromAddressID) {
            pushFromDataBody = [
                {
                    LocationCode: this.fromAddressID,
                    LocationName: this.selectedSource,
                    LocationType: "S",
                    GeoLocation: this.fromSelectLat + "," + this.fromSelectLng
                }
            ];
        }
        let newDate = [
            ...pushToDataBody,
            ...pushFromDataBody,
            ...this.selectedProgram.Locations
        ];

        const responseGetProgramDetailsLocationArray = _.uniqBy(
            newDate,
            "LocationName"
        );
        let toAutoFill = findAutoFill(
            this.selectedSource,
            responseGetProgramDetailsLocationArray
        );
        let fromAutoFill = findAutoFill(
            this.selectedDestination,
            responseGetProgramDetailsLocationArray
        );

        if (this.tripType === adhocType.login && !fromAutoFill) {
            alert("Unable to find location...");
            return;
        }

        if (this.tripType === adhocType.logout && !toAutoFill) {
            alert("Unable to find location...");
            return;
        }

        let body = {
            DeviceID: this.UserId,
            TripType: this.tripType === adhocType.login ? "P" : "D",
            RequestedTime: this.dateSelected + " " + this.selectedShiftTime,
            SourceLocationID: this.tripType === adhocType.login?toAutoFill.LocationCode:this.selectedOffice.officeLocationID,
            SourceLocation: this.tripType === adhocType.login?this.selectedSource:undefined,
            SourceLatitude: this.tripType === adhocType.login?toAutoFill.Lat:undefined,
            SourceLongitude: this.tripType === adhocType.login?toAutoFill.Lng:undefined,
            DestinationLocationID: this.tripType === adhocType.logout?fromAutoFill.LocationCode:this.selectedOffice.officeLocationID,
            DestinationLocation: this.tripType === adhocType.logout?this.selectedDestination:undefined,
            DestinationLatitude: this.tripType === adhocType.logout?fromAutoFill.Lat:undefined,
            DestinationLongitude: this.tripType === adhocType.logout?fromAutoFill.Lng:undefined,
            TripPurposeID: this.isTripPurposeVisible?this.selectedTripPurposes.ID:"",
            ProgramID: this.selectedProgram.ProgramID,
            Version: appVersion.v,
            OS: Platform.OS === "ios" ? "IOS" : "AOS",
            IsProfileStateCheck:1,
            LineManagerEmailID: this.selectedLineManager,
            IsCostCenterSelection: this.selectedProgram.IsCostCenterSelection,
            CostCenterID: this.selectedProgram.IsCostCenterSelection === true ? this.selectedCostCenter.CostCenterID : ""
        };
        this.isLoading= true;
        console.warn('body - ', body);
        console.warn('adhoc req - ', this.customUrl + URL.SAVE_ADHOC+ queryString.stringify(body));

        await axios.get(this.customUrl + URL.SAVE_ADHOC+ queryString.stringify(body), body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading= false;
                let data = response.data;
                if(data.Status ==="200"){
                    this.clearAll();
                    this.clearDate();
                    Alert.show(adhoc, data.Description);
                    this.navigation.dispatch(StackActions.popToTop())
                }else
                    Alert.show(adhoc, data.Description);
            }).catch(error => {
                if (error) {
                    this.isLoading = false;
                    Alert.show("Error", loginString.somethingWentWrong);
                }
            });
        });
    }

    @action
    async getFlexiDetails() {
        this.isLoading = true;
        let body = {
            DeviceID: this.UserId
        };
        await axios.post(this.customUrl + URL.GET_FLEXI_DETAILS, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context)
                }
                let data = response.data;
                if (data.Status === "200") {
                    this.FlexiDetails = data;
                } else if (data.Description) {
                    Alert.show(requestFlexiCab, data.Description);
                } else {
                    Alert.show(requestFlexiCab, loginString.somethingWentWrong);
                }
            }).catch(error => {
                if (error) {
                    this.isLoading = false;
                    Alert.show(adhoc, loginString.somethingWentWrong);
                }
            });
        });
    }
}
export default new modifiedAdHocStore();