import { View } from "@tarojs/components";
import { ReactNode } from "react";
import Navbar from "./navbar";
import "./layout.scss";

interface LayoutProps {
  children?: ReactNode;
  title: string;
  navbar?: ReactNode;
}

export default function Layout(props: LayoutProps) {
  return (
    <View className="layout">
      <Navbar title={props.title}>{props.navbar}</Navbar>
      {props.children}
    </View>
  );
}
