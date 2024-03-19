import {Text, TextInput, View} from "react-native";
import {colors} from "../../utils/Colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import React from "react";
import {StyleSheet} from "react-native";

export const RenderPickerHeader = ({name, onGoBack}) => {
    return (
        <View style={styles.headerContainer}>
            <Ionicons
                name="close"
                style={styles.closeIcon}
                onPress={() => onGoBack()}
            />
            <Text
                style={styles.headerText}
            >{name}
            </Text>
        </View>
    );
};

export const RenderPickerSearch = ({text,onFilterInputChange}) => {
    return (
        <View style={styles.searchParentContainer}>
            <View style={styles.searchChildContainer}>
                <Ionicons name="md-search" color={colors.GRAY} size={20}/>
                <TextInput
                    style={styles.searchTextInput}
                    onChangeText={(text)=>onFilterInputChange(text)}
                    value={text}
                    placeholder="Search..."
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                    multiline={false}
                    autoCorrect={false}
                    numberOfLines={1}
                    returnKeyType="next"
                />
            </View>
        </View>
    )
};


export const styles = StyleSheet.create({
    headerContainer: {
        height: 60,
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: colors.WHITE
    },
    closeIcon: {
        fontSize: 30,
        color: colors.BLACK,
        marginLeft: 10,
        fontFamily: "Helvetica"
    },
    headerText: {
        fontFamily: "Helvetica",
        fontSize: 18,
        marginLeft: 5,
        color: colors.BLACK
    },
    searchParentContainer: {
        backgroundColor: colors.BACKGROUND,
        height: 50,
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    searchChildContainer: {
        flexDirection: "row",
        paddingLeft: 10,
        justifyContent: "center",
        alignItems: "center"
    }, 
    searchTextInput: {
        borderColor: "gray",
        width: "100%",
        flex: 1,
        paddingLeft: 10,
        color: colors.BLACK
    }
});



