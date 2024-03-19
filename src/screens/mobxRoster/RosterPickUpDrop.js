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
import {RenderPickerHeader, RenderPickerSearch} from "./RosterCommonComponents";
import {mapDelta} from "../../utils/MapHelper";

@inject("rosterStore")
@observer
class RosterPickUpDrop extends Component {

    constructor(props) {
        super(props);
        this.state = {
            text: "",
            type: "",
            selectedItem: "",
            showAddNickName: false,
            selectedLocation: "",
            selectLat: "",
            selectLng: "",
            nickName: "",
            allowOtherLocation: false,
            restrictToPOI:false
        };
        this.onFilterInputChange = this.onFilterInputChange.bind(this);
        this.onGoBack = this.onGoBack.bind(this);
        this.props.rosterStore.enableLoader();
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerStyle: {display: "none"}
        };
    };

    goToLocationPicker(type) {
        if (this.state.nickName) this.setState({nickName: ""});
        let regionLocation = this.props.rosterStore.Locations.find(loc => loc.ID === 'H')
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
        this.props.rosterStore.saveNewEmployeeLocation(body).then(r => {
            this.setState({showAddNickName: false, selectedItem:body.NickName})
            const item = this.props.rosterStore.Locations.find(e=>e.Name.toString()===NickName.toString());
            console.warn(item);
            if (this.state.type === roster.login) {
                this.props.rosterStore.updatePickUpAddress(item, NickName);
            } else {
                this.props.rosterStore.updateDropAddress(item, NickName);
            }
            this.props.navigation.goBack();
        });
    }

    render() {
        if (this.props.rosterStore.isLoading) return <PleaseWaitLoader/>;
        if (!this.state.showAddNickName) {
            const {type, text, selectedItem,allowOtherLocation,restrictToPOI} = this.state;
            let locations=this.props.rosterStore.Locations
            if (allowOtherLocation === false) {
                locations=(this.props.rosterStore.Locations.filter(location => location.ID === "H"));
            }
            let offices = text
                ? locations.filter(word => word.Name.toUpperCase().includes(text.toUpperCase()))
                : locations;
            let count = 0;
            for (let i = 0; i < offices.length; i++) {
                if (offices[i].ID !== "H" && offices[i].ID !== "O") {
                    count++;
                }
            }
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
                        {(allowOtherLocation===true && (count < this.props.rosterStore.MaxOtherLocationCount)) && (
                            <TouchableDebounce
                                style={{
                                    borderColor: colors.BLACK,
                                    borderWidth: 0.5,
                                    backgroundColor: colors.BACKGROUND,
                                    height: 50,
                                    width: "100%",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}
                                onPress={() => this.goToLocationPicker(this.state.type)}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                >
                                    <Ionicons
                                        name="ios-add"
                                        style={{
                                            fontSize: 25,
                                            marginRight: 20,
                                            color: colors.BLACK,
                                            fontFamily: "Helvetica"
                                        }}
                                    />
                                    <Text style={{color: colors.BLACK}}>Tap to add other location</Text>
                                    <Ionicons
                                        name="chevron-forward"
                                        style={{
                                            fontSize: 25,
                                            marginLeft: 20,
                                            color: colors.BLACK,
                                            fontFamily: "Helvetica"
                                        }}
                                    />
                                </View>
                            </TouchableDebounce>
                        )}
                        <FlatList
                            data={offices}
                            contentcontainerstyle={styles.flatListContainer}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({item, index}) => {
                                let isSelected;
                                if (selectedItem)
                                    isSelected = item.Name && item.Name.toString() === selectedItem.toString();
                                if (item.Name !== "Others") {
                                    let locationName =
                                        restrictToPOI === true
                                            ? item.ID === "H"
                                            ? item.Name + "-Nodal"
                                            : item.Name
                                            : item.Name
                                    return (
                                        <React.Fragment>
                                            <TouchableDebounce
                                                key={index}
                                                style={styles.viewNotSelectedStyle}
                                                onPress={() => {
                                                    if(this.props.route.params.from===true) {
                                                        if (type === roster.login) {
                                                            this.props.rosterStore.setPickupLocation(item);
                                                        }else{
                                                            this.props.rosterStore.setDropLocation(item);
                                                        }
                                                    }else {
                                                        if (type === roster.login) {
                                                            this.props.rosterStore.updatePickUpAddress(item, locationName);
                                                        } else {
                                                            this.props.rosterStore.updateDropAddress(item, locationName);
                                                        }
                                                    }
                                                    this.props.navigation.goBack();
                                                }}
                                            >
                                                <Text
                                                    numberOfLines={1}
                                                    style={[styles.itemNameText, {fontWeight: isSelected ? "700" : "400"}]}>
                                                    {locationName}
                                                </Text>
                                                {isSelected ? (
                                                    <FontAwesome
                                                        name={"check-circle"}
                                                        color={colors.GREEN}
                                                        style={{paddingRight: 10}}
                                                        size={26}
                                                        key={index.toString() + "icon"}
                                                    />
                                                ) : (
                                                    <FontAwesome name={"circle-thin"} size={26} style={{paddingRight: 10}}/>
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
        } else {
            return (
                <View
                    style={[styles.nickNameContainer,{width: "100%"}]}
                >
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                    <KeyboardAvoidingView
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%"
                        }}
                        behavior="padding"
                        enabled
                    >
                        <Text style={{fontSize: 25, color: colors.BLACK}}>Set nick name for this place</Text>
                        <View rounded style={{width: "100%", marginTop: 20}}>
                            <Input
                                maxLength={15}
                                style={{color: colors.BLACK, height: 50, width: "80%"}}
                                placeholder={"Enter nick name under 15 character"}
                                placeholderStyle={{color: colors.GRAY, fontSize: 10}}
                                underlineColorAndroid="transparent"
                                autoCapitalize="none"
                                autoCorrect={false}
                                numberOfLines={1}
                                fontSize={16}
                                returnKeyType="next"
                                onChangeText={text => this.nickNameChangeHandler(text)}
                                value={this.state.nickName}
                                blurOnSubmit={true}
                            />
                        </View>
                        <View style={styles.buttonStyle}>
                        <Button
                            onPress={() => {
                                if (this.state.nickName.trim() !== "") {
                                    if (this.props.rosterStore.Locations.filter(e => e.Name === this.state.nickName.trim()).length > 0) {
                                        Alert.alert("Duplicate Name", "Name already Exist");
                                    } else {
                                        this.saveEmployeeNewLocation(
                                            this.state.nickName,
                                            this.state.selectLat,
                                            this.state.selectLng,
                                            this.state.selectedLocation,
                                        );
                                    }
                                } else {
                                    alert("Nick Name cannot be blank");
                                }
                            }}
                            style={{marginTop: 10,width:"45%", backgroundColor: colors.GREEN}}
                        >
                            <Text style={{color: colors.WHITE, fontWeight: "500"}}>
                                Add
                            </Text>
                        </Button>
                        <Button
                            secondary
                            onPress={() => {
                                this.setState({showAddNickName: false});
                            }}
                            style={{marginTop: 10, backgroundColor: colors.RED, width:"45%"}}>
                            <Text style={{color: colors.WHITE, fontWeight: "500"}}>
                                Cancel
                            </Text>
                        </Button>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            );
        }
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
        let allowOtherLocation = this.props.route.params.allowOtherLocation;
        let restrictToPOI = this.props.route.params.restrictToPOI;
        console.warn("allowOtherLocation "+JSON.stringify(allowOtherLocation));
        console.warn("restrictToPOI "+JSON.stringify(restrictToPOI));
        this.setState({type, selectedItem, allowOtherLocation,restrictToPOI});
        setTimeout(() => {
            this.props.rosterStore.disableLoader();
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

export default RosterPickUpDrop;

