import { VanObj } from "mini-van-plate/shared";
import { createContext } from "../gogh/context";

import "./style.css";

interface Props {
  van: VanObj;
  isServer: boolean;
  currentRoute?: string;
}

export default ({ van, isServer, currentRoute }: Props, children: unknown) => {
  const { button, main, div } = van.tags;
  const context = createContext(van, isServer, currentRoute);
  const { link } = context;

  return main(context.routerElement, children);
};

export const metadata = {
  title: "qwer index",
};
