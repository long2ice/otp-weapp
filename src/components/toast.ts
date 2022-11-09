import {Toast} from "@taroify/core";

function close() {
  setTimeout(() => {
    Toast.close();
  }, 2000)
}

export function success(msg: string) {
  Toast.success(msg);
  close();
}

export function fail(msg: string) {
  Toast.fail(msg);
  close();
}


