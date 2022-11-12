import { localStorageKeys } from "utils/localStorage.helpers";
import actionTypes from "./session.types";

export function setAuth(auth) {
  return { type: actionTypes.SET_AUTH, auth };
}

export function setToken(token) {
  return { type: actionTypes.SET_AUTH_TOKEN, token };
}

export function setPermissions(permissions) {
  return { type: actionTypes.SET_PERMISSIONS, permissions };
}

export function setCurrentUser(user) {
  return { type: actionTypes.SET_CURRENT_USER, user };
}

export function resetSession() {
  localStorage.removeItem(localStorageKeys.USED_TIME);
  localStorage.removeItem(localStorageKeys.TOKEN);
  localStorage.removeItem(localStorageKeys.PERMISSIONS);
  localStorage.removeItem("persist:root");
  return { type: actionTypes.RESET_SESSION };
}

export const setLanguageSession = (data) => {
  return { type: actionTypes.LANGUAGE_SESSION, payload: data };
};

export const callbackLanguage = (callback) => {
  return { type: actionTypes.CALLBACK_LANGUAGE, payload: callback };
};

export function setSelectedStoreId(storeId) {
  return { type: actionTypes.SET_SELECTED_STORE_ID, storeId };
}

export function setCurrentStepStartPOS(step) {
  return { type: actionTypes.SET_CURRENT_STEP_START_POS, step };
}

export function setStoreInfo(storeInfo) {
  return { type: actionTypes.SET_STORE_INFO, storeInfo };
}

export function setMenus(menus) {
  return { type: actionTypes.SET_MENU, menus };
}
