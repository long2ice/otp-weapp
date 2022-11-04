import { request } from "@tarojs/taro";
import { API_URL } from "../constants";

const BASE_URL = API_URL + "/auth";

export async function login(code: string) {
  const { data } = await request({
    url: BASE_URL + "/login",
    method: "POST",
    data: {
      code,
    },
  });
  return data;
}
