import http from "../../utils/http-common";

const controller = "order";

const getAllPosOrderDetailByOrderIdAsync = (id) => {
  return http.get(`/${controller}/get-order-detail-by-id?orderId=${id}`);
};

const getPOSOrderByIdForPaymentAsync = (id) => {
  return http.get(`/${controller}/get-pos-order-by-id-for-payment/${id}`);
};

const getPrepareOrderEditDataRequestAsync = (orderId) => {
  return http.get(`/${controller}/get-prepare-order-edit-data/${orderId}`);
};

const getDefaultBillConfigurationAsync = () => {
  return http.get(`/${controller}/get-default-bill-configuration`);
};

const getAllPosOrderByBranchAsync = (data) => {
  return http.post(`/${controller}/get-all-pos-order-by-branch`, data);
};

const createPOSOrderAsync = (data) => {
  return http.post(`/${controller}/create-pos-order`, data);
};

const printOrderStampDataAsync = (data) => {
  return http.post(`/${controller}/print-order-stamp-data`, data);
};

const payOrderAsync = (data) => {
  return http.put(`/${controller}/pay-order`, data);
};

const updateOrderStatusAsync = (data) => {
  return http.put(`/${controller}/update-order-status`, data);
};

const checkPreparedStatusForOrderItemByOrderIdAsync = (orderId, productId) => {
  return http.get(`/${controller}/check-prepared-status-order-item/${orderId}/${productId}`);
};

const checkOrderItemStatusFromKitchenByOrderIdAsync = (orderId) => {
  return http.get(`/${controller}/check-order-item-status-from-kitchen-by-order-id/${orderId}`);
};

const getOrderDetailToPrint = (orderId) => {
  return http.get(`/${controller}/get-order-detail-to-print/${orderId}`);
};

const checkAddProductForOrder = (data) => {
  return http.post(`/${controller}/check-add-product-for-order`, data);
};

const orderDataService = {
  getPrepareOrderEditDataRequestAsync,
  getAllPosOrderByBranchAsync,
  getAllPosOrderDetailByOrderIdAsync,
  printOrderStampDataAsync,
  payOrderAsync,
  getPOSOrderByIdForPaymentAsync,
  createPOSOrderAsync,
  updateOrderStatusAsync,
  getDefaultBillConfigurationAsync,
  checkPreparedStatusForOrderItemByOrderIdAsync,
  getOrderDetailToPrint,
  checkAddProductForOrder,
  checkOrderItemStatusFromKitchenByOrderIdAsync,
};

export default orderDataService;
