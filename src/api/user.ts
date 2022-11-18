import { request } from "@tarojs/taro";
import { API_URL } from "../constants";

const BASE_URL = API_URL + "/user";

export async function getUser() {
  let { data } = await request({
    url: BASE_URL,
    method: "GET",
  });
  return data;
}

export async function updateUser(isCloudEnabled: boolean) {
  let { data } = await request({
    url: BASE_URL,
    method: "PUT",
    data: {
      is_cloud_enabled: isCloudEnabled,
    },
  });
  return data;
}
