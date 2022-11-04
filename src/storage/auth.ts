import { getStorage, setStorage } from "@tarojs/taro";
import { TOKEN } from "../constants";

export async function getToken() {
  return await getStorage({
    key: TOKEN,
  });
}

export async function setToken(token: string) {
  return await setStorage({
    key: TOKEN,
    data: token,
  });
}
