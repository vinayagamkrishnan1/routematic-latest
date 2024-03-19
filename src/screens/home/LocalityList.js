import React, {Component} from "react";
import {InteractionManager, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View} from "react-native";
import {colors} from "../../utils/Colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import TouchableDebounce from "../../utils/TouchableDebounce";
import PleaseWaitLoader from "../../network/loader/PleaseWaitLoader";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";

class LocalityList extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            headerStyle: {display: "none"}
        };
    };
    state = {
        isLoading: true,
        text: "",
        selectedLocality: "",
        localityList: []
    };

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            let localityList = this.props.route.params.localityList;
            let selectedLocality = this.props.route.params.localityId;
            setTimeout(() => {
                if (localityList)
                    this.setState({
                        localityList,
                        selectedLocality,
                        isLoading: false
                    });
            }, 100);
        });
    }

    render() {
        if (this.state.isLoading) return <PleaseWaitLoader/>;

        let localityList = this.state.text
            ? this.state.localityList.filter(word =>
                word.localityName.toUpperCase().includes(this.state.text.toUpperCase())
            )
            : this.state.localityList;

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
                            Select Your Locality
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
                            {localityList.map((Item, index) => {
                                if (!Item) return;
                                let isSelected;
                                if (this.state.selectedLocality)
                                    isSelected = Item && Item.localityId === this.state.selectedLocality;
                                return (
                                    <React.Fragment>
                                        <TouchableDebounce
                                            key={index}
                                            style={styles.viewNotSelectedStyle}
                                            onPress={() => {
                                                this.setState({selectedLocality: Item.localityId});
                                                this.props.navigation.goBack();
                                                this.props.route.params.onLocalityChange(Item);
                                            }}
                                        >
                                            <Text
                                                numberOfLines={1}
                                                style={{
                                                    color: colors.BLACK,
                                                    fontSize: 20,
                                                    width: '90%',
                                                    fontWeight: isSelected ? "700" : "400"
                                                }}
                                            >
                                                {Item.localityName}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: colors.WHITE
    },
    viewNotSelectedStyle: {
        width: "100%",
        padding: 5,
        borderStyle: "solid",
        margin: 5,
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row"
    }
});
export default LocalityList;
