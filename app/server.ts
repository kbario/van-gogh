/// <reference types="vinxi/types/server" />
// import van from "vanjs-core";
import jsdom from "jsdom";
import van from "mini-van-plate";
import { updateStyles } from "vinxi/css";
import { eventHandler } from "vinxi/server";

const dom = new jsdom.JSDOM("");
const vanO = van.vanWithDoc(dom.window.document);
const { html, tags } = vanO;
const { a, body, head, script, button, input, li, p, ul } = tags;

import { routes } from "../gogh/routes";
import app from "./app";

export const createAssets = (assets) => {
  const styles = assets.filter((asset) => asset.tag === "style");

  if (typeof window !== "undefined" && import.meta.hot) {
    import.meta.hot.on("css-update", (data) => {
      updateStyles(styles, data);
    });
  }
  return assets.map((asset) => renderVanTag(asset));
};

export function renderVanTag(asset) {
  let { tag, attrs: { key, ...attrs } = { key: undefined }, children } = asset;
  return tags[tag]({ ...attrs }, children);
}

export default eventHandler(async (event) => {
  const clientManifest = import.meta.env.MANIFEST["client"];
  const assets = await clientManifest.inputs[clientManifest?.handler].assets();
  const manifestJson = await clientManifest.json();

  return import.meta.env.VITE_IS_SSR === "true"
    ? van.html(
        head(
          ...createAssets(assets),

          script(
            `window.manifest = JSON.parse(decodeURIComponent("${encodeURIComponent(
              JSON.stringify(manifestJson)
            )}"))`
          ),
          script({
            type: "module",
            src: clientManifest.inputs[clientManifest.handler].output.path,
          })
        ),
        body(
          { id: "body" },
          app({ van: vanO, isServer: true, currentRoute: event.path }, "ssr")
        )
        // JSON.stringify(pageRoutes)
      )
    : `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script>window.manifest = JSON.parse(decodeURIComponent("${encodeURIComponent(
      JSON.stringify(manifestJson)
    )}"))</script>
    <script type="module" src="${
      clientManifest.inputs[clientManifest.handler].output.path
    }"></script>
    <title>Document</title>
</head>
<body id="body">
    <script type="module" src="./app/client.ts"></script>
</body>
</html>
  `;
});
