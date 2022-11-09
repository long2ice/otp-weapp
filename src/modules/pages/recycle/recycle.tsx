import {Button, Dialog, Empty, Flex, Image, Search, SwipeCell, Toast} from "@taroify/core";
import {useEffect, useState} from "react";
import {TOTP, URI} from "otpauth";
import {
  stopPullDownRefresh,
  usePullDownRefresh,
} from "@tarojs/taro";
import Layout from "../../../components/layout";
import "./recycle.scss";
import {deleteOTPRecycle, getRecycle, restoreOTP} from "../../../apis/otp";
import Tips from "../../../components/tips";
import {isCloudAvailable} from "../../../services/cloud";
import {API_URL} from "../../../constants";
import {Text} from "@tarojs/components";
import * as toast from "../../../components/toast";

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
      Toast.loading("加载中");
      await loadRecycle();
      setIsCloud(await isCloudAvailable());
      Toast.close();
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
      <Search
        value={value}
        placeholder="请输入搜索关键词"
        className="search"
        onChange={(e) => {
          setValue(e.detail.value ?? "");
        }}
      />
      <Dialog id="dialog"/>
      <Toast id="toast"/>
      {recycle.length === 0 ? (
        <Empty>
          <Empty.Image/>
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
            <Flex align='center' justify="start" gutter={10}>
              <Flex.Item className="flex">
                <Image
                  style={{width: "2.5rem", height: "2.5rem"}}
                  src={`${API_URL}/icon/${item.otp.issuer}.svg`}
                />
              </Flex.Item>
              <Flex.Item>
                <Flex direction="column">
                  <Text className="issuer">{item.otp.issuer}</Text>
                  <Text className="label">{item.otp.label}</Text>
                </Flex>
              </Flex.Item>
              <Flex.Item className='update-at'>
                <Text>
                  {item.updated_at.toLocaleString()}
                </Text>
              </Flex.Item>
            </Flex>
            <SwipeCell.Actions side="right" catchMove>
              <Button
                variant="contained"
                shape="square"
                color="primary"
                disabled={!isCloud}
                onClick={async () => {
                  Toast.loading("正在恢复...");
                  await restoreItem(item.id);
                  toast.success("恢复成功");
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
                  Dialog.confirm({
                    title: "彻底删除",
                    message: "确定要彻底删除吗？删除后你将无法恢复。",
                    onConfirm: async () => {
                      Toast.loading("正在删除...");
                      await deleteItem(item.id);
                      toast.success("删除成功");
                    }
                  })
                }}
              >
                彻底删除
              </Button>
            </SwipeCell.Actions>
          </SwipeCell>
        ))
      )}
      {recycle.length > 0 && <Tips>Tips: 向左滑动可以恢复和彻底删除~</Tips>}
    </Layout>
  );
}
