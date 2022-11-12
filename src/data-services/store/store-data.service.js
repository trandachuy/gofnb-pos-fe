import http from "../../utils/http-common";

const controller = "store";

const getPrepareAddressDataAsync = () => {
  return http.get(`/${controller}/get-prepare-address-data`);
};

const getStoreKitchenConfigByStoreIdAsync = () => {
  return http.get(`/${controller}/get-store-kitchen-config-by-store-id`);
};

const getPrepareStoreDataForOrderDeliveryAsync = () => {
  return http.get(`/${controller}/get-prepare-store-data-for-order-delivery`);
};

const getStoreInformationAsync = () => {
  return http.get(`/${controller}/get-store-info`);
};

const storeDataService = {
  getPrepareAddressDataAsync,
  getStoreKitchenConfigByStoreIdAsync,
  getPrepareStoreDataForOrderDeliveryAsync,
  getStoreInformationAsync,
};
export default storeDataService;
