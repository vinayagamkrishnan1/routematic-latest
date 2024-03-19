export const GetTripData={
    "Trips": [
        {
            "ShiftTime": "19-08-2021 11:50:00",
            "TripType": "D",
            "RouteNumber": "KA-02-AB-4284(maruthi swift)",
            "VehicleRegNo": "KA-02-AB-4284",
            "Location": "Tin Factory, Swami Vivekananda Road, Krishna Reddy Industrial Estate, Dooravani Nagar, Bengaluru, Karnataka, India",
            "ETA": "19-08-2021 12:20:11",
            "DriverName": "New driver4284",
            "DriverMobileNumber": "9895644284",
            "TrackeeID": "000007231",
            "VehicleID": "000007231",
            "RouteID": "000144858-1",
            "CurrentLocation": null,
            "Timestamp": null,
            "PickupLocation": "12.977496,77.636813",
            "DestinationLocation": "12.996993,77.669031",
            "TripStartTime": "19-08-2021 11:50:00",
            "TripEndTime": "19-08-2021 13:50:00",
            "SiteID": 26,
            "DriverPhoto": "https://nivaataqa1.routematic.com//content/Drivers/NotAvailable.jpg",
            "CoPassengers": null,
            "CheckinStatus": "0",
            "WayPointsPollingInMins": "5",
            "DriverTemp": null,
            "VehicleSanitizedDate": null,
            "ApprovalStatus": null,
            "Pin": "1234",
            "PinLabel": "T-Pin",
            "OTPType": "CI",
            "RouteIndex": 1,
            "SafeDropStatus": "0",
            "TPin": "1234",
            "IsGuardRequired": 0,
            "IsGuardDeployed": 1,
            "MobileTrackeeID": null,
            "DeviceTrackeeID": null,
            "TripID": "000144858-1",
            "PAX": 1,
            "ChatEnabled": "1",
            "DriverID": "000005493",
            //"vaccinationStatus":"Completed"
            //"vaccinationStatus":"Not Vaccinated"
            "vaccinationStatus":"Partially Done"
        }
    ],
    "CheckinCheckoutDisabled": false,
    "Status": "200",
    "Description": "Trip Available"
};
export const getTrackingData = {
    "status": "100",
    "data": [],
    "description": "No Data available"
};
export const wayPointData = {
    "data": {
        "employeeRouteIndex": 1,
        "guardRequired": false,
        "guardCheckedIn": 0,
        "trackeeID": 0,
        "actualTripStartTime": "",
        "actualTripEndTime": "",
        "expectedTripStartTime": "08/19/2021 11:50:00",
        "expectedTripEndTime": "08/19/2021 12:20:11",
        "wayPoints": [
            {
                "routeIndex": 1,
                "latitude": 12.9969931,
                "longitude": 77.66903,
                "reached": 0,
                "reachedPOIDistance": 0.0,
                "reachedPOITime": "",
                "proceed": 1,
                "proceedPOITime": "",
                "skipped": 0,
                "employeeCount": 1,
                "expectedStartTime": "08/19/2021 11:50:00",
                "actualStartTime": "",
                "expectedEndTime": "08/19/2021 12:20:11",
                "actualEndTime": "",
                "employeesInfo": [
                    {
                        "me": 1,
                        "employeeName": "Nitin1556",
                        "status": 1
                    }
                ]
            }
        ]
    },
    "status": {
        "code": 200
    }
};
export const driverRating = {
    "data": {
        "rating": 0.0
    },
    "status": {
        "code": 200
    }
};

export const GuardData={
    "data": {
        "guardName": "nitin",
        "vaccinationStatus": "Not Vaccinated"
    },
    "status": {
        "code": 200
    }
};