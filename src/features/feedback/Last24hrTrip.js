import React, { Component } from "react";
import moment from "moment";
import {
  Alert,
  Platform,
  StatusBar,
  Text,
  View,
  ActivityIndicator
} from "react-native";
import { API } from "../../network/apiFetch/API";
import { URL } from "../../network/apiConstants";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import { Body, Card, CardItem, Content } from "native-base";
import StarRating from "react-native-star-rating";
import { colors } from "../../utils/Colors";
import { spinner } from "../../network/loader/Spinner";
import { RefreshControl } from "./Feedback";

class Last24hrTrip extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Rate your last trip",
      headerTitleStyle: { fontFamily: "Roboto" }
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      feedbackLast24hrTrip: {
        tripId: "000064277-1",
        shiftTime: "2018-09-14T16:30:00",
        shiftTimeString: "16:30",
        driverName: "Ramu6",
        vehicleRegNo: "56465",
        tripType: "Pickup",
        feedbackRating: 5.0,
        checkInStatus: false
      },
      access_token: "",
      UserId: "",
      CustomerUrl: "",
      lastRatedDate: "",
      isLoading: false
    };
  }
  componentDidMount() {
    this.subs = [
      this.props.navigation.addListener("blur", () =>
        this.setState({ isLoading: false })
      )
    ];

    const { navigation, route } = this.props;
    const feedbackLast24hrTrip = route.params.feedbackLast24hrTrip
    // ",
    //   {}
    // );
    const access_token = route.params.access_token // ", "");
    const UserId = route.params.UserId // ", "");
    const CustomerUrl = route.params.CustomerUrl // ", "");
    const lastRatedDate = route.params.lastRatedDate // ", "");
    this.setState({
      feedbackLast24hrTrip,
      access_token,
      UserId,
      CustomerUrl,
      lastRatedDate
    });
  }
  navigationHandler(page, body) {
    const { navigate } = this.props.navigation;
    navigate(page, body);
  }
  _goback() {
    const { goBack } = this.props.navigation;
    setTimeout(function() {
      goBack();
    }, 500);
  }
  _onRefresh() {
    //Dummy method to override Feedback method
  }
  onStarRatingPress(rating, item) {
    if (item.feedbackRating > 0) return;
    var momentDate = moment(item.shiftTime);
    var hour = momentDate.hours();
    var minutes = momentDate.minutes();
    let body = {
      tripId: item.tripId,
      shiftDate: item.shiftTime,
      shiftTime: hour + ":" + minutes,
      rating: rating,
      devicecode: this.state.UserId,
      categoryId: "",
      subCategoryId: "",
      comments: "",
      apiurl: this.state.CustomerUrl
    };
    var additionalFB = true;
    if (item.baseRating == "0") { // no additional fb
        additionalFB = false;
    } else if (item.baseRating == "3") {
        if (rating < 4) additionalFB = true
        else additionalFB = false;
    } else if (item.baseRating == "5") { // any rating give additional fb
        additionalFB = true;
    }
    if (additionalFB) { // rating < 4
      const { navigate } = this.props.navigation;
      this.setState({ isLoading: true });
      let feedback = {
        tripId: item.tripId,
        shiftDate: item.shiftTime,
        shiftTime: hour + ":" + minutes,
        rating: rating
      };
      let response = API.fetchXGET(
        URL.FEEDBACK_CATEGORIES +
          "devicecode=" +
          this.state.UserId +
          "&apiurl=" +
          this.state.CustomerUrl,
        this.state.access_token
      );
      handleResponse.getFeedbackCategories(
        response,
        this,
        navigate,
        feedback,
        "Last24hrTrips"
      );

      /*this.navigationHandler("CategoryFeedback", {
        tripId: item.tripId,
        shiftDate: item.shiftTime,
        shiftTime: hour + ":" + minutes,
        rating: rating,
        devicecode: this.state.UserId,
        apiurl: this.state.CustomerUrl,
        action: "Last24hrTrips"
      });*/
    } else {
      Alert.alert(
        "Feedback",
        "Do you want to submit the rating?",
        [
          {
            text: "No",
            onPress: () => {},
            style: "cancel"
          },
          {
            text: "Yes",
            onPress: () => {
              this.setState({ isLoading: true });
              let response = API.fetchJSON(
                URL.FEEDBACK_SUBMIT,
                body,
                this.state.access_token
              );
              handleResponse.submitFeedback(
                response,
                this,
                rating,
                "Last24hrTrips",
                this.state.lastRatedDate
              );
            }
          }
        ],
        { cancelable: true }
      );
    }
  }
  render() {
    if (this.state.isLoading)
      return (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1
          }}
        >
          <StatusBar
            barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
          />
          <ActivityIndicator />
          <Text style={{ color: colors.BLACK, marginTop: 20 }}>
            Please wait...
          </Text>
        </View>
      );

    return (
      <Content padder>
        {this._renderStatusbar()}
        <Card style={{ flex: 1 }}>
          <CardItem header bordered>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between"
              }}
            >
              <Text style={{ fontSize: 20 }}>
                {this.state.feedbackLast24hrTrip.tripType}
              </Text>

              <Text style={{ fontSize: 18 }}>
                {this.state.feedbackLast24hrTrip.tripId}
              </Text>
            </View>
          </CardItem>
          <CardItem bordered>
            <Body>
              <Text style={{ fontSize: 16, color: "#111" }}>
                {moment(this.state.feedbackLast24hrTrip.shiftTime).format(
                  "DD MMM YYYY hh:mmA"
                )}
              </Text>
              <Text style={{ fontSize: 16, color: "#111" }}>
                {this.state.feedbackLast24hrTrip.driverName}
              </Text>
              <Text style={{ fontSize: 16, color: "#111" }}>
                {this.state.feedbackLast24hrTrip.vehicleRegNo}
              </Text>
            </Body>
          </CardItem>
          <CardItem
            footer
            bordered
            style={{
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "center"
            }}
          >
            <StarRating
              disabled={false}
              emptyStar={"ios-star-outline"}
              fullStar={"ios-star"}
              halfStar={"ios-star-half"}
              iconSet={"Ionicons"}
              maxStars={5}
              rating={this.state.feedbackLast24hrTrip.feedbackRating}
              selectedStar={rating =>
                this.onStarRatingPress(rating, this.state.feedbackLast24hrTrip)
              }
              fullStarColor={colors.YELLOW}
              starSize={35}
            />
          </CardItem>
          {/*<CardItem
            footer
            bordered
            style={{
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "center"
            }}
          >
            <Button
              style={{ width: "100%" }}
              primary
              full
              onPress={() => this._goback()}
            >
              <Text style={{ color: colors.WHITE }}>Close</Text>
            </Button>
          </CardItem>*/}
        </Card>
      </Content>
    );
  }

  _renderStatusbar = () => {
    return Platform.OS === "ios" ? (
      <StatusBar barStyle="dark-content" />
    ) : (
      <StatusBar barStyle="light-content" />
    );
  };
}

Last24hrTrip.propTypes = {};

export default Last24hrTrip;
