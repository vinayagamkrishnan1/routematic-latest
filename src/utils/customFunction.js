import {extendMoment} from "moment-range";
import Moment from "moment";
import {Platform, StatusBar} from "react-native";
import React from "react";

const moment = extendMoment(Moment);
let isViewModify = false;
let prevDays = false;

const rosterRuleFormatter = (
    roster,
    range,
    loginShiftTimes,
    logoutShiftTimes
) => {
    return {
        LoginShifts: loginShiftTimes
            ? calculateShiftTime(range, loginShiftTimes, roster.WeekdaysAllowed)
            : "",
        LogoutShifts: logoutShiftTimes
            ? calculateShiftTime(range, logoutShiftTimes, roster.WeekdaysAllowed)
            : "",
        RosterRuleID: roster.RosterRuleID,
        AllowOtherLocationsLogin: roster.AllowOtherLocationsLogin,
        AllowOtherLocationsLogout: roster.AllowOtherLocationsLogout,
        WeekdaysAllowed: roster.WeekdaysAllowed,
        OfficeLocationsAllowed: roster.OfficeLocationsAllowed,
        EffectiveFrom: roster.EffectiveFrom,
        EffectiveTo: roster.EffectiveTo,
        RestrictToPOILogin: roster.RestrictToPOILogin,
        RestrictToPOILogout: roster.RestrictToPOILogout
    };
};

export function filterShiftTimeBasedOnCutOffTime(
    Rosters,
    startDate,
    endDate,
    officeNumberSelected,
    officeNumberSelected2
) {
    if (startDate === endDate) {
        prevDays = true;
        let parsedDate = moment(startDate).format("YYYY-MM-DD");
        let currentDay = moment().format("YYYY-MM-DD");
        isViewModify = moment(parsedDate).isBefore(currentDay);
    }

    const range = moment.range(startDate, endDate);
    let customisedRoster = [];
    //Flat ShiftTimes
    Rosters.map(roster => {
        let loginShiftTimes = "";
        let logoutShiftTimes = "";

        let EffectiveFrom = moment(roster.EffectiveFrom).format("YYYY-MM-DD");
        let startDateParsed = moment(startDate).format("YYYY-MM-DD");
        let EffectiveTo = moment(roster.EffectiveTo).format("YYYY-MM-DD");
        if (EffectiveTo === "Invalid date") {
            EffectiveTo = moment("2999/12/31", "YYYY-MM-DD").format("YYYY-MM-DD");
        }

        let endDateParsed = moment(endDate).format("YYYY-MM-DD");

        //Roster Rule Expiry Validation
        if (
            moment(startDateParsed).isSameOrAfter(EffectiveFrom) &&
            moment(endDateParsed).isSameOrBefore(EffectiveTo)
        ) {
            // Create Roster
            if (
                officeNumberSelected === officeNumberSelected2 &&
                roster.OfficeLocationsAllowed &&
                findMatchingAllowedOfficeFilter(
                    roster.OfficeLocationsAllowed.split("|"),
                    officeNumberSelected
                )
            ) {
                loginShiftTimes = roster.LoginShifts.split("|"); //06:45,3918,D|06:45,3918,D
                logoutShiftTimes = roster.LogoutShifts.split("|"); //06:45,3918,D|06:45,3918,D
                customisedRoster.push(
                    rosterRuleFormatter(roster, range, loginShiftTimes, logoutShiftTimes)
                );
            }

            // View or Modify Roster
            else if (
                officeNumberSelected &&
                officeNumberSelected2 &&
                officeNumberSelected !== officeNumberSelected2
            ) {
                //console.warn("Found View/Modify...");
                if (
                    //roster.OfficeLocationsAllowed.includes(officeNumberSelected) &&
                    roster.OfficeLocationsAllowed &&
                    findMatchingAllowedOfficeFilter(
                        roster.OfficeLocationsAllowed.split("|"),
                        officeNumberSelected
                    )
                ) {
                    // console.warn("Added Login Roster");
                    loginShiftTimes = roster.LoginShifts.split("|"); //06:45,3918,D
                    customisedRoster.push(
                        rosterRuleFormatter(roster, range, loginShiftTimes, false)
                    );
                }
                if (
                    /*roster.OfficeLocationsAllowed.includes(officeNumberSelected2)*/ roster.OfficeLocationsAllowed &&
                    findMatchingAllowedOfficeFilter(
                        roster.OfficeLocationsAllowed.split("|"),
                        officeNumberSelected2
                    )
                ) {
                    //console.warn("Added Logout Roster");
                    logoutShiftTimes = roster.LogoutShifts.split("|"); //06:45,3918,D
                    customisedRoster.push(
                        rosterRuleFormatter(roster, range, false, logoutShiftTimes)
                    );
                }
            }
        } else {
            customisedRoster.push(rosterRuleFormatter(roster, range, false, false));
        }
    });

    return customisedRoster.length > 0 ? customisedRoster : Rosters;
}


