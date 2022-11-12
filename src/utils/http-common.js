import { message } from "antd";
import axios from "axios";
import { logService } from "services/log/log.service";
import { resetSession } from "store/modules/session/session.actions";
import i18n from "utils/i18n";
import { store } from "../store";
import { startDataServiceProcessing, stopDataServiceProcessing } from "../store/modules/processing/processing.actions";
import { browserHistory, tokenExpired } from "./helpers";
import { getStorage, localStorageKeys } from "./localStorage.helpers";

const { t } = i18n;
const logType = {
  normal: "",
  success: "SUCCESS",
  error: "ERROR",
};

const options = { prefix: "DATA_SERVICE", color: "green", enableLog: false };
const http = axios.create({
  baseURL: process.env.REACT_APP_API,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "platform-id": process.env.REACT_APP_PLATFORM_ID,
  },
  timeout: 300000,
});

http.interceptors.request.use(
  async (config) => {
    //#region AI logging
    _handleAILogging(config, logType.normal, "");
    //#endregion

    store.dispatch(startDataServiceProcessing());
    const token = _getToken();
    if (token) {
      const expired = tokenExpired(token);
      if (expired === true) {
        _redirectToLoginPage();
        return;
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    const usedTimePreviousAction = getStorage(localStorageKeys.USED_TIME);
    if (usedTimePreviousAction) {
      config.headers["used-time"] = usedTimePreviousAction;
    }

    return config;
  },
  (error) => {
    //#region AI logging
    const { config } = error?.response;
    _handleAILogging(config, logType.error, error);
    //#endregion

    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  async (response) => {
    //#region AI logging
    const { config } = response;
    _handleAILogging(config, logType.success, response);
    //#endregion

    _httpLogging(response?.data);

    store.dispatch(stopDataServiceProcessing());

    if (response.status === 200) {
      return response?.data;
    }
    return response;
  },
  (error) => {
    //#region AI logging
    const { config } = error?.response;
    _handleAILogging(config, logType.error, error);
    //#endregion

    store.dispatch(stopDataServiceProcessing());
    _httpLogging(error?.response);
    const tokenExpired = error?.response?.headers["token-expired"];

    if (tokenExpired && tokenExpired === "true") {
      store.dispatch(resetSession());
      window.location.href = "/login";
      return Promise.reject(error?.response);
    }

    const token = _getToken();

    /// User has token and receive 401 => restricted page
    if (token && error?.response?.status === 401) {
      var isExpired = tokenExpired(token);
      if (isExpired === true) {
        _redirectToLoginPage();
      } else {
        browserHistory.push("/page-not-permitted");
      }
    }

    /// If error is 401 and has not token redirect to login page
    if (!token && error?.response?.status === 401) {
      _redirectToLoginPage();
    }

      if (
          error &&
          error.response &&
          error.response.data.errors &&
          error.response.data.errors.length > 0
      ) {
      const { errors } = error.response.data;
      return Promise.reject(errors);
    }

    const errorMessage = error?.response?.data?.message;
    if (errorMessage) {
      message.error(errorMessage);
    }

    return Promise.reject(error?.response);
  }
);

//#region Private methods

/// Clear session and redirect to login page
const _redirectToLoginPage = () => {
  store.dispatch(resetSession());
  window.location.href = "/login";
};

const _getToken = () => {
  const { session } = store.getState();
  let token = session?.auth?.token;
  if (!token) {
    token = getStorage(localStorageKeys.TOKEN);
  }

  return token;
};

const _httpLogging = (data) => {
  var env = process.env.REACT_APP_ENV;
  if (env === "local") {
    console.log("%cresponse >>", "color: #349f01", data);
  }
};

const _handleAILogging = (httpConfig, logType, data) => {
  const { method, url } = httpConfig;
  const logName = `${method.toUpperCase()} ${url} >>> ${logType}: `;

  switch (logType) {
    case logType.success:
      logService.trackTrace(logName, data, options);
      break;
    default:
      logService.trackException(logName, data, options);
      break;
  }
};

//#endregion

export default http;
