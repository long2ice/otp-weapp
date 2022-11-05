import { addInterceptor, checkSession } from "@tarojs/taro";
import { getToken, removeToken } from "./storages/auth";
import * as auth from "./services/auth";

const interceptor = async function (chain) {
  await checkSession().catch(async () => {
    await removeToken();
    await auth.login();
  });
  const requestParams = chain.requestParams;
  const token = await getToken();
  requestParams.header = {
    Authorization: "Bearer " + token,
  };
  return await chain.proceed(requestParams).then(async (res) => {
    switch (res.statusCode) {
      case 200:
        return res;
      case 401:
      case 403:
        await removeToken();
        await auth.login();
        return await chain.proceed(requestParams);
      default:
        return Promise.reject(res.data);
    }
  });
};
addInterceptor(interceptor);
