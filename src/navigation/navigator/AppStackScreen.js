import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Home from '../../screens/home/Home';
// import AppStackAppBar from '../components/AppStackAppbar';
import {StyleSheet, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import RosterCalendar from '../../screens/mobxRoster/RosterCalendar';
import RosterCreate from '../../screens/mobxRoster/RosterCreate';
import RosterUpdate from '../../screens/mobxRoster/RosterUpdate';
import RosterShiftPicker from '../../screens/mobxRoster/RosterShiftPicker';
import RosterOfficePicker from '../../screens/mobxRoster/RosterOfficePicker';
import RosterPickUpDrop from '../../screens/mobxRoster/RosterPickUpDrop';
import RosterMultiCancel from '../../screens/mobxRoster/RosterMultiCancel';
import MyTripsMobx from '../../stores/MyTripsMobx';
import { roster } from '../../utils/ConstantString';
import Optout from '../../features/Optout';
import ETicket from '../../features/Shuttle/ETicket';
import CategoryFeedback from '../../features/feedback/CategoryFeedback';
import SubCategoryFeedback from '../../features/feedback/SubCategoryFeedback';
import AddComment from '../../features/feedback/AddComment';
import MapPicker from '../../features/MapPicker';
import GetFlexiCabs from '../../features/GetFlexiCabs';
import AnimatedMarkers from '../../features/AnimatedMarkers';
import TrackVehicle from '../../features/TrackVehicle';
import EmployeeProfile from '../../screens/home/EmployeeProfile';
import ChangePassword from '../../screens/registerAccount/ChangePassword';
import GuardDetails from '../../features/GuardDetails';
import MyTickets from '../../features/feedback/MyTickets';
import GeneralFeedback from '../../features/feedback/GeneralFeedback';
import Categories from '../../features/feedback/Categories';
import SubCategory from '../../features/feedback/SubCategory';
import Comments from '../../features/feedback/Comments';
import MyTicketDetails from '../../features/feedback/MyTicketDetails';
import GeneralComments from '../../features/feedback/GeneralComments';
import RecentTrips from '../../features/feedback/RecentTrips';
import FeedbackTabs from '../../features/feedback/FeedbackTabs';
import NotificationList from '../../screens/notification/NotificationList';

import OfficePicker from "../../screens/roster/customeComponent/OfficePicker";
import AddressPicker from "../../screens/roster/customeComponent/AddressPicker";
import TimePicker from "../../screens/roster/customeComponent/TimePicker";

import FullHTMLView from "../../features/FullHTMLView";
import PickupDropPicker from "../../utils/PickUpDropPicker";
import FixedRouteList from "../../features/FixedRoute/FixedRouteList";
import QRScanner from "../../features/FixedRoute/QRScanner";
import SearchRoutes from "../../features/FixedRoute/SearchRoutes";
import FindMyCategory from "../../features/FixedRoute/FindMyCategory";
import FixedRouteDetails from "../../features/FixedRoute/FixedRouteDetails";
import BusPassBooking from "../../features/FixedRoute/BusPassBooking";
import FixedRouteTrackVehicle from "../../features/FixedRoute/FixedRouteTrackVehicle";
import SeatBooking from "../../features/FixedRoute/SeatBooking";
import Bookings from "../../features/FixedRoute/Bookings"
import MyUsage from "../../features/FixedRoute/MyUsage"

import ShuttleRouteList from "../../features/Shuttle/ShuttleRouteList";
import ShuttleRouteDetails from "../../features/Shuttle/ShuttleRouteDetails";
import ShuttleBooking from "../../features/Shuttle/ShuttleBooking";
import TrackShuttle from "../../features/Shuttle/TrackShuttle";
import QRCode from "../../features/Shuttle/QRCode";
import ShuttleQRCode from "../../screens/shuttle/ShuttleQRCode"
import ShuttleQRCheckIn from "../../screens/shuttle/ShuttleQRCheckIn"
import ShuttleRouteListNEW from "../../screens/shuttle/ShuttleRouteList";
import ShuttleRouteListRoute from "../../screens/shuttle/ShuttleRouteListRoute";

import ShuttleRouteDetailsNEW from "../../screens/shuttle/ShuttleRouteDetails";
import ShuttleBookingNEW from "../../screens/shuttle/ShuttleBooking";

import ChatScreen from "../../features/Chat/ChatScreen";
import CustomFromAndToDateSelection from "../../screens/roster/customeComponent/CustomFromAndToDateSelection";
import FlexiFromLocation from "../../features/FlexiFromLocation";
import LocalityList from "../../screens/home/LocalityList";
import TermsAndConditions from "../../features/TermsAndConditions";
import Adhoc from "../../screens/adhoc/Adhoc";
import TravelDesk from "../../screens/adhoc/TravelDesk";
import ProgramSelector from "../../screens/adhoc/ProgramSelector";
import TripTypeSelector from "../../screens/adhoc/TripTypeSelector";
import LocationSelector from "../../screens/adhoc/LocationSelector";
import CostCenterSelector from "../../screens/adhoc/CostCenterSelector";
import LineManagerSelector from "../../screens/adhoc/LineManagerSelector";
import RentalModelSelector from "../../screens/adhoc/RentalModelSelector";
import MyStats from "../../features/MyStats";
import NonShiftTimeSelector from "../../screens/adhoc/NonShiftTimeSelector";
import AdhocLanding from "../../screens/adhoc/AdhocLanding";
import AdhocOfficeSelection from "../../screens/adhoc/AdhocOfficeSelection";
import AdhocDataSelection from "../../screens/adhoc/AdhocDataSelection";
import ShiftTimeSelector from "../../screens/adhoc/ShiftTimeSelector";
import TripPurpose from "../../screens/adhoc/TripPurpose";
import Flexi from "../../screens/adhoc/Flexi";
import HelpLandingPage from "../../features/covidhelp/HelpLandingPage";
import ResourceListing from "../../features/covidhelp/ResourceListing";
import CitySelection from "../../features/covidhelp/CitySelection";
import ResourceHelp from "../../features/covidhelp/ResourceHelp";
import SiteSelector from "../../screens/adhoc/SiteSelector";
import VehicleSelector from "../../screens/adhoc/VehicleSelector";
import VisitorSelector from "../../screens/adhoc/VisitorSelector";
import BusinessSelector from "../../screens/adhoc/BusinessSelector";
import SubBusinessSelector from "../../screens/adhoc/SubBusinessSelector";
import CountrySelector from "../../screens/adhoc/CountrySelector";
import TripSelector from "../../screens/adhoc/TripSelector";
import TDCostCenterSelector from "../../screens/adhoc/TDCostCenterSelector";
import TravellerDetail from "../../screens/adhoc/TravellerDetail";
import TravellerTypeSelector from "../../screens/adhoc/TravellerTypeSelector";
import FixedRouteCalendar from '../../screens/fixedRoute/FixedRouteCalendar';
import FixedRouteUpdate from '../../screens/fixedRoute/FixedRouteUpdate';
import FixedRouteDetailsNEW from '../../screens/fixedRoute/FixedRouteDetails';
import FixedRouteTrackVehicleNEW from '../../screens/fixedRoute/FixedRouteTrackVehicle';
import FixedRouteOfficePicker from '../../screens/fixedRoute/FixedRouteOfficePicker';
import FixedRoutePickUpDrop from '../../screens/fixedRoute/FixedRoutePickUpDrop';
import FixedRouteShiftPicker from '../../screens/fixedRoute/FixedRouteShiftPicker';
import FixedRoutePicker from '../../screens/fixedRoute/FixedRoutePicker';
import FixedRoutePassDetail from '../../screens/fixedRoute/FixedRoutePassDetail';
import ETicketNEW from '../../features/ETicket';
import SeatLayout from '../../screens/fixedRoute/SeatLayout';
import TravelDeskSite from '../../screens/traveldesk/TravelDeskSite';
import TravelDeskSponsor from '../../screens/traveldesk/TravelDeskSponsor';
import TravelDeskTraveller from '../../screens/traveldesk/TravelDeskTraveller';
import TravelDeskMetadata from '../../screens/traveldesk/TravelDeskMetadata';
import TravelDeskReview from '../../screens/traveldesk/TravelDeskReview';
import VendorSelector from '../../screens/adhoc/VendorSelector';
import EmployeeSelector from '../../screens/adhoc/EmployeeSelector';
import TravelDeskTermsAndCons from '../../screens/traveldesk/TravelDeskTermsAndCons';
import OfficeSelector from '../../screens/adhoc/OfficeSelector';

const AppStack = createStackNavigator();

const HeaderRight = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => {
      navigation.navigate('Home')
    }}>
      {/* <StandardText name="Cancel" style={styles.headerRight} /> */}
    </TouchableOpacity>
  );
};

