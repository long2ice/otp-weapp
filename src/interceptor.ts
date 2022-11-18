import Taro, { addInterceptor, checkSession } from "@tarojs/taro";
import { getToken, removeToken } from "./storages/auth";
import * as auth from "./services/auth";
import { getRandomStr, getSign } from "./utils/sign";

const interceptor = async function (chain) {
  await checkSession().catch(async () => {
    await removeToken();
    await auth.login();
  });
  const requestParams = chain.requestParams;
  const { data } = requestParams;
  let timestamp = new Date().getTime().toString().substring(0, 10);
  let nonce = getRandomStr(8);
  const token = await getToken();
  requestParams.header = {
    Authorization: "Bearer " + token,
    "x-timestamp": timestamp,
    "x-nonce": nonce,
    "x-sign": getSign(data, timestamp, nonce),
  };
  return await chain.proceed(requestParams).then(async (res) => {
    switch (res.statusCode) {
      case 200:
        return res;
      case 401:
        await removeToken();
        await auth.login();
        return await chain.proceed(requestParams);
      default:
        await Taro.showToast({
          title: "服务器错误",
          icon: "error",
        });
        return Promise.reject(res.data);
    }
  });
};
addInterceptor(interceptor);
