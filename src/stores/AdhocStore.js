import { action, makeAutoObservable, observable, runInAction } from 'mobx';
import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { URL } from "../network/apiConstants";
import { appVersion, asyncString, loginString } from "../utils/ConstantString";
import * as Alert from "../utils/Alert";
import { handleResponse } from "../network/apiResponse/HandleResponse";
import * as Toast from "../utils/Toast";
import moment from "moment";
import { findAutoFill } from "../utils/customFunction";
import React from "react";
import { CryptoXor } from 'crypto-xor';

const adhoc = 'Adhoc';
const Select = 'Select';
const _ = require("lodash");
const queryString = require("query-string");
const requestFlexiCab = "Request flexi cab";
const tripTypeFlexi = {
    Types: [
        {
            ID: "P",
            Name: "Login"
        },
        {
            ID: "D",
            Name: "Logout"
        }
    ]
};

class AdhocStore {

    /*-------App tokens and config -------*/
    @observable isLoading = false;
    @observable accessToken = '';
    @observable customUrl = '';
    @observable UserId = '';
    @observable IdleTimeOutInMins = 0;
    // @observable navigation;
    /*-------End of tokens and config -------*/


    /*------- app API values -------*/
    @observable Sites = [];
    @observable Businesses = [];
    @observable SubBusineses = [];
    @observable Vehicles = [];
    @observable RentalModels = [];
    @observable Visitors = [];
    @observable Travellers = [];
    @observable Countries = [];
    @observable Offices = [];
    @observable Trips = [];
    @observable Programs = [];
    @observable ProgramsDetails = {};
    @observable Purposes = [];
    @observable LineManagerEmails = [];
    @observable TDValidation = {};
    @observable SourceLocations = [];
    @observable DestinationLocations = [];
    @observable AirportLocations = [];
    @observable Types = [];
    @observable FlexiDetails = { OfficeLocations: [], StaffLocations: [] };
    @observable apiSuccess = {};
    @observable Cabs = [];
    @observable TripPurpose = [];
    @observable Vendors = [];
    /*------- End of API values -------*/

    @observable siteID = 0;
    @observable businessID = 0;
    @observable adhocType = '';
    @observable nationality = '';
    @observable isSiteVisible = true;
    @observable agreedTC = false;
    @observable iamSponsor = true;
    @observable programTermsCons = '';

    /*------- app selected values -------*/
    @observable siteSelected = Select;
    @observable buSelected = Select;
    @observable subbuSelected = Select;
    @observable vehicleSelected = Select;
    @observable vendorSelected = Select;
    @observable rentalModelSelected = Select;
    @observable visitorSelected = Select;
    @observable travellerSelected = Select;
    @observable countrySelected = Select;
    @observable programSelected = Select;
    @observable tripSelected = Select;
    @observable tripTypeSelected = Select;
    @observable fromSelected = Select;
    @observable toSelected = Select;
    @observable dateSelected = Select;
    @observable dateToSelected = Select;
    @observable timeSelected = Select;
    @observable timeToSelected = Select;
    @observable lineManager = Select;
    @observable selectedCostCenter = Select;
    @observable selectedCostCenterEmail = Select;
    @observable selectedCostCenterID = Select;
    @observable StaffLocations = Select;
    @observable tripPurposeSelected = {};
    @observable tripType = '';

    // picker visible
    @observable isDatePickerVisible = false;
    @observable isTimePickerVisible = false;
    @observable minDateAllowed = new Date();

    // dynamic from location
    @observable fromSelectedLocation;
    @observable fromSelectLat;
    @observable fromSelectLng;
    @observable fromAddressID;

    // dynamic to location
    @observable toSelectedLocation;
    @observable toSelectLat;
    @observable toSelectLng;
    @observable toAddressID;

    @observable requesterName = '';
    @observable requesterNumber = '';
    @observable requesterEmail = '';
    @observable requesterContactNo = '';
    @observable requesterRequestSiteID = '';
    @observable requesterOfficeID = '';

    @observable sponsorName = '';
    @observable sponsorNumber = '';
    @observable sponsorContactNo = '';
    @observable sponsorAltContactNo = '';
    @observable sponsorEmail = '';
    @observable sponsorSite = Select;
    @observable sponsorSiteId = '';
    @observable sponsorOffice = Select;
    @observable sponsorOfficeId = '';
    @observable sponsorBU = Select;
    @observable sponsorBUId = '';
    @observable sponsorCostCenter = Select;
    @observable sponsorCostCenterId = '';

    @observable dateType;
    @observable travellerName = '';
    @observable travellerNumber = '';
    @observable travellerGender = 'M';
    @observable travellerEmail = '';
    @observable travellerContactNo = '';
    @observable travellerAltContactNo = '';
    @observable travellerBU = Select;
    @observable travellerSubbu = Select;
    @observable travellerCostCenter = Select;
    @observable travellerCountry = Select;
    @observable travellerNationality = '';
    @observable travellerPickup = Select;
    @observable travellerDrop = Select;
    @observable tdWayPoints = [];
    @observable Employees = [];
    @observable Profiles = [];
    @observable travellerIndex;
    @observable editMode = false;
    @observable profileSelected;
    @observable VehiclesPolicy;
    @observable isRentalModelVisible = true;

    @observable weeklyOffStateValue = [];
    @observable travelDistanceKm = 0;
    @observable travelTimeHM = 0;
    @observable approvalType = 'PRE';
    @observable preApprovedDocType = '';
    @observable preApprovedDocData = '';
    @observable itineraryDocType = '';
    @observable itineraryDocData = '';
    @observable securityEscot = false;
    @observable noteToAdmin = '';
    @observable noteToDriver = '';

    /*------- End of app selected values -------*/

    constructor() {
        makeAutoObservable(this)
    }

    @action setInitAdhoc(context, flexi, type) {
        // this.navigation = navigation;
        this.adhocType = type;
        AsyncStorage.multiGet(
            [
                asyncString.ACCESS_TOKEN,
                asyncString.USER_ID,
                asyncString.IdleTimeOutInMins,
                asyncString.CAPI
            ],
            (err, savedData) => {
                this.isLoading = true;
                this.accessToken = CryptoXor.decrypt(savedData[0][1], asyncString.ACCESS_TOKEN); // JSON.parse(JSON.stringify(savedData[0][1]));
                this.UserId = JSON.parse(JSON.stringify(savedData[1][1]));
                this.customUrl = savedData[3][1];
                this.IdleTimeOutInMins = parseInt(savedData[2][1]);
                if (!this.accessToken) return;
                if (!this.UserId) return;
                this.isDatePickerVisible = false;
                this.isTimePickerVisible = false;
                this.dateSelected = Select;
                this.dateToSelected = Select;
                this.timeSelected = Select;
                this.nationality = 'Indian'
                if (flexi) {
                    let program = {
                        "ProgramID": "O",
                        "ProgramName": "Others/Flexi"
                    };
                    this.Programs = [program];
                    this.programSelected = program.ProgramName;
                    this.fromSelected = Select;
                    this.toSelected = Select;
                    this.setProgramType(program.ProgramName);
                    setTimeout(() => {
                        this.setTripType(type);
                    }, 300);
                } else {
                    console.warn('Not flexi ', type);
                    if (this.adhocType == 'TravelDesk') {
                        console.warn('In travel desk');
                        this.getTravelDeskSite();
                        this.getBusinesses();
                    } else {
                        this.getNonShiftProgram(context);
                    }
                }
            }
        );
    }

    resetStore() {
        this.ProgramsDetails = {};
        this.Purposes = [];
        this.LineManagerEmails = [];
        this.TDValidation = {};
        this.SourceLocations = [];
        this.DestinationLocations = [];
        this.AirportLocations = [];
        this.Types = [];
        this.TripPurpose = [];
        this.FlexiDetails = { OfficeLocations: [], StaffLocations: [] };
        this.programSelected = Select;
        this.tripTypeSelected = Select;
        this.fromSelected = Select;
        this.toSelected = Select;
        this.dateSelected = Select;
        this.dateToSelected = Select;
        this.timeSelected = Select;
        this.timeToSelected = Select;
        this.lineManager = Select;
        this.selectedCostCenter = Select;
        this.selectedCostCenterEmail = Select;
        this.selectedCostCenterID = Select;
        this.StaffLocations = Select;
        this.tripType = '';
        this.tripPurposeSelected = {};
        this.isDatePickerVisible = false;
        this.isTimePickerVisible = false;
        this.minDateAllowed = new Date();
        this.fromSelectedLocation = undefined;
        this.fromSelectLat = undefined;
        this.fromSelectLng = undefined;
        this.fromAddressID = undefined;
        this.toSelectedLocation = undefined;
        this.toSelectLat = undefined;
        this.toSelectLng = undefined;
        this.toAddressID = undefined;
        this.apiSuccess = {};
        if (this.Programs.length === 1 && !this.Programs[0].ProgramName.includes("Others/Flexi")) {
            this.programSelected = this.Programs[0].ProgramName;
            this.getAdHocProgramDetails(this.programSelected);
        }
        this.Sites = [];
        this.Businesses = [];
        this.Countries = [];
        this.Visitors = [];
        this.Travellers = [];
        this.Vendors = [];
        this.Offices = [];
        this.siteSelected = Select;
        this.buSelected = Select;
        this.subbuSelected = Select;
        this.countrySelected = Select;
        this.vehicleSelected = Select;
        this.visitorSelected = Select;
        this.travellerSelected = "Employee";
        this.tripSelected = Select;
        this.vendorSelected = Select;
        this.nationality = 'Indian';
        this.Employees = [];
        this.agreedTC = false;
        this.programTermsCons = '';
        this.approvalType = 'PRE';
        this.preApprovedDocType = '';
        this.preApprovedDocData = '';
        this.itineraryDocType = '';
        this.itineraryDocData = '';
        this.securityEscot = false;
        this.noteToAdmin = '';
        this.noteToDriver = '';
        this.iamSponsor = true;
        this.requesterName = '';
        this.requesterNumber = '';
        this.requesterEmail = '';
        this.requesterContactNo = '';
        this.requesterRequestSiteID = '';
        this.requesterOfficeID = '';
        this.sponsorName = '';
        this.sponsorNumber = '';
        this.sponsorContactNo = '';
        this.sponsorAltContactNo = '';
        this.sponsorEmail = '';
        this.sponsorSite = Select;
        this.sponsorSiteId = '';
        this.sponsorOffice = Select;
        this.sponsorOfficeId = '';
        this.sponsorBU = Select;
        this.sponsorBUId = '';
        this.sponsorCostCenter = Select;
        this.sponsorCostCenterId = '';
        this.travellerName = '';
        this.travellerNumber = '';
        this.travellerGender = 'M';
        this.travellerEmail = '';
        this.travellerContactNo = '';
        this.travellerAltContactNo = '';
        this.travellerBU = Select;
        this.travellerSubbu = Select;
        this.travellerCostCenter = Select;
        this.travellerCountry = Select;
        this.travellerNationality = 'Indian';
        this.travellerPickup = Select;
        this.travellerDrop = Select;
        this.tdWayPoints = [];
        this.profileSelected = {};
        this.VehiclesPolicy = '';
        this.weeklyOffStateValue = [];
        this.travelDistanceKm = 0;
        this.travelTimeHM = 0;
    }

