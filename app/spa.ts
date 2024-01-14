/// <reference types="vinxi/types/server" />
import createCone from "../gogh/router";
// import van from "vanjs-core";
import van from "vanjs-core";
import { createContext } from "../gogh/context";

export const clientContext = createContext(van);

van.add(document.getElementById("main")!, clientContext.routerElement);
