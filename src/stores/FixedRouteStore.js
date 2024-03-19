import {action, computed, makeAutoObservable, observable, runInAction} from 'mobx';
import {Alert, Platform} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {URL} from "../network/apiConstants";
import {asyncString, noShow, noShow as noshow, Select} from "../utils/ConstantString";
import * as Alert1 from "../utils/Alert";
import {StackActions} from "@react-navigation/native";
import moment from "moment";
import {colors} from "../utils/Colors";
import {handleResponse} from "../network/apiResponse/HandleResponse";
import {showMessage} from "react-native-flash-message";
import NavigationService from "../utils/NavigationService";
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

class FixedRouteStore {

    accessToken = '';
    userId = '';
    customerUrl = '';
    idleTimeOutInMins = '';
    isRosterOptOutEnabled = '';
    disclaimerType = '';
    @observable isLoading;
    @observable EligibleRosterDays = 0;
    @observable AvailableRosters = [];
    @observable Locations;
    @observable LoginLocations = [];
    @observable LogoutLocations = [];
    @observable Offices;
    @observable Rosters = [];
    @observable LoginRoutes = [];
    @observable LogoutRoutes = [];
    @observable LoginShifts = [];
    @observable LogoutShifts = [];
    @observable DefaultOffice;
    @observable LoginCutoffMinutes;
    @observable LogoutCutoffMinutes;
    @observable markedDatesArray;
    @observable selectedRoster = {};
    @observable RosterDate = '';
    @observable maxDate;
    @observable minDate;
    @observable startDate;
    @observable endDate;
    @observable toDate="Select";
    @observable fromDate="Select";
    @observable bookingDates = [];
    @observable PassDates = [];
    @observable PassTrips = {};
    @observable displayBookingDates = '';
    @observable fixedRouteDetail = {};
    @observable defaultSelection = {};
    @observable setFRDefault = false;

    constructor() {
        makeAutoObservable(this)
    }

    isSelected(value: string): boolean {
        return !!(value && value !== "" && value !== "Select");
    }

    @action setAsDefault() {
        this.setFRDefault = !this.setFRDefault;
    }

    @action setPassDates(_passDates) {
        console.warn('setPassDates - ', _passDates);
        if (_passDates) {
            this.PassDates = _passDates;
        } else {
            this.PassDates = [];
        }
    }

    @computed get computedPassDates() {
        let dates = {};
        let _loginCount = 0;
        let _logoutCount = 0;
        let _cancelCount = 0;
        console.warn('computedPassDates - ', this.PassDates);
        if (this.PassDates && this.PassDates.length > 0) {
            const login = {key: 'login', color: 'green'};
            const logout = {key: 'logout', color: 'blue'};
            const cancel = {key: 'cancel', color: 'red'};
            this.PassDates.map(_pass => {
                if (_pass) {
                    var _dots = [];
                    if (_pass.loginTime == "00:00") {
                        _loginCount += 1;
                        _dots.push(login)
                    } else if (_pass.loginTime != "") {
                        _cancelCount += 1;
                        _dots.push(cancel)
                    }
                    if (_pass.logoutTime == "00:00") {
                        _logoutCount += 1;
                        _dots.push(logout)
                    } else if (_pass.logoutTime != "") {
                        _cancelCount += 1;
                        _dots.push(cancel)
                    }
                    dates[_pass.date] = {dots: _dots, disableTouchEvent: true, selected: true, selectedColor: colors.BACKGROUND, selectedTextColor: colors.BLACK} 
                }
            });
            this.PassTrips = {
                login: _loginCount,
                logout: _logoutCount,
                cancelled: _cancelCount
            }
            return Object.assign(dates);
        } else {
            return []
        }
    }

    @computed get computedMarkedDates() {
        let dates = {};
        if (this.AvailableRosters && this.AvailableRosters.length > 0) {
            //         '2023-05-15': {dots: [vacation, massage], selected: true, selectedColor: 'green'},
            //         '2023-05-16': {dots: [vacation], selected: true, selectedColor: 'blue'},
            const login = {key: 'login', color: 'green'};
            const logout = {key: 'logout', color: 'blue'};
            this.AvailableRosters.map(_roster => {
                if (_roster) {
                    var _customStyles = {};
                    if (_roster.Date === moment().format("YYYY-MM-DD")) {
                        _customStyles = {
                            container: {
                                backgroundColor: '#32B77E33',
                                borderWidth: 1,
                                borderColor: colors.GREEN,
                                color: colors.BLACK
                            }
                        }
                    }
                    var _dots = [];
                    if (_roster.LoginTime != "") {
                        _dots.push(login)
                    }
                    if (_roster.LogoutTime != "") {
                        _dots.push(logout)
                    }
                    console.warn('dots - ', _dots);
                    dates[_roster.Date] = {dots: _dots, selected: true, selectedColor: colors.BACKGROUND, selectedTextColor: colors.BLACK} // disableTouchEvent: true, 
                    if (_customStyles.container) {
                        dates[_roster.Date]["customStyles"] = _customStyles;
                    }
                }
            });
            return Object.assign(dates);
        } else {
            return {}
        }
    }

