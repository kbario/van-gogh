import { metadata } from "../app/pages/index";
import { VanObj } from "mini-van-plate/shared";
import { routes } from "./routes";
import createCone from "./router";

export function createContext(van: VanObj, mode: "client" | "ssr") {
  function createRoute(route) {
    return {
      ...route,
      path: route.path,
      name: route.path,
      title: async () => {
        if (import.meta.env.DEV) {
          const m = import.meta.env.MANIFEST[mode];
          const a = (await m.inputs[route.$title.src].import())["metadata"][
            "title"
          ];
          return a;
        } else {
          const mod = await route.$component.import();
          return mod["metadata"]["title"];
        }
      },
      callable: async () => {
        if (import.meta.env.DEV) {
          const m = import.meta.env.MANIFEST[mode];
          const a = await m.inputs[route.$component.src].import();
          return a;
        } else {
          const mod = await route.$component.import();
          return mod;
        }
      },
      // ...route,
      // component: async () => await route.$component.import(),
      // data: route.$$data ? route.$$data.require().routeData : undefined,
      // children: route.children ? route.children.map(createRoute) : undefined,
    };
  }

  const pageRoutes = routes
    .map(createRoute)
    .sort((a, b) => b.name.length - a.name.length);

  return createCone(van, document.getElementById("layout"), pageRoutes);
}
