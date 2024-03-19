import React, {Component} from "react";
import {
    BackHandler,
    DeviceEventEmitter,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import TouchableDebounce from "../../utils/TouchableDebounce";
import {inject, observer} from "mobx-react";
import {colors} from "../../utils/Colors";

@inject("feedbackStore")
@observer
export default class Categories extends Component<{}> {
    static navigationOptions = () => {
        return {
            title: "Select category",
            headerTitleStyle: {fontFamily: "Roboto"}
        };
    };


    _keyExtractor(item, index) {
        return index.toString();
    }

    getSubCategory(item) {
        this.props.feedbackStore.setCategory(item);
    }

    renderItem(data) {
        let {item} = data;
        return (
            <TouchableDebounce
                style={styles.itemBlock}
                onPress={() => {
                    this.getSubCategory(item);
                }}
            >
                <View style={{width: "10%"}}>
                    <MaterialIcons
                        name="keyboard-arrow-right"
                        style={{fontSize: 30, color: "black"}}
                    />
                </View>
                <Text style={styles.itemName}>{item.name}</Text>
            </TouchableDebounce>
        );
    }

    renderSeparator() {
        return <View style={styles.separator}/>;
    }


    render() {
        return (
            <View style={[styles.container,{backgroundColor: colors.WHITE}]}>
                <StatusBar barStyle="dark-content"/>
                <FlatList
                    keyExtractor={this._keyExtractor}
                    data={this.props.feedbackStore.categoriesList}
                    renderItem={this.renderItem.bind(this)}
                    ItemSeparatorComponent={this.renderSeparator.bind(this)}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    itemBlock: {
        flexDirection: "row",
        padding: 10,
        alignItems:'center',
        width: "100%"
    },
    itemName: {
        width: "95%",
        fontSize: 15,
        padding: 5,
        color: colors.BLACK
    },
    separator: {
        height: 0.5,
        width: "100%",
        alignSelf: "center",
        backgroundColor: "#555"
    }
});
