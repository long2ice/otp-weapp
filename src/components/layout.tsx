import { ScrollView, View } from "@tarojs/components";
import { ReactNode, useState } from "react";
import Navbar from "./navbar";
import "./layout.scss";
import { Dialog, Toast } from "@taroify/core";

interface LayoutProps {
  children?: ReactNode;
  brother?: ReactNode;
  title: string;
  navbar?: ReactNode;
  padding?: string;
  onRefresherRefresh?: () => void;
  refresherEnabled?: boolean;
}

export default function Layout(props: LayoutProps) {
  const [refresherTriggered, setRefresherTriggered] = useState(false);

  return (
    <View className="layout">
      <Navbar title={props.title}>{props.navbar}</Navbar>
      <Toast id="toast" />
      <Dialog id="dialog" />
      <View
        className="main"
        style={{
          padding: props.padding || "30rpx",
        }}
      >
        <ScrollView
          refresherEnabled={props.refresherEnabled}
          scrollY
          scrollX={false}
          scrollWithAnimation
          showScrollbar={false}
          bounces
          refresherTriggered={refresherTriggered}
          enhanced
          refresherBackground="#F3F4F6"
          onRefresherRefresh={async () => {
            if (props.onRefresherRefresh !== undefined) {
              setRefresherTriggered(true);
              await props.onRefresherRefresh();
              setRefresherTriggered(false);
            }
          }}
          style={{
            height: "83vh",
          }}
        >
          {props.children}
        </ScrollView>
      </View>
      {props.brother}
    </View>
  );
}
