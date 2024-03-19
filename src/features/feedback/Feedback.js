/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  PanResponder,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StarRating from "react-native-star-rating";
import { colors } from "../../utils/Colors";
import moment from "moment";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import { URL } from "../../network/apiConstants/index";
import { asyncString } from "../../utils/ConstantString";
import { API } from "../../network/apiFetch/API";
import { SlideAnimation } from "react-native-popup-dialog";
import { spinner } from "../../network/loader/Spinner";
import { Box, Stack, Text } from "native-base";
import { TYPE } from "../../model/ActionType";
import { CryptoXor } from "crypto-xor";

const slideAnimation = new SlideAnimation({
  slideFrom: "bottom"
});

export default class Feedback extends Component<{}> {
  static navigationOptions = {
    title: "Rate your trip",
    headerTitleStyle: { fontFamily: "Roboto" }
  };
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      refreshing: false,
      access_token: "",
      UserId: "",
      DToken: "",
      CustomerUrl: "",
      isArray: true,
      isLoading: true,
      IdleTimeOutInMins: 0,
      isFeedback: true,
      lastRatedDate: ""
    }; //feedbackResponse.data,
  }
  callback = async (actionType, response, copyDataObj) => {
    //const { navigate } = this.props.navigation;
    switch (actionType) {
      case TYPE.FEEDBACK_PAST_TRIPS: {
        handleResponse.getFeedback(response, this, undefined);
        break;
      }

      case TYPE.FEEDBACK_CATEGORIES: {
        handleResponse.getFeedbackCategories(
          response,
          this,
          undefined,
          copyDataObj.feedback
        );
        break;
      }
      case TYPE.FEEDBACK_SUBMIT: {
        handleResponse.submitFeedback(
          response,
          this,
          copyDataObj.rating,
          copyDataObj.refresh,
          copyDataObj.lastRatedDate
        );

        break;
      }
    }
  };

  _keyExtractor(item, index) {
    return index.toString();
  }

  onStarRatingPress(rating, item) {
    if (item.feedbackRating > 0) return;
    var momentDate = moment(item.shiftTime);
    var hour = momentDate.hours();
    var minutes = momentDate.minutes();
    var seconds = momentDate.seconds();
    const { navigate } = this.props.navigation;
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
    if (rating < 4) {
      this.setState({
        refreshing: true
        //isLoading: true
      });
      let feedback = {
        tripId: item.tripId,
        shiftDate: item.shiftTime,
        shiftTime: hour + ":" + minutes,
        rating: rating
      };
      let response = API.newFetchXJSON(
        URL.FEEDBACK_CATEGORIES +
          "devicecode=" +
          this.state.UserId +
          "&apiurl=" +
          this.state.CustomerUrl,
        this.state.access_token,
        this.callback.bind(this),
        TYPE.FEEDBACK_CATEGORIES,
        { feedback }
      );
      //handleResponse.getFeedbackCategories(response, this, navigate, feedback);
    } else {
      Alert.alert(
        "Feedback",
        "Do you want to submit the rating?",
        [
          {
            text: "No",
            onPress: () => console.log("NO Pressed"),
            style: "cancel"
          },
          {
            text: "Yes",
            onPress: () => {
              this.setState({
                isLoading: true
              });
              API.newFetchJSON(
                URL.FEEDBACK_SUBMIT,
                body,
                this.state.access_token,
                this.callback.bind(this),
                TYPE.FEEDBACK_SUBMIT,
                {
                  rating,
                  refresh: "refresh",
                  lastRatedDate: this.state.lastRatedDate
                }
              );
              /* handleResponse.submitFeedback(
                response,
                this,
                rating,
                "refresh",
                this.state.lastRatedDate
              );*/
              //this._onRefresh();
            }
          }
        ],
        { cancelable: true }
      );
    }
  }

  getFeedbackData(access_token, UserId, CustomerUrl) {
    let url =
      URL.FEEDBACK_PAST_TRIPS +
      "devicecode=" +
      UserId +
      "&apiurl=" +
      CustomerUrl;
    API.newFetchXJSON(
      url,
      access_token,
      this.callback.bind(this),
      TYPE.FEEDBACK_PAST_TRIPS
    );
    //handleResponse.getFeedback(response, this, navigate);
  }

  componentDidMount() {
    AsyncStorage.multiGet(
      [
        asyncString.ACCESS_TOKEN,
        asyncString.USER_ID,
        asyncString.DTOKEN,
        asyncString.CAPI,
        asyncString.IdleTimeOutInMins,
        asyncString.lastRatedDate
      ],
      (err, savedData) => {
        var _token = CryptoXor.decrypt(
          savedData[0][1],
          asyncString.ACCESS_TOKEN
        );
        this.setState({
          access_token: _token,
          UserId: savedData[1][1],
          DToken: savedData[2][1],
          CustomerUrl: savedData[3][1],
          IdleTimeOutInMins: parseInt(savedData[4][1]),
          lastRatedDate: savedData[5][1]
        });
        this.getFeedbackData(_token, savedData[1][1], savedData[3][1]);
      }
    );
  }


  renderItem(data) {
    let { item, index } = data;
    let dateTime = moment(item.shiftTime).format("DD MMM YYYY hh:mmA");
    return (
      <View padder>
        <Box>
          <Stack header bordered>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between"
              }}
            >
              <Text style={styles.itemName}>{item.tripType}</Text>

              <Text style={[styles.itemName, { fontSize: 18 }]}>
                {item.tripId}
              </Text>
            </View>
          </Stack>
          <Stack bordered>
            <View>
              <Text style={styles.itemLastMessage}>{dateTime}</Text>
              <Text style={styles.itemLastMessage}>{item.driverName}</Text>
              <Text style={styles.itemLastMessage}>{item.vehicleRegNo}</Text>
            </View>
          </Stack>
          <Stack
            footer
            bordered
            style={{
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "center"
            }}
          >
            {/* <StarRating
              disabled={false}
              emptyStar={"ios-star-outline"}
              fullStar={"ios-star"}
              halfStar={"ios-star-half"}
              iconSet={"Ionicons"}
              maxStars={5}
              rating={item.feedbackRating}
              selectedStar={rating => this.onStarRatingPress(rating, item)}
              fullStarColor={colors.YELLOW}
              starSize={35}
            /> */}
            <Rating
              type='star'
              ratingColor='#3498db'
              ratingBackgroundColor='#c8c7c8'
              ratingCount={5}
              imageSize={30}
              startingValue={
                item.feedbackRating
              }
              onFinishRating={rating =>
                this.onStarRatingPress(rating, item)
              }
              style={{ paddingVertical: 10 }}
            />
          </Stack>
        </Box>
      </View>
    );
  }

  renderSeparator() {
    return <View style={styles.separator} />;
  }

  renderHeader() {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>Rate your feedback</Text>
      </View>
    );
  }

  _onRefresh() {
    this.setState({
      refreshing: true
    });
    this.getFeedbackData(
      this.state.access_token,
      this.state.UserId,
      this.state.CustomerUrl
    );
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
      <View style={styles.container}>
        <StatusBar
          barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
        />
        <FlatList
          keyExtractor={this._keyExtractor}
          data={this.state.data}
          renderItem={this.renderItem.bind(this)}
          ListEmptyComponent={this._renderNoFeedback()}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh.bind(this)}
            />
          }
        />
      </View>
    );
  }

  _renderNoFeedback() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{color: colors.GRAY}}>No trips to rate</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20
  },
  itemBlock: {
    flexDirection: "row",
    paddingBottom: 10
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  itemMeta: {
    marginLeft: 10,
    justifyContent: "center"
  },
  itemName: {
    fontSize: 20
  },
  itemLastMessage: {
    fontSize: 16,
    color: "#111"
  },
  separator: {
    height: 0.5,
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#555"
  },
  header: {
    padding: 10
  },
  headerText: {
    fontSize: 30,
    fontWeight: "900"
  }
});

function refreshData() {
  AsyncStorage.multiGet(
    [
      asyncString.ACCESS_TOKEN,
      asyncString.USER_ID,
      asyncString.DTOKEN,
      asyncString.CAPI
    ],
    (err, savedData) => {
      var _token = CryptoXor.decrypt(
        savedData[0][1],
        asyncString.ACCESS_TOKEN
      );
      this.getFeedbackData(_token, savedData[1][1], savedData[3][1]);
    }
  );
}
