import React, {Component} from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    PanResponder,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {colors} from "../../utils/Colors";
import {inject, observer} from "mobx-react";
import Ionicons from "react-native-vector-icons/Ionicons";
import {Box} from "native-base";


@inject("feedbackStore")
@observer
export default class GeneralFeedback extends Component {

    static navigationOptions = () => {
        return {
            title: "Feedback"
        };
    };

    onClick(rating) {
        if (rating < 0) return;
        if (rating <= 3) {
            this.props.feedbackStore.onStarRatingPressEvent(rating);
        } else {
            //this.props.feedbackStore.clearSession();
            this.props.feedbackStore.clearSession();
            this.props.feedbackStore.setRatings(rating);
            this.props.navigation.navigate('GeneralComments');
        }
    }


    render() {
        return (
            <View
                style={{
                    alignItems: "center",
                    flex: 1,
                    flexDirection: 'column'
                }}
            >
                <StatusBar
                    barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
                />

                <View padder>
                    <Box>
                        <Box bordered>
                            <View style={{
                                flexDirection: 'column',
                                // width: "100%",
                                height: 180,
                                justifyContent: 'center',
                                alignContent: 'center',
                                margin: 10
                            }}>
                                <Text style={textStyle}>My experience was... </Text>
                                <View style={parentStyle}>
                                <View style={starStyle}>
                                    <TouchableOpacity style={imageContainerStyle}
                                                      onPress={() => {
                                                          this.onClick(1);
                                                      }}
                                    >
                                        {this.getStartIcon()}
                                    </TouchableOpacity>
                                    <TouchableOpacity style={imageContainerStyle}
                                                      onPress={() => {
                                                          this.onClick(2);
                                                      }}
                                    >
                                        {this.getStartIcon()}

                                    </TouchableOpacity>
                                    <Text> </Text>
                                    <TouchableOpacity style={imageContainerStyle}
                                                      onPress={() => {
                                                          this.onClick(3);
                                                      }}
                                    >
                                        {this.getStartIcon()}

                                    </TouchableOpacity>
                                    <Text> </Text>
                                    <TouchableOpacity style={imageContainerStyle}
                                                      onPress={() => {
                                                          this.onClick(4);
                                                      }}
                                    >
                                        {this.getStartIcon()}

                                    </TouchableOpacity>
                                    <Text> </Text>
                                    <TouchableOpacity style={imageContainerStyle}
                                                      onPress={() => {
                                                          this.onClick(5);
                                                      }}
                                    >
                                        {this.getStartIcon()}

                                    </TouchableOpacity>
                                </View>
                                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10}}>
                                    <Text style={{color: colors.ORANGE}}>Very bad</Text>
                                    <Text style={{color: colors.GREEN}}>Very Good</Text>
                                </View>
                                </View>
                            </View>
                        </Box>

                    </Box>
                </View>

            </View>
        );
    }

    getStartIcon() {
        return (<Ionicons
            name="ios-star-outline"
            style={vectorIconBlack}
        />)
    }
}

const vectorIconBlack = {
    fontSize: 30,
    color: colors.BLACK
};
const textStyle = {
    fontSize: 20,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 8,
    color: colors.BLACK
};
const imageContainerStyle = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6
};
const parentStyle = {
    width: "100%",
    height: 100,
    borderRadius: 14,
    flexDirection: 'column',
    alignContent: "center",
    alignSelf: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.WHITE
};
const starStyle={
    width: "95%",
    height: 60,
    flexDirection: 'row',
    alignContent: "center",
    alignSelf: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.WHITE
};
