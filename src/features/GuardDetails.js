import React, {Component} from "react";
import {Alert, Image,ImageBackground, Keyboard, View} from "react-native";
import {colors} from "../utils/Colors";
import {Button, Text} from "native-base";

export default class GuardDetails extends Component {

    static navigationOptions = {
        title: "Guard Details",
        headerTitleStyle: {fontFamily: "Roboto"}
    };

    state = {
        token: '',
        imageLoading : false,
        isLoading: true,
        tripId: false,
        Guard: {}
    };

    UNSAFE_componentWillMount() {
        if (this.props.route.params) {
            this.setState({
                token: this.props.route.params.access_token,
                Guard: this.props.route.params.guardData,
            });
        }
    }

    imageLoadingError(){
        this.setState({ imageLoading: false });
    }

    render() {
        let getImage = "";
        if(this.state.Guard.vaccinationStatus==="Not Vaccinated"){
            getImage = require("../assets/photo_image.png");
        }else if(this.state.Guard.vaccinationStatus==="Partially Vaccinated"){
            getImage = require("../assets/dashboard/partiallyVaccine.png");
        }else if(this.state.Guard.vaccinationStatus==="Fully Vaccinated"){
            getImage = require("../assets/dashboard/fullyVaccine.png");
        }
        console.warn("this.state.Guard.profilePhotoURL "+this.state.Guard.profilePhotoURL);
        return (
            <View style={{
                flex: 1,
                flexDirection: 'column',
                backgroundColor: "#FFFFFF",
                alignContent: 'center',
            }}>
                <View style={{
                    flex: 1, flexDirection: 'column',
                    alignSelf: "stretch",
                    alignItems: 'center',
                    marginTop: 20,
                    padding: 16
                }}>
                    <View style={{
                        width: 320,
                        height: 320,
                        padding: 12
                    }}>
                        <ImageBackground
                            source={getImage}
                            resizeMethod="scale"
                            resizeMode="cover"
                            style={{
                                flex:1,
                                width: 330,
                                height: 330,
                                alignContent: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Image
                                source={{uri: this.state.Guard.profilePhotoURL}}
                                onError={this.imageLoadingError.bind(this)}
                                resizeMethod="scale"
                                resizeMode="cover"
                                style={{
                                    width: 208,
                                    height: 208,
                                    borderRadius: 104,
                                    alignContent: 'center',
                                    alignSelf: 'center',
                                    marginBottom: 8,
                                    padding: 6,
                                    borderWidth:2,
                                }}
                            />
                        </ImageBackground>
                    </View>
                    <Text style={{
                        color: colors.BLACK,
                        padding: 6,
                        fontSize: 18,
                    }}>{"Name : " + this.state.Guard.guardName}</Text>
                    {this.state.Guard.hasOwnProperty("guardId") && (
                        <Text style={{
                            color: colors.BLACK,
                            padding: 6,
                            fontSize: 18
                        }}>{"ID : " + this.state.Guard.guardId} </Text>
                    )}
                </View>
            </View>
        );
    }
}
