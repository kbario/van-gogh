import { metadata } from "../app/pages/index";
import { VanObj } from "mini-van-plate/shared";
import { routes } from "./routes";
import createCone from "./router";

export function createContext(
  van: VanObj,
  isServer: boolean,
  currentRoute?: string
) {
  function createRoute(route) {
    return {
      ...route,
      path: route.path,
      name: route.path,
      title: async () => {
        if (import.meta.env.DEV) {
          const m =
            import.meta.env?.MANIFEST?.["client"] || window.MANIFEST["client"];
          return (await m.inputs[route.$title.src].import())["metadata"][
            "title"
          ];
        } else {
          return (await route?.["$title"]?.import())["metadata"]?.["title"];
        }
      },
      callable: async () => {
        if (import.meta.env.DEV) {
          const m =
            import.meta.env?.MANIFEST?.["client"] || window.MANIFEST["client"];
          return await m.inputs[route.$component.src].import();
        } else {
          return await route.$component?.import();
        }
      },
      // ...route,
      // component: async () => await route.$component.import(),
      // data: route.$$data ? route.$$data.require().routeData : undefined,
      // children: route.children ? route.children.map(createRoute) : undefined,
    };
  }

  const pageRoutes = routes
    .map((x) => createRoute(x))
    .sort((a, b) => b.name?.length - a.name?.length);

  return createCone(
    van,
    van.tags.div({ id: "layout" }),
    pageRoutes,
    isServer,
    currentRoute
  ); // document.getElementById("layout"), pageRoutes);
}
