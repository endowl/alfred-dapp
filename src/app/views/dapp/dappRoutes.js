import { lazy } from "react";

const DappHome = lazy(() => import("./DappHome"));

const dappRoutes = [
  {
    path: "/dapp",
    component: DappHome
  }
];

export default dappRoutes;
