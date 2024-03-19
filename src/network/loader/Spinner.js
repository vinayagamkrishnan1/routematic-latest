import React, { Component } from "react";
import { ActivityIndicator, Text, View, StatusBar } from "react-native";
import { colors } from "../../utils/Colors";
import Spinner from "react-native-loading-spinner-overlay";

export const spinner = {
  visible: function(isLoading) {
    return (
      <Spinner
        visible={isLoading}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
          backgroundColor: "transparent",
          alignSelf: "center"
        }}
      >
        <StatusBar
          translucent={false}
          backgroundColor={colors.WHITE}
          barStyle="dark-content"
        />
        <View
          style={{
            top: "45%",
            width: "50%",
            height: "14%",
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            backgroundColor: "#000",
            opacity: 0.8
          }}
        >
          <ActivityIndicator animating={true} />
          <Text
            style={{
              marginTop: 20,
              alignItems: "center",
              justifyContent: "center",
              color: colors.WHITE
            }}
          >
            Please wait ...
          </Text>
        </View>
      </Spinner>
    );
  }
};
