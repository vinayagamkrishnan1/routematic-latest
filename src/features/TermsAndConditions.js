import React, {Component} from "react";
import {Alert,Text, View} from "react-native";
import {WebView} from "react-native-webview";
import {Button} from "native-base";
import {inject, observer} from "mobx-react";
import {colors} from "../utils/Colors";

@inject("homeStore")
@observer
export default class TermsAndConditions extends Component{

    static navigationOptions = {
        title: "Terms & Conditions",
        headerTitleStyle: {fontFamily: "Roboto"}
    };

    render() {
        const content = this.props.homeStore.termsAndConditionHTMLContent;
        return (
            <View style={{width: '100%', flex: 1}}>
                <WebView
                    style={{flex:1}}
                    source={{html: content}}/>
                <Button
                    backgroundColor={colors.BLUE}
                    style={{
                        bottom: 0,
                        left: 0,
                        right: 0
                    }}
                    onPress={() => this.props.homeStore.acceptTermsAndCondition().then((value)=>{
                        if(this.props.homeStore.termsChanged===false){
                            Alert.alert("Routematic","Updated Successfully");
                            this.props.navigation.goBack();
                        }
                    })}
                >
                    <Text style={{color:colors.WHITE,fontSize:18}}>
                        Accept
                    </Text>
                </Button>
            </View>
        );
    }
}