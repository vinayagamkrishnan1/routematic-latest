import React, {Component} from "react";
import moment from "moment";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {FlatList, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View} from "react-native";
import {colors} from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import PleaseWaitLoader from "../../network/loader/PleaseWaitLoader";
import {inject, observer} from "mobx-react";
import {roster} from "../../utils/ConstantString";
import {PickerStatusBar, RenderPickerHeader, RenderPickerSearch} from "../mobxRoster/RosterCommonComponents";

@inject("fixedRouteStore")
@observer
class FixedRouteShiftPicker extends Component {

    static navigationOptions = () => {
        return {
            headerStyle: {display: "none"}
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            text: "",
            type: "",
            selectedItem: "",
            data: []
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
        let type = this.props.route.params.type;
        let selectedItem = this.props.route.params.selectedItem;
        let data = this.props.route.params.data.split('|');
        this.setState({type, selectedItem, data});
        setTimeout(() => {
            this.setState({isLoading: false});
        }, 100);
    }

    render() {
        if (this.state.isLoading) return <PleaseWaitLoader/>;
        const {type,text,data,selectedItem}=this.state;
        let shiftTimes = text
            ? data.filter(word => word.toUpperCase().includes(text.toUpperCase()))
            : data;
        console.warn("Shifts "+JSON.stringify(shiftTimes));
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.WHITE}}>
                <View style={styles.container}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                    <RenderPickerHeader name={(type===roster.login?"Select Login Time" : "Select Logout Time") + " (24Hr Format)"} onGoBack={this.onGoBack}/>
                    <RenderPickerSearch text={text} onFilterInputChange={this.onFilterInputChange}/>
                    <FlatList
                        data={shiftTimes}
                        contentcontainerstyle={styles.flatListContainer}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => {
                            if (!item) return;
                            let isSelected;
                            if (selectedItem)
                                isSelected = item && item.includes(selectedItem);
                            return (
                                <React.Fragment>
                                    <TouchableDebounce
                                        key={index}
                                        style={styles.viewNotSelectedStyle}
                                        onPress={() => {
                                            if (type === roster.login) {
                                                this.props.fixedRouteStore.updateLoginShiftTime(item);
                                            } else {
                                                this.props.fixedRouteStore.updateLogOutShiftTime(item);
                                            }
                                            this.props.navigation.goBack();
                                        }}
                                    >
                                        <Text
                                            numberOfLines={1}
                                            style={[styles.itemNameText, {fontWeight: isSelected ? "700" : "400"}]}>
                                            {item === "Select"
                                                ? item
                                                : type === roster.login
                                                    ? moment(item, "HH:mm").format("HH:mm")
                                                    : item.includes("*")
                                                        ? moment(item, "HH:mm").format("HH:mm") + " *"
                                                        : moment(item, "HH:mm").format("HH:mm")
                                            }
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

export default FixedRouteShiftPicker;

