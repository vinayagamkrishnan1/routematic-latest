// @flow
import React from "react";
import { View } from "react-native";
import { _loader } from "../stateless/Common";

export default (Comp: ReactClass<*>) => {
  return ({ spinner, children, ...props }: Object) => (
    <View style={{ flex: 1 }}>
      <Comp {...props}>{children}</Comp>
      {spinner && _loader()}
    </View>
  );
};