export function checkForRosterCancelCutoff(NoShowCount, rosterToCancel, LoginCutoffMinutes, LogoutCutoffMinutes) {
    if (NoShowCount && rosterToCancel) {
        let limitExceeded = (NoShowCount.Count >= NoShowCount.Limit);
        let startDate = moment(NoShowCount.StartDate).format("YYYY-MM-DD HH:mm");
        let endDate = moment(NoShowCount.EndDate).format("YYYY-MM-DD HH:mm");
        let rosterDateTime = moment(rosterToCancel.TripTime).format("YYYY-MM-DD HH:mm");
        if (limitExceeded && moment(rosterDateTime).isSameOrAfter(startDate) && moment(rosterDateTime).isSameOrBefore(endDate)) {
            if (rosterToCancel.TripType && rosterToCancel.TripType === "Pickup") {
                let cutoff = moment(rosterToCancel.TripTime).subtract(parseInt(LoginCutoffMinutes), 'minutes').format("YYYY-MM-DD HH:mm");
                let now = moment().format("YYYY-MM-DD HH:mm");
                return moment(now).isSameOrAfter(cutoff);
            }
            if (rosterToCancel.TripType && rosterToCancel.TripType === "Drop") {
                let cutoff = moment(rosterToCancel.TripTime).subtract(parseInt(LogoutCutoffMinutes), 'minutes').format("YYYY-MM-DD HH:mm");
                let now = moment().format("YYYY-MM-DD HH:mm");
                return moment(now).isSameOrAfter(cutoff);
            }
        } else {
            return false;
        }
    } else return false;
}

export function isWithinCutOff(cancelRoster, cutoffMinutes) {
    if(cutoffMinutes) {
        let cutoff = moment(cancelRoster.tripTime).subtract(parseInt(cutoffMinutes), 'minutes').format("YYYY-MM-DD HH:mm");
        let now = moment().format("YYYY-MM-DD HH:mm");
        console.warn('isWithinCutOff - ', cutoff, now);
        return (moment(now).isSameOrAfter(cutoff));
    } else return false;
}
export function isLoginNoShowPerformed(updateBody, selectedRoster) {
    return ((updateBody.LoginOffice && selectedRoster.LoginOffice && (updateBody.LoginOffice !== selectedRoster.LoginOffice)) ||
        (updateBody.LoginTime && selectedRoster.LoginShift && (updateBody.LoginTime.includes("NS") || (updateBody.LoginTime !== selectedRoster.LoginShift))));
}
export function isLogoutNoShowPerformed(updateBody, selectedRoster) {
    return ((updateBody.LogoutOffice && selectedRoster.LogoutOffice && (updateBody.LogoutOffice !== selectedRoster.LogoutOffice)) ||
        (updateBody.LogoutTime && selectedRoster.LogoutShifts && (updateBody.LogoutTime.includes("NS") || updateBody.LogoutTime !== selectedRoster.LogoutShifts)));
}

export function isLimitExceded(NoShowCount) {
    return (NoShowCount.Count >= NoShowCount.Limit);
}

