import { TOTP, URI } from "otpauth";
import { getStorage, setStorage } from "@tarojs/taro";

const key = "secrets";

export async function addSecret(totp: TOTP) {
  let secrets = await getSecrets();
  secrets.push(totp.toString());
  secrets = [...new Set(secrets)];
  await setStorage({ key, data: secrets });
}

export async function addSecrets(secrets: string[]) {
  secrets.map(async (secret) => {
    await addSecret(URI.parse(secret) as TOTP);
  });
}

export async function getSecrets(): Promise<string[]> {
  let data;
  await getStorage({
    key,
    fail: () => {
      data = [];
    },
    success: (res) => {
      data = res.data;
    },
  }).catch(() => {
    data = [];
  });
  return data;
}

export async function deleteSecret(index: number) {
  const secrets = await getSecrets();
  secrets.splice(index, 1);
  await setStorage({ key, data: secrets });
}
