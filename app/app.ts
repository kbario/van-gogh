import { VanObj } from "mini-van-plate/shared";
import { createContext } from "../gogh/context";

import "./style.css";

interface Props {
  van: VanObj;
  isServer: boolean;
  currentRoute?: string;
}

export default async (
  { van, isServer, currentRoute }: Props,
  children?: unknown
) => {
  const { main } = van.tags;
  const context = await createContext(van, isServer, currentRoute);

  return main(context.routerElement, children);
};
