import http from "../../utils/http-common";

const controller = "Slideshow";

const getSlideshowAsync = () => {
  return http.get(`/${controller}/get-slideshow`);
};

const getStoreBannersAsync = (bannerType) => {
  return http.get(`/${controller}/get-store-banners/${bannerType}`);
};

const slideshowDataService = {
  getSlideshowAsync,
  getStoreBannersAsync,
};

export default slideshowDataService;