// const HeaderRightWithIcon = () => (
//   <>
//     <AppBarAction 
//       color={'orange'} 
//       icon="bell" 
//       onPress={() => {}}
//     />
//     <AppBarAction
//       color={'orange'}
//       icon="account-circle-outline"
//       onPress={() => {}}
//     />
//   </>
// );

const AppStackScreen = () => (
  <AppStack.Navigator
    initialRouteName="Home"
    screenOptions={{
      // header: props => <AppStackAppBar {...props} />,
      headerStyle: styles.headerStyle,
      // headerTintColor: '#fff',
      // headerShadowVisible: true,
    }}>
    <AppStack.Screen
      name="Home"
      component={Home}
      options={{
        headerShown: false,
        title: 'Routematic',
        headerBackVisible: false,
      }}
    />
    <AppStack.Screen
      name="Optout"
      component={Optout}
      options={{
        headerShown: true,
        title: 'Optout',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="ETicket"
      component={ETicket}
      options={{
        headerShown: true,
        title: 'E-Ticket',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="ETicketNEW"
      component={ETicketNEW}
      options={{
        headerShown: true,
        title: 'E-Ticket',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="Notifications"
      component={NotificationList}
      options={{
        headerShown: true,
        title: 'Notifications',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="CategoryFeedback"
      component={CategoryFeedback}
      options={{
        headerShown: true,
        title: 'Feedback Categories',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="SubCategoryFeedback"
      component={SubCategoryFeedback}
      options={{
        headerShown: true,
        title: 'Sub Categories',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="AddComment"
      component={AddComment}
      options={{
        headerShown: true,
        title: 'Comments',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="MapPicker"
      component={MapPicker}
      options={{
        headerShown: false,
        title: 'Map Picker',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="GetFlexiCabs"
      component={GetFlexiCabs}
      options={{
        headerShown: false
      }}
    />
    <AppStack.Screen
      name="AnimatedMarkers"
      component={AnimatedMarkers}
      options={{
        headerShown: true,
        title: 'AnimatedMarkers',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="TrackVehicle"
      component={TrackVehicle}
      options={{
        headerShown: false,
        title: 'Track Vehicle',
        headerBackVisible: true,
      }}
    />

    <AppStack.Screen
      name="RosterCalendar"
      component={RosterCalendar}
      options={{
        title: 'Schedule',
      }}
    />
    <AppStack.Screen
      name="RosterCreate"
      component={RosterCreate}
      options={{
        title: 'Create Rosters',
      }}
    />
    <AppStack.Screen
      name="RosterUpdate"
      component={RosterUpdate}
      options={({ route }) => {
        return {
          headerShown: true,
          title: 'Roster Update' // `${route.params.title}`,
        };
      }}
    />
    <AppStack.Screen
      name="RosterShiftPicker"
      component={RosterShiftPicker}
      options={({ route }) => {
        return {
          headerShown: false,
          title: route.params.type === roster.login ? "Select Reach At" : "Select Start At",
        }
      }}
    />
    <AppStack.Screen
      name="RosterOfficePicker"
      component={RosterOfficePicker}
      options={{
        headerShown: false,
        title: 'Select Office Location'
      }}
    />
    <AppStack.Screen
      name="RosterPickUpDrop"
      component={RosterPickUpDrop}
      options={({ route }) => {
        return {
          headerShown: false,
          title: 'Select Home Location' // route.params.type === roster.login ? "Select Reach At" : "Select Start At"
        }
      }}
    />
    <AppStack.Screen
      name="RosterMultiCancel"
      component={RosterMultiCancel}
      options={({ route }) => {
        return {
          headerShown: true,
          title: 'No-show/Cancel Trips' // route.params.type === roster.login ? "Select Reach At" : "Select Start At"
        }
      }}
    />

    <AppStack.Screen
      name="MyTripsMobx"
      component={MyTripsMobx}
      options={{
        headerShown: true,
        title: 'My Trips',
        headerBackVisible: true,
      }}
    />

    <AppStack.Screen
      name="FullHTMLView"
      component={FullHTMLView}
      options={{
        headerShown: true,
        title: 'Announcement',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="PickupDropPicker"
      component={PickupDropPicker}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="AddressPicker"
      component={AddressPicker}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="OfficePicker"
      component={OfficePicker}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="TimePicker"
      component={TimePicker}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="ShuttleRouteList"
      component={ShuttleRouteList}
      options={{
        headerShown: true,
        title: 'Shuttle Routes',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="SearchRoutes"
      component={SearchRoutes}
      options={{
        headerShown: true,
        title: 'Search Routes',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="FixedRouteDetails"
      component={FixedRouteDetails}
      options={{
        headerShown: true,
        title: 'Fixed Route Detail',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="FixedRouteList"
      component={FixedRouteList}
      options={{
        headerShown: true,
        title: 'Routes',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="BusPassBooking"
      component={BusPassBooking}
      options={{
        headerShown: true,
        title: 'Bus Pass',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="ShuttleRouteDetails"
      component={ShuttleRouteDetails}
      options={{
        headerShown: true,
        title: 'Shuttle Route Detail',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="QRCode"
      component={QRCode}
      options={{
        headerShown: true,
        title: 'Shuttle Pass',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="ShuttleQRCode"
      component={ShuttleQRCode}
      options={{
        headerShown: true,
        title: 'Scan QR Code',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="ShuttleRouteListNEW"
      component={ShuttleRouteListNEW}
      options={{
        headerShown: true,
        title: 'Shuttle Routes',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="ShuttleRouteListRoute"
      component={ShuttleRouteListRoute}
      options={{
        headerShown: true,
        title: 'Shuttle Routes',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="ShuttleRouteDetailsNEW"
      component={ShuttleRouteDetailsNEW}
      options={{
        headerShown: true,
        title: 'Shuttle Route Detail',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="ShuttleBookingNEW"
      component={ShuttleBookingNEW}
      options={{
        headerShown: true,
        title: 'Shuttle Booking',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="ShuttleQRCheckIn"
      component={ShuttleQRCheckIn}
      options={{
        headerShown: true,
        title: 'Check In',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="QRScanner"
      component={QRScanner}
      options={{
        headerShown: true,
        title: 'Scan QR Code',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="FindMyCategory"
      component={FindMyCategory}
      options={{
        headerShown: true,
        title: 'Find My Category',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="ShuttleBooking"
      component={ShuttleBooking}
      options={{
        headerShown: true,
        title: 'Shuttle Booking',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="TrackShuttle"
      component={TrackShuttle}
      options={{
        headerShown: true,
        title: 'Track Shuttle',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="ChatScreen"
      component={ChatScreen}
      options={{
        headerShown: true,
        title: 'Chat',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="CustomFromAndToDateSelection"
      component={CustomFromAndToDateSelection}
      options={{
        headerShown: true,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="FlexiFromLocation"
      component={FlexiFromLocation}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="FixedRouteTrackVehicle"
      component={FixedRouteTrackVehicle}
      options={{
        headerShown: true,
        title: 'Track Vehicle',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="SeatBooking"
      component={SeatBooking}
      options={{
        headerShown: true,
        title: 'Book Seat',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="Bookings"
      component={Bookings}
      options={{
        headerShown: true,
        title: 'My Trips',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="MyUsage"
      component={MyUsage}
      options={{
        headerShown: true,
        title: 'My Usage',
        headerBackVisible: true,
      }}
    />

    <AppStack.Screen
      name="FixedRouteCalendar"
      component={FixedRouteCalendar}
      options={{
        headerShown: true,
        title: 'Fixed Routes',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="FixedRoutePassDetail"
      component={FixedRoutePassDetail}
      options={({route}) => {
        return {
          headerShown: true,
          title: `${route.params.title}`,
          headerBackVisible: true,
        }
      }}
    />
    <AppStack.Screen
      name="FixedRouteUpdate"
      component={FixedRouteUpdate}
      options={{
        headerShown: true,
        title: 'Fixed Route Booking',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="FixedRouteOfficePicker"
      component={FixedRouteOfficePicker}
      options={{
        headerShown: false,
        title: 'Select Office',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="FixedRoutePickUpDrop"
      component={FixedRoutePickUpDrop}
      options={{
        headerShown: false,
        title: 'Select Nodal Point',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="FixedRouteShiftPicker"
      component={FixedRouteShiftPicker}
      options={{
        headerShown: false,
        title: 'Select Shift Time',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="FixedRoutePicker"
      component={FixedRoutePicker}
      options={{
        headerShown: false,
        title: 'Select Shift Time',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="FixedRouteDetailsNEW"
      component={FixedRouteDetailsNEW}
      options={{
        headerShown: true,
        title: 'Fixed Route Detail',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="FixedRouteTrackVehicleNEW"
      component={FixedRouteTrackVehicleNEW}
      options={{
        headerShown: true,
        title: 'Track Vehicle',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="SeatLayout"
      component={SeatLayout}
      options={{
        headerShown: true,
        title: 'Seat Layout',
        headerBackVisible: true,
      }}
    />

    <AppStack.Screen
      name="EmployeeProfile"
      component={EmployeeProfile}
      options={{
        headerShown: true,
        title: 'My Profile',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="ChangePassword"
      component={ChangePassword}
      options={{
        headerShown: true,
        title: 'Change Password',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="LocalityList"
      component={LocalityList}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="TermsAndConditions"
      component={TermsAndConditions}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="Adhoc"
      component={Adhoc}
      options={{
        headerShown: true,
        title: 'Non Shift Adhoc',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="TravelDesk"
      component={TravelDesk}
      options={{
        headerShown: true,
        title: 'Travel Request',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="TravellerDetail"
      component={TravellerDetail}
      options={{
        headerShown: true,
        title: 'Traveller Detail',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="TravelDeskSite"
      component={TravelDeskSite}
      options={{
        headerShown: true,
        title: 'Travel Request',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="TravelDeskSponsor"
      component={TravelDeskSponsor}
      options={{
        headerShown: true,
        title: 'Travel Request',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="TravelDeskTraveller"
      component={TravelDeskTraveller}
      options={{
        headerShown: true,
        title: 'Travel Request',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="TravelDeskMetadata"
      component={TravelDeskMetadata}
      options={{
        headerShown: true,
        title: 'Travel Request',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="TravelDeskReview"
      component={TravelDeskReview}
      options={{
        headerShown: true,
        title: 'Travel Request',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="SiteSelector"
      component={SiteSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="VehicleSelector"
      component={VehicleSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="VisitorSelector"
      component={VisitorSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="BusinessSelector"
      component={BusinessSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="SubBusinessSelector"
      component={SubBusinessSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="CountrySelector"
      component={CountrySelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="TripSelector"
      component={TripSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="ProgramSelector"
      component={ProgramSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="TripTypeSelector"
      component={TripTypeSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="TravellerTypeSelector"
      component={TravellerTypeSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="RentalModelSelector"
      component={RentalModelSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="LocationSelector"
      component={LocationSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="TripPurpose"
      component={TripPurpose}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="CostCenterSelector"
      component={CostCenterSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="TDCostCenterSelector"
      component={TDCostCenterSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="LineManagerSelector"
      component={LineManagerSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="VendorSelector"
      component={VendorSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="EmployeeSelector"
      component={EmployeeSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="OfficeSelector"
      component={OfficeSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="TravelDeskTermsAndCons"
      component={TravelDeskTermsAndCons}
      options={{
        headerShown: true,
        title: 'Terms & Conditions',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="MyStats"
      component={MyStats}
      options={{
        headerShown: true,
        title: 'My Trip Status',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="HelpLandingPage"
      component={HelpLandingPage}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="ResourceListing"
      component={ResourceListing}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="ResourceHelp"
      component={ResourceHelp}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="NonShiftTimeSelector"
      component={NonShiftTimeSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="GuardDetails"
      component={GuardDetails}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="AdhocLanding"
      component={AdhocLanding}
      options={{
        headerShown: true,
        title: 'Adhoc',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="AdhocOfficeSelection"
      component={AdhocOfficeSelection}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="Flexi"
      component={Flexi}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="CitySelection"
      component={CitySelection}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="AdhocDataSelection"
      component={AdhocDataSelection}
      options={({ route }) => {
        return {
          headerShown: true,
          title: `${route.params.title}`,
          headerBackVisible: true,
        };
      }}
    />
    <AppStack.Screen
      name="ShiftTimeSelector"
      component={ShiftTimeSelector}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="FeedbackTabs"
      component={FeedbackTabs}
      options={{
        headerShown: true,
        title: 'Feedback',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="RecentTrips"
      component={RecentTrips}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="MyTickets"
      component={MyTickets}
      options={{
        headerShown: false,
        title: '',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="GeneralFeedback"
      component={GeneralFeedback}
      options={{
        headerShown: true,
        title: 'General Feedback',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="Categories"
      component={Categories}
      options={{
        headerShown: true,
        title: 'Categories',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="SubCategory"
      component={SubCategory}
      options={{
        headerShown: true,
        title: 'Sub Categories',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="Comments"
      component={Comments}
      options={{
        headerShown: true,
        title: 'Comments',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="MyTicketDetails"
      component={MyTicketDetails}
      options={{
        headerShown: true,
        title: 'Ticket Details',
        headerBackVisible: true,
      }}
    />
    <AppStack.Screen
      name="GeneralComments"
      component={GeneralComments}
      options={{
        headerShown: true,
        title: 'Comments',
        headerBackVisible: true,
      }}
    />

  </AppStack.Navigator>
);

export default AppStackScreen;

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: '#fff',
    borderBottomColor: '#d4d4d4',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderWidth: 2,
    elevation: 20,
    shadowColor: '#52006A',
    shadowOpacity: 0.5,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,

    // fontFamily: 'Poppins',
    // fontSize: 16,
    // fontWeight: '500',
    // lineHeight: 16,
    // letterSpacing: 0.15,
    // color: '#022B5F',
  },
  headerRight: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16,
    marginRight: 10,
    textAlign: 'right',
    color: '#F25E00',
    textTransform: 'uppercase',
  },
});
