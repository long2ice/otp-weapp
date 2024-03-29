import { Flex, Image, Cell, Divider, Switch } from "@taroify/core";
import { View } from "@tarojs/components";
import { useEffect, useState } from "react";
import {
  Arrow,
  DeleteOutlined,
  CommentOutlined,
  InfoOutlined,
} from "@taroify/icons";
import { navigateTo } from "@tarojs/taro";
import "./user.scss";
import * as user from "../../services/user";
import Layout from "../../components/layout";
import { getUser, setUser } from "../../storages/user";
import cloud from "../../assets/cloud.svg";
import trash from "../../assets/trash-restore.svg";
import phone from "../../assets/phone.svg";
import Tips from "../../components/tips";
import { updateUser } from "../../api/user";

export default function User() {
  const [expiredDate, setExpiredDate] = useState<Date | null>();
  const [isCloud, setIsCloud] = useState(false);
  const loadUser = async () => {
    const u = await getUser();
    if (u.expired_date != null) {
      setExpiredDate(new Date(u.expired_date));
    }
    setIsCloud(u.is_cloud_enabled);
  };
  useEffect(() => {
    (async () => {
      await loadUser();
    })();
  }, []);
  const onCloudChange = async (checked: boolean) => {
    setIsCloud(checked);
    let u = await updateUser(checked);
    await setUser(u);
  };
  return (
    <Layout
      title="个人中心"
      navbar={<View />}
      refresherEnabled
      onRefresherRefresh={async () => {
        await user.getUser();
        await loadUser();
      }}
    >
      <Flex
        className="cloud"
        justify="center"
        direction="column"
        align="center"
      >
        <Flex.Item className="cloud-title">云服务到期时间</Flex.Item>
        <Flex.Item className="valid-date">
          {expiredDate == null ? "无限期" : expiredDate.toLocaleDateString()}
        </Flex.Item>
        <Flex.Item>
          <Tips>
            云服务到期后两步验证码将不会再实时同步到云端，也无法再使用回收站，但是保存在本地的验证码永远可以使用。
          </Tips>
        </Flex.Item>
      </Flex>
      <View className="privilege">
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
        <Divider />
        <Cell
          title={isCloud ? "开启云同步" : "关闭云同步"}
          rightIcon={
            <Switch size="20px" checked={isCloud} onChange={onCloudChange} />
          }
          brief={isCloud ? "当前会自动同步到云端" : "当前不会自动同步到云端"}
        />
      </View>
      <View className="settings">
        <Cell
          style={{
            borderTopLeftRadius: "10rpx",
            borderTopRightRadius: "10rpx",
          }}
          icon={<DeleteOutlined />}
          title="回收站"
          rightIcon={<Arrow />}
          clickable
          onClick={async () => {
            await navigateTo({
              url: "/modules/pages/recycle/recycle",
            });
          }}
        />
        <Cell
          icon={<CommentOutlined />}
          onClick={async () => {
            await navigateTo({
              url: "/modules/pages/feedback/feedback",
            });
          }}
          rightIcon={<Arrow />}
          title="反馈"
          clickable
        ></Cell>
        <Cell
          style={{
            borderBottomLeftRadius: "10rpx",
            borderBottomRightRadius: "10rpx",
          }}
          icon={<InfoOutlined />}
          onClick={async () => {
            await navigateTo({
              url: "/modules/pages/about/about",
            });
          }}
          rightIcon={<Arrow />}
          title="关于"
          clickable
        ></Cell>
      </View>
    </Layout>
  );
}
