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
class CostCenterSelector extends Component {

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
            text: "",
            adhoc:false,
            costCenterList:[]
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
            let adhoc = !!this.props.route.params.adhoc;
            let costCenterList = adhoc?this.props.route.params.costCenterList:[];
            console.warn("costCenterList "+JSON.stringify(costCenterList));
            setTimeout(() => {
                    this.setState({
                        selectedValue,
                        isLoading: false,
                        adhoc,
                        costCenterList
                    });
            }, 100);
        });
    }

    render() {
        if (this.state.isLoading) return <PleaseWaitLoader/>;
        let costCenters = [];
        console.warn("adhoc "+this.state.adhoc);
        console.warn("costCenterList "+this.state.costCenterList);
        if(this.state.adhoc){
            costCenters= this.state.costCenterList.filter(word =>
                word.Name.toUpperCase().includes(this.state.text.toUpperCase()));
        }else{
            if(this.props.adhocStore.ProgramsDetails.hasOwnProperty('CostCenters')) {
                costCenters = this.props.adhocStore.ProgramsDetails.CostCenters.filter(word =>
                    word.Name.toUpperCase().includes(this.state.text.toUpperCase())
                );
            }
        }

        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.WHITE}}>
                <View style={styles.container}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                    <RenderPickerHeader
                        name={"Cost Center"}
                        onGoBack={this.onGoBack}/>
                    <RenderPickerSearch text={this.state.text} onFilterInputChange={this.onFilterInputChange}/>
                    <FlatList
                        data={costCenters}
                        contentcontainerstyle={styles.flatListContainer}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => {
                            let isSelected = this.state.selectedValue ? this.state.selectedValue.toString().includes(item.Name) : false;
                            return (
                                <React.Fragment>
                                    <TouchableDebounce
                                        key={index}
                                        style={styles.viewNotSelectedStyle}
                                        onPress={() => {
                                            if(this.state.adhoc){
                                                this.props.route.params.onCostCenterSelected(item);
                                                this.props.navigation.goBack();
                                            }else {
                                                this.props.adhocStore.setCostCenter(item);
                                                this.props.navigation.goBack();
                                            }
                                        }}
                                    >
                                        <Text
                                            numberOfLines={1}
                                            style={[styles.itemNameText, {fontWeight: isSelected ? "700" : "400"}]}>
                                            {item.Name}
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
        width:'90%',
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

export default CostCenterSelector;
