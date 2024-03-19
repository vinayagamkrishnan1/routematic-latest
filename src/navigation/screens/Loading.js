import React from 'react';
import {
    ActivityIndicator,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    View
  } from "react-native";
  import { colors } from "../../utils/Colors";
  const logo = require("../../assets/routematic.png");

export default () => (
    <View
        style={{
            justifyContent: "center",
            alignContent: "flex-start",
            flex: 1,
            backgroundColor: colors.BACKGROUND
        }}
    >
        <View style={styles.container}>
            <Image
                source={logo}
                defaultSource={logo}
                resizeMethod="scale"
                resizeMode="cover"
                style={styles.logo}
            />
            <ActivityIndicator size={"large"} color={colors.BLACK} />
            <Text style={styles.text}>Please wait...</Text>
            <StatusBar barStyle="default" />
        </View>
    </View>
);


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    logo: {
        height: "70%",
        width: "60%",
        resizeMode: "contain",
        alignItems: "center",
        justifyContent: "center"
    },
    text: {
        color: colors.BLACK
    }
});