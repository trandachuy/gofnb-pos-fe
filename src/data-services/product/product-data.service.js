import http from "../../utils/http-common";

const controller = "product";

const getProductCategoriesActivatedAsync = () => {
  return http.get(`/${controller}/get-product-categories-activated`);
};

const getProductsInPlatformByCategoryIdAsync = (data) => {
  return http.get(
    `/${controller}/get-products-in-platform-by-product-category-id?productCategoryId=${data.productCategoryId}&platform=${data.platform}`
  );
};

const getProductToppingsAsync = () => {
  return http.get(`/${controller}/get-product-toppings`);
};

const getProductDetailByIdAsync = (data) => {
  return http.get(`/${controller}/get-product-detail-by-id/${data}`);
};

const getToppingsByProductIdAsync = (data) => {
  return http.get(`/${controller}/get-toppings-by-product-id/${data}`);
};

const calculateProductCartItemAsync = (data) => {
  return http.post(`/${controller}/calculate-product-cart-item`, data);
};

const productDataService = {
  getProductCategoriesActivatedAsync,
  getProductsInPlatformByCategoryIdAsync,
  getProductToppingsAsync,
  getToppingsByProductIdAsync,
  getProductDetailByIdAsync,
  calculateProductCartItemAsync,
};

export default productDataService;
