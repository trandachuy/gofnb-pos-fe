import { PermissionKeys } from "constants/permission-key.constants";
import { DashboardPage } from "./dashboard/dashboard.page";
import { KitchenManagementPage } from "./kitchen/kitchen-management.page";
import PageNotFound from "./page-not-found/page-not-found.component";
import PageNotPermitted from "./page-not-found/page-restriction.component";
import SecondaryScreenPage from "./secondary-screen/secondary-screen.page";

let routes = [
  {
    key: "app.home",
    position: 0,
    path: "/",
    name: "Home",
    isMenu: false,
    exact: true,
    auth: true,
    permission: [],
    component: DashboardPage,
    child: [],
  },
  {
    key: "app.home.hide",
    focus: "app.home",
    position: 0,
    path: "/dashboard",
    name: "Home",
    isMenu: false,
    exact: true,
    auth: true,
    permission: [],
    component: DashboardPage,
    child: [],
  },
  {
    key: "app.kitchen",
    position: 0,
    path: "/kitchen",
    name: "Kitchen",
    isMenu: false,
    exact: true,
    auth: true,
    permission: [PermissionKeys.KITCHEN],
    component: KitchenManagementPage,
    child: [],
  },
  {
    key: "app.order.secondary-screen",
    position: 0,
    path: "/secondary-screen",
    name: "Secondary Screen",
    isMenu: false,
    exact: true,
    auth: false,
    permission: "public",
    component: SecondaryScreenPage,
    child: [],
  },
  {
    key: "app.order.secondary-screen.payment-successful",
    position: 0,
    path: "/secondary-screen/:tab",
    name: "Secondary Screen",
    isMenu: false,
    exact: true,
    auth: false,
    permission: "public",
    component: SecondaryScreenPage,
    child: [],
  },
];

// Loop through all the folder in pages and collect all the route.js files
// and add them to the routes array.
const context = require.context("./", true, /route.js$/);
context.keys().forEach((path) => {
  let objRoutes = context(`${path}`).default;
  if (objRoutes && objRoutes.length > 0) {
    objRoutes.forEach((route) => {
      routes.push(route);
    });
  } else {
    routes.push(objRoutes);
  }
});

routes = routes.sort((a, b) => a.position - b.position);
var uniqueRoutes = [...new Set(routes)];
routes = uniqueRoutes;

const pageNotPermitted = {
  key: "app.pageNotPermitted",
  position: 0,
  path: "/page-not-permitted",
  name: "Page not Permitted",
  isMenu: false,
  exact: true,
  auth: false,
  permission: "public",
  component: PageNotPermitted,
  child: [],
};

const pageNotFoundRoute = {
  key: "app.pageNoteFound",
  position: 0,
  path: "",
  name: "Page not found",
  isMenu: false,
  exact: true,
  auth: false,
  permission: "public",
  component: PageNotFound,
  child: [],
};

routes.push(pageNotPermitted);
routes.push(pageNotFoundRoute);
export default routes;
