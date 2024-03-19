import React, {Component} from "react";
import {FlatList, InteractionManager, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View} from "react-native";
import {colors} from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import PleaseWaitLoader from "../../network/loader/PleaseWaitLoader";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import {inject, observer} from "mobx-react";
import {PickerStatusBar, RenderPickerHeader, RenderPickerSearch} from "./../mobxRoster/RosterCommonComponents";

@inject("adhocStore")
@observer
class LocationSelector extends Component {

    static navigationOptions = () => {
        return {
            headerStyle: {display: "none"}
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading:false,
            type: "",
            selectedValue: "",
            locations: [],
            other: false,
            text: ""
        };
        this.onFilterInputChange = this.onFilterInputChange.bind(this);
        this.onGoBack = this.onGoBack.bind(this);
    }

    onFilterInputChange(text) {
        this.setState({text});
    }

    onGoBack() {
        this.props.navigation.goBack()
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
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
                        other,
                        isLoading: false
                    });
            }, 100);
        });
    }

    render() {
        if (this.state.isLoading) return <PleaseWaitLoader/>;
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
                    <RenderPickerHeader
                        name={this.props.route.params.type === "from"
                            ? "Source Location"
                            : "Destination Location"}
                        onGoBack={this.onGoBack}/>
                    <RenderPickerSearch text={this.state.text} onFilterInputChange={this.onFilterInputChange}/>
                    <FlatList
                        data={locations}
                        contentcontainerstyle={styles.flatListContainer}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => {
                            let itemName = this.state.other ? item.Name : item.LocationName;
                            let isSelected = this.state.selectedValue ? this.state.selectedValue.toString().includes(itemName) : false;
                            return (
                                <React.Fragment>
                                    <TouchableDebounce
                                        key={index}
                                        style={styles.viewNotSelectedStyle}
                                        onPress={() => {
                                            setTimeout(() => {
                                                if (this.state.type === "from") {
                                                    this.props.route.params.onFromValueChange(itemName);
                                                } else {
                                                    this.props.route.params.onToValueChange(itemName);
                                                }
                                            }, 50);
                                            this.props.navigation.goBack();
                                        }}
                                    >
                                        <Text
                                            numberOfLines={1}
                                            style={[styles.itemNameText, {fontWeight: isSelected ? "700" : "400"}]}>
                                            {itemName}
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
                        }}
                        style={{marginTop: 10}}/>
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
    }
});

export default LocationSelector;