    getHeader() {
        return {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.accessToken
        };
    }

    @action agreeTC() {
        this.agreedTC = !this.agreedTC;
    }

    @action setMeAsSponsor() {
        this.iamSponsor = !this.iamSponsor;
        this.setDefaultSponsor();
    }
    
    @action
    setDefaultSite(_state) {
        this.siteID = _state.siteID;
        this.businessID = _state.businessID;

        this.setSite(Select);
        this.setBusiness(Select);
    }

    @action
    setSite(site) {
        if (site == Select) {
            console.warn('siteID -- ', this.siteID);
            if (!this.isSiteVisible) {
                this.Sites = [{
                    SiteID: this.siteID,
                    SiteName: this.siteID
                }]
            }
            var _site = this.Sites.find((site) => site.SiteID == this.siteID);
            console.warn('default siteID -- ', _site);
            if (_site) {
                this.siteSelected = _site.SiteName;
            } else {
                this.siteSelected = site;
            }
        } else {
            this.siteSelected = site;
        }
        this.getTravelDeskProgram();
        this.getVisitors();
        this.getTravellers();
        this.getCountries();
        this.getCostCenters();
        this.getOffices();
    }

    @action
    setBusiness(business) {
        if (business == Select) {
            console.warn('businessID -- ', this.businessID);
            var _bu = this.Businesses.find((bu) => bu.Id == this.businessID);
            console.warn('default businessID -- ', _bu);
            if (_bu) {
                this.buSelected = _bu.Name;
            } else {
                this.buSelected = business;
            }
        } else {
            this.buSelected = business;
        }
        this.getSubBusinesses();
    }

    @action
    setSubBusiness(subbusiness) {
        this.subbuSelected = subbusiness;
    }

    @action
    setCountry(country) {
        if (country == Select) {
            this.countrySelected = 'India';
        } else {
            this.countrySelected = country;
        }
    }

    @action
    setVehicle(vehicle) {
        this.vehicleSelected = vehicle;
    }

    @action
    setVendor(vendor) {
        this.vendorSelected = vendor;
    }

    @action
    setRentalModel(rentalModel) {
        this.rentalModelSelected = rentalModel;
    }

    @action
    setVisitor(visitor) {
        this.visitorSelected = visitor;
        if (visitor == 'International') {
            this.nationality = '';
            this.countrySelected = Select;
        } else {
            this.nationality = 'Indian';
            this.countrySelected = 'India';
        }
    }

    @action
    setTraveller(traveller) {
        this.travellerSelected = traveller;
    }

    @action
    setTrip(trip) {
        console.warn('Trip type selected ', trip);
        this.tripSelected = trip;
        this.tripTypeSelected = trip;
        this.fromSelected = Select;
        this.toSelected = Select;
        this.dateSelected = Select;
        this.dateToSelected = Select;
        this.timeSelected = Select;
        if (this.SourceLocations.length === 1) {
            this.fromSelected = this.SourceLocations[0].LocationName;
        }
        if (this.DestinationLocations.length === 1) {
            this.toSelected = this.DestinationLocations[0].LocationName;
        }
    }

    @action onProgramSelected(_program) {
        console.warn('onProgramSelected - ', _program);
        // this.programTermsCons = _program.TermsAndConditions
    }

    @action
    setProgramType(program) {
        this.programSelected = program;
        this.tripTypeSelected = Select;
        this.fromSelected = Select;
        this.toSelected = Select;
        this.dateSelected = Select;
        this.dateToSelected = Select;
        this.timeSelected = Select;
        this.lineManager = Select;
        this.selectedCostCenter = Select;
        this.selectedCostCenterEmail = Select;
        this.selectedCostCenterID = Select;
        this.tripPurposeSelected = {};
        if (program) {
            console.warn('program type = ', program);
            if (program.includes("Others")) {
                this.ProgramsDetails.Types = tripTypeFlexi.Types;
                this.getFlexiDetails();
            } else {
                console.warn('Adhoc Type ', this.adhocType);
                if (this.adhocType == 'TravelDesk') {
                    this.getTDProgramDetails(this.programSelected);
                    // this.getTripTypes();
                    this.getVehicles();
                    this.getVehiclesPolicy();
                    this.getRentalModels();
                    this.getLocations();
                } else if (program !== Select) {
                    this.getAdHocProgramDetails(program).then(() => {
                        setTimeout(() => {
                            this.isLoading = false;
                        }, 400);
                    });
                }
            }
        }
    }

    @action
    setTripType(tripType) {
        this.tripTypeSelected = tripType;
        this.fromSelected = Select;
        this.toSelected = Select;
        this.dateSelected = Select;
        this.dateToSelected = Select;
        this.timeSelected = Select;
        if (tripType !== "Others" && !this.programSelected.includes("Flexi")) {
            if (this.SourceLocations.length === 1) {
                this.fromSelected = this.SourceLocations[0].LocationName;
            }
            if (this.DestinationLocations.length === 1) {
                this.toSelected = this.DestinationLocations[0].LocationName;
            }
        }
    }

    @action
    setFromSelected(fromLocation) {
        this.fromSelected = fromLocation;
    }

    @action
    setToSelected(toLocation) {
        this.toSelected = toLocation;
    }

    @action
    setTravellerWaypoints() {
        this.tdWayPoints = this.tdWayPoints.filter(wp => wp.Remarks == 'WP');
        if (!this.tdWayPoints) {
            this.tdWayPoints = [];
        }
        
        let fromAutoFill = this.getFromAddress();
        let toAutoFill = this.getToAddress();

        if (!fromAutoFill || !toAutoFill) {
            alert("Unable to find location...");
            return;
        }
        if (fromAutoFill.Id === toAutoFill.Id) {
            Alert.show("Travel Desk",
                "Source and destination locations cannot be same. Please choose different location"
            );
            return;
        }
        
        this.tdWayPoints.push(fromAutoFill)
        this.tdWayPoints.push(toAutoFill)
        console.warn('waypoints ', this.tdWayPoints);
    }

    async getFromAddress() {
        let pushFromDataBody = [];
        console.warn('fromAddressID ', this.fromAddressID);
        if (this.fromAddressID) {
            pushFromDataBody = [
                {
                    Id: this.fromAddressID,
                    LocationName: this.fromSelectedLocation,
                    LocationType: "Others",
                    GeoLocation: this.fromSelectLat + "," + this.fromSelectLng,
                    Lat: this.fromSelectLat,
                    Lng: this.fromSelectLng
                }
            ];
        }

        if (this.tripSelected == 'From Airport') {
            this.SourceLocations = [
                ...this.AirportLocations,
                ...pushFromDataBody
            ]
        } else {
            this.SourceLocations = [
                ...this.SourceLocations,
                ...pushFromDataBody
            ]
        }
        console.warn('SourceLocations ', this.SourceLocations);

        let fromAutoFill = this.findLocation(this.fromSelected, this.SourceLocations);
        console.warn('fromAutoFill - > ', fromAutoFill);
        if (fromAutoFill.LocationName == 'Home' || fromAutoFill.LocationName == 'Nodal Point') {
            let res = await this.getEmployeeLocation(fromAutoFill.LocationName, 'P');
            if (res.data.Status.Code === 200 && res.data.Data) {
                return {
                    ID: fromAutoFill.Id,
                    WayPointType: fromAutoFill.LocationName,
                    WayPointName: res.data.Data.Name,
                    Latitude: res.data.Data.Latitude,
                    Longitude: res.data.Data.Longitude,
                    Remarks: fromAutoFill.Id
                };
            }
        } else if (fromAutoFill.LocationType == "Others") {
            return {
                ID: fromAutoFill.Id,
                WayPointType: fromAutoFill.LocationType,
                WayPointName: fromAutoFill.LocationName,
                Latitude: fromAutoFill.Lat,
                Longitude: fromAutoFill.Lng,
                Remarks: fromAutoFill.LocationType
            };
        } else {
            return {
                ID: fromAutoFill.Id,
                WayPointType: this.tripSelected == 'From Airport' ? 'Airport' : 'Office',
                WayPointName: fromAutoFill.LocationName,
                Latitude: fromAutoFill.Lat,
                Longitude: fromAutoFill.Lng,
                Remarks: fromAutoFill.Id
            };
        }
    }

