import React, {Component} from "react";
import {WebView} from "react-native-webview";
import { View } from "react-native";
import { colors } from "../../utils/Colors";

export default class TravelDeskTermsAndCons extends Component {

    render() {
        console.warn('WV params ==> ', this.props.route.params);
        const data = this.props.route.params.termscons;
        return (
            <View style={{width: '100%', flex: 1, backgroundColor: colors.WHITE}}>
                <WebView
                    style={{flex:1, margin: 16}}
                    source={{ html: data }}/>
                    {/* he.decode(data) */}
            </View>
        );
    }
}