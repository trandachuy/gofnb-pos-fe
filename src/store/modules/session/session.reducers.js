import Moment from "moment";
import { localStorageKeys, setStorage } from "utils/localStorage.helpers";
import { encryptWithAES } from "utils/securityHelpers";
import actionTypes from "./session.types";

const sessionInitialState = {
  menus: [],
  storeInfo: {},
  auth: {},
  currentUser: {},
  lastUpdated: 1439478405547,
  languageSession: undefined,
  callbackLanguage: undefined,
  selectedStoreId: undefined,
  currentStepStartPOS: undefined,
};

const sessionReducer = (state = sessionInitialState, action) => {
  const auth = state.auth;
  switch (action.type) {
    case actionTypes.SET_MENU:
      return { ...state, menus: action.menus, lastUpdated: Moment.utc().format("x") };

    case actionTypes.SET_STORE_INFO:
      return { ...state, storeInfo: action.storeInfo, lastUpdated: Moment.utc().format("x") };

    case actionTypes.SET_AUTH:
      return { ...state, auth: action.auth, lastUpdated: Moment.utc().format("x") };

    case actionTypes.SET_PERMISSIONS:
      const jsonPermissions = JSON.stringify(action.permissions);
      let encodeData = encryptWithAES(jsonPermissions);
      setStorage(localStorageKeys.PERMISSIONS, encodeData);
      return { ...state, permissions: action.permissions, lastUpdated: Moment.utc().format("x") };

    case actionTypes.SET_CURRENT_USER:
      return { ...state, currentUser: action.user };

    case actionTypes.RESET_SESSION:
      return { ...state, auth: {}, currentUser: {}, lastUpdated: Moment.utc().format("x") };

    case actionTypes.SET_AUTH_TOKEN:
      setStorage(localStorageKeys.TOKEN, action.token);
      return {
        ...state,
        auth: {
          token: action.token,
          refreshToken: action.refreshToken,
          expire: action.expire,
          ...auth,
        },
      };
    case actionTypes.LANGUAGE_SESSION:
      return { ...state, languageSession: action?.payload };
    case actionTypes.CALLBACK_LANGUAGE:
      return { ...state, callbackLanguage: action?.payload };
    case actionTypes.SET_SELECTED_STORE_ID:
      return { ...state, selectedStoreId: action?.storeId };
    case actionTypes.SET_CURRENT_STEP_START_POS:
      return { ...state, currentStepStartPOS: action?.step };
    default:
      return state;
  }
};

export default sessionReducer;
