import React from "react";
import {Text, View} from "react-native";
import {colors} from "../../../utils/Colors";
import TouchableDebounce from "../../../utils/TouchableDebounce";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import moment from "moment";

export const _renderDate = (title, date, monthYear, day) => {
    return (
        <View style={{flexDirection: "column"}}>
            <Text style={[titleStyle, {marginLeft: 5}]}>{title}</Text>
            <View style={{flexDirection: "row"}}>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center"
                    }}
                >
                    <MaterialCommunityIcons
                        name={"calendar-today"}
                        size={20}
                        color={colors.BLACK}
                    />
                    <Text style={date === "Select" ? dateStyle : dateStyleBig}>
                        {date}
                    </Text>
                </View>

                <View style={{flexDirection: "column", marginLeft: 5}}>
                    <Text style={monthYearStyle}>{monthYear}</Text>
                    <Text style={dayStyle}>{day}</Text>
                </View>
            </View>
        </View>
    );
};
export const _renderInputDate = (title, date, monthYear, day) => {
    return (
        <View style={{flexDirection: "column", width: "100%"}}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: 'space-between',
                    marginRight: 5
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 3,
                    }}
                >
                    {_renderSmallIcon(title)}
                    <Text style={[titleDarkStyle, {marginLeft: 5}]}>{title}</Text>
                </View>
                <MaterialIcons name={"arrow-drop-down"} size={30} color={colors.GREEN}/>
            </View>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 5,
                    marginRight: 3,
                }}
            >
                <Text style={date === "Select" ? dateStyle : dateStyleBig}>
                    {date}
                </Text>
                <View style={{flexDirection: "column", marginLeft: 5}}>
                    <Text style={monthYearStyle}>{monthYear}</Text>
                    <Text style={dayStyle}>{day}</Text>
                </View>
            </View>
        </View>
    );
};
const _renderSmallIcon = text => {
    if (text.includes("Time")) {
        return <Ionicons name={"md-time"} size={20} color={colors.BLACK}/>;
    } else if (text.includes("Pick") || text.includes("Drop") || text.includes("Boarding Point") || text.includes("Destination")) {
        return <MaterialIcons name={"location-pin"} size={20} color={colors.BLACK}/>;
    } else if (text.includes("Office") || text.includes("office")) {
        return <MaterialIcons name={"work"} size={20} color={colors.BLACK}/>;
    } else if (text.includes("Route")) {
        return <MaterialIcons name={"directions-bus"} size={20} color={colors.BLACK}/>;
    } else if (text.includes("Date")) {
        return <MaterialIcons name={"calendar-today"} size={20} color={colors.BLACK}/>;
    }
};
export const _renderTitleContent = (title, time, aa, location) => {
    return (
        <View style={{flexDirection: "column", width: "80%"}}>
            {location ? null : <Text style={[titleStyle, {marginLeft: 3}]}>{title}</Text>}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 5,
                    marginRight: 3
                }}
            >
                {_renderSmallIcon(title)}
                <Text
                    numberOfLines={1}
                    style={
                        title.includes("Time") && time !== "Select"
                            ? time.includes("Cancelled") || time.includes("No schedule") ? dateStyleMedium : dateStyleBig
                            : dateStyle
                    }
                >
                    {time === "Select"
                        ? "Select"
                        : (title.includes("Time") && parseInt(time) >= 0)
                            ? moment(time, "HH:mm").format("HH:mm")
                            : time}
                    {!!aa &&
                    parseInt(time) >= 0 && (
                        <Text style={{
                            fontSize: 20,
                            fontWeight: 'bold',
                            color: colors.GRAY
                        }}>{aa.includes("*") ? "*" : ""}
                        </Text>
                    )}
                </Text>
            </View>
        </View>
    );
};

export const _renderInputContent = (title, content) => {
    return (
        <View style={{flexDirection: "column", width: "100%"}}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: 'space-between',
                    marginRight: 5
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 3,
                    }}
                >
                    {_renderSmallIcon(title)}
                    <Text style={[titleDarkStyle, {marginLeft: 5}]}>{title}</Text>
                </View>
                <MaterialIcons name={"arrow-drop-down"} size={30} color={colors.GREEN}/>
            </View>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 5,
                    marginRight: 3,
                }}
            >
                <Text
                    numberOfLines={1}
                    style={
                        title.includes("Time") && content !== "Select"
                            ? content.includes("Cancelled") || content.includes("No schedule") ? dateStyleMedium : contentLightStyle // dateStyleBig
                            : contentLightStyle
                    }
                >
                    {content === "Select"
                        ? "Select"
                        : (title.includes("Time") && parseInt(content) >= 0)
                            ? moment(content, "HH:mm").format("HH:mm")
                            : content}
                </Text>
            </View>
        </View>
    );
};

