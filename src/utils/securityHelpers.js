const CryptoJS = require("crypto-js");

// Using AES algorithm
/**
 * Encrypt function
 * @param {string} originalData
 * @returns data after encrypting
 */
export const encryptWithAES = (originalData) => {
  let privateKey = process.env.REACT_APP_PRIVATE_KEY; // Key is goFoodAndBeverage (MD5)
  return CryptoJS.AES.encrypt(originalData, privateKey).toString();
};

/**
 * Decrypt function
 * @param {string} decoded_data
 * @returns original data
 */
export const decryptWithAES = (decoded_data) => {
  let privateKey = process.env.REACT_APP_PRIVATE_KEY; // Key is goFoodAndBeverage (MD5)
  const bytes = CryptoJS.AES.decrypt(decoded_data, privateKey);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};
