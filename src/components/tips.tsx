import { View } from "@tarojs/components";
import { ReactNode } from "react";
import "./tips.scss";

export default function Tips({ children }: { children: ReactNode }) {
  return <View className="tips">{children}</View>;
}
