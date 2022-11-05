import { PropsWithChildren } from "react";
import "./app.scss";
import "./interceptor";

export default function App({ children }: PropsWithChildren<{}>) {
  return children;
}
