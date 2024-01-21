import { VanObj, State } from "mini-van-plate/shared";
import van from "mini-van-plate/van-plate";

interface Props {
  van: VanObj;
  params: any;
  query: any;
  context: any;
}

export default ({ van, params, query, context }: Props) => {
  const { div } = van.tags;
  const { link } = context;

  return div("this is qwer/gelsa ", link({ name: "/qwer/koil" }, "index"));
};

export const metadata = {
  title: "qwer gelsa",
};
