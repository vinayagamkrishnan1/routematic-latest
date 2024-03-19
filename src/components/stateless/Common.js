import {
  ActivityIndicator,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import React from "react";
import { colors } from "../../utils/Colors";

export const _loader = ({ ...props }) => {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          justifyContent: "center"
        },
        { alignItems: "center" },
        props
      ]}
    >
      <ActivityIndicator size="large" />
      <Text style={{ color: colors.BLACK, fontWeight: "700", marginTop: 10 }}>
        Please wait...
      </Text>
    </View>
  );
};
