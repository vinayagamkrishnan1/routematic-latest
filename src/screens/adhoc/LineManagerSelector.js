import React, {Component} from "react";
import {FlatList, InteractionManager, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View} from "react-native";
import {colors} from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import PleaseWaitLoader from "../../network/loader/PleaseWaitLoader";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import {inject, observer} from "mobx-react";
import {PickerStatusBar, RenderPickerHeader, RenderPickerSearch} from "./../mobxRoster/RosterCommonComponents";
import SearchableDropDown from "../../utils/SearchableDropDown";

@inject("adhocStore")
@observer
class LineManagerSelector extends Component {

    static navigationOptions = () => {
        return {
            headerStyle: {display: "none"}
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading:false,
            selectedValue: "",
            LineManager:[],
            text: "",
            adhoc:false
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
            let selectedValue = this.props.route.params.selectedValue;
            let adhoc = this.props.route.params.adhoc;
            let LineManager =[];
            if(adhoc){
                LineManager = this.props.route.params.lineManagerArray;
            }else {
                LineManager = (this.props.adhocStore.selectedCostCenter !== "" && this.props.adhocStore.selectedCostCenter !== "Select") ?
                    [this.props.adhocStore.selectedCostCenterEmail] : this.props.adhocStore.ProgramsDetails.LineManagerEmails;
            }
            setTimeout(() => {
                    this.setState({
                        selectedValue,
                        isLoading: false,
                        LineManager,
                        adhoc
                    });
            }, 100);
        });
    }

    render() {
        if (this.state.isLoading) return <PleaseWaitLoader/>;
        let lineMangers = this.state.LineManager.filter(word =>
            word.toUpperCase().includes(this.state.text.toUpperCase())
        );
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.WHITE}}>
                <View style={styles.container}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                    <RenderPickerHeader
                        name={"Line Manager"}
                        onGoBack={this.onGoBack}/>
                    <RenderPickerSearch text={this.state.text} onFilterInputChange={this.onFilterInputChange}/>
                    <FlatList
                        data={lineMangers}
                        contentcontainerstyle={styles.flatListContainer}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => {
                            let isSelected = this.state.selectedValue ? this.state.selectedValue.toString().includes(item) : false;
                            return (
                                <React.Fragment>
                                    <TouchableDebounce
                                        key={index}
                                        style={styles.viewNotSelectedStyle}
                                        onPress={() => {
                                            if(this.state.adhoc){
                                                this.props.route.params.onLineManagerSelected(item);
                                                this.props.navigation.goBack();
                                            }else {
                                                this.props.adhocStore.setLineManager(item);
                                                this.props.navigation.goBack();
                                            }
                                        }}
                                    >
                                        <Text
                                            numberOfLines={1}
                                            style={[styles.itemNameText, {flex:0.9,fontWeight: isSelected ? "500" : "300"}]}>
                                            {item}
                                        </Text>
                                        {isSelected ? (
                                            <FontAwesome
                                                name={"check-circle"}
                                                color={colors.GREEN}
                                                style={{flex:0.1,paddingRight: 10}}
                                                size={26}
                                                key={index.toString() + "icon"}
                                            />
                                        ) : (
                                            <FontAwesome name={"circle-thin"} size={26} style={{flex:0.1,paddingRight: 10}}/>
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
        fontSize: 18
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
        flex:1,
        padding: 5,
        borderStyle: "solid",
        margin: 5,
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row"
    }
});

export default LineManagerSelector;
