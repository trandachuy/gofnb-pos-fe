import http from "../../utils/http-common";

const controller = "shift";

const startShiftAsync = (data) => {
  return http.post(`/${controller}/start-shift`, data);
};

const getInitialAmountFromEndShiftByBranchIdAsync = (branchId) => {
  return http.get(`/${controller}/get-initial-amount-from-end-shift-by-branch-id/${branchId}`);
};

const endShiftAsync = (data) => {
  return http.put(`/${controller}/end-shift`, data);
};

const getInfoEndShiftByBranchIdAsync = () => {
  return http.get(`/${controller}/get-info-end-shift`);
};

const shiftDataService = {
  startShiftAsync,
  getInitialAmountFromEndShiftByBranchIdAsync,
  endShiftAsync,
  getInfoEndShiftByBranchIdAsync,
};

export default shiftDataService;
