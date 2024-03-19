import Moment from "moment";
import { extendMoment } from "moment-range";
const moment = extendMoment(Moment);
export const weeklyOffDaysToNumber = {
  Sunday: "0",
  Monday: "1",
  Tuesday: "2",
  Wednesday: "3",
  Thursday: "4",
  Friday: "5",
  Saturday: "6"
};
export function findName(id, array) {
  if (!id || !array) return "";
  let i;
  for (i = 0; i < array.length; i++) {
    if (array[i].ID.toString().trim() == id.toString().trim()) {
      return array[i].Name;
    }
  }
  return "NA";
}
export function findID(Name, array) {
  if (!Name || !array) return "";
  var i;
  for (i = 0; i < array.length; i++) {
    if(array[i].hasOwnProperty("Name")) {
        if (array[i].Name.toString().trim() == Name.toString().trim()) {
            return array[i].ID;
        }
    }
  }
  return "NA";
}
export function getAutoWeeklyOff(rosterDetails, selectedOfficeLocation) {
  let autoWeekendArrayDuplicate = [];
  for (i = 0; i < Object.keys(rosterDetails.Rosters).length; i++) {
    if (
      rosterDetails.Rosters[i].OfficeLocationsAllowed.includes(
        selectedOfficeLocation
      )
    ) {
      let WeekdaysAllowed = rosterDetails.Rosters[i].WeekdaysAllowed.split("|");
      console.warn('WeekdaysAllowed ', WeekdaysAllowed);
      for (j = 0; j < WeekdaysAllowed.length; j++) {
        autoWeekendArrayDuplicate.push(WeekdaysAllowed[j]);
      }
    }
  }
  console.warn('autoWeekendArrayDuplicate - ', autoWeekendArrayDuplicate);
  let autoWeekendArray = autoWeekendArrayDuplicate.filter(function(item, pos) {
    return autoWeekendArrayDuplicate.indexOf(item) == pos;
  });
  console.warn('autoWeekendArray ', autoWeekendArray);
  let tempWeeklyOffStateValue = [];
  let random = ["0", "1", "2", "3", "4", "5", "6"];
  let diff = arr_diff(autoWeekendArray, random).slice(0, -1);
  console.warn('diff - ', diff);
  tempWeeklyOffStateValue.push(...diff);
  console.warn('tempWeeklyOffStateValue - ', tempWeeklyOffStateValue);
  let autoWeekDayArray = [];
  for (i = 0; i < tempWeeklyOffStateValue.length; i++) {
    if (tempWeeklyOffStateValue[i] === "0") {
      autoWeekDayArray.push("Sunday");
    } else if (tempWeeklyOffStateValue[i] === "1") {
      autoWeekDayArray.push("Monday");
    } else if (tempWeeklyOffStateValue[i] === "2") {
      autoWeekDayArray.push("Tuesday");
    } else if (tempWeeklyOffStateValue[i] === "3") {
      autoWeekDayArray.push("Wednesday");
    } else if (tempWeeklyOffStateValue[i] === "4") {
      autoWeekDayArray.push("Thursday");
    } else if (tempWeeklyOffStateValue[i] === "5") {
      autoWeekDayArray.push("Friday");
    } else if (tempWeeklyOffStateValue[i] === "6") {
      autoWeekDayArray.push("Saturday");
    }
  }
  return {
    autoWeekDayArray,
    diff
  };
}
function arr_diff(a1, a2) {
  var a = [],
    diff = [];

  for (var i = 0; i < a1.length; i++) {
    a[a1[i]] = true;
  }

  for (var i = 0; i < a2.length; i++) {
    if (a[a2[i]]) {
      delete a[a2[i]];
    } else {
      a[a2[i]] = true;
    }
  }

  for (var k in a) {
    diff.push(k);
  }

  return diff;
}
export function getDaysInMonth(month, year, days) {
  let pivot = moment()
    .month(month)
    .year(year)
    .startOf("month");
  const end = moment()
    .month(month)
    .year(year)
    .endOf("month");

  let dates = {};
  const disabled = { disabled: true, disableTouchEvent: true };
  while (pivot.isBefore(end)) {
    days.forEach(day => {
      dates[pivot.day(day).format("YYYY-MM-DD")] = disabled;
    });
    pivot.add(7, "days");
  }

  return dates;
}
export let getDates = function(startDate, endDate) {
  let dates = [],
    currentDate = startDate,
    addDays = function(days) {
      let date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    };
  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays.call(currentDate, 1);
  }
  return dates;
};
export function getCalculatedCreateRoster(
  Rosters,
  selectedDaysArray,
  selectedOfficeLocation,
  selctedLoginShift,
  selectedLogoutShift
) {
  if (!selectedOfficeLocation) {
    return;
  }
  let rosterTotalWeekdaysAvailable = [];
  for (i = 0; i < Rosters.length; i++) {
    rosterTotalWeekdaysAvailable.push(Rosters[i].WeekdaysAllowed);
  }
  for (i = 0; i < selectedDaysArray.length; i++) {
    for (j = 0; j < Rosters.length; j++) {
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
  for (k = 0; k < Rosters.length; k++) {
    let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
    let LoginShiftsArray = Rosters[k].LoginShifts.split("|");
    for (i = 0; i < WeekdaysAllowedArray.length; i++) {
      for (j = 0; j < LoginShiftsArray.length; j++) {
        newLoginShifts.push(
          LoginShiftsArray[j] + "#" + WeekdaysAllowedArray[i]
        );
      }
    }
  }
  newLoginShifts = newLoginShifts.sort();


  let newLogoutShifts = [];
  for (k = 0; k < Rosters.length; k++) {
    let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
    let LogoutShiftsArray = Rosters[k].LogoutShifts.split("|");
    for (i = 0; i < WeekdaysAllowedArray.length; i++) {
      for (j = 0; j < LogoutShiftsArray.length; j++) {
        newLogoutShifts.push(
          LogoutShiftsArray[j] + "#" + WeekdaysAllowedArray[i]
        );
      }
    }
  }
  newLogoutShifts = newLogoutShifts.sort();


  let newOfficeLocationsAllowed = [];
  for (k = 0; k < Rosters.length; k++) {
    let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
    let OfficeLocationsAllowedArray = Rosters[k].OfficeLocationsAllowed.split(
      "|"
    );
    for (i = 0; i < WeekdaysAllowedArray.length; i++) {
      for (j = 0; j < OfficeLocationsAllowedArray.length; j++) {
        //Need to Add Filter...(Based on Selected OfficeLocation
        newOfficeLocationsAllowed.push(
          OfficeLocationsAllowedArray[j] + "#" + WeekdaysAllowedArray[i]
        );
        // }
      }
    }
  }
  let newAllowOtherLocationsLogin = [];
  for (k = 0; k < Rosters.length; k++) {
    let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
    let AllowOtherLocationsLoginArray = [Rosters[k].AllowOtherLocationsLogin];
    for (i = 0; i < WeekdaysAllowedArray.length; i++) {
      for (j = 0; j < AllowOtherLocationsLoginArray.length; j++) {
        newAllowOtherLocationsLogin.push(
          AllowOtherLocationsLoginArray[j] + "#" + WeekdaysAllowedArray[i]
        );
      }
    }
  }
  let newAllowOtherLocationsLogout = [];
  for (k = 0; k < Rosters.length; k++) {
    let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
    let AllowOtherLocationsLogoutArray = [Rosters[k].AllowOtherLocationsLogout];
    for (i = 0; i < WeekdaysAllowedArray.length; i++) {
      for (j = 0; j < AllowOtherLocationsLogoutArray.length; j++) {
        newAllowOtherLocationsLogout.push(
          AllowOtherLocationsLogoutArray[j] + "#" + WeekdaysAllowedArray[i]
        );
      }
    }
  }

  let RestrictToPOILogin = [];
  for (k = 0; k < Rosters.length; k++) {
    let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
    let AllowOtherLocationsLoginArray = [Rosters[k].RestrictToPOILogin];
    for (i = 0; i < WeekdaysAllowedArray.length; i++) {
      for (j = 0; j < AllowOtherLocationsLoginArray.length; j++) {
        RestrictToPOILogin.push(
          AllowOtherLocationsLoginArray[j] + "#" + WeekdaysAllowedArray[i]
        );
      }
    }
  }
  let RestrictToPOILogout = [];
  for (k = 0; k < Rosters.length; k++) {
    let WeekdaysAllowedArray = Rosters[k].WeekdaysAllowed.split("|");
    let AllowOtherLocationsLogoutArray = [Rosters[k].RestrictToPOILogout];
    for (i = 0; i < WeekdaysAllowedArray.length; i++) {
      for (j = 0; j < AllowOtherLocationsLogoutArray.length; j++) {
        RestrictToPOILogout.push(
          AllowOtherLocationsLogoutArray[j] + "#" + WeekdaysAllowedArray[i]
        );
      }
    }
  }

  let OfficeLocationsAllowed = getCalculatedValue(
    newOfficeLocationsAllowed,
    selectedDaysArray,
    false
  );
    let isOfficeAvailable=OfficeLocationsAllowed.toString().split("|").find(function(item){
        return parseInt(item)===parseInt(selectedOfficeLocation);
    });
  if (isOfficeAvailable) {
      const addZeroCutoff = true;
    return [
      {
        LoginShifts: getCalculatedValue(
          newLoginShifts,
          selectedDaysArray,
          addZeroCutoff
        ),
        LogoutShifts: getCalculatedValue(
          newLogoutShifts,
          selectedDaysArray,
          addZeroCutoff
        ),
        OfficeLocationsAllowed: getCalculatedValue(
          newOfficeLocationsAllowed,
          selectedDaysArray
        ),
          AllowOtherLocationsLogin: getAllowOtherLocationsLogin(
              newAllowOtherLocationsLogin,
              selectedDaysArray,
              selctedLoginShift,
              Rosters,
              selectedOfficeLocation
          ),
          AllowOtherLocationsLogout: getAllowOtherLocationsLogout(
              newAllowOtherLocationsLogout,
              selectedDaysArray,
              selectedLogoutShift,
              Rosters,
              selectedOfficeLocation
          ),
          RestrictToPOILogin: getLoginPOI(
              RestrictToPOILogin,
              selectedDaysArray,
              selctedLoginShift,
              Rosters,
              selectedOfficeLocation
          ),
          RestrictToPOILogout: getLogOutPOI(
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
          AllowOtherLocationsLogin: getAllowOtherLocationsLogin(
              newAllowOtherLocationsLogin,
              selectedDaysArray,
              selctedLoginShift,
              Rosters,
              selectedOfficeLocation
          ),
          AllowOtherLocationsLogout: getAllowOtherLocationsLogout(
              newAllowOtherLocationsLogout,
              selectedDaysArray,
              selectedLogoutShift,
              Rosters,
              selectedOfficeLocation
          ),
          RestrictToPOILogin: getLoginPOI(
              RestrictToPOILogin,
              selectedDaysArray,
              selctedLoginShift,
              Rosters,
              selectedOfficeLocation
          ),
          RestrictToPOILogout: getLogOutPOI(
              RestrictToPOILogout,
              selectedDaysArray,
              selectedLogoutShift,
              Rosters,
              selectedOfficeLocation
          )
      }
    ];
}
function getCalculatedValue(shifts, selectedDaysArray) {
  let matched = [];
  for (i = 0; i < selectedDaysArray.length; i++) {
    for (j = 0; j < shifts.length; j++) {
      if (selectedDaysArray[i] === shifts[j].split("#")[1]) {
        matched.push(shifts[j]);
      }
    }
  }
  let onlyMatched = [];
  for (i = 0; i < matched.length; i++) {
    let mat = matched[i].substr(0, matched[i].lastIndexOf("#"));
    if (mat)
      onlyMatched.push(
        mat.split(",")[0]
        // addZeroCutoff ? mat.split(",")[0] + ",0,D" : mat.split(",")[0]
      );
  }
  const count = {};
  onlyMatched.forEach(function(i) {
    count[i] = (count[i] || 0) + 1;
  });

  let common = [];
  let max = selectedDaysArray.length;
  Object.keys(count).forEach(function(key) {
    var value = count[key];
    if (value >= max) {
      common.push(key);
    }
  });
  common => common.sort;
  return common.join("|");
}
function getLoginPOI(shifts, selectedDaysArray,selectedLoginShift,Rosters,officeLoginSelectedNumber) {
    if (selectedLoginShift.includes("Select")) {
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
            var value = count[key];
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
            console.warn("temp "+temp);
        }
        let customRoster = Rosters.find(function (item) {
            return (item.OfficeLocationsAllowed.includes(officeLoginSelectedNumber) && item.WeekdaysAllowed.includes(temp) && item.LoginShifts.includes(selectedLoginShift));
        });
        console.warn("Custom " + JSON.stringify(customRoster));
        return customRoster?customRoster.RestrictToPOILogin:0;
    }
}
function getLogOutPOI(shifts, selectedDaysArray,selectedLogoutShift, Rosters, officeLogoutSelectedNumber) {
    if (selectedLogoutShift.includes("Select")) {
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
            var value = count[key];
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
            console.warn("temp "+temp);
        }
        let customRoster = Rosters.find(function (item) {
            return (item.OfficeLocationsAllowed.includes(officeLogoutSelectedNumber) && item.WeekdaysAllowed.includes(temp) && item.LogoutShifts.includes(selectedLogoutShift));
        });
        console.warn("Custom " + JSON.stringify(customRoster));
        return customRoster?customRoster.RestrictToPOILogout:0;
    }
}
function getAllowOtherLocationsLogin(shifts, selectedDaysArray,selectedLoginShift, Rosters, selectedOfficeLocation) {
    if (selectedLoginShift.includes("Select")) {
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
            var value = count[key];
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
            console.warn("temp "+temp);
        }
        let customRoster = Rosters.find(function (item) {
            return (item.OfficeLocationsAllowed.includes(selectedOfficeLocation) && item.WeekdaysAllowed.includes(temp) && item.LoginShifts.includes(selectedLoginShift));
        });
        console.warn("Custom " + JSON.stringify(customRoster));
        return customRoster?customRoster.AllowOtherLocationsLogin:0;

    }
}
function getAllowOtherLocationsLogout(shifts, selectedDaysArray,selectedLogoutShift, Rosters, officeLogoutSelectedNumber) {
    if (selectedLogoutShift.includes("Select")) {
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
            var value = count[key];
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
            console.warn("temp "+temp);
        }
        let customRoster = Rosters.find(function (item) {
            return (item.OfficeLocationsAllowed.includes(officeLogoutSelectedNumber) && item.WeekdaysAllowed.includes(temp) && item.LogoutShifts.includes(selectedLogoutShift));
        });
        console.warn("Custom " + JSON.stringify(customRoster));
        return customRoster?customRoster.AllowOtherLocationsLogout:0;
    }
}
export function checkDate(start, end) {
  if (!start || !end) return;
  var mStart = moment(new Date(start).toISOString());
  var mEnd = moment(new Date(end).toISOString());
  return mStart.isSameOrBefore(mEnd);
}
export function findAddress(Name, array) {
  if (!Name) return;
  let i;
  for (i = 0; i < array.length; i++) {
      if(array[i].hasOwnProperty("Name")) {
          if (array[i].Name.toString().trim() === Name.toString().trim()) {
              return array[i].Address;
          }
    }
  }
  return "";
}

export function findLat(Name, array) {
  if (!Name) return;
  let i;
  for (i = 0; i < array.length; i++) {
      if(array[i].hasOwnProperty("Name")) {
          if (array[i].Name.toString().trim() === Name.toString().trim()) {
              return array[i].Lat;
          }
      }
  }
  return "";
}

export function findLng(Name, array) {
  if (!Name) return;
  let i;
  for (i = 0; i < array.length; i++) {
      if(array[i].hasOwnProperty("Name")) {
          if (array[i].Name.toString().trim() === Name.toString().trim()) {
              return array[i].Lng;
          }
      }
  }
  return "";
}
