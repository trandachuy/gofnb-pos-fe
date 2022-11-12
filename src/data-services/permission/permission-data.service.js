import http from "../../utils/http-common";

const controller = "permission";

const getPermissionsAsync = () => {
  return http.get(`/${controller}/get-permissions`);
};

const permissionService = {
  getPermissionsAsync,
};
export default permissionService;
