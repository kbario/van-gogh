import { routes } from "./routes";
import { VanObj } from "mini-van-plate/shared";
const parametersPattern = /(:[^\/]+)/g;

class Router {
  constructor(config) {
    this.routes = [];
    this.prefix = (config && config.prefix) || "";
    this.backendPrefix = (config && config.backendPrefix) || "";
  }

  add(name, path, backend, handler) {
    const matcher = new RegExp(
      path.replace(parametersPattern, "([^/]+)") + "$"
    );
    const params = (path.match(parametersPattern) || []).map((x) =>
      x.substring(1)
    );
    this.routes.push({ name, path, handler, backend, matcher, params });
  }

  async dispatch(url, _context) {
    // strip prefix and split path from query string
    const urlSplit = url.replace(new RegExp("^" + this.prefix), "").split("?");
    const queryString = urlSplit[1] || "";

    // parse query string
    const _query = queryString
      .split("&")
      .filter((p) => p.length)
      .reduce((acc, part) => {
        const [key, value] = part.split("=");
        acc[decodeURIComponent(key)] = decodeURIComponent(value);
        return acc;
      }, {});

    // find route
    let matches;
    const route = this.routes.find(
      (r) => (matches = urlSplit[0].match(r.matcher))
    );
    // parse route params
    const _params = route?.params.reduce((acc, param, index) => {
      acc[param] = decodeURIComponent(matches[index + 1]);
      return acc;
    }, {});

    // call route handler or throw error
    if (route) {
      return await route.handler({ _params, _query, _context });
    } else {
      // throw new Error(`Route not found for ${url}`);
    }
  }

  _formatUrl(routeName, isBackend, params = {}, query = {}) {
    const route = this.routes.find((r) => r.name === routeName);

    if (!route) {
      throw new Error(`Route ${routeName} not found`);
    }

    const queryString = Object.keys(query)
      .map((k) => [k, query[k]])
      .map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v))
      .join("&");

    const prefix = isBackend === true ? this.backendPrefix : this.prefix;
    const routePath = isBackend && route.backend ? route.backend : route.path;

    const path =
      prefix +
      routePath.replace(parametersPattern, function (match) {
        return params[match.substring(1)];
      });

    return queryString.length ? path + "?" + queryString : path;
  }

  navUrl(routeName, params = {}, query = {}) {
    return this._formatUrl(routeName, false, params, query);
  }

  backendUrl(routeName, params = {}, query = {}) {
    return this._formatUrl(routeName, true, params, query);
  }
}

async function createCone(
  van: VanObj,
  routes,
  isServer: boolean,
  currentRoute: string,
  defaultNavState?,
  routerConfig?
) {
  const currentPage = van.state("");

  const isCurrentPage = (pageName) =>
    van.derive(() => currentPage.val === pageName);

  // router
  const router = new Router(routerConfig);

  // nav state
  const _defaultNavState =
    typeof defaultNavState === "undefined" ? null : defaultNavState;
  const navState = van.state(_defaultNavState);

  const getNavState = () => navState.val;

  const setNavState = (newState) => {
    if (newState === null) {
      navState.val = defaultNavState;
    } else {
      navState.val = newState;
    }
  };

  // navigation functions
  const navigate = async (routeName, options) => {
    const { params, query, navState, context } = options;
    const url = router.navUrl(routeName, params, query);

    if (typeof navState !== "undefined") setNavState(navState);
    history.pushState(getNavState(), "", url);

    if (typeof options.dispatch === "undefined" || options.dispatch === true) {
      router
        .dispatch(url, context)
        .then((comp) => contextReturn.routerElement.replaceChildren(comp));
    }

    return url;
  };

  const pushHistory = (routeName, options) => {
    options.dispatch = false;
    return navigate(routeName, options);
  };

  // nav link component
  function link(props, ...children) {
    const { name, target, params, query, navState, ...otherProps } = props;

    const context = otherProps.context || {};

    return van.tags.a(
      {
        "aria-current": van.derive(() =>
          isCurrentPage(name).val ? "page" : ""
        ),
        href: router.navUrl(name, params, query),
        target: target || "_self",
        role: "link",
        class: otherProps.class || "router-link",
        onclick: async (event) => {
          event.preventDefault();
          await navigate(name, { params, query, navState, context });
        },
        ...otherProps,
      },
      children
    );
  }

  routes.forEach((route) => {
    router.add(
      route.name,
      route.path,
      route.backend,
      async function ({ _params, _query, _context }) {
        currentPage.val = route.name;
        if (route.title && !isServer)
          window.document.title = await route.title(); //.then((x) => x);

        const params = _params || {};
        const query = _query || {};
        const context = {
          link,
          ..._context,
        };

        const page = await route.callable();
        return "default" in page
          ? page.default({ van, params, query, context })
          : page({ van, params, query, context });
      }
    );
  });

  const routerElement = isServer
    ? await (async () => {
        const comp = await router.dispatch(currentRoute);
        return van.tags.div({ id: "layout" }, comp);
      })()
    : van.tags.div({ id: "layout" });

  const contextReturn = {
    routerElement,
    currentPage,
    navUrl: router.navUrl,
    backendUrl: router.backendUrl,
    navState,
    getNavState,
    setNavState,
    navigate,
    pushHistory,
    isCurrentPage,
    link,
  };
  // window navigation events
  if (!isServer) {
    window.onpopstate = (event) =>
      router
        .dispatch(event.target.location.href)
        .then((comp) => contextReturn.routerElement.replaceChildren(comp));

    window.onload = (event) =>
      router.dispatch(event.target.location.href).then((comp) => {
        setNavState(window.history.state);
        contextReturn.routerElement.replaceChildren(comp);
        if (typeof getNavState() === "undefined") setNavState(null);
      });
  }

  return contextReturn;
}

export default createCone;
