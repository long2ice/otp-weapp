import * as api from "../api/otp";
import * as otpStorages from "../storages/otp";
import * as userStorages from "../storages/user";
import { isCloudAvailable } from "./cloud";

export async function loadAndUpdateOTP() {
  const data = await api.getOTPList();
  let user = await userStorages.getUser();
  await userStorages.setUser(user);
  const uris = await otpStorages.addOTPs(data);
  if (await isCloudAvailable()) {
    const minus = uris.filter((uri) => !data.includes(uri));
    if (minus.length > 0) {
      await api.addOTPs(minus);
    }
  }
}

export async function addOTP(uri: string) {
  await otpStorages.addOTPs([uri]);
  if (await isCloudAvailable()) {
    await api.addOTPs([uri]);
  }
}

export async function deleteOTP(index: number) {
  const uri = await otpStorages.deleteOTP(index);
  if (await isCloudAvailable()) {
    await api.deleteOTP(uri);
  }
}
