import React, {Component} from "react";
import {FlatList, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View} from "react-native";
import {colors} from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import PleaseWaitLoader from "../../network/loader/PleaseWaitLoader";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import {inject, observer} from "mobx-react";
import {PickerStatusBar, RenderPickerHeader, RenderPickerSearch} from "../mobxRoster/RosterCommonComponents";

@inject("adhocStore")
@observer
class TravellerTypeSelector extends Component {

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
            selectedItem: "",
            travellers:[]
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
        let selectedItem = this.props.route.params.selectedItem;
        let travellers = this.props.route.params.hasOwnProperty("travellers")?this.props.route.params.travellers:[];
        this.setState({selectedItem,travellers});
        setTimeout(() => {
            this.setState({isLoading: false});
        }, 100);
    }

    render() {
        if (this.state.isLoading) return <PleaseWaitLoader/>;
        let TravellersArray = this.state.travellers.length > 0 ? this.state.travellers : this.props.adhocStore.Travellers;
        let travellers = TravellersArray.filter(word =>
            word.Name.toUpperCase().includes(this.state.text.toUpperCase())
        );
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.WHITE}}>
                <View style={styles.container}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                    <RenderPickerHeader name={"Travellers"} onGoBack={this.onGoBack}/>
                    <RenderPickerSearch text={this.state.text} onFilterInputChange={this.onFilterInputChange}/>
                    <FlatList
                        data={travellers}
                        contentcontainerstyle={styles.flatListContainer}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => {
                            let name= item.Name;
                            let isSelected = this.state.selectedItem ? this.state.selectedItem.toString()===(name) : false;
                            return (
                                <React.Fragment>
                                    <TouchableDebounce
                                        key={index}
                                        style={styles.viewNotSelectedStyle}
                                        onPress={() => {
                                            if(this.state.travellers.length>0){
                                                this.props.route.params.onTravellerselected(item);
                                                this.props.navigation.goBack();
                                            } else {
                                                this.props.adhocStore.setTraveller(item.Name);
                                                if(this.props.adhocStore.travellerSelected === 'Employee') {
                                                    this.props.navigation.goBack();
                                                } else {
                                                    this.props.adhocStore.travellerNumber = "";
                                                    this.props.adhocStore.travellerName = "";
                                                    this.props.adhocStore.travellerEmail = "";
                                                    this.props.adhocStore.travellerContactNo = "";
                                                    this.props.adhocStore.travellerAltContactNo = "";
                                                    this.props.adhocStore.nationality = "";
                                                    this.props.navigation.goBack();
                                                }
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

export default TravellerTypeSelector;
