import { request } from "@tarojs/taro";
import { API_URL } from "../constants";

const BASE_URL = API_URL + "/otp";

export async function deleteOTP(uri: string) {
  const { data } = await request({
    url: BASE_URL,
    method: "PUT",
    data: {
      uri,
    },
  });
  return data;
}

export async function deleteOTPRecycle(id: number) {
  const { data } = await request({
    url: BASE_URL + `/${id}/recycle`,
    method: "DELETE",
  });
  return data;
}

export async function restoreOTP(id: number) {
  const { data } = await request({
    url: BASE_URL + `/${id}/restore`,
    method: "PUT",
  });
  return data;
}

export async function getRecycle() {
  const { data } = await request({
    url: BASE_URL + "/recycle",
    method: "GET",
  });
  return data;
}

export async function getOTPList() {
  const { data } = await request({
    url: BASE_URL,
    method: "GET",
  });
  return data;
}

export async function addOTPs(uris: string[]) {
  const { data } = await request({
    url: BASE_URL,
    method: "POST",
    data: {
      uris,
    },
  });
  return data;
}
