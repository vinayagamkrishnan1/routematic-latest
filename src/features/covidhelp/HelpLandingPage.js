import React, {Component} from "react";
import {AppState, Image, Keyboard, View} from "react-native";
import {Body, Card, CardItem, Container, Content, Left, Right, Text} from 'native-base';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {colors} from "../../utils/Colors.js"
import TouchableDebounce from "../../utils/TouchableDebounce";
import {_renderOffice} from "../../screens/roster/customeComponent/customComponent";
import {inject, observer} from "mobx-react";
import {asyncString} from "../../utils/ConstantString";
import { CryptoXor } from "crypto-xor";

@inject("covidStore")
@observer
class HelpLandingPage extends Component {
    static navigationOptions = ({}) => {
        return {
            title: "Covid Resources"
        };
    };
    state = {
        isLoading: false,
        refreshing: false,
    };

    constructor(props) {
        super(props);
        this.state = {access_token: ""};
    }

    _renderCity(store) {
        return (
            <View style={{backgroundColor: colors.WHITE, borderRadius: 8}}>
                <TouchableDebounce
                    onPress={() => {
                        this.props.navigation.navigate('CitySelection',{
                            selectedValue:store.selectedCity.hasOwnProperty('name')?store.selectedCity.name:store.defaultCity.cityName
                        });
                    }}
                >
                    {_renderOffice("City", store.selectedCity.hasOwnProperty('name')?store.selectedCity.name:store.defaultCity.cityName)}
                </TouchableDebounce>
            </View>)
    }

    render() {
        let store = this.props.covidStore;
        return (
            <Container style={{backgroundColor: colors.WHITE}} >
                <Content style={{margin: 6}} showsVerticalScrollIndicator={false}>
                    <Card transparent>
                        <CardItem header>
                            <Left>
                                <Body>
                                <Text style={header}>Oxygen Resources</Text>
                                </Body>
                            </Left>
                        </CardItem>
                        <CardItem cardBody>
                            <Left>
                                <Text multiline={true}
                                      style={{margin: 6, padding: 4}}>Let us know what you have. Search for what you need. We are in it together!
                                </Text>
                            </Left>
                        </CardItem>
                        <CardItem footer>
                            <Left>
                                <TouchableDebounce onPress={() => {
                                    store.setSelectedResources('oxygen',false);
                                    this.props.navigation.navigate("ResourceListing",{
                                        title: "Oxygen Help",
                                    });
                                }}>
                                    <Card style={buttonImage}>
                                        <Body>
                                        <Image
                                            defaultSource={require("../../assets/covid/Oxygen.png")}
                                            source={require("../../assets/covid/Oxygen.png")}
                                            resizeMethod="scale"
                                            resizeMode="cover"
                                            style={{height: 120}}
                                        />
                                        <Text style={textStyle}>Help Others</Text>
                                        </Body>
                                    </Card>
                                </TouchableDebounce>
                            </Left>
                            <Right>
                                <TouchableDebounce onPress={() => {
                                    store.setSelectedResources('oxygen',true);
                                    this.props.navigation.navigate("ResourceHelp",{
                                        title: "Oxygen Search",
                                    });
                                }}>
                                    <Card style={buttonImage}>
                                        <Body>
                                        <Image
                                            defaultSource={require("../../assets/covid/SearchO2.png")}
                                            source={require("../../assets/covid/SearchO2.png")}
                                            resizeMethod="scale"
                                            resizeMode="cover"
                                            style={{height: 120}}
                                        />
                                        <Text style={textStyle}>Search</Text>
                                        </Body>
                                    </Card>
                                </TouchableDebounce>
                            </Right>
                        </CardItem>
                    </Card>
                    <Card transparent>
                        <CardItem header>
                            <Left>
                                <Body>
                                <Text style={header}>Medicines</Text>
                                </Body>
                            </Left>
                        </CardItem>
                        <CardItem cardBody>
                            <Left>
                                <Text multiline={true}
                                      style={{margin: 6, padding: 4}}>Let us know what you have. Search for what you need. We are in it together!
                                </Text>
                            </Left>
                        </CardItem>
                        <CardItem footer>
                            <Left>
                                <TouchableDebounce onPress={() => {
                                    store.setSelectedResources('Medicines',false);
                                    this.props.navigation.navigate("ResourceListing",{
                                        title: "Medicines Help",
                                    });
                                }}>
                                    <Card style={buttonImage}>
                                        <Body>
                                        <Image
                                            defaultSource={require("../../assets/covid/Medicines.png")}
                                            source={require("../../assets/covid/Medicines.png")}
                                            resizeMethod="scale"
                                            resizeMode="cover"
                                            style={{height: 120}}
                                        />
                                        <Text style={textStyle}>Help Others</Text>
                                        </Body>
                                    </Card>
                                </TouchableDebounce>
                            </Left>
                            <Right>
                                <TouchableDebounce onPress={() => {
                                    store.setSelectedResources('Medicines',true);
                                    this.props.navigation.navigate("ResourceHelp",{
                                        title: "Medicines Search",
                                    });
                                }}>
                                    <Card style={buttonImage}>
                                        <Body>
                                        <Image
                                            defaultSource={require("../../assets/covid/SearchMeds.png")}
                                            source={require("../../assets/covid/SearchMeds.png")}
                                            resizeMethod="scale"
                                            resizeMode="cover"
                                            style={{height: 120}}
                                        />
                                        <Text style={textStyle}>Search</Text>
                                        </Body>
                                    </Card>
                                </TouchableDebounce>
                            </Right>
                        </CardItem>
                    </Card>
                </Content>
            </Container>
        );
    }

    componentDidMount() {
        if (this.state.access_token === "") {
            AsyncStorage.multiGet(
                [asyncString.ACCESS_TOKEN],
                (err, savedData) => {
                    var _token = CryptoXor.decrypt(
                        savedData[0][1],
                        asyncString.ACCESS_TOKEN
                    );
                    this.setState({access_token: _token});
                    this.props.covidStore.initCovidStore(_token);
                }
            );
        }
        this.focusListener = this.props.navigation.addListener('focus', () => {
            if (this.state.access_token !== "")
                this.props.covidStore.initCovidStore(this.state.access_token);
        });
    }

    componentWillUnmount() {
        // this.focusListener.remove();
    }

}

const buttonImage = {
    height: 150
};
const header = {
    fontFamily: "Helvetica",
    fontSize: 18,
    fontStyle: "normal",
    letterSpacing: 1.2,
    color: colors.BLACK,
    fontWeight: 'bold'
};
const textStyle = {
    fontFamily: "Helvetica",
    fontSize: 15,
    letterSpacing: 1,
    color: colors.BLUE_BRIGHT,
    fontWeight: 'bold'
};

export default HelpLandingPage;
