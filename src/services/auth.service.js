import { claimTypesConstants } from "constants/claim-types.constants";
import jwt_decode from "jwt-decode";
import { store } from "store";
import { getStorage, localStorageKeys } from "utils/localStorage.helpers";

export const getToken = () => {
  const { session } = store.getState();
  let token = session?.auth?.token;
  if (!token) {
    token = getStorage(localStorageKeys.TOKEN);
  }

  return token;
};

export const getUserInfo = () => {
  const loginToken = getToken();
  if (loginToken) {
    const claims = jwt_decode(loginToken);
    const user = {
      userId: claims[claimTypesConstants.id],
      accountId: claims[claimTypesConstants.accountId],
      storeId: claims[claimTypesConstants.storeId],
      branchId: claims[claimTypesConstants.branchId],
      shiftId: claims[claimTypesConstants.shiftId],
      fullName: claims[claimTypesConstants.fullName],
      emailAddress: claims[claimTypesConstants.email],
      accountType: claims[claimTypesConstants.accountType],
      currencyCode: claims[claimTypesConstants.currencyCode],
    };

    return user;
  }

  return null;
};
