import van from "vanjs-core";
import app from "./app";
import "vinxi/client";

const { div } = van.tags;
console.log(import.meta.env.VITE_IS_SSR);
import.meta.env.VITE_IS_SSR === "true"
  ? van.hydrate(document.getElementById("body")!, (dom) =>
      app(
        {
          van,
          isServer: false,
        },
        div("ssr")
      )
    )
  : van.add(document.getElementById("body")!, (dom) =>
      app(
        {
          van,
          isServer: false,
        },
        div("csr")
      )
    );
