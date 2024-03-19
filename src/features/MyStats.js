import React, {Component} from "react";
import { retrieveItem } from "../model/StorageHelper";
import {URL} from "../network/apiConstants";
import {refreshToken} from "../network/apiFetch/API";
import {asyncString} from "../utils/ConstantString";
import {CustomWebView} from "../utils/CustomWebView";

class MyStats extends Component {

    state = {
        token: '',
        isLoading: true,
        forceReload: false,
    };
    onHttpError = (syntheticEvent) => {
        if (syntheticEvent) {
            const {nativeEvent} = syntheticEvent;
            if (nativeEvent.statusCode === 401 && !!this.state.isLoading) {
                refreshToken().then(async () => {
                    let token = await retrieveItem(asyncString.REFRESH_TOKEN);
                    // console.warn("Reload "+token);
                    this.setState({token,forceReload:true});
                    if(this.webView1){
                        this.webView1.reload();
                    }else{
                        this.webView.reload();
                    }
                }).catch(rejectError => {
                    console.warn("Reject Error : " + rejectError);
                })
            }
        }
    };

    reference = (references) => {
        this.webView = references;
    };
    reference1 = (references) => {
        this.webView1 = references;
    };

    onLoad = () => {
        this.setState({forceReload: false});
    };

    UNSAFE_componentWillMount() {
        if (this.props.route.params) {
            this.setState({
                token: this.props.route.params.Token
            })
        }
    }

    render() {
        let source = {
            uri: URL.GET_STATS_DATA,
            headers: {'Authorization': "Bearer " + this.state.token},
        };
        if(this.state.forceReload===true){
            return (
                <CustomWebView
                    source={source}
                    onHttpError={this.onHttpError.bind(this)}
                    onLoad={this.onLoad.bind(this)}
                    reference={this.reference1.bind(this)}
                />
            );
        }else{
            return (
                <CustomWebView
                    source={source}
                    onHttpError={this.onHttpError.bind(this)}
                    onLoad={this.onLoad.bind(this)}
                    reference={this.reference.bind(this)}
                />

            );
        }
    }
}

export default MyStats;
