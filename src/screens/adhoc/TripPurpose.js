import React, {Component} from "react";
import {FlatList, InteractionManager, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View} from "react-native";
import {colors} from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import PleaseWaitLoader from "../../network/loader/PleaseWaitLoader";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import {inject, observer} from "mobx-react";
import {PickerStatusBar, RenderPickerHeader, RenderPickerSearch} from "./../mobxRoster/RosterCommonComponents";
import {Select} from "../../stores/modifiedAdHocStore";

@inject("mAdHocStore")
@observer
class TripPurpose extends Component {

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
            adhoc:true
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
            let Purposes = this.props.route.params.Purposes;
            let adhoc = !!this.props.route.params.adhoc;
            let selectedItem = !!this.props.route.params.selectedItem;
            setTimeout(() => {
                this.setState({
                    isLoading: false,
                    adhoc,
                    selectedItem,
                    Purposes
                });
            }, 100);
        });
    }

    render() {
        if (this.state.isLoading) return <PleaseWaitLoader/>;
        let store = this.props.mAdHocStore;
        let Purpose =[];
        let selectedItem =Select;
        if(this.state.adhoc){
            selectedItem = store.selectedTripPurposes.hasOwnProperty("Purpose") ? store.selectedTripPurposes.Purpose : Select
            Purpose = store.tripPurposesArray.filter(word =>
                word.Purpose.toUpperCase().includes(this.state.text?.toUpperCase())
            );
        }else{
            selectedItem =this.state.selectedItem;
            Purpose = this.state.Purposes.filter(word =>
                word.Purpose.toUpperCase().includes(this.state.text?.toUpperCase())
            );
        }
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.WHITE}}>
                <View style={styles.container}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                    <RenderPickerHeader name={"Trip Purpose "} onGoBack={this.onGoBack}/>
                    <RenderPickerSearch text={this.state.text} onFilterInputChange={this.onFilterInputChange}/>
                    <FlatList
                        data={Purpose}
                        contentcontainerstyle={styles.flatListContainer}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => {
                            let name = item.Purpose;
                            let isSelected = selectedItem?.toString().includes(name);
                            return (
                                <React.Fragment>
                                    <TouchableDebounce
                                        key={index}
                                        style={styles.viewNotSelectedStyle}
                                        onPress={() => {

                                            if(this.state.adhoc){
                                                store.setTripPurpose(item);
                                                this.props.navigation.goBack();
                                            }else {
                                                this.props.route.params.OnTripPurposeSelected(item);
                                                this.props.navigation.goBack();
                                            }
                                        }}
                                    >
                                        <Text
                                            numberOfLines={1}
                                            style={[styles.itemNameText, {fontWeight: isSelected ? "700" : "400"}]}>
                                            {name}
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

export default TripPurpose;
