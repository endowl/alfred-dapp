import React, {Fragment} from "react";
import { Redirect } from "react-router-dom";
import sessionsRoutes from "./views/sessions/sessionsRoutes";
// import AuthGuard from "./auth/AuthGuard";
import dappRoutes from "./views/dapp/dappRoutes";

// import { renderRoutes } from "react-router-config";
import GullLayout from "app/GullLayout/GullLayout";

const redirectRoute = [
  {
    path: "/",
    exact: true,
    component: () => <Redirect to="/dapp/new-estate" />
  }
];

const errorRoute = [
  {
    component: () => <Redirect to="/session/404" />
  }
];

const Root = ({ route }) => (
    <Fragment>
      <GullLayout route={route}></GullLayout>
    </Fragment>
);

const routes = [
  ...sessionsRoutes,
  {
    path: "/",
    // component: AuthGuard,
    component: Root,
    routes: [
      ...dappRoutes,
      ...redirectRoute,
      ...errorRoute
    ]
  }
];

export default routes;
