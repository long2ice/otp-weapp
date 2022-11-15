import { Image, Flex, Cell } from "@taroify/core";
import { Text } from "@tarojs/components";
import { useEffect, useState } from "react";
import { getAccountInfoSync, setClipboardData } from "@tarojs/taro";
import Layout from "../../../components/layout";
import "./about.scss";
import { EMAIL } from "../../../constants";

export default function About() {
  const [version, setVersion] = useState("");
  useEffect(() => {
    const account = getAccountInfoSync();
    setVersion(account.miniProgram.version || "1.0.0");
  }, []);
  return (
    <Layout title="关于" padding="0">
      <Flex justify="center" align="center" direction="column">
        <Flex.Item className="item">
          <Image
            src="https://s1.ax1x.com/2022/11/15/zEJX1P.jpg"
            style={{ width: "6rem", height: "6rem" }}
            round
          />
        </Flex.Item>
        <Flex.Item className="item">
          <Text
            style={{
              color: "gray",
            }}
          >
            版本号: {version}
          </Text>
        </Flex.Item>
        <Flex.Item className="item menu">
          <Cell
            title="开发者邮箱"
            clickable
            onClick={async () => {
              await setClipboardData({
                data: EMAIL,
              });
            }}
          >
            {EMAIL}
          </Cell>
        </Flex.Item>
      </Flex>
    </Layout>
  );
}