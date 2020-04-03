import { lazy } from "react";

const DappHome = lazy(() => import("./DappHome"));
const DappEstate = lazy(() => import("./DappEstate"));

const dappRoutes = [
    {
        path: "/dapp/home",
        component: DappHome
    },
    {
        path: "/dapp/estate",
        component: DappEstate
    }
];

export default dappRoutes;
