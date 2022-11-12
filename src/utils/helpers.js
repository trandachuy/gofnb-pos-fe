/* eslint-disable no-useless-escape */
import { DatetimeFormat } from "constants/string.constants";
import { createBrowserHistory } from "history";
import jwt_decode from "jwt-decode";
import moment from "moment";
import CurrencyFormat from "react-currency-format";
import languageService from "services/language/language.service";
import { store } from "store";
import { getStorage, localStorageKeys } from "./localStorage.helpers";
import { decryptWithAES } from "./securityHelpers";

/// Format date
export const formatDate = (date, format) => {
  if (format) {
    return moment.utc(date).local().locale(languageService.getLang()).format(format);
  }
  return moment.utc(date).local().locale(languageService.getLang()).format(DatetimeFormat.DD_MM_YYYY);
};

export const getCurrency = () => {
  const { session } = store.getState();
  const { auth } = session;
  if (auth?.user) {
    return auth?.user?.currencyCode ?? "";
  }
  return "";
};

export const getCurrencyWithSymbol = () => {
  const { session } = store.getState();
  const { auth } = session;
  if (auth?.user) {
    return auth?.user?.currencySymbol ?? "";
  }
  return "";
};

/// Format Currency with code
export const formatCurrency = (number) => {
  let convertNumber = parseFloat(number);
  if (convertNumber >= 0) {
    //const currencyCode = ` ${getCurrency()}`;
    const currencyCode = ` ${getCurrencyWithSymbol()}`;
    return <CurrencyFormat value={convertNumber} displayType={"text"} thousandSeparator={true} suffix={currencyCode} />;
  }
  return "";
};

/// Format Currency with symbol
export const formatCurrencyWithSymbol = (number) => {
  let convertNumber = parseFloat(number);
  if (convertNumber >= 0) {
    const currencySymbol = ` ${getCurrencyWithSymbol()}`;
    return (
      <CurrencyFormat value={convertNumber} displayType={"text"} thousandSeparator={true} suffix={currencySymbol} />
    );
  }
  return "";
};

/// Format Currency without currency symbol
export const formatCurrencyWithoutSymbol = (number) => {
  let convertNumber = parseFloat(number);
  if (convertNumber >= 0) {
    return <CurrencyFormat value={convertNumber} displayType={"text"} thousandSeparator={true} />;
  }
  return "";
};

export const formatNumber = (number) => {
  return <CurrencyFormat value={number} displayType={"text"} thousandSeparator={true} />;
};

