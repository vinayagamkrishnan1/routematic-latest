import {WebView} from "react-native-webview";
import {ActivityIndicator, Text, View} from "react-native";
import * as Alert from "./Alert";
import React from "react";
import PropTypes from "prop-types";
import {colors} from "./Colors";


export class CustomWebView extends React.Component {

    static propTypes = {
        source: PropTypes.object,
        onHttpError: PropTypes.function,
        onLoad:PropTypes.function,
        reference:PropTypes.function
    };

    handleMessage = (event) => {
        console.warn('handle message' + event);
    };

    render() {
        return (
            <WebView
                ref={this.props.reference}
                style={{flex: 1,width:'100%',height:'100%'}}
                source={this.props.source}
                onMessage={this.handleMessage}
                ignoreSslError={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scalesPageToFit={true}
                renderLoading={this.renderLoader}
                onShouldStartLoadWithRequest={() => true}
                javaScriptEnabledAndroid={true}
                startInLoadingState={true}
                cacheEnabled={false}
                cookiesEnabled={false}
                thirdPartyCookiesEnabled={false}
                onError={() => Alert.show("Error", "Something went wrong!...,\nPlease try again later!.")}
                onHttpError={this.props.onHttpError}
                onLoad={this.props.onLoad}
            />
        );
    }

    renderLoader() {
        return (
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column"
                }}
            >
                <ActivityIndicator size="large" color={colors.BLACK}/>
                <Text style={{fontWeight: "700", fontSize: 20, color: colors.BLACK}}>
                    Please Wait...
                </Text>
            </View>
        );
    }

}
