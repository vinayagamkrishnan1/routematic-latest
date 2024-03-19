import React, { Component } from "react";
import {
  StatusBar,
  Text,
  Platform,
  View,
  Image,
  StyleSheet,
  FlatList,
  RefreshControl
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import bus_loading from "../../assets/bus_loading.gif";
import { colors } from "../../utils/Colors";
import {
  Input,
} from "native-base";
import { cards } from "../../features/Shuttle/styleShuttle";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import TouchableDebounce from "../../utils/TouchableDebounce";
import { API } from "../../network/apiFetch/API";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import { URL } from "../../network/apiConstants/index";
import { TYPE } from "../../model/ActionType";
import SafeAreaView from "react-native-safe-area-view";

class ShuttleRouteListNEW extends Component {

  static navigationOptions = ({ navigation }) => {
    return {
      title: "Shuttle",
      headerStyle: { display: "none" }
    };
  };
  state = {
    //isSearching: false,
    isLoading: true,
    data: [], //shuttleResponse.data,
    text: ""
  };
  UNSAFE_componentWillMount() {
    this.getShuttleRoutes();
  }

  render() {
    if (this.state.isLoading) return this.showLoaderScreen();
    let searchableData =
      this.state.data.length > 0 &&
      this.state.data.filter(route =>(route && route.routeName && route.routeName.toUpperCase()
            .includes(this.state.text.toUpperCase()) ||
            JSON.stringify(route.schedule).toUpperCase()
              .includes(this.state.text.toUpperCase()))
      );
console.warn('searchableData ', searchableData);
    return (
      <SafeAreaView>
        <View searchBar rounded style={{ backgroundColor: colors.WHITE }}>
          <View style={{ flexDirection: "row", width: "100%" }}>
            {/* <Ionicons
              name="close"
              style={{
                fontSize: 40,
                marginLeft: 0,
                marginTop: 5,
                color: colors.BLACK,
                fontFamily: "Helvetica"
              }}
              onPress={() => {
                this.props.navigation.navigate("Home");
              }}
            /> */}

            <View style={{
              width: '100%',
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",}}>
              {/* <Ionicons
                  name="md-search"
                  style={{fontSize: 30, color: colors.BLACK}}
              /> */}
              <Input
                style={{width:'80%', color: colors.BLACK}}
                placeholder="Search"
                underlineColorAndroid="transparent"
                autoCapitalize="none"
                multiline={false}
                autoCorrect={false}
                numberOfLines={1}
                returnKeyType="next"
                onChangeText={text => this.searchTextHandler(text)}
                value={this.state.text}
                blurOnSubmit={true}
                ref={input => {
                  this.searchTextInput = input;
                }}
              />
            </View>
          </View>
        </View>
        <View style={{marginBottom:130}}>
          <StatusBar
            barStyle="dark-content"
            hidden={false}
            backgroundColor={colors.WHITE}
            translucent={false}
          />
          {/*<View style={styles.container} {...this._panResponder.panHandlers}>*/}

          <FlatList
            keyExtractor={this._keyExtractor}
            data={searchableData}
            renderItem={this.renderItem.bind(this)}
            ItemSeparatorComponent={this.renderSeparator.bind(this)}
            ListEmptyComponent={this.renderEmptyList}
            refreshControl={
              <RefreshControl
                refreshing={this.state.isLoading}
                onRefresh={this._onRefresh.bind(this)}
              />
            }
          />
          {/*</View>*/}
        </View>
      </SafeAreaView>
    );
  }

  renderEmptyList = () => {
    return (
      //View to show when list is empty
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          margin: 10
        }}
      >
        <Text style={{ textAlign: "center" }}>No Routes Found</Text>
      </View>
    );
  };

  renderItem({item}) {
    console.log("item-startTimeArrayUnique----full->" + JSON.stringify(item));
    let startTimeArray = [];
    item.schedule.map((_item, index) => {
      startTimeArray.push(_item.startTime);
    });
    let startTimeArrayUnique = [...new Set(startTimeArray)];
    console.log("item-startTimeArrayUnique->" + JSON.stringify(startTimeArrayUnique));

    return (
      <View
        style={{
          elevation: 20,
          margin: 10,
          padding: 10,
          flex:1,
          borderRadius: 5,
          backgroundColor: "#f2f2f2",
          shadowColor: "#9b9b9b",
          shadowOffset: {
            width: 1,
            height: 1
          },
          shadowRadius: 3,
          shadowOpacity: 1  
        }}
      >
        <TouchableDebounce
          // style={[cards, {flexDirection: "column"}]}
          onPress={() => {
              this.props.navigation.navigate("ShuttleBookingNEW", {
                shuttleDetail: item,
                routesList: this.state.data
             });
          }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={route12345}>{item.routeName}</Text>
          </View>

          <View style={{ flexDirection: "column", marginTop: 10 }}>
            <Text style={source}>{item.startWayPoint}</Text>
            <FontAwesome
              name="long-arrow-right"
              style={[
                source,
                { marginVertical: 2 }
              ]}
            />
            <Text style={source}>{item.endWayPoint}</Text>
          </View>
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            <Text style={route12345}>Runs On</Text>
            <Text style={[m, { marginLeft: 5 }]}>{item.runDays}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
              justifyContent: "space-between"
            }}
          >
            <View style={{ flexDirection: "row" }}>
              {startTimeArrayUnique.map((item, index) => {
                if (index > 4) return;
                return (
                  <View style={blueSqaure} key={index}>
                    <Text style={time}>{item}</Text>
                  </View>
                );
              })}
            </View>
            {/* <View style={{ flexDirection: "row", marginLeft: 10 }}>
              <MaterialCommunityIcons name={"information-outline"} />
              <Text style={fullSchedule} />
            </View> */}
          </View>
        </TouchableDebounce>
      </View>
    );
  }
  showLoaderScreen() {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          backgroundColor: colors.WHITE
        }}
      >
        <StatusBar
          barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
        />

        <Image
          defaultSource={bus_loading}
          source={bus_loading}
          resizeMethod="scale"
          resizeMode="cover"
          style={{ height: 200, width: 200 }}
        />
        <Text style={{ color: colors.BLACK, marginTop: -20 }}>
          Loading Routes...
        </Text>
      </View>
    );
  }
  _keyExtractor(item, index) {
    return index.toString();
  }
  renderSeparator() {
    return <View style={styles.separator} />;
  }
  _onRefresh() {
    this.setState({
      refreshing: true
    });
  }

  searchTextHandler(text) {
    this.setState({
      text
    });
  }
  callback = async (actionType, response) => {
    switch (actionType) {
      case TYPE.SHUTTLE_DETAILS: {
        handleResponse.getShuttleDetails(response, this);
        break;
      }
    }
  };
  getShuttleRoutes() {
    this.setState({ isLoading: true });
    console.log('Sugan','data====='+JSON.stringify(URL.shuttleDetailsV1));

    API.newFetchXJSON(
      URL.shuttleDetailsV1,
      true,
      this.callback.bind(this),
      TYPE.SHUTTLE_DETAILS
    );
    //if (response) handleResponse.getShuttleDetails(response, this);
  }
}

export default ShuttleRouteListNEW;

const route12345 = {
  fontFamily: "Helvetica",
  fontSize: 10,
  fontWeight: "300",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#4a4a4a"
};
const m = {
  fontFamily: "Helvetica",
  fontSize: 10,
  marginRight: 5,
  fontWeight: "bold",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#417505"
};
const source = {
  fontFamily: "Helvetica",
  fontSize: 12,
  fontWeight: "300",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#4a4a4a"
};
const fullSchedule = {
  fontFamily: "Helvetica",
  fontSize: 8,
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#4a4a4a",
  marginTop: 2
};
const blueSqaure = {
  justifyContent: "center",
  alignItems: "center",
  width: 44,
  height: 25,
  borderRadius: 5,
  backgroundColor: "#4a90e2",
  marginRight: 5
};
const time = {
  width: 30,
  height: 12.5,
  fontFamily: "Helvetica",
  fontSize: 10,
  fontWeight: "300",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#ffffff"
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20
  }
});
