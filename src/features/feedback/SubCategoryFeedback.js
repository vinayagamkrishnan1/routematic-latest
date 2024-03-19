/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import {
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";

import TouchableDebounce from "../../utils/TouchableDebounce";
import SafariView from "react-native-safari-view";
// import { CustomTabs } from "react-native-custom-tabs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { colors } from "../../utils/Colors";

export default class SubCategoryFeedback extends Component<{}> {
  static navigationOptions = {
    title: "Issue",
    headerTitleStyle: { fontFamily: "Roboto" }
  };
  constructor(props) {
    super(props);

    this.state = {
      data: [], // subCategoryFeedback.data[0].subcategories,
      refreshing: false
    };
  }

  componentDidMount() {
    const { navigation, route } = this.props;
    const subCategoryFeedback = route.params.categoryFeedback ? route.params.categoryFeedback : "";
    //alert("subCategoryFeedback : "+JSON.stringify(subCategoryFeedback));
    this.setState({
      data: subCategoryFeedback.subcategories
    });
  }

  _keyExtractor(item, index) {
    return index.toString();
  }

  addComments(item) {
    if (item.name.startsWith("http")) {
      if (Platform.OS === "ios") {
        SafariView.isAvailable()
          .then(
            SafariView.show({
              url: item.name,
              readerMode: true, // optional,
              tintColor: "#000", // optional
              barTintColor: "#fff" // optional
            })
          )
          .catch(error => {
            // Fallback WebView code for iOS 8 and earlier
            alert(JSON.stringify(error.message));
          });
      } else {
        // CustomTabs.openURL(item.name, {
        //   toolbarColor: "#607D8B",
        //   enableUrlBarHiding: true,
        //   showPageTitle: true,
        //   enableDefaultShare: true,
        //   // For value, specify only full qualifier or only resource name.
        //   // In the case of the resource name, the module complements the application package in java side.
        //   animations: {
        //     startEnter:
        //       "com.github.droibit.android.reactnative.customtabs.example:anim/slide_in_bottom",
        //     startExit:
        //       "com.github.droibit.android.reactnative.customtabs.example:anim/slide_out_bottom",
        //     endEnter:
        //       "com.github.droibit.android.reactnative.customtabs.example:anim/slide_in_bottom",
        //     endExit:
        //       "com.github.droibit.android.reactnative.customtabs.example:anim/slide_out_bottom"
        //   },

        //   headers: {
        //     "my-custom-header": "my custom header value"
        //   },
        //   forceCloseOnRedirection: true
        // });
      }
      return;
    }

    const { navigation, route } = this.props;
    const tripId = route.params.tripId ? route.params.tripId : "No tripId ";
    const shiftDate = route.params.shiftDate ? route.params.shiftDate : "No shiftDate ";
    const shiftTime = route.params.shiftTime ? route.params.shiftTime : "No shiftTime ";
    const rating = route.params.rating ? route.params.rating : "No rating ";
    const devicecode = route.params.devicecode ? route.params.devicecode : "No devicecode ";
    const apiurl = route.params.apiurl ? route.params.apiurl : "No apiurl ";
    const action = route.params.action ? route.params.action : "No action ";
    const categoryId = route.params.categoryId ? route.params.categoryId : "No categoryId ";
    const subCategoryId = item.id;

    const feedbackRefreshCallback = route.params.feedbackRefreshCallback ? route.params.feedbackRefreshCallback : "NA ";
    const { navigate } = this.props.navigation;
    navigate("AddComment", {
      tripId,
      shiftDate,
      shiftTime,
      rating,
      devicecode,
      apiurl,
      categoryId,
      subCategoryId,
      topic: item.name,
      feedbackRefreshCallback: this.refreshCallBack.bind(this),
      action,
      showPreviousTripPopup: route.params
        .showPreviousTripPopup
        ? route.params.showPreviousTripPopup.bind(this)
        : null
    });
  }
  refreshCallBack() {
    this.props.route.params.feedbackRefreshCallback();
  }
  renderItem(data) {
    let { item, index } = data;
    return (
      <View style={styles.itemBlock}>
        <TouchableDebounce
          style={styles.itemBlock}
          onPress={() => {
            this.addComments(item);
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
