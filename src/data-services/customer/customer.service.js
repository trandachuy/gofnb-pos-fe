import http from "../../utils/http-common";

const controller = "customer";

const getPosCustomersAsync = (keySearch) => {
  return http.get(`/${controller}/get-pos-customers?keySearch=${keySearch}`);
};

const getCustomerByIdAsync = (id) => {
  return http.get(`/${controller}/get-customer-by-id?id=${id}`);
};

const createCustomerAsync = (data) => {
  return http.post(`/${controller}/create-customer`, data);
};

const updateCustomerAsync = (data) => {
  return http.put(`/${controller}/update-customer`, data);
};

const customerDataService = {
  getPosCustomersAsync,
  getCustomerByIdAsync,
  createCustomerAsync,
  updateCustomerAsync,
};

export default customerDataService;
