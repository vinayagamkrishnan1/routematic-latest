import React, {Component} from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    PermissionsAndroid,
    Platform,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    Text,
    TextInput,
    View,
} from "react-native";
import {colors} from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import {inject, observer} from "mobx-react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import PleaseWaitLoader from "../../network/loader/PleaseWaitLoader";
import Ionicons from "react-native-vector-icons/Ionicons";
import {RenderPickerSearch} from "../../screens/mobxRoster/RosterCommonComponents";

@inject("covidStore")
@observer
class ResourceHelp extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            title: '' // navigation.getParam("title"),
        };
    };
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
                <Text style={{textAlign: "center"}}>No resources available</Text>
            </View>
        );
    };
    renderCity = (store) => {
        return (
            <View style={{backgroundColor: colors.WHITE, borderRadius: 8}}>
                <TouchableDebounce
                    onPress={() => {
                        this.props.navigation.navigate('CitySelection', {
                            selectedValue: store.selectedCity.hasOwnProperty('name') ? store.selectedCity.name : store.defaultCity.cityName
                        });
                    }}
                >

                    <View style={{flexDirection: "row", padding: 20, marginTop: 5}}>
                        <MaterialIcons name={"location-on"} size={24} color={'#9E9E9E'}/>
                        <Text
                            style={officeNameStyle}>{store.selectedCity.hasOwnProperty('name') ? store.selectedCity.name : store.defaultCity.cityName}</Text>
                    </View>
                </TouchableDebounce>
            </View>
        )

    };
    renderPickerSearch = ({text,onFilterInputChange}) => {
        return (
            <View style={searchParentContainer}>
                <View style={searchChildContainer}>
                    <Ionicons name="md-search" color={colors.GRAY} size={22}/>
                    <TextInput
                        style={searchTextInput}
                        onChangeText={(text) => onFilterInputChange(text)}
                        value={text}
                        placeholder="Search..."
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                        multiline={false}
                        autoCorrect={false}
                        numberOfLines={1}
                        returnKeyType="next"
                    />
                </View>
            </View>
        )
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            refreshing: false,
            resourceData: [],
            text: "",
        };
        this.onFilterInputChange = this.onFilterInputChange.bind(this);
    }

    render() {
        if (this.state.isLoading) return <PleaseWaitLoader/>;
        let store = this.props.covidStore;
        let resources = this.state.text
            ? store.resourceData.filter(word =>
                word.name.toUpperCase().includes(this.state.text.toUpperCase()))
            : store.resourceData;
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.WHITE}}>
                <StatusBar barStyle="dark-content"/>
                {this.renderCity(store)}
                <RenderPickerSearch text={this.state.text} onFilterInputChange={this.onFilterInputChange}/>
                <FlatList
                    style={{minHeight: 100, marginBottom: 60}}
                    keyExtractor={this._keyExtractor}
                    data={resources}
                    renderItem={this.renderItem.bind(this)}
                    ListEmptyComponent={this.renderEmptyList}
                    refreshing={this.state.isLoading}
                />
            </SafeAreaView>
        );
    }

    componentDidMount() {
        let title = this.props.route.params.title; // ", "Covid19 Help");
        this.setState({resourceData: this.props.covidStore.resourceData, title});
    }

    onFilterInputChange(text) {
        this.setState({text});
    }

    renderItem(data) {
        return (
            <View
                style={parentContainer}>
                <View style={{flex: 0.7, padding: 6, flexDirection: 'column'}}>
                    <Text style={primaryText}>{data.item.name}</Text>
                    <Text
                        style={[subText, {color: data.item.quantity > 0 ? colors.GREEN : colors.GRAY}]}>{data.item.quantity > 0 ? "Available" : "Not Available"}</Text>
                </View>
                <TouchableDebounce
                    style={[buttonContainer, {borderColor: data.item.quantity > 0 ? colors.GREEN : colors.GRAY}]}
                    onPress={() => {
                        this.setState({set: true});
                        this.props.covidStore.setSelectedItem(data.item.id);
                        this.displayAlert();
                    }}
                    disabled={data.item.quantity === 0}
                >
                    <Text
                        style={[requestText, {color: data.item.quantity > 0 ? colors.GREEN : colors.GRAY}]}>Request</Text>
                </TouchableDebounce>
            </View>
        );
    }

    displayAlert() {
        Alert.alert(
            'Covid help',
            'We will arrange for the items(s) you have requested. Someone from our team will get in touch with you to coordinate the delivery"',
            [
                {
                    text: 'Cancel',
                    onPress: () => {
                        this.props.covidStore.setSelectedItem(-1);
                    },
                    style: 'cancel',
                },
                {
                    text: 'Confirm', onPress: () => {
                        this.props.covidStore.requestForResources().then(() => {
                            this.props.navigation.goBack();
                        });
                    }
                }
            ],
            {cancelable: false},
        );
    }

    _keyExtractor(item, index) {
        return index.toString();
    }

    renderSeparator() {
        return <View style={styles.separator}/>;
    }
}

export default ResourceHelp;

const primaryText = {
    fontFamily: "Helvetica",
    fontSize: 18,
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#000000"
};
const subText = {
    fontFamily: "Helvetica",
    fontSize: 14,
    fontStyle: "normal",
    letterSpacing: 1,
};
const parentContainer = {
    flex: 1,
    flexDirection: "row",
    margin: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderRadius: 8
};
const buttonContainer = {
    flex: 0.3,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    padding: 6,
    alignContent: 'center'
};
const officeNameStyle = {
    width: "100%",
    fontFamily: "Helvetica",
    fontSize: 18,
    // fontWeight: "500",
    textAlign: "left",
    color: colors.BLACK,
    marginLeft: 5
};
const requestText = {
    fontFamily: "Helvetica",
    fontSize: 16,
    fontStyle: "normal",
    letterSpacing: 1.5,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
};
const searchParentContainer = {
    backgroundColor: colors.BACKGROUND,
    height:50,
    padding:16,
    width: "100%",
    justifyContent: "center",
    alignItems: "center"
};
const searchChildContainer = {
    flexDirection: "row",
    paddingLeft: 10,
    justifyContent: "center",
    alignItems: "center"
};
const searchTextInput = {
    borderColor: "gray",
    width: "100%",
    flex: 1,
    paddingLeft: 10,
    color: 'black'
};
