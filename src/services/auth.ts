import Taro from "@tarojs/taro";
import { getToken, setToken } from "../storages/auth";
import * as auth from "../apis/auth";
import { setUser } from "../storages/user";

export async function login() {
  const token = await getToken();
  if (!token) {
    await Taro.login({
      success: async (res) => {
        const code = res.code;
        let data = await auth.login(code);
        await setToken(data.token);
        await setUser(data.user);
      },
    });
  }
}
