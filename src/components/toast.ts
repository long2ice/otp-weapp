import { Toast } from "@taroify/core";

export function success(msg: string) {
  Toast.success({
    message: msg,
    duration: 900,
  });
}

export function fail(msg: string) {
  Toast.fail({
    message: msg,
    duration: 900,
  });
}
