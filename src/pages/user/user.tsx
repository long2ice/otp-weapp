import { View } from "@tarojs/components";
import { Empty, Flex } from "@taroify/core";
import Layout from "../../components/layout";

export default function User() {
  // useEffect(() => {
  //   (async () => {
  //     await login({
  //       success: async (res) => {
  //         const code = res.code;
  //         let data = await auth.login(code);
  //         let token = data.token;
  //         let user = data.user;
  //         console.log(token, user);
  //       },
  //     });
  //   })();
  // }, []);
  return (
    <Layout title="个人中心" navbar={<View />}>
      <Flex direction="column" justify="center" align="center">
        <Flex.Item>
          <Empty>
            <Empty.Image src="error" />
            <Empty.Description>
              未来将上线云服务同步功能，敬请期待。
            </Empty.Description>
          </Empty>
        </Flex.Item>
      </Flex>
    </Layout>
  );
}
