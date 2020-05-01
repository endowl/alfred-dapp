import React, {Fragment} from "react";
import { Redirect } from "react-router-dom";
import dashboardRoutes from "./views/dashboard/dashboardRoutes";
import uiKitsRoutes from "./views/ui-kits/uiKitsRoutes";
import formsRoutes from "./views/forms/formsRoutes";
import sessionsRoutes from "./views/sessions/sessionsRoutes";
// import AuthGuard from "./auth/AuthGuard";
import widgetsRoute from "./views/widgets/widgetsRoute";
import chartsRoute from "./views/charts/chartsRoute";
import dataTableRoute from "./views/dataTable/dataTableRoute";
import extraKitsRoutes from "./views/extra-kits/extraKitsRoutes";
import pagesRoutes from "./views/pages/pagesRoutes";
import iconsRoutes from "./views/icons/iconsRoutes";
import invoiceRoutes from "./views/app/invoice/invoiceRoutes";
import inboxRoutes from "./views/app/inbox/inboxRoutes";
import chatRoutes from "./views/app/chat/chatRoutes";
import calendarRoutes from "./views/app/calendar/calendarRoutes";
import taskManagerRoutes from "./views/app/task-manager/taskManagerRoutes";
import ecommerceRoutes from "./views/app/ecommerce/ecommerceRoutes";
import contactRoutes from "./views/app/contact/contactRoutes";
import dappRoutes from "./views/dapp/dappRoutes";
import canvasRoutes from "./views/canvas/canvasRoutes";
import GullLayout from "app/GullLayout/GullLayout";

const redirectRoute = [
  {
    path: "/",
    exact: true,
    component: () => <Redirect to="/canvas/stake" />
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
      ...canvasRoutes,
      ...dashboardRoutes,
      ...uiKitsRoutes,
      ...formsRoutes,
      ...widgetsRoute,
      ...chartsRoute,
      ...dataTableRoute,
      ...extraKitsRoutes,
      ...pagesRoutes,
      ...iconsRoutes,
      ...invoiceRoutes,
      ...inboxRoutes,
      ...chatRoutes,
      ...taskManagerRoutes,
      ...calendarRoutes,
      ...ecommerceRoutes,
      ...contactRoutes,
      ...redirectRoute,
      ...errorRoute,
    ]
  }
];

export default routes;
