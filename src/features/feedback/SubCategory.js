import React, {Component} from "react";
import {FlatList, Image, Platform, RefreshControl, StatusBar, StyleSheet, Text, View} from "react-native";

import TouchableDebounce from "../../utils/TouchableDebounce";
import SafariView from "react-native-safari-view";
// import {CustomTabs} from "react-native-custom-tabs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {colors} from "../../utils/Colors";
import {inject, observer} from "mobx-react";

@inject("feedbackStore")
@observer
export default class SubCategory extends Component<{}> {
    static navigationOptions = {
        title: "Issue",
        headerTitleStyle: {fontFamily: "Roboto"}
    };

    constructor(props) {
        super(props);
    }

    _keyExtractor(item, index) {
        return index.toString();
    }

    addComments(item) {
        if (item.name.startsWith("http")) {
            if (Platform.OS === "ios") {
                SafariView.isAvailable()
                    .then(
                        SafariView.show({
                            url: item.name,
                            readerMode: true, // optional,
                            tintColor: "#000", // optional
                            barTintColor: "#fff" // optional
                        })
                    )
                    .catch(error => {
                        // Fallback WebView code for iOS 8 and earlier
                        alert(JSON.stringify(error.message));
                    });
            } else {
                // CustomTabs.openURL(item.name, {
                //     toolbarColor: "#607D8B",
                //     enableUrlBarHiding: true,
                //     showPageTitle: true,
                //     enableDefaultShare: true,
                //     animations: {
                //         startEnter:
                //             "com.github.droibit.android.reactnative.customtabs.example:anim/slide_in_bottom",
                //         startExit:
                //             "com.github.droibit.android.reactnative.customtabs.example:anim/slide_out_bottom",
                //         endEnter:
                //             "com.github.droibit.android.reactnative.customtabs.example:anim/slide_in_bottom",
                //         endExit:
                //             "com.github.droibit.android.reactnative.customtabs.example:anim/slide_out_bottom"
                //     },

                //     headers: {
                //         "my-custom-header": "my custom header value"
                //     },
                //     forceCloseOnRedirection: true
                // });
            }
            return;
        }
        this.props.feedbackStore.setSubCategory(item);
        this.props.navigation.navigate("Comments");
    }

    renderItem(data) {
        let {item} = data;
        return (
            <TouchableDebounce
                style={styles.itemBlock}
                onPress={() => {
                    this.addComments(item);
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
                    data={this.props.feedbackStore.selectedCategory.subcategories}
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
        alignItems: 'center',
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
