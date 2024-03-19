import React, {Component} from "react";
import {FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
const defaultCircleSize = 42;
const defaultCircle= 30;
const defaultCircleColor = "#007AFF";
const defaultLineWidth = 2;
const defaultLineColor = "#007AFF";
const defaultDotColor = "white";
const defaultInnerCircle = "none";

export default class CustomTimeLine extends Component {
    constructor(props, context) {
        super(props, context);
        this._renderRow = this._renderRow.bind(this);
        this.renderTime = this._renderTime.bind(this);
        this.renderDetail = this._renderDetail.bind(this);
        this.renderCircle = this._renderCircle.bind(this);
        this.renderEvent = this._renderEvent.bind(this);
        this.state = {
            data: this.props.data,
            x: 0,
            width: 0
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.data,
        });
    }

    render() {
        return (
            <View style={[styles.container, this.props.style]}>
                <FlatList
                    style={[styles.listview]}
                    data={this.state.data}
                    renderItem={this._renderRow}
                    automaticallyAdjustContentInsets={false}
                    {...this.props.options}
                />
            </View>
        );
    }

    _renderRow(rowData, sectionID, rowID) {
        let content = (
            <View style={[styles.rowContainer]}>
                {this.renderEvent(rowData, sectionID, rowID)}
                {this.renderCircle(rowData, sectionID, rowID)}
            </View>
        );
        return <View key={rowID}>{content}</View>;
    }

    _renderTime(rowData, sectionID, rowID) {
        if (!this.props.showTime) {
            return null;
        }
        return (
            <View style={{alignItems: "flex-end"}}>
                <View style={[styles.timeContainer]}>
                    <Text style={[styles.time]}>
                        {rowData.item.time}
                    </Text>
                </View>
            </View>
        );
    }

    _renderEvent(rowData, sectionID, rowID) {
        console.warn("rowData"+JSON.stringify(rowData));
        const lineWidth = rowData.lineWidth
            ? rowData.lineWidth
            : this.props.lineWidth;
        const isLast = this.props.renderFullLine
            ? !this.props.renderFullLine
            : this.state.data.slice(-1)[0] === rowData;
        const lineColor = isLast
            ? "rgba(0,0,0,0)"
            : rowData.lineColor ? rowData.lineColor : this.props.lineColor;
        let opStyle = {
            borderColor: lineColor,
            borderLeftWidth: lineWidth,
            borderRightWidth: 0,
            marginLeft: 20,
            paddingLeft: 20
        };

        return (
            <View
                style={[styles.details, opStyle]}
                onLayout={evt => {
                    if (!this.state.x && !this.state.width) {
                        const { x, width } = evt.nativeEvent.layout;
                        this.setState({ x, width });
                    }
                }}
            >
                <View
                    style={[this.props.detailContainerStyle]}
                >
                    <View style={styles.detail}>
                        {this.renderDetail(rowData, sectionID, rowID)}
                    </View>
                    {this._renderSeparator()}
                </View>
            </View>
        );
    }

    _renderDetail(rowData, sectionID, rowID) {
        return (
            <View style={styles.container}>
                <Text style={[styles.title]}>
                    {rowData.item.title}
                </Text>
            </View>);
    }

    _renderCircle(rowData, sectionID, rowID) {
        var circleStyle = {
            width: this.state.x ? defaultCircleSize : 0,
            height: this.state.x ? defaultCircle : 0,
            borderRadius:  8,
            borderColor:"#9C9C9C",
            backgroundColor: "#FFFFFF",
            left: this.state.x - defaultCircleSize / 2 + (defaultLineWidth - 1) / 2
        };
        var innerCircle =  <Text style={[styles.time,{fontWeight: "bold",color:"#000000"}]}>
            {rowData.item.time}
        </Text>;
        return (
            <View style={[styles.circle, circleStyle]}>
                {innerCircle}
            </View>
        );
    }

    _renderSeparator() {
        if (!this.props.separator) {
            return null;
        }
        return <View style={[styles.separator]} />;
    }
}

CustomTimeLine.defaultProps = {
    circleSize: defaultCircleSize,
    circleColor: defaultCircleColor,
    lineWidth: defaultLineWidth,
    lineColor: defaultLineColor,
    innerCircle: defaultInnerCircle,
    columnFormat: "single-column-left",
    separator: false,
    showTime: true
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: 15,
    },
    listview: {
        flex: 1
    },
    sectionHeader: {
        marginBottom: 15,
        backgroundColor: "#007AFF",
        height: 30,
        justifyContent: "center"
    },
    sectionHeaderText: {
        color: "#FFF",
        fontSize: 18,
        alignSelf: "center"
    },
    rowContainer: {
        flexDirection: "row",
        flex: 1,
        //alignItems: 'stretch',
        justifyContent: "center"
    },
    timeContainer: {
        minWidth: 52,
        marginTop:-5
    },
    time: {
        fontSize: 12, textAlign: 'center',borderColor:"#717171",borderWidth:1,borderRadius:6, backgroundColor:'#FFFFFF', color:'white'
    },
    circle: {
        width: 32,
        height: 32,
        borderRadius: 10,
        position: "absolute",
        left: -8,
        alignItems: "center",
        justifyContent: "center"
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: defaultDotColor
    },
    title: {
        fontSize: 12,
        fontWeight: "bold",
        height:40
    },
    details: {
        borderLeftWidth: defaultLineWidth,
        flexDirection: "column",
        flex: 1
    },
    detail: { paddingTop: 10, paddingBottom: 10 },
    description: {
        marginTop: 10,
        marginBottom:10
    },
    separator: {
        height: 1,
        backgroundColor: "#aaa",
        marginTop: 10,
        marginBottom: 10
    }
});
