import { VanObj } from "mini-van-plate/shared";
const parametersPattern = /(:[^\/]+)/g;

function isServer() {
  return typeof window === "undefined";
}

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

  dispatch(url, _context) {
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
    console;
    // parse route params
    const _params = route?.params.reduce((acc, param, index) => {
      acc[param] = decodeURIComponent(matches[index + 1]);
      return acc;
    }, {});

    // call route handler or throw error
    if (route) {
      route.handler({ _params, _query, _context });
      return route;
    } else {
      throw new Error(`Route not found for ${url}`);
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

function createCone(
  van: VanObj,
  routerElement,
  routes,
  defaultNavState?,
  routerConfig?
) {
  const currentPage = van.state("");

  const isCurrentPage = (pageName) =>
    van.derive(() => currentPage.val === pageName);

  // router
  const router = new Router(routerConfig);

  routes.forEach(async (route) => {
    const title = await route.title();
    router.add(
      route.name,
      route.path,
      route.backend,
      function ({ _params, _query, _context }) {
        currentPage.val = route.name;
        if (route.title && !isServer()) window.document.title = title;

        const params = _params || {};
        const query = _query || {};
        const context = _context || {};

        route
          .callable()
          .then((page) => {
            if ("default" in page) {
              console.log("inside the router 1");
              return routerElement.replaceChildren(
                page.default({ van, params, query, context })
              );
            } else {
              console.log("inside the router 2");

              return routerElement.replaceChildren(
                page(_params, _query, _context)
              );
            }
          })
          .catch((error) => console.error("error changing page", error));
      }
    );
  });

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

  // window navigation events
  if (!isServer()) {
    window.onpopstate = (event) => {
      router.dispatch(event.target.location.href);
    };

    window.onload = (event) => {
      setNavState(window.history.state);
      router.dispatch(event.target.location.href);
      if (typeof getNavState() === "undefined") setNavState(null);
    };
  }

  // navigation functions
  const navigate = (routeName, options) => {
    const { params, query, navState, context } = options;
    const url = router.navUrl(routeName, params, query);

    if (typeof navState !== "undefined") setNavState(navState);
    history.pushState(getNavState(), "", url);

    if (typeof options.dispatch === "undefined" || options.dispatch === true) {
      router.dispatch(url, context);
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
        onclick: (event) => {
          event.preventDefault();
          navigate(name, { params, query, navState, context });
        },
        ...otherProps,
      },
      children
    );
  }

  return {
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
}

export default createCone;