    async getToAddress() {
        let pushToDataBody = [];
        console.warn('to address id ', this.toAddressID);
        if (this.toAddressID) {
            pushToDataBody = [
                {
                    Id: this.toAddressID,
                    LocationName: this.toSelectedLocation,
                    LocationType: "Others",
                    GeoLocation: this.toSelectLat + "," + this.toSelectLng,
                    Lat: this.toSelectLat,
                    Lng: this.toSelectLng
                }
            ];
        }

        if (this.tripSelected == 'To Airport') {
            this.DestinationLocations = [
                ...this.AirportLocations,
                ...pushToDataBody
            ]
        } else {
            this.DestinationLocations = [
                ...this.DestinationLocations,
                ...pushToDataBody
            ]
        }
        console.warn('DestinationLocations ', this.DestinationLocations);

        let toAutoFill = this.findLocation(this.toSelected, this.DestinationLocations);
        console.warn('toAutoFill - > ', toAutoFill);
        if (toAutoFill.LocationName == 'Home' || toAutoFill.LocationName == 'Nodal Point') {
            let res = await this.getEmployeeLocation(toAutoFill.LocationName, 'D');
            if (res.data.Status.Code === 200 && res.data.Data) {
                return {
                    ID: toAutoFill.Id,
                    WayPointType: toAutoFill.LocationName,
                    WayPointName: res.data.Data.Name,
                    Latitude: res.data.Data.Latitude,
                    Longitude: res.data.Data.Longitude,
                    Remarks: toAutoFill.Id
                };
            }
        } else if (toAutoFill.LocationType == "Others") {
            return {
                ID: toAutoFill.Id,
                WayPointType: toAutoFill.LocationType,
                WayPointName: toAutoFill.LocationName,
                Latitude: toAutoFill.Lat,
                Longitude: toAutoFill.Lng,
                Remarks: toAutoFill.LocationType
            };
        } else {
            return {
                ID: toAutoFill.Id,
                WayPointType: this.tripSelected == 'To Airport' ? 'Airport' : 'Office',
                WayPointName: toAutoFill.LocationName,
                Latitude: toAutoFill.Lat,
                Longitude: toAutoFill.Lng,
                Remarks: toAutoFill.Id
            };
        }
    }

    @action
    showDatePicker(_type) {
        this.dateType = _type;
        this.isDatePickerVisible = true;
        this.minDateAllowed = new Date(moment().format());
    };

    @action
    handleDatePicked(date) {
        console.warn('handleDatePicked - ', this.dateType, date);
        if (this.dateType == 'FROM') {
            this.dateSelected = moment(date).format("D MMM YYYY");
            if (this.dateToSelected === Select) {
                this.dateToSelected = moment(date).format("D MMM YYYY");
            }
            console.warn('dateSelected - ', this.dateSelected, this.dateToSelected);
        } else if (this.dateType == 'TO') {
            this.dateToSelected = moment(date).format("D MMM YYYY");
        } else {
            this.dateSelected = moment(date).format("D MMM YYYY");
            console.warn('dateSelected - ', this.dateSelected);
        }
        this.hideDateTimePicker();
    };

    @action
    handleTimePicked(selectedTime) {
        if (this.tripType == 'D') {
            this.timeToSelected = selectedTime;
        } else {
            this.timeSelected = selectedTime;
        }
        this.hideDateTimePicker();
    };

    @action
    isCostCenterVisible() {
        return (this.programSelected !== "Select" && !this.programSelected.includes("Others") &&
            this.ProgramsDetails.hasOwnProperty('IsCostCenterSelection') && this.ProgramsDetails.IsCostCenterSelection &&
            this.ProgramsDetails.CostCenters !== null && this.ProgramsDetails.CostCenters.length > 0);
    }

    @action
    isTDCostCenterVisible() {
        console.warn('Selected isTDCostCenterVisible ', this.programSelected);
        var _program = this.Programs.find(pg => pg.ProgramName === this.programSelected);
        console.warn('Selected program ', _program);
        if (_program) {
            console.warn('cost center enabled ', _program.IsCostCenterSelection);
            return _program.IsCostCenterSelection == 'True' ? true : false;
        } else {
            return false;
        }
    }

    @action
    isTripPurposeVisible() {
        return (this.programSelected !== "Select" && !this.programSelected.includes("Others") &&
            this.ProgramsDetails.hasOwnProperty('TripPurpose') && this.ProgramsDetails.TripPurpose === 1);
    }

    @action
    setTripPurpose(Purpose) {
        this.tripPurposeSelected = Purpose;

    }

    @action
    isLineManagerVisible() {
        return (this.programSelected !== Select && !this.programSelected.includes("Others") &&
            this.ProgramsDetails.hasOwnProperty('LineManagerEmails') && this.ProgramsDetails.LineManagerEmails.length > 0 &&
            (!this.ProgramsDetails.IsCostCenterSelection || this.selectedCostCenterID !== "Select"))
    }

    @action
    setCostCenter(costCenter) {
        let email = this.ProgramsDetails.LineManagerEmails[0];
        this.selectedCostCenter = costCenter.Name;
        this.selectedCostCenterEmail = (costCenter !== null && costCenter.hasOwnProperty("ApproverEmail")) ? costCenter.ApproverEmail : "";
        this.selectedCostCenterID = costCenter !== null ? costCenter.CostCenterID : "";
        this.lineManager = (costCenter !== null && costCenter.hasOwnProperty("ApproverEmail")) ? costCenter.ApproverEmail : email;
        this.LineManagerEmails = (costCenter !== null && costCenter.hasOwnProperty("ApproverEmail")) ? costCenter.ApproverEmail : email;
    }

    @action
    setTDCostCenter(costCenter) {
        this.selectedCostCenter = costCenter.Name;
        this.selectedCostCenterID = costCenter !== null ? costCenter.CostCenterID : "";
    }

    @action
    setLineManager(lineManager) {
        this.LineManagerEmails = lineManager;
        this.lineManager = lineManager;
    }

    @action
    showTimePicker() {
        this.isTimePickerVisible = true;
        this.minDateAllowed = new Date(moment().format());
    };

    @action
    hideDateTimePicker() {
        this.isDatePickerVisible = false;
        this.isTimePickerVisible = false;
    }

    @action
    async setDefaultEmployee(_state) {
        console.warn('setDefaultEmployee - ', _state);
        if (this.Employees.length == 0) {
            await this.getProfiles(_state.employeeNumber, 'dfltprofile');

            console.warn('profileSelected - ', this.profileSelected);

            this.travellerSelected = 'Employee';
            this.countrySelected = 'India';

            this.setDefaultSponsor();

            if (this.profileSelected) {

                this.requesterName = this.profileSelected.employeeName;
                this.requesterNumber = this.profileSelected.employeeNumber;
                this.requesterEmail = this.profileSelected.email;
                this.requesterContactNo = this.profileSelected.contactNo;
                this.requesterRequestSiteID =  this.findSiteID(this.siteSelected, this.Sites);
                this.requesterOfficeID = this.profileSelected.officeID

                this.setTravellerData();
            }
        }
    }

    @action setDefaultSponsor() {
        if (this.iamSponsor) {
            this.setSponsor(this.profileSelected);
        } else {
            this.sponsorName = '';
            this.sponsorNumber = '';
            this.sponsorContactNo = '';
            this.sponsorAltContactNo = '';
            this.sponsorEmail = '';
            this.sponsorSiteId = '';
            this.sponsorSite = Select;
            this.sponsorBUId = '';
            this.sponsorBU = Select;
            this.sponsorOfficeId = '';
            this.sponsorOffice = Select;
            this.sponsorCostCenterId = '';
            this.sponsorCostCenter = Select;
        }
    }

    @action setSponsor(_profileSelected) {
        this.sponsorName = _profileSelected.employeeName;
        this.sponsorNumber = _profileSelected.employeeNumber;
        this.sponsorContactNo = _profileSelected.contactNo;
        this.sponsorAltContactNo = '';
        this.sponsorEmail = _profileSelected.email;
        this.sponsorSiteId = _profileSelected.siteID;
        this.sponsorSite = this.siteSelected;
        this.sponsorBUId = _profileSelected.businessID;
        this.sponsorBU = _profileSelected.businessName;
        this.sponsorOfficeId = _profileSelected.officeID;
        this.sponsorOffice = _profileSelected.officeName;
        this.sponsorCostCenterId = _profileSelected.costCenterID;
        this.sponsorCostCenter = _profileSelected.costCenterName;
    }

    setTravellerData() {
        this.travellerName = this.profileSelected.employeeName;
        this.travellerNumber = this.profileSelected.employeeNumber;
        this.travellerGender = this.profileSelected.gender;
        this.travellerEmail = this.profileSelected.email;
        this.travellerContactNo = this.profileSelected.contactNo;
        this.travellerAltContactNo = '';
        this.travellerBUId = this.profileSelected.businessID;
        this.travellerBU = this.profileSelected.businessName;
        this.travellerSubbu = 'N/A';
        this.travellerCostCenterId = this.profileSelected.costCenterID;
        this.travellerCostCenter = this.profileSelected.costCenterName;
        this.travellerCountry = this.countrySelected;
        this.travellerNationality = this.nationality;
        this.travellerPickup = Select;
        this.travellerDrop = Select;
    }

    @action
    setSelectedEmployee(_employee) {
        this.travellerName = _employee.employeeName;
        this.travellerNumber = _employee.employeeNumber;
        this.travellerGender = _employee.gender;
        this.travellerEmail = _employee.email;
        this.travellerContactNo = _employee.contactNo;
        this.travellerAltContactNo = ''; // _employee.contactNo;
        this.buSelected = _employee.businessName;
        this.subbuSelected = 'N/A';
        this.selectedCostCenterID = _employee.costCenterName;
        this.countrySelected = 'India';
        this.nationality = 'Indian';
        this.travellerSelected = 'Employee';
    }

    @action
    async addTraveller() {
        this.isLoading = true;
        this.tdWayPoints = this.tdWayPoints.filter(wp => wp.Remarks == 'WP');
        if (!this.tdWayPoints) {
            this.tdWayPoints = [];
        }
        
        let fromAutoFill = await this.getFromAddress();
        let toAutoFill = await this.getToAddress();

        if (!fromAutoFill || !toAutoFill) {
            alert("Unable to find location...");
            return;
        }
        if (fromAutoFill.ID === toAutoFill.ID) {
            Alert.show("Travel Desk",
                "Source and destination locations cannot be same. Please choose different location"
            );
            return;
        }
        
        this.tdWayPoints.push(fromAutoFill)
        this.tdWayPoints.push(toAutoFill)
        console.warn('waypoints ', this.tdWayPoints);

        this.Employees.push({
            EmployeeName: this.travellerName,
            EmployeeNumber: this.travellerNumber,
            Gender: this.travellerGender,
            Email: this.travellerEmail,
            ContactNo: this.travellerContactNo,
            AlternateContactNo: this.travellerAltContactNo,
            Site: this.siteSelected,
            SiteID: this.findSiteID(this.siteSelected, this.Sites),
            Business: this.travellerBU,
            BusinessID: this.findObjID(this.travellerBU, this.Businesses),
            SubBusiness: this.travellerSubbu,
            SubBusinessID: this.findObjID(this.travellerSubbu, this.SubBusineses),
            CostCenter: this.travellerCostCenter,
            CostCenterID: this.travellerCostCenterId,
            Country: this.travellerCountry,
            CountryID: this.findObjID(this.travellerCountry, this.Countries),
            Nationality: this.travellerNationality,
            TravellerType: 'Employee', // this.travellerSelected,
            TravellerTypeID: this.findObjID(this.travellerSelected, this.Travellers),
            VisitorType: '',
            VisitorTypeID: 0,
            PickupLocation: fromAutoFill?.WayPointName,
            PickupLocationID: fromAutoFill?.WayPointType == 'Office' ? fromAutoFill?.ID : fromAutoFill?.WayPointType,
            DropLocation: toAutoFill?.WayPointName,
            DropLocationID: toAutoFill?.WayPointType == 'Office' ? toAutoFill?.ID : toAutoFill?.WayPointType,
            IsRequester: 1,
        });
        this.isLoading = false;
    }

