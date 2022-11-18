import md5 from "./md5";

const secret = process.env.API_SECRET;
const getRandomStr = (length: number) => {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
const getSign = (
  data: Record<string, any>,
  timestamp: string,
  nonce: string
) => {
  let kvs = [`timestamp=${timestamp}`, `nonce=${nonce}`];
  for (const k in data) {
    let v = data[k];
    if (typeof v === "object" || Array.isArray(v)) {
      v = JSON.stringify(v);
    }
    kvs.push(`${k}=${v}`);
  }
  let s = kvs.sort().join("&") + `&key=${secret}`;
  return md5(s).toUpperCase();
};
export { getSign, getRandomStr };
