import React, {Component} from "react";
import {Text} from "react-native";
import {debounce} from "./debounceFunction";

class TextDebounce extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Text
                style={this.props.style}
                activeOpacity={this.props.activeOpacity}
                onPress={debounce(() => {
                    this.props.onPress();
                }, 500)}
            >
                {this.props.children}
            </Text>
        );
    }
}

export default TextDebounce;
