/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from "react";
import {
    BackHandler,
    DeviceEventEmitter,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    View
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
//import { subCategoryFeedback } from "../../utils/staticData";
import TouchableDebounce from "../../utils/TouchableDebounce";
import {Button} from "native-base";
import Ionicons from "react-native-vector-icons/Ionicons";
import {colors} from "../../utils/Colors";

export default class CategoryFeedback extends Component<{}> {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Select category",
      headerTitleStyle: { fontFamily: "Roboto" },
      headerLeft: (
        <Button
          full
          transparent
          iconLeft
          light
          style={{ padding: 10 }}
          onPress={() => {
              const isFromHome = this.props.route.params.isFromHome ? this.props.route.params.isFromHome : false;
              const isFromTrips = this.props.route.params.isFromTrips ? this.props.route.params.isFromTrips : false;
              if (isFromHome && this.props.route.params.showPreviousTripPopup) {
                  this.props.route.params.showPreviousTripPopup();
                  navigation.navigate("Home");
              } else if (isFromTrips === true) {
                  navigation.goBack();
              } else navigation.navigate("Feedback");
          }}
        >
          <Ionicons
            name={Platform.OS === "ios" ? "ios-arrow-back" : "md-arrow-back"}
            style={{
              fontSize: 30,
              color: Platform.OS === "ios" ? colors.BLUE : colors.BLACK
            }}
          />
        </Button>
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      data: [], //subCategoryFeedback.data,
      refreshing: false
    };
  }
  UNSAFE_componentWillMount() {
    //DeviceEventEmitter.addListener("your listener", e => {});
    const { navigation , route } = this.props;
    const data = this.props.route.params.data ? this.props.route.params.data : [];
    this.setState({
      data
    });
  }

  componentDidMount() {
    const { navigation, route } = this.props;
    const tripId = this.props.route.params.tripId ? this.props.route.params.tripId : "No tripId ";
    const shiftDate = this.props.route.params.shiftDate ? this.props.route.params.shiftDate : "No shiftDate ";
    const shiftTime = this.props.route.params.shiftTime ? this.props.route.params.shiftTime : "No shiftTime ";
    const rating = this.props.route.params.rating ? this.props.route.params.rating : "No rating ";
    const devicecode = this.props.route.params.devicecode ? this.props.route.params.devicecode : "No devicecode ";
    const apiurl = this.props.route.params.apiurl ? this.props.route.params.apiurl : "No apiurl ";
    let body = {
      tripId,
      shiftDate,
      shiftTime,
      rating,
      devicecode,
      apiurl
    };

    //alert(JSON.stringify(body));
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      //this.props.navigation.goBack();
        const isFromHome = this.props.route.params.isFromHome ? this.props.route.params.isFromHome : false;
        const isFromTrips = this.props.route.params.isFromTrips ? this.props.route.params.isFromTrips : false;
        if (isFromHome && this.props.route.params.showPreviousTripPopup) {
            this.props.route.params.showPreviousTripPopup();
            navigation.navigate("Home");
        } else if (isFromTrips === true) {
            navigation.goBack();
        } else navigation.navigate("Feedback");
        return true;
    });
  }
  componentWillUnmount() {
    this.backHandler.remove();
  }

  _keyExtractor(item, index) {
    return index.toString();
  }
  refreshCallBack() {
    this.props.route.params.feedbackRefreshCallback();
  }
  getSubCategory(item) {
    const { navigation } = this.props;
    const tripId = this.props.route.params.tripId ? this.props.route.params.tripId : "No tripId ";
    const shiftDate = this.props.route.params.shiftDate ? this.props.route.params.shiftDate : "No shiftDate ";
    const shiftTime = this.props.route.params.shiftTime ? this.props.route.params.shiftTime : "No shiftTime ";
    const rating = this.props.route.params.rating ? this.props.route.params.rating : "No rating ";
    const devicecode = this.props.route.params.devicecode ? this.props.route.params.devicecode : "No devicecode ";
    const apiurl = this.props.route.params.apiurl ? this.props.route.params.apiurl : "No apiurl ";
    const action = this.props.route.params.action ? this.props.route.params.action : "No action ";
    const categoryId = item.id;
    const categoryFeedback = item;
    const { navigate } = this.props.navigation;
    navigate("SubCategoryFeedback", {
      tripId,
      shiftDate,
      shiftTime,
      rating,
      devicecode,
      apiurl,
      categoryId,
      categoryFeedback,
      feedbackRefreshCallback: this.refreshCallBack.bind(this),
      action,
      showPreviousTripPopup: this.props.route.params
        .showPreviousTripPopup
        ? this.props.route.params.showPreviousTripPopup.bind(this)
        : null
    });
  }

  renderItem(data) {
    let { item, index } = data;
    return (
      <View style={styles.itemBlock}>
        <TouchableDebounce
          style={styles.itemBlock}
          onPress={() => {
            this.getSubCategory(item);
          }}
        >
          <View style={{ width: "10%" }}>
            <MaterialIcons
              name="keyboard-arrow-right"
              style={{ fontSize: 30, color: "black" }}
            />
          </View>
          <Text style={styles.itemName}>{item.name}</Text>
        </TouchableDebounce>
      </View>
    );
  }

  renderSeparator() {
    return <View style={styles.separator} />;
  }

  renderHeader() {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>Select Category</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <FlatList
          keyExtractor={this._keyExtractor}
          data={this.state.data}
          renderItem={this.renderItem.bind(this)}
          ItemSeparatorComponent={this.renderSeparator.bind(this)}
          //ListHeaderComponent={this.renderHeader}
        />
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
    paddingBottom: 10,
    width: "100%"
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
    width: "95%",
    fontSize: 15,
    padding: 5,
    color: colors.BLACK
  },
  itemLastMessage: {
    fontSize: 14,
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
