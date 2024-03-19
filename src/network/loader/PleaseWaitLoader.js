import React, { Component } from "react";
import { ActivityIndicator, StatusBar, Text, View } from "react-native";
import { colors } from "../../utils/Colors";

export const PleaseWaitLoader = () => {
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1
      }}
    >
      <StatusBar
        translucent={false}
        backgroundColor={colors.WHITE}
        barStyle="dark-content"
      />
      <ActivityIndicator />
      <Text style={{ color: colors.BLACK, marginTop: 20 }}>Please wait...</Text>
    </View>
  );
};

export default PleaseWaitLoader;
