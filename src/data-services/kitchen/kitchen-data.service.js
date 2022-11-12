import http from "../../utils/http-common";

const controller = "kitchen";

const getKitchenOrderSessionAsync = () => {
  return http.get(`/${controller}/get-kitchen-order-sessions`);
};

const updateOrderSessionStatusAsync = (data) => {
  return http.put(`/${controller}/update-order-session-status`, data);
};

const updateOrderItemStatusAsync = (data) => {
  return http.put(`/${controller}/update-order-item-status`, data);
};

const kitchenDataService = {
  getKitchenOrderSessionAsync,
  updateOrderSessionStatusAsync,
  updateOrderItemStatusAsync,
};

export default kitchenDataService;
