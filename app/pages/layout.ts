import { VanObj, State } from "mini-van-plate/shared";

interface Props {
  van: VanObj;
  params?: any;
  query?: any;
  context?: any;
}

export default ({ van }: Props, ...children) => {
  const { button, main, div } = van.tags;

  return div(
    { id: "layout-4", class: "bg-zinc-100 p-4" },
    "this is a layout ",
    children
  );
};
