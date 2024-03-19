import {createStackNavigator} from "@react-navigation/native";
import Home from "../screens/home/Home";
import Roster from "../screens/roster/Roster";
import ETicket from "../features/Shuttle/ETicket";
import ViewModifyRoster from "../screens/roster/ViewModifyRoster";
import CalendarPicker from "../screens/roster/CalendarPicker";
import CalendarPickerCallBack from "../screens/roster/CalendarPickerCallBack";
import CreateRoster from "../screens/roster/CreateRoster";
import CreateRosterNew from "../screens/roster/CreateRosterNew";
import OfficePicker from "../screens/roster/customeComponent/OfficePicker";
import AddressPicker from "../screens/roster/customeComponent/AddressPicker";
import TimePicker from "../screens/roster/customeComponent/TimePicker";
import ChangePassword from "../screens/registerAccount/ChangePassword";
import Feedback from "../features/feedback/Feedback";
import CategoryFeedback from "../features/feedback/CategoryFeedback";
import SubCategoryFeedback from "../features/feedback/SubCategoryFeedback";
import AddComment from "../features/feedback/AddComment";
import GetFlexiCabs from "../../src/features/GetFlexiCabs";
import MapPicker from "../../src/features/MapPicker";
import AnimatedMarkers from "../../src/features/AnimatedMarkers";
import TrackVehicle from "../../src/features/TrackVehicle";
import Last24hrTrip from "../../src/features/feedback/Last24hrTrip";
import QRCode from "../../src/features/Shuttle/QRCode";
import FullHTMLView from "../../src/features/FullHTMLView";
import PickupDropPicker from "../utils/PickUpDropPicker";
import ShuttleRouteList from "../features/Shuttle/ShuttleRouteList";
import FixedRouteList from "../features/FixedRoute/FixedRouteList";
import QRScanner from "../features/FixedRoute/QRScanner";
import SearchRoutes from "../features/FixedRoute/SearchRoutes";
import FindMyCategory from "../features/FixedRoute/FindMyCategory";
import FixedRouteDetails from "../features/FixedRoute/FixedRouteDetails";

import BusPassBooking from "../features/FixedRoute/BusPassBooking";
import ShuttleRouteDetails from "../features/Shuttle/ShuttleRouteDetails";

