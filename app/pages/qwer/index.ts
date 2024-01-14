import { VanObj, State } from "mini-van-plate/shared";
import { clientContext } from "../../spa";
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

  return div("this is qwer", link({ name: "/" }, "index"));
};

export const metadata = {
  title: "qwer",
};
