import { VanObj, State } from "mini-van-plate/shared";
import { clientContext } from "../spa";
const { link } = clientContext;

interface Props {
  van: VanObj;
  params: any;
  query: any;
  context: any;
}

export default ({ van, params, query, context }: Props) => {
  const { button, main, div } = van.tags;
  console.log(params, query, context);

  return main(
    { id: "main" },
    "this is main",
    button({ onclick: () => alert("Hello from 🍦VanJS") }, "Hello"),
    link({ name: "/asdf" }, "asdf")
  );
};

export const metadata = {
  title: "index",
};