import ShuttleBooking from "../features/Shuttle/ShuttleBooking";
import TrackShuttle from "../features/Shuttle/TrackShuttle";
import ChatScreen from "../../src/features/Chat/ChatScreen";
import Optout from "../features/Optout";
import CustomFromAndToDateSelection from "../screens/roster/customeComponent/CustomFromAndToDateSelection";
import FlexiFromLocation from "../features/FlexiFromLocation";
import FixedRouteTrackVehicle from "../features/FixedRoute/FixedRouteTrackVehicle";
import SeatBooking from "../features/FixedRoute/SeatBooking";
import Bookings from "../features/FixedRoute/Bookings"
import MyUsage from "../features/FixedRoute/MyUsage"
import EmployeeProfile from "../screens/home/EmployeeProfile";
import LocalityList from "../screens/home/LocalityList";
import MyTripsMobx from "../stores/MyTripsMobx";
import RosterUpdate from "../screens/mobxRoster/RosterUpdate";
import RosterCalendar from "../screens/mobxRoster/RosterCalendar";
import RosterOfficePicker from "../screens/mobxRoster/RosterOfficePicker";
import RosterShiftPicker from "../screens/mobxRoster/RosterShiftPicker";
import RosterPickUpDrop from "../screens/mobxRoster/RosterPickUpDrop";
import RosterCreate from "../screens/mobxRoster/RosterCreate";
import RosterMultiCancel from "../screens/mobxRoster/RosterMultiCancel";
import TermsAndConditions from "../features/TermsAndConditions";
import Adhoc from "../screens/adhoc/Adhoc";
import TravelDesk from "../screens/adhoc/TravelDesk";
import ProgramSelector from "../screens/adhoc/ProgramSelector";
import TripTypeSelector from "../screens/adhoc/TripTypeSelector";
import LocationSelector from "../screens/adhoc/LocationSelector";
import CostCenterSelector from "../screens/adhoc/CostCenterSelector";
import LineManagerSelector from "../screens/adhoc/LineManagerSelector";
import RentalModelSelector from "../screens/adhoc/RentalModelSelector";
import MyStats from "../features/MyStats";
import NonShiftTimeSelector from "../screens/adhoc/NonShiftTimeSelector";
import GuardDetails from "../features/GuardDetails";
import FeedbackTabs from "../features/feedback/FeedbackTabs";
import RecentTrips from "../features/feedback/RecentTrips";
import MyTickets from "../features/feedback/MyTickets";
import GeneralFeedback from "../features/feedback/GeneralFeedback";
import Categories from "../features/feedback/Categories";
import SubCategory from "../features/feedback/SubCategory";
import Comments from "../features/feedback/Comments";
import MyTicketDetails from "../features/feedback/MyTicketDetails";
import GeneralComments from "../features/feedback/GeneralComments";
import AdhocLanding from "../screens/adhoc/AdhocLanding";
import AdhocOfficeSelection from "../screens/adhoc/AdhocOfficeSelection";
import AdhocDataSelection from "../screens/adhoc/AdhocDataSelection";
import ShiftTimeSelector from "../screens/adhoc/ShiftTimeSelector";
import TripPurpose from "../screens/adhoc/TripPurpose";
import Flexi from "../screens/adhoc/Flexi";
import HelpLandingPage from "../features/covidhelp/HelpLandingPage";
import ResourceListing from "../features/covidhelp/ResourceListing";
import CitySelection from "../features/covidhelp/CitySelection";
import ResourceHelp from "../features/covidhelp/ResourceHelp";
import SiteSelector from "../screens/adhoc/SiteSelector";
import VehicleSelector from "../screens/adhoc/VehicleSelector";
import VisitorSelector from "../screens/adhoc/VisitorSelector";
import BusinessSelector from "../screens/adhoc/BusinessSelector";
import SubBusinessSelector from "../screens/adhoc/SubBusinessSelector";
import CountrySelector from "../screens/adhoc/CountrySelector";
import TripSelector from "../screens/adhoc/TripSelector";
import TDCostCenterSelector from "../screens/adhoc/TDCostCenterSelector";
import TravellerDetail from "../screens/adhoc/TravellerDetail";
import TravellerTypeSelector from "../screens/adhoc/TravellerTypeSelector";
// import ListScreen from "../utils/ListScreen";

