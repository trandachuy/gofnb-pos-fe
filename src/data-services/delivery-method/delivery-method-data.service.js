import http from "../../utils/http-common";

const controller = "deliveryMethod";

const getDeliveryMethodsAsync = () => {
  return http.get(`/${controller}/get-all-delivery-method`);
};

const estimateAhamoveShippingFeeRequestAsync = (data) => {
  return http.post(`/${controller}/estimate-ahamove-shipping-fee`, data);
};

const calculateStoreShippingFeeRequestAsync = (data) => {
  return http.post(`/${controller}/calculate-store-shipping-fee`, data);
};

const deliveryMethodService = {
  getDeliveryMethodsAsync,
  estimateAhamoveShippingFeeRequestAsync,
  calculateStoreShippingFeeRequestAsync,
};

export default deliveryMethodService;
