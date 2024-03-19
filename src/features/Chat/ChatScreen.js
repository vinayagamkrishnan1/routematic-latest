import React, { Component } from "react";
import {
  View,
  Text,
  Platform,
  ActivityIndicator,
  StatusBar,
  AppState
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import Pushy from "pushy-react-native";
import moment from "moment";
import { colors } from "../../utils/Colors";
import { API } from "../../network/apiFetch/API";
import { URL } from "../../network/apiConstants/index";
import { handleResponse } from "../../network/apiResponse/HandleResponse";
import { appVersion, asyncString } from "../../utils/ConstantString";
import * as Toast from "../../utils/Toast";
import { TYPE } from "../../model/ActionType";
import { EventRegister } from "react-native-event-listeners";
const queryString = require("query-string");

class ChatScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Trip Chat",
      headerTitleStyle: { fontFamily: "Roboto" }
    };
  };
  state = {
    messages: [],
    myID: 1,
    TripID: "",
    isLoading: true,
    message: "",
    showPush: false
  };

  requestChatHistory = async tripID => {
    global.isChatScreen = true;
    let body = { TripID: tripID };
    await API.newFetchXJSON(
      URL.CHAT + queryString.stringify(body),
      true,
      this.callback.bind(this),
      TYPE.LOAD_CHAT
    );
    /* .then(async response => {
        this.setState({ isLoading: false });
        return response.json();
      })
      .then(async response => {
        // console.warn(JSON.stringify(await response));
        if (response.status.code === 200) {
          //Pushing Chat History
          setTimeout(() => {
            this.setState({ messages: [] }, async () => {
              let messageFormatter = [];
              await response.data.map(async item => {
                /!* if (
                    !JSON.stringify(this.state.messages).includes(
                      await item.id
                    ) ||
                    !JSON.stringify(this.state.messages).includes(
                      await item.text
                    )
                  ) {*!/
                messageFormatter.push({
                  _id: item.id,
                  text: item.text,
                  createdAt: moment(item.time).format("YYYY-MM-DD HH:mm:ss"),
                  user: { _id: item.me, name: item.sender }
                });

                //}
              });
              setTimeout(async () => {
                await this.sendToLocalClean(await messageFormatter.reverse());
              }, 0);
              /!*setTimeout(async () => {
                await this.scrollView.scrollToEnd({ animated: true });
              });*!/
            });
          }, 0);
        } else if (data.status.message) {
          Toast.show(data.status.message);
        } else {
          Toast.show("Something went wrong. Try later.");
        }
      })
      .catch(error => {
        if (error.message === "Network request failed") {
          Alert.show(
            null,
            "Please check your network connection and try again"
          );
        }
        this.setState({ isLoading: false });
      });*/
    // await handleResponse.loadChatHistory(this, await response);
  };
  _renderChat = item => {
    // console.warn(JSON.stringify(item));
    if (item.item.user._id === 0)
      return (
        <View
          style={{
            margin: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start"
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#ffffff",
              shadowColor: "rgba(0, 0, 0, 0.5)",
              shadowOffset: {
                width: 0,
                height: 3
              },
              shadowRadius: 8,
              shadowOpacity: 1,
              borderRadius: 20,
              elevation: 1
            }}
          >
            <Text style={{ fontSize: 25 }}>{item.item.user.name}</Text>
          </View>
          <View
            style={[
              {
                backgroundColor: colors.WHITE,
                flexDirection: "column",
                padding: 10,
                borderRadius: 5
              }
            ]}
          >
            <Text>{item.item.text}</Text>
            <Text style={{ fontSize: 10, marginTop: 10 }}>
              {item.item.createdAt}
            </Text>
          </View>
        </View>
      );
    else
      return (
        <View
          style={{
            margin: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end"
          }}
        >
          <View
            style={[
              {
                backgroundColor: colors.BLUE_BRIGHT,
                flexDirection: "column",
                padding: 10,
                borderRadius: 5
              }
            ]}
          >
            <Text style={{ color: colors.WHITE }}>{item.item.text}</Text>
            <Text style={{ fontSize: 10, marginTop: 10, color: colors.WHITE }}>
              {item.item.createdAt}
            </Text>
          </View>
        </View>
      );
  };
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
        <Text style={{ textAlign: "center", color: colors.GRAY }}>No Routes Found</Text>
      </View>
    );
  };
  _handleAppStateChange = nextAppState => {
    console.warn("Gets Called..");
    this.setState({ appState: nextAppState });
    if (nextAppState === "active") {
      global.isChatScreen = true;
      this.requestChatHistory(this.state.TripID);
      this.setState({ showPush: false });
    } else {
      global.isChatScreen = false;
      this.setState({ showPush: true });
    }
  };

  messageChangeHandler(text) {
    this.setState({
      message: text
    });
  }

  sendToLocal(messages = []) {
    console.warn("Received->" + JSON.stringify(messages));
    setTimeout(
      () =>
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, messages)
        })),
      0
    );
  }

  callback = async (actionType, response, copyDataObj) => {
    switch (actionType) {
      case TYPE.CHAT: {
        handleResponse.sendChat(this, response, copyDataObj.messages);
        break;
      }
      case TYPE.LOAD_CHAT: {
        this.setState({ isLoading: false });
        if (!response || response.status === 401) {
          handleResponse.expireSession(this);
          return;
        }
        let data = response.data;
        // console.warn(JSON.stringify(await data));
        if (data.status.code === 200) {
          //Pushing Chat History
          setTimeout(() => {
            this.setState({ messages: [] }, async () => {
              let messageFormatter = [];
              await data.data.map(async item => {
                messageFormatter.push({
                  _id: item.id,
                  text: item.text,
                  createdAt: moment(item.time).format("YYYY-MM-DD HH:mm:ss"),
                  user: { _id: item.me, name: item.sender }
                });

                //}
              });
              setTimeout(async () => {
                await this.sendToLocalClean(await messageFormatter.reverse());
              }, 0);
            });
          }, 0);
        } else if (data.status.message) {
          Toast.show(data.status.message);
        } else {
          Toast.show("Something went wrong. Try later.");
        }

        break;
      }
    }
  };
  renderBubble(props) {
    if (
      props.isSameUser(props.currentMessage, props.previousMessage) &&
      props.isSameDay(props.currentMessage, props.previousMessage)
    ) {
      return <Bubble {...props} />;
    }
    return (
      <View>
        <Text style={{ color: colors.GRAY }}>
          {props.currentMessage.user.name}
        </Text>
        <Bubble {...props} />
      </View>
    );
  }

  sendToLocalClean(messages) {
    setTimeout(
      () =>
        this.setState({
          messages,
          isLoading: false
        }),
      0
    );
  }

  UNSAFE_componentWillMount() {
    let TripID = this.props.route.params.TripID;
    // ",
    //   "NA" /*"000072642-1"*/
    // );
    if (TripID !== "NA") {
      this.setState({
        TripID,
        isLoading: true
      });
      this.requestChatHistory(TripID || this.state.TripID);
      this.timer = setInterval(() => {
        this.requestChatHistory(TripID || this.state.TripID);
      }, 30000);
    }
    if (Platform.OS === "ios") {
      Pushy.setNotificationListener(async pushData => {
        let data;
        if (Platform.OS === "android") Pushy.setNotificationIcon("ic_launcher");
        console.warn("Push From Chat Screen->" + JSON.stringify(pushData));
        let pushAllowed = await AsyncStorage.getItem(
          asyncString.IS_PUSH_ALLOWED
        );
        if (pushAllowed === "true") {
          if (pushData.hasOwnProperty("Args")) {
            data = JSON.parse(pushData.Args);
          } else {
            data = pushData;
          }
          let messageFormatter = [
            {
              _id: data.id,
              text: data.text,
              createdAt: moment(data.time).format("YYYY-MM-DD HH:mm:ss"),
              user: { _id: data.me, name: data.sender }
            }
          ];
          let pass = data.me === 0;
          if (pass) {
            this.sendToLocal(messageFormatter);
          }
        }
      });
    } else {
      this.listener = EventRegister.addEventListener(TYPE.CHAT, data => {
        let messageFormatter = [
          {
            _id: data.id,
            text: data.text,
            createdAt: moment(data.time).format("YYYY-MM-DD HH:mm:ss"),
            user: { _id: data.me, name: data.sender }
          }
        ];
        let pass = data.me === 0;
        if (pass) {
          this.sendToLocal(messageFormatter);
        }
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    // AppState.removeEventListener("change", this._handleAppStateChange);
    // EventRegister.removeEventListener(this.listener);
  }

  sendToBackend(messages = []) {

    if (!messages) return;
    // console.warn("messages : " + JSON.stringify(messages[0].text));
    let body = {
      TripID: this.state.TripID,
      MsgTime: moment().format("YYYY-MM-DD HH:mm:ss"),
      MsgTxt: messages[0].text,
      ContentType: "text/plain",
      MsgType: "C",
      AppVersion: appVersion.v
      //replyto: messages[0]._id
    };
    //FakeLocal Sent Message Display
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages)
    }));

    API.newFetchJSON(
      URL.CHAT,
      body,
      true,
      this.callback.bind(this),
      TYPE.CHAT,
      {
        messages
      }
    );
    //handleResponse.sendChat(this, response, messages);
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

  _renderLoader() {
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
  }

  componentDidMount() {
    AppState.addEventListener("change", this._handleAppStateChange);
    this.subs = [
      this.props.navigation.addListener("focus", () =>
        this.requestChatHistory(this.state.TripID)
      ),
      this.props.navigation.addListener(
        "blur",
        () => (global.isChatScreen = false)
      )
    ];
  }

  render() {
    if (this.state.isLoading) this._renderLoader();
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={messages => this.sendToBackend(messages)}
        // renderBubble={this.renderBubble}
        textInputStyle={{color:colors.BLACK}}
        user={{
          _id: this.state.myID //"1005087"
        }}
      />
    );
  }
}

export default ChatScreen;
