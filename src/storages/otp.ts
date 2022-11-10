import { TOTP, URI } from "otpauth";
import { getStorage, setStorage } from "@tarojs/taro";
import { OTP } from "../constants";

export async function addOTP(totp: TOTP) {
  let secrets = await getOTPs();
  secrets.push(totp.toString());
  secrets = [...new Set(secrets)];
  await setStorage({ key: OTP, data: secrets });
}

export async function addOTPs(uris: string[]) {
  let exists = await getOTPs();
  uris.map((secret) => exists.push(URI.parse(secret).toString()));
  uris = [...new Set(exists)];
  await setStorage({ key: OTP, data: uris });
  return uris;
}

export async function getOTPs(): Promise<string[]> {
  let data;
  await getStorage({
    key: OTP,
    fail: () => {
      data = [];
    },
    success: (res) => {
      data = res.data;
    },
  }).catch(() => {
    data = [];
  });
  return data.sort();
}

export async function deleteOTP(index: number) {
  const otpList = await getOTPs();
  const removed = otpList.splice(index, 1);
  await setStorage({ key: OTP, data: otpList });
  return removed[0];
}
