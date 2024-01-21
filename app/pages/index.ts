import { VanObj, State } from "mini-van-plate/shared";
import van from "mini-van-plate/van-plate";
import layout from "./layout";

interface Props {
  van: VanObj;
  params: any;
  query: any;
  context: any;
}

export default ({ van, params, query, context }: Props) => {
  const { button, div } = van.tags;
  const { link } = context;

  return layout(
    { van },
    div(
      { id: "main", class: "bg-zinc-200" },
      "this is main",
      button({ onclick: () => alert("Hello from 🍦VanJS") }, " Hello "),
      link({ name: "/asdf" }, "asdf")
    )
  );
};

export const metadata = {
  title: "index",
};
