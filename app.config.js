import { createApp, resolve } from "vinxi";
import { spaRouter } from "@vinxi/router/spa";
import { serverFunctions } from "@vinxi/server-functions/plugin";
import { publicDir } from "@vinxi/router/static";
import esbuild from "esbuild";
import { parse } from "es-module-lexer";

import {
  BaseFileSystemRouter,
  cleanPath,
  analyzeModule,
} from "vinxi/fs-router";

export function analyseModule(src) {
  return parse(
    esbuild.transformSync(fs.readFileSync(src, "utf-8"), {
      jsx: "transform",
      format: "esm",
      loader: "ts",
    }).code,
    src
  );
}

class VanFileSystemRouter extends BaseFileSystemRouter {
  toPath(src) {
    const routePath = cleanPath(src, this.config)
      // remove the initial slash
      .slice(1)
      .replace(/index$/, "")
      .replace(/\[([^\/]+)\]/g, (_, m) => {
        if (m.length > 3 && m.startsWith("...")) {
          return `*${m.slice(3)}`;
        }
        if (m.length > 2 && m.startsWith("[") && m.endsWith("]")) {
          return `:${m.slice(1, -1)}?`;
        }
        return `:${m}`;
      });

    return routePath?.length > 0 ? `/${routePath}` : "/";
  }

  toRoute(src) {
    let path = this.toPath(src);

    const [_, exports] = analyzeModule(src);
    const hasDefault = exports.find((e) => e.n === "default");
    const hasRouteData = exports.find((e) => e.n === "routeData");
    const hasMeta = exports.find((e) => e.n === "metadata");
    return {
      $component: hasDefault
        ? {
            src: src,
            pick: ["default", "$css"],
          }
        : undefined,
      $$data: hasRouteData
        ? {
            src: src,
            pick: ["routeData"],
          }
        : undefined,
      path,
      $title: hasMeta
        ? {
            src: src,
            pick: ["metadata"],
          }
        : "asdf",
      filePath: src,
    };
  }
}

function vanFileRouter(config) {
  return (router, app) =>
    new VanFileSystemRouter(
      {
        dir: resolve.absolute(config.dir, router.root),
        extensions: config.extensions ?? ["js", "jsx", "ts", "tsx"],
      },
      router,
      app
    );
}

export default createApp({
  routers: [
    // publicDir(),
    spaRouter({
      routes: vanFileRouter({ dir: "./app/pages" }),
      plugins: function () {
        return [serverFunctions.client()];
      },
    }),
    // {
    //   name: "client",
    //   mode: "build",
    //   handler: "./app/index.ts",
    //   routes: vanFileRouter({
    //     dir: "./app/pages",
    //   }),
    //   target: "browser",
    //   base: "/_build",
    // },
    // {
    //   name: "ssr",
    //   mode: "handler",
    //   handler: "./app/server.ts",
    //   routes: vanFileRouter({
    //     dir: "./app/pages",
    //   }),
    //   target: "server",
    // },
  ],
});