    @action
    async getSelectedDateRoster(selectedDates, _loginDisabled, _logoutDisabled) {
        console.warn('selectedDates, _loginDisabled, _logoutDisabled = ', selectedDates, _loginDisabled, _logoutDisabled);
        this.isLoading = true;
        // runInAction(() => {

            this.bookingDates = this.sortDates(selectedDates);
            this.displayBookingDates = this.formatDates(this.bookingDates);
            console.warn("Seleced Dates sorted  " + JSON.stringify(this.bookingDates));
            let startDate = this.bookingDates[0];
            let endDate = this.bookingDates[this.bookingDates.length - 1];
            this.fromDate = moment(startDate).format('YYYY-MM-DD');
            this.toDate = moment(endDate).format('YYYY-MM-DD');
            this.RosterDate = moment(endDate).format('YYYY-MM-DD');
            // let range = moment.range(startDate, endDate);
    
            await this.getRosterDetails(this.fromDate, _loginDisabled, _logoutDisabled);

            // if (startDate === endDate) {
            //     prevDays = true;
            //     let parsedDate = moment(startDate).format("YYYY-MM-DD");
            //     let currentDay = moment().format("YYYY-MM-DD");
            //     isViewModify = moment(parsedDate).isBefore(currentDay);
            // } else {
            //     prevDays = true;
            //     isViewModify = false;
            // }
    
            // // let WeekdaysAllowed = "0|1|2|3|4|5|6";
            // let newLoginShifts = [];
            // let newLogoutShifts = [];
            // // let selectedDaysinNumber = [];
            // // selectedDaysinNumber.push(weeklyOffDaysToNumber[moment().format("dddd")]);
            // // console.warn("selectedDaysinNumber = ", selectedDaysinNumber);
    
            // for (let k = 0; k < this.Rosters.length; k++) {
            //     let LoginShiftsArray = this.Rosters[k].LoginShifts.split("|");
            //     let LogoutShiftsArray = this.Rosters[k].LogoutShifts.split("|");
            //     newLoginShifts = [...newLoginShifts, ...LoginShiftsArray];
            //     newLogoutShifts = [...newLogoutShifts, ...LogoutShiftsArray];
            // }
            // console.warn('newLoginShifts - ', newLoginShifts);
            // console.warn('newLogoutShifts - ', newLogoutShifts);

            // // newLoginShifts = this.calculateShiftTime(range, newLoginShifts.sort(), WeekdaysAllowed);
            // // newLogoutShifts = this.calculateShiftTime(range, newLogoutShifts.sort(), WeekdaysAllowed);
            // newLoginShifts = this.buildShiftTime(newLoginShifts.sort());
            // newLogoutShifts = this.buildShiftTime(newLogoutShifts.sort());

            // console.warn(' newLoginShifts ', newLoginShifts);
            // console.warn(' newLogoutShifts ', newLogoutShifts);
            
            // this.LoginShifts = newLoginShifts; // + "|Select";
            // this.LogoutShifts = newLogoutShifts; // + "|Select";
    
            // // this.LoginShifts = "";
            // // this.LogoutShifts = "";

            this.selectedRoster = {
                loginSelected: this.getLoginTime(_loginDisabled),
                logoutSelected: this.getLogoutTime(_logoutDisabled),
                pickupLocationSelected: this.getLoginNodal(_loginDisabled),
                dropLocationSelected: this.getLogoutNodal(_logoutDisabled),
                loginLocationObject: this.getLoginNodal(_loginDisabled, true),
                logoutLocationObject: this.getLogoutNodal(_logoutDisabled, true),
                officeLoginSelected: this.getLoginOffice(_loginDisabled),
                officeLogoutSelected: this.getLogoutOffice(_logoutDisabled),
                loginOfficeObject: this.getLoginOffice(_loginDisabled, true),
                logoutOfficeObject: this.getLogoutOffice(_logoutDisabled, true),
                loginRouteSelected: this.getLoginRoute(_loginDisabled),
                logoutRouteSelected: this.getLogoutRoute(_logoutDisabled),
                loginRouteObject: this.getLoginRoute(_loginDisabled, true),
                logoutRouteObject: this.getLogoutRoute(_logoutDisabled, true),
                anyChangeInDataLogin: this.anyChangeInLogin(_loginDisabled),
                anyChangeInDataLogout: this.anyChangeInLogout(_logoutDisabled),
                loginDisabled: _loginDisabled,
                logoutDisabled: _logoutDisabled,
            };
            this.setFRDefault = false;
            this.isLoading = false;
            console.warn('SR --- ', this.selectedRoster);
            return;
    }

    getLoginOffice(loginDisabled, isretobj) {
        if (loginDisabled) return isretobj ? {} : "Select";
        if (this.defaultSelection.LoginOfficeID > 0) {
            return isretobj ? this.findObject(this.defaultSelection.LoginOfficeID, this.Offices) : this.findName(this.defaultSelection.LoginOfficeID, this.Offices);
        } else {
            return isretobj ? {} : "Select";
        }
    }

    getLogoutOffice(logoutDisabled, isretobj) {
        if (logoutDisabled) return isretobj ? {} : "Select";
        if (this.defaultSelection.LogoutOfficeID > 0) {
            return isretobj ? this.findObject(this.defaultSelection.LogoutOfficeID, this.Offices) : this.findName(this.defaultSelection.LogoutOfficeID, this.Offices);
        } else {
            return isretobj ? {} : "Select";
        }
    }

    getLoginNodal(loginDisabled, isretobj) {
        if (loginDisabled) return isretobj ? {} : "Select";
        if (this.defaultSelection.LoginNodalPoint > 0) {
            console.warn('getLoginNodal - ', this.defaultSelection.LoginNodalPoint, this.LoginLocations);
            return isretobj ? this.findObject(this.defaultSelection.LoginNodalPoint, this.LoginLocations) : this.findName(this.defaultSelection.LoginNodalPoint, this.LoginLocations);
        } else {
            return isretobj ? {} : "Select";
        }
    }

