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
              当前你的所有数据都会保存在本地，为防止因数据清理或微信卸载导致数据丢失，请及时手动备份数据。未来将上线云服务同步功能，敬请期待。
            </Empty.Description>
          </Empty>
        </Flex.Item>
      </Flex>
    </Layout>
  );
}
