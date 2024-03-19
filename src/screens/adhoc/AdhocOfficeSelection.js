import React, {Component} from "react";
import {FlatList, InteractionManager, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View} from "react-native";
import {colors} from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import PleaseWaitLoader from "../../network/loader/PleaseWaitLoader";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {inject, observer} from "mobx-react";
import {RenderPickerHeader, RenderPickerSearch} from "./../mobxRoster/RosterCommonComponents";

@inject("mAdHocStore")
@observer
class AdhocOfficeSelection extends Component {

    static navigationOptions = () => {
        return {
            headerStyle: {display: "none"}
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            type: "",
            selectedValue: "",
            locations: [],
            text: "",
            isDatePickerVisible: false,
            dateSelected: ""
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
            let selectedValue = this.props.route.params.selectedValue;
            setTimeout(() => {
                if (locations)
                    this.setState({
                        locations,
                        type,
                        selectedValue,
                        isLoading: false
                    });
            }, 100);
        });
    }

    render() {
        if (this.state.isLoading) return <PleaseWaitLoader/>;
        let store =this.props.mAdHocStore;
        let locations = this.state.text
            ? this.state.locations.filter(word =>
                word.officeLocationName.toUpperCase().includes(this.state.text.toUpperCase()))
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
                        name={"Select Office"}
                        onGoBack={this.onGoBack}/>
                    <RenderPickerSearch text={this.state.text} onFilterInputChange={this.onFilterInputChange}/>
                    <FlatList
                        data={locations}
                        contentcontainerstyle={styles.flatListContainer}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => {
                            let itemName = item.officeLocationName;
                            let isSelected = this.state.selectedValue ? this.state.selectedValue.toString().includes(itemName) : false;
                            return (
                                <React.Fragment>
                                    <TouchableDebounce
                                        key={index}
                                        style={styles.viewNotSelectedStyle}
                                        onPress={() => {
                                            setTimeout(() => {
                                                this.setState({selectedValue: itemName});
                                                store.setSelectedOffice(item);
                                                this.props.navigation.goBack();
                                            }, 50);
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

export default AdhocOfficeSelection;
