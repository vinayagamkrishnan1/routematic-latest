import React, {Component} from "react";
import {Alert, FlatList, Image, ImageBackground, Platform, StatusBar, Text, View,} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {colors} from "../../utils/Colors";
import moment from "moment";
import LinearGradient from "react-native-linear-gradient";
import {Button} from "native-base";
import {API} from "../../network/apiFetch/API";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import {URL} from "../../network/apiConstants";
import TouchableDebounce from "../../utils/TouchableDebounce";
import bus_loading from "../../assets/bus_loading.gif";
import {TYPE} from "../../model/ActionType";
import {check, openSettings, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import base64 from 'react-native-base64'
import available_seat from "../../assets/seat-white1.png";
const utf8 = require('utf8');

class Bookings extends Component {
  state = {
    isLoading: false,
    refreshing: false,
    passId: '',
    ticketID: "",
    bookings: [],
    pageState: '',
    loadingMessage: 'Fetching your trips...'

  };

  static navigationOptions = ({navigation}) => {
    return {
      title: "My Trips"
    };
  };

  callback = async (actionType, response) => {
    switch (actionType) {

      case TYPE.GET_BOOKINGS: {
        handleResponse.getAllBookings(this, response);
        break;
      }
      case TYPE.CANCEL_BOOKINGS: {
        handleResponse.cancelBooking(this, response);
        break;
      }
    }
  };

  UNSAFE_componentWillMount() {
    if (this.props.route.params) {
      this.setState({
        passId: this.props.route.params.passId

      })
    }
  }

  componentDidMount() {
    this.willFocusSubscription = this.props.navigation.addListener(
        'focus',
        payload => {
          this.getBookings();
        }
    );
  }

  componentWillUnmount() {
    // this.willFocusSubscription.remove();
  }

  render() {
    if (this.state.isLoading) return this.showLoaderScreen();
    return (
        <View style={{flex: 1, paddingBottom: 15}}>
          <StatusBar barStyle="dark-content"/>
          <FlatList
              style={{minHeight: 100}}
              keyExtractor={this._keyExtractor}
              data={this.state.bookings}
              extraData={this.state.bookings}
              renderItem={this.renderItem.bind(this)}
              ListEmptyComponent={this.renderEmptyList}
              refreshing={this.state.isLoading}
              showsVerticalScrollIndicator={true}
              onRefresh={this._onRefresh}
              indicatorStyle={'black'}
          />
          {this.state.bookings && this.state.pageState !== null && this.state.bookings.length > 0 && <TouchableDebounce
              onPress={() => {
                this.setState({
                  loadingMessage: 'Fetching more trips...'
                }, () => {
                  this.getBookings()
                })
              }}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Ionicons
                  name="md-refresh"
                  style={{color: colors.GREEN, padding: 10}}
                  size={20}
              />
              <Text style={{fontWeight: 'bold'}}>Load more</Text>
            </View>
          </TouchableDebounce>}
        </View>
    );
  }

  renderEmptyList = () => {
    return (
        <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              margin: 10
            }}
        >
          <Text style={{textAlign: "center"}}>No Trips Available</Text>
        </View>
    );
  };

  renderItem(data) {
    console.warn("JSON "+JSON.stringify(data)+" ");
    if(data.hasOwnProperty("item")&&data.item) {
        let dateTime = moment(data.item.shiftTime).format("YYYY-MM-DD");
        return (
            <TouchableDebounce
                onPress={() => {
                    console.log("orig " + JSON.stringify(data.item));
                }}
            >
                <StatusBar
                    barStyle="dark-content"
                    hidden={false}
                    backgroundColor={colors.WHITE}
                    translucent={false}
                />
                <LinearGradient
                    start={{x: 0, y: 0.75}}
                    end={{x: 1, y: 0.25}}
                    colors={[colors.BLUE, colors.GREEN]}
                    style={gradientView}
                >

                    <View style={{flexDirection: "row", alignContent: 'center', alignItems: 'center', padding: 10}}>
                        <View style={{flexDirection: "column", flex: 1}}>
                            <Text style={{
                                fontSize: 15,
                                color: 'white',
                                marginTop: 0
                            }}>{data.item.routeName + " (" + data.item.tripType + ")"}</Text>
                            {data.item.vehicleRegNo !== '' &&
                            <Text style={{fontSize: 15, color: 'white', marginTop: 10}}>{data.item.vehicleRegNo}</Text>}
                            <Text style={{
                                fontSize: 15,
                                color: 'white',
                                marginTop: 10,
                                marginRight: 5
                            }}>{moment(data.item.shiftTime).utc().format("hh:mm A") + " "
                            + moment(data.item.shiftTime, "YYYY-MM-DDT").format("DD MMM")}</Text>
                            {(data.item.boardStatus === "0" && !moment(dateTime).isBefore(moment().format("YYYY-MM-DD"))) &&
                            <Button
                                block
                                full
                                backgroundColor={colors.BLUE}
                                style={{
                                    width: 130, marginTop: 10, borderRadius: 10,
                                    borderWidth: 1,
                                }}
                                onPress={() => this.cancelBooking(data.item)}
                            >
                                <Text style={{color: 'white'}}>Cancel Booking</Text>
                            </Button>}
                        </View>
                        <View style={{
                            flexDirection: 'column',
                            flex: 0.4,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <ImageBackground
                                defaultSource={available_seat}
                                source={available_seat}
                                style={{height: 60, width: 60}}
                            >
                                <Text style={{
                                    textAlign: 'center',
                                    fontSize: 20,
                                    marginTop: 10,
                                    color: 'black',
                                    fontWeight: 'bold'
                                }}>{data.item.seatNumber}</Text>
                            </ImageBackground>
                            <Text style={{
                                fontSize: 15,
                                color: 'black',
                                marginTop: 10,
                                marginRight: 5
                            }}>{data.item.boardStatus === "1" ? "Boarded" : !(data.item.boardStatus === "0" && !moment(dateTime).isBefore(moment().format("YYYY-MM-DD"))) ? "Not Boarded" : ""}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableDebounce>
        );
    }else{
      this.renderEmptyList();
    }
  }

  cancelBooking(ticket) {
    Alert.alert(
        'Cancel Booking',
        'Do you want to cancel the booking?',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'OK', onPress: () => {
              this.setState({isLoading: true});
              let body = {
                routeID: ticket.routeID,
                shiftID: ticket.shiftID,
                seatNumber: ticket.seatNumber,
                passID: this.state.passId,
                shiftTime: ticket.shiftTime
              };
              API.newFetchJSON(
                  URL.CANCEL_BOOKINGS,
                  body,
                  true,
                  this.callback.bind(this),
                  TYPE.CANCEL_BOOKINGS,
                  null
              );
            }
          }
        ],
        {cancelable: false},
    );


  }

  checkPermissions(data) {
    let passId = data.id;
    check(Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA)
        .then(result => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              console.warn(
                  'This feature is not available (on this device / in this context)',
              );
              break;
            case RESULTS.DENIED:

              console.warn(
                  'The permission has not been requested / is denied but requestable',
              );
              request(
                  Platform.select({
                    android: PERMISSIONS.ANDROID.CAMERA,
                    ios: PERMISSIONS.IOS.CAMERA,
                  }),
              );
              break;
            case RESULTS.GRANTED:
              if (moment().isBetween(data.fromDate, data.toDate) || (moment().format("YYYY-MM-DD") === moment(data.fromDate).format("YYYY-MM-DD")) || (moment().format("YYYY-MM-DD") === moment(data.toDate).format("YYYY-MM-DD"))) {
                this.props.navigation.navigate("QRScanner", {
                  passId: passId,
                });
                console.warn('The permission is granted');
              } else {
                Alert.alert("Warning!", "This pass is not valid for today. Please use a valid pass to checkin");
                console.warn('Pass is not valid for today');
              }
              break;
            case RESULTS.BLOCKED:
              Alert.alert("Warning!", "You have selected 'Don't ask me again'. Please go to application's settings to enable the permission.", [
                {
                  text: "Cancel",
                  onPress: () => console.log("NO Pressed"),

                },
                {
                  text: "Open Settings",
                  onPress: () => {
                    openSettings().catch(() => console.warn('cannot open settings'));
                    //this._onRefresh();
                  }
                }
              ]);
              console.warn('The permission is denied and not requestable anymore');
              break;
          }
        })
        .catch(error => {

        });
  }

  _keyExtractor(item, index) {
    return index.toString();
  }

  renderSeparator() {
    return <View style={styles.separator}/>;
  }

  _onRefresh = () => {
    console.warn("refreshing...")
    this.setState({
      isLoading: true,
      pageState: '',
      bookings: [],
      loadingMessage: 'Fetching your trips...'
    }, () => {
      this.getBookings();
      console.warn("Checking refresh")
    });
  }


  getBookings() {
    console.warn(this.state.pageState)
    this.setState({isLoading: true});
    let text;
    if (this.state.pageState) {
      text = "td=" + encodeURIComponent(this.state.pageState);
    } else {
      text = "td=";
    }
    let bytes = utf8.encode(text);
    let encoded = base64.encode(bytes);
    let url = URL.GET_BOOKINGS + "passId=" + this.state.passId + "&l=14&ps=" + encoded
    API.newFetchXJSON(
        url,
        true,
        this.callback.bind(this),
        TYPE.GET_BOOKINGS
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
              style={{height: 170, width: 170}}
          />
          <Text style={{color: colors.BLACK, marginTop: -20}}>
            {this.state.loadingMessage}
          </Text>
        </View>
    );
  }
}

export default Bookings;

const gradientView = {
  margin: 10,
  width: "95%",
  opacity: 0.95,
  borderRadius: 6,
  shadowColor: "rgba(0, 0, 0, 0.5)",
  shadowOffset: {
    width: 0,
    height: 2
  },
  shadowRadius: 4,
  shadowOpacity: 1,
  justifyContent: "space-between",
};