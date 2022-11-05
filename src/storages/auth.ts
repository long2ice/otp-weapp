import { getStorage, setStorage, removeStorage } from "@tarojs/taro";
import { TOKEN } from "../constants";

export async function getToken() {
  return await getStorage({
    key: TOKEN,
  })
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      return "";
    });
}

export async function setToken(token: string) {
  return await setStorage({
    key: TOKEN,
    data: token,
  });
}

export async function removeToken() {
  return await removeStorage({
    key: TOKEN,
  });
}
