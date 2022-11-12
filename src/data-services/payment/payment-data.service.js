import http from "../../utils/http-common";

const controller = "Payment";

const getOrderStatusAsync = (requestId, orderId, amount) => {
  return http.get(`/${controller}/get-order-status?requestId=${requestId}&orderId=${orderId}&amount=${amount}`);
};

const getVNPayPaymentStatusAsync = ({ orderId, title, createDate }) => {
  return http.get(`/${controller}/get-vnpay-payment-status?orderId=${orderId}&title=${title}&createDate=${createDate}`);
};

const createNormalPaymentAsync = data => {
  return http.post(`/${controller}/create-normal-payment`, data);
};

const createPosPaymentAsync = data => {
  return http.post(`/${controller}/create-pos-payment`, data);
};

const createVNPayPaymentAsync = data => {
  return http.post(`/${controller}/create-vnpay-payment`, data);
};

const updateVnPayPaymentAsync = data => {
  return http.put(`/${controller}/vnpay-update-order-by-qr-code`, data);
};

const updateVnPayBySdkAsync = data => {
  return http.put(`/${controller}/vnpay-update-order-by-sdk`, data);
};

const paymentDataService = {
  getOrderStatusAsync,
  getVNPayPaymentStatusAsync,
  createNormalPaymentAsync,
  createPosPaymentAsync,
  createVNPayPaymentAsync,
  updateVnPayPaymentAsync,
  updateVnPayBySdkAsync
};

export default paymentDataService;
