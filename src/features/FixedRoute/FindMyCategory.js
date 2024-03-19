import React, {Component} from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Platform,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import swap_icon from "../../assets/swap_icon1.png";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import {Button,
    Icon,Input} from "native-base";
import {viewSelectedStyle} from "../../screens/roster/customeComponent/customComponent";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import bus_loading from "../../assets/bus_loading.gif";
import {colors} from "../../utils/Colors";
import {cards} from "../Shuttle/styleShuttle";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import TouchableDebounce from "../../utils/TouchableDebounce";
import {API} from "../../network/apiFetch/API";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import {URL} from "../../network/apiConstants/index";
import {TYPE} from "../../model/ActionType";
import Autocomplete from "react-native-autocomplete-input";

const selectFrom = "Nodal Point";
const selectTo = "Office Location";

class FindMyCategory extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            title: "Find Category"
        };
    };
    state = {
        //isSearching: false,
        isLoading: true,
        data: [], //shuttleResponse.data,
        officeLocations: [],
        nodalPoints: [],
        fixedRoutes: [],
        isShowMorePressed: false,
        query: '',
        showPop: false,
        selectedOption: '',
        Nodal: 'Select',
        NodalIndex: 0,
        OfficeLocation: 'Select',
        OfficeLocationIndex: 0,
        searchType: 'ByStartAndEndPoint',
        switch: 'login',
        navigatedFrom: '',
        selectedRoute:{},
        category:'',
        text:""

    };

    _renderEmptyList = () => {
        return (
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    margin: 10
                }}
            >
                <Text style={{textAlign: "center"}}>No Items found</Text>
            </View>
        );
    };

    callback = async (actionType, response) => {
        switch (actionType) {
            case TYPE.GET_WAY_POINTS: {
                handleResponse.getWayPoints(response, this);
                break;
            }
            case TYPE.GET_FAV_ROUTES: {
                handleResponse.getFixedRoutes(response, this);
                break;
            }
            case TYPE.GET_PASS_CATEGORY:{
                handleResponse.getCategories(response, this);

                break;
            }
        }
    };

    UNSAFE_componentWillMount() {
        this.getWayPoints();
        if (this.props.route.params) {
            this.setState({
                navigatedFrom: this.props.route.params.navigatedFrom
            })
        }
    }
    findRoute(query) {
        if (query === '') {
            return [];
        }

        const { fixedRoutes } = this.state;
        const regex = new RegExp(`${query.trim()}`, 'i');
        return fixedRoutes.filter(fixedRoutes => fixedRoutes.fixedRouteName.search(regex) >= 0);
    }

    render() {
        const { query } = this.state;
        const route = this.findRoute(query);
        return (
            <View style={{flex:1,flexDirection: "column", width: "100%", height: "100%", marginTop: 10}}>



                <View style={{flex: 1, alignItems: "center", padding: 10}}>
                    <View style={rectangle14}>
                        <TouchableDebounce
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                            onPress={() => this.toggleModalVisible(this.state.switch === 'login' ? selectFrom : selectTo)}
                        >
                            <View
                                style={{flex: 1}}
                                onPress={() => this.toggleModalVisible(this.state.switch === 'login' ? selectFrom : selectTo)}
                            >
                                {this.renderTitlePlace(this.state.switch === 'login' ? selectFrom : selectTo, this.state.switch === 'login' ? this.state.Nodal : this.state.OfficeLocation)}
                            </View>
                            {/* {this._renderRightArrow()} */}
                        </TouchableDebounce>
                        <View style={{flexDirection: "row", alignItems: "center"}}>
                            {this._renderLine("90%")}
                            <TouchableOpacity style={styles.FacebookStyle} activeOpacity={0.5}
                                              onPress={() => {
                                                  console.warn("switching" + this.state.switch === 'login' ? 'logout' : 'login')
                                                  this.setState({

                                                      switch: this.state.switch === 'login' ? 'logout' : 'login'
                                                  })
                                              }}
                            >
                                <Image
                                    defaultSource={swap_icon}
                                    source={swap_icon}
                                    resizeMethod="scale"
                                    resizeMode="cover"
                                    style={{height: 30, width: 30}}

                                />
                            </TouchableOpacity>

                            {this._renderLine()}
                        </View>
                        <TouchableDebounce
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom:22
                            }}
                            onPress={() => this.toggleModalVisible(this.state.switch === 'login' ? selectTo : selectFrom)}
                        >
                            <View style={{flex: 1}}>
                                {this.renderTitlePlace(this.state.switch === 'login' ? selectTo : selectFrom, this.state.switch === 'login' ? this.state.OfficeLocation : this.state.Nodal)}
                            </View>
                            {/* {this._renderRightArrow()} */}
                        </TouchableDebounce>
                    </View>
                    <Text
                        style={{
                            fontWeight: "bold",
                            marginTop:10,
                            color: colors.BLUE,
                            marginLeft: 10
                        }}
                        >
                        {this.state.category}
                    </Text>
                    <TouchableDebounce
                        style={oval}
                        onPress={() => {
                            if (this.state.NodalIndex && this.state.OfficeLocationIndex) {
                                this.getCategory();
                            }else{
                                Alert.alert("Warning", "Please select the locations");

                            }

                        }}
                        >
                            <MaterialIcons
                                name={"navigate-next"}
                                style={{ fontSize: 25, color: colors.WHITE, fontWeight: "700" }}
                            />
                            </TouchableDebounce>
                </View>


                {this.renderModalView(this.state.nodalPoints)}
            </View>

        );
    }

    getCategory(){
        let url = URL.GET_PASS_CATEGORY + "?nodalPointId=" + this.state.NodalIndex + "&officeLocationId=" + this.state.OfficeLocationIndex;
        API.newFetchXJSON(
            url,
            true,
            this.callback.bind(this),
            TYPE.GET_PASS_CATEGORY
        );
    }
    _renderSeparator() {
        return <View style={separator}/>;
    }

    renderModalView() {
        let isNodal = this.state.selectedOption === selectFrom;
        let mainData = this.state.selectedOption === selectFrom
            ? this.state.nodalPoints
            : this.state.officeLocations;
        let searchableData;
        if(isNodal){
            searchableData = mainData.length > 0 &&
            mainData.filter(
                word =>
                word &&
                word.pickupDropPointName &&
                (word.pickupDropPointName
                    .toUpperCase()
                    .includes(this.state.text.toUpperCase()))
            );
        }else{
            searchableData = mainData.length > 0 &&
            mainData.filter(
                word =>
                word &&
                word.officeLocationName &&
                (word.officeLocationName
                    .toUpperCase()
                    .includes(this.state.text.toUpperCase()))
            )
        }




        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.showPop}
                onRequestClose={() => {
                    this.setState({showPop: false});
                }}
                backdropColor={colors.BLACK}
                backdropOpacity={1}
            >
                <SafeAreaView style={{flex: 1, backgroundColor: colors.WHITE}}>
                    <View style={{flex: 1, backgroundColor: colors.WHITE}}>
                        <View style={{flexDirection: "row", height: 50, marginTop: 30}}>
                            <Text
                                style={{
                                    marginTop: 10,
                                    fontSize: 20,
                                    marginLeft: 10,
                                    color: colors.BLUE
                                }}
                            >
                                Select{" "}
                                {this.state.selectedOption === selectFrom
                                    ? selectFrom
                                    : selectTo}
                            </Text>
                            <Ionicons
                                name="close"
                                style={{
                                    fontSize: 40,
                                    marginRight: 20,
                                    marginTop: 10,
                                    color: colors.BLACK,
                                    fontFamily: "Helvetica",
                                    right: 0,
                                    position: "absolute"
                                }}
                                onPress={() => {
                                    setTimeout(() => this.setState({showPop: false}), 0);
                                }}
                            />
                        </View>
                        <View style={{ flexDirection: "row", width: "100%" }}>

                        <View style={{ width: '100%',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", }}>
                            <Ionicons
                                name="md-search"
                                style={{fontSize: 30, color: colors.BLACK}}
                            />
                            <Input
                                full
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
                        <FlatList
                            keyExtractor={this._keyExtractor}
                            data={
                                searchableData
                            }
                            renderItem={this._renderListItem.bind(this)}
                            ItemSeparatorComponent={this._renderSeparator.bind(this)}
                            ListEmptyComponent={this._renderEmptyList}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.isLoading}
                                    onRefresh={this._onRefresh.bind(this)}
                                />
                            }
                        />
                    </View>
                </SafeAreaView>
            </Modal>
        );
    }
    searchTextHandler(text) {
        this.setState({
            text
        });
      }
    _renderListItem(Item) {
        return (
            <View
                style={{
                    justifyContent: "center",
                    width: "100%",
                    height: 50,
                    paddingLeft: 10,
                    paddingRight: 10,
                    backgroundColor: colors.WHITE
                }}
            >
                <TouchableDebounce
                    onPress={() => {
                        if (this.state.selectedOption === selectFrom) {
                            this.setState({
                                Nodal: Item.item.pickupDropPointName,
                                NodalIndex: Item.item.pickupDropPointID,
                                text:""
                            });
                        }
                        else {
                            this.setState({
                                OfficeLocation: Item.item.officeLocationName,
                                OfficeLocationIndex: Item.item.officeLocationID,
                                text:""
                            });
                        }
                        this.toggleModalVisible();
                    }}
                >
                    <Text style={{color: colors.BLACK}}>{this.state.selectedOption === selectFrom ? Item.item.pickupDropPointName : Item.item.officeLocationName}</Text>
                </TouchableDebounce>
            </View>
        );
    }

    toggleModalVisible(type) {
        if (!this.state.showPop)
            this.setState({showPop: true, selectedOption: type});
        else {
            console.warn("nodal" + this.state.NodalIndex);
            this.setState({showPop: false});
        }
    }

    _renderLine(size) {
        return (
            <View
                style={{
                    height: 0.5,
                    width: size ? size : "100%",
                    backgroundColor: colors.GRAY,
                    marginTop: 5
                }}
            />
        );
    }

    renderTitlePlace(title, placeName) {
        return (
            <View style={{flex: 1, marginLeft: 10, marginTop: 10}}>
                <Text style={from}>{title}</Text>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 10,
                        marginLeft: 10
                    }}
                >
                    <FontAwesome
                        name={"building-o"}
                        style={{fontSize: 25, color: colors.BLACK}}
                    />
                    <Text style={sourceName} numberOfLines={2}>{placeName}</Text>
                </View>
            </View>
        );
    }

    renderItem(Item) {
        //console.warn("Item-->" + JSON.stringify(Item));
        let startTimeArray = [];
        Item.item.schedule.map((item, index) => {
            startTimeArray.push(item.startTime);
        });
        let startTimeArrayUnique = [...new Set(startTimeArray)];
        return (
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    paddingLeft: 10,
                    paddingRight: 10
                }}
            >
                <TouchableDebounce
                    style={cards}
                    onPress={() => {

                        this.props.navigation.navigate("ShuttleRouteDetails", {
                            shuttleResponse: Item
                        });
                    }}
                >
                    <View
                        style={{flexDirection: "row", justifyContent: "space-between"}}
                    >
                        <Text style={route12345}>{Item.item.routeName}</Text>
                    </View>

                    <View style={{flexDirection: "row", marginTop: 10}}>
                        <Text style={source}>{Item.item.startWayPoint}</Text>
                        <FontAwesome
                            name="long-arrow-right"
                            style={[
                                source,
                                {marginLeft: 10, marginRight: 10, marginTop: 2}
                            ]}
                        />
                        <Text style={source}>{Item.item.endWayPoint}</Text>
                    </View>
                    <View style={{flexDirection: "row", marginTop: 5}}>
                        <Text style={route12345}>Runs On</Text>
                        <Text style={[m, {marginLeft: 5}]}>{Item.item.runDays}</Text>
                    </View>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 10,
                            justifyContent: "space-between"
                        }}
                    >
                        <View style={{flexDirection: "row"}}>
                            {startTimeArrayUnique.map((item, index) => {
                                if (index > 4) return;
                                return (
                                    <View style={blueSqaure} key={index}>
                                        <Text style={time}>{item}</Text>
                                    </View>
                                );
                            })}
                        </View>
                        <View style={{flexDirection: "row", marginLeft: 10}}>
                            <MaterialCommunityIcons name={"information-outline"}/>
                            <Text style={fullSchedule}/>
                        </View>
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
                    style={{height: 200, width: 200}}
                />
                <Text style={{color: colors.BLACK, marginTop: -20}}>
                    Loading Routes...
                </Text>
            </View>
        );
    }

    _keyExtractor(item, index) {
        return index.toString();
    }

    renderSeparator() {
        return <View style={styles.separator}/>;
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

    FindMyCategory() {
        let body = {
            searchType: "ByRouteName",
            routeName: "Silkboard-2R2S2"
        };
        this.setState({isLoading: true});
        API.newFetchJSON(
            URL.GET_FAV_ROUTES,
            body,
            true,
            this.callback.bind(this),
            TYPE.GET_FAV_ROUTES
        );
        //if (response) handleResponse.getShuttleDetails(response, this);
    }

    getWayPoints() {


        this.setState({isLoading: true});
        API.newFetchXJSON(
            URL.GET_WAY_POINTS,
            true,
            this.callback.bind(this),
            TYPE.GET_WAY_POINTS
        );
        //if (response) handleResponse.getShuttleDetails(response, this);
    }


    getFixedRoutes(routeName) {
        let url = URL.GET_FAV_ROUTES + "?searchType=ByRouteName&routeName=" + routeName;

        this.setState({isLoading: true});
        API.newFetchXJSON(
            url,
            true,
            this.callback.bind(this),
            TYPE.GET_FAV_ROUTES
        );
        //if (response) handleResponse.getShuttleDetails(response, this);
    }

    getFixedRoutes1(searchType, nodalIndex, officeIndex, tripType) {
        let url = URL.GET_FAV_ROUTES + "?searchType=" + searchType + "&OfficelocationId=" + officeIndex + "&NodalPointId=" + nodalIndex + "&TripType=" + tripType;

        // this.setState({ isLoading: true });
        API.newFetchXJSON(
            url,
            true,
            this.callback.bind(this),
            TYPE.GET_FAV_ROUTES
        );
        //if (response) handleResponse.getShuttleDetails(response, this);
    }

}

export default FindMyCategory;


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
    height: 23.2,
    borderRadius: 5,
    backgroundColor: "#4a90e2",
    marginRight: 5
};
const oval = {
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderRadius: 30,
    width: 60,
    height: 60,
    backgroundColor: colors.BLUE_BRIGHT,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
        width: 0,
        height: 2
    },
    shadowRadius: 4,
    shadowOpacity: 1
};
const rectangle14 = {
    height: 200,
    width: "100%",
    backgroundColor: colors.WHITE,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
        width: 1,
        height: 1
    },
    shadowRadius: 2,
    shadowOpacity: 1,
    flexDirection: "column",
    borderRadius: 5,
    overflow: "hidden"
};
const separator = {
    height: 0.5,
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#555"
};
const rectangleSearch = {
    height: "80%",
    width: "100%",
    alignItems: "center",
    backgroundColor: colors.WHITE,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
        width: 1,
        height: 1
    },
    shadowRadius: 2,
    shadowOpacity: 1,
    flexDirection: "column",
    borderRadius: 5,
    overflow: "hidden"
};


const time = {
    width: 26,
    height: 12,
    fontFamily: "Helvetica",
    fontSize: 10,
    fontWeight: "300",
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#ffffff"
};

const from = {
    fontFamily: "Helvetica",
    fontSize: 14,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.GRAY
};
const sourceName = {
    fontFamily: "Helvetica",
    fontSize: 14,
    flex:1,
    flexWrap:'wrap',
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#4a4a4a",
    marginLeft: 10
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20
    },
    autocompleteContainer: {
        flex: 1,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1
    }
});
