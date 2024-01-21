import { Route } from "vinxi/fs-router";
import fileRoutes from "vinxi/routes";

function defineRoutes(fileRoutes: Route[]) {
  function processRoute(
    routes: Route[],
    route: Route,
    id: string,
    full: string
  ) {
    const parentRoute = Object.values(routes).find((o) => {
      return id.startsWith(o.id + "/");
    });

    if (!parentRoute) {
      routes.push({ ...route, id, path: id.replace(/\/\([^)/]+\)/g, "") });
      return routes;
    }
    processRoute(
      parentRoute.children || (parentRoute.children = []),
      route,
      id.slice(parentRoute.id.length),
      full
    );

    return routes;
  }

  return fileRoutes
    .sort((a, b) => a.path.length - b.path.length)
    .reduce((prevRoutes, route) => {
      if (route.path.includes("layout")) return prevRoutes;
      return processRoute(prevRoutes, route, route.path, route.path);
    }, []);
}

export const routes = defineRoutes(fileRoutes);
console.log(routes.map((x) => x.path));