    @action
    setEmployee() {
        console.warn('travellerIndex ', this.travellerIndex);
        if (this.Employees.length > 0 && this.editMode) {
            this.Employees.splice(this.travellerIndex, 1);
        }

        this.Employees.push({
            EmployeeName: this.travellerName,
            EmployeeNumber: this.travellerNumber,
            Gender: this.travellerGender,
            Email: this.travellerEmail,
            ContactNo: this.travellerContactNo,
            AlternateContactNo: this.travellerAltContactNo,
            Business: this.buSelected,
            BusinessID: this.findObjID(this.buSelected, this.Businesses),
            SubBusiness: this.subbuSelected,
            SubBusinessID: this.findObjID(this.subbuSelected, this.SubBusineses),
            CostCenter: this.selectedCostCenterID,
            CostCenterID: parseInt(this.selectedCostCenterID),
            Country: this.countrySelected,
            CountryID: this.findObjID(this.countrySelected, this.Countries),
            Nationality: this.nationality,
            TravellerType: this.travellerSelected,
            TravellerTypeID: this.findObjID(this.travellerSelected, this.Travellers)
        });
    }

    @action
    editEmployee(_employee, _index) {
        this.travellerIndex = _index;
        this.editMode = true;
        console.warn('Employee ===> ', _employee);
        this.travellerName = _employee.EmployeeName;
        this.travellerNumber = _employee.EmployeeNumber;
        this.travellerGender = _employee.Gender;
        this.travellerEmail = _employee.Email;
        this.travellerContactNo = _employee.ContactNo;
        this.travellerAltContactNo = _employee.AlternateContactNo;
        this.buSelected = _employee.Business;
        this.subbuSelected = _employee.SubBusiness;
        this.selectedCostCenterID = _employee.CostCenter;
        this.countrySelected = _employee.Country;
        this.nationality = _employee.Nationality;
        this.travellerSelected = _employee.TravellerType;
    }

    @action
    resetEmployee() {
        this.travellerIndex = undefined;
        this.editMode = false;
        this.travellerName = '';
        this.travellerNumber = '';
        this.travellerGender = '';
        this.travellerEmail = '';
        this.travellerContactNo = '';
        this.travellerAltContactNo = '';
    }

