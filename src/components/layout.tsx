import { View } from "@tarojs/components";
import { ReactNode } from "react";
import Navbar from "./navbar";
import "./layout.scss";

interface LayoutProps {
  children?: ReactNode;
  title: string;
  navbar?: ReactNode;
  padding?: string;
}

export default function Layout(props: LayoutProps) {
  return (
    <View className="layout">
      <Navbar title={props.title}>{props.navbar}</Navbar>
      <View
        className="main"
        style={{
          padding: props.padding || "30rpx",
          overflowY: "scroll",
          height: "84vh",
        }}
      >
        {props.children}
      </View>
    </View>
  );
}
