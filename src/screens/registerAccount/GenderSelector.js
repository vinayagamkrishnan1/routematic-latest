import React, {Component} from "react";
import {FlatList, StatusBar, StyleSheet, Text, TextInput, View} from "react-native";
import {colors} from "../../utils/Colors";
import TouchableDebounce from "../../utils/TouchableDebounce";
import PleaseWaitLoader from "../../network/loader/PleaseWaitLoader";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import {roster, setupMandatoryFields} from "../../utils/ConstantString";
import {PickerStatusBar, RenderPickerHeader, RenderPickerSearch} from "../mobxRoster/RosterCommonComponents";
import {styles} from '../../utils/RegistartionStyle'
import SafeAreaView from "react-native-safe-area-view";

class GenderSelector extends Component {

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
            data:[],
            selectedItem: ""
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
        if(this.props.route.params) {
            let selectedItem = this.props.route.params.selectedItem;
            this.setState({selectedItem});
            setTimeout(() => {
                this.setState({isLoading: false});
            }, 100);
        }
    }

    render() {
        if (this.state.isLoading) return <PleaseWaitLoader/>;
        let data = ["Male","Female"];
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.WHITE}}>
                <View style={styles.container}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                    <RenderPickerHeader name={setupMandatoryFields.gender} onGoBack={this.onGoBack}/>
                    <FlatList
                        data={data}
                        contentcontainerstyle={styles.flatListContainer}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => {
                            console.warn("Item " + item);
                            let isSelected = this.state.selectedItem?this.state.selectedItem.toString()===(item):false;
                            return (
                                <React.Fragment>
                                    <TouchableDebounce
                                        key={index}
                                        style={styles.viewNotSelectedStyle}
                                        onPress={() => {
                                            this.setState({selectedItem:item});
                                            this.props.route.params.setGender(item);
                                            setTimeout(()=>{
                                                this.props.navigation.goBack();
                                            },200);
                                        }}
                                    >
                                        <Text
                                            numberOfLines={1}
                                            style={[styles.itemNameText, {fontWeight: isSelected ? "700" : "400"}]}>
                                            {item}
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
                                            <View/>
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

export default GenderSelector;
