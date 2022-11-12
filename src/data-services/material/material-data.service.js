import http from "../../utils/http-common";

const controller = "material";

const getAllMaterialManagementsAsync = () => {
  return http.get(`/${controller}/get-all-material-management`);
};

const getMaterialsFromOrdersCurrentShiftAsync = () => {
  return http.get(`/${controller}/get-materials-from-orders-current-shift`);
};

const getMaterialsByBranchIdAsync = (branchId) => {
  return http.get(`/${controller}/get-materials-by-branch-id?branchId=${branchId}`);
};

const materialDataService = {
  getMaterialsByBranchIdAsync,
  getAllMaterialManagementsAsync,
  getMaterialsFromOrdersCurrentShiftAsync,
};
export default materialDataService;
