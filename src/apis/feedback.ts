import { request } from "@tarojs/taro";
import { API_URL } from "../constants";

const BASE_URL = API_URL + "/feedback";

export async function AddFeedback(content: string) {
  await request({
    url: BASE_URL,
    method: "POST",
    data: {
      content,
    },
  });
}
