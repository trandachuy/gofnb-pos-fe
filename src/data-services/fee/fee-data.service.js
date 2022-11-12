import http from "../../utils/http-common";

const controller = "fee";

const getFeesActiveAsync = (orderType) => {
  return http.get(`/${controller}/get-fees-active?orderType=${orderType}`);
};

const feeDataService = {
  getFeesActiveAsync,
};

export default feeDataService;
