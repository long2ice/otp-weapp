import { Text, View } from "@tarojs/components";
import Layout from "../../components/layout";

export default function User() {
  return (
    <Layout title="个人中心" navbar={<View />}>
      <Text>个人中心</Text>
    </Layout>
  );
}
