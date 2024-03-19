import AsyncStorage from "@react-native-async-storage/async-storage";
import {asyncString} from "../../utils/ConstantString";
import * as Alert from "../../utils/Alert";
import {URL} from "../apiConstants";
import {CryptoXor} from "crypto-xor";
import axios from "axios";
import createAuthRefreshInterceptor from "../interceptors/createAuthRefreshInterceptor";
import axiosInterceptRequest, {expireSession} from "../interceptors/axiosInterceptRequest";
import { retrieveItem } from "../../model/StorageHelper";

global.ACCESS_TOKEN_HAS_EXPIRED = false;
axios.defaults.timeout = 25000;

axios.defaults.headers.common["Pragma"] = "no-cache";
axios.defaults.headers.common["Cache-Control"] = "no-cache";
axios.defaults.headers.common["Cache-Control"] = "no-store";

const commonHeader = {
    Accept: "application/json",
    "Content-Type": "application/json"
};

const getSavedToken = async () => {
    return await {
        grant_type: "refresh_token",
        refresh_token: await CryptoXor.decrypt(
            await retrieveItem(asyncString.REFRESH_TOKEN),
            asyncString.REFRESH_TOKEN
        )
    };
};

const jsonToFormData = async body => {
    let formBody = [];
    for (let property in await body) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(body[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    return formBody;
};

const updateToken = async refreshedResponse => {
    await AsyncStorage.multiSet([
        [asyncString.ACCESS_TOKEN, CryptoXor.encrypt(refreshedResponse.data.data.access_token, asyncString.ACCESS_TOKEN)],
        [asyncString.EXPIRES_IN, refreshedResponse.data.data.expires_in.toString()]
    ])
        .then(async () => {
        })
        .catch(error => {
            return Promise.reject(error);
        });
};
let success = true;

// Function that will be called to refresh authorization
const refreshAuthLogic = async (failedRequest,times) => {
    //let url504 = "https://run.mocky.io/v3/1ec4d6dc-4200-4811-8453-ebbda2373b4f?mocky-delay=10s";
    // console.warn("Times "+times);
    let rtBody = await jsonToFormData(await getSavedToken());
    // console.warn('refresh token body - ', rtBody);
    return await axios
        .post(URL.LOGIN_API, rtBody,{timeout:8000})
        .then(async refreshedResponse => {
            if (refreshedResponse.status === 200) {
                await updateToken(refreshedResponse);
                success=false;
                return Promise.resolve(refreshedResponse.data.data.access_token);
            }else if(refreshedResponse.status===401){
                // console.warn("refreshedResponse "+refreshedResponse.toString());
                await expireSession();
            }else {
                if (times > 1 && success) {
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    return refreshAuthLogic(failedRequest, times - 1);
                }else{
                    await expireSession();
                    return Promise.reject();
                }
            }
            return Promise.reject();
        })
        .catch(async error => {
            console.warn("refreshAuthLogic refresh token api error "+JSON.stringify(error));
            console.warn("Times "+times);
            if (times > 1) {
                await new Promise((resolve) => setTimeout(resolve, 2000));
                return refreshAuthLogic(failedRequest, times - 1);
            }else{
                await expireSession();
                return Promise.reject(error);
            }
        });
};

// Instantiate the interceptor (you can chain it as it returns the axios instance)
createAuthRefreshInterceptor(axios, refreshAuthLogic);
axiosInterceptRequest(axios);

function checkResponseError(errorResponse) {
    return (
        errorResponse &&
        errorResponse.status &&
        errorResponse.status.code !== 200 &&
        errorResponse.status.hasOwnProperty("message")
    );
}
export async function refreshToken(){
    return await axios
        .post(URL.LOGIN_API, await jsonToFormData(await getSavedToken()))
        .then(async refreshedResponse => {
            if (refreshedResponse.status === 200) {
                await updateToken(refreshedResponse);
                return Promise.resolve(refreshedResponse.data.data.access_token);
            }
            return Promise.reject();
        })
        .catch(error => {
            console.warn("refresh token api error "+JSON.stringify(error));
            return Promise.reject(error);
        });
}

export const API = {
    fetchXFORM: async function (url, body) {
        let formBody = [];
        for (let property in body) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(body[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");

        return await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formBody
        });
    },
    fetchJSON: async function (url, body, access_token) {
        let header = access_token
            ? {
                ...commonHeader,
                Authorization:
                    "Bearer " + (await CryptoXor.decrypt(
                        await retrieveItem(asyncString.ACCESS_TOKEN),
                        asyncString.ACCESS_TOKEN
                    ))
            }
            : commonHeader;
        let response = await fetch(url, {
            method: "POST",
            headers: header,
            body: JSON.stringify(body)
        }).catch(error => console.warn("Err-> " + JSON.stringify(error.message)));
        let refresh_token = await retrieveItem(asyncString.REFRESH_TOKEN);
        if (
            access_token &&
            refresh_token &&
            ((response && response.status && response.status === 401) || !response)
        ) {
            if (global.ACCESS_TOKEN_HAS_EXPIRED === true) return;
            global.ACCESS_TOKEN_HAS_EXPIRED = true;
            let refresh_token = await API.fetchXFORM(URL.LOGIN_API, {
                grant_type: "refresh_token",
                refresh_token: await CryptoXor.decrypt(
                    await retrieveItem(asyncString.REFRESH_TOKEN),
                    asyncString.REFRESH_TOKEN
                )
            });
            let status = await refresh_token.status;
            if (status === 401) return response;
            let refreshedResponse = await refresh_token.json();

            if (
                refreshedResponse &&
                refreshedResponse.data &&
                refreshedResponse.data.access_token &&
                refreshedResponse.data.refresh_token
            ) {
                let newheader = {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + refreshedResponse.data.access_token
                };

                response = await fetch(url, {
                    method: "POST",
                    headers: newheader,
                    body: JSON.stringify(body)
                });

                if (response.status === 200) {
                    await AsyncStorage.multiSet([
                        [asyncString.ACCESS_TOKEN, CryptoXor.encrypt(refreshedResponse.data.access_token, asyncString.ACCESS_TOKEN)],
                        // [
                        //     asyncString.ACCESS_TOKEN,
                        //     JSON.parse(
                        //         JSON.stringify(await refreshedResponse.data.access_token)
                        //     )
                        // ],

                        [
                            asyncString.EXPIRES_IN,
                            await refreshedResponse.data.expires_in.toString()
                        ]
                    ]).then(() => {
                        //console.warn("Updated access_token and refresh_token");
                        global.ACCESS_TOKEN_HAS_EXPIRED = false;
                    });
                }
            } else {
                return response;
            }
        }

        return response;
    },
    fetchGET: function (url) {
        let header = {
            Accept: "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "e_platform": "mobile",
            "Content-Type": "application/json"
        };
        return fetch(url,
            {
            method: "GET",
            headers: header});
    },
    fetchXGET: async function (url, access_token) {
        let response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization:
                    "Bearer " + (await CryptoXor.decrypt(
                        await retrieveItem(asyncString.ACCESS_TOKEN),
                        asyncString.ACCESS_TOKEN
                    ))
                    // (await retrieveItem(asyncString.ACCESS_TOKEN)) //"Bearer " + access_token
            }
        });
        let refresh_token = await retrieveItem(asyncString.REFRESH_TOKEN);
        if (
            access_token &&
            refresh_token &&
            ((response && response.status && response.status === 401) || !response)
        ) {
            if (global.ACCESS_TOKEN_HAS_EXPIRED === true) return;
            global.ACCESS_TOKEN_HAS_EXPIRED = true;

            let refresh_token = await API.fetchXFORM(URL.LOGIN_API, {
                grant_type: "refresh_token",
                refresh_token: await CryptoXor.decrypt(
                    await retrieveItem(asyncString.REFRESH_TOKEN),
                    asyncString.REFRESH_TOKEN
                )
            });
            let status = await refresh_token.status;
            if (status === 401) return response;

            let refreshedResponse = await refresh_token.json();
            if (
                refreshedResponse &&
                refreshedResponse.data &&
                refreshedResponse.data.access_token &&
                refreshedResponse.data.refresh_token
            ) {
                response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization:
                            "Bearer " +
                            JSON.parse(JSON.stringify(refreshedResponse.data.access_token))
                    }
                });
                if (response.status === 200)
                    await AsyncStorage.multiSet([
                        [
                            asyncString.ACCESS_TOKEN,
                            // JSON.parse(
                            //     JSON.stringify(await refreshedResponse.data.access_token)
                            // )
                            CryptoXor.encrypt(refreshedResponse.data.access_token, asyncString.ACCESS_TOKEN)
                        ],
                        [
                            asyncString.EXPIRES_IN,
                            await refreshedResponse.data.expires_in.toString()
                        ]
                    ]).then(() => {
                        global.ACCESS_TOKEN_HAS_EXPIRED = false;
                    });
            } else {
                return response;
            }
        }

        return response;
    },
    newFetchJSON: async function (
        url,
        body,
        access_token,
        callback,
        actionType,
        copyDataObj
    ) {
        let commonHeader = {
            Accept: "application/json",
            "Content-Type": "application/json"
        };
        let header = access_token
            ? {
                ...commonHeader,
                Authorization:
                    "Bearer " + (await CryptoXor.decrypt(
                        await retrieveItem(asyncString.ACCESS_TOKEN),
                        asyncString.ACCESS_TOKEN
                    ))
                    // (await retrieveItem(asyncString.ACCESS_TOKEN))
            }
            : commonHeader;
        console.warn('newFetchJSON URL - ', url);
        console.warn('newFetchJSON Body - ', body);
        await axios
            .post(url, body, {
                headers: await header
            })
            .then(async response => {
                callback(await actionType, await response, await copyDataObj);
                //return response;
            })
            .catch(async error => {
                if(error.hasOwnProperty('response')){
                    let errorResponse = error.response.data;
                    console.warn('ERROR -> ', JSON.stringify(error));
                    console.warn("error1" + JSON.stringify(errorResponse));
                    if (errorResponse.msg) {
                        Alert.show('Error', errorResponse.msg);
                    }
                    if (checkResponseError(errorResponse)) {
                        callback(await actionType, await error.response, await copyDataObj);
                    } else {
                        if (error) await NetworkErrorHandle(error.message);
                    }
                }else{
                    callback(await actionType, await error, await copyDataObj);
                }
                return error;

            });
    },
    
    newFetchXJSON: async function (
        url,
        access_token,
        callback,
        actionType,
        copyDataObj
    ) {
        let commonHeader = {
            "Content-Type": "application/x-www-form-urlencoded"
        };
        let header = {
            ...commonHeader,
            Authorization: "Bearer " + (await CryptoXor.decrypt(
                await retrieveItem(asyncString.ACCESS_TOKEN),
                asyncString.ACCESS_TOKEN
            ))
            // (await retrieveItem(asyncString.ACCESS_TOKEN))
        };
        await axios
            .get(url, {
                headers: await header
            })
            .then(async response => {
                callback(await actionType, await response, await copyDataObj);
            })
            .catch(async error => {
                console.warn("error - " + JSON.stringify(error));
                let errorResponse = error.response.data;
                console.warn("error2"+JSON.stringify(errorResponse))
                if (checkResponseError(errorResponse)) {
                    callback(await actionType, await error.response, await copyDataObj);
                }
                if (error) await NetworkErrorHandle(error.message);
                return error;
            });
    }
};

function NetworkErrorHandle(error) {
    if (error.message) {
        if (error.message === "Network request failed") {
            Alert.show(null, "Please check your network connection and try again");
        }
    }
}
