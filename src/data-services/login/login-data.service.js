import http from "../../utils/http-common";

const controller = "login";

const authenticate = (data) => {
  return http.post(`/${controller}/authenticate`, data);
};

const loginDataService = {
  authenticate,
};
export default loginDataService;
