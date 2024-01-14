import { VanObj, State } from "mini-van-plate/shared";
import { clientContext } from "./spa";
const { link } = clientContext;

interface Props {
  van: VanObj;
  id?: string;
  init?: number;
  buttonStyle?: string | State<string>;
}

export default ({ van }: Props) => {
  const { button, main } = van.tags;

  return main(
    { id: "main" },
    "this is main",
    button({ onClick: () => alert("Hello from 🍦VanJS") }, "Hello"),
    link({ name: "/asdf" }, "asdf")
  );
};
