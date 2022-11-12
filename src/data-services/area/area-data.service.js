import http from "../../utils/http-common";

const controller = "area";

const getAllAreasInUseAsync = () => {
  return http.get(`/${controller}/get-all-areas-using`);
};

const getAllAreasActivatedAsync = () => {
  return http.get(`/${controller}/get-all-areas-activated`);
};

const areaDataService = {
  getAllAreasInUseAsync,
  getAllAreasActivatedAsync,
};

export default areaDataService;