export function isWithInTimeFrame(NoShowCount,cancelRoster) {
    let startDate = moment(NoShowCount.StartDate).format("YYYY-MM-DD HH:mm");
    let endDate = moment(NoShowCount.EndDate).format("YYYY-MM-DD HH:mm");
    let rosterDateTime = moment(cancelRoster.TripTime).format("YYYY-MM-DD HH:mm");
    console.warn('isWithInTimeFrame --- ', startDate, endDate, rosterDateTime);
    return (moment(rosterDateTime).isSameOrAfter(startDate) && moment(rosterDateTime).isSameOrBefore(endDate));
}
function calculateShiftTime(range, shiftTimes, WeekdaysAllowed) {
    let shiftTimeNew = [];
    if (!shiftTimes) return "";
    const currentDate = moment().format("YYYY-MM-DD HH:mm");
    const ignoreShiftArray = [];
    for (let day of range.by("days")) {
        const selectedDate = day.format("YYYY-MM-DD");
        shiftTimes.map(shiftTime => {
            let originalDate = moment(
                selectedDate + " " + shiftTime.split(",")[0],
                "YYYY-MM-DD HH:mm"
            ).format("YYYY-MM-DD HH:mm");

            let calculatedDateWithCutOff = moment(
                selectedDate + " " + shiftTime.split(",")[0],
                "YYYY-MM-DD HH:mm"
            )
                .subtract(shiftTime.split(",")[1], "m") //Confused Add or Subtract
                .format("YYYY-MM-DD HH:mm");

            let dateWithCutOffNextDay = shiftTime.split(",")[0].includes("*")
                ? moment(calculatedDateWithCutOff)
                    .add(24, "hours")
                    .format("YYYY-MM-DD HH:mm")
                : calculatedDateWithCutOff;

            if (moment(dateWithCutOffNextDay).isSameOrAfter(currentDate)) {
                /*console.warn(
                  "WeekdaysAllowed->" +
                    WeekdaysAllowed +
                    "\tcalculatedDateWithoutCutOff->" +
                    moment(originalDate)
                      .day()
                      .toString() +
                    "\nShiftTime->" +
                    shiftTime
                );*/
                if (
                    WeekdaysAllowed.includes(
                        moment(originalDate)
                            .day()
                            .toString()
                    )
                ) {
                    if (shiftTime.split(",")[0]) {
                        if (isViewModify & prevDays) {
                            if (shiftTime.includes("*"))
                                shiftTimeNew.push(shiftTime.split(",")[0] + ",0,D");
                        } else {
                            shiftTimeNew.push(shiftTime.split(",")[0] + ",0,D");
                        }
                    }
                }
            }

            /*  if (
              !moment(currentDate).isSameOrBefore(
                dateWithCutOffNextDay
              )
            ) {
              if (shiftTime.split(",")[0]) {
                ignoreShiftArray.push(shiftTime.split(",")[0] + ",0,D");
              }
            }*/
        });
    }
    let removeDuplicate = [...new Set(shiftTimeNew)];
    // console.warn("Shift Time->" + JSON.stringify(removeDuplicate));
    return removeDuplicate.join("|");
    // return shiftTimeNew.join("|"); //filteredShiftTime(shiftTimes, ignoreShiftArray);
}

function filteredShiftTime(shiftTimes, ignoreShiftArray) {
    /* console.warn(
      "shiftTimes-->" +
        shiftTimes +
        "\nFilteredArray-->" +
        JSON.stringify(ignoreShiftArray)
    );*/
    let finalArray = [];
    shiftTimes.map(shiftTime => {
        if (!ignoreShiftArray.join().includes(shiftTime.split(",")[0])) {
            if (shiftTime || shiftTime !== ",0,D") {
                if (isViewModify & prevDays) {
                    if (shiftTime.includes("*")) finalArray.push(shiftTime);
                } else {
                    finalArray.push(shiftTime);
                }
            }
        }
    });
    let removeDuplicate = [...new Set(finalArray)];
    return removeDuplicate.join("|");
}

export const _renderStatusbar = () => {
    return Platform.OS === "ios" ? (
        <StatusBar barStyle="dark-content"/>
    ) : (
        <StatusBar barStyle="light-content"/>
    );
};

function findMatchingAllowedOfficeFilter(array, officeID) {
    if (!array || !officeID) return false;
    for (let i = 0; i < array.length; i++) {
        if (array[i].toString() === officeID.toString()) {
            return true;
        }
    }
}

export function findAutoFill(LocationName, locationsArray) {
    if (!locationsArray) return;
    let i;
    let length = Object.keys(locationsArray).length;
    for (i = 0; i < length; i++) {
        if (
            locationsArray[i].LocationName.toString().trim() ===
            LocationName.toString().trim()
        ) {
            if (!locationsArray[i].GeoLocation) return false;
            let body = {
                Lat: locationsArray[i].GeoLocation.split(",")[0],
                Lng: locationsArray[i].GeoLocation.split(",")[1],
                LocationType: locationsArray[i].LocationType,
                LocationCode: locationsArray[i].LocationCode
            };

            return body;
        }
    }
    return "NA";
}