const AuthStackNavigator = createStackNavigator(
    {
        Home: {
            screen: Home,
            navigationOptions: {
                headerBackTitle: "Home"
            }
        },
        Optout: {screen: Optout}, //Nipun Added
        Roster: {screen: Roster},
        ETicket: {screen: ETicket},
        CalendarPicker: {screen: CalendarPicker},
        CreateRoster: {screen: CreateRoster},
        CreateRosterNew: {screen: CreateRosterNew},
        ChangePassword: {screen: ChangePassword},
        Feedback: {screen: Feedback},
        CategoryFeedback: {screen: CategoryFeedback},
        SubCategoryFeedback: {screen: SubCategoryFeedback},
        AddComment: {screen: AddComment},
        MapPicker: {screen: MapPicker},
        GetFlexiCabs: {screen: GetFlexiCabs},
        AnimatedMarkers: {screen: AnimatedMarkers},
        TrackVehicle: {screen: TrackVehicle},
        CalendarPickerCallBack: {screen: CalendarPickerCallBack},
        Last24hrTrip: {screen: Last24hrTrip},
        FullHTMLView: {screen: FullHTMLView},
        PickupDropPicker: {screen: PickupDropPicker},
        AddressPicker: {screen: AddressPicker},
        OfficePicker: {screen: OfficePicker},
        TimePicker: {screen: TimePicker},
        ViewModifyRoster: {screen: ViewModifyRoster},
        ShuttleRouteList: {screen: ShuttleRouteList},
        SearchRoutes: {screen: SearchRoutes},
        FixedRouteDetails: {screen: FixedRouteDetails},
        FixedRouteList: {screen: FixedRouteList},
        BusPassBooking: {screen: BusPassBooking},
        ShuttleRouteDetails: {screen: ShuttleRouteDetails},
        QRCode: {screen: QRCode},
        FindMyCategory: {screen: FindMyCategory},
        QRScanner: {screen: QRScanner},
        ShuttleBooking: {screen: ShuttleBooking},
        TrackShuttle: {screen: TrackShuttle},
        ChatScreen: {screen: ChatScreen},
        CustomFromAndToDateSelection: {screen: CustomFromAndToDateSelection},
        FlexiFromLocation: {screen: FlexiFromLocation},
        FixedRouteTrackVehicle: {screen: FixedRouteTrackVehicle},
        SeatBooking: {screen: SeatBooking},
        Bookings: {screen: Bookings},
        MyUsage: {screen: MyUsage},
        EmployeeProfile: {screen: EmployeeProfile},
        LocalityList: {screen: LocalityList},
        MyTripsMobx: {screen: MyTripsMobx},
        RosterUpdate: {screen: RosterUpdate},
        RosterCalendar: {screen: RosterCalendar},
        RosterOfficePicker: {screen: RosterOfficePicker},
        RosterShiftPicker: {screen: RosterShiftPicker},
        RosterPickUpDrop: {screen: RosterPickUpDrop},
        RosterCreate: {screen: RosterCreate},
        RosterMultiCancel: {screen: RosterMultiCancel},
        TermsAndConditions: {screen: TermsAndConditions},
        Adhoc:{screen:Adhoc},
        TravelDesk:{screen:TravelDesk},
        TravellerDetail:{screen:TravellerDetail},
        SiteSelector:{screen:SiteSelector},
        VehicleSelector:{screen:VehicleSelector},
        VisitorSelector:{screen:VisitorSelector},
        BusinessSelector:{screen:BusinessSelector},
        SubBusinessSelector:{screen:SubBusinessSelector},
        CountrySelector:{screen:CountrySelector},
        TripSelector:{screen:TripSelector},
        ProgramSelector:{screen:ProgramSelector},
        TripTypeSelector:{screen:TripTypeSelector},
        TravellerTypeSelector:{screen:TravellerTypeSelector},
        RentalModelSelector:{screen:RentalModelSelector},
        LocationSelector:{screen:LocationSelector},
        TripPurpose:{screen:TripPurpose},
        CostCenterSelector:{screen:CostCenterSelector},
        TDCostCenterSelector:{screen:TDCostCenterSelector},
        LineManagerSelector:{screen:LineManagerSelector},
        MyStats:{screen:MyStats},
        HelpLandingPage:{screen:HelpLandingPage},
        ResourceListing:{screen:ResourceListing},
        ResourceHelp:{screen:ResourceHelp},
        NonShiftTimeSelector:{screen:NonShiftTimeSelector},
        GuardDetails:{screen:GuardDetails},
        AdhocLanding:{screen:AdhocLanding},
        AdhocOfficeSelection:{screen:AdhocOfficeSelection},
        Flexi:{screen:Flexi},
        CitySelection:{screen:CitySelection},
        AdhocDataSelection:{screen:AdhocDataSelection},
        ShiftTimeSelector:{screen:ShiftTimeSelector},
        // ListScreen :{screen:ListScreen},
        FeedbackTabs:{screen:FeedbackTabs, navigationOptions: () => ({
                headerBackTitle: null
            })},
        RecentTrips:{screen:RecentTrips},
        MyTickets:{screen:MyTickets},
        GeneralFeedback:{screen:GeneralFeedback,navigationOptions: () => ({
                headerBackTitle: null
            })},
        Categories:{screen:Categories,navigationOptions: () => ({
                headerBackTitle: null
            })},
        SubCategory:{screen:SubCategory,navigationOptions: () => ({
                headerBackTitle: null
            })},
        Comments:{screen:Comments},
        MyTicketDetails:{screen:MyTicketDetails,navigationOptions: () => ({
                headerBackTitle: null
            })},
        GeneralComments:{screen:GeneralComments,navigationOptions: () => ({
                headerBackTitle: null
            })}
        // WebViewComponent: { screen: WebViewComponent }
    },
    {
        initialRouteName: "Home" //"Home"
    }
);

export default AuthStackNavigator;
