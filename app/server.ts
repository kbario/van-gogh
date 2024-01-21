/// <reference types="vinxi/types/server" />
// import van from "vanjs-core";
import van from "mini-van-plate/van-plate";
import { updateStyles } from "vinxi/css";
import { eventHandler } from "vinxi/server";

import { routes } from "../gogh/routes";
import app from "./app";

const { head, link, div, title, meta, body, button, script } = van.tags;

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
  return van.tags[tag]({ ...attrs }, children);
}

export default eventHandler(async (event) => {
  const clientManifest = import.meta.env.MANIFEST["client"];
  const assets = await clientManifest.inputs[clientManifest?.handler].assets();
  const manifestJson = await clientManifest.json();
  const a = await app({ van, isServer: true, currentRoute: event.path });

  return van.html(
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
    body({ id: "body" }, a)
  );
});
