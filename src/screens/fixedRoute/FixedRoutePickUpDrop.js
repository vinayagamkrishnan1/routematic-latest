import React, {Component} from "react";
import {FlatList,Alert, KeyboardAvoidingView, SafeAreaView, StatusBar, StyleSheet, Text, View} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {Button, Input, Item} from "native-base";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import {colors} from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import PleaseWaitLoader from "../../network/loader/PleaseWaitLoader";
import {inject, observer} from "mobx-react";
import {roster} from "../../utils/ConstantString";
import {RenderPickerHeader, RenderPickerSearch} from "../mobxRoster/RosterCommonComponents";
import {mapDelta} from "../../utils/MapHelper";

@inject("fixedRouteStore")
@observer
class FixedRoutePickUpDrop extends Component {

    constructor(props) {
        super(props);
        this.state = {
            text: "",
            type: "",
            selectedItem: "",
            showAddNickName: false,
            selectedLocation: "",
            locations: [],
            selectLat: "",
            selectLng: "",
            nickName: "",
            allowOtherLocation: false,
            restrictToPOI:false
        };
        this.onFilterInputChange = this.onFilterInputChange.bind(this);
        this.onGoBack = this.onGoBack.bind(this);
        this.props.fixedRouteStore.enableLoader();
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerStyle: {display: "none"}
        };
    };

    goToLocationPicker(type) {
        if (this.state.nickName) this.setState({nickName: ""});
        let regionLocation = this.props.fixedRouteStore.Locations.find(loc => loc.ID === 'H')
        let region = {
            latitude: parseFloat(regionLocation.Lat),
            longitude: parseFloat(regionLocation.Lng),
            ...mapDelta
        };
        this.props.navigation.navigate("MapPicker", {
            getLocationPicker: this.getLocationPicker.bind(this),
            type: type,
            region: region
        });
    }

    getLocationPicker(selectedLocation, selectLat, selectLng, type) {
        this.setState({
            showAddNickName: true,
            selectedLocation,
            selectLat,
            selectLng
        });
    }

    nickNameChangeHandler(text) {
        if (text) {
            this.setState({
                nickName: text
            });
        } else {
            this.setState({
                nickName: ""
            });
        }
    }

    saveEmployeeNewLocation(NickName, Latitude, Longitude, Location) {
        if (!NickName) {
            Alert.alert("Add location", "Place name cannot be blank");
            return;
        }
        let body = {
            NickName,
            Latitude,
            Longitude,
            Location
        };
        this.props.fixedRouteStore.saveNewEmployeeLocation(body).then(r => {
            this.setState({showAddNickName: false, selectedItem:body.NickName})
            const item = this.props.fixedRouteStore.Locations.find(e=>e.Name.toString()===NickName.toString());
            console.warn(item);
            if (this.state.type === roster.login) {
                this.props.fixedRouteStore.updatePickUpAddress(item, NickName);
            } else {
                this.props.fixedRouteStore.updateDropAddress(item, NickName);
            }
            this.props.navigation.goBack();
        });
    }

    render() {
        if (this.props.fixedRouteStore.isLoading) return <PleaseWaitLoader/>;
        const {type, text, selectedItem, locations, allowOtherLocation,restrictToPOI} = this.state;
        let _locations = text
            ? locations.filter(word => word.Name.toUpperCase().includes(text.toUpperCase()))
            : locations;
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.WHITE}}>
                <View style={styles.container}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                    <RenderPickerHeader
                        name={type === roster.login ? "Select Pickup Location" : "Select Drop Location"}
                        onGoBack={this.onGoBack}/>
                    <RenderPickerSearch text={text} onFilterInputChange={this.onFilterInputChange}/>
                    <FlatList
                        data={_locations}
                        contentcontainerstyle={styles.flatListContainer}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => {
                            let isSelected;
                            if (selectedItem)
                                isSelected = item.Name && item.Name.toString() === selectedItem.toString();
                            if (item.Name !== "Others") {
                                let locationName = item.Name;
                                return (
                                    <React.Fragment>
                                        <TouchableDebounce
                                            key={index}
                                            style={styles.viewNotSelectedStyle}
                                            onPress={() => {
                                                if (type === roster.login) {
                                                    this.props.fixedRouteStore.updatePickUpAddress(item, locationName);
                                                } else {
                                                    this.props.fixedRouteStore.updateDropAddress(item, locationName);
                                                }
                                                this.props.navigation.goBack();
                                            }}
                                        >
                                            <Text
                                                // numberOfLines={1}
                                                style={[styles.itemNameText, {flex: 0.9, fontWeight: isSelected ? "700" : "400"}]}>
                                                {locationName}
                                            </Text>
                                            {isSelected ? (
                                                <FontAwesome
                                                    name={"check-circle"}
                                                    color={colors.GREEN}
                                                    style={{flex: 0.1, paddingRight: 2}}
                                                    size={26}
                                                    key={index.toString() + "icon"}
                                                />
                                            ) : (
                                                <FontAwesome name={"circle-thin"} size={26} style={{flex: 0.1, paddingRight: 2}}/>
                                            )}
                                        </TouchableDebounce>
                                    </React.Fragment>
                                )
                            }
                        }}
                        style={{marginTop: 10}}/>
                </View>
            </SafeAreaView>
        );
    }

    onFilterInputChange(text) {
        this.setState({text});
    }

    onGoBack() {
        this.props.navigation.goBack()
    }

    componentDidMount() {
        let type = this.props.route.params.type;
        let selectedItem = this.props.route.params.selectedItem;
        let locations = this.props.route.params.locations;
        let allowOtherLocation = this.props.route.params.allowOtherLocation;
        let restrictToPOI = this.props.route.params.restrictToPOI;
        console.warn("allowOtherLocation "+JSON.stringify(allowOtherLocation));
        console.warn("restrictToPOI "+JSON.stringify(restrictToPOI));
        this.setState({type, selectedItem, locations, allowOtherLocation,restrictToPOI});
        setTimeout(() => {
            this.props.fixedRouteStore.disableLoader();
        }, 100);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: colors.WHITE
    },
    buttonStyle: {
        width: "90%",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row"
    },
    itemNameText: {
        color: colors.BLACK,
        fontSize: 20
    }, flatListContainer: {
        flexDirection: "column",
        flexWrap: "wrap",
        alignItems: "flex-start",
        marginTop: 10,
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 10,
        padding: 10,
        paddingBottom: 20
    }, viewNotSelectedStyle: {
        width: "100%",
        padding: 5,
        borderStyle: "solid",
        margin: 5,
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row"
    }, nickNameContainer: {
        height: "100%",
        backgroundColor: "white",
        padding: 22,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 4,
        borderColor: "rgba(0, 0, 0, 0.1)"
    }
});

export default FixedRoutePickUpDrop;

