import { VanObj, State } from "mini-van-plate/shared";
// import { clientContext } from "../client";
// const { link } = clientContext;

interface Props {
  van: VanObj;
  params: any;
  query: any;
  context: any;
}

export default ({ van, context }: Props) => {
  const { button, main } = van.tags;
  const { link } = context;

  return main(
    { id: "main" },
    "this is main",
    button({ onClick: () => alert("Hello from 🍦VanJS") }, "Hello"),
    link({ name: "/asdf" }, "asdf")
  );
};

export const metadata = {
  title: "zxcv",
};
