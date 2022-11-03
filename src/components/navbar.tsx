import { View } from "@tarojs/components";
import { ReactNode, useEffect, useState } from "react";
import { getSystemInfoSync, navigateBack } from "@tarojs/taro";
import { Navbar } from "@taroify/core";

interface NavbarProps {
  title: string;
  children?: ReactNode;
}

export default function MyNavbar(props: NavbarProps) {
  const [navHeight, setNavHeight] = useState(0);
  useEffect(() => {
    let sysInfo = getSystemInfoSync();
    let statusBarHeight = sysInfo.statusBarHeight || 0;
    setNavHeight(statusBarHeight);
  }, []);
  return (
    <View
      style={{
        paddingTop: navHeight + "px",
        backgroundColor: "white",
      }}
    >
      <Navbar title={props.title}>
        {props.children ?? (
          <Navbar.NavLeft
            onClick={async () => {
              await navigateBack();
            }}
          >
            返回
          </Navbar.NavLeft>
        )}
      </Navbar>
    </View>
  );
}
