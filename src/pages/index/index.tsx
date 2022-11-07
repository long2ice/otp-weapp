import { Text } from "@tarojs/components";
import {
  hideLoading,
  navigateTo,
  scanCode,
  setClipboardData,
  showActionSheet,
  showLoading,
  showModal,
  showToast,
  stopPullDownRefresh,
  useDidShow,
  usePullDownRefresh,
} from "@tarojs/taro";
import { useCallback, useEffect, useState } from "react";
import * as OTPAuth from "otpauth";
import { TOTP, URI } from "otpauth";
import { Plus } from "@taroify/icons";
import { Flex, Search, Navbar, Image, Progress } from "@taroify/core";

import "./index.scss";
import Layout from "../../components/layout";
import { getOTPs } from "../../storages/otp";
import { API_URL } from "../../constants";
import { loadAndUpdateOTP } from "../../services/otp";
import * as otpServices from "../../services/otp";
import Tips from "../../components/tips";
import * as auth from "../../services/auth";

export default function Index() {
  const [value, setValue] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [otps, setOtps] = useState<OTPAuth.TOTP[]>([]);
  const [tokens, setTokens] = useState<string[]>([]);
  const demoSecret = URI.parse(
    "otpauth://totp/demo@demo.com?secret=JBSWY3DPEHPK3PXP&issuer=Demo"
  );
  const refreshOTPs = useCallback(async () => {
    let localOTPs = (await getOTPs()).map((otp) => {
      return URI.parse(otp) as TOTP;
    });
    if (localOTPs.length == 0) {
      localOTPs.push(demoSecret as TOTP);
    }
    setOtps(localOTPs);
    setTokens(localOTPs.map((otp) => otp.generate()));
    return localOTPs;
  }, [demoSecret]);
  const scanQrCode = async () => {
    await scanCode({
      success: async (res) => {
        let result = res.result;
        let parsedTotp = URI.parse(result);
        if (parsedTotp instanceof TOTP) {
          await otpServices.addOTP(result);
        } else {
          await showToast({
            title: "无效的二维码",
            icon: "error",
          });
        }
        await refreshOTPs();
      },
      fail: (e) => {
        if (e.errMsg !== "scanCode:fail cancel") {
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
  const INTERVAL = 30;
  useEffect(() => {
    (async () => {
      await auth.login();
      await loadAndUpdateOTP();
      await refreshOTPs();
    })();
  }, []);
  usePullDownRefresh(async () => {
    await loadAndUpdateOTP();
    await refreshOTPs();
    await stopPullDownRefresh();
  });
  useDidShow(() => {
    (async () => {
      const localOTPs = await refreshOTPs();
      setInterval(() => {
        let remainSeconds =
          (INTERVAL * (1 - ((Date.now() / 1000 / INTERVAL) % 1))) | 0;
        if (remainSeconds == INTERVAL - 1) {
          const newTokens = localOTPs.map((otp) => otp.generate());
          setTokens(newTokens);
        }
        let p = ((INTERVAL - remainSeconds) / INTERVAL) * 100;
        setProgress(p);
      }, 1000);
    })();
  });
  return (
    <Layout
      title="两步验证码"
      navbar={
        <Navbar.NavLeft
          onClick={async () => {
            await showActionSheet({
              itemList: ["扫码添加", "手动添加"],
              success: async (res) => {
                if (res.tapIndex == 0) {
                  await scanQrCode();
                } else {
                  await navigateTo({
                    url: "/modules/pages/add/add",
                  });
                }
              },
            });
          }}
          icon={<Plus />}
        ></Navbar.NavLeft>
      }
    >
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
          ? otps
          : otps.filter((s) => {
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
            onLongPress={async () => {
              if (otps.length > 0) {
                await showModal({
                  title: "删除两步验证码",
                  content:
                    "删除两步验证码可能会导致你无法登录对应网站，确定要删除吗？如果你启用了云服务，可在个人中心回收站中找回。",
                  success: async (res) => {
                    if (res.confirm) {
                      await showLoading();
                      await otpServices.deleteOTP(index);
                      await refreshOTPs();
                      await hideLoading();
                    }
                  },
                });
              }
            }}
          >
            <Flex align="center" justify="start" gutter={10}>
              <Flex.Item className="flex">
                <Image
                  style={{ width: "2.5rem", height: "2.5rem" }}
                  src={`${API_URL}/icon/${item.issuer}.svg`}
                />
              </Flex.Item>
              <Flex.Item>
                <Flex direction="column">
                  <Text className="issuer">{item.issuer}</Text>
                  <Text className="label">{item.label}</Text>
                </Flex>
              </Flex.Item>
              <Flex.Item className="code-item">
                <Text className="code">{tokens[index]}</Text>
                <Progress
                  className="progress"
                  percent={progress}
                  label={false}
                  color={progress > 80 ? "danger" : "primary"}
                />
              </Flex.Item>
            </Flex>
          </Flex.Item>
        ))}
      </Flex>
      <Tips>Tips: 点击复制，长按删除~</Tips>
    </Layout>
  );
}