export const _renderListInput = (title, content) => {
    return (
        <View style={{flexDirection: "column", width: "100%"}}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: 'space-between',
                    marginRight: 5
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 3,
                    }}
                >
                    <Text style={[titleStyle, {marginLeft: 5}]}>{title}</Text>
                </View>
                <MaterialIcons name={"arrow-drop-down"} size={30} color={colors.GREEN}/>
            </View>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 5,
                    marginRight: 3,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.GRAY
                }}
            >
                <Text
                    numberOfLines={1}
                    style={contentStyle}
                >
                    {content}
                </Text>
            </View>
        </View>
    );
};

export const _renderOffice = (title, Office) => {
    return (
        <View style={{flexDirection: "column", padding: 20}}>
            <Text style={titleStyle}>{title}</Text>
            <View style={{flexDirection: "row", marginTop: 5}}>
                <MaterialIcons name={"work"} size={20} color={colors.BLACK}/>
                <Text style={officeNameStyle}>{Office}</Text>
            </View>
        </View>
    );
};
export const _renderCountry = (title, Office) => {
    return (
        <View style={{flexDirection: "column", padding: 20}}>
            <Text style={titleStyle}>{title}</Text>
            <View style={{flexDirection: "row", marginTop: 5}}>
                <MaterialIcons name={"work"} size={20} color={colors.BLACK}/>
                <Text style={officeNameStyle}>{Office}</Text>
            </View>
        </View>
    );
};
export const _renderWeeklyOff = (title, weeklyOff, addWeeklyOff) => {
    let selectedWeeklyOff = weeklyOff ? JSON.stringify(weeklyOff) : "";
    return (
        <View style={{flexDirection: "column", padding: 20}}>
            <Text style={titleStyle}>{title}</Text>
            <View>
                <View
                    style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        alignItems: "flex-start"
                    }}
                >
                    <TouchableDebounce
                        style={
                            selectedWeeklyOff.includes("Monday")
                                ? viewSelectedStyle
                                : viewNotSelectedStyle
                        }
                        onPress={() => {
                            addWeeklyOff("Monday");
                        }}
                    >
                        <Text
                            style={{
                                color: selectedWeeklyOff.includes("Monday")
                                    ? colors.WHITE
                                    : colors.BLACK
                            }}
                        >
                            Mon
                        </Text>
                    </TouchableDebounce>
                    <TouchableDebounce
                        style={
                            selectedWeeklyOff.includes("Tuesday")
                                ? viewSelectedStyle
                                : viewNotSelectedStyle
                        }
                        onPress={() => {
                            addWeeklyOff("Tuesday");
                        }}
                    >
                        <Text
                            style={{
                                color: selectedWeeklyOff.includes("Tuesday")
                                    ? colors.WHITE
                                    : colors.BLACK
                            }}
                        >
                            Tue
                        </Text>
                    </TouchableDebounce>
                    <TouchableDebounce
                        style={
                            selectedWeeklyOff.includes("Wednesday")
                                ? viewSelectedStyle
                                : viewNotSelectedStyle
                        }
                        onPress={() => {
                            addWeeklyOff("Wednesday");
                        }}
                    >
                        <Text
                            style={{
                                color: selectedWeeklyOff.includes("Wednesday")
                                    ? colors.WHITE
                                    : colors.BLACK
                            }}
                        >
                            Wed
                        </Text>
                    </TouchableDebounce>
                    <TouchableDebounce
                        style={
                            selectedWeeklyOff.includes("Thursday")
                                ? viewSelectedStyle
                                : viewNotSelectedStyle
                        }
                        onPress={() => {
                            addWeeklyOff("Thursday");
                        }}
                    >
                        <Text
                            style={{
                                color: selectedWeeklyOff.includes("Thursday")
                                    ? colors.WHITE
                                    : colors.BLACK
                            }}
                        >
                            Thu
                        </Text>
                    </TouchableDebounce>
                    <TouchableDebounce
                        style={
                            selectedWeeklyOff.includes("Friday")
                                ? viewSelectedStyle
                                : viewNotSelectedStyle
                        }
                        onPress={() => {
                            addWeeklyOff("Friday");
                        }}
                    >
                        <Text
                            style={{
                                color: selectedWeeklyOff.includes("Friday")
                                    ? colors.WHITE
                                    : colors.BLACK
                            }}
                        >
                            Fri
                        </Text>
                    </TouchableDebounce>
                    <TouchableDebounce
                        style={
                            selectedWeeklyOff.includes("Saturday")
                                ? viewSelectedStyle
                                : viewNotSelectedStyle
                        }
                        onPress={() => {
                            addWeeklyOff("Saturday");
                        }}
                    >
                        <Text
                            style={{
                                color: selectedWeeklyOff.includes("Saturday")
                                    ? colors.WHITE
                                    : colors.BLACK
                            }}
                        >
                            Sat
                        </Text>
                    </TouchableDebounce>
                    <TouchableDebounce
                        style={
                            selectedWeeklyOff.includes("Sunday")
                                ? viewSelectedStyle
                                : viewNotSelectedStyle
                        }
                        onPress={() => {
                            addWeeklyOff("Sunday");
                        }}
                    >
                        <Text
                            style={{
                                color: selectedWeeklyOff.includes("Sunday")
                                    ? colors.WHITE
                                    : colors.BLACK
                            }}
                        >
                            Sun
                        </Text>
                    </TouchableDebounce>
                </View>
            </View>
        </View>
    );
};
export const _renderSourceTargetMarker = () => {
    return (
        <View
            style={{
                width: "10%",
                flexDirection: "column",
                justifyContent: "flex-start",
                paddingLeft: "6%"
            }}
        >
            {_renderSourceOval()}
            {_renderVerticalLine()}
            {_renderTargetOval()}
        </View>
    );
};
export const _renderSourceOval = () => {
    return <View style={sourceOvalStyle}/>;
};
export const _renderTargetOval = () => {
    return <View style={targetOvalStyle}/>;
};
export const _renderVerticalLine = () => {
    return <View style={verticalLine}/>;
};
export const _renderSourceTargetView = (title, address, style) => {
    return (
        <View style={{width: "90%", flexDirection: "column"}}>
            <Text
                style={[
                    titleStyle,
                    {marginTop: 12, justifyContent: "flex-start"},
                    style
                ]}
            >
                {title}
            </Text>
            <Text
                numberOfLines={1}
                style={
                    address && !address.includes("Enter")
                        ? selectedAddressTextStyle
                        : addressTextStyle
                }
            >
                {address
                    ? address
                    : title === "Pick up"
                        ? "Enter your pick up location"
                        : "Enter your drop location"}
            </Text>
        </View>
    );
};