export const formatTextNumber = (number) => {
  if (isNaN(number) || number === null) {
    return "0";
  }
  return `${number}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "";
};

/// Run the function in next tick
export const executeAfter = (ms, callback) => {
  clearTimeout(window.searchTimeout);
  return new Promise((resolve) => {
    window.searchTimeout = setTimeout(() => {
      callback();
      resolve();
    }, ms);
  });
};

// Get permission from store
export const getPermissions = () => {
  const { session } = store.getState();
  return session?.permissions ?? [];
};

// Check permission
export const hasPermission = (permissionId) => {
  if (permissionId === "public") return true;

  const { session } = store.getState();
  let allPermissions = session?.permissions ?? [];
  if (allPermissions.length === 0) {
    var storagePermissions = getStorage(localStorageKeys.PERMISSIONS);
    if (storagePermissions === null) return false;
    let decodeData = decryptWithAES(storagePermissions);
    if (decodeData) {
      var permissions = JSON.parse(decodeData);
      allPermissions = permissions;
    }
  }

  const isArrayPermissions = Array.isArray(permissionId);
  if (isArrayPermissions === true) {
    if (permissionId?.length == 0) return true;

    let hasPermission = false;
    permissionId.forEach((p) => {
      const index = allPermissions.findIndex((x) => x?.id?.toString().toUpperCase() === p?.toString().toUpperCase());

      if (index !== -1) {
        hasPermission = true;
        return true;
      }
    });

    return hasPermission;
  } else {
    const index = allPermissions.findIndex(
      (x) => x?.id?.toString().toUpperCase() === permissionId?.toString().toUpperCase()
    );
    return index !== -1;
  }
};

/**
 * Check exist permission keys in permissions
 * @param {*} permissions
 * @param {*} permissionKeys
 * @returns
 */
export function hasPermissions(permissions, permissionKeys) {
  const isArrayPermissions = Array.isArray(permissionKeys);
  if (isArrayPermissions === true) {
    if (isArrayPermissions?.length == 0) return true;

    let hasPermission = false;
    permissionKeys.forEach((p) => {
      const index = permissions.findIndex((x) => x?.id?.toString().toUpperCase() === p?.toString().toUpperCase());

      if (index !== -1) {
        hasPermission = true;
        return true;
      }
    });

    return hasPermission;
  }

  return false;
}

/// random GuidId
export const randomUuid = () => {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
};

/// check valid email
export const isValidEmail = (string) => {
  const emailPattern =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailPattern.test(string)) {
    return false;
  }
  return true;
};

/// check valid phone number
export const isValidPhoneNumber = (string) => {
  const phonePattern = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  if (!phonePattern.test(string)) {
    return false;
  }
  return true;
};

/*
  Create combos from groups of array
  Example:
  Group has two array:
  array 1: ["1", "2"]
  array 2: ["4", "5"]
  Result: [ [ '1', '4' ], [ '1', '5' ], [ '2', '4' ], [ '2', '5' ] ]
*/
export const combinationPossible = (groups) => {
  const combos = groups.reduce((a, b) => a.flatMap((x) => b.map((y) => x + "#" + y)), [""]);
  const result = combos.map((combo) => {
    const members = combo.split("#").filter((x) => x !== "");
    return members;
  });

  return result;
};

/*
  ROUND NUMBER
  Params:
  @number: number to round
  @precision: precision of round
*/
export const roundNumber = (number, precision) => {
  if (precision === undefined || precision === null || precision < 1) {
    precision = 1;
  } else {
    precision = Math.pow(10, precision);
  }

  return Math.round(number * precision) / precision;
};

/**
 * Get the value of a given query string parameter.
 */
export const getParamsFromUrl = (url) => {
  const params = new URLSearchParams(url);
  const result = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
};

/*
  LOWERCASE FIRST LETTER OF STRING
  Example: "HELLO" => "hELLO"
*/
export const lowercaseFirst = (str) => {
  return str[0].toLowerCase() + str.slice(1);
};

/*
  MAPPING VALIDATE ERROR
*/
export const getValidationMessages = (errors) => {
  if (!errors || errors?.length === 0) return [];
  return errors?.map((err) => {
    return {
      name: lowercaseFirst(err.type),
      errors: [err.message],
    };
  });
};

export const getErrorMessage = (errors, fieldName) => {
  let message = "";
  if (!errors || errors?.length === 0) return message;
  errors?.forEach((err) => {
    if (err.type?.toLowerCase() === fieldName?.toLowerCase()) {
      message = err.message;
    }
  });
  return message;
};

/*
  MAPPING VALIDATE ERROR WITH PARENT FIELD
*/
export const getValidationMessagesWithParentField = (errors, field) => {
  return errors?.map((err) => {
    return {
      name: [field, lowercaseFirst(err.type)],
      errors: [err.message],
    };
  });
};

export const tokenExpired = (token) => {
  if (token && token !== null) {
    const decoded = jwt_decode(token);
    const utcTime = moment.unix(decoded.exp);
    var tokenExpireDate = new Date(utcTime.format("M/DD/YYYY hh:mm:ss A UTC"));
    const currentDate = Date.now();
    var tokenExpired = moment(currentDate).isAfter(tokenExpireDate) ?? false;

    return tokenExpired;
  }

  return true;
};

/**
 *
 * @param {*} strValue
 * @param  {...any} params
 * @returns String format value with parameters
 */
export const formatStringWithParameters = (strValue, ...params) => {
  if (!strValue.match(/^(?:(?:(?:[^{}]|(?:\{\{)|(?:\}\}))+)|(?:\{[0-9]+\}))+$/)) {
    throw new Error("invalid format string.");
  }
  return strValue.replace(/((?:[^{}]|(?:\{\{)|(?:\}\}))+)|(?:\{([0-9]+)\})/g, (m, str, index) => {
    if (str) {
      return str.replace(/(?:{{)|(?:}})/g, (m) => m[0]);
    } else {
      if (index >= params.length) {
        throw new Error("argument index is out of range in format");
      }
      return params[index];
    }
  });
};

export const browserHistory = createBrowserHistory();

/**
 * Distinct array object by attribute key
 * @param {any} key
 * @example: arr = [{label: "A", value: "20"}, {label: "B", value: "22"}, {label: "A", value: "20"}]
 * @exampleResult: arrDistinctedByLabel = arr.distinctByKey("label") => [{label: "A", value: "20"}, {label: "B", value: "22"}]
 */
Array.prototype.distinctBy = function (key) {
  return [...new Map(this.map((item) => [item[key], item])).values()];
};

/**
 * Get Short Name
 * @example Ly Nha Ky => LK
 * @param {*} name
 * @returns
 */
export const getShortName = (name) => {
  const names = name?.split(" ") ?? "";
  if (names.length > 1) {
    return names[0][0] + names[names.length - 1][0];
  }
  if (names.length === 1) {
    return names[0][0];
  }
  return names;
};

/**
 * Remove Vietnamese accents
 */
String.prototype.removeVietnamese = function () {
  let newStr = this?.toString()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/g, "d")
  .replace(/Đ/g, "D");

  return newStr;
};
