import { Text, View } from "@tarojs/components";
import {
  navigateTo,
  scanCode,
  setClipboardData,
  showToast,
  useDidShow,
} from "@tarojs/taro";
import { useState } from "react";
import * as OTPAuth from "otpauth";
import { TOTP, URI } from "otpauth";
import { Plus } from "@taroify/icons";
import {
  ActionSheet,
  Avatar,
  Circle,
  Search,
  Flex,
  Dialog,
  Button,
  Navbar,
} from "@taroify/core";

import { addSecret, deleteSecret, getSecrets } from "../../storage";
import "./index.scss";
import Layout from "../../components/layout";

export default function Index() {
  const [value, setValue] = useState<string>("");
  const [actionSheetIsOpened, setActionSheetIsOpened] = useState(false);
  const [progress, setProgress] = useState(0);
  const [seconds, setSeconds] = useState(1);
  const [secrets, setSecrets] = useState<OTPAuth.TOTP[]>([]);
  const [tokens, setTokens] = useState<string[]>([]);
  const [deleteSecretIndex, setDeleteSecretIndex] = useState<number>(-1);
  const refreshSecrets = async () => {
    let localSecrets = (await getSecrets()).map((secret) => {
      return URI.parse(secret) as TOTP;
    });
    setSecrets(localSecrets);
    setTokens(localSecrets.map((secret) => secret.generate()));
    return localSecrets;
  };
  const INTERVAL = 30;
  const demoSecret = URI.parse(
    "otpauth://totp/demo@demo.com?secret=JBSWY3DPEHPK3PXP&issuer=Demo"
  );

  useDidShow(() => {
    (async () => {
      const localSecrets = await refreshSecrets();
      setInterval(() => {
        let remainSeconds =
          (INTERVAL * (1 - ((Date.now() / 1000 / INTERVAL) % 1))) | 0;
        if (remainSeconds == INTERVAL - 1) {
          setTokens(localSecrets.map((secret) => secret.generate()));
        }
        let p = ((INTERVAL - remainSeconds) / INTERVAL) * 100;
        setSeconds(remainSeconds + 1);
        setProgress(p);
      }, 1000);
    })();
  });
  const scanQrCode = async () => {
    await scanCode({
      success: async (res) => {
        let result = res.result;
        let parsedTotp = URI.parse(result);
        if (parsedTotp instanceof TOTP) {
          await addSecret(parsedTotp);
          setActionSheetIsOpened(false);
        } else {
          await showToast({
            title: "无效的二维码",
            icon: "error",
          });
        }
        await refreshSecrets();
      },
      fail: (e) => {
        if (e.errMsg == "scanCode:fail cancel") {
          setActionSheetIsOpened(false);
        } else {
          showToast({
            title: "扫码失败",
            icon: "error",
          });
        }
      },
    });
  };
  const copyToken = async (t: string) => {
    await setClipboardData({
      data: t,
    });
  };
  return (
    <Layout
      title="两步验证码"
      navbar={
        <Navbar.NavLeft
          onClick={() => {
            setActionSheetIsOpened(true);
          }}
          icon={<Plus />}
        ></Navbar.NavLeft>
      }
    >
      <View className="main">
        <Search
          value={value}
          placeholder="请输入搜索关键词"
          className="search"
          onChange={(e) => {
            setValue(e.detail.value ?? "");
          }}
        />
        <Flex direction="column">
          {(value == ""
            ? secrets.length > 0
              ? secrets
              : [demoSecret]
            : (secrets.length > 0 ? secrets : [demoSecret]).filter((s) => {
                return (
                  s.issuer.toLowerCase().includes(value.toLowerCase()) ||
                  s.label.toLowerCase().includes(value.toLowerCase())
                );
              })
          ).map((item, index) => (
            <Flex.Item
              key={index}
              className="item"
              onClick={() => copyToken(tokens[index])}
              onLongPress={() =>
                secrets.length > 0 && setDeleteSecretIndex(index)
              }
            >
              <Flex align="center" justify="start" gutter={10}>
                <Flex.Item>
                  <Avatar
                    shape="rounded"
                    src="https://jdc.jd.com/img/200"
                  ></Avatar>
                </Flex.Item>
                <Flex.Item>
                  <Flex direction="column">
                    <Text className="issuer">{item.issuer}</Text>
                    <Text className="label">{item.label}</Text>
                  </Flex>
                </Flex.Item>
                <Flex.Item className="code-item">
                  <Text className="code">{tokens[index]}</Text>
                </Flex.Item>
                <Flex.Item className="progress-item">
                  <Circle
                    color={progress > 80 ? "#ee0a24" : "#1989fa"}
                    layerColor="#F3F4F6"
                    percent={progress}
                    strokeWidth={20}
                    size={30}
                  >
                    {seconds}
                  </Circle>
                </Flex.Item>
              </Flex>
            </Flex.Item>
          ))}
        </Flex>

        <View className="tips">Tips: 点击复制，长按删除~</View>
      </View>
      <ActionSheet
        open={actionSheetIsOpened}
        onCancel={() => {
          setActionSheetIsOpened(false);
        }}
        onClose={() => {
          setActionSheetIsOpened(false);
        }}
      >
        <ActionSheet.Header>添加两步验证码</ActionSheet.Header>
        <ActionSheet.Action onClick={scanQrCode} name="扫码二维码添加" />
        <ActionSheet.Action
          onClick={async () => {
            setActionSheetIsOpened(false);
            await navigateTo({
              url: "/pages/add/add",
            });
          }}
          name="手动输入添加"
        />
      </ActionSheet>
      <Dialog
        open={deleteSecretIndex != -1}
        onClose={() => {
          setDeleteSecretIndex(-1);
        }}
      >
        <Dialog.Header>删除两步验证码</Dialog.Header>
        <Dialog.Content>
          两步验证码删除后将无法恢复，可能会导致你无法登录对应网站，确定要删除吗？
        </Dialog.Content>
        <Dialog.Actions>
          <Button onClick={() => setDeleteSecretIndex(-1)}>取消</Button>
          <Button
            onClick={async () => {
              setDeleteSecretIndex(-1);
              await deleteSecret(deleteSecretIndex);
              await refreshSecrets();
            }}
          >
            确认
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Layout>
  );
}