const titleStyle = {
    fontFamily: "Helvetica",
    fontSize: 13,
    textAlign: "left",
    color: colors.GRAY
};
const titleDarkStyle = {
    fontFamily: "Helvetica",
    fontSize: 13,
    textAlign: "left",
    color: colors.BLACK
};
const contentStyle = {
    fontFamily: "Helvetica",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "left",
    color: colors.BLACK,
    // marginLeft: 5,
    padding: 5
};
const contentLightStyle = {
    fontFamily: "Helvetica",
    fontSize: 15,
    // fontWeight: "bold",
    textAlign: "left",
    color: colors.DARK_GRAY,
    marginLeft: 5
};
const dateStyleMedium = {
    fontFamily: "Helvetica",
    fontSize: 20,
    // fontWeight: "500",
    textAlign: "left",
    color: colors.BLACK,
    marginLeft: 5
};
const dateStyleBig = {
    fontFamily: "Helvetica",
    fontSize: 25,
    textAlign: "left",
    color: colors.BLACK,
    marginLeft: 5
};
const dateStyle = {
    fontFamily: "Helvetica",
    fontSize: 20,
    // fontWeight: "500",
    textAlign: "left",
    color: colors.BLACK,
    marginLeft: 5
};
const monthYearStyle = {
    fontFamily: "Helvetica",
    fontSize: 12,
    fontWeight: "300",
    textAlign: "center",
    color: colors.BLACK,
    marginTop: 5
};
const dayStyle = {
    fontFamily: "Helvetica",
    fontSize: 12,
    fontWeight: "300",
    textAlign: "left",
    color: colors.GRAY
};
const officeNameStyle = {
    width: "100%",
    fontFamily: "Helvetica",
    fontSize: 18,
    // fontWeight: "500",
    textAlign: "left",
    color: colors.BLACK,
    marginLeft: 5
};
export const viewSelectedStyle = {
    borderRadius: 5,
    width: 60,
    padding: 5,
    backgroundColor: colors.BLUE_BRIGHT,
    margin: 5,
    justifyContent: "center",
    alignItems: "center"
};
export const fullviewSelectedStyle = {
    borderRadius: 30,
    width: 150,
    padding: 5,
    backgroundColor: colors.BLUE_BRIGHT,
    margin: 5,
    justifyContent: "center",
    alignItems: "center"
};
export const viewNotSelectedStyle = {
    width: 60,
    padding: 5,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 5,
    borderColor: colors.GRAY,
    borderStyle: "solid",
    flexDirection: "row"

};
export const viewNotSelectedRosterTypeStyle = {
    width: 60,
    padding: 5,
    margin: 5,
    justifyContent: "center",
    alignItems: "center"
};
const sourceOvalStyle = {
    borderRadius: 5,
    width: 10,
    height: 10,
    backgroundColor: colors.GREEN,
    marginTop: 15
};
const targetOvalStyle = {
    borderRadius: 5,
    width: 10,
    height: 10,
    backgroundColor: colors.RED,
    marginBottom: 25
};
const verticalLine = {
    width: 0.1,
    height: "65%",
    borderStyle: "dashed",
    borderWidth: 0.5,
    borderColor: colors.GRAY,
    marginLeft: 4
};
export const addressTextStyle = {
    marginTop: 5,
    marginLeft: 5,
    fontFamily: "Helvetica",
    fontSize: 16,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "left",
    color: colors.GRAY
};
export const selectedAddressTextStyle = {
    marginTop: 5,
    marginLeft: 5,
    fontFamily: "Helvetica",
    fontSize: 18,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "left",
    color: colors.BLACK
};
