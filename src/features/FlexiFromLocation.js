import React, {Component} from "react";
import {InteractionManager, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View} from "react-native";
import {colors} from "../utils/Colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import TouchableDebounce from "../utils/TouchableDebounce";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";

class FlexiFromLocation extends Component {

    static navigationOptions = ({navigation}) => {
        return {
            headerStyle: {display: "none"}
        };
    };
    state = {
        type: "",
        selectedValue: "",
        locations: [],
        other: false,
        text: ""
    };

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            // ...long-running synchronous task...

            let locations = this.props.route.params.locations;
            let type = this.props.route.params.type;
            let other = this.props.route.params.other;
            let selectedValue = this.props.route.params.selectedValue;

            setTimeout(() => {
                if (locations)
                    this.setState({
                        locations,
                        type,
                        selectedValue,
                        other
                    });
            }, 100);
        });
    }

    render() {
        let locations = this.state.text
            ? this.state.locations.filter(word =>
                this.state.other ?
                    word.Name.toUpperCase().includes(this.state.text.toUpperCase())
                    : word.LocationName.toUpperCase().includes(this.state.text.toUpperCase())
            )
            : this.state.locations;

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
                            {this.props.route.params.type === "from"
                                ? "Source Location"
                                : "Destination Location"}
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
                                marginTop: 20,
                                marginLeft: 20,
                                marginRight: 20
                            }}
                        >
                            {locations.map((Items, index) => {
                                let Item = this.state.other ? Items.Name : Items.LocationName
                                if (!Item) return;
                                let isSelected;
                                if (this.state.selectedValue)
                                    isSelected = Item.includes(this.state.selectedValue);
                                return (
                                    <React.Fragment>
                                        <TouchableDebounce
                                            key={index}
                                            style={viewNotSelectedStyle}
                                            onPress={() => {
                                                setTimeout(() => {
                                                    this.setState({
                                                        selectedValue: Item
                                                    });
                                                }, 0);
                                                setTimeout(() => {
                                                    this.props.navigation.goBack();
                                                }, 10);
                                                setTimeout(() => {
                                                    this.state.type === "from"
                                                        ? this.props.route.params.onFromValueChange(
                                                        Item
                                                        )
                                                        : this.props.route.params.onToValueChange(
                                                        Item
                                                        );
                                                }, 50);
                                            }}
                                        >
                                            <Text
                                                numberOfLines={1}
                                                style={{
                                                    color: colors.BLACK,
                                                    fontSize: 20,
                                                    fontWeight: isSelected ? "700" : "400",
                                                    width: "85%"
                                                }}
                                            >
                                                {Item}
                                            </Text>
                                            {isSelected ? (
                                                <FontAwesome
                                                    name={"check-circle"}
                                                    color={colors.GREEN}
                                                    style={{marginLeft: 8}}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: colors.WHITE
    }
});

export default FlexiFromLocation;
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
