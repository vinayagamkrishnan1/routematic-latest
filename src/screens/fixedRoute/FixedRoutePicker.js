import React, {Component} from "react";
import {FlatList, SafeAreaView, StatusBar, StyleSheet, Text, View} from "react-native";
import {colors} from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import PleaseWaitLoader from "../../network/loader/PleaseWaitLoader";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {inject, observer} from "mobx-react";
import {roster} from "../../utils/ConstantString";
import {RenderPickerHeader, RenderPickerSearch} from "../mobxRoster/RosterCommonComponents";

@inject("fixedRouteStore")
@observer
class FixedRoutePicker extends Component {

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
            routesList: []
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
        console.warn('FixedRoutes params - ', this.props.route.params);
        let type = this.props.route.params.type;
        let selectedItem = this.props.route.params.selectedItem;
        let routesList = this.props.route.params.routesList;
        console.warn('FixedRoutes picker - ', type, selectedItem, routesList);
        this.setState({type, selectedItem, routesList});
        setTimeout(() => {
            this.setState({isLoading: false});
        }, 100);
    }

    render() {
        const {type} = this.state;
        if (this.state.isLoading) return <PleaseWaitLoader/>;
        let routes = this.state.routesList.filter(word =>
            word.RouteName.toUpperCase().includes(this.state.text.toUpperCase())
        );
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.WHITE}}>
                <View style={styles.container}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                    <RenderPickerHeader name={(type === roster.login ? "Select Login Routes" : "Select Logout Routes") } onGoBack={this.onGoBack}/>
                    <RenderPickerSearch text={this.state.text} onFilterInputChange={this.onFilterInputChange}/>
                    <FlatList
                        data={routes}
                        contentcontainerstyle={styles.flatListContainer}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => {
                            let isSelected = this.state.selectedItem ? this.state.selectedItem.toString().includes(item.RouteName) : false;
                            return (
                                <React.Fragment>
                                    <TouchableDebounce
                                        key={index}
                                        style={styles.viewNotSelectedStyle}
                                        onPress={() => {
                                            if (this.state.type === roster.login) {
                                                this.props.fixedRouteStore.updateLoginRoute(item);
                                            } else {
                                                this.props.fixedRouteStore.updateLogoutRoute(item);
                                            }
                                            this.props.navigation.goBack();
                                        }}
                                    >
                                        <Text
                                            numberOfLines={1}
                                            style={[styles.itemNameText, {fontWeight: isSelected ? "700" : "400"}]}>
                                            {item.RouteName}
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

export default FixedRoutePicker;
