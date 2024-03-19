import {action, computed, makeAutoObservable, observable, runInAction} from 'mobx';
import {Alert, Platform} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {URL} from "../network/apiConstants";
import {asyncString, noShow, noShow as noshow} from "../utils/ConstantString";
import * as Alert1 from "../utils/Alert";
import {StackActions} from "@react-navigation/native";
import moment from "moment";
import {colors} from "../utils/Colors";
import {handleResponse} from "../network/apiResponse/HandleResponse";
import {
    filterShiftTimeBasedOnCutOffTime,
    isLimitExceded,
    isWithinCutOff,
    isWithInTimeFrame
} from "../utils/customFunction";
import {showMessage} from "react-native-flash-message";
import NavigationService from "../utils/NavigationService";
import {rosterType} from "../screens/roster/customeComponent/RosterType";
import {getAutoWeeklyOff, getDates} from "../screens/roster/customeComponent/RosterCustomFunctions";
import { CryptoXor } from 'crypto-xor';

const weeklyOffDaysToNumber = {
    Sunday: "0",
    Monday: "1",
    Tuesday: "2",
    Wednesday: "3",
    Thursday: "4",
    Friday: "5",
    Saturday: "6"
};

class rosterRuleStore {

    accessToken = '';
    userId = '';
    customerUrl = '';
    idleTimeOutInMins = '';
    isRosterOptOutEnabled = '';
    disclaimerType = '';
    @observable optOutAccepted = false;
    @observable visibleOptOutModal = false;
    @observable visibleMultiRosterModal = false;
    @observable rosterAction = '';
    @observable acceptedType = "";
    @observable isLoading;
    @observable optOutContent;
    @observable MaxShiftsPerDay = 0;
    @observable EligibleRosterDays = 0;
    @observable AvailableRosters = [];
    @observable MaxOtherLocationCount;
    @observable RosteringAllowedLogin;
    @observable RosteringAllowedLogout;
    @observable Locations;
    @observable Offices;
    @observable Rosters = [];
    @observable DefaultOffice;
    @observable LoginNoShowLimit;
    @observable LogoutNoShowLimit;
    @observable NoShowCount = {};
    @observable LoginCutoffMinutes;
    @observable LogoutCutoffMinutes;
    @observable NoShowErrorMessage;
    @observable markedDatesArray;
    @observable accepted = false;
    @observable selectedRoster = {};
    @observable multiRosterCancel = {};
    @observable RBSheetOpen = false;
    @observable onlyLogin = false;
    @observable onlyLogOut = false;
    @observable RosterDate = '';
    @observable selectedDateAPIResponse = {};
    @observable selectedDateRosterData = [];
    @observable calculateRoster = [
        {
            RosterRuleID: "",
            LoginShifts: "",
            LogoutShifts: "",
            AllowOtherLocationsLogin: 0,
            AllowOtherLocationsLogout: 0,
            WeekdaysAllowed: "",
            OfficeLocationsAllowed: "",
            EffectiveFrom: "",
            EffectiveTo: "",
            RestrictToPOILogin: 0,
            RestrictToPOILogout: 0
        }
    ];
    @observable NoShowData={};
    @observable noShowPerformed=false;
    @observable rosterUpdated=false;
    @observable maxDate;
    @observable minDate;
    @observable startDate;
    @observable endDate;
    @observable toDate="Select";
    @observable fromDate="Select";
    @observable rosterType=rosterType.both;
    @observable pickupDisabled=false;
    @observable dropDisabled=false;
    //------------Create roster -------- CRN ----------
    @observable CRN_officeSelected;
    @observable CRN_officeObject;
    @observable CRN_weeklyOffSelected;
    @observable CRN_loginSelected;
    @observable CRN_logOutSelected;
    @observable CRN_pickupSelected;
    @observable CRN_pickupLocationObject;
    @observable CRN_dropSelected;
    @observable CRN_dropLocationObject;
    @observable CRN_calculateRoster=[
        {
            LoginShifts: "",
            LogoutShifts: "",
            OfficeLocationsAllowed: "",
            AllowOtherLocationsLogin: 0,
            AllowOtherLocationsLogout: 0
        }
    ];

    constructor() {
        makeAutoObservable(this)
    }

    @action
    setOfficeSelected(office) {
        this.CRN_officeSelected = office.Name;
        this.CRN_officeObject = office;
        this.CRN_weeklyOffSelected = []; // getAutoWeeklyOff(this.rosterDetails, (office.ID)).autoWeekDayArray; udhay commented for no default week off selection
        this.CRN_loginSelected="Select";
        this.CRN_logOutSelected="Select";
        this.CRN_pickupSelected="Select";
        this.CRN_pickupLocationObject={};
        this.CRN_dropSelected="Select";
        this.CRN_dropLocationObject={};
        this.fromDate="Select";
        this.toDate="Select";
    }

    @action
    getCreateRoster() {
        if (this.fromDate && this.toDate) {
            let weeklyOffStateValue = this.CRN_weeklyOffSelected.join();
            let selectedDays = [];
            if (this.fromDate && this.toDate) {
                let datesStartEnd = getDates(
                    new Date(this.fromDate),
                    new Date(this.toDate)
                );
                datesStartEnd.forEach(function (date) {
                    const formattedDate = moment(date).format("dddd");
                    if (!weeklyOffStateValue.includes(formattedDate)) {
                        if (!selectedDays.includes(formattedDate)) {
                            selectedDays.push(formattedDate);
                        }
                    }
                });
            }
            let selectedDaysInNumber = [];
            for (let i = 0; i < selectedDays.length; i++) {
                selectedDaysInNumber.push(weeklyOffDaysToNumber[selectedDays[i]]);
            }
            let officeID = this.CRN_officeObject.ID;
            if (officeID) {
                let customisedRosters = filterShiftTimeBasedOnCutOffTime(
                    this.Rosters,
                    this.fromDate,
                    this.toDate,
                    officeID,
                    officeID);
                this.CRN_calculateRoster = this.getCalculatedCreateRoster(
                    customisedRosters,
                    selectedDaysInNumber,
                    officeID,
                    this.CRN_loginSelected,
                    this.CRN_logOutSelected);
            }
        }
    }

    getCalculatedCreateRoster(
        Rosters,
        selectedDaysArray,
        selectedOfficeLocation,
        selectedLoginShift,
        selectedLogoutShift
    ) {
        if (!selectedOfficeLocation) {
            return;
        }
        let rosterTotalWeekdaysAvailable = [];
        for (let i = 0; i < Rosters.length; i++) {
            rosterTotalWeekdaysAvailable.push(Rosters[i].WeekdaysAllowed);
        }
        for (let i = 0; i < selectedDaysArray.length; i++) {
            for (let j = 0; j < Rosters.length; j++) {
                if (
                    !rosterTotalWeekdaysAvailable.join("|").includes(selectedDaysArray[i])
                ) {
                    return [
                        {
                            LoginShifts: "",
                            LogoutShifts: "",
                            OfficeLocationsAllowed: "",
                            AllowOtherLocationsLogin: 0,
                            AllowOtherLocationsLogout: 0
                        }
                    ];
                }
            }
        }
        let newLoginShifts = [];
        let newLogoutShifts = [];
        let newOfficeLocationsAllowed = [];
        let newAllowOtherLocationsLogin = [];
        let newAllowOtherLocationsLogout = [];
        let RestrictToPOILogin = [];
        let RestrictToPOILogout = [];
        for (let k = 0; k < Rosters.length; k++) {
            let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
            let LoginShiftsArray = Rosters[k].LoginShifts.split("|");
            let LogoutShiftsArray = Rosters[k].LogoutShifts.split("|");
            let OfficeLocationsAllowedArray = Rosters[k].OfficeLocationsAllowed.split("|");
            let AllowOtherLocationsLoginArray = [Rosters[k].AllowOtherLocationsLogin];
            let AllowOtherLocationsLogoutArray = [Rosters[k].AllowOtherLocationsLogout];
            let RestrictToPOILoginArray = [Rosters[k].RestrictToPOILogin];
            let RestrictToPOILogoutArray = [Rosters[k].RestrictToPOILogout];
            for (let i = 0; i < WeekdaysAllowedArray.length; i++) {
                for (let j = 0; j < LoginShiftsArray.length; j++) {
                    newLoginShifts.push(
                        LoginShiftsArray[j] + "#" + WeekdaysAllowedArray[i]
                    );
                }
                for (let j = 0; j < LogoutShiftsArray.length; j++) {
                    newLogoutShifts.push(
                        LogoutShiftsArray[j] + "#" + WeekdaysAllowedArray[i]
                    );
                }
                for (let j = 0; j < OfficeLocationsAllowedArray.length; j++) {
                    newOfficeLocationsAllowed.push(
                        OfficeLocationsAllowedArray[j] + "#" + WeekdaysAllowedArray[i]
                    );
                }
                for (let j = 0; j < AllowOtherLocationsLoginArray.length; j++) {
                    newAllowOtherLocationsLogin.push(
                        AllowOtherLocationsLoginArray[j] + "#" + WeekdaysAllowedArray[i]
                    );
                }
                for (let j = 0; j < AllowOtherLocationsLogoutArray.length; j++) {
                    newAllowOtherLocationsLogout.push(
                        AllowOtherLocationsLogoutArray[j] + "#" + WeekdaysAllowedArray[i]
                    );
                }
                for (let j = 0; j < RestrictToPOILoginArray.length; j++) {
                    RestrictToPOILogin.push(RestrictToPOILoginArray[j] + "#" + WeekdaysAllowedArray[i]);
                }
                for (let j = 0; j < RestrictToPOILogoutArray.length; j++) {
                    RestrictToPOILogout.push(
                        RestrictToPOILogoutArray[j] + "#" + WeekdaysAllowedArray[i]
                    );
                }
            }
        }
        newLoginShifts = newLoginShifts.sort();
        newLogoutShifts = newLogoutShifts.sort();
        let OfficeLocationsAllowed = this.getCalculatedValue(newOfficeLocationsAllowed, selectedDaysArray);
        let LoginShifts = this.getCalculatedValue(newLoginShifts, selectedDaysArray);
        let LogoutShifts = this.getCalculatedValue(newLogoutShifts, selectedDaysArray);
        let isOfficeAvailable=OfficeLocationsAllowed.toString().split("|").find(function(item){
            return parseInt(item)===parseInt(selectedOfficeLocation);
        });
        if (isOfficeAvailable) {
            return [
                {
                    LoginShifts: OfficeLocationsAllowed.includes(selectedOfficeLocation)
                        ? LoginShifts
                        : "",
                    LogoutShifts: OfficeLocationsAllowed.includes(selectedOfficeLocation)
                        ? LogoutShifts
                        : "",
                    OfficeLocationsAllowed: OfficeLocationsAllowed,
                    AllowOtherLocationsLogin: this.getAllowOtherLocationsLogin(
                        newAllowOtherLocationsLogin,
                        selectedDaysArray,
                        selectedLoginShift,
                        Rosters,
                        selectedOfficeLocation
                    ),
                    AllowOtherLocationsLogout: this.getAllowOtherLocationsLogout(
                        newAllowOtherLocationsLogout,
                        selectedDaysArray,
                        selectedLogoutShift,
                        Rosters,
                        selectedOfficeLocation
                    ),
                    RestrictToPOILogin: this.getLoginPOI(
                        RestrictToPOILogin,
                        selectedDaysArray,
                        selectedLoginShift,
                        Rosters,
                        selectedOfficeLocation
                    ),
                    RestrictToPOILogout: this.getLogOutPOI(
                        RestrictToPOILogout,
                        selectedDaysArray,
                        selectedLogoutShift,
                        Rosters,
                        selectedOfficeLocation
                    )
                }
            ];
        } else
            return [
                {
                    LoginShifts: "",
                    LogoutShifts: "",
                    AllowOtherLocationsLogin: this.getAllowOtherLocationsLogin(
                        newAllowOtherLocationsLogin,
                        selectedDaysArray,
                        selectedLoginShift,
                        Rosters,
                        selectedOfficeLocation
                    ),
                    AllowOtherLocationsLogout: this.getAllowOtherLocationsLogout(
                        newAllowOtherLocationsLogout,
                        selectedDaysArray,
                        selectedLogoutShift,
                        Rosters,
                        selectedOfficeLocation
                    ),
                    RestrictToPOILogin: this.getLoginPOI(
                        RestrictToPOILogin,
                        selectedDaysArray,
                        selectedLoginShift,
                        Rosters,
                        selectedOfficeLocation
                    ),
                    RestrictToPOILogout: this.getLogOutPOI(
                        RestrictToPOILogout,
                        selectedDaysArray,
                        selectedLogoutShift,
                        Rosters,
                        selectedOfficeLocation
                    )
                }
            ];
    }

