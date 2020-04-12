import { lazy } from "react";
import DappNewEstate from "./DappNewEstate";

// const DappHome = lazy(() => import("./DappHome"));
const DappEstate = lazy(() => import("./DappEstate"));

const dappRoutes = [
    // {
    //     path: "/dapp/home",
    //     component: DappHome
    // },
    {
        path: "/dapp/estate/:address?",
        component: DappEstate
    },
    {
        path: "/dapp/new-estate",
        component: DappNewEstate
    }
];

export default dappRoutes;
