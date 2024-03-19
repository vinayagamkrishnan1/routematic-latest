import React from "react";
import PropTypes from "prop-types";
import {
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "native-base";
import { colors } from "./Colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import { styles } from "../commonStyles/Styles";
import TouchableDebounce from "./TouchableDebounce";
import LinearGradient from "react-native-linear-gradient";

export default function DrawerMenu({
  onItemSelected,
  UserName,
  isShuttleAllowed,
  isFixedRouteAllowed,
  isChangeAddressAllowed,
  isParkingAllowed
}) {
  //let UserName = AsyncStorage.getItem(asyncString.UserName);
  //console.warn("isShuttleAllowed : " + isShuttleAllowed);
  return (
    <View style={{width: '100%'}}>
      <LinearGradient
        start={{ x: 0, y: 0.75 }}
        end={{ x: 1, y: 0.25 }}
        colors={[colors.GREEN, colors.BLUE]}
        style={{ width: "100%", height: "40%", borderRadius: 0, opacity: 0.77 }}
      >
        <View style={{ flexDirection: "column", flex: 1 }}>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
              top: "25%"
            }}
          >
            <Image
              defaultSource={require("../assets/photo_image.png")}
              source={require("../assets/photo_image.png")}
              resizeMethod="scale"
              resizeMode="cover"
              style={styles.avatar}
            />
            <Text
              style={{
                color: colors.WHITE,
                top: 20,
                marginLeft: 10,
                marginRight: 10
              }}
            >
              {UserName}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View
        style={{
          width: "100%",
          height: "50%",
          flexDirection: "column",
          paddingLeft: 10
        }}
      >
        <TouchableOpacity
          style={{
            marginTop: 20,
            flex: 0.2,
            justifyContent: "center",
            alignContent: "center"
          }}
          onPress={() => onItemSelected("FeedbackTabs")}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-start"
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#ffffff",
                shadowColor: "rgba(0, 0, 0, 0.5)",
                shadowOffset: { width: 0, height: 3 },
                shadowRadius: 8,
                shadowOpacity: 1,
                borderRadius: 24
              }}
            >
              <Image
                defaultSource={require("../assets/profile/like.png")}
                source={require("../assets/profile/like.png")}
                resizeMethod="scale"
                resizeMode="contain"
                style={{ width: 42, height: 42 }}
              />
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text
                style={{ color: colors.BLACK, marginLeft: 10, marginTop: 10 }}
              >
                Feedback
              </Text>
              <Image
                defaultSource={require("../assets/dashboard/right_arrow_black.png")}
                source={require("../assets/dashboard/right_arrow_black.png")}
                resizeMethod="scale"
                resizeMode="contain"
                style={{ width: 15, height: 15, marginTop: 13, marginLeft: 10 }}
              />
            </View>
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={{
            marginTop: 20,
            flex: 0.2,
            justifyContent: "center",
            alignContent: "center"
          }}
          onPress={() => onItemSelected("Change Password")}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-start"
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#ffffff",
                shadowColor: "rgba(0, 0, 0, 0.5)",
                shadowOffset: { width: 0, height: 3 },
                shadowRadius: 8,
                shadowOpacity: 1,
                borderRadius: 24
              }}
            >
              <Image
                defaultSource={require("../assets/profile/lock.png")}
                source={require("../assets/profile/lock.png")}
                resizeMethod="scale"
                resizeMode="contain"
                style={{ width: 42, height: 42 }}
              />
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text
                style={{ color: colors.BLACK, marginLeft: 10, marginTop: 10 }}
              >
                Change Password
              </Text>
              <Image
                defaultSource={require("../assets/dashboard/right_arrow_black.png")}
                source={require("../assets/dashboard/right_arrow_black.png")}
                resizeMethod="scale"
                resizeMode="contain"
                style={{ width: 15, height: 15, marginTop: 12, marginLeft: 10 }}
              />
            </View>
          </View>
        </TouchableOpacity> */}
        <TouchableOpacity
         style={{
           marginTop: 20,
           flex: 0.2,
           justifyContent: "center",
           alignContent: "center"
         }}
         onPress={() => onItemSelected("Opt-out")}
       >
         <View
           style={{
             flex: 1,
             flexDirection: "row",
             justifyContent: "flex-start"
           }}
         >
           <View
             style={{
               width: 40,
               height: 40,
               justifyContent: "center",
               alignItems: "center",
               backgroundColor: "#ffffff",
               shadowColor: "rgba(0, 0, 0, 0.5)",
               shadowOffset: { width: 0, height: 3 },
               shadowRadius: 8,
               shadowOpacity: 1,
               borderRadius: 24
             }}
           >
             <Image
               defaultSource={require("../assets/profile/optout.png")}
               source={require("../assets/profile/optout.png")}
               resizeMethod="scale"
               resizeMode="contain"
               style={{ width: 42, height: 42 }}
             />
           </View>
           <View style={{ flexDirection: "row" }}>
             <Text
               style={{ color: colors.BLACK, marginLeft: 10, marginTop: 10 }}
             >
               Opt Out
             </Text>
             <Image
               defaultSource={require("../assets/dashboard/right_arrow_black.png")}
               source={require("../assets/dashboard/right_arrow_black.png")}
               resizeMethod="scale"
               resizeMode="contain"
               style={{ width: 15, height: 15, marginTop: 12, marginLeft: 10 }}
             />
           </View>
         </View>
       </TouchableOpacity>
       
       <TouchableOpacity
          style={{
            marginTop: 20,
            flex: 0.2,
            justifyContent: "center",
            alignContent: "center"
          }}
          onPress={() => onItemSelected("ParkZeus")}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-start"
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#ffffff",
                shadowColor: "rgba(0, 0, 0, 0.5)",
                shadowOffset: { width: 0, height: 3 },
                shadowRadius: 8,
                shadowOpacity: 1,
                borderRadius: 24
              }}
            >
              <Image
                defaultSource={require("../assets/profile/parking.png")}
                source={require("../assets/profile/parking.png")}
                resizeMethod="scale"
                resizeMode="contain"
                style={{ width: 42, height: 42 }}
              />
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text
                style={{ color: colors.BLACK, marginLeft: 10, marginTop: 10 }}
              >
                Parking
              </Text>
              <Image
                defaultSource={require("../assets/dashboard/right_arrow_black.png")}
                source={require("../assets/dashboard/right_arrow_black.png")}
                resizeMethod="scale"
                resizeMode="contain"
                style={{ width: 15, height: 15, marginTop: 13, marginLeft: 10 }}
              />
            </View>
          </View>
        </TouchableOpacity>

        {(isShuttleAllowed === "true" || isFixedRouteAllowed==="true") && (
          <TouchableOpacity
            style={{
              marginTop: 20,
              flex: 0.2,
              justifyContent: "center",
              alignContent: "center"
            }}
            onPress={() => onItemSelected("E-Ticket")}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "flex-start"
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#ffffff",
                  shadowColor: "rgba(0, 0, 0, 0.5)",
                  shadowOffset: { width: 0, height: 3 },
                  shadowRadius: 8,
                  shadowOpacity: 1,
                  borderRadius: 24
                }}
              >
                <Image
                  defaultSource={require("../assets/profile/epass.png")}
                  source={require("../assets/profile/epass.png")}
                  resizeMethod="scale"
                  resizeMode="contain"
                  style={{ width: 42, height: 42 }}
                />
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{ color: colors.BLACK, marginLeft: 10, marginTop: 10 }}
                >
                  E-Pass
                </Text>
                <Image
                  defaultSource={require("../assets/dashboard/right_arrow_black.png")}
                  source={require("../assets/dashboard/right_arrow_black.png")}
                  resizeMethod="scale"
                  resizeMode="contain"
                  style={{
                    width: 15,
                    height: 15,
                    marginTop: 12,
                    marginLeft: 10
                  }}
                />
              </View>
            </View>
          </TouchableOpacity>
        )}
        {isChangeAddressAllowed === "true" && (
          <TouchableOpacity
            style={{
              marginTop: 20,
              flex: 0.2,
              justifyContent: "center",
              alignContent: "center"
            }}
            onPress={() => onItemSelected("VerifyGeoCode")}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "flex-start"
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#ffffff",
                  shadowColor: "rgba(0, 0, 0, 0.5)",
                  shadowOffset: { width: 0, height: 3 },
                  shadowRadius: 8,
                  shadowOpacity: 1,
                  borderRadius: 24
                }}
              >
                <Image
                  defaultSource={require("../assets/dashboard/location_verify.png")}
                  source={require("../assets/dashboard/location_verify.png")}
                  resizeMethod="scale"
                  resizeMode="contain"
                  style={{ width: 25, height: 25 }}
                />
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{ color: colors.BLACK, marginLeft: 10, marginTop: 10 }}
                >
                  Verify Geo Code
                </Text>
                <Image
                  defaultSource={require("../assets/dashboard/right_arrow_black.png")}
                  source={require("../assets/dashboard/right_arrow_black.png")}
                  resizeMethod="scale"
                  resizeMode="contain"
                  style={{
                    width: 15,
                    height: 15,
                    marginTop: 12,
                    marginLeft: 10
                  }}
                />
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
      <TouchableDebounce
        style={
          {
            width: "100%",
            backgroundColor: colors.GREEN,
            bottom: 0,
            left: 0,
            right: 0,
            height: "10%",
            padding: 5,
            justifyContent: "center",
            paddingLeft: 10
          } //opacity: 0.5,
          //alignItems: "center"
        }
        onPress={() => onItemSelected("Logout")}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 10
          }}
        >
          <Ionicons
            name="md-log-out"
            style={[
              styles.vectorIconGray,
              { fontSize: 25, color: colors.WHITE }
            ]}
          />
          <Text style={{ color: colors.WHITE, marginLeft: 10, fontSize: 22 }}>
            Logout
          </Text>
          <Image
            defaultSource={require("../assets/dashboard/right_arrow_white.png")}
            source={require("../assets/dashboard/right_arrow_white.png")}
            resizeMethod="scale"
            resizeMode="contain"
            style={{ width: 15, height: 15, marginTop: 8, marginLeft: 100 }}
          />
        </View>
      </TouchableDebounce>
    </View>
  );
}

DrawerMenu.propTypes = {
  onItemSelected: PropTypes.func.isRequired,
  UserName: PropTypes.string,
  isShuttleAllowed: PropTypes.string,
  isFixedRouteAllowed: PropTypes.string,
  isChangeAddressAllowed: PropTypes.string,
  isParkingAllowed: PropTypes.string
};
