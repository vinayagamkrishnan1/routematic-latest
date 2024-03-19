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
import moment from "moment";

class ShuttleRouteListRoute extends Component {

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
    text: "",
    open: false,
    activeIndex: 0,
    waypoints:[]
  };

  UNSAFE_componentWillMount() {
    this.getShuttleRoutes();
  }

  render() {
    if (this.state.isLoading) return this.showLoaderScreen();
    let searchableData =
      this.state.data.length > 0 &&
      this.state.data.filter(
        word =>
          word &&
          word.routeName &&
          (word.routeName
            .toUpperCase()
            .includes(this.state.text.toUpperCase()) ||
            JSON.stringify(word.schedule)
              .toUpperCase()
              .includes(this.state.text.toUpperCase()))
      );

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
            renderItem={({ item, index }) => {
              return (
                this.renderItem(item,index)
              );

            }}
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

  shuttleLog = (_shuttle, _schedule) => {

   // let shuttleResponse = this.props.route.params.shuttleResponse ? this.props.route.params.shuttleResponse.item : [];  
    console.log('Sugan','URL====='+JSON.stringify(URL.ROUTELIST_LOG));
    let body = {
      EventType :"RS",
      Latitude :this.props.route.params.Lat,
      Longitude :this.props.route.params.Lng,
      RouteName : _shuttle.routeName,
      ShuttleID : _shuttle.shuttleID,
      ScheduleID : _schedule.scheduleID,
      ShiftTime :moment().format("YYYY-MM-DD")+"T"+_schedule.startTime
   };
   
    console.log('Sugan','BODY ShuttleLOG====='+JSON.stringify(body));

    API.newFetchJSON(
      URL.ROUTELIST_LOG,
      body,
      true,
      this.callback.bind(this),
      TYPE.SHUTTLE_ROUTE_LOG
    );
 
    // console.log('Sugan','shuttleResponse====='+JSON.stringify(shuttleResponse));
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

  renderItem(Item, indexActive) {
    console.log("Item-startTimeArrayUnique----full->" + JSON.stringify(Item));
    console.log("Item-startTimeArrayUnique----index->" + JSON.stringify(indexActive));

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
        <View
          // style={cards}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={route12345}>{Item.routeName}</Text>
          </View>

          <View style={{ flexDirection: "column", marginTop: 10 }}>
            <Text style={source}>{Item.startWayPoint}</Text>
            <FontAwesome
              name="long-arrow-right"
              style={[
                source,
                { marginTop: 2 }
              ]}
            />
            <Text style={source}>{Item.endWayPoint}</Text>
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
              {Item.schedule.map((item, index) => {
                return (
                  <TouchableDebounce
                  onPress={() => {
                    this.setState({ open: true, activeIndex: indexActive, waypoints: item.stop })
                    this.shuttleLog(Item, item);
                  }}>        
                  <View style={blueSqaure} key={index}>
                    <Text style={time}>{item.startTime}</Text>
                  </View></TouchableDebounce>
                );
              })}
            </View>
            <TouchableDebounce
                  onPress={() => {
                    if (this.state.open && this.state.activeIndex == indexActive) {
                      this.setState({ activeIndex: indexActive, open: !this.state.open});
                    } else {
                      this.setState({ open: true, activeIndex: indexActive, waypoints: Item.schedule[0].stop })
                    }
                  }} 
                  style={{ flexDirection: "row", marginLeft: 10 }}>
              <Ionicons size={23} name={(this.state.open && this.state.activeIndex === indexActive) ? 'chevron-up-outline' : 'chevron-down-outline'} />
              <Text style={fullSchedule} />
            </TouchableDebounce>
          </View>
          {(this.state.open && this.state.activeIndex === indexActive) ? <>
            <View style={{ flex: 1, marginTop: 20}}>
              {this.state.waypoints?.length > 0 && this.state.waypoints.map((waypoint, index) => {
                if (index === 0) {
                  return this.drawFirstLine(
                    index,
                    waypoint.wayPointName,
                    "Dep. " + waypoint.wayPointLeaveTime,
                    false,
                    this.state.loginRouteCollapse
                  );
                } else if (this.state.waypoints.length - 1 === index) {
                  return this.drawLastLine(
                    index,
                    waypoint.wayPointName,
                    waypoint.wayPointLeaveTime, // "Dep. " + 
                    false
                  );
                } else if (this.state.waypoints.length > 2) {
                  return this.drawLine(
                    index,
                    waypoint.wayPointName,
                    "Dep. " + waypoint.wayPointLeaveTime,
                    false
                  );
                }
              }
              )}
            </View>
          </>:<></>}
        </View>
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

  drawFirstLine(index, Title, desc) {
    return (
      <View style={{ flexDirection: "row" }} key={index}>
        <View
          style={{
            flexDirection: "row",
            transform: [{ rotate: "90deg" }],
            marginLeft: -70
          }}
        >
          <View
            style={{
              borderRadius: 5,
              height: 10,
              width: 10,
              borderWidth: 5,
              borderColor: colors.BLACK
            }}
          />
          <View
            style={{
              marginTop: 3.5,
              height: 3,
              width: 70,
              backgroundColor: colors.GRAY
            }}
          />
        </View>
        <View
          style={parent}
        >
          <Text style={textLine} numberOfLines={1}>{Title}</Text>
          <Text style={greenText}>{desc}</Text>
        </View>
      </View>
    );
  }

  drawLastLine(index, Title, desc) {
    return (
      <View style={{ flexDirection: "row", marginTop: -30 }} key={index}>
        <View
            style={{
              marginLeft: Platform.OS == 'android' ? 12 : 8,
              marginTop: Platform.OS == 'android' ? 10 : 15,
              borderRadius: 5,
              height: 10,
              width: 10,
              borderWidth: 5,
              borderColor: colors.BLACK
            }}
          />
        <View
          style={[parent, {
            marginBottom: 10,
            marginLeft: 15,
            justifyContent: "flex-start"
          }]}
        >
          <Text style={textLine} numberOfLines={1}>{Title}</Text>
          <Text style={greenText}>{desc}</Text>
        </View>
      </View>
    );
  }

  drawLine(index, Title, desc) {
    return (
      <View style={{ flexDirection: "row", marginTop: -30 }} key={index}>
        <View
          style={{
            flexDirection: "row", transform: [{ rotate: "90deg" }], marginLeft: -70
          }}
        >
          <View
            style={{
              borderRadius: 5,
              height: 10,
              width: 10,
              borderWidth: 5,
              borderColor: colors.BLACK
            }}
          />
          <View
            style={{
              marginTop: 3.5,
              height: 3,
              width: 70,
              backgroundColor: colors.GRAY
            }}
          />
        </View>
        <View
          style={[parent, {
            justifyContent: "flex-start"
          }]}
        >
          <Text style={textLine} numberOfLines={1}>{Title}</Text>
          <Text style={greenText}>{desc}</Text>
        </View>
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
      case TYPE.SHUTTLE_ROUTE_LOG: {
      //  handleResponse.getShuttleDetails(response, this);
        break;
      }
    }
  };
  getShuttleRoutes() {
    this.setState({ isLoading: true });
    console.log('Sugan','data====='+JSON.stringify(URL.shuttleUpcomingDetailsV1));

    API.newFetchXJSON(
      URL.shuttleUpcomingDetailsV1,
      true,
      this.callback.bind(this),
      TYPE.SHUTTLE_DETAILS
    );
    //if (response) handleResponse.getShuttleDetails(response, this);
  }
}

export default ShuttleRouteListRoute;


const parent = {
  width: 0,
  flexGrow: 1,
  marginBottom: 65,
  marginLeft: 25,
  flexDirection: "column"
};
const textLine = {
  flex: 1,
  flexWrap: 'wrap',
  color: colors.BLACK
};
const officeStyle = {
  flex: 1,
  flexWrap: 'wrap',
  textSize: 16,
  color: colors.RED
};
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
  width: 60,
  height: 40,
  borderRadius: 5,
  backgroundColor: "#4a90e2",
  marginRight: 5
};
const time = {
  width: 40,
  height: 18.5,
  fontFamily: "Helvetica",
  fontSize: 14,
  fontWeight: "300",
  fontStyle: "normal",
  letterSpacing: 0,
  color: "#ffffff"
};
const greenText = {
  fontFamily: "HelveticaNeue",
  fontSize: 10,
  fontWeight: "normal",
  fontStyle: "normal",
  letterSpacing: 0,
  color: colors.GREEN
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20
  }
});
