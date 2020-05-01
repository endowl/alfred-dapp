import { lazy } from "react";
// import Stake from "./Stake";

const Stake = lazy(() => import("./Stake"));

const canvasRoutes = [

    {
        path: "/canvas/stake",
        component: Stake
    },
];

export default canvasRoutes;
