/// <reference types="vinxi/types/server" />
import createCone from "../gogh/router";
// import van from "vanjs-core";
import van from "mini-van-plate/van-plate";
import { eventHandler } from "vinxi/server";

export const context = createContext(van);
const { head, link, div, title, meta, body, button, script } = van.tags;
export default eventHandler(async (event) => {
  return van.html(
    head(
      title(context.currentPage.title),
      script(
        { type: "importmap" },
        '{"imports": {"vanjs-core": "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.2.7.min.js"}}'
      ),
      script({ type: "module", src: `/app/client.js`, defer: true })
    ),
    body(context.routerElement)
    // JSON.stringify(pageRoutes)
  );
});

import Main from "./pages/zxcv";
import { createContext } from "../gogh/context";
