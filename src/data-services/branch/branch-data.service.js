import http from "../../utils/http-common";

const controller = "branch";

const getBranchesByStoreIdAsync = (storeId) => {
  return http.get(`/${controller}/get-branches-by-store-id/${storeId}`);
};

const getBranchesByAccountIdAsync = (storeId, accountId) => {
    return http.get(`/${controller}/get-branches-by-account-id?storeId=${storeId}&accountId=${accountId}`);
  };
  

const branchDataService = {
  getBranchesByStoreIdAsync,
  getBranchesByAccountIdAsync
};
export default branchDataService;
