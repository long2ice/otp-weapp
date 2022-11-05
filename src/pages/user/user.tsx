import { Flex, Image, Cell, Divider } from "@taroify/core";
import { View } from "@tarojs/components";
import { useEffect, useState } from "react";
import { Arrow, DeleteOutlined } from "@taroify/icons";
import {
  navigateTo,
  stopPullDownRefresh,
  usePullDownRefresh,
} from "@tarojs/taro";
import "./user.scss";
import * as auth from "../../services/auth";
import * as user from "../../services/user";
import Layout from "../../components/layout";
import { getUser } from "../../storages/user";
import cloud from "../../assets/cloud.svg";
import trash from "../../assets/trash-restore.svg";
import phone from "../../assets/phone.svg";
import Tips from "../../components/tips";

export default function User() {
  const [expiredDate, setExpiredDate] = useState<Date | null>();
  const loadUser = async () => {
    const u = await getUser();
    if (u.expired_date != null) {
      setExpiredDate(new Date(u.expired_date));
    }
  };
  useEffect(() => {
    (async () => {
      await auth.login();
      await loadUser();
    })();
  }, []);
  usePullDownRefresh(async () => {
    await user.getUser();
    await loadUser();
    await stopPullDownRefresh();
  });

  return (
    <Layout title="个人中心" navbar={<View />}>
      <View className="main">
        <Flex
          className="cloud"
          justify="center"
          direction="column"
          align="center"
        >
          <Flex.Item className="cloud-title">云服务有效期</Flex.Item>
          <Flex.Item className="valid-date">
            {expiredDate == null ? "无限制" : expiredDate.toLocaleDateString()}
          </Flex.Item>
        </Flex>
        <View className="privilege">
          <View className="privilege-title">三大功能</View>
          <Divider />
          <Flex
            className="privilege-content"
            align="center"
            justify="space-between"
          >
            <Flex.Item span={6}>
              <Flex justify="center" align="center" direction="column">
                <Flex.Item>
                  <Image src={cloud} />
                </Flex.Item>
                <Flex.Item>
                  <View>云端保存</View>
                </Flex.Item>
              </Flex>
            </Flex.Item>
            <Flex.Item span={6}>
              <Flex justify="center" align="center" direction="column">
                <Flex.Item>
                  <Image src={trash} />
                </Flex.Item>
                <Flex.Item>
                  <View>误删找回</View>
                </Flex.Item>
              </Flex>
            </Flex.Item>
            <Flex.Item span={6}>
              <Flex justify="center" align="center" direction="column">
                <Flex.Item>
                  <Image src={phone} />
                </Flex.Item>
                <Flex.Item>
                  <View>多设备同步</View>
                </Flex.Item>
              </Flex>
            </Flex.Item>
          </Flex>
        </View>
        <Cell
          icon={<DeleteOutlined />}
          title="回收站"
          rightIcon={<Arrow />}
          clickable
          onClick={async () => {
            await navigateTo({
              url: "/modules/pages/recycle/recycle",
            });
          }}
        >
          找回误删的两步验证码
        </Cell>
        <Tips>
          云服务到期后两步验证码将不会再实时同步到云端。你也无法再使用回收站。
        </Tips>
      </View>
    </Layout>
  );
}