    getLogoutNodal(logoutDisabled, isretobj) {
        if (logoutDisabled) return isretobj ? {} : "Select";
        if (this.defaultSelection.LogoutNodalPoint > 0) {
            return isretobj ? this.findObject(this.defaultSelection.LogoutNodalPoint, this.LogoutLocations) : this.findName(this.defaultSelection.LogoutNodalPoint, this.LogoutLocations);
        } else {
            return isretobj ? {} : "Select";
        }
    }

    getLoginTime(loginDisabled) {
        if (loginDisabled) return "Select";
        return this.defaultSelection.LoginTime?.length > 0 ? this.defaultSelection.LoginTime : "Select";
    }

    getLogoutTime(logoutDisabled) {
        if (logoutDisabled) return "Select";
        return this.defaultSelection.LogoutTime?.length > 0 ? this.defaultSelection.LogoutTime : "Select";
    }

    getLoginRoute(loginDisabled, isretobj, fromList) {
        if (loginDisabled) return isretobj ? {} : "Select";
        if (this.defaultSelection.LoginRouteID > 0 && this.LoginRoutes?.length > 0) {
            return isretobj ? this.findRoute(this.defaultSelection.LoginRouteID, this.LoginRoutes) : this.findRouteName(this.defaultSelection.LoginRouteID, this.LoginRoutes);
        } else if (this.defaultSelection.LoginRouteName?.length > 0) {
            return fromList ? "Select" : this.defaultSelection.LoginRouteName;
        } else {
            return isretobj ? {} : "Select";
        }
    }

    getLogoutRoute(logoutDisabled, isretobj, fromList) {
        if (logoutDisabled) return isretobj ? {} : "Select";
        if (this.defaultSelection.LogoutRouteID > 0 && this.LogoutRoutes?.length > 0) {
            return isretobj ? this.findRoute(this.defaultSelection.LogoutRouteID, this.LogoutRoutes) : this.findRouteName(this.defaultSelection.LogoutRouteID, this.LogoutRoutes);
        } else if (this.defaultSelection.LogoutRouteName?.length > 0) {
            return fromList ? "Select" : this.defaultSelection.LogoutRouteName;
        } else {
            return isretobj ? {} : "Select";
        }
    }

    anyChangeInLogin(loginDisabled) {
        if (loginDisabled) return false;
        return this.defaultSelection.LoginTime?.length > 0 ? true : false;
    }

    anyChangeInLogout(logoutDisabled) {
        if (logoutDisabled) return false;
        return this.defaultSelection.LogoutTime?.length > 0 ? true : false;
    }

    buildShiftTime(shiftTimes) {
        let shiftTimeNew = [];
        shiftTimes.forEach(shiftTime => {
            shiftTimeNew.push(shiftTime.split(",")[0]); //  + ",0,D"
        })
        let removeDuplicate = [...new Set(shiftTimeNew)];
        console.warn('removeDuplicate ', removeDuplicate);
        return removeDuplicate.join("|");
    }

