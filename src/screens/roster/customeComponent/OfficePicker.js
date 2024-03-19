//import liraries
import React, {Component} from "react";
import {SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View} from "react-native";
import {colors} from "../../../utils/Colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import TouchableDebounce from "../../../utils/TouchableDebounce";
import PleaseWaitLoader from "../../../network/loader/PleaseWaitLoader";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";

// create a component
class OfficePicker extends Component {
    state = {
        isLoading: true,
        text: "",
        pickupDropSwitch: false,
        selectedPickupLocation: "",
        selectedDropLocation: "",
        data: [
            {
                Name: ""
            }
        ]
    };

    static navigationOptions = ({navigation}) => {
        return {
            //title: "Routematic",
            headerStyle: {display: "none"}
        };
    };

    UNSAFE_componentWillMount() {
        let Offices = this.props.route.params.Offices;
        let selectedPickupLocation = this.props.route.params
            .officeSelected;
        this.setState({
            data: Offices,
            selectedPickupLocation
        });
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({isLoading: false});
        }, 100);
    }

    render() {
        let offices = this.state.data.filter(word =>
            word.Name.toUpperCase().includes(this.state.text.toUpperCase())
        );
        if (this.state.isLoading) return <PleaseWaitLoader/>;
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.WHITE}}>
                <View style={styles.container}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                    <View
                        style={{
                            height: 60,
                            width: "100%",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            flexDirection: "row",
                            backgroundColor: colors.WHITE
                        }}
                    >
                        <Ionicons
                            name="close"
                            style={{
                                fontSize: 30,
                                color: colors.BLACK,
                                marginLeft: 10,
                                fontFamily: "Helvetica"
                            }}
                            onPress={() => this.props.navigation.goBack()}
                        />
                        <Text
                            style={{
                                fontFamily: "Helvetica",
                                fontSize: 18,
                                marginLeft: 5,
                                color: colors.BLACK
                            }}
                        >
                            Select Office Location
                        </Text>
                    </View>

                    <View
                        style={{
                            backgroundColor: colors.BACKGROUND,
                            height: 50,
                            width: "100%",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                paddingLeft: 10,
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <Ionicons name="md-search" color={colors.GRAY} size={20}/>
                            <TextInput
                                style={{
                                    borderColor: "gray",
                                    width: "100%",
                                    flex: 1,
                                    paddingLeft: 10
                                }}
                                onChangeText={text => this.setState({text})}
                                value={this.state.text}
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
                    <ScrollView keyboardShouldPersistTaps='always'>
                        <View
                            style={{
                                flexDirection: "column",
                                flexWrap: "wrap",
                                alignItems: "flex-start",
                                marginTop: 10,
                                marginLeft: 20,
                                marginRight: 20,
                                marginBottom: 10
                            }}
                        >
                            {offices.map((Item, index) => {
                                let isSelected = this.state.selectedPickupLocation.includes(
                                    Item.Name
                                );

                                return (
                                    <React.Fragment>
                                        <TouchableDebounce
                                            key={index}
                                            style={viewNotSelectedStyle}
                                            onPress={() => {
                                                this.setState({selectedPickupLocation: Item.Name});
                                                this.props.route.params.setOfficeLocation(
                                                    Item.Name
                                                );
                                                this.props.navigation.goBack();
                                            }}
                                        >
                                            <Text
                                                numberOfLines={1}
                                                style={{
                                                    color: colors.BLACK,
                                                    fontSize: 20,
                                                    fontWeight: isSelected ? "700" : "400"
                                                }}
                                            >
                                                {Item.Name}
                                            </Text>
                                            {isSelected ? (
                                                <FontAwesome
                                                    name={"check-circle"}
                                                    color={colors.GREEN}
                                                    style={{marginLeft: 10}}
                                                    size={26}
                                                    key={index.toString() + "icon"}
                                                />
                                            ) : (
                                                <FontAwesome name={"circle-thin"} size={26}/>
                                            )}
                                        </TouchableDebounce>
                                    </React.Fragment>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        );
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: colors.WHITE
    }
});

//make this component available to the app
export default OfficePicker;
const viewSelectedStyle = {
    borderRadius: 30,
    padding: 5,
    backgroundColor: colors.BLUE_BRIGHT,
    margin: 5,
    justifyContent: "center",
    alignItems: "center"
};
const viewNotSelectedStyle = {
    width: "100%",
    //borderWidth: 1,
    //borderRadius: 30,
    //borderColor: colors.GRAY,
    padding: 5,
    borderStyle: "solid",
    margin: 5,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row"
};
const dottedLine = {
    width: "100%",
    borderStyle: "dashed",
    borderWidth: 0.5,
    borderColor: "#979797",
    marginTop: 8
};
const line = {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: colors.GRAY,
    marginTop: 50
};
