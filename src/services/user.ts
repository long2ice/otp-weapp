import * as user from "../apis/user";
import { setUser } from "../storages/user";

export async function getUser() {
  const u = await user.getUser();
  await setUser(u);
  return u;
}