    @action
    AddWeeklyOff(array){
        console.warn("Array "+JSON.stringify(array));
        this.CRN_weeklyOffSelected=array;
        this.fromDate = "Select";
        this.toDate = "Select";
        this.CRN_loginSelected = "Select";
        this.CRN_logOutSelected = "Select"
        this.CRN_pickupSelected = "Select";
        this.CRN_pickupLocationObject = {};
        this.CRN_dropSelected = "Select";
        this.CRN_dropLocationObject = {};
    }

    isSelected(value: string): boolean {
        return !!(value && value !== "" && value !== "Select");
    }
    async createNewRoster(tempIgnoreDates){
        let body = {
            RosterDate: this.RosterDate,
            DeviceID: this.userId,
            FromDate: this.fromDate,
            ToDate: this.toDate,
            IgnoreDates: tempIgnoreDates.join("|"),
            LoginLocID:this.CRN_pickupLocationObject.ID,
            LogoutLocID:this.CRN_dropLocationObject.ID,
            LoginTime: this.isSelected(this.CRN_loginSelected)
                ? !this.CRN_loginSelected
                    ? ""
                    : this.CRN_loginSelected=== "Cancel"
                        ? "NS"
                        : this.CRN_loginSelected.split(",")[0]
                : null,
            LogoutTime: this.isSelected(this.CRN_logOutSelected)
                ? !this.CRN_logOutSelected
                    ? ""
                    : this.CRN_logOutSelected=== "Cancel"
                        ? "NS"
                        : this.CRN_logOutSelected.split(",")[0]
                : null,
            LoginRouteType: this.isSelected(this.CRN_loginSelected)
                ? "D"
                : "",
            LogoutRouteType: this.isSelected(this.CRN_logOutSelected)
                ? "D"
                : "",
            LoginOffice: this.CRN_officeObject.ID,
            LogoutOffice: this.CRN_officeObject.ID,
            LoginLocName: this.CRN_pickupSelected.includes("Select") ? "" : this.CRN_pickupSelected.includes("-Nodal") ? this.CRN_pickupSelected.split("-")[0] : this.CRN_pickupSelected,
            LogoutLocName: this.CRN_dropSelected.includes("Select") ? "" : this.CRN_dropSelected.includes("-Nodal") ? this.CRN_dropSelected.split("-")[0] : this.CRN_dropSelected,
            LoginLocAddress: (this.rosterType === rosterType.both || this.rosterType === rosterType.pickup)
                ? !this.CRN_pickupSelected.includes("Select")
                    ? this.CRN_pickupLocationObject.Address : ""
                : "",
            LogoutLocAddress: (this.rosterType === rosterType.both || this.rosterType === rosterType.drop)
                ? !this.CRN_dropSelected.includes("Select")
                    ? this.CRN_dropLocationObject.Address : ""
                : "",
            LoginLocLat: (this.rosterType === rosterType.both || this.rosterType === rosterType.pickup)
                ? !this.CRN_pickupSelected.includes("Select")
                    ? this.CRN_pickupLocationObject.Lat : ""
                : "",
            LoginLocLng: (this.rosterType === rosterType.both || this.rosterType === rosterType.pickup)
                ? !this.CRN_pickupSelected.includes("Select")
                    ? this.CRN_pickupLocationObject.Lng : ""
                : "",
            LogoutLocLng: (this.rosterType === rosterType.both || this.rosterType === rosterType.drop)
                ? !this.CRN_dropSelected.includes("Select")
                    ? this.CRN_dropLocationObject.Lng : ""
                : "",
            LogoutLocLat: (this.rosterType === rosterType.both || this.rosterType === rosterType.drop)
                ? !this.CRN_dropSelected.includes("Select")
                    ? this.CRN_dropLocationObject.Lat : ""
                : ""
        };
        console.warn("body " + JSON.stringify(body));
        if (this.isRosterOptOutEnabled === "true"  && !this.optOutAccepted) {
            if(this.disclaimerType.includes("LOGIN")){
                if(body.LoginTime === "NS" ||(!body.LoginTime && body.LogoutTime !== "NS")){
                    if(this.rosterType ==="PICK_UP")
                    {
                        this.visibleOptOutModal=true;
                        this.acceptedType="LOGIN";
                    }
                    else{
                        this.acceptedType="LOGIN";
                        return await this.createRosterApiCall(body);   
                    }

                }else {
                    return await this.createRosterApiCall(body);
                }
            }else if(this.disclaimerType.includes("LOGOUT")){
                if(body.LogoutTime === "NS" ||(!body.LogoutTime && body.LoginTime !== "NS")){
                    if(this.rosterType ==="DROP")
                    {
                        this.visibleOptOutModal=true;
                        this.acceptedType="LOGOUT";
                    }
                    else
                    {
                        this.acceptedType="LOGOUT";
                        return await this.createRosterApiCall(body);
                    }

                }else{
                    return await this.createRosterApiCall(body);
                }
            }else if(this.disclaimerType.includes("BOTH")){
                if (!body.LoginTime || body.LoginTime === "" || body.LoginTime.includes("NS") || body.LoginTime === null) {
                    if(this.rosterType ==="BOTH")
                    {
                        this.visibleOptOutModal=true;
                        this.acceptedType="LOGIN";
                    }
                    else
                    {
                        this.acceptedType="LOGIN";
                        return await this.createRosterApiCall(body);
                    }

                } else if (!body.LogoutTime || body.LogoutTime === "" || body.LogoutTime.includes("NS") || body.LogoutTime === null) {
                    if(this.rosterType ==="BOTH")
                    {
                        this.visibleOptOutModal=true;
                        this.acceptedType="LOGOUT";
                    }
                    else
                    {
                        this.acceptedType="LOGOUT";
                        return await this.createRosterApiCall(body);
                    }

                } else {
                    return await this.createRosterApiCall(body);
                }
            }else{
                return await this.createRosterApiCall(body);
            }
        } else {
            return await this.createRosterApiCall(body);
        }
    }

