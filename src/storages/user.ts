import { getStorage, setStorage } from "@tarojs/taro";
import { USER } from "../constants";

export async function setUser(user) {
  return await setStorage({
    key: USER,
    data: user,
  });
}

export async function getUser() {
  return await getStorage({
    key: USER,
  })
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      return "";
    });
}