    calculateShiftTime(range, shiftTimes, WeekdaysAllowed) {
        console.warn('range, shiftTimes, WeekdaysAllowed - ', range, shiftTimes, WeekdaysAllowed);
        let shiftTimeNew = [];
        if (!shiftTimes) return "";
        const currentDate = moment().format("YYYY-MM-DD HH:mm");
        const ignoreShiftArray = [];
        for (let day of range.by("days")) {
            const selectedDate = day.format("YYYY-MM-DD");
            console.warn('selectedDate ---- ', selectedDate);
            shiftTimes.map(shiftTime => {
                let originalDate = moment(
                    selectedDate + " " + shiftTime.split(",")[0],
                    "YYYY-MM-DD HH:mm"
                ).format("YYYY-MM-DD HH:mm");
                console.warn('originalDate ---- ', originalDate);
                let calculatedDateWithCutOff = moment(
                    selectedDate + " " + shiftTime.split(",")[0],
                    "YYYY-MM-DD HH:mm"
                )
                    .subtract(shiftTime.split(",")[1], "m") //Confused Add or Subtract
                    .format("YYYY-MM-DD HH:mm");
                console.warn('calculatedDateWithCutOff ---- ', calculatedDateWithCutOff);
                let dateWithCutOffNextDay = shiftTime.split(",")[0].includes("*")
                    ? moment(calculatedDateWithCutOff)
                        .add(24, "hours")
                        .format("YYYY-MM-DD HH:mm")
                    : calculatedDateWithCutOff;
    
                    console.warn('dateWithCutOffNextDay ---- ', dateWithCutOffNextDay);
                if (moment(dateWithCutOffNextDay).isSameOrAfter(currentDate)) {
                    console.warn('isSameOrAfter');
                    if (
                        WeekdaysAllowed.includes(
                            moment(originalDate)
                                .day()
                                .toString()
                        )
                    ) {
                        console.warn('allowed day');
                        if (shiftTime.split(",")[0]) {
                            console.warn('shiftTime - ', shiftTime);
                            if (isViewModify & prevDays) {
                                console.warn('isViewModify & prevDays');
                                if (shiftTime.includes("*"))
                                    shiftTimeNew.push(shiftTime.split(",")[0] + ",0,D");
                            } else {
                                console.warn('ELSE');
                                shiftTimeNew.push(shiftTime.split(",")[0] + ",0,D");
                            }
                        }
                    }
                }
            });
        }
        console.warn('shiftTimeNew ', shiftTimeNew);
        let removeDuplicate = [...new Set(shiftTimeNew)];
        console.warn('removeDuplicate ', removeDuplicate);
        // console.warn("Shift Time->" + JSON.stringify(removeDuplicate));
        return removeDuplicate.join("|");
        // return shiftTimeNew.join("|"); //filteredShiftTime(shiftTimes, ignoreShiftArray);
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

    @action
    async getRosterDetails(_selectedDate, _loginDisabled, _logoutDisabled) {
        
        this.LoginLocations = [];
        this.LogoutLocations = [];
        this.LoginShifts = [];
        this.LogoutShifts = [];
        this.LoginRoutes = [];
        this.LogoutRoutes = [];

        await axios.get(URL.GET_FIXED_ROUTE_ROSTER_DETAILS + _selectedDate, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(() => {
                let data = response.data;
                console.warn('GET_FIXED_ROUTE_ROSTER_DETAILS - ', data);
                
                // if (!response || response.status === 401) {
                //     handleResponse.expireSession(context);
                //     return;
                // }
                try {
                    if (data.Status.Code === 200) {
                        this.rosterDetails = data.Data;
                        
                        this.Rosters = data.Data.Rosters;
                        this.Locations = data.Data.Locations;
                        this.Offices = data.Data.Offices;
                        this.LoginCutoffMinutes = data.Data.LoginCutOff;
                        this.LogoutCutoffMinutes = data.Data.LogoutCutOff;

                        this.defaultSelection = {
                            LoginOfficeID: data.Data.LoginOfficeID,
                            LogoutOfficeID: data.Data.LogoutOfficeID,
                            LoginNodalPoint: data.Data.LoginNodalPoint,
                            LogoutNodalPoint: data.Data.LogoutNodalPoint,
                            LoginTime: data.Data.LoginTime,
                            LogoutTime: data.Data.LogoutTime,
                            LoginRouteID: data.Data.LoginRouteID,
                            LogoutRouteID: data.Data.LogoutRouteID,
                            LoginRouteName: data.Data.LoginRouteName,
                            LogoutRouteName: data.Data.LogoutRouteName
                        }
                        console.warn('Default Selection - ', this.defaultSelection);

                        if (this.defaultSelection.LoginOfficeID > 0 && !_loginDisabled) {
                            this.selectedRoster.officeLoginSelected = this.getLoginOffice(_loginDisabled);
                            this.selectedRoster.loginOfficeObject = this.getLoginOffice(_loginDisabled, true);

                            this.buildLocations(
                                this.defaultSelection.LoginOfficeID,
                                "P"
                            )
                        }

                        if (this.defaultSelection.LogoutOfficeID > 0 && !_logoutDisabled) {
                            this.selectedRoster.officeLogoutSelected = this.getLogoutOffice(_logoutDisabled);
                            this.selectedRoster.logoutOfficeObject = this.getLogoutOffice(_logoutDisabled, true);
                            
                            this.buildLocations(
                                this.defaultSelection.LogoutOfficeID,
                                "D"
                            )
                        }

                        if (this.defaultSelection.LoginOfficeID > 0 && this.defaultSelection.LoginNodalPoint > 0 && !_loginDisabled) {
                            this.buildShiftTimes(
                                this.defaultSelection.LoginOfficeID,
                                this.defaultSelection.LoginNodalPoint,
                                "P"
                            )
                        }

                        if (this.defaultSelection.LogoutOfficeID > 0 && this.defaultSelection.LogoutNodalPoint > 0 && !_logoutDisabled) {
                            this.buildShiftTimes(
                                this.defaultSelection.LogoutOfficeID,
                                this.defaultSelection.LogoutNodalPoint,
                                "D"
                            )
                        }

                        if (this.defaultSelection.LoginOfficeID > 0 && this.defaultSelection.LoginNodalPoint > 0 && this.defaultSelection.LoginTime.length > 0 && !_loginDisabled) {
                            this.buildRoutesList(
                                this.defaultSelection.LoginOfficeID,
                                this.defaultSelection.LoginNodalPoint,
                                this.defaultSelection.LoginTime,
                                "P"
                            )
                        }

                        if (this.defaultSelection.LogoutOfficeID > 0 && this.defaultSelection.LogoutNodalPoint > 0 && this.defaultSelection.LogoutTime.length > 0 && !_logoutDisabled) {
                            this.buildRoutesList(
                                this.defaultSelection.LogoutOfficeID,
                                this.defaultSelection.LogoutNodalPoint,
                                this.defaultSelection.LogoutTime,
                                "D"
                            )
                        }
                        this.isLoading = false;
                    } else if (data.Status.Message) {
                        Alert1.show(null, data.Status.Message);
                        NavigationService.navigate(StackActions.popToTop())
                    } else {
                        this.isLoading = false;
                        Alert1.show("Fixed Route", "Something went wrong. Please try later.");
                    }
                } catch (error) {
                    console.warn("Err Fixed Route->" + error.message);
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
    async getBookedRosters(context) {
        await axios.get(URL.GET_FIXED_ROUTE_BOOKED_ROSTERS, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(() => {
                let data = response.data;
                console.warn('GET_FIXED_ROUTE_BOOKED_ROSTERS - ', data);
                this.isLoading = false;
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                try {
                    if (data.Status.Code === 200) {
                        this.AvailableRosters = data.Data.RosterDetails;
                        this.EligibleRosterDays = data.Data.EligibleRosterDays;
                    } else if (data.Status.Message) {
                        Alert1.show(null, data.Status.Message);
                        NavigationService.navigate(StackActions.popToTop())
                    } else {
                        Alert1.show("Fixed Route", "Something went wrong. Please try later.");
                    }
                } catch (error) {
                    console.warn("Err Fixed Route->" + error.message);
                    NavigationService.navigate(StackActions.popToTop())
                }
            });
        }).catch(async error => {
            if (error) {
                this.isLoading = false;
            }
        });
    }

    @action async getFixedRouteLocations(context) {
        await axios.get(URL.GET_WAY_POINTS, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(() => {
                let data = response.data;
                console.warn('GET_WAY_POINTS - ', data);
                this.isLoading = false;
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                try {
                    if (data.status.code === 200) {
                        console.warn('nodalPoints ', data.data.nodalPoints);
                        console.warn('officeLocations ', data.data.officeLocations);
                        // console.warn('fixedRoutes ', data.data.fixedRoutes);
                        this.Locations = data.data.nodalPoints;
                        this.Offices = data.data.officeLocations;
                        // this.DefaultOffice = data.DefaultOffice;
                    } else if (data.status.message) {
                        Alert1.show(null, data.status.message);
                        NavigationService.navigate(StackActions.popToTop())
                    } else {
                        Alert1.show("Fixed Route", "Something went wrong. Please try later.");
                    }
                } catch (error) {
                    console.warn("Err Fixed Route->" + error.message);
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
    async getFixedRoutesList(officeID, nodalPointId, shiftTime, tripType) {

        if (officeID == "Select" || nodalPointId == "Select" || shiftTime == "Select" || tripType == "") {
            return;
        }
// .split(',')[0]
        let _url = URL.GET_FIXED_ROUTES_LIST + `?OfficeLocationId=${officeID}&NodalPointId=${nodalPointId}&shiftTime=${shiftTime}&TripType=${tripType}`;
        console.warn('GET_FIXED_ROUTES_LIST - ', _url);

        this.isLoading = true;
        await axios.get(_url, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(() => {
                let data = response.data;
                console.warn('GET_FIXED_ROUTES_LIST - ', data);
                
                if (!response || response.status === 401) {
                    this.isLoading = false;
                    handleResponse.expireSession(context);
                    return;
                }
                try {
                    if (data.Status.Code === 200) {
                        if (tripType == 'P') {
                            this.LoginRoutes = data.Data;

                            // if (this.LoginRoutes.length > 0) {
                            //     this.LoginRoutes.push({
                            //         FixedRouteID: "Select",
                            //         FixedRouteName: "Select"
                            //     })
                            // }
                            if (this.selectedRoster.loginRouteSelected) {
                                this.selectedRoster.loginRouteSelected = this.getLoginRoute(false, false, true);
                                this.selectedRoster.loginRouteObject = this.getLoginRoute(false, true, true);
                            }
                        } else {
                            this.LogoutRoutes = data.Data;

                            // if (this.LogoutRoutes.length > 0) {
                            //     this.LogoutRoutes.push({
                            //         FixedRouteID: "Select",
                            //         FixedRouteName: "Select"
                            //     })
                            // }
                            if (this.selectedRoster.logoutRouteSelected) {
                                this.selectedRoster.logoutRouteSelected = this.getLogoutRoute(false, false, true);
                                this.selectedRoster.logoutRouteObject = this.getLogoutRoute(false, true, true);
                            }
                        }
                        this.isLoading = false;
                    } else if (data.Status.Message) {
                        Alert1.show(null, data.Status.Message);
                        NavigationService.navigate(StackActions.popToTop())
                    } else {
                        this.isLoading = false;
                        Alert1.show("Fixed Route", "Something went wrong. Please try later.");
                    }
                } catch (error) {
                    console.warn("Err Fixed Route->" + error.message);
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
    async getFixedRouteDetail(context) {
        this.isLoading = true;
        let body = {
            // FromDate: this.fromDate,
            // ToDate: this.toDate,
            SelectedDates: this.bookingDates,
            LoginOfficeLocationID: this.selectedRoster.loginOfficeObject?.ID,
            LogoutOfficeLocationID: this.selectedRoster.logoutOfficeObject?.ID,
            LoginNodalPointID: this.selectedRoster.loginLocationObject?.ID,
            LogoutNodalPointID: this.selectedRoster.logoutLocationObject?.ID,
            LoginTime: this.selectedRoster.loginSelected,
            LogoutTime: this.selectedRoster.logoutSelected,
            LoginFixedRouteID: this.selectedRoster.loginRouteObject?.RouteID,
            LogoutFixedRouteID: this.selectedRoster.logoutRouteObject?.RouteID
        }
        console.warn("body GET_FIXED_ROUTE_DETAILS - ", body);
        await axios.post(URL.GET_FIXED_ROUTE_DETAILSV2, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(() => {
                let data = response.data;
                console.warn('GET_FIXED_ROUTE_DETAILS - ', data);
                this.isLoading = false;
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                try {
                    if (data.Status.Code === 200) {
                        this.fixedRouteDetail = data.Data;
                    } else if (data.Status.Message) {
                        Alert1.show(null, data.Status.Message);
                    } else {
                        Alert1.show("Fixed Route", "Something went wrong. Please try later.");
                    }
                } catch (error) {
                    console.warn("Err Fixed Route->" + error.message);
                }
            });
        }).catch(async error => {
            if (error) {
                this.isLoading = false;
            }
        });
    }

    @action
    async cancelFixedRoutePass(context, _selectedDates, _type) {
        this.isLoading = true;
        let body = {
            SelectedDates: this.sortDates(_selectedDates).join("|"),
            TripType: _type
        }
        console.warn("body CANCEL_FIXED_ROUTE_PASS - ", body);
        await axios.post(URL.CANCEL_FIXED_ROUTE_PASS, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(() => {
                let data = response.data;
                console.warn('CANCEL_FIXED_ROUTE_PASS - ', data);
                this.isLoading = false;
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                try {
                    if (data.Status.Code === 200) {
                        Alert1.show(null, data.Status.Message);
                        // context.reloadData();
                        this.clearProps();
                        context.props.navigation.goBack();
                    } else if (data.Status.Message) {
                        Alert1.show(null, data.Status.Message);
                    } else {
                        Alert1.show("Fixed Route", "Something went wrong. Please try later.");
                    }
                } catch (error) {
                    console.warn("Err Fixed Route->" + error.message);
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
        if (this.selectedRoster.officeLoginSelected === office.Name) return;

        if (office.Name == "Select") {
            this.defaultSelection.LoginOfficeID = 0;
            this.defaultSelection.LoginNodalPoint = 0;
            this.defaultSelection.LoginTime = "";
            this.defaultSelection.LoginRouteID = 0;
            this.defaultSelection.LoginRouteName = "";
        }

        this.selectedRoster.officeLoginSelected = office.Name;
        this.selectedRoster.loginOfficeObject = office.Name == "Select" ? {} : office;
        this.selectedRoster.pickupLocationSelected = "Select";
        this.selectedRoster.loginLocationObject = {};
        this.selectedRoster.loginSelected = "Select";
        this.selectedRoster.loginRouteSelected = "Select";
        this.selectedRoster.loginRouteObject = {};
        this.selectedRoster.anyChangeInDataLogin = true;

        if (office.Name != "Select" ) this.buildLocations(office.ID, 'P');
    }

    @action
    updateLogOutOffice(office) {
        if (this.selectedRoster.officeLogoutSelected === office.Name) return;

        if (office.Name == "Select") {
            this.defaultSelection.LogoutOfficeID = 0;
            this.defaultSelection.LogoutNodalPoint = 0;
            this.defaultSelection.LogoutTime = "";
            this.defaultSelection.LogoutRouteID = 0;
            this.defaultSelection.LogoutRouteName = "";
        }

        this.selectedRoster.officeLogoutSelected = office.Name;
        this.selectedRoster.logoutOfficeObject = office.Name == "Select" ? {} : office;
        this.selectedRoster.dropLocationSelected = "Select";
        this.selectedRoster.logoutLocationObject = {};
        this.selectedRoster.logoutSelected = "Select";
        this.selectedRoster.logoutRouteSelected = "Select";
        this.selectedRoster.logoutRouteObject = {};
        this.selectedRoster.anyChangeInDataLogout = true;

        if (office.Name != "Select" ) this.buildLocations(office.ID, 'D');
    }

    @action
    updatePickUpAddress(location, name) {
        this.selectedRoster.pickupLocationSelected =name;
        this.selectedRoster.loginLocationObject = location;
        this.selectedRoster.anyChangeInDataLogin = true;

        this.buildShiftTimes(
            this.selectedRoster.loginOfficeObject.ID,
            this.selectedRoster.loginLocationObject?.ID,
            "P"
        )
        this.buildRoutesList(
            this.selectedRoster.loginOfficeObject.ID,
            this.selectedRoster.loginLocationObject?.ID,
            this.selectedRoster.loginSelected,
            "P"
        )
    }

    @action
    updateDropAddress(location,name) {
        this.selectedRoster.dropLocationSelected = name;
        this.selectedRoster.logoutLocationObject = location;
        this.selectedRoster.anyChangeInDataLogout = true;

        this.buildShiftTimes(
            this.selectedRoster.logoutOfficeObject.ID,
            this.selectedRoster.logoutLocationObject?.ID,
            "D"
        )
        this.buildRoutesList(
            this.selectedRoster.logoutOfficeObject.ID,
            this.selectedRoster.logoutLocationObject?.ID,
            this.selectedRoster.logoutSelected,
            "D"
        )
    }

    @action
    updateLoginShiftTime(shiftTime) {
        console.warn("updateLoginShiftTime "+JSON.stringify(shiftTime), ' - ', this.selectedRoster);
        this.selectedRoster.loginSelected = shiftTime;
        this.selectedRoster.anyChangeInDataLogin = true;
        
        this.buildRoutesList(
            this.selectedRoster.loginOfficeObject.ID,
            this.selectedRoster.loginLocationObject?.ID,
            shiftTime,
            "P"
        )
    }

    @action
    updateLogOutShiftTime(shiftTime) {
        console.warn("updateLogOutShiftTime "+JSON.stringify(shiftTime));
        this.selectedRoster.logoutSelected = shiftTime;
        this.selectedRoster.anyChangeInDataLogout = true;

        this.buildRoutesList(
            this.selectedRoster.logoutOfficeObject.ID,
            this.selectedRoster.logoutLocationObject?.ID,
            shiftTime,
            "D"
        )
    }

    @action
    updateLoginRoute(route) {
        this.selectedRoster.loginRouteSelected = route.RouteName;
        this.selectedRoster.loginRouteObject = route;
        this.selectedRoster.anyChangeInDataLogin = true;
    }

    @action
    updateLogoutRoute(route) {
        this.selectedRoster.logoutRouteSelected = route.RouteName;
        this.selectedRoster.logoutRouteObject = route;
        this.selectedRoster.anyChangeInDataLogout = true;
    }

    buildLocations(_officeID, _type) {
        let _locations = []
        let _shifts = this.rosterDetails.ActiveShifts.filter(_data => (_data.OfficeID == _officeID && _data.TripType == _type));
        if (_shifts) {
            console.warn('_shifts - ', _shifts);
            const filteredData = _shifts.filter((shift, index, self) =>
                self.findIndex(_self => _self.NodalID === shift.NodalID) === index //  && _self.Name === shift.Name
            );
            console.warn('filteredData - ', filteredData);
            console.warn('this.rosterDetails.Locations - ', this.rosterDetails.Locations);
            filteredData.forEach(_data => {
                var _nodal = this.rosterDetails.Locations.find(_location => (parseInt(_location.ID) === _data.NodalID));
                console.warn('_nodal -> ', _nodal);
                if (_nodal) {
                    _locations.push(_nodal);
                }
            });
            if (_locations.length > 0) {
                _locations.sort(this.dynamicSort("Name"));
                // this.Locations.sort((a, b) => (a.Name > b.Name) ? 1 : ((b.Name > a.Name) ? -1 : 0));
            }
        }
        console.warn('_Locations - ', _locations);
        if (_type == 'P') {
            this.LoginLocations = _locations;
            if (this.LoginLocations.length == 1) {
                this.updatePickUpAddress(this.LoginLocations[0], this.LoginLocations[0].Name);
            }
        } else {
            this.LogoutLocations = _locations;
            if (this.LogoutLocations.length == 1) {
                this.updateDropAddress(this.LogoutLocations[0], this.LogoutLocations[0].Name);
            }
        }
    }

    buildShiftTimes(_officeID, _nodalID, _type) {
        let shiftTimes = []
        let _shifts = this.rosterDetails.ActiveShifts.filter(_data => (_data.OfficeID == _officeID && _data.NodalID == _nodalID && _data.TripType == _type));
        if (_shifts) {
            console.warn('_shifts - ', _shifts);
            const filteredData = _shifts.filter((shift, index, self) =>
                self.findIndex(_self => _self.ShiftTime === shift.ShiftTime) === index
            );
            console.warn('filteredData - ', filteredData);
            filteredData.forEach(_data => {
                shiftTimes.push(_data.ShiftTime);
            });
        }
        console.warn('_shiftTimes - ', shiftTimes);
        let removeDuplicate = [...new Set(shiftTimes.sort())];
        console.warn('removeDuplicate ', removeDuplicate);
        if (_type == 'P') {
            this.LoginShifts = removeDuplicate.join("|");
            let shifts = this.LoginShifts.split("|");
            if (shifts.length == 1) {
                this.updateLoginShiftTime(shifts[0]);
            }
        } else {
            this.LogoutShifts = removeDuplicate.join("|"); 
            let shifts = this.LogoutShifts.split("|");
            if (shifts.length == 1) {
                this.updateLogOutShiftTime(shifts[0]);
            }  
        }
    }

    buildRoutesList(_officeID, _nodalID, _shiftTime, _type) {
        console.warn('buildRoutesList -> ', _officeID, _nodalID, _shiftTime, _type);
        let routesList = []
        let _routes;
        if (_shiftTime != Select) {
            _routes = this.rosterDetails.ActiveShifts.filter(_data => (_data.OfficeID == _officeID && _data.NodalID == _nodalID && _data.ShiftTime == _shiftTime && _data.TripType == _type));
        } else {
            _routes = this.rosterDetails.ActiveShifts.filter(_data => (_data.OfficeID == _officeID && _data.NodalID == _nodalID && _data.TripType == _type));
        }
        if (_routes) {
            console.warn('_routes - ', _routes);
            const filteredData = _routes.filter((route, index, self) =>
                self.findIndex(_self => _self.FixedRouteID === route.FixedRouteID) === index
            );
            console.warn('filteredData - ', filteredData);
            console.warn('this.rosterDetails.routes - ', this.rosterDetails.Routes);
            filteredData.forEach(_data => {
                var _route = this.rosterDetails.Routes.find(_rout => (parseInt(_rout.RouteID) === _data.FixedRouteID));
                if (_route) {
                    routesList.push(_route);
                }
            });
            if (routesList.length > 0) {
                routesList.sort(this.dynamicSort("RouteName"));
            }
            console.warn('routesList => ', routesList);
        }
        if (_type == 'P') {
            this.LoginRoutes = routesList;
            if (this.LoginRoutes.length == 1) {
                this.updateLoginRoute(this.LoginRoutes[0]);
            } else if (this.selectedRoster.loginRouteSelected) {
                this.selectedRoster.loginRouteSelected = this.getLoginRoute(false, false, true);
                this.selectedRoster.loginRouteObject = this.getLoginRoute(false, true, true);
            }
        } else {
            this.LogoutRoutes = routesList;
            if (this.LogoutRoutes.length == 1) {
                this.updateLogoutRoute(this.LogoutRoutes[0]);
            } else if (this.selectedRoster.logoutRouteSelected) {
                this.selectedRoster.logoutRouteSelected = this.getLogoutRoute(false, false, true);
                this.selectedRoster.logoutRouteObject = this.getLogoutRoute(false, true, true);
            }
        }
    }

    @action
    async generatePass(context) {
        if (this.isLoading) return;

        this.isLoading = true;
        let date = moment(this.RosterDate).format("DD-MMM");
        console.warn('login --- ', this.isSelected(this.selectedRoster.loginSelected));
        console.warn('logout --- ', this.isSelected(this.selectedRoster.logoutSelected));
        let updateBody = {
            SelectedDates: this.bookingDates.join("|"),
            LoginOfficeID: this.selectedRoster.loginOfficeObject.ID,
            LogoutOfficeID: this.selectedRoster.logoutOfficeObject.ID,
            LoginNodalPoint: this.selectedRoster.loginLocationObject.ID,
            LogoutNodalPoint: this.selectedRoster.logoutLocationObject.ID,
            LoginTime: this.isSelected(this.selectedRoster.loginSelected) ? this.selectedRoster.loginSelected : undefined,
            LogoutTime: this.isSelected(this.selectedRoster.logoutSelected) ? this.selectedRoster.logoutSelected : undefined,
            LoginRouteID: this.selectedRoster.loginRouteObject.RouteID,
            LogoutRouteID: this.selectedRoster.logoutRouteObject.RouteID,
            LoginCutOff: this.LoginCutoffMinutes,
            LogoutCutOff: this.LogoutCutoffMinutes,
            SetAsDefault: this.setFRDefault ? 1 : 0
        };
        console.warn(" Request Body pass - "+JSON.stringify(updateBody));
        return this.updateApiCall(context, updateBody);
    }

    clearProps(){
        this.selectedRoster={};
        this.AvailableRosters = [];
        this.fromDate = '';
        this.toDate = '';
        this.bookingDates = [];
        this.displayBookingDates = '';
        this.Locations;
        this.Offices;
        this.Rosters = [];
        this.LoginRoutes = [];
        this.LogoutRoutes = [];
        this.LoginShifts = [];
        this.LogoutShifts = [];
        this.DefaultOffice;
        this.LoginCutoffMinutes;
        this.LogoutCutoffMinutes;
        this.markedDatesArray;
        this.RosterDate = '';
        this.maxDate;
        this.minDate;
        this.startDate;
        this.endDate;
        this.fixedRouteDetail = {};
        this.setFRDefault = false;
    }

    async updateApiCall(context, updateBody) {
        this.isLoading = true;
        await axios.post(URL.SAVE_GENERATE_PASS, updateBody, {
            headers: this.getHeader()
        }).then(async response => {
            this.isLoading = false;
            await runInAction(() => {
                if (!response || response.status === 401) {
                    handleResponse.expireSession(context);
                    return;
                }
                let data = response.data;
                console.warn('SAVE_GENERATE_PASS res -> ', data);
                if (!data) return;
                if (data.Status.Code === 200) {
                    Alert.alert(
                        "Fixed Route",
                        data.Status.Message,
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    setTimeout(() => {
                                        this.clearProps();
                                        context.props.navigation.reset({ routes: [{ name: "Home" }] });
                                    }, 100);
                                },
                            }
                        ]
                    )
                } else if (data.Status.Code === 400) {
                    Alert.alert(
                        "Fixed Route",
                        data.Status.Message,
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                },
                                style: 'cancel',
                            },
                        ]
                    )
                } else if (data.Status.Message) {
                    let description = JSON.parse(JSON.stringify(data.Status.Message));
                    if (Platform.OS === "ios") {
                        showMessage({
                            message: "Fixed Route",
                            type: "warning",
                            description: description.split("|").join("\n\n"),
                            onPress: () => {
                            }
                        });
                    } else {
                        Alert1.show("Fixed Route", description.split("|").join("\n\n"));
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
                this.getBookedRosters(context);
            }
        );
    }

    sortDates(selectedDates) {
        return selectedDates.sort((date1, date2) => {
            var dA = new Date(date1);
            var dB = new Date(date2);
            console.warn('A B --- ', dA, dB);
            return dA - dB;
        });
    }

    formatDates(selectedDates) {
        if (selectedDates.length == 0) {
            return '';
        } else if (selectedDates.length > 1) {
            var formatdates = '';
            selectedDates.forEach(date => {
                if (formatdates) {
                    formatdates += ', '
                }
                formatdates += moment(date, "YYYY-MM-DD").format("DD MMM");
            });
            return formatdates;
        } else {
            return moment(selectedDates[0], "YYYY-MM-DD").format("DD MMM YYYY");
        }
    }

    findRouteName(id, array) {
        console.warn('findRouteName(id, array) - ', id, array);
        if (!array || !id) return undefined;
        const result = array.find(x => x.RouteID === id);
        console.warn('RES - ', result);
        return result ? result.RouteName : "Select";
    }

    findRoute(id, array) {
        if (!array || !id) return undefined;
        return array.find(x => x.RouteID === id);
    }

    findName(id, array) {
        console.warn('findName(id, array) - ', id, array);
        if (!array || !id) return undefined;
        let ids = id.toString().trim();
        const result = array.find(x => x.ID.toString().trim() === ids);
        return result.Name;
    }

    findID(name, array) {
        if (!array || !name) return undefined;
        name = name.toString().trim();
        const result = array.find(x => x.Name.toString().trim() === name);
        return result.ID;
    }

    findObject(id, array) {
        if (!array || !id) return undefined;
        // if (id == "Select") return {};
        let ids = id.toString().trim();
        return array.find(x => x.ID.toString().trim() === ids);
    }

    dynamicSort(property) {
        var sortOrder = 1;
        return function (a,b) {
            /* next line works with strings and numbers, 
             * and you may want to customize it to your needs
            (a, b) => (a.Name > b.Name) ? 1 : ((b.Name > a.Name) ? -1 : 0)
             */
            var result = (a[property] > b[property]) ? 1 : ((b[property] > a[property]) ? -1 : 0);
            return result * sortOrder;
        }
    }
}

export default new FixedRouteStore;
