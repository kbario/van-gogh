import van from "vanjs-core";
import app from "./app";
import "vinxi/client";

const a = await app({
  van,
  isServer: false,
});
van.hydrate(document.getElementById("body")!, () => a);
