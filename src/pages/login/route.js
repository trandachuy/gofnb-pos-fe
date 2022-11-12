import Login from ".";

const route = {
  key: "app.login",
  position: 0,
  path: "/login",
  icon: "fa fa-plus-square",
  name: "Login",
  isMenu: false,
  exact: true,
  auth: false,
  component: Login,
  child: [],
};
export default route;
