import { getUser } from "../storages/user";

export async function isCloudAvailable() {
  const user = await getUser();
  const expiredDate = user.expired_date;
  if (expiredDate == null) {
    return true;
  }
  const now = new Date();
  return now < new Date(expiredDate);
}
