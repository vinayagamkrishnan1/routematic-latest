global.isPushAllowed = true;
global.byPassJailBroken = false; // pentest
export const pentest = false; // prod
export const gcptest = false; // qa
export const prod = false;

let comApiV3Prod = pentest ? "https://mobileapi.routematic.com" : "https://api.routematic.com";
let comApiV3QA = "https://apiclient1.routematic.com";

let apin = pentest ? "https://mobileapin.routematic.com" : "https://apin.routematic.com";
let apinqa = gcptest ? "https://apinqagcp.routematic.com" : "https://apinqa.routematic.com";

let login = pentest ? "https://mobilelogin.routematic.com" : "https://login.routematic.com";
let loginqa = gcptest ? "https://loginqagcp.routematic.com" : "https://loginqa.routematic.com";

export const URL = {

    SSO_CHECK: prod
        ? "https://rmmsp.routematic.com/emob/initiate/v1?domain="
        : "https://rmmspqa.routematic.com/emob/initiate/v1?domain=",
    //? "https://mobilelogin.routematic.com/api/mob/emp/token/v1"
    LOGIN_API: prod
        ? login + "/api/mob/emp/token/v1"
        : loginqa + "/api/mob/emp/token/v1",
    MSAL_LOGIN_API: prod
        ? "https://rmmsp.routematic.com/emob/AssertMSAL/v1"
        : "https://rmmspqa.routematic.com/emob/AssertMSAL/v1",
    PARKING_LOGIN_API: prod
        ? login + "/api/rm/emob/parking/token/v1"
        : loginqa + "/api/rm/emob/parking/token/v1",
    REGISTER_EMAIL: prod
        ? comApiV3Prod + "/api/v3/ProAccount/RegisterUser"
        : comApiV3QA + "/api/v3/ProAccount/RegisterUser",
    FORGET_PASSWORD: prod
        ? comApiV3Prod + "/api/v3/ProAccount/ForgotPassword"
        : comApiV3QA + "/api/v3/ProAccount/ForgotPassword",
    FORGET_PASSWORD_PT: login + "/api/mob/emp/password/forgot/otp/v1",
    UPDATE_USER_PASSWORD_PT: login + "/api/mob/emp/password/reset/v1",
    VERIFY_OTP: prod
        ? login + "/api/mob/emp/password/validate/otp/v2"
        : loginqa + "/api/mob/emp/password/validate/otp/v2",
    GET_REGISTRATION_LOCATIONS: prod
        ? login + "/api/mob/emp/locationdetails/v1?registrationToken="
        : loginqa + "/api/mob/emp/locationdetails/v1?registrationToken=",
    VERIFY_FORGET_PASSWORD_OTP: pentest ? "/api/mob/emp/password/reset/v1" : "/api/v3/MainAccount/VerifyForgotPasswordOTP",
    SET_CREDENTIAL: prod
        ? login + "/api/mob/emp/registration/v2"
        : loginqa + "/api/mob/emp/registration/v2",
    UPDATE_USER_PASSWORD: "/api/v3/MainAccount/UpdateUserPassword",
    LOGIN_INFO: "/api/v3/employee/logininfoExt",
    GetTripDetail: "/api/v3/Employee/GetTripDetail",
    CHANGE_PASSWORD: "/api/v3/MainAccount/ChangePassword",
    SIGN_OUT: "/api/v3/MainAccount/SignOut",
    IVR: prod
        ? apin + "/api/rm/ivr/ib/v1/getmenuoption"
        : apinqa + "/api/rm/ivr/ib/v1/getmenuoption",
    FEEDBACK_PAST_TRIPS: prod
        ? apin + "/api/rm/trip/feedback/employee/pasttrips/v1?"
        : apinqa + "/api/rm/trip/feedback/employee/pasttrips/v1?",
    FEEDBACK_PREVIOUS_DAY: prod
        ? apin + "/api/rm/trip/feedback/employee/previousday/v1?"
        : apinqa + "/api/rm/trip/feedback/employee/previousday/v1?",
    FEEDBACK_CATEGORIES: prod
        ? apin + "/api/rm/trip/feedback/employee/categories/v1?"
        : apinqa + "/api/rm/trip/feedback/employee/categories/v1?",
    GET_ROSTER_DETAILS: "/api/v3/roster/GetRosterDetails",
    GET_SELECTED_ROSTER: "/api/v3/roster/GetSelectedRosterExt",
    SaveSingleRoster: "/api/v3/roster/SaveSingleRoster",
    SaveMultiRoster: "/api/v3/roster/SaveMultipleRoster",
    FEEDBACK_SUBMIT: prod
        ? apin + "/api/rm/trip/feedback/employee/v1"
        : apinqa + "/api/rm/trip/feedback/employee/v1",
    PARKING_AUTH: prod
        ? "https://integrationqa.routematic.com/api/rm/integration/parkzeus/authenticate"
        : "https://integrationqa.routematic.com/api/rm/integration/parkzeus/authenticate", 
    GET_UPCOMING_TRIPS: "/api/v3/employee/GetUpcomingTrips",
    CANCEL_TRIP: "/api/v3/employee/CancelTrip",
    SAVE_ROSTER_RANGE: "/api/v3/roster/SaveRosterRange",
    SAVE_ADHOC: "/api/v3/employee/SaveAdhoc?",
    GET_ADHOC_PROGRAMS: "/api/v3/Program/GetAdhocPrograms",
    GET_PROGRAM_DETAILS: "/api/v3/Program/GetProgramDetail",
    GET_FLEXI_DETAILS: "/api/v3/Employee/GetFlexiDetails",
    GET_FLEXI_CABS: "/api/v3/Employee/GetFlexiCabs",
    SAVE_FLEXI: "/api/v3/Employee/SaveFlexi",
    SAVE_LOCATION: "/api/v3/Employee/SaveEmployeeLocation",
    SAVE_POI: "/api/v3/employee/SavePOI?",
    SAVE_POI_NEW: prod
        ? apin + "/api/rm/emob/adhoc/otherlocation/v1"
        : apinqa + "/api/rm/emob/adhoc/otherlocation/v1",
    GET_TRACKING_DATA: prod
        ? //"https://mobilehqt.routematic.com/api/getTrackingData"
        "https://hqt.routematic.com/api/getTrackingData"
        : "https://hqt.routematic.com/api/getTrackingData",
    TERMS_AND_CONDITION: prod
        ? apin + "/api/rm/user/reg/tc/v2"
        : apinqa + "/api/rm/user/reg/tc/v2",
    announcements: prod
        ? apin + "/api/rm/emob/announcements/v1"
        : apinqa + "/api/rm/emob/announcements/v1",
    SHUTTLE_CONFIG: prod
        ? apin + "/api/rm/emob/shuttle/config/v1"
        : apinqa + "/api/rm/emob/shuttle/config/v1",
    shuttleDetails: prod
        ? apin + "/api/rm/emob/shuttle/details/v1"
        : apinqa + "/api/rm/emob/shuttle/details/v1",
    shuttleGenerateTicket: prod
        ? apin + "/api/rm/emob/shuttle/generateticket/v1"
        : apinqa + "/api/rm/emob/shuttle/generateticket/v1",
    shuttleDetailsV1: prod
        ? apin + "/api/rm/emob/shuttle/routes/v1"
        : apinqa + "/api/rm/emob/shuttle/routes/v1",
    shuttleUpcomingDetailsV1: prod
        ? apin + "/api/rm/emob/shuttle/upcoming/routes/v1"
        : apinqa + "/api/rm/emob/shuttle/upcoming/routes/v1",  
    shuttleRouteDetails: prod
        ? apin + "/api/rm/emob/shuttle/route/details/v1"
        : apinqa + "/api/rm/emob/shuttle/route/details/v1",
    shuttleGenerateTicketV2: prod
        ? apin + "/api/rm/emob/shuttle/generateticket/v2"
        : apinqa + "/api/rm/emob/shuttle/generateticket/v2",
    GET_PROGRAM_DETAILS_LINE_MANAGER: prod
        ? apin + "/api/rm/emob/adhoc/programdetail/v2"
        : apinqa + "/api/rm/emob/adhoc/programdetail/v2",
    GET_FIXED_ROUTE_ROSTER_DETAILS: prod
        ? apin + "/api/rm/emob/fixedroute/roster/details/v2?selectedDate="
        : apinqa + "/api/rm/emob/fixedroute/roster/details/v2?selectedDate=",
    GET_FIXED_ROUTE_BOOKED_ROSTERS: prod
        ? apin + "/api/rm/emob/fixedroute/selected/roster/v2"
        : apinqa + "/api/rm/emob/fixedroute/selected/roster/v2",
    GET_FIXED_ROUTES_LIST: prod
        ? apin + "/api/rm/emob/fixedroute/search/routes/v1"
        : apinqa + "/api/rm/emob/fixedroute/search/routes/v1",
    CANCEL_FIXED_ROUTE_TRIP: prod
        ? apin + "/api/rm/emob/fixedroute/trip/cancel/v1"
        : apinqa + "/api/rm/emob/fixedroute/trip/cancel/v1",
    CANCEL_FIXED_ROUTE_PASS: prod
        ? apin + "/api/rm/emob/fixedroute/pass/cancel/v1"
        : apinqa + "/api/rm/emob/fixedroute/pass/cancel/v1",
    GET_PASSESV1: prod
        ? apin + "/api/rm/emob/fixedroute/pass/emp/v1"
        : apinqa + "/api/rm/emob/fixedroute/pass/emp/v1",
    GET_PASSES: prod
        ? apin + "/api/rm/emob/fixedroute/pass/emp/v2"
        : apinqa + "/api/rm/emob/fixedroute/pass/emp/v2",
    GET_BOOKINGS: prod
        ? apin + "/api/rm/emob/fixedroute/seat/emp/v2?"
        : apinqa + "/api/rm/emob/fixedroute/seat/emp/v2?",
    GET_USAGE: prod
        ? apin + "/api/rm/emob/facility/usage/v1"
        : apinqa + "/api/rm/emob/facility/usage/v1",
    CANCEL_BOOKINGS: prod
        ? apin + "/api/rm/emob/fixedroute/seat/cancel/v1"
        : apinqa + "/api/rm/emob/fixedroute/seat/cancel/v1",
    GET_SEAT_LAYOUT: prod
        ? apin + "/api/rm/emob/fixedroute/layout/v1"
        : apinqa + "/api/rm/emob/fixedroute/layout/v1",
    GET_FAV_ROUTES: prod
        ? apin + "/api/rm/emob/fixedroute/search/v1"
        : apinqa + "/api/rm/emob/fixedroute/search/v1",
    CANCEL_TICKET: prod
        ? apin + "/api/rm/emob/shuttle/cancel/pass/v1"
        : apinqa + "/api/rm/emob/shuttle/cancel/pass/v1",
    GET_STATS_DATA: prod
        ? apin + "/api/rm/emob/analytics/trip/stats/v1"
        : apinqa + "/api/rm/emob/analytics/trip/stats/v1",
    GET_FIXED_ROUTE_DETAILS: prod
        ? apin + "/api/rm/emob/fixedroute/details/v1"
        : apinqa + "/api/rm/emob/fixedroute/details/v1",
    GET_FIXED_ROUTE_DETAILSV2: prod
        ? apin + "/api/rm/emob/fixedroute/details/v3"
        : apinqa + "/api/rm/emob/fixedroute/details/v3",
    FIXED_ROUTE_CONFIG: prod
        ? apin + "/api/rm/emob/fixedroute/config/v1"
        : apinqa + "/api/rm/emob/fixedroute/config/v1",
    GET_BUS_PASS_TYPES: prod
        ? apin + "/api/rm/emob/fixedroute/pass/types/v1"
        : apinqa + "/api/rm/emob/fixedroute/pass/types/v1",
    SAVE_GENERATE_PASS: prod
        ? apin + "/api/rm/emob/fixedroute/pass/generate/v1"
        : apinqa + "/api/rm/emob/fixedroute/pass/generate/v1",
    GENERATE_BUS_PASS: prod
        ? apin + "/api/rm/emob/fixedroute/pass/book/v1"
        : apinqa + "/api/rm/emob/fixedroute/pass/book/v1",
    GENERATE_BUS_TICKET: prod
        ? apin + "/api/rm/emob/fixedroute/seat/book/v1"
        : apinqa + "/api/rm/emob/fixedroute/seat/book/v1",
    GET_FIXED_ROUTE_TRACKING_DETAILS: prod
        ? apin + "/api/rm/emob/fixedroute/shift/vehicle/v1"
        : apinqa + "/api/rm/emob/fixedroute/shift/vehicle/v1",
    GET_WAY_POINTS: prod
        ? apin + "/api/rm/emob/fixedroute/all/v1"
        : apinqa + "/api/rm/emob/fixedroute/all/v1",
    GET_PASS_CATEGORY: prod
        ? apin + "/api/rm/emob/fixedroute/pass/suggest/v1"
        : apinqa + "/api/rm/emob/fixedroute/pass/suggest/v1",
    GET_ETICKETS: prod
        ? apin + "/api/rm/emob/shuttle/tickets/v1"
        : apinqa + "/api/rm/emob/shuttle/tickets/v1",
    FIXED_ROUTE_CHECKIN: prod
        ? apin + "/api/rm/emob/fixedroute/emp/checkin/v1"
        : apinqa + "/api/rm/emob/fixedroute/emp/checkin/v1",
    FACILITY_PASS_CHECKIN: prod
        ? apin + "/api/rm/emob/facility/checkin/v1"
        : apinqa + "/api/rm/emob/facility/checkin/v1",
    SHUTTLE_CHECKIN: prod
        ? apin + "/api/rm/emob/shuttle/emp/checkin/v1"
        : apinqa + "/api/rm/emob/shuttle/emp/checkin/v1",
    QR_WITHOUTPASS_CHECKINV2: prod
        ? apin + "/api/rm/emob/shuttle/emp/checkin/v2"
        : apinqa + "/api/rm/emob/shuttle/emp/checkin/v2",
    ROUTELIST_LOG: prod
        ? apin + "/api/rm/emob/shuttle/route/attempt/v1"
        : apinqa + "/api/rm/emob/shuttle/route/attempt/v1",       
    CHAT: prod
        ? apin + "/api/rm/emob/trip/chat/v1?"
        : apinqa + "/api/rm/emob/trip/chat/v1?",
    UPDATE_PUSHY_ID: prod
        ? apin + "/api/rm/emob/ssologin/v1"
        : apinqa + "/api/rm/emob/ssologin/v1",
    UPDATE_GEO_CODE: prod
        ? apin + "/api/rm/emob/profile/address/geocode/v1"
        : apinqa + "/api/rm/emob/profile/address/geocode/v1",
    Opt_Out_GET: prod
        ? apin + "/api/rm/emob/shift/logout/optout/tc/v1"
        : apinqa + "/api/rm/emob/shift/logout/optout/tc/v1",
    Opt_Out_POST: prod
        ? apin + "/api/rm/emob/shift/logout/optout/v1"
        : apinqa + "/api/rm/emob/shift/logout/optout/v1",
    Fixed_Wave_Points: prod
        ? apin + "/api/rm/emob/fixedroute/waypoints/v1/"
        : apinqa + "/api/rm/emob/fixedroute/waypoints/v1/",
    Wave_Points: prod
        ? apin + "/api/rm/emob/trip/waypoints/v1/"
        : apinqa + "/api/rm/emob/trip/waypoints/v1/",
    GET_USER_DETAILS: prod
        ? apin + "/api/rm/emob/profile/v1"
        : apinqa + "/api/rm/emob/profile/v1",
    SAVE_USER_DETAILS: prod
        ? apin + "/api/rm/emob/profile/v1"
        : apinqa + "/api/rm/emob/profile/v1",
    GET_LOCALITY: prod
        ? apin + "/api/rm/emob/profile/contact/localities/v1"
        : apinqa + "/api/rm/emob/profile/contact/localities/v1",
    NOTIFICATIONS: prod
        ? apin + "/api/rm/emob/profile/notification/v1"
        : apinqa + "/api/rm/emob/profile/notification/v1",
    NEW_GET_UPCOMING_TRIPS: prod
        ? apin + "/api/rm/emob/trips/v2"
        : apinqa + "/api/rm/emob/trips/v2",
    NEW_CHECKIN: prod
        ? apin + "/api/rm/emob/trip/checkin/v1"
        : apinqa + "/api/rm/emob/trip/checkin/v1",
    NEW_CHECKOUT: prod
        ? apin + "/api/rm/emob/trip/checkout/v1"
        : apinqa + "/api/rm/emob/trip/checkout/v1",
    NEW_PANIC: prod
        ? apin + "/api/rm/emob/trip/panic/v1"
        : apinqa + "/api/rm/emob/trip/panic/v1",
    GET_TERMS: prod
        ? apin + "/api/rm/emob/tnc/v1"
        : apinqa + "/api/rm/emob/tnc/v1",
    SAFE_DROP: prod
        ? apin + "/api/rm/emob/trip/safedrop/v1"
        : apinqa + "/api/rm/emob/trip/safedrop/v1",
    ACTIVE_TRIP: prod
        ? apin + "/api/rm/emob/trips/ongoing/any/v1"
        : apinqa + "/api/rm/emob/trips/ongoing/any/v2",
    VALIDATE_PASSWORD: prod
        ? login + "/api/mob/emp/password/validate/policy/v2"
        : loginqa + "/api/mob/emp/password/validate/policy/v2",
    Get_GuardDetails: prod
        ? apin + "/api/rm/emob/trip/guard/v1/"
        : apinqa + "/api/rm/emob/trip/guard/v1/",
    RECENT_TRIPS: prod
        ? apin + "/api/rm/emob/feedback/tickets/v1?"
        : apinqa + "/api/rm/emob/feedback/tickets/v1?",
    CATEGORIES: prod
        ? apin + "/api/rm/emob/feedback/categories/v1"
        : apinqa + "/api/rm/emob/feedback/categories/v1?",
    Save_GeneralFeedback: prod
        ? apin + "/api/rm/emob/feedback/v2"
        : apinqa + "/api/rm/emob/feedback/v2",
    Get_MyTicket_ByID: prod
        ? apin + "/api/rm/emob/feedback/ticket/v1?ticketid="
        : apinqa + "/api/rm/emob/feedback/ticket/v1?ticketid=",
    Re_Open_Ticket: prod
        ? apin + '/api/rm/emob/feedback/ticket/reopen/v1'
        : apinqa + '/api/rm/emob/feedback/ticket/reopen/v1',
    AdHoc_Offices: prod
        ? apin + "/api/rm/emob/adhoc/offices/v1"
        : apinqa + "/api/rm/emob/adhoc/offices/v1",
    Adhoc_Programs: prod
        ? apin + "/api/rm/emob/adhoc/programs/v1?"
        : apinqa + "/api/rm/emob/adhoc/programs/v1?",
    AdhocNonShiftProgram: prod
        ? apin + "/api/rm/emob/adhoc/programs/nsa/v1"
        : apinqa + "/api/rm/emob/adhoc/programs/nsa/v1",
    GET_FixedRoute_Details: prod
        ? apin + "/api/rm/emob/fixedroute/tripdetail/v1"
        : apinqa + "/api/rm/emob/fixedroute/tripdetail/v1",
    travelDeskSite: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/sites/v1"
        : apinqa + "/api/rm/emob/adhoc/traveldesk/sites/v1",
    travelDeskBU: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/businesses/v1"
        : apinqa + "/api/rm/emob/adhoc/traveldesk/businesses/v1",
    travelDeskSubBU: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/subbusiness/v1?siteid="
        : apinqa + "/api/rm/emob/adhoc/traveldesk/subbusiness/v1?siteid=",
    travelDeskVisitors: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/visitortypes/v1?siteid="
        : apinqa + "/api/rm/emob/adhoc/traveldesk/visitortypes/v1?siteid=",
    travelDeskTravellers: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/travellertypes/v1?siteid="
        : apinqa + "/api/rm/emob/adhoc/traveldesk/travellertypes/v1?siteid=",
    travelDeskVehicles: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/vehicletypes/v1?programid="
        : apinqa + "/api/rm/emob/adhoc/traveldesk/vehicletypes/v1?programid=",
    travelDeskVehiclesPolicy: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/vehicletype/policy/v1"
        : apinqa + "/api/rm/emob/adhoc/traveldesk/vehicletype/policy/v1",
    travelDeskRentalModel: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/rentalmodels/v1"
        : apinqa + "/api/rm/emob/adhoc/traveldesk/rentalmodels/v1",
    travelDeskCountries: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/countries/v1?siteid="
        : apinqa + "/api/rm/emob/adhoc/traveldesk/countries/v1?siteid=",
    travelDeskCostCenters: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/costcenters/v1?siteid="
        : apinqa + "/api/rm/emob/adhoc/traveldesk/costcenters/v1?siteid=",
    travelDeskProgram: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/programs/v1?siteid="
        : apinqa + "/api/rm/emob/adhoc/traveldesk/programs/v1?siteid=",
    travelDeskProgramDtl: prod
        ? apin + "/api/rm/emob/adhoc/programdetail/v3"
        : apinqa + "/api/rm/emob/adhoc/programdetail/v3",
    travelDeskTrips: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/triptypes/v1?programid="
        : apinqa + "/api/rm/emob/adhoc/traveldesk/triptypes/v1?programid=",
    travelDeskTripsV2: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/triptypes/v2?programid="
        : apinqa + "/api/rm/emob/adhoc/traveldesk/triptypes/v2?programid=",
    travelDeskLocations: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/locations/v1?siteid="
        : apinqa + "/api/rm/emob/adhoc/traveldesk/locations/v1?siteid=",
    travelDeskAirportLocations: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/cityairport/v1?siteid="
        : apinqa + "/api/rm/emob/adhoc/traveldesk/cityairport/v1?siteid=",
    travelDeskEmployeeSearch: prod
        ? apin + "/api/rm/emob/profile/autocomplete/v1?searchText="
        : apinqa + "/api/rm/emob/profile/autocomplete/v1?searchText=",
    travelDeskEmployeeLocation: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/employeelocation/v1?locationType="
        : apinqa + "/api/rm/emob/adhoc/traveldesk/employeelocation/v1?locationType=",
    travelDeskTimeDistance: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/timedistance/v1"
        : apinqa + "/api/rm/emob/adhoc/traveldesk/timedistance/v1",
    SAVE_TRAVEL_DESK: prod
        ? apin + "/api/rm/emob/adhoc/traveldesk/save/v3"
        : apinqa + "/api/rm/emob/adhoc/traveldesk/save/v3",
    GET_DRIVER_RATING: prod
        ? apin + "/api/rm/emob/driver/rating/v1?driverId="
        : apinqa + "/api/rm/emob/driver/rating/v1?driverId=",
    GET_COVID_INIT: prod
        ? apin + "/api/rm/emob/covid/resources/attributes/v1"
        : apinqa + "/api/rm/emob/covid/resources/attributes/v1",
    GET_COVID_RESOURCE: prod
        ? apin + "/api/rm/emob/covid/resources/v1?typeId="
        : apinqa + "/api/rm/emob/covid/resources/v1?typeId=",
    SAVE_COVID_RESOURCE: prod
        ? apin + "/api/rm/emob/covid/resources/v1"
        : apinqa + "/api/rm/emob/covid/resources/v1",
    SAVE_COVID_REQUEST:prod
        ? apin + "/api/rm/emob/covid/resources/request/v1"
        : apinqa + "/api/rm/emob/covid/resources/request/v1",
    SEARCH_COVID_RESOURCE:prod
        ? apin + "/api/rm/emob/covid/resources/all/v1?typeId="
        : apinqa + "/api/rm/emob/covid/resources/all/v1?typeId="
        
};