import React, {Component} from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import bus_loading from "../../assets/bus_loading.gif";
import {colors} from "../../utils/Colors";
import {Button} from "native-base";
import {cards} from "./../Shuttle/styleShuttle";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import TouchableDebounce from "../../utils/TouchableDebounce";
import {handleResponse} from "../../network/apiResponse/HandleResponse";
import {TYPE} from "../../model/ActionType";
import SafeAreaView from "react-native-safe-area-view";

class FixedRouteList extends Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: "Routes"
            //headerStyle: { display: "none" }
        };
    };
    state = {
        //isSearching: false,
        isLoading: true,
        data: [], //fixedRouteResponse.data,
        text: "",
        isShowMorePressed: false,
        value: 'routeName',
        searchType: '',
        nodalIndex: '',
        officeIndex: '',
        routeName: '',
        navigatedFrom: '',
        cachedData: []

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
                <Text style={{textAlign: "center"}}>No Routes Found</Text>
            </View>
        );
    };
    refresh = (data) => {
        this.setState({data: data.routes});
    };
    callback = async (actionType, response) => {
        switch (actionType) {
            case TYPE.GET_FAV_ROUTES: {
                handleResponse.getFavFixedRoutes(response, this);
                break;
            }
        }
    };

    componentDidMount() {
        if (this.props.route.params) {
            this.setState({
                isLoading: false,
                data: this.props.route.params.data,
                navigatedFrom: this.props.route.params.navigatedFrom,
                cachedData: this.props.route.params.cachedData
            })
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
       return true;
    }



    render() {
        if (this.state.isLoading) return this.showLoaderScreen();
        return (
            <SafeAreaView style={{flex:1,flexDirection: "column", width: "100%", height: "100%", marginTop: 10}}>
                    <StatusBar
                        barStyle="dark-content"
                        hidden={false}
                        backgroundColor={colors.BLACK}
                        translucent={false}
                    />
                    <FlatList
                        keyExtractor={this._keyExtractor}
                        data={this.state.data}
                        style={{marginTop: 0}}
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
                    <View style={{position: "absolute", backgroundColor:'white',bottom: 0, right: 0, width: "100%", marginTop: 50}}>
                        <Button
                            backgroundColor={colors.BLUE}
                            style={{borderRadius:10,
                                borderWidth: 1,margin:20}}
                            onPress={() =>
                                this.props.navigation.navigate("SearchRoutes", {
                                    onGoBack: this.refresh,
                                })
                            }
                        >
                            <Text style={{color: colors.WHITE}}>Show more routes</Text>
                        </Button>
                    </View>
            </SafeAreaView>
        );
    }

    renderItem(Item) {
        let startTimeArray = [];
         Item.item.shifts.map((item) => {
             startTimeArray.push(item.shiftTime);
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
                        this.props.navigation.navigate("FixedRouteDetails", {
                            runsOn: Item.item.schedule,
                            schedule: Item.item.shifts,
                            routeName: Item.item.fixedRouteName,
                            startPoint: Item.item.startWaypoint,
                            endPoint: Item.item.endWaypoint,
                            fixedRouteId: Item.item.fixedRouteID,
                            officeLocationId: Item.item.officeLocationID,
                            nodalPointId: Item.item.nodalPointID,
                            data:Item,
                            cachedData:this.state.cachedData
                        });
                    }}
                >
                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                        <Text style={route12345}>{Item.item.fixedRouteName}</Text>
                    </View>

                    <View style={{flexDirection: "row", marginTop: 10,flexWrap: 'wrap'}}>
                        <Text style={source}>
                            {Item.item.startWaypoint+" "}
                            <FontAwesome
                                name={"long-arrow-right"}
                                style={[
                                    source,
                                    {marginLeft: 10, marginRight: 10, marginTop: 2}
                                ]}
                            />
                            {" "+Item.item.endWaypoint}
                        </Text>
                    </View>
                    <View style={{flexDirection: "row", marginTop: 10}}>
                        <Text style={route12345}>Runs On</Text>
                        <Text style={[m, {marginLeft: 5}]}>{Item.item.schedule}</Text>
                    </View>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 10,
                            justifyContent: "space-between"
                        }}
                    >
                        <View style={{flexDirection: "row",flexWrap: 'wrap'}}>
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

    componentWillReceiveProps(nextProps) {
        this.setState({ data: nextProps.route.params.data });
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
}

export default FixedRouteList;
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