    @action
    async createRosterApiCall(body) {
        if (this.accepted === true && this.optOutAccepted === true) {
            if (this.acceptedType === "LOGIN") {
                body["LoginOptOutTCAccepted"] = "1"
            }
            if (this.acceptedType === "LOGOUT") {
                body["LogoutOptOutTCAccepted"] = "1"
            }
        }
        this.isLoading = true;
        body['DeviceID'] = this.userId;
        await axios.post(this.customerUrl + URL.SAVE_ROSTER_RANGE, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status === "200") {
                    if (Platform.OS === "ios") {
                        showMessage({
                            message: "Roster",
                            type: "success",
                            description: data.Description,
                            onPress: () => {
                            }
                        });
                    } else {
                        Alert1.show("Roster", data.Description);
                    }
                    //context.props.navigation.dispatch(StackActions.popToTop());
                    return this.rosterUpdated=true;
                } else if (data.Description) {
                    let description = JSON.parse(JSON.stringify(data.Description));
                    if (Platform.OS === "ios") {
                        showMessage({
                            message: "Roster",
                            type: "warning",
                            description: description.split("|").join("\n\n"),
                            onPress: () => {
                            }
                        });
                    } else {
                        Alert1.show("Roster", description.split("|").join("\n\n"));
                    }
                }
            })
        }).catch(error => {
            this.isLoading = false;
            if (error) {
                this.isLoading = false;
            }
        });
    }

    @action
    setCreateNewRosterInit(){
        this.getDatesInit();
        let office = this.findObject(this.DefaultOffice, this.Offices);
        this.setOfficeSelected(office);
    }

    @action
    setOnlyLogin(){
        this.rosterType = rosterType.pickup;
        this.fromDate = "Select";
        this.toDate = "Select";
        this.CRN_loginSelected = "Select";
        this.CRN_logOutSelected = "Select"
        this.CRN_pickupSelected = "Select";
        this.CRN_pickupLocationObject = {};
        this.CRN_dropSelected = "Select";
        this.CRN_dropLocationObject = {};
    }

    @action
    setOnlyLogOut(){
        this.rosterType = rosterType.drop;
        this.fromDate = "Select";
        this.toDate = "Select";
        this.CRN_loginSelected = "Select";
        this.CRN_logOutSelected = "Select"
        this.CRN_pickupSelected = "Select";
        this.CRN_pickupLocationObject = {};
        this.CRN_dropSelected = "Select";
        this.CRN_dropLocationObject = {};
    }

    @action
    setBoth(){
        this.rosterType = rosterType.both;
        this.fromDate = "Select";
        this.toDate = "Select";
        this.CRN_loginSelected = "Select";
        this.CRN_logOutSelected = "Select"
        this.CRN_pickupSelected = "Select";
        this.CRN_pickupLocationObject = {};
        this.CRN_dropSelected = "Select";
        this.CRN_dropLocationObject = {};
    }

    @action
    setFromToDates(startDate,endDate) {
        console.warn("setFromToDates  "+JSON.stringify(startDate));
        this.fromDate = moment(startDate).format('YYYY-MM-DD');
        this.toDate = moment(endDate).format('YYYY-MM-DD');
        this.RosterDate = moment(endDate).format('YYYY-MM-DD');
        this.CRN_loginSelected = "Select";
        this.CRN_logOutSelected = "Select";
        this.CRN_pickupSelected = "Select";
        this.CRN_pickupLocationObject = {};
        this.CRN_dropSelected = "Select";
        this.CRN_dropLocationObject = {};
        this.getCreateRoster()
    }

    @action
    setLoginShifts(item) {
        this.CRN_loginSelected = item;
        this.CRN_pickupSelected = "Select";
        this.CRN_pickupLocationObject = {};
        this.getCreateRoster()
        this.pickupDisabled = !!item.includes("F");
        if(!this.pickupDisabled)
        this.getCreateRosterPickupLocation();
    }

    @action
    setPickupLocation(item) {
        let name;
        if(this.CRN_calculateRoster[0].RestrictToPOILogin === 1) {
            if (item.ID === "H") {
                name = item.Name + "-Nodal";
            } else {
                name = item.Name;
            }
        }else{
            name = item.Name;
        }
        this.CRN_pickupSelected = name;
        this.CRN_pickupLocationObject = item;
    }

    @action
    setDropLocation(item) {
        let name="";
        if(this.CRN_calculateRoster[0].RestrictToPOILogout === 1) {
            if (item.ID === "H") {
                name = item.Name + "-Nodal";
            } else {
                name = item.Name;
            }
        }else{
            name = item.Name;
        }
        this.CRN_dropSelected = name;
        this.CRN_dropLocationObject = item;
    }
    @action
    setLogoutShifts(item) {
        this.CRN_logOutSelected = item;
        this.CRN_dropSelected = "Select";
        this.CRN_dropLocationObject = {};
        this.getCreateRoster()
        this.dropDisabled = !!item.includes("F");
        if(!this.dropDisabled)
        this.getCreateRosterDropLocation();
    }

    getCreateRosterPickupLocation() {
        if (this.CRN_pickupSelected === 'Select') {
            if (this.CRN_calculateRoster[0].AllowOtherLocationsLogin === 0 || this.Locations.length <= 2) {
                let location = this.Locations.find(e => e.ID === 'H');
                this.CRN_pickupSelected = this.CRN_calculateRoster[0].RestrictToPOILogin === 1 ? location.Name + "-Nodal" : location.Name;
                this.CRN_pickupLocationObject = location;
            }
        }
    }


    getCreateRosterDropLocation() {
        if (this.CRN_dropSelected === 'Select') {
            if (this.CRN_calculateRoster[0].AllowOtherLocationsLogout === 0 || this.Locations.length <= 2) {
                let location = this.Locations.find(e => e.ID === 'H');
                this.CRN_dropSelected = this.CRN_calculateRoster[0].RestrictToPOILogout === 1 ? location.Name + "-Nodal" : location.Name;
                this.CRN_dropLocationObject= location;
            }
        }
    }


    @action
    getDatesInit(){
        this.startDate = "Select";
        try {
            this.startDate = (this.fromDate && !this.fromDate.includes("Select")) ? this.fromDate :
                moment().add(1, "days").format();
        } catch (e) {
            this.startDate = this.fromDate;
        }
        this.endDate = "Select";
        try {
            this.endDate = (this.toDate && !this.toDate.includes("Select")) ? this.toDate : moment()
                .add(2, "days").format()
        } catch (e) {
            this.endDate = this.toDate;
        }
        if (this.EligibleRosterDays > 2) {
            this.minDate = moment().add(1, "days").format();
            this.maxDate = moment().add(this.EligibleRosterDays, "days").format();
        } else if (this.EligibleRosterDays === 2) {
            this.minDate = moment().add(1, "days").format("YYYY-MM-DD");
            this.maxDate = moment().add(2, "days").format("YYYY-MM-DD");
        } else if (this.EligibleRosterDays === 1) {
            this.minDate = moment().format("YYYY-MM-DD");
            this.maxDate = moment().add(1, "days").format("YYYY-MM-DD");
            this.endDate=this.startDate;
        }
    }

    @action disableOptOutVisible() {
        this.visibleOptOutModal = false;
        this.accepted = false;
        this.optOutAccepted = false;
        this.noShowPerformed=false;
    }

    @action toggleAccept() {
        this.accepted = !this.accepted;
    }

    @action
    rosterOptOutSelected() {
        this.optOutAccepted = true;
        this.visibleOptOutModal = false;
    };

    @computed get computedMarkedDates() {
        let dates = {};
        if (this.AvailableRosters && this.AvailableRosters.length > 0) {
            this.AvailableRosters.map(val => {
                if (val === moment().format("YYYY-MM-DD")) {
                    dates[val] = {
                        textColor: colors.WHITE,
                        selected: true,
                        selectedColor: colors.GREEN
                    };
                } else if (val)
                    dates[val] = {
                        textColor: colors.WHITE,
                        selected: true,
                        selectedColor: colors.BLUE
                    };
            });
            let days = [];
            let pivot = moment().startOf("month");
            const end = moment().endOf("month");
            const disabled = {disabled: true, disableTouchEvent: true};
            while (pivot.isBefore(end)) {
                days.forEach(day => {
                    dates[pivot.day(day).format("YYYY-MM-DD")] = disabled;
                });
                pivot.add(7, "days");
            }
            return Object.assign(pivot, dates);
        } else {
            return []
        }
    }

    @computed get computedAvailableRosterDates () {
        let dates = {};
        console.warn('AvailableRosters - ', this.AvailableRosters);
        if (this.AvailableRosters && this.AvailableRosters.length > 0) {
            this.AvailableRosters.map(val => {
console.warn('map value - ', val);
                if (val) {
                    dates[val] = {marked: true, dotColor: colors.BLUE}
                }
            });
            return Object.assign(dates);
        } else {
            return []
        }
    }

    @computed
    get getLoginRouteType() {
        this.Rosters.map((roster) => {
            let loginRouteType = roster.LoginShifts.split('|').find(x => !x.toString().includes("D"));
            if (loginRouteType !== "D" && loginRouteType.length > 0)
                return loginRouteType;
        });
        return "D";
    }

    @computed
    get getLogOutRouteType() {
        this.Rosters.map((roster) => {
            let logOutRouteType = roster.LogoutShifts.split('|').find(x => !x.toString().includes("D"));
            if (logOutRouteType !== "D" && logOutRouteType.length > 0) {
                return logOutRouteType;
            }
        });
        return "D";
    }

    @computed
    get getLoginAllowedStatus() {
        return this.isPastRoster() || this.RosteringAllowedLogin === 0;
    }

    @computed
    get getLogOutAllowedStatus() {
        setTimeout(() => {
            if (this.RosteringAllowedLogout === 0) return true;
            else if (this.isPastRoster()) {
                return !(this.isSelectedDateIsPreviousDay() && (this.calculateRoster && this.calculateRoster[0].LogoutShifts.includes("*")));
            }
        }, 400)
    }

    @computed
    get isNotEmptyOrCancelledLoginShift() {
        return this.selectedRoster.loginSelected !== "Cancelled" && this.selectedRoster.loginSelected !== "Select" && this.RosteringAllowedLogin === 1;
    }

    @computed
    get isNotEmptyOrCancelledLogOutShift() {
        return this.selectedRoster.logoutSelected !== "Cancelled" && this.selectedRoster.logoutSelected !== "Select" && this.RosteringAllowedLogin === 1;
    }

    getPickupLocation() {
        if (this.selectedRoster.pickupLocationSelected === 'Select') {
            if (this.calculateRoster[0].AllowOtherLocationsLogin === 0 || this.Locations.length <= 2) {
                let location = this.Locations.find(e => e.ID === 'H');
                this.selectedRoster.pickupLocationSelected = this.calculateRoster[0].RestrictToPOILogin === 1 ? location.Name + "-Nodal" : location.Name;
                this.selectedRoster.loginLocationObject = location;
                this.selectedRoster.anyChangeInDataLogin = true;
            }
        }
        return this.selectedRoster.pickupLocationSelected;
    }


    getDropLocation() {
        if (this.selectedRoster.dropLocationSelected === 'Select') {
            if (this.calculateRoster[0].AllowOtherLocationsLogout === 0 || this.Locations.length <= 2) {
                let location = this.Locations.find(e => e.ID === 'H');
                this.selectedRoster.dropLocationSelected = this.calculateRoster[0].RestrictToPOILogout === 1 ? location.Name + "-Nodal" : location.Name;
                this.selectedRoster.logoutLocationObject = location;
                this.selectedRoster.anyChangeInDataLogout = true;
            }
        }
        return this.selectedRoster.dropLocationSelected;
    }

    @action
    getCalculatedRoster() {
        let loginOfficeId=this.findID(this.selectedRoster.officeLoginSelected,this.Offices);
        let logoutOfficeId=this.findID(this.selectedRoster.officeLogoutSelected,this.Offices);
        if (loginOfficeId && logoutOfficeId) {
            let selectedDaysinNumber = [];
            selectedDaysinNumber.push(weeklyOffDaysToNumber[moment(this.RosterDate).format("dddd")]);
            let customisedRosters = filterShiftTimeBasedOnCutOffTime(
                this.Rosters,
                this.RosterDate,
                this.RosterDate,
                loginOfficeId,
                logoutOfficeId);
            this.calculateRoster = this.getCalculatedRosterComp(
                customisedRosters,
                selectedDaysinNumber,
                loginOfficeId,
                logoutOfficeId,
                this.selectedRoster.loginSelected,
                this.selectedRoster.logoutSelected);
        }
        console.warn("getCalculatedRoster :  "+JSON.stringify(this.calculateRoster));
    }

    getCalculatedRosterComp(
        Rosters,
        selectedDaysArray,
        officeLoginSelectedNumber,
        officeLogoutSelectedNumber,
        selectedLoginShift,
        selectedLogoutShift
    ) {
        let rosterTotalWeekdaysAvailable = [];
        for (let i = 0; i < Rosters.length; i++) {
            rosterTotalWeekdaysAvailable.push(Rosters[i].WeekdaysAllowed);
        }
        for (let i = 0; i < selectedDaysArray.length; i++) {
            for (let j = 0; j < Rosters.length; j++) {
                if (
                    !rosterTotalWeekdaysAvailable.join("|").includes(selectedDaysArray[i])
                ) {
                    return [
                        {
                            LoginShifts: "",
                            LogoutShifts: "",
                            OfficeLocationsAllowed: "",
                            AllowOtherLocationsLogin: 0,
                            AllowOtherLocationsLogout: 0,
                            RestrictToPOILogin: 0,
                            RestrictToPOILogout: 0
                        }
                    ];
                }
            }
        }

        let newLoginShifts = [];
        let newLogoutShifts = [];
        let newOfficeLocationsAllowed = [];
        let newAllowOtherLocationsLogin = [];
        let newAllowOtherLocationsLogout = [];
        let RestrictToPOILogin = [];
        let RestrictToPOILogout = [];
        for (let k = 0; k < Rosters.length; k++) {
            let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
            let LoginShiftsArray = Rosters[k].LoginShifts.split("|");
            let LogoutShiftsArray = Rosters[k].LogoutShifts.split("|");
            let OfficeLocationsAllowedArray = Rosters[k].OfficeLocationsAllowed.split("|");
            let AllowOtherLocationsLoginArray = [Rosters[k].AllowOtherLocationsLogin];
            let AllowOtherLocationsLogoutArray = [Rosters[k].AllowOtherLocationsLogout];
            let RestrictToPOILoginArray = [Rosters[k].RestrictToPOILogin];
            let RestrictToPOILogoutArray = [Rosters[k].RestrictToPOILogout];
            for (let i = 0; i < WeekdaysAllowedArray.length; i++) {
                for (let j = 0; j < LoginShiftsArray.length; j++) {
                    newLoginShifts.push(
                        LoginShiftsArray[j] + "#" + WeekdaysAllowedArray[i]
                    );
                }
                for (let j = 0; j < LogoutShiftsArray.length; j++) {
                    newLogoutShifts.push(
                        LogoutShiftsArray[j] + "#" + WeekdaysAllowedArray[i]
                    );
                }
                for (let j = 0; j < OfficeLocationsAllowedArray.length; j++) {
                    newOfficeLocationsAllowed.push(
                        OfficeLocationsAllowedArray[j] + "#" + WeekdaysAllowedArray[i]
                    );
                }
                for (let j = 0; j < AllowOtherLocationsLoginArray.length; j++) {
                    newAllowOtherLocationsLogin.push(
                        AllowOtherLocationsLoginArray[j] + "#" + WeekdaysAllowedArray[i]
                    );
                }
                for (let j = 0; j < AllowOtherLocationsLogoutArray.length; j++) {
                    newAllowOtherLocationsLogout.push(
                        AllowOtherLocationsLogoutArray[j] + "#" + WeekdaysAllowedArray[i]
                    );
                }
                for (let j = 0; j < RestrictToPOILoginArray.length; j++) {
                    RestrictToPOILogin.push(RestrictToPOILoginArray[j] + "#" + WeekdaysAllowedArray[i]);
                }
                for (let j = 0; j < RestrictToPOILogoutArray.length; j++) {
                    RestrictToPOILogout.push(
                        RestrictToPOILogoutArray[j] + "#" + WeekdaysAllowedArray[i]
                    );
                }
            }
        }
        newLoginShifts = newLoginShifts.sort();
        newLogoutShifts = newLogoutShifts.sort();
        let OfficeLocationsAllowed = this.getCalculatedValue(newOfficeLocationsAllowed, selectedDaysArray);
        let LoginShifts = this.getCalculatedValue(newLoginShifts, selectedDaysArray);
        let LogoutShifts = this.getCalculatedValue(newLogoutShifts, selectedDaysArray);
        return [
            {
                LoginShifts: OfficeLocationsAllowed.includes(officeLoginSelectedNumber)
                    ? LoginShifts
                    : "",
                LogoutShifts: OfficeLocationsAllowed.includes(officeLogoutSelectedNumber)
                    ? LogoutShifts
                    : "",
                OfficeLocationsAllowed: OfficeLocationsAllowed,
                AllowOtherLocationsLogin: this.getAllowOtherLocationsLogin(
                    newAllowOtherLocationsLogin,
                    selectedDaysArray,
                    selectedLoginShift,
                    Rosters,
                    officeLoginSelectedNumber
                ),
                AllowOtherLocationsLogout: this.getAllowOtherLocationsLogout(
                    newAllowOtherLocationsLogout,
                    selectedDaysArray,
                    selectedLogoutShift,
                    Rosters,
                    officeLogoutSelectedNumber
                ),
                RestrictToPOILogin: this.getLoginPOI(
                    RestrictToPOILogin,
                    selectedDaysArray,
                    selectedLoginShift,
                    Rosters,
                    officeLoginSelectedNumber
                ),
                RestrictToPOILogout: this.getLogOutPOI(
                    RestrictToPOILogout,
                    selectedDaysArray,
                    selectedLogoutShift,
                    Rosters,
                    officeLogoutSelectedNumber
                )
            }
        ];
    }

    getCalculatedValue(shifts, selectedDaysArray) {
        let matched = [];
        for (let i = 0; i < selectedDaysArray.length; i++) {
            for (let j = 0; j < shifts.length; j++) {
                if (selectedDaysArray[i] === shifts[j].split("#")[1]) {
                    matched.push(shifts[j]);
                }
            }
        }
        let onlyMatched = [];
        for (let i = 0; i < matched.length; i++) {
            onlyMatched.push(matched[i].substr(0, matched[i].lastIndexOf("#")));
        }
        const count = {};
        onlyMatched.forEach(function (i) {
            count[i] = (count[i] || 0) + 1;
        });

        let common = [];
        let max = selectedDaysArray.length;
        Object.keys(count).forEach(function (key) {
            let value = count[key];
            if (value >= max) {
                common.push(key);
            }
        });
        let removeDuplicate = [...new Set(common)];
        return removeDuplicate.join("|");
    }

    getLoginPOI(shifts, selectedDaysArray, selectedLoginShift, Rosters, officeLoginSelectedNumber) {
        if (selectedLoginShift.includes("Select")||selectedLoginShift.includes("Cancel")) {
            let matched = [];
            for (let i = 0; i < selectedDaysArray.length; i++) {
                for (let j = 0; j < shifts.length; j++) {
                    if (selectedDaysArray[i] === shifts[j].split("#")[1]) {
                        matched.push(shifts[j]);
                    }
                }
            }
            let onlyMatched = [];
            for (let i = 0; i < matched.length; i++) {
                onlyMatched.push(matched[i].substr(0, matched[i].lastIndexOf("#")));
            }
            const count = {};
            onlyMatched.forEach(function (i) {
                count[i] = (count[i] || 0) + 1;
            });

            let common = [];
            let max = selectedDaysArray.length;
            Object.keys(count).forEach(function (key) {
                let value = count[key];
                if (value >= max) {
                    common.push(key);
                }
            });
            let removeDuplicate = [...new Set(common)];
            return removeDuplicate.join("|");
        } else {
            let week = selectedDaysArray.toString();
            let temp="";
            if(week.length>0){
                let array = [...new Set(week.split(","))].sort();
                temp = array.toString().replace(/,/gi,"|").toString();
            }
            let customRoster = Rosters.find(function (item) {
                return (item.OfficeLocationsAllowed.includes(officeLoginSelectedNumber) && item.WeekdaysAllowed.includes(temp) && item.LoginShifts.includes(selectedLoginShift));
            });
            return customRoster ? customRoster.RestrictToPOILogin : 0;
        }
    }

    getLogOutPOI(shifts, selectedDaysArray, selectedLogoutShift, Rosters, officeLogoutSelectedNumber) {
        if (selectedLogoutShift.includes("Select")||selectedLogoutShift.includes("Cancel")) {
            let matched = [];
            for (let i = 0; i < selectedDaysArray.length; i++) {
                for (let j = 0; j < shifts.length; j++) {
                    if (selectedDaysArray[i] === shifts[j].split("#")[1]) {
                        matched.push(shifts[j]);
                    }
                }
            }
            let onlyMatched = [];
            for (let i = 0; i < matched.length; i++) {
                onlyMatched.push(matched[i].substr(0, matched[i].lastIndexOf("#")));
            }
            const count = {};
            onlyMatched.forEach(function (i) {
                count[i] = (count[i] || 0) + 1;
            });

            let common = [];
            let max = selectedDaysArray.length;
            Object.keys(count).forEach(function (key) {
                let value = count[key];
                if (value >= max) {
                    common.push(key);
                }
            });
            let removeDuplicate = [...new Set(common)];
            return removeDuplicate.join("|");
        } else {
            let week = selectedDaysArray.toString();
            let temp="";
            if(week.length>0){
                let array = [...new Set(week.split(","))].sort();
                temp = array.toString().replace(/,/gi,"|").toString();
            }
            let customRoster = Rosters.find(function (item) {
                return (item.OfficeLocationsAllowed.includes(officeLogoutSelectedNumber) && item.WeekdaysAllowed.includes(temp) && item.LogoutShifts.includes(selectedLogoutShift));
            });
            return customRoster ? customRoster.RestrictToPOILogout : 0;
        }
    }

    getAllowOtherLocationsLogin(shifts, selectedDaysArray, selectedLoginShift, Rosters, officeLoginSelectedNumber) {
        if (selectedLoginShift.includes("Select")||selectedLoginShift.includes("Cancel")) {
            let matched = [];
            for (let i = 0; i < selectedDaysArray.length; i++) {
                for (let j = 0; j < shifts.length; j++) {
                    if (selectedDaysArray[i] === shifts[j].split("#")[1]) {
                        matched.push(shifts[j]);
                    }
                }
            }
            let onlyMatched = [];
            for (let i = 0; i < matched.length; i++) {
                onlyMatched.push(matched[i].substr(0, matched[i].lastIndexOf("#")));
            }
            const count = {};
            onlyMatched.forEach(function (i) {
                count[i] = (count[i] || 0) + 1;
            });

            let common = [];
            let max = selectedDaysArray.length;
            Object.keys(count).forEach(function (key) {
                let value = count[key];
                if (value >= max) {
                    common.push(key);
                }
            });
            let removeDuplicate = [...new Set(common)];
            return removeDuplicate.join("|");
        } else {
            let customRoster = Rosters.find(function (item) {
                let weekdaysArray = item.WeekdaysAllowed.split("|");
                let index=-1;
                weekdaysArray.some(function (element,i) {
                    if (selectedDaysArray.toString().includes(element)) {
                        index = i;
                        return true;
                    }
                });
                return (item.OfficeLocationsAllowed.includes(officeLoginSelectedNumber) && (index >= 0) &&
                    item.LoginShifts.includes(selectedLoginShift));
            });
            return customRoster ? customRoster.AllowOtherLocationsLogin : 0;
        }
    }

    getAllowOtherLocationsLogout(shifts, selectedDaysArray, selectedLogoutShift, Rosters, officeLogoutSelectedNumber) {
        if (selectedLogoutShift.includes("Select")||selectedLogoutShift.includes("Cancel")) {
            let matched = [];
            for (let i = 0; i < selectedDaysArray.length; i++) {
                for (let j = 0; j < shifts.length; j++) {
                    if (selectedDaysArray[i] === shifts[j].split("#")[1]) {
                        matched.push(shifts[j]);
                    }
                }
            }
            let onlyMatched = [];
            for (let i = 0; i < matched.length; i++) {
                onlyMatched.push(matched[i].substr(0, matched[i].lastIndexOf("#")));
            }
            const count = {};
            onlyMatched.forEach(function (i) {
                count[i] = (count[i] || 0) + 1;
            });

            let common = [];
            let max = selectedDaysArray.length;
            Object.keys(count).forEach(function (key) {
                let value = count[key];
                if (value >= max) {
                    common.push(key);
                }
            });
            let removeDuplicate = [...new Set(common)];
            return removeDuplicate.join("|");
        } else {
            let week = selectedDaysArray.toString();
            let temp="";
            if(week.length>0){
                let array = [...new Set(week.split(","))].sort();
                temp = array.toString().replace(/,/gi,"|").toString();
            }
            let customRoster = Rosters.find(function (item) {
                return (item.OfficeLocationsAllowed.includes(officeLogoutSelectedNumber) && item.WeekdaysAllowed.includes(temp) && item.LogoutShifts.includes(selectedLogoutShift));
            });
            return customRoster ? customRoster.AllowOtherLocationsLogout : 0;
        }
    }

    isPastRoster() {
        let rosterDate = moment(this.RosterDate).format("YYYY-MM-DD");
        let today = moment().format("YYYY-MM-DD");
        return moment(rosterDate).isBefore(today);
    }

    isSelectedDateIsPreviousDay() {
        let rosterDate = moment(this.RosterDate).format("YYYY-MM-DD");
        let previous = moment().subtract(1, 'day').format("YYYY-MM-DD");
        return moment(rosterDate).isSame(previous);
    }

    @action
    async getRosterDetails(context) {
        let body = {DeviceID: this.userId};
        await axios.post(this.customerUrl + URL.GET_ROSTER_DETAILS, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(() => {
                let data = response.data;
                console.warn('GET_ROSTER_DETAILS - ', data);
                this.isLoading = false;
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                try {
                    if (data.Status === "200") {
                        this.rosterDetails = data;
                        this.AvailableRosters = data.AvailableRosters.split('|');
                        this.MaxShiftsPerDay = (data.MaxShiftsPerDay ? data.MaxShiftsPerDay : 1);
                        this.EligibleRosterDays = data.EligibleRosterDays;
                        this.MaxOtherLocationCount = data.MaxOtherLocationCount;
                        this.RosteringAllowedLogin = data.RosteringAllowedLogin;
                        this.RosteringAllowedLogout = data.RosteringAllowedLogout;
                        this.Locations = data.Locations;
                        this.Offices = data.Offices;
                        this.Rosters = data.Rosters;
                        this.DefaultOffice = data.DefaultOffice;
                        this.LoginNoShowLimit = data.LoginNoShowLimit;
                        this.LogoutNoShowLimit = data.LogoutNoShowLimit;
                        this.NoShowCount = data.NoShowCount;
                        this.LoginCutoffMinutes = data.LoginCutoffMinutes;
                        this.LogoutCutoffMinutes = data.LogoutCutoffMinutes;
                        this.NoShowErrorMessage = data.NoShowErrorMessage;
                    } else if (data.Description) {
                        Alert1.show(null, data.Description);
                        NavigationService.navigate(StackActions.popToTop())
                    } else {
                        Alert1.show("Roster", "Something went wrong. Please try later.");
                    }
                } catch (error) {
                    console.warn("Err Roster->" + error.message);
                    NavigationService.navigate(StackActions.popToTop())
                }
            });
        }).catch(async error => {
            if (error) {
                this.isLoading = false;
            }
        });
    }

    @action
    enableLoader() {
        this.isLoading = true;
    }

    @action
    disableLoader() {
        this.isLoading = false;
    }

    @action
    updateLoginOffice(office) {
        this.selectedRoster.officeLoginSelected = office.Name;
        this.selectedRoster.loginSelected = "Select";
        this.selectedRoster.pickupLocationSelected = "Select";
        this.selectedRoster.loginLocationObject = {};
        this.selectedRoster.anyChangeInDataLogin = false;
        this.getCalculatedRoster();

    }

    @action
    updateLogOutOffice(office) {
        this.selectedRoster.officeLogoutSelected = office.Name;
        this.selectedRoster.logoutSelected = "Select";
        this.selectedRoster.dropLocationSelected = "Select";
        this.selectedRoster.logoutLocationObject = {};
        this.selectedRoster.anyChangeInDataLogout = false;
        this.getCalculatedRoster();

    }

    @action
    updateLoginShiftTime(shiftTime) {
        console.warn("updateLoginShiftTime "+JSON.stringify(shiftTime));
        this.selectedRoster.loginSelected = shiftTime;
        this.selectedRoster.pickupLocationSelected = "Select";
        this.selectedRoster.anyChangeInDataLogin = true;
        this.getCalculatedRoster();
        this.pickupDisabled = !!shiftTime.includes("F");
        this.getPickupLocation()
    }

    @action
    updateLogOutShiftTime(shiftTime) {
        console.warn("updateLogOutShiftTime "+JSON.stringify(shiftTime));
        this.selectedRoster.logoutSelected = shiftTime;
        this.selectedRoster.dropLocationSelected = "Select";
        this.selectedRoster.anyChangeInDataLogout = true;
        this.getCalculatedRoster();
        this.dropDisabled = !!shiftTime.includes("F");
        this.getDropLocation()
    }

    @action
    updatePickUpAddress(location, name) {
        this.selectedRoster.pickupLocationSelected =name;
        this.selectedRoster.loginLocationObject = location;
        this.selectedRoster.anyChangeInDataLogin = true;
    }

    @action
    updateDropAddress(location,name) {
        this.selectedRoster.dropLocationSelected = name;
        this.selectedRoster.logoutLocationObject = location;
        this.selectedRoster.anyChangeInDataLogout = true;
    }

    @action
    async updateRosterStore(fromBottomSheet) {
        // this.disclaimerType = "LOGIN";
        let updateBody = {};
        let date = moment(this.RosterDate).format("DD-MMM");
        if (this.selectedRoster.anyChangeInDataLogin && !this.selectedRoster.anyChangeInDataLogout) {
            if(!this.noShowPerformed) {
                await this.isLoginNoShow(fromBottomSheet?date:undefined);
                return Promise.resolve("NO-SHOW");
            }
            updateBody = {
                RosterDate: this.RosterDate,
                RosterID: this.selectedRoster.RosterID,
                DeviceID: this.userId,
                LoginLocID: this.selectedRoster.loginLocationObject.ID,
                LoginTime: this.selectedRoster.loginSelected === "Select" ? "" :
                    this.selectedRoster.loginSelected === "Cancel" ? "NS"
                        : this.selectedRoster.loginSelected.split(',')[0],
                LoginRouteType: this.selectedRoster.loginSelected === "Cancel" ? "D"
                    : this.selectedRoster.loginSelected.toString().split(',')[2],
                LoginOffice: this.findID(
                    this.selectedRoster.officeLoginSelected,
                    this.Offices
                ),
                LoginLocName: this.selectedRoster.pickupLocationSelected!=="Select"?this.selectedRoster.pickupLocationSelected:undefined,
                LoginLocAddress: this.selectedRoster.loginLocationObject.Address,
                LoginLocLat: this.selectedRoster.loginLocationObject.Lat,
                LoginLocLng: this.selectedRoster.loginLocationObject.Lng
            };
            console.warn(" Request Body login - "+JSON.stringify(updateBody));
            if(this.isLoginRosterOptOutEnabled(updateBody)){
                return Promise.resolve("OPT-OUT");
            } else return this.updateApiCall(updateBody);
        } else if (!this.selectedRoster.anyChangeInDataLogin && this.selectedRoster.anyChangeInDataLogout) {
            if(!this.noShowPerformed) {
                this.isLogOutNoShow(fromBottomSheet?date:undefined);
                return Promise.resolve("NO-SHOW");
            }
            updateBody = {
                RosterDate: this.RosterDate,
                RosterID: this.selectedRoster.RosterID,
                DeviceID: this.userId,
                LogoutLocID: this.selectedRoster.logoutLocationObject.ID,
                LogoutTime: this.selectedRoster.logoutSelected==="Select"?"":
                    this.selectedRoster.logoutSelected === 'Cancel' ? 'NS' : this.selectedRoster.logoutSelected.split(',')[0],
                LogoutRouteType: this.selectedRoster.logoutSelected === "Cancel" ? "D" : this.selectedRoster.logoutSelected.toString().split(',')[2],
                LogoutOffice: this.findID(this.selectedRoster.officeLogoutSelected, this.Offices),
                LogoutLocName: this.selectedRoster.dropLocationSelected!=="Select"?this.selectedRoster.dropLocationSelected:undefined,
                LogoutLocAddress: this.selectedRoster.logoutLocationObject.Address,
                LogoutLocLng: this.selectedRoster.logoutLocationObject.Lat,
                LogoutLocLat: this.selectedRoster.logoutLocationObject.Lng
            };
            if(this.isLogOutRosterOptOutEnabled(updateBody)){
                return Promise.resolve("OPT-OUT");
            } else return  await this.updateApiCall(updateBody);
        } else if (this.selectedRoster.anyChangeInDataLogin && this.selectedRoster.anyChangeInDataLogout) {
            if(!this.noShowPerformed) {
                this.isBothNoShow(fromBottomSheet?date:undefined);
                return Promise.resolve("NO-SHOW");
            }
            updateBody = {
                RosterDate: this.RosterDate,
                // RosterID: this.RosterID,
                RosterID: this.selectedRoster.RosterID,
                DeviceID: this.userId,
                LoginLocID: this.selectedRoster.loginLocationObject.ID,
                LoginTime: this.selectedRoster.loginSelected === "Select" ? "" :
                    this.selectedRoster.loginSelected === "Cancel" ? "NS" : this.selectedRoster.loginSelected.split(',')[0],
                LoginRouteType: this.selectedRoster.loginSelected === "Cancel" ? "D" : this.selectedRoster.loginSelected.toString().split(',')[2],
                LoginOffice: this.findID(this.selectedRoster.officeLoginSelected, this.Offices),
                LoginLocName: this.selectedRoster.pickupLocationSelected!=="Select"?this.selectedRoster.pickupLocationSelected:undefined,
                LoginLocAddress: this.selectedRoster.loginLocationObject.Address,
                LoginLocLat: this.selectedRoster.loginLocationObject.Lat,
                LoginLocLng: this.selectedRoster.loginLocationObject.Lng,
                LogoutLocID: this.selectedRoster.logoutLocationObject.ID,
                LogoutTime: this.selectedRoster.logoutSelected === "Select" ? "" :
                    this.selectedRoster.logoutSelected === 'Cancel' ? 'NS' : this.selectedRoster.logoutSelected.split(',')[0],
                LogoutRouteType: this.selectedRoster.logoutSelected === "Cancel" ? "D" : this.selectedRoster.logoutSelected.toString().split(',')[2],
                LogoutOffice: this.findID(this.selectedRoster.officeLogoutSelected, this.Offices),
                LogoutLocName: this.selectedRoster.dropLocationSelected!=="Select"?this.selectedRoster.dropLocationSelected:undefined,
                LogoutLocAddress: this.selectedRoster.logoutLocationObject.Address,
                LogoutLocLng: this.selectedRoster.logoutLocationObject.Lat,
                LogoutLocLat: this.selectedRoster.logoutLocationObject.Lng,
            };
            if(this.isBothRosterOptOutEnabled(updateBody)){
            // if(this.isLoginRosterOptOutEnabled(updateBody) || this.isLogOutRosterOptOutEnabled(updateBody)){
                return Promise.resolve("OPT-OUT");
            } else return  await this.updateApiCall(updateBody);
        }
    }

    @action
    async setMultiRosterCancelData() {
        let updateBody = {};
        let date = moment(this.RosterDate).format("DD-MMM");
        if (this.selectedRoster.anyChangeInDataLogin && !this.selectedRoster.anyChangeInDataLogout) {
            if(!this.noShowPerformed) {
                await this.isLoginNoShow(date);
                return Promise.resolve("NO-SHOW");
            }
            updateBody = {
                RosterDate: this.RosterDate,
                RosterID: this.selectedRoster.RosterID,
                DeviceID: this.userId,
                LoginLocID: this.selectedRoster.loginLocationObject.ID,
                LoginTime: "NS",
                LoginRouteType: this.selectedRoster.loginSelected === "Cancel" ? "D"
                    : this.selectedRoster.loginSelected.toString().split(',')[2],
                LoginOffice: this.findID(
                    this.selectedRoster.officeLoginSelected,
                    this.Offices
                ),
                LoginLocName: this.selectedRoster.pickupLocationSelected !== "Select" ? this.selectedRoster.pickupLocationSelected:undefined,
                LoginLocAddress: this.selectedRoster.loginLocationObject.Address,
                LoginLocLat: this.selectedRoster.loginLocationObject.Lat,
                LoginLocLng: this.selectedRoster.loginLocationObject.Lng
            };
            this.multiRosterCancel = updateBody;
            console.warn("-------cancel login====="+JSON.stringify(updateBody));

            return updateBody;
        } else if (!this.selectedRoster.anyChangeInDataLogin && this.selectedRoster.anyChangeInDataLogout) {
            if(!this.noShowPerformed) {
                this.isLogOutNoShow(date);
                return Promise.resolve("NO-SHOW");
            }
            updateBody = {
                RosterDate: this.RosterDate,
                RosterID: this.selectedRoster.RosterID,
                DeviceID: this.userId,
                LogoutLocID: this.selectedRoster.logoutLocationObject.ID,
                LogoutTime: this.selectedRoster.logoutSelected==="Select"?"":
                    this.selectedRoster.logoutSelected === 'Cancel' ? 'NS' : this.selectedRoster.logoutSelected.split(',')[0],
                LogoutRouteType: this.selectedRoster.logoutSelected === "Cancel" ? "D" : this.selectedRoster.logoutSelected.toString().split(',')[2],
                LogoutOffice: this.findID(this.selectedRoster.officeLogoutSelected, this.Offices),
                LogoutLocName: this.selectedRoster.dropLocationSelected!=="Select"?this.selectedRoster.dropLocationSelected:undefined,
                LogoutLocAddress: this.selectedRoster.logoutLocationObject.Address,
                LogoutLocLng: this.selectedRoster.logoutLocationObject.Lat,
                LogoutLocLat: this.selectedRoster.logoutLocationObject.Lng
            };
            this.multiRosterCancel = updateBody;
            console.warn("-------cancel logout====="+JSON.stringify(updateBody));

            return updateBody;
        } else if (this.selectedRoster.anyChangeInDataLogin && this.selectedRoster.anyChangeInDataLogout) {
            if(!this.noShowPerformed) {
                this.isBothNoShow(date);
                return Promise.resolve("NO-SHOW");
            }
            updateBody = {
                RosterDate: this.RosterDate,
                RosterID: this.selectedRoster.RosterID,
                DeviceID: this.userId,
                LoginLocID: this.selectedRoster.loginLocationObject.ID,
                LoginTime: this.selectedRoster.loginSelected === "Select" ? "" :
                    this.selectedRoster.loginSelected === "Cancel" ? "NS" : this.selectedRoster.loginSelected.split(',')[0],
                LoginRouteType: this.selectedRoster.loginSelected === "Cancel" ? "D" : this.selectedRoster.loginSelected.toString().split(',')[2],
                LoginOffice: this.findID(this.selectedRoster.officeLoginSelected, this.Offices),
                LoginLocName: this.selectedRoster.pickupLocationSelected!=="Select"?this.selectedRoster.pickupLocationSelected:undefined,
                LoginLocAddress: this.selectedRoster.loginLocationObject.Address,
                LoginLocLat: this.selectedRoster.loginLocationObject.Lat,
                LoginLocLng: this.selectedRoster.loginLocationObject.Lng,
                LogoutLocID: this.selectedRoster.logoutLocationObject.ID,
                LogoutTime: this.selectedRoster.logoutSelected==="Select"?"":
                    this.selectedRoster.logoutSelected === 'Cancel' ? 'NS' : this.selectedRoster.logoutSelected.split(',')[0],
                LogoutRouteType: this.selectedRoster.logoutSelected === "Cancel" ? "D" : this.selectedRoster.logoutSelected.toString().split(',')[2],
                LogoutOffice: this.findID(this.selectedRoster.officeLogoutSelected, this.Offices),
                LogoutLocName: this.selectedRoster.dropLocationSelected!=="Select"?this.selectedRoster.dropLocationSelected:undefined,
                LogoutLocAddress: this.selectedRoster.logoutLocationObject.Address,
                LogoutLocLng: this.selectedRoster.logoutLocationObject.Lat,
                LogoutLocLat: this.selectedRoster.logoutLocationObject.Lng,
            };
            this.multiRosterCancel = updateBody;
            console.warn("-------cancel both===="+JSON.stringify(updateBody));

            return updateBody;
        }
        else{
            console.warn("-------cancel else========="+JSON.stringify(this.multiRosterCancel));
        }
    }
    
    clearProps(){
        this.pickupDisabled=false;
        this.dropDisabled=false;
        this.NoShowData={};
        this.visibleOptOutModal=false;
        this.selectedDateAPIResponse={};
        this.selectedDateRosterData=[];
        this.selectedRoster={};
        this.acceptedType=false;
        this.onlyLogin = false;
        this.onlyLogOut = false;
        this.RBSheetOpen = false;
        this.optOutAccepted=false;
        this.noShowPerformed=false;
        this.accepted=false;
        this.rosterUpdated=true;
    }

    isLoginNoShow(date){
        console.warn('this.selectedDateAPIResponse - ', this.selectedDateAPIResponse);
        let shiftTime = this.selectedDateAPIResponse.LoginShift;
        if (!shiftTime) {
            this.NoShowData.title = "";
            this.NoShowData.message = ""
            return;
        }

        let cancelRoster = {
            TripType: "Pickup",
            tripTime: this.RosterDate + "T" + shiftTime // new moment(this.RosterDate + "T" + shiftTime, "YYYY-MM-DDTHH:mm")
        };
        console.warn('shiftTime->', shiftTime);
        console.warn('cancelRoster, this.LoginCutoffMinutes - ', cancelRoster, this.LoginCutoffMinutes);
        if (isWithinCutOff(cancelRoster, this.LoginCutoffMinutes)) {
            if (this.isProperNoShowObject() && isLimitExceded(this.NoShowCount) && isWithInTimeFrame(this.NoShowCount, cancelRoster)) {
                this.NoShowData.title=noShow.no_show_title;
                this.NoShowData.message=this.NoShowErrorMessage + noShow.are_you_sure
            } else {
                this.NoShowData.title=noShow.no_show_title;
                this.NoShowData.message=noShow.noShowMessage
            }
        } else {
            if(date) {
                this.NoShowData.title = noShow.normal_title;
                this.NoShowData.message = noShow.normal + date + "?"
            }else{
                this.NoShowData.title = "";
                this.NoShowData.message = ""
            }
        }
    }

    isLogOutNoShow(date){
        console.warn('date->', date);
        let tripTime;
        let shiftTime = this.selectedDateAPIResponse.LogoutShift;
        console.warn('shiftTime->', shiftTime);
        if (!shiftTime) {
            this.NoShowData.title = "";
            this.NoShowData.message = ""
            return;
        }
        console.warn('selectedRoster - ', this.selectedRoster);
        if (shiftTime.includes("*")) { // this.selectedRoster.logoutSelected
            let RosterDate = new moment(this.RosterDate, "YYYY-MM-DD").format("YYYY-MM-DD");
            // let previous = moment().subtract(1, 'days').format("YYYY-MM-DD");
            let presentDate = moment().format("YYYY-MM-DD");
            if (RosterDate === presentDate) {
                console.warn('same date + 1');
                tripTime = moment().add(1, 'days').format("YYYY-MM-DD") + "T" + shiftTime.replace("*", "") // this.selectedRoster.logoutSelected
            } else if (moment(RosterDate).isAfter(presentDate)) {
                console.warn('roster date + 1');
                tripTime = moment(RosterDate).add(1, 'days').format("YYYY-MM-DD") + "T" + shiftTime.replace("*", "") // this.selectedRoster.logoutSelected
            } else {
                tripTime = RosterDate + "T" + shiftTime.replace("*", ""); // this.selectedRoster.logoutSelected
            }
        } else {
            tripTime = this.RosterDate + "T" + shiftTime;
        }
        console.warn('tripTime - ', tripTime);
        let dateTime = this.RosterDate + "T" + shiftTime.replace("*", "");
        console.warn('datetime -> ', dateTime);
        let cancelRoster = {
            TripType: "Drop",
            tripTime: tripTime ? tripTime : dateTime// new moment(datetime, "YYYY-MM-DDTHH:mm")
        };
        console.warn('cancelRoster, this.LogoutCutoffMinutes - ', cancelRoster, this.LogoutCutoffMinutes);
        if (isWithinCutOff(cancelRoster, this.LogoutCutoffMinutes)) {
            console.warn('LO in WithinCutOff');
            if (this.isProperNoShowObject() && isLimitExceded(this.NoShowCount) && isWithInTimeFrame(this.NoShowCount, cancelRoster)) {
                this.NoShowData.title=noShow.no_show_title;
                this.NoShowData.message=this.NoShowErrorMessage + noShow.are_you_sure
            } else {
                this.NoShowData.title=noShow.no_show_title;
                this.NoShowData.message=noShow.noShowMessage
            }
        } else {
            if(date) {
                this.NoShowData.title = noShow.normal_title;
                this.NoShowData.message = noShow.normal + date + "?"
            }else{
                this.NoShowData.title = "";
                this.NoShowData.message = ""
            }
        }
    }

    isBothNoShow(date){
        let logInShiftTime = this.selectedDateAPIResponse.LoginShift;
        let logOutShiftTime = this.selectedDateAPIResponse.LogoutShift;
        
        if (!logInShiftTime || !logOutShiftTime) {
            this.NoShowData.title = "";
            this.NoShowData.message = ""
            return;
        }

        let loginRoster = {
            TripType: "Pickup",
            tripTime: this.RosterDate + "T" + logInShiftTime // new moment(this.RosterDate + "T" + logInShiftTime, "YYYY-MM-DDTHH:mm")
        };
        console.warn('logInShiftTime, loginRoster - ', logInShiftTime, loginRoster);
        console.warn('loginRoster, this.LoginCutoffMinutes - ', loginRoster, this.LoginCutoffMinutes);
        
        if (isWithinCutOff(loginRoster, this.LoginCutoffMinutes)) {
            console.warn('L in WithinCutOff');
            if (this.isProperNoShowObject() && isLimitExceded(this.NoShowCount) && isWithInTimeFrame(this.NoShowCount, loginRoster)) {
                this.NoShowData.title = noShow.no_show_title;
                this.NoShowData.message = this.NoShowErrorMessage + noShow.are_you_sure
            } else {
                this.NoShowData.title = noShow.no_show_title;
                this.NoShowData.message = noShow.noShowMessage
            }
        } else if (logOutShiftTime) {
            console.warn("includes *");
            let tripTime;
            if (logOutShiftTime.includes("*")) {
                let RosterDate = new moment(this.RosterDate, "YYYY-MM-DD").format("YYYY-MM-DD");
                let presentDate = moment().format("YYYY-MM-DD");
                if (RosterDate === presentDate) {
                    console.warn('same date + 1');
                    tripTime = moment().add(1, 'days').format("YYYY-MM-DD") + "T" + logOutShiftTime.replace("*", "")
                } else if (moment(RosterDate).isAfter(presentDate)) {
                    console.warn('roster date + 1');
                    tripTime = moment(RosterDate).add(1, 'days').format("YYYY-MM-DD") + "T" + logOutShiftTime.replace("*", "")
                } else {
                    tripTime = RosterDate + "T" + logOutShiftTime.replace("*", "");
                }
            } else {
                tripTime = this.RosterDate + "T" + logOutShiftTime;
            }

            let logoutRoster = {
                TripType: "Drop",
                tripTime: tripTime // ? tripTime : new moment(this.RosterDate + "T" + logOutshiftTime, "YYYY-MM-DDTHH:mm")
            };
            console.warn('logoutRoster, this.LogoutCutoffMinutes - ', logoutRoster, this.LogoutCutoffMinutes);
            if (isWithinCutOff(logoutRoster, this.LogoutCutoffMinutes)) {
                console.warn('LO in WithinCutOff');
                if (this.isProperNoShowObject() && isLimitExceded(this.NoShowCount) && isWithInTimeFrame(this.NoShowCount, logoutRoster)) {
                    this.NoShowData.title = noShow.no_show_title;
                    this.NoShowData.message = this.NoShowErrorMessage + noShow.are_you_sure
                } else {
                    this.NoShowData.title = noShow.no_show_title;
                    this.NoShowData.message = noShow.noShowMessage
                }
            } else {
                if (date) {
                    this.NoShowData.title = noShow.normal_title;
                    this.NoShowData.message = noShow.normal + date + "?"
                } else {
                    this.NoShowData.title = "";
                    this.NoShowData.message = ""
                }
            }
        } else {
            if (date) {
                this.NoShowData.title = noShow.normal_title;
                this.NoShowData.message = noShow.normal + date + "?"
            } else {
                this.NoShowData.title = "";
                this.NoShowData.message = ""
            }
        }
    }

    isRosterOptOutEnabled() {
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
            } else return false;
        } else return false;
    }

    isLoginRosterOptOutEnabled(updateBody) {
        console.warn('updateBody - ', updateBody);
        console.warn('isLoginRosterOptOutEnabled - ', this.isRosterOptOutEnabled, this.optOutAccepted, this.disclaimerType);
        if (this.isRosterOptOutEnabled === "true" && !this.optOutAccepted) {
            if (this.disclaimerType === "LOGIN") {
                if (updateBody.LoginTime === "" || updateBody.LoginTime === "NS") {
                    this.acceptedType="LOGIN";
                    this.visibleOptOutModal=true;
                    return true;
                }
            } else if (this.disclaimerType === "LOGOUT") {
                if (updateBody.LoginTime !== "NS") {
                    if (updateBody.LogoutTime === "NS" || updateBody.LogoutTime === "") {
                        this.acceptedType="LOGOUT";
                        this.visibleOptOutModal=true;
                        return true;
                    } else {
                        this.acceptedType="LOGOUT";
                        this.visibleOptOutModal=true;
                        return true;
                    }
                }
            } else if (this.disclaimerType === ("BOTH")) {
                if ( this.selectedDateAPIResponse.LogoutShift === "" || 
                    this.selectedDateAPIResponse.LogoutShift === "NS" ||
                    updateBody.LoginTime === "" || 
                    updateBody.LoginTime === "NS") {
                    this.acceptedType="BOTH";
                    this.visibleOptOutModal=true;
                    return true;
                }
            } else return false;
        } else  return false;
    }
    isLoginRosterOptOutEnabled_old(updateBody){
        console.warn('updateBody - ', updateBody);
        console.warn('isLoginRosterOptOutEnabled - ', this.isRosterOptOutEnabled, this.optOutAccepted, this.disclaimerType);
        if (this.isRosterOptOutEnabled === "true" && !this.optOutAccepted) {
            if (this.disclaimerType === "LOGIN") {
                if (updateBody.LoginTime === "" || updateBody.LoginTime === "NS") {
                    this.acceptedType="LOGIN";
                    this.visibleOptOutModal=true;
                    return true;
                }
            } else if (this.disclaimerType === "LOGOUT") {
                if (updateBody.LoginTime !== "NS") {
                    if ((this.selectedDateAPIResponse.LogoutShift === "NS" || this.selectedDateAPIResponse.LogoutShift === "")) {
                        this.acceptedType="LOGOUT";
                        this.visibleOptOutModal=true;
                        return true;
                    } else {
                        this.acceptedType="LOGOUT";
                        this.visibleOptOutModal=true;
                        return true;
                    }
                }
            } else if (this.disclaimerType === ("BOTH")) {
                if ( this.selectedDateAPIResponse.LogoutShift === "" || 
                    this.selectedDateAPIResponse.LogoutShift === "NS" ||
                    updateBody.LoginTime === "" || 
                    updateBody.LoginTime === "NS") {
                    this.acceptedType="BOTH";
                    this.visibleOptOutModal=true;
                    return true;
                }
            } else return false;
        } else  return false;
    }

    isLogOutRosterOptOutEnabled(updateBody) {
        console.warn('updateBody - ', updateBody);
        console.warn('selectedDateAPIResponse - ', this.selectedDateAPIResponse);
        console.warn('isLogOutRosterOptOutEnabled - ', this.isRosterOptOutEnabled, this.optOutAccepted, this.disclaimerType);
        if (this.isRosterOptOutEnabled === "true" && !this.optOutAccepted) {
            if (this.disclaimerType === "LOGIN") {
                if (updateBody.LogoutTime !== "NS") {
                    if (updateBody.LoginTime === "NS" || updateBody.LoginTime === "") {
                        this.acceptedType="LOGIN";
                        this.visibleOptOutModal=true;
                        return true;
                    } else {
                        this.acceptedType="LOGIN";
                        this.visibleOptOutModal=true;
                        return true;
                    }
                }
            } else if (this.disclaimerType === "LOGOUT") {
                if (updateBody.LogoutTime === "" || updateBody.LogoutTime === ("NS")) {
                    this.acceptedType = "LOGOUT";
                    this.visibleOptOutModal = true;
                    return true;
                }
            } else if (this.disclaimerType === ("BOTH")) {
                if (this.selectedDateAPIResponse.LogoutShift === "" || 
                    this.selectedDateAPIResponse.LogoutShift === "NS" || 
                    this.selectedDateAPIResponse.LoginTime === "" || 
                    this.selectedDateAPIResponse.LoginTime === "NS") {
                    this.acceptedType = "BOTH";
                    this.visibleOptOutModal = true;
                    return true;
                }
            } else return false;
        } else return false;
    }
    isLogOutRosterOptOutEnabled_old(updateBody) {
        console.warn('updateBody - ', updateBody);
        console.warn('selectedDateAPIResponse - ', this.selectedDateAPIResponse);
        console.warn('isLogOutRosterOptOutEnabled - ', this.isRosterOptOutEnabled, this.optOutAccepted, this.disclaimerType);
        if (this.isRosterOptOutEnabled === "true" && !this.optOutAccepted) {
            if (this.disclaimerType === "LOGIN") {
                if ((this.selectedDateAPIResponse.LoginShift === "NS" || this.selectedDateAPIResponse.LoginShift === "")) {
                    this.acceptedType = "LOGIN";
                    this.visibleOptOutModal = true;
                    return true;
                }
            } else if (this.disclaimerType === "LOGOUT") {
                if (updateBody.LogoutTime === "" || updateBody.LogoutTime === ("NS")) {
                    this.acceptedType = "LOGOUT";
                    this.visibleOptOutModal = true;
                    return true;
                }
            } else if (this.disclaimerType === ("BOTH")) {
                if (this.selectedDateAPIResponse.LogoutShift === "" || 
                    this.selectedDateAPIResponse.LogoutShift === "NS" || 
                    this.selectedDateAPIResponse.LoginTime === "" || 
                    this.selectedDateAPIResponse.LoginTime === "NS") {
                    this.acceptedType = "BOTH";
                    this.visibleOptOutModal = true;
                    return true;
                }
            } else return false;
        } else return false;
    }

    isBothRosterOptOutEnabled(updateBody) {
        console.warn('updateBody - ', updateBody);
        console.warn('isBothRosterOptOutEnabled - ', this.isRosterOptOutEnabled, this.optOutAccepted, this.disclaimerType);
        if (this.isRosterOptOutEnabled === "true" && !this.optOutAccepted) {
            if (this.disclaimerType === "LOGIN") {
                // if (updateBody.LoginTime === "" || updateBody.LoginTime === ("NS")) {
                //     this.acceptedType = "LOGIN";
                //     this.visibleOptOutModal = true;
                //     return true;
                // }
            } else if (this.disclaimerType === "LOGOUT") {
                // if (updateBody.LogoutTime === "" || updateBody.LogoutTime === ("NS")) {
                //     this.acceptedType = "LOGOUT";
                //     this.visibleOptOutModal = true;
                //     return true;
                // }
            } else if (this.disclaimerType === ("BOTH")) {
                if (updateBody.LoginTime !== "NS" || updateBody.LogoutTime !== "NS") {
                    if (updateBody.LoginTime === "" || updateBody.LogoutTime === "" || updateBody.LoginTime === "NS" || updateBody.LogoutTime === "NS") {
                        this.acceptedType = "BOTH";
                        this.visibleOptOutModal = true;
                        return true;
                    }
                }
            } else return false;
        } else return false;
    }

    isProperNoShowObject(){
        console.warn('NoShowCount - ', this.NoShowCount);
        return  !!(this.NoShowCount && this.NoShowCount.Limit !== -1);
    }

    async updateApiCall(updateBody) {
        if (this.accepted === true && this.isRosterOptOutEnabled === true) {
            if (this.acceptedType === "LOGIN") {
                updateBody["LoginOptOutTCAccepted"] = "1"
            }
            if (this.acceptedType === "LOGOUT") {
                updateBody["LogoutOptOutTCAccepted"] = "1"
            }
        }
        this.isLoading = true;
        await axios.post(this.customerUrl + URL.SaveSingleRoster, updateBody, {
            headers: this.getHeader()
        }).then(async response => {
            this.isLoading = false;
            await runInAction(() => {
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (!data) return;
                if (data.Status === "200") {
                    if (Platform.OS === "ios") {
                        showMessage({
                            message: "Roster",
                            type: "success",
                            description: data.Description,
                            onPress: () => {
                            }
                        });
                    } else {
                        Alert1.show("Roster", JSON.parse(JSON.stringify(data.Description)));
                    }
                    this.clearProps();
                } else if (data.Description) {
                    let description = JSON.parse(JSON.stringify(data.Description));
                    if (Platform.OS === "ios") {
                        showMessage({
                            message: "Roster",
                            type: "warning",
                            description: description.split("|").join("\n\n"),
                            onPress: () => {
                            }
                        });
                    } else {
                        Alert1.show("Roster", description.split("|").join("\n\n"));
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
    async storeMultiCancelRoster(updateBody) {
        this.isLoading = true;
        await axios.post(this.customerUrl + URL.SaveMultiRoster, updateBody, {
            headers: this.getHeader()
        }).then(async response => {
            this.isLoading = false;
            await runInAction(() => {
                console.warn('multi cancel res - ', response);
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let _data = response.data;
                if (!_data) return;
                this.rosterUpdated = true;
                _data.Data.forEach(data => {
                    if (data.Status === "200") {
                        if (Platform.OS === "ios") {
                            showMessage({
                                message: "Cancel Roster",
                                type: "success",
                                description: data.Message,
                                onPress: () => {
                                }
                            });
                        } else {
                            Alert1.show("Cancel Roster", JSON.parse(JSON.stringify(data.Message)));
                        }
                        this.clearProps();
                    } else if (data.Message) {
                        let description = JSON.parse(JSON.stringify(data.Message));
                        if (Platform.OS === "ios") {
                            showMessage({
                                message: "Cancel Roster",
                                type: "warning",
                                description: description.split("|").join("\n\n"),
                                onPress: () => {
                                }
                            });
                        } else {
                            Alert1.show("Cancel Roster", description.split("|").join("\n\n"));
                        }
                    }
                });
            })
        }).catch(error => {
            if (error) {
                this.isLoading = false;
            }
        });
    }

    displayNoShowAlert(updateBody, noShowDeactivation) {
        setTimeout(() => {
            Alert.show(
                'No Show Alert',
                noShowDeactivation ? this.NoShowErrorMessage + noshow.are_you_sure : noshow.noShowMessage,
                [
                    {
                        text: 'NO',
                        onPress: () => {
                            console.log('Cancel Pressed')
                        },
                        style: 'cancel',
                    },
                    {
                        text: noShowDeactivation ? 'OK' : 'YES', onPress: () => {
                            this.updateApiCall(updateBody);
                        }
                    },
                ],
                {cancelable: false},
            )
        }, 400);
    }

    @action
    async saveNewEmployeeLocation(body) {
        this.isLoading = true;
        body['DeviceID'] = this.userId;
        // save the location after in the response add this location to existing Location array and update the state
        await axios.post(this.customerUrl + URL.SAVE_LOCATION, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(() => {
                this.isLoading = false;
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                let newData = this.Locations;
                if (data.Status === "200") {
                    let obj = {
                        ID: data.Description,
                        Name: body.NickName,
                        Address: body.Location,
                        Lat: body.Latitude,
                        Lng: body.Longitude
                    };
                    newData.push(obj);
                    this.Locations = newData;
                } else {
                    Alert1.show("Unable to save location. Try again later.");
                }
            })
        }).catch(error => {
            if (error) {
                this.isLoading = false;
            }
        });
    }

    checkNodalName = (selected, POIAllowed) => {
        let newName = "";
        if (this.Locations.length>0 && parseInt(POIAllowed) === 1)
            this.Locations.map(location => {
                if (location.ID === "H" && selected === location.Name) {
                    newName = location.Name + "-Nodal";
                }
            });
        return newName ? newName : selected;
    };

    @action
    async getSelectedDateRoster_(day) {
        this.isLoading = true;
        this.RBSheetOpen=false;
        this.RosterDate = day;
        let body = {
            RosterDate: day,
            DeviceID: this.userId
        };
        await axios.post(this.customerUrl + URL.GET_SELECTED_ROSTER, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(() => {
                this.isLoading = false;
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                console.warn('GET_SELECTED_ROSTER - ', data);
                let defaultOfficeSelectedObject = this.findObject(this.DefaultOffice, this.Offices);
                let defaultOfficeSelected = defaultOfficeSelectedObject ? defaultOfficeSelectedObject.Name : "";
                if (data.Status === "1005") {
                    let login = this.getLoginAllowedStatus;
                    let logout = this.getLogOutAllowedStatus;
                    this.selectedRoster = {
                        RosterID: "0",
                        loginSelected: !!login ? "No schedule" : "Select",
                        logoutSelected: !!logout ? "No schedule" : "Select",
                        pickupLocationSelected: login ? "----" : "Select",
                        logoutLocationObject: defaultOfficeSelectedObject ? defaultOfficeSelectedObject : {},
                        loginLocationObject: defaultOfficeSelectedObject ? defaultOfficeSelectedObject : {},
                        dropLocationSelected: logout ? "----" : "Select",
                        officeLoginSelected: defaultOfficeSelected,
                        officeLogoutSelected: defaultOfficeSelected,
                        anyChangeInDataLogin: false,
                        anyChangeInDataLogout: false,
                        loginDisabled: login,
                        logOutDisabled: logout,
                    };
                    this.selectedDateAPIResponse = this.selectedRoster;
                    this.getCalculatedRoster();
                } else if (data.Status === "200") {
                    this.selectedDateAPIResponse = data;
                    let loginLocation = this.Locations.find(x => x.ID.toString().trim() === this.selectedDateAPIResponse.LoginLocation.toString());
                    let logOutLocation = this.Locations.find(x => x.ID.toString().trim() === this.selectedDateAPIResponse.LogoutLocation.toString());
                    let officeLoginSelected = this.selectedDateAPIResponse.LoginOffice
                        ? this.findName(
                            this.selectedDateAPIResponse.LoginOffice,
                            this.Offices
                        )
                        : defaultOfficeSelected;

                    let officeLogoutSelected = this.selectedDateAPIResponse.LogoutOffice
                        ? this.findName(
                            this.selectedDateAPIResponse.LogoutOffice,
                            this.Offices
                        )
                        : defaultOfficeSelected;
                    this.selectedRoster = {
                        loginSelected:
                            this.selectedDateAPIResponse.LoginShift === "NS"
                                ? "Cancelled"
                                : data.LoginShift
                                ? data.LoginShift
                                : "Select",
                        logoutSelected:
                            this.selectedDateAPIResponse.LogoutShift === "NS"
                                ? "Cancelled"
                                : data.LogoutShift
                                ? data.LogoutShift
                                : "Select",
                        pickupLocationSelected: loginLocation ? loginLocation.Name : "Select",
                        dropLocationSelected: logOutLocation ? logOutLocation.Name : "Select",
                        logoutLocationObject: logOutLocation ? logOutLocation : {},
                        loginLocationObject: loginLocation ? loginLocation : {},
                        officeLoginSelected,
                        officeLogoutSelected,
                        RosterID: this.selectedDateAPIResponse.RosterID,
                        anyChangeInDataLogin: false,
                        anyChangeInDataLogout: false,
                        loginDisabled: this.getLoginAllowedStatus,
                        logOutDisabled: this.getLogOutAllowedStatus,
                    };
                    this.getCalculatedRoster();
                    let rosterDate = moment(this.RosterDate).format("YYYY-MM-DD");
                    let today = moment().format("YYYY-MM-DD");
                    if (moment(rosterDate).isSameOrAfter(today)) {
                        let onlyLogin = this.isNotEmptyOrCancelledLoginShift;
                        let onlyLogOut = this.isNotEmptyOrCancelledLogOutShift;
                        if (onlyLogin || onlyLogOut) {
                            this.onlyLogin = onlyLogin;
                            this.onlyLogOut = onlyLogOut;
                            this.RBSheetOpen = true;
                        }
                    }
                } else if (data.Description) {
                    Alert1.show(null, data.Description);
                }
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
            }
        });
    }

    @action
    async getSelectedDateRoster(day) {
        this.isLoading = true;
        this.RBSheetOpen=false;
        this.onlyLogin = false;
        this.onlyLogOut = false;

        this.RosterDate = day;
        let body = {
            RosterDate: day,
            DeviceID: this.userId
        };
        await axios.post(this.customerUrl + URL.GET_SELECTED_ROSTER, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(() => {
                this.isLoading = false;
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                console.warn('GET_SELECTED_ROSTER - ', data);
                let defaultOfficeSelectedObject = this.findObject(this.DefaultOffice, this.Offices);
                let defaultOfficeSelected = defaultOfficeSelectedObject ? defaultOfficeSelectedObject.Name : "";
                if (data.Status === "1005") {
                    let login = this.getLoginAllowedStatus;
                    let logout = this.getLogOutAllowedStatus;
                    this.selectedRoster = {
                        RosterID: "0",
                        loginSelected: !!login ? "No schedule" : "Select",
                        logoutSelected: !!logout ? "No schedule" : "Select",
                        pickupLocationSelected: login ? "----" : "Select",
                        logoutLocationObject: defaultOfficeSelectedObject ? defaultOfficeSelectedObject : {},
                        loginLocationObject: defaultOfficeSelectedObject ? defaultOfficeSelectedObject : {},
                        dropLocationSelected: logout ? "----" : "Select",
                        officeLoginSelected: defaultOfficeSelected,
                        officeLogoutSelected: defaultOfficeSelected,
                        anyChangeInDataLogin: false,
                        anyChangeInDataLogout: false,
                        loginDisabled: login,
                        logOutDisabled: logout,
                    };
                    this.selectedDateAPIResponse = this.selectedRoster;
                    this.getCalculatedRoster();
                } else if (data.Status === "200") {
                    this.selectedDateRosterData = data.Data;
                    this.selectedDateAPIResponse = data.Data.length != 0 ? data.Data[0] : {};

                    console.warn('selectedDateAPIResponse - ', this.selectedDateAPIResponse);

                    let loginLocation = this.Locations.find(x => x.ID.toString().trim() === this.selectedDateAPIResponse.LoginLocation.toString());
                    let logOutLocation = this.Locations.find(x => x.ID.toString().trim() === this.selectedDateAPIResponse.LogoutLocation.toString());
                    let officeLoginSelected = this.selectedDateAPIResponse.LoginOffice
                        ? this.findName(
                            this.selectedDateAPIResponse.LoginOffice,
                            this.Offices
                        )
                        : defaultOfficeSelected;

                    let officeLogoutSelected = this.selectedDateAPIResponse.LogoutOffice
                        ? this.findName(
                            this.selectedDateAPIResponse.LogoutOffice,
                            this.Offices
                        )
                        : defaultOfficeSelected;
                    this.selectedRoster = {
                        loginSelected:
                            this.selectedDateAPIResponse.LoginShift === "NS"
                                ? "Cancelled"
                                : this.selectedDateAPIResponse.LoginShift
                                ? this.selectedDateAPIResponse.LoginShift
                                : "Select",
                        logoutSelected:
                            this.selectedDateAPIResponse.LogoutShift === "NS"
                                ? "Cancelled"
                                : this.selectedDateAPIResponse.LogoutShift
                                ? this.selectedDateAPIResponse.LogoutShift
                                : "Select",
                        pickupLocationSelected: loginLocation ? loginLocation.Name : "Select",
                        dropLocationSelected: logOutLocation ? logOutLocation.Name : "Select",
                        logoutLocationObject: logOutLocation ? logOutLocation : {},
                        loginLocationObject: loginLocation ? loginLocation : {},
                        officeLoginSelected,
                        officeLogoutSelected,
                        RosterID: this.selectedDateAPIResponse.RosterID,
                        anyChangeInDataLogin: false,
                        anyChangeInDataLogout: false,
                        loginDisabled: this.getLoginAllowedStatus,
                        logOutDisabled: this.getLogOutAllowedStatus,
                    };
                    this.getCalculatedRoster();
                    let rosterDate = moment(this.RosterDate).format("YYYY-MM-DD");
                    let today = moment().format("YYYY-MM-DD");
                    if (moment(rosterDate).isSameOrAfter(today)) {
                        this.selectedDateRosterData.forEach(roster => {
                            let loginSelected = 
                                roster.LoginShift === "NS"
                                    ? "Cancelled"
                                    : roster.LoginShift
                                    ? roster.LoginShift
                                    : "Select";
                            let logoutSelected =
                                roster.LogoutShift === "NS"
                                    ? "Cancelled"
                                    : roster.LogoutShift
                                    ? roster.LogoutShift
                                    : "Select";
                            console.warn('roster :: ', roster);
                            let onlyLogin = loginSelected !== "Cancelled" && loginSelected !== "Select" && this.RosteringAllowedLogin === 1;
                            let onlyLogOut = logoutSelected !== "Cancelled" && logoutSelected !== "Select" && this.RosteringAllowedLogin === 1;

                            if (!this.onlyLogin && onlyLogin) {
                                this.onlyLogin = onlyLogin
                            }
                            if (!this.onlyLogOut && onlyLogOut) {
                                this.onlyLogOut = onlyLogOut
                            }
                        })
                        console.warn('Login flag - ', this.onlyLogin);
                        console.warn('LogOut flag - ', this.onlyLogOut);
                        if (this.onlyLogin || this.onlyLogOut) {
                            this.RBSheetOpen = true;
                        }
                    }
                } else if (data.Description) {
                    Alert1.show(null, data.Description);
                }
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
            }
        });
    }

    @action
    setSelectedDateRoster(_roster) {
        this.isLoading = true;
        this.RBSheetOpen=false;
        
        this.selectedDateAPIResponse = _roster;
        console.warn('selectedDateAPIResponse - ', this.selectedDateAPIResponse);
        let defaultOfficeSelectedObject = this.findObject(this.DefaultOffice, this.Offices);
        let defaultOfficeSelected = defaultOfficeSelectedObject ? defaultOfficeSelectedObject.Name : "";

        let loginLocation = this.Locations.find(x => x.ID.toString().trim() === this.selectedDateAPIResponse.LoginLocation.toString());
        let logOutLocation = this.Locations.find(x => x.ID.toString().trim() === this.selectedDateAPIResponse.LogoutLocation.toString());
        let officeLoginSelected = this.selectedDateAPIResponse.LoginOffice
            ? this.findName(
                this.selectedDateAPIResponse.LoginOffice,
                this.Offices
            )
            : defaultOfficeSelected;
        let officeLogoutSelected = this.selectedDateAPIResponse.LogoutOffice
            ? this.findName(
                this.selectedDateAPIResponse.LogoutOffice,
                this.Offices
            )
            : defaultOfficeSelected;
        this.selectedRoster = {
            loginSelected:
                this.selectedDateAPIResponse.LoginShift === "NS"
                    ? "Cancelled"
                    : this.selectedDateAPIResponse.LoginShift
                    ? this.selectedDateAPIResponse.LoginShift
                    : "Select",
            logoutSelected:
                this.selectedDateAPIResponse.LogoutShift === "NS"
                    ? "Cancelled"
                    : this.selectedDateAPIResponse.LogoutShift
                    ? this.selectedDateAPIResponse.LogoutShift
                    : "Select",
            pickupLocationSelected: loginLocation ? loginLocation.Name : "Select",
            dropLocationSelected: logOutLocation ? logOutLocation.Name : "Select",
            logoutLocationObject: logOutLocation ? logOutLocation : {},
            loginLocationObject: loginLocation ? loginLocation : {},
            officeLoginSelected,
            officeLogoutSelected,
            RosterID: this.selectedDateAPIResponse.RosterID,
            anyChangeInDataLogin: false,
            anyChangeInDataLogout: false,
            loginDisabled: this.getLoginAllowedStatus,
            logOutDisabled: this.getLogOutAllowedStatus,
        };
        this.getCalculatedRoster();

        this.isLoading = false;
    }

    @action
    setNewRosterDay() {
        let defaultOfficeSelectedObject = this.findObject(this.DefaultOffice, this.Offices);
        let defaultOfficeSelected = defaultOfficeSelectedObject ? defaultOfficeSelectedObject.Name : "";
        let login = this.getLoginAllowedStatus;
        let logout = this.getLogOutAllowedStatus;
        this.selectedRoster = {
            RosterID: "0",
            loginSelected: !!login ? "No schedule" : "Select",
            logoutSelected: !!logout ? "No schedule" : "Select",
            pickupLocationSelected: login ? "----" : "Select",
            logoutLocationObject: defaultOfficeSelectedObject ? defaultOfficeSelectedObject : {},
            loginLocationObject: defaultOfficeSelectedObject ? defaultOfficeSelectedObject : {},
            dropLocationSelected: logout ? "----" : "Select",
            officeLoginSelected: defaultOfficeSelected,
            officeLogoutSelected: defaultOfficeSelected,
            anyChangeInDataLogin: false,
            anyChangeInDataLogout: false,
            loginDisabled: login,
            logOutDisabled: logout,
        };
        this.selectedDateAPIResponse = this.selectedRoster;
        this.getCalculatedRoster();
    }

    @action enableMultiRosterModal(_action) {
        console.warn('action -- ', _action);
        this.visibleMultiRosterModal = true;
        this.rosterAction = _action;
    }

    @action disableMultiRosterModal() {
        this.visibleMultiRosterModal = false;
        // this.rosterAction = '';
    }

    updateRBSheetOpen(){
        this.onlyLogin=false;
        this.onlyLogOut=false;
        this.RBSheetOpen=false;
    }

    getHeader() {
        return {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.accessToken
        };
    }

    @action setInitRosterValues(context) {
        this.isLoading = true;
        AsyncStorage.multiGet(
            [
                asyncString.ACCESS_TOKEN,
                asyncString.USER_ID,
                asyncString.IdleTimeOutInMins,
                asyncString.CAPI,
                asyncString.isRosterOptOutEnabled,
                asyncString.DISCLAIMER_TYPE,
            ],
            (err, savedData) => {
                this.accessToken = CryptoXor.decrypt(savedData[0][1], asyncString.ACCESS_TOKEN); // JSON.parse(JSON.stringify(savedData[0][1]));
                this.userId = JSON.parse(JSON.stringify(savedData[1][1]));
                this.idleTimeOutInMins = savedData[2][1];
                this.customerUrl = savedData[3][1];
                this.isRosterOptOutEnabled = savedData[4][1];
                this.disclaimerType = savedData[5][1];
                if (!this.accessToken) return;
                if (!this.userId) return;
                this.getRosterDetails(context);
                if (this.isRosterOptOutEnabled === "true" && this.disclaimerType) {
                    this.getOptOutData()
                }
            }
        );
    }

    @action getOptOutData() {
        if (this.isRosterOptOutEnabled === "true" && this.disclaimerType) {
            axios.get(URL.Opt_Out_GET, {
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

    findName(id, array) {
        if (!array || !id) return undefined;
        let ids = id.toString().trim();
        const result = array.find(x => x.ID.toString().trim() === ids);
        return result.Name;
    }

    findID(id, array) {
        if (!array || !id) return undefined;
        let ids = id.toString().trim();
        const result = array.find(x => x.Name.toString().trim() === ids);
        return result.ID;
    }

    findObject(id, array) {
        if (!array || !id) return undefined;
        let ids = id.toString().trim();
        return array.find(x => x.ID.toString().trim() === ids);
    }
}

export default new rosterRuleStore;
