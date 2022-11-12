export const localStorageKeys = {
  USED_TIME: "USED_TIME",
  TOKEN: "TOKEN",
  MATERIAL_INVENTORY_CHECKING: "MATERIAL_INVENTORY_CHECKING",
  PERMISSIONS: "PERMISSIONS",
};

export const getStorage = (key) => {
  return localStorage.getItem(key);
};

export const setStorage = (key, value) => {
  localStorage.setItem(key, value);
};

export const removeStorage = (key) => {
  return localStorage.removeItem(key);
};
