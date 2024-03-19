import NavigationService from "../../utils/NavigationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { asyncStorageAllKeys, asyncString } from "../../utils/ConstantString";
import { URL } from "../apiConstants/index";
import { showMessage } from "react-native-flash-message";
import { retrieveItem } from "../../model/StorageHelper";
import * as Alert1 from "../../utils/Alert";
import moment from "moment";

const axiosInterceptRequest = async axios => {
  axios.interceptors.request.use(async request => {
    let lvExpireDate = await retrieveItem(asyncString.LV_TIME_EXPIRY_DATE);
    if (lvExpireDate) {
      let expired = await moment().isSameOrAfter(lvExpireDate);
      if (expired) expireSession();
      //console.warn("Token->" + lvExpireDate + "->", expired);
    }

    return request;
  });
};

export const expireSession = async () => {
  showMessage({
    message: "Your session has expired!",
    type: "warning",
    description: "Please login again to continue",
      autoHide:false,
      hideOnPress:true,
    onPress: () => {}
  });
  const { navigate, reset } = NavigationService;
  AsyncStorage.multiRemove(asyncStorageAllKeys, err => {
    AsyncStorage.getItem(asyncString.DOMAIN_NAME)
      .then(domainName => {
        if (domainName) {
          let header = {
            Accept: "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "e_platform": "mobile",
            "Content-Type": "application/json"
          };
          fetch(URL.SSO_CHECK + domainName, {
            method: "GET",
            headers: header })
            .then(response => {
              return response.json();
            })
            .then(response => {
              // handleResponse.handleLogoutForSSO(responseSSO, domainName);
              if (
                  response &&
                  response.status.code === 200 &&
                  response.data.ssoenabled === 1
              ) {
                  NavigationService.navigate("SSOLogin", {
                      ssoLoginURL: response.data.ssologin,
                      domainName,
                      emailID
                  });
              } else {
                  NavigationService.navigate("SSOEmail", { emailID });
              }
            })
            .catch(error => {
              if (error.message === "Network request failed") {
                Alert1.show(null, "Please check your network connection and try again");
              }
            });
        } else {
          // navigate("Auth");
          reset({ routes: [{ name: "Auth" }] });
        }
      })
      .catch(error => {
        console.warn("Error in reading domain->" + error.message)
        reset({ routes: [{ name: "Auth" }] });
      });
  });
};

export default axiosInterceptRequest;
