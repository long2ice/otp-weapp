import { addInterceptor, checkSession } from "@tarojs/taro";
import { getToken, setToken } from "./storage/auth";

const interceptor = function (chain) {
  const requestParams = chain.requestParams;
  const { header } = requestParams;
  header["content-type"] = "application/json";
  checkSession()
    .then(async () => {
      const token = await getToken();
      if (token) {
        header["Authorization"] = token;
      }
    })
    .catch(() => {});
  return chain.proceed(requestParams).then(async (res) => {
    switch (res.statusCode) {
      case 404:
        return Promise.reject("请求资源不存在");
      case 500:
        return Promise.reject("服务端出现了问题");
      case 403: {
        return Promise.reject("没有权限访问");
      }
      case 401: {
        await setToken("");
        return Promise.reject("需要登录");
      }
      case 200:
        return res.data;
    }
  });
};
addInterceptor(interceptor);
