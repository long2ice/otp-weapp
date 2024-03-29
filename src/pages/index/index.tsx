// @ts-nocheck
import { Text, View } from "@tarojs/components";
import {
  navigateTo,
  scanCode,
  setClipboardData,
  useDidShow,
} from "@tarojs/taro";
import { useCallback, useEffect, useState } from "react";
import * as OTPAuth from "otpauth";
import { TOTP, URI } from "otpauth";
import { Plus, DeleteOutlined } from "@taroify/icons";
import {
  Flex,
  Search,
  Navbar,
  Image,
  Progress,
  Dialog,
  ActionSheet,
  Toast,
  SwipeCell,
  Button,
} from "@taroify/core";

import "./index.scss";
import Layout from "../../components/layout";
import { getOTPs } from "../../storages/otp";
import { API_URL } from "../../constants";
import { loadAndUpdateOTP } from "../../services/otp";
import * as otpServices from "../../services/otp";
import Tips from "../../components/tips";
import * as auth from "../../services/auth";
import * as toast from "../../components/toast";

export default function Index() {
  const [value, setValue] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [otps, setOtps] = useState<OTPAuth.TOTP[]>([]);
  const [actionSheet, setActionSheet] = useState(false);
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
    return localOTPs;
  }, [demoSecret]);
  const scanQrCode = async () => {
    await scanCode({
      success: async (res) => {
        let result = res.result;
        let parsedTotp = URI.parse(result);
        if (parsedTotp instanceof TOTP) {
          await otpServices.addOTP(result);
          await refreshOTPs();
          toast.success("添加成功");
        } else {
          toast.fail("当前只支持TOTP");
        }
      },
      fail: (e) => {
        if (e.errMsg !== "scanCode:fail cancel") {
          toast.fail("扫码失败");
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
    Toast.loading("加载中");
    (async () => {
      await auth.login();
      await loadAndUpdateOTP();
      await refreshOTPs();
      setInterval(() => {
        let remainSeconds =
          (INTERVAL * (1 - ((Date.now() / 1000 / INTERVAL) % 1)) + 1) | 0;
        let p = ((INTERVAL - remainSeconds) / INTERVAL) * 100;
        setProgress(p);
      }, 1000);
    })().finally(() => {
      Toast.close();
    });
  }, []);
  useDidShow(() => {
    (async () => {
      await refreshOTPs();
    })();
  });
  return (
    <Layout
      title="两步验证码"
      navbar={
        <Navbar.NavLeft onClick={() => setActionSheet(true)} icon={<Plus />} />
      }
      refresherEnabled
      onRefresherRefresh={async () => {
        await loadAndUpdateOTP();
        await refreshOTPs();
      }}
      brother={
        <ActionSheet
          open={actionSheet}
          onSelect={async (e) => {
            setActionSheet(false);
            if (e.value == "1") {
              await scanQrCode();
            } else {
              await navigateTo({
                url: "/modules/pages/add/add",
              });
            }
          }}
          onCancel={() => setActionSheet(false)}
          onClose={setActionSheet}
        >
          <ActionSheet.Header>添加两步验证码</ActionSheet.Header>
          <ActionSheet.Action value="1" name="扫码添加" />
          <ActionSheet.Action value="2" name="手动添加" />
          <ActionSheet.Button type="cancel">取消</ActionSheet.Button>
        </ActionSheet>
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
      {(value == ""
        ? otps
        : otps.filter((s) => {
            return (
              s.issuer.toLowerCase().includes(value.toLowerCase()) ||
              s.label.toLowerCase().includes(value.toLowerCase())
            );
          })
      ).map((item, index) => (
        <View className="item" key={index}>
          <SwipeCell
            onClick={() => copyToken(item.generate())}
            catchMove={false}
          >
            <Flex
              align="center"
              justify="start"
              gutter={10}
              className="flex-item"
            >
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
                <Text className="code">{item.generate()}</Text>
                <Progress
                  className="progress"
                  percent={progress}
                  label={false}
                  color={progress > 80 ? "danger" : "primary"}
                />
              </Flex.Item>
            </Flex>
            <SwipeCell.Actions side="right" catchMove>
              <Button
                variant="contained"
                shape="square"
                color="danger"
                className="action-button"
                onClick={async () => {
                  if (otps.length > 0) {
                    Dialog.confirm({
                      title: "删除两步验证码",
                      message: `删除两步验证码可能会导致你无法登录对应网站，确定要删除吗？如果你启用了云服务，可在个人中心回收站中找回。`,
                      onConfirm: async () => {
                        Toast.loading("删除中");
                        await otpServices.deleteOTP(index);
                        await refreshOTPs();
                        toast.success("删除成功");
                      },
                    });
                  }
                }}
                icon={<DeleteOutlined size="20px" />}
              />
            </SwipeCell.Actions>
          </SwipeCell>
        </View>
      ))}
      <Tips>Tips: 向左滑动可以删除，下拉刷新~</Tips>
    </Layout>
  );
}
