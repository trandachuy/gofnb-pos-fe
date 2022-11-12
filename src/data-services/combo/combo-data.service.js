import http from "../../utils/http-common";

const controller = "combo";

const getCombosActivatedAsync = () => {
  return http.get(`/${controller}/get-combos-activated`);
};

const getProductsByComboIdAsync = (comboId) => {
  return http.get(`/${controller}/get-combo-by-id/${comboId}`);
};

const comboDataService = {
  getCombosActivatedAsync,
  getProductsByComboIdAsync,
};

export default comboDataService;
