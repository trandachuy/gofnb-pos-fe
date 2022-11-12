import http from "../../utils/http-common";

const controller = "language";

const getListLanguageNotContainStoreIdAsync = () => {
  return http.get(`/${controller}/get-list-language-not-contain-store-id`);
};

const createLanguageStoreAsync = data => {
  return http.post(`/${controller}/create-language-store`, data);
};

const getListLanguageStoreByStoreIdAsync = () => {
  return http.get(`/${controller}/get-list-language-store-by-store-id`);
};

const updateIsPublishByIdAsync = data => {
  return http.put(`/${controller}/update-is-publish-by-id`, data);
};

const getListLanguageByStoreIdAndIsPublishAsync = () => {
  return http.get(`/${controller}/get-list-language-by-store-id-and-is-publish`);
};

const languageDataService = {
  getListLanguageNotContainStoreIdAsync,
  createLanguageStoreAsync,
  getListLanguageStoreByStoreIdAsync,
  updateIsPublishByIdAsync,
  getListLanguageByStoreIdAndIsPublishAsync,
};

export default languageDataService;