    @action
    async getAdHocProgram() {
        this.isLoading = true;
        let body = {
            OS: Platform.OS === "ios" ? "IOS" : "AOS",
            Version: appVersion.v,
            DeviceID: this.UserId
        };
        await axios.post(this.customUrl + URL.GET_ADHOC_PROGRAMS, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("AdHoc Response  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status === "200" && data.hasOwnProperty('Programs')) {
                    this.Programs = data.Programs;
                    if (data.Programs.length === 1) {
                        this.programSelected = data.Programs[0].ProgramName;
                        this.getAdHocProgramDetails(this.programSelected);
                    } else {
                        this.setProgramType(Select);
                    }
                } else if (data.Description) {
                    Alert.show(adhoc, data.Description);
                } else {
                    Alert.show(adhoc, loginString.somethingWentWrong);
                }
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                Alert.show(adhoc, loginString.somethingWentWrong);
            }
        });
    }

    @action
    async getTDProgramDetails(selectedProgram) {
        console.warn('Calling program details ', selectedProgram, this.Programs);
        if (selectedProgram == Select) {
            return;
        }

        this.isLoading = true;
        let body = {
            OS: Platform.OS === "ios" ? "IOS" : "AOS",
            Version: appVersion.v,
            DeviceID: this.UserId,
            ProgramID: selectedProgram === "O" ? "O" : this.findProgramID(selectedProgram, this.Programs)
        };
        console.warn('program detail body ', body);
        await axios.post(URL.travelDeskProgramDtl, body, {
            headers: this.getHeader()
        }).then(async response => {
            console.warn('Program details response ', response);
            await runInAction(async () => {
                this.isLoading = false;
                let data = response.data;
                console.warn('Program details response data ', data);
                if (data.Status.Code === 200 && data.Data) {
                    console.warn("Types we go  " + JSON.stringify(data.Data.Types));
                    this.ProgramsDetails = data.Data;
                    this.programTermsCons = this.ProgramsDetails.TermsAndCondition;
                    this.ProgramsDetails.TDValidation = {};
                    this.Vendors = data.Data.Vendors;
                    if (this.Vendors.length === 1) {
                        this.vendorSelected = this.Vendors[0].Name;
                    } else {
                        this.setVendor(Select);
                    }
                    this.Trips = data.Data.TDTripTypes;
                    if (this.Trips.length >= 1) {
                        this.tripSelected = this.Trips[0].Name;
                        this.tripTypeSelected = this.Trips[0].Name;
                        if (this.tripSelected.includes('Airport')) {
                            this.getAirportLocations();
                        }
                    } else {
                        this.setTrip(Select);
                    }

                    this.LineManagerEmails = data.Data && data.Data.LineManagerEmails &&
                        data.Data.LineManagerEmails.length > 0 ? data.Data.LineManagerEmails : [];
                    this.lineManager = data.Data && data.Data.LineManagerEmails &&
                        data.Data.LineManagerEmails.length > 0 ? data.Data.LineManagerEmails[0] : "";
                } else if (data.Status.Message) {
                    Alert.show("Request " + adhoc, data.Description);
                } else if (data.Description) {
                    Alert.show("Request " + adhoc, data.Description);
                } else if (data.status.message) {
                    Alert.show("Request " + adhoc, data.status.message);
                } else {
                    Alert.show("Request " + adhoc, loginString.somethingWentWrong);
                }
            }).catch(error => {
                this.isLoading = false;
                console.warn("Error " + JSON.stringify(error));
                if (error) {
                    Alert.show(adhoc, loginString.somethingWentWrong);
                }
            });
        });
    }

    @action
    async getAdHocProgramDetails(selectedProgram) {
        console.warn('Calling program details ', selectedProgram, this.Programs);
        this.isLoading = true;
        let body = {
            OS: Platform.OS === "ios" ? "IOS" : "AOS",
            Version: appVersion.v,
            DeviceID: this.UserId,
            ProgramID: selectedProgram === "O" ? "O" : this.findProgramID(selectedProgram, this.Programs)
        };
        console.warn('program detail body ', body);
        await axios.post(URL.GET_PROGRAM_DETAILS_LINE_MANAGER, body, {
            headers: this.getHeader()
        }).then(async response => {
            console.warn('Program details response ', response);
            await runInAction(async () => {
                this.isLoading = false;
                let data = response.data;
                console.warn('Program details response data ', data);
                if (data.Status.Code === 200 && data.Data) {
                    console.warn("Types we go  " + JSON.stringify(data.Data.Types));
                    this.ProgramsDetails = data.Data;
                    this.LineManagerEmails = data.Data && data.Data.LineManagerEmails &&
                        data.Data.LineManagerEmails.length > 0 ? data.Data.LineManagerEmails[0] : "";
                    this.lineManager = data.Data && data.Data.LineManagerEmails &&
                        data.Data.LineManagerEmails.length > 0 ? data.Data.LineManagerEmails[0] : "";
                    this.SourceLocations = data.Data.Locations.filter(
                        location => {
                            return location.LocationType === "S";
                        }
                    );
                    this.DestinationLocations = data.Data.Locations.filter(
                        location => {
                            return location.LocationType === "D";
                        }
                    );
                    if (data.Data.Types.length === 1) {
                        this.tripTypeSelected = data.Data.Types[0].Name;
                        this.fromSelected = Select;
                        this.toSelected = Select;
                        if (this.SourceLocations.length === 1) {
                            this.fromSelected = this.SourceLocations[0].LocationName;
                        }
                        if (this.DestinationLocations.length === 1) {
                            this.toSelected = this.DestinationLocations[0].LocationName;
                        }
                    } else {
                        this.tripTypeSelected = Select;
                        this.fromSelected = Select;
                        this.toSelected = Select;
                    }
                    this.TripPurpose = data.Data.Purposes;
                } else if (data.Status.Message) {
                    Alert.show("Request " + adhoc, data.Description);
                } else if (data.Description) {
                    Alert.show("Request " + adhoc, data.Description);
                } else if (data.status.message) {
                    Alert.show("Request " + adhoc, data.status.message);
                } else {
                    Alert.show("Request " + adhoc, loginString.somethingWentWrong);
                }
            }).catch(error => {
                this.isLoading = false;
                console.warn("Error " + JSON.stringify(error));
                if (error) {
                    Alert.show(adhoc, loginString.somethingWentWrong);
                }
            });
        });
    }

    @action
    async savePOILocation(body, type, selectedLocation) {
        this.isLoading = true;
        await axios.post(URL.SAVE_POI_NEW, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                let data = response.data;
                console.warn("savePOILocation Response  " + JSON.stringify(data));
                if (data.status === "200") {
                    if (type === "from") {
                        this.fromAddressID = data.addressID;
                        this.fromSelected = selectedLocation;
                        Toast.show("From Location: " + data.description);
                    } else if (type === "to") {
                        this.toAddressID = data.addressID;
                        this.toSelected = selectedLocation;
                        Toast.show("To Location: " + data.description);
                    }
                } else if (data.description) {
                    Alert.show(adhoc + " Other Location", data.description);
                } else {
                    console.warn("at here 372  " + JSON.stringify(data));
                    Alert.show(adhoc + " Other Location", loginString.somethingWentWrong);
                }
            });
        }).catch(error => {
            this.isLoading = false;
            if (error) {
                console.warn("at here catch block  " + JSON.stringify(error));
                Alert.show(adhoc, loginString.somethingWentWrong);
            }
        });
    }

    @action
    async searchFlexiCab() {
        if (!this.tripTypeSelected || this.tripTypeSelected === Select) {
            Alert.show("Request for cab", "Please select trip type");
            return;
        } else if (
            !(this.tripTypeSelected === "Logout"
                ? this.fromSelected !== Select
                : this.toSelected !== Select)
        ) {
            Alert.show(
                "Request for cab",
                this.tripTypeSelected === "Logout"
                    ? "Please select source"
                    : "Please select destination"
            );
            return;
        } else if (!this.StaffLocations || this.StaffLocations === Select) {
            Alert.show(
                "Request for cab",
                this.tripTypeSelected === "Logout"
                    ? "Please select destination"
                    : "Please select source"
            );
            return;
        } else if (!this.dateSelected || this.dateSelected === Select) {
            Alert.show("Request for cab", "Please select date");
            return;
        } else if (!this.timeSelected || this.timeSelected === Select) {
            Alert.show("Request for cab", "Please select time");
            return;
        }
        let body = {
            RequestedTime: this.dateSelected + " " + this.timeSelected,
            DeviceID: this.UserId,
            StaffLocation: this.StaffLocations,
            IsProfileStateCheck: 1,
            TripType: this.tripTypeSelected === "Login" ? "P" : "D",
            OfficeLocation: this.findID(
                this.tripTypeSelected === "Logout"
                    ? this.fromSelected
                    : this.toSelected,
                this.FlexiDetails.OfficeLocations
            )
        };

        await axios.post(this.customUrl + URL.GET_FLEXI_CABS, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return
                }
                let data = response.data;
                console.warn("RESP " + JSON.stringify(data));
                if (data.Status === "200") {
                    this.Cabs = await data.Cabs;
                } else if (data.Status === "402") {
                    Alert.show(
                        requestFlexiCab,
                        "No Cabs currently available for the route"
                    );
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

    @action
    async SaveTravelDesk(_state) {

        console.warn('Cost center ', this.selectedCostCenterID);
        console.warn('ProgramsDetails ', this.ProgramsDetails);
        console.warn('Employees -> ', this.Employees);

        const date = this.dateSelected + " " + this.timeSelected;
        // const selectedDate = moment(new Date(date)).toISOString();
        const selectedDate = moment(date, 'DD MMM YYYY HH:mm').toISOString();
        const currentDate = moment()
            .add(
                this.tripTypeSelected === "Login"
                    ? this.ProgramsDetails.PickupCutOffTime
                    : this.ProgramsDetails.DropCutOffTime,
                "minutes"
            ).toISOString();

            console.warn('TD selected date -> ', date, selectedDate, currentDate);

        if (!this.siteSelected || this.siteSelected === Select) {
            Alert.show(_state.title, "Please select a Site");
            return;
        // } else if (!this.buSelected || this.buSelected === Select) {
        //     Alert.show(_state.title, "Please select a BU");
        //     return;
        } else if (!this.programSelected || this.programSelected === Select) {
            Alert.show(_state.title, "Please select a Program");
            return;
        } else if (this.tripTypeSelected === Select) {
            Alert.show(_state.title, "Please select a Trip Type");
            return;
        } else if (this.vehicleSelected === Select) {
            Alert.show(_state.title, "Please select a Vehicle Type");
            return;
        } else if (this.fromSelected === Select) {
            Alert.show(_state.title, "Please select Source Location");
            return;
        } else if (this.toSelected === Select) {
            Alert.show(_state.title, "Please select Destination Location");
            return;
        } else if (this.fromSelected === this.toSelected) {
            Alert.show(_state.title, "Source and Destination cannot be same.Please choose different location");
            return;
        } else if (!this.dateSelected || this.dateSelected === Select) {
            Alert.show(_state.title, "Please select From date");
            return;
        } else if (!this.dateToSelected || this.dateToSelected === Select) {
            Alert.show(_state.title, "Please select To date");
            return;
        } else if (!this.timeSelected || this.timeSelected === Select) {
            Alert.show(_state.title, "Please select time");
            return;
        } else if (this.sponsorName == null || this.sponsorName == '') {
            Alert.show(_state.title, "Please enter Sponsor Name");
            return;
        } else if (this.sponsorEmail == null || this.sponsorEmail == '') {
            Alert.show(_state.title, "Please enter Sponsor Email");
            return;
        } else if (this.sponsorContactNo == null || this.sponsorContactNo == '') {
            Alert.show(_state.title, "Please enter Sponsor Contact No");
            return;
        // } else if (_state.guestName == null || _state.guestName == '') {
        //     Alert.show(_state.title, "Please enter Guest Name");
        //     return;
        // } else if (_state.guestEmail == null || _state.guestEmail == '') {
        //     Alert.show(_state.title, "Please enter Guest Email");
        //     return;
        // } else if (_state.contactNo == null || _state.contactNo == '') {
        //     Alert.show(_state.title, "Please enter Guest Contact No");
        //     return;
        // } else if (_state.countrySelected == Select) {
        //     Alert.show(_state.title, "Please select country");
        //     return;
        } else if (moment(selectedDate).isBefore(currentDate)) {
            let time =
                this.tripTypeSelected === "Login"
                    ? this.ProgramsDetails.PickupCutOffTime
                    : this.ProgramsDetails.DropCutOffTime;
            Alert.show(_state.title,
                "Travel request must be made " + time + " mins prior to the travel time"
            );
            return;

            // } else if (this.ProgramsDetails.LineManagerEmails.length > 0 && !this.LineManagerEmails) {
            //     Alert.show("Line Manager", "Please select Line Manager");
            //     return;
            // }
            // if (this.ProgramsDetails.TripPurpose === 1 && !this.tripPurposeSelected.hasOwnProperty('ID')) {
            //     Alert.show(_state.title, "Please select trip purpose");
            //     return;
        // } else if (this.isTDCostCenterVisible() && this.selectedCostCenterID === Select) {
        //     Alert.show(_state.title, "Please select Cost Center");
        //     return;
        // } else if (!this.LineManagerEmails) {
        //     Alert.show("Line Manager", "Please select a valid Line Manager");
        //     return;
        } else if (moment(this.dateToSelected, 'DD MMM YYYY').isBefore(moment(this.dateSelected, 'DD MMM YYYY'))) {
            Alert.show(_state.title, "Please select valid To date");
            return;
        } else if (this.Employees.length == 0) {
            Alert.show(_state.title, "Please add traveller details");
            return;
        }
     
        console.log('tempIgnoreDates', tempIgnoreDates);
        // let pushToDataBody = [];
        // let pushFromDataBody = [];
        // console.warn('to address id ', this.toAddressID);
        // if (this.toAddressID) {
        //     pushToDataBody = [
        //         {
        //             Id: this.toAddressID,
        //             LocationName: this.toSelectedLocation,
        //             LocationType: "S",
        //             GeoLocation: this.toSelectLat + "," + this.toSelectLng
        //         }
        //     ];
        // }
        // console.warn('fromAddressID ', this.fromAddressID);
        // if (this.fromAddressID) {
        //     pushFromDataBody = [
        //         {
        //             Id: this.fromAddressID,
        //             LocationName: this.fromSelectedLocation,
        //             LocationType: "S",
        //             GeoLocation: this.fromSelectLat + "," + this.fromSelectLng
        //         }
        //     ];
        // }

        // this.SourceLocations = [
        //     ...this.SourceLocations,
        //     ...pushFromDataBody
        // ]
        // console.warn('SourceLocations ', this.SourceLocations);

        // this.DestinationLocations = [
        //     ...this.DestinationLocations,
        //     ...pushToDataBody
        // ]
        // console.warn('DestinationLocations ', this.DestinationLocations);

        //         let newDate = [
        //             ...pushToDataBody,
        //             ...pushFromDataBody,
        //             ...this.SourceLocations,
        //             ...this.DestinationLocations
        //         ];
        // console.warn('new array loc ', newDate);
        //         const responseGetProgramDetailsLocationArray = _.uniqBy(
        //             newDate,
        //             "LocationName"
        //         );
        // console.warn('responseGetProgramDetailsLocationArray ', responseGetProgramDetailsLocationArray);
        // let toAutoFill = this.findLocation(this.fromSelected, this.SourceLocations);
        // let toAutoFill = findAutoFill(
        //     this.fromSelected,
        //     responseGetProgramDetailsLocationArray
        // );
        // let fromAutoFill = this.findLocation(this.toSelected, this.DestinationLocations);
        // let fromAutoFill = findAutoFill(
        //     this.toSelected,
        //     responseGetProgramDetailsLocationArray
        // );
        // if (!fromAutoFill || !toAutoFill) {
        //     alert("Unable to find location...");
        //     return;
        // }
        // if (fromAutoFill.Id === toAutoFill.Id) {
        //     Alert.show(_state.title,
        //         "Source and destination locations cannot be same. Please choose different location"
        //     );
        //     return;
        // }

         const range = moment.range(moment(this.dateSelected, 'DD MMM YYYY'), moment(this.dateToSelected, 'DD MMM YYYY'));
         console.warn('Range - ', range);
         let tempWeeklyOff = this.weeklyOffStateValue.join();
         console.warn('tempWeeklyOff ', tempWeeklyOff);
        let tempIgnoreDates = [];
         for (let month of range.by("days")) {
            console.warn('monthdate -> ', month);
            if (tempWeeklyOff.includes(month.format("dddd"))) {
                tempIgnoreDates.push(month.format("YYYY-MM-DD"));
            }
         }

         this.tdWayPoints.forEach((wp, index) => {
            wp.ID = (index + 1)
         })
        let body = {
            // DeviceID: this.UserId,

            // TripType: this.tripTypeSelected === "Login" ? "P" : "D", //"P",
            // RequestedTime: this.dateSelected + " " + this.timeSelected, //"01 Aug 2018 14:00",
            
            // SourceLocationID: toAutoFill.Id, //"22",
            // SourceLocation: this.fromSelected, //"Kormangala"
            // SourceLatitude: toAutoFill.Lat,
            // SourceLongitude: toAutoFill.Lng,
            // DestinationLocationID: fromAutoFill.Id, //"H",
            // DestinationLocation: this.toSelected, //"Home",
            // DestinationLatitude: fromAutoFill.Lat,
            // DestinationLongitude: fromAutoFill.Lng,

            // IsProfileStateCheck: 1,
            // TripPurposeID: this.tripPurposeSelected.hasOwnProperty('ID') ? this.tripPurposeSelected.ID : "",
            // Version: appVersion.v,
            // OS: Platform.OS === "ios" ? "IOS" : "AOS",
            // LineManagerEmailID: this.LineManagerEmails.length > 0 ? this.LineManagerEmails[0] : '',
            // IsCostCenterSelection: this.ProgramsDetails.IsCostCenterSelection,
            // CostCenterID: parseInt(this.selectedCostCenterID), // this.findCCID(this.selectedCostCenterID, this.CostCenters), // this.ProgramsDetails.IsCostCenterSelection === true ? this.selectedCostCenterID : "",
            
            SiteID: this.findSiteID(this.siteSelected, this.Sites),
            RequesterName: this.requesterName,
            RequesterEmail: this.requesterEmail,
            RequesterContactNo: this.requesterContactNo,
            RequesterRequestSiteID: this.requesterRequestSiteID,
            RequesterOfficeID: this.requesterOfficeID,
            RequesterSameAsSponsor: this.iamSponsor,

            SponsorID: '',
            SponsorNo: this.sponsorNumber,
            SponsorName: this.sponsorName,
            SponsorContactNo: this.sponsorContactNo,
            SponsorEmail: this.sponsorEmail,
            SponsorRequestSiteID: this.sponsorSiteId,
            SponsorOfficeID: this.sponsorOfficeId,
            SponsorBusinessID: this.sponsorBUId,
            SponsorSubBusinessID: 0,
            SponsorCostcenterID: this.sponsorCostCenterId,

            FromDate: this.dateSelected,
            ToDate: this.dateToSelected,
            PickupTime: this.timeSelected,
            DropTime: (this.tripTypeSelected == "Outstation Round Trip" ? (this.timeToSelected != Select ? this.timeToSelected : undefined) : undefined),
            // Time: this.timeSelected,
            IgnoreDates: tempIgnoreDates.join("|"), //uniqueDates,
            ProgramID: this.findProgramID(this.programSelected, this.Programs), // this.ProgramsDetails.ProgramID, //"000000011",
            TripTypeID: this.findID(this.tripTypeSelected, this.Trips),

            // RequestorAltContactNumber: _state.alternateContactNo,
            // RequestorCountryId: this.findObjID(this.countrySelected, this.Countries),
            // RequestorNationality: this.nationality, // _state.nationality,
            // BuId: this.findObjID(this.buSelected, this.Businesses),
            // SubBuId: this.findObjID(this.subbuSelected, this.SubBusineses),
            // VisitorTypeId: this.findObjID(this.visitorSelected, this.Visitors),

            VehicleTypeID: this.findVehicleID(this.vehicleSelected, this.Vehicles),
            VendorID: this.findID(this.vendorSelected, this.Vendors),
            RentalModelID: this.findObjID(this.rentalModelSelected, this.RentalModels),
            // PoNumber: _state.pono,
            // OvernightCharges: _state.oncharge ? parseFloat(_state.oncharge) : 0,
            // DayAllowance: _state.dayallow ? parseFloat(_state.dayallow) : 0,
            // IsSez: _state.sez,
            // IsSingleLadyTraveller: _state.singleLadyTravel,
            IsSecurityEscortReqd: this.securityEscot,
            AdminRemarks: this.noteToAdmin,
            NotesToDriver: this.noteToDriver,

            ApprovalMode: this.approvalType == "PRE" ? true : false,
            ApprovalDocumentType: this.preApprovedDocType,
            ApprovalDocumentData: this.preApprovedDocData,
            ItineraryDocumentType: this.itineraryDocType,
            ItineraryDocumentData: this.itineraryDocData,
            LineManagerEmailID: this.lineManager,

            // Employees: this.Employees
            WayPoints: this.tdWayPoints,
            Travelers: this.Employees,

        };

        console.log('Save Travel Desk Body ', body);

        console.warn('Save Travel Desk Travelers ', body.Travelers);
        this.isLoading = true;
        await axios.post(URL.SAVE_TRAVEL_DESK, body, {
            headers: this.getHeader()
        }).then(async response => {
            console.warn('Save TD Response ', response);
            await runInAction(async () => {
                this.isLoading = false;
                let data = response.data.Data;
                this.apiSuccess = data;
                //  need to clear the store
                Alert.show(this.adhocType, data.Description);
            }).catch(error => {
                if (error) {
                    this.isLoading = false;
                    Alert.show("Error", loginString.somethingWentWrong);
                }
            });
        });
    }

    @action
    async SaveAdhoc(title) {
        const date = this.dateSelected + " " + this.timeSelected;
        const selectedDate = moment(new Date(date)).toISOString();
        const currentDate = moment()
            .add(
                this.tripTypeSelected === "Login"
                    ? this.ProgramsDetails.PickupCutOffTime
                    : this.ProgramsDetails.DropCutOffTime,
                "minutes"
            ).toISOString();

        if (!this.programSelected || this.programSelected === Select) {
            Alert.show(title, "Please select a Request Type");
            return;
        } else if (this.tripTypeSelected === Select) {
            Alert.show(title, "Please select a Trip Type");
            return;
        } else if (this.fromSelected === Select) {
            Alert.show(title, "Please select Source Location");
            return;
        } else if (this.toSelected === Select) {
            Alert.show(title, "Please select Destination Location");
            return;
        } else if (this.fromSelected === this.toSelected) {
            Alert.show(title, "Source and Destination cannot be same.Please choose different location");
            return;
        } else if (!this.dateSelected || this.dateSelected === Select) {
            Alert.show(title, "Please select date");
            return;
        } else if (!this.timeSelected || this.timeSelected === Select) {
            Alert.show(title, "Please select time");
            return;
        } else if (moment(selectedDate).isBefore(currentDate)) {
            let time =
                this.tripTypeSelected === "Login"
                    ? this.ProgramsDetails.PickupCutOffTime
                    : this.ProgramsDetails.DropCutOffTime;
            Alert.show(title,
                "Program request must be made " + time + " mins prior to the shift time"
            );
            return;
        } else if (this.ProgramsDetails.IsCostCenterSelection && this.selectedCostCenterID === "") {
            Alert.show("Cost Center", "Please select Cost Center");
            return;
        } else if (this.ProgramsDetails.LineManagerEmails.length > 0 && !this.LineManagerEmails) {
            Alert.show("Line Manager", "Please select Line Manager");
            return;
        } else if (this.lineManager !== this.LineManagerEmails) {
            Alert.show("Line Manager", "Please select a valid Line Manager");
            return;
        }
        if (this.ProgramsDetails.TripPurpose === 1 && !this.tripPurposeSelected.hasOwnProperty('ID')) {
            Alert.show(title, "Please select trip purpose");
            return;
        }
        let pushToDataBody = [];
        let pushFromDataBody = [];
        if (this.toAddressID) {
            pushToDataBody = [
                {
                    LocationCode: this.toAddressID,
                    LocationName: this.toSelectedLocation,
                    LocationType: "S",
                    GeoLocation: this.toSelectLat + "," + this.toSelectLng
                }
            ];
        }
        if (this.fromAddressID) {
            pushFromDataBody = [
                {
                    LocationCode: this.fromAddressID,
                    LocationName: this.fromSelectedLocation,
                    LocationType: "S",
                    GeoLocation: this.fromSelectLat + "," + this.fromSelectLng
                }
            ];
        }
        let newDate = [
            ...pushToDataBody,
            ...pushFromDataBody,
            ...this.ProgramsDetails.Locations
        ];

        const responseGetProgramDetailsLocationArray = _.uniqBy(
            newDate,
            "LocationName"
        );
        let toAutoFill = findAutoFill(
            this.fromSelected,
            responseGetProgramDetailsLocationArray
        );
        let fromAutoFill = findAutoFill(
            this.toSelected,
            responseGetProgramDetailsLocationArray
        );
        if (!fromAutoFill || !toAutoFill) {
            alert("Unable to find location...");
            return;
        }
        if (fromAutoFill.LocationCode === toAutoFill.LocationCode) {
            Alert.show(title,
                "Source and destination locations cannot be same. Please choose different location"
            );
            return;
        }

        let body = {
            DeviceID: this.UserId,
            TripType: this.tripTypeSelected === "Login" ? "P" : "D", //"P",
            RequestedTime: this.dateSelected + " " + this.timeSelected, //"01 Aug 2018 14:00",
            SourceLocationID: toAutoFill.LocationCode, //"22",
            SourceLocation: this.fromSelected, //"Kormangala"
            SourceLatitude: toAutoFill.Lat,
            SourceLongitude: toAutoFill.Lng,
            DestinationLocationID: fromAutoFill.LocationCode, //"H",
            DestinationLocation: this.toSelected, //"Home",
            DestinationLatitude: fromAutoFill.Lat,
            IsProfileStateCheck: 1,
            DestinationLongitude: fromAutoFill.Lng,
            TripPurposeID: this.tripPurposeSelected.hasOwnProperty('ID') ? this.tripPurposeSelected.ID : "",
            ProgramID: this.ProgramsDetails.ProgramID, //"000000011",
            Version: appVersion.v,
            OS: Platform.OS === "ios" ? "IOS" : "AOS",
            LineManagerEmailID: this.LineManagerEmails,
            IsCostCenterSelection: this.ProgramsDetails.IsCostCenterSelection,
            CostCenterID: this.ProgramsDetails.IsCostCenterSelection === true ? this.selectedCostCenterID : ""
        };
        console.warn('nsa body - ', body);
        
        this.isLoading = true;
        await axios.get(this.customUrl + URL.SAVE_ADHOC + queryString.stringify(body), body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                let data = response.data;
                this.apiSuccess = data;
                //  need to clear the store
                Alert.show("Adhoc", data.Description);
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
                    handleResponse.expireSession(context);
                    return
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

    findSiteID(SiteName, SitesArray) {
        let i;
        for (i = 0; i < SitesArray.length; i++) {
            if (
                SitesArray[i].SiteName.toString().trim() ===
                SiteName.toString().trim()
            ) {
                return SitesArray[i].SiteID;
            }
        }
        return 0;
    }

    findCCID(Name, CCArray) {
        let i;
        for (i = 0; i < CCArray.length; i++) {
            if (
                CCArray[i].Name.toString().trim() ===
                Name.toString().trim()
            ) {
                return CCArray[i].CostCenterID.toString().trim();
            }
        }
        return "NA";
    }

    findObjID(Name, Array) {
        let i;
        for (i = 0; i < Array.length; i++) {
            if (
                Array[i].Name.toString().trim() ===
                Name.toString().trim()
            ) {
                return Array[i].Id;
            }
        }
        return 0;
    }

    findVehicleID(VehicleTypeName, VehicleArray) {
        let i;
        for (i = 0; i < VehicleArray.length; i++) {
            if (
                VehicleArray[i].VehicleTypeName.toString().trim() ===
                VehicleTypeName.toString().trim()
            ) {
                return VehicleArray[i].VehicleTypeID.toString().trim();
            }
        }
        return "NA";
    }

    findProgramID(ProgramName, ProgramsArray) {
        let i;
        for (i = 0; i < ProgramsArray.length; i++) {
            if (
                ProgramsArray[i].ProgramName.toString().trim() ===
                ProgramName.toString().trim()
            ) {
                return ProgramsArray[i].ProgramID.toString().trim();
            }
        }
        return "NA";
    }

    findID(_Name, _Array) {
        let i;
        if (_Array.length > 0) {
            for (i = 0; i < _Array.length; i++) {
                if (_Array[i].Name.toString().trim() === _Name.toString().trim()) {
                    return _Array[i].ID.toString().trim();
                }
            }
        }
        return "NA";
    }

    findLocation(Name, LocationArray) {
        let i;
        if (LocationArray.length > 0) {
            for (i = 0; i < LocationArray.length; i++) {
                if (LocationArray[i].LocationName.toString().trim() === Name.toString().trim()) {
                    if (!LocationArray[i].GeoLocation) return LocationArray[i];
                    let body = {
                        Lat: LocationArray[i].GeoLocation.split(",")[0],
                        Lng: LocationArray[i].GeoLocation.split(",")[1],
                        Id: LocationArray[i].Id,
                        LocationName: LocationArray[i].LocationName,
                        LocationType: LocationArray[i].LocationType
                    };
                    return body;
                }
            }
        }
        return "NA";
    }

    @action
    async getNonShiftProgram(context) {
        this.isLoading = true;
        await axios.get(URL.AdhocNonShiftProgram, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("AdHoc Response  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status.Code === 200 && data.hasOwnProperty('Data')) {
                    this.Programs = data.Data;
                    if (data.Data.length === 0) {
                        Alert.show(adhoc, "No programs available for your profile");
                        context.props.navigation.goBack();
                    }
                    if (data.Data.length === 1) {
                        this.programSelected = data.Data[0].ProgramName;
                        this.getAdHocProgramDetails(this.programSelected);
                    } else {
                        this.setProgramType(Select);
                    }
                } else if (data.Description) {
                    Alert.show(adhoc, data.Description);
                } else {
                    Alert.show(adhoc, loginString.somethingWentWrong);
                }

            });
            return new Promise.resolve();
        }).catch(error => {
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(adhoc, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getTravelDeskSite() {
        console.warn('Travel desk function ', this.customUrl);
        console.warn('Travel desk function ', URL.travelDeskSite);
        this.isLoading = true;
        await axios.get(URL.travelDeskSite, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn('default site id --- ', this.siteID);
                console.warn("Travel Desk Response  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status.Code === 200 && data.hasOwnProperty('Data')) {
                    this.Sites = data.Data;
                    if (data.Data.length === 0) {
                        this.isSiteVisible = false;
                        // Alert.show(this.adhocType, "No Sites available for your profile");
                        // this.navigation.goBack();
                    } else {
                        this.isSiteVisible = true;
                    }
                    if (data.Data.length === 1) {
                        this.siteSelected = data.Data[0].SiteName;
                        this.getTravelDeskProgram();
                        this.getVisitors();
                        this.getTravellers();
                        this.getCountries();
                        this.getCostCenters();
                        this.getOffices();
                    } else {
                        this.setSite(Select);
                    }
                } else if (data.Description) {
                    Alert.show(this.adhocType, data.Description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }

            });
            return new Promise.resolve();
        }).catch(error => {
            console.warn('Error --> ', error);
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getBusinesses() {
        console.warn('Travel desk BU ', URL.travelDeskBU);
        this.isLoading = true;
        await axios.get(URL.travelDeskBU, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("Travel Desk BU Response  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status.Code === 200 && data.hasOwnProperty('Data')) {
                    this.Businesses = data.Data;
                    if (data.Data.length === 0) {
                        Alert.show(this.adhocType, "No businesses available for your profile");
                        // this.navigation.goBack();
                    }
                    if (data.Data.length === 1) {
                        this.buSelected = data.Data[0].Name;
                        this.getSubBusinesses();
                    } else if (this.businessID) {
                        console.warn('bu list businessID -- ', this.businessID);
                        var _bu = this.Businesses.find((bu) => bu.Id == this.businessID);
                        console.warn('Selected BU default ', _bu);
                        if (_bu) {
                            this.buSelected = _bu.Name;
                        }
                        this.getSubBusinesses();
                    } else {
                        this.setBusiness(Select);
                    }
                } else if (data.Description) {
                    Alert.show(this.adhocType, data.Description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }

            });
            return new Promise.resolve();
        }).catch(error => {
            console.warn('Error --> ', error);
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getSubBusinesses() {
        var buID = this.findObjID(this.buSelected, this.Businesses);
        if (buID == 0) {
            return;
        }
        console.warn('Travel desk sub BU ', URL.travelDeskSubBU + buID);
        this.isLoading = true;
        await axios.get(URL.travelDeskSubBU + buID, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("Travel Desk sub BU Response  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status.Code === 200 && data.hasOwnProperty('Data')) {
                    this.SubBusinesses = data.Data;
                    // if (data.Data.length === 0) {
                    //     Alert.show(this.adhocType, "No sub businesses available for your business");
                    //     this.navigation.goBack();
                    // }
                    if (data.Data.length === 1) {
                        this.subbuSelected = data.Data[0].Name;
                    } else {
                        this.setSubBusiness(Select);
                    }
                } else if (data.Description) {
                    Alert.show(this.adhocType, data.Description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }

            });
            return new Promise.resolve();
        }).catch(error => {
            console.warn('Error --> ', error);
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getTravelDeskProgram() {
        var siteID = this.findSiteID(this.siteSelected, this.Sites);
        if (siteID == 0) {
            return;
        }
        console.warn('Calling travel desk program -- ', URL.travelDeskProgram + siteID);
        this.isLoading = true;
        await axios.get(URL.travelDeskProgram + siteID, { // travelDeskProgram
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("Travel Desk Program Response  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status.Code === 200 && data.hasOwnProperty('Data')) {
                    this.Programs = data.Data;
                    if (data.Data.length === 0) {
                        Alert.show(this.adhocType, "No programs available for your site");
                        // this.navigation.goBack();
                    }
                    if (data.Data.length === 1) {
                        this.programSelected = data.Data[0].ProgramName;
                        this.getTDProgramDetails(this.programSelected);
                        // this.getTripTypes();
                        this.getVehicles();
                        this.getVehiclesPolicy();
                        this.getRentalModels();
                        this.getLocations();
                    } else {
                        this.setProgramType(Select);
                    }
                } else if (data.Description) {
                    Alert.show(this.adhocType, data.Description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }

            });
            return new Promise.resolve();
        }).catch(error => {
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getVehicles() {
        var programID = this.findProgramID(this.programSelected, this.Programs);
        if (programID == 'NA') {
            return
        }
        console.warn('Travel desk vehicle ', URL.travelDeskVehicles + programID);
        this.isLoading = true;
        await axios.get(URL.travelDeskVehicles + programID, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("Travel Desk vehicle Response  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status.Code === 200 && data.hasOwnProperty('Data')) {
                    this.Vehicles = data.Data;
                    if (data.Data.length === 0) {
                        Alert.show(this.adhocType, "No vehicles available for your program");
                        // this.navigation.goBack();
                    }
                    if (data.Data.length === 1) {
                        this.vehicleSelected = data.Data[0].VehicleTypeName;
                    } else {
                        this.setVehicle(Select);
                    }
                } else if (data.Description) {
                    Alert.show(this.adhocType, data.Description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }

            });
            return new Promise.resolve();
        }).catch(error => {
            console.warn('Error --> ', error);
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getVehiclesPolicy() {
        console.warn('Travel desk vehicle policy ', URL.travelDeskVehiclesPolicy);
        this.isLoading = true;
        await axios.get(URL.travelDeskVehiclesPolicy, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("Travel Desk vehicle policy Response  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.status.code === 200) {
                    this.VehiclesPolicy = data.status.message;
                } else if (data.Description) {
                    Alert.show(this.adhocType, data.Description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }

            });
            return new Promise.resolve();
        }).catch(error => {
            console.warn('Error --> ', error);
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getRentalModels() {
        console.warn('Travel desk rental model ', URL.travelDeskRentalModel);
        this.isLoading = true;
        await axios.get(URL.travelDeskRentalModel, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("Travel Desk rental Response  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status.Code === 200 && data.hasOwnProperty('Data')) {
                    this.isRentalModelVisible = data.Data.ShowRentalModel == '1' ? true : false;
                    this.RentalModels = data.Data.RentalModels;
                    // if (this.RentalModels.length === 0) {
                    //     Alert.show(this.adhocType, "No rental models");
                    //     // this.navigation.goBack();
                    // }
                    if (this.RentalModels.length === 1) {
                        this.rentalModelSelected = this.RentalModels[0].Name;
                    } else {
                        this.setRentalModel(Select);
                    }
                } else if (data.Description) {
                    Alert.show(this.adhocType, data.Description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }

            });
            return new Promise.resolve();
        }).catch(error => {
            console.warn('Error --> ', error);
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getTripTypes() {
        var programID = this.findProgramID(this.programSelected, this.Programs);
        if (programID == 'NA') {
            return
        }
        console.warn('Travel desk trip types ', URL.travelDeskTrips + programID);
        this.isLoading = true;
        await axios.get(URL.travelDeskTrips + programID, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("Travel Desk trip Response  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status.Code === 200 && data.hasOwnProperty('Data')) {
                    this.Trips = data.Data;
                    if (data.Data.length === 0) {
                        Alert.show(this.adhocType, "No trips available for your program");
                        // this.navigation.goBack();
                    }
                    if (data.Data.length === 1) {
                        this.tripSelected = data.Data[0].Name;
                        this.tripTypeSelected = data.Data[0].Name;
                    } else {
                        this.setTrip(Select);
                    }
                } else if (data.Description) {
                    Alert.show(this.adhocType, data.Description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }

            });
            return new Promise.resolve();
        }).catch(error => {
            console.warn('Error --> ', error);
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getVisitors() {
        var siteID = this.findSiteID(this.siteSelected, this.Sites);
        if (siteID == 0) {
            return;
        }
        console.warn('Travel desk visitor ', URL.travelDeskVisitors + siteID);
        this.isLoading = true;
        await axios.get(URL.travelDeskVisitors + siteID, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("Travel Desk visitor Response  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status.Code === 200 && data.hasOwnProperty('Data')) {
                    this.Visitors = data.Data;
                    if (data.Data.length === 0) {
                        Alert.show(this.adhocType, "No visitor available for your site");
                        // this.navigation.goBack();
                    }
                    if (data.Data.length === 1) {
                        this.visitorSelected = data.Data[0].Name;
                    } else {
                        this.setVisitor(Select);
                    }
                } else if (data.Description) {
                    Alert.show(this.adhocType, data.Description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }

            });
            return new Promise.resolve();
        }).catch(error => {
            console.warn('Error --> ', error);
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getTravellers() {
        var siteID = this.findSiteID(this.siteSelected, this.Sites);
        if (siteID == 0) {
            return;
        }
        console.warn('Travel desk traveller ', URL.travelDeskTravellers + siteID);
        this.isLoading = true;
        await axios.get(URL.travelDeskTravellers + siteID, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("Travel Desk traveller Response  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status.Code === 200 && data.hasOwnProperty('Data')) {
                    this.Travellers = data.Data;
                    if (data.Data.length === 0) {
                        Alert.show(this.adhocType, "No traveller type available for your site");
                        // this.navigation.goBack();
                    }
                    if (data.Data.length >= 1) {
                        this.travellerSelected = data.Data[0].Name;
                    } else {
                        this.setTraveller(Select);
                    }
                } else if (data.Description) {
                    Alert.show(this.adhocType, data.Description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }

            });
            return new Promise.resolve();
        }).catch(error => {
            console.warn('Error --> ', error);
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getProfiles(_searchText, isDefault) {
        console.warn('getProfiles search text - ', _searchText);
        // this.isLoading = true;
        await axios.get(URL.travelDeskEmployeeSearch + _searchText, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("Travel Desk traveller profiles  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.status.code === 200 && data.hasOwnProperty('data')) {
                    this.Profiles = data.data;
                    console.warn('Profiles - ', this.Profiles);
                    if (data.data.length === 0) {
                        return;
                        // Alert.show(this.adhocType, "No profiles found");
                        // this.navigation.goBack();
                    }

                    if (data.data.length === 1) {
                        this.profileSelected = data.data[0];
                    } else if (isDefault) {
                        this.profileSelected = data.data.find(profile => profile.employeeNumber === _searchText);
                    }
                } else if (data.Description) {
                    Alert.show(this.adhocType, data.Description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }

            });
            return new Promise.resolve();
        }).catch(error => {
            console.warn('Error --> ', error);
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getCountries() {
        var siteID = this.findSiteID(this.siteSelected, this.Sites);
        if (siteID == 0) {
            return;
        }
        console.warn('Travel desk country ', URL.travelDeskCountries + siteID);
        this.isLoading = true;
        await axios.get(URL.travelDeskCountries + siteID, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("Travel Desk country Response  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status.Code === 200 && data.hasOwnProperty('Data')) {
                    this.Countries = data.Data;
                    if (data.Data.length === 0) {
                        Alert.show(this.adhocType, "No country available for your site");
                        // this.navigation.goBack();
                    }
                    if (data.Data.length === 1) {
                        this.countrySelected = data.Data[0].Name;
                    } else {
                        this.setCountry(Select);
                    }
                } else if (data.Description) {
                    Alert.show(this.adhocType, data.Description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }

            });
            return new Promise.resolve();
        }).catch(error => {
            console.warn('Error --> ', error);
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getCostCenters() {
        var siteID = this.findSiteID(this.siteSelected, this.Sites);
        if (siteID == 0) {
            return;
        }
        console.warn('Travel desk CostCenter ', URL.travelDeskCostCenters + siteID);
        this.isLoading = true;
        await axios.get(URL.travelDeskCostCenters + siteID, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("Travel Desk CostCenter Response  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status.Code === 200 && data.hasOwnProperty('Data')) {
                    this.CostCenters = data.Data;
                    if (data.Data.length === 0) {
                        Alert.show(this.adhocType, "No cost center available for your site");
                        // this.navigation.goBack();
                    }
                    if (data.Data.length === 1) {
                        this.selectedCostCenter = data.Data[0].Name;
                    } else {
                        this.setTDCostCenter({ Name: Select })
                    }
                } else if (data.Description) {
                    Alert.show(this.adhocType, data.Description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }

            });
            return new Promise.resolve();
        }).catch(error => {
            console.warn('Error --> ', error);
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getLocations() {
        var siteID = this.findSiteID(this.siteSelected, this.Sites);
        if (siteID == 0) {
            return;
        }
        var programID = this.findProgramID(this.programSelected, this.Programs);
        if (programID == 'NA') {
            return
        }
        console.warn('Travel desk Locations ', URL.travelDeskLocations + siteID + programID);
        this.isLoading = true;
        await axios.get(URL.travelDeskLocations + siteID + '&programId=' + programID, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("Travel Desk Locations Response  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status.Code === 200 && data.hasOwnProperty('Data')) {
                    if (data.Data) {
                        this.SourceLocations = data.Data.FromLocations;
                        this.DestinationLocations = data.Data.ToLocations;
                    }
                } else if (data.Description) {
                    Alert.show(this.adhocType, data.Description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }

            });
            return new Promise.resolve();
        }).catch(error => {
            console.warn('Error --> ', error);
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getAirportLocations() {
        var siteID = this.findSiteID(this.siteSelected, this.Sites);
        if (siteID == 0) {
            return;
        }
        this.isLoading = true;
        await axios.get(URL.travelDeskAirportLocations + siteID, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("Travel Desk AirportLocations Response  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status.Code === 200 && data.hasOwnProperty('Data')) {
                    if (data.Data) {
                        this.AirportLocations = data.Data;
                    }
                } else if (data.Description) {
                    Alert.show(this.adhocType, data.Description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }

            });
            return new Promise.resolve();
        }).catch(error => {
            console.warn('Error --> ', error);
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getOffices() {
        // var siteID = this.findSiteID(this.siteSelected, this.Sites);
        // if (siteID == 0) {
        //     return;
        // }
        // var programID = this.findProgramID(this.programSelected, this.Programs);
        // if (programID == 'NA') {
        //     return
        // }
        this.isLoading = true;
        await axios.get(URL.AdHoc_Offices, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("Travel Desk Offices Response  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.status.code === 200 && data.hasOwnProperty('data')) {
                    if (data.data) {
                        this.Offices = data.data;
                    }
                } else if (data.description) {
                    Alert.show(this.adhocType, data.description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }
            });
            return new Promise.resolve();
        }).catch(error => {
            console.warn('Error --> ', error);
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getEmployeeLocation_(_locationType, _tripType) {
        this.isLoading = true;

        await axios.post(URL.travelDeskEmployeeLocation + _locationType + '&tripType=' + _tripType, _waypoints, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("Travel Desk distance  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status.Code === 200 && data.Data) {
                } else if (data.Description) {
                    Alert.show(this.adhocType, data.Description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }
            });
            return new Promise.resolve();
        }).catch(error => {
            console.warn('Error --> ', error);
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }

    @action
    async getEmployeeLocation(_locationType, _tripType) {
        // this.isLoading = true;
        const response = await axios.get(URL.travelDeskEmployeeLocation + _locationType + '&tripType=' + _tripType, {
            headers: this.getHeader()
        });
        // this.isLoading = false;
        console.warn('getEmployeeLocation res - ', response);
        return response;
    }

    @action
    async getTravelTimeDistance() {
        this.isLoading = true;

        const datetime = this.dateSelected + " " + this.timeSelected;
        const shiftDateTime = moment(datetime, 'DD MMM YYYY HH:mm').toISOString();
        let _waypoints = [];
        if (this.tdWayPoints && this.tdWayPoints.length > 0) {
            this.tdWayPoints.forEach(wp => {
                _waypoints.push({
                    Latitude: wp.Latitude,
                    Longitude: wp.Longitude,
                    Shifttime: shiftDateTime
                });
            })
        } else {
            this.isLoading = false;
            return;
        }
        await axios.post(URL.travelDeskTimeDistance, _waypoints, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                console.warn("Travel Desk distance  " + JSON.stringify(response));
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                if (data.Status.Code === 200 && data.hasOwnProperty('Data')) {
                    if (data.Data) {
                        this.travelDistanceKm = data.Data.Distance;
                        this.travelTimeHM = data.Data.Time;
                    }
                } else if (data.Description) {
                    Alert.show(this.adhocType, data.Description);
                } else {
                    Alert.show(this.adhocType, loginString.somethingWentWrong);
                }
            });
            return new Promise.resolve();
        }).catch(error => {
            console.warn('Error --> ', error);
            if (error) {
                console.warn("Error " + JSON.stringify(error));
                this.isLoading = false;
                Alert.show(this.adhocType, loginString.somethingWentWrong);
            }
            return new Promise.reject(error);
        });
    }
}

export default new AdhocStore();
