/// for multiple parallel requests

// import {expireSession} from "./axiosInterceptRequest";
import { CryptoXor } from "crypto-xor";
import { retrieveItem } from "../../model/StorageHelper";
import {asyncString} from "../../utils/ConstantString";

let isRefreshing = false;
let failedQueue = [];
/** @type {Object} */
const defaults = {
  /** @type {Number[]} */
  statusCodes: [
    401 // Unauthorized
  ]
};

const processQueue = async (error, token = null) => {
  failedQueue.forEach(async prom => {
    if (error) {
      await prom.reject(error);
    } else {
      await prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Creates an authentication refresh interceptor that binds to any error response.
 * If the response code is 401, interceptor tries to call the refreshTokenCall which must return a Promise.
 * While refreshTokenCall is running, all new requests are intercepted and waiting for it to resolve.
 * After Promise is resolved/rejected the authentication refresh interceptor is revoked.
 * @param {AxiosInstance|Function} axios - axios instance
 * @param {Function} refreshTokenCall - refresh token call which must return a Promise
 * @return {AxiosInstance}
 */
const createAuthRefreshInterceptor = async (
  axios,
  refreshTokenCall,
) => {
  axios.interceptors.response.use(
    function(response) {
      return response;
    },
    async error => {
      const originalRequest = error.config;

      if (error.response.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then(async token => {
              // console.warn("Token at Process Queue "+token);
              let Token=token;
              if(!token){
                  Token= (await CryptoXor.decrypt(
                    await retrieveItem(asyncString.ACCESS_TOKEN),
                    asyncString.ACCESS_TOKEN
                ))
                // (await retrieveItem(asyncString.ACCESS_TOKEN))
              }
              originalRequest.headers["Authorization"] = "Bearer " + Token;
              return await axios(originalRequest);
            })
            .catch(err => {
              return err;
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        return await new Promise(async (resolve, reject) => {
          await refreshTokenCall(error,3)
            .then(async token => {
                // console.warn("Token at  "+token);
                let Token =token;
                if(!token){
                  Token= (await CryptoXor.decrypt(
                    await retrieveItem(asyncString.ACCESS_TOKEN),
                    asyncString.ACCESS_TOKEN
                ))
                // await retrieveItem(asyncString.ACCESS_TOKEN);
                }
                axios.defaults.headers.common["Authorization"] =
                "Bearer " + (await Token);
              originalRequest.headers["Authorization"] =
                "Bearer " + (await Token);
              await processQueue(null, Token);
              resolve(axios(originalRequest));
            })
            .catch(async err => {
              console.warn("Error in ProcessQueue...  "+err.toString());
              await processQueue(err, null);
              await reject(err);
              isRefreshing = false;
            })
            .then(() => {
              isRefreshing = false;
            });
        });
      }
        console.warn("Caught Error - ", error);
        return Promise.reject(error);
    }
  );
};
export default createAuthRefreshInterceptor;
