import { View } from "@tarojs/components";
import { Button, Cell, Empty, Search, SwipeCell } from "@taroify/core";
import { useEffect, useState } from "react";
import { TOTP, URI } from "otpauth";
import {
  hideLoading,
  showLoading,
  showModal,
  stopPullDownRefresh,
  usePullDownRefresh,
} from "@tarojs/taro";
import Layout from "../../../components/layout";
import "./recycle.scss";
import { deleteOTPRecycle, getRecycle, restoreOTP } from "../../../apis/otp";
import Tips from "../../../components/tips";
import { isCloudAvailable } from "../../../services/cloud";

interface Recycle {
  otp: TOTP;
  updated_at: Date;
  id: number;
}

export default function Recycle() {
  const [recycle, setRecycle] = useState<Recycle[]>([]);
  const [isCloud, setIsCloud] = useState(false);
  const [value, setValue] = useState("");
  const loadRecycle = async () => {
    let data = await getRecycle();
    setRecycle(
      data.map((item) => ({
        otp: URI.parse(item.uri) as TOTP,
        updated_at: new Date(item.updated_at),
        id: item.id,
      }))
    );
  };
  useEffect(() => {
    (async () => {
      await loadRecycle();
      setIsCloud(await isCloudAvailable());
    })();
  }, []);
  usePullDownRefresh(async () => {
    await loadRecycle();
    await stopPullDownRefresh();
  });
  const restoreItem = async (id: number) => {
    await restoreOTP(id);
    await loadRecycle();
  };
  const deleteItem = async (id: number) => {
    await deleteOTPRecycle(id);
    await loadRecycle();
  };
  return (
    <Layout title="回收站">
      <View className="main">
        <Search
          value={value}
          placeholder="请输入搜索关键词"
          className="search"
          onChange={(e) => {
            setValue(e.detail.value ?? "");
          }}
        />
        {recycle.length === 0 ? (
          <Empty>
            <Empty.Image />
            <Empty.Description>这里空空如也~</Empty.Description>
          </Empty>
        ) : (
          (value == ""
            ? recycle
            : recycle.filter((item) => {
                return (
                  item.otp.label.includes(value) ||
                  item.otp.issuer.includes(value)
                );
              })
          ).map((item, index) => (
            <SwipeCell
              key={item.otp.toString()}
              className={
                index === recycle.length - 1
                  ? "last-cell"
                  : index === 0
                  ? "first-cell"
                  : ""
              }
            >
              <Cell title={item.otp.issuer} brief={item.otp.label} clickable>
                {item.updated_at.toLocaleString()}
              </Cell>
              <SwipeCell.Actions side="right" catchMove>
                <Button
                  variant="contained"
                  shape="square"
                  color="primary"
                  disabled={!isCloud}
                  onClick={async () => {
                    await showLoading();
                    await restoreItem(item.id);
                    await hideLoading();
                  }}
                >
                  恢复
                </Button>
                <Button
                  variant="contained"
                  shape="square"
                  color="danger"
                  disabled={!isCloud}
                  onClick={async () => {
                    await showModal({
                      title: "提示",
                      content: "确定要彻底删除吗？删除后你将无法恢复。",
                      success: async (res) => {
                        if (res.confirm) {
                          await showLoading();
                          await deleteItem(item.id);
                          await hideLoading();
                        }
                      },
                    });
                  }}
                >
                  彻底删除
                </Button>
              </SwipeCell.Actions>
            </SwipeCell>
          ))
        )}
        {recycle.length > 0 && <Tips>Tips: 向左滑动可以恢复和彻底删除~</Tips>}
      </View>
    </Layout>
  );
}
