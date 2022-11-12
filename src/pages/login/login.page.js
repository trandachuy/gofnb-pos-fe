import { message } from "antd";
import { claimTypesConstants } from "constants/claim-types.constants";
import { PermissionKeys } from "constants/permission-key.constants";
import permissionService from "data-services/permission/permission-data.service";
import storeDataService from "data-services/store/store-data.service";
import jwt_decode from "jwt-decode";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Redirect } from "react-router";
import { useHistory } from "react-router-dom";
import { getErrorMessage, hasPermission } from "utils/helpers";
import { localStorageKeys } from "utils/localStorage.helpers";
import GreatComponent from "./components/great.component";
import ListBranchComponent from "./components/list-branch.component";
import ListStoreComponent from "./components/list-store.component";
import LoginComponent from "./components/login.component";
import StartShiftComponent from "./components/start-shift.component";

import "antd/dist/antd.css";
import "../../stylesheets/authenticator.scss";

const LoginPage = (props) => {
  const { token, loginDataService, setStoreInfo, setAuth, shiftDataService, setSelectedStoreId } = props;
  const [t] = useTranslation();
  const history = useHistory();

  const [stores, setStores] = useState([]);
  const [isLoginProcessing, setIsLoginProcessing] = useState(false);
  const [storeBranches, setStoreBranches] = useState([]);
  const [showModalStartShift, setShowModalStartShift] = useState(false);
  const [branchSelected, setBranchSelected] = useState(null);
  const [initialAmount, setInitialAmount] = useState(0);
  const [isGreatComponentVisible, setIsGreatComponentVisible] = useState(false);
  const [isClickGreat, setIsClickGreat] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState(false);
  const [loginAccount, setLoginAccount] = useState({ userName: "", password: "" });

  const pageData = {
    youHaveBeenLoggedInSuccessfully: t("signIn.youHaveBeenLoggedInSuccessfully"),
    loginFail: t("signIn.loginFail"),
  };

  const loginStep = {
    login: 1,
    selectStore: 2,
    selectBranch: 3,
  };

  const screens = {
    login: {
      key: loginStep.login,
      component: (
        <LoginComponent
          onChange={() => {
            if (loginErrorMessage != "") {
              setLoginErrorMessage("");
            }
          }}
          loginErrorMessage={loginErrorMessage}
          isLoginProcessing={isLoginProcessing}
          onLogin={({ userName, password }) => onClickLoginButton({ userName, password })}
        />
      ),
    },
    store: {
      key: loginStep.selectStore,
      component: (
        <ListStoreComponent
          stores={stores}
          onSelectStore={(storeId) => onSelectStore(storeId)}
          onBackLogin={() => onBackLogin()}
        />
      ),
    },
    branch: {
      key: loginStep.selectBranch,
      component: (
        <ListBranchComponent
          storeBranches={storeBranches}
          onSelectBranch={(branchId) => onClickBranchToStartShift(branchId)}
          onBackStore={() => onBackLogin()}
        />
      ),
    },
  };

  const [currentLoginStep, setCurrentLoginStep] = useState(loginStep.login);

  const goNextLoginStep = (stores) => {
    const hasMultipleStore = stores?.length > 1;
    if (hasMultipleStore) {
      setStores(stores);
      setCurrentLoginStep(loginStep.selectStore);
    } else {
      setStoreBranches(stores[0].branches);
      setCurrentLoginStep(loginStep.selectBranch);
    }
  };

  const onBackLogin = () => {
    const hasMultipleStore = stores?.length > 1;
    if (hasMultipleStore === true) {
      setCurrentLoginStep(currentLoginStep - 1);
    } else {
      setCurrentLoginStep(loginStep.login);
    }
  };

  const onClickLoginButton = async ({ userName, password }) => {
    setLoginAccount({ userName, password });
    setIsLoginProcessing(true);
    try {
      const loginResponse = await loginDataService.authenticate({ userName, password });
      const { stores } = loginResponse;
      if (stores?.length > 0) {
        goNextLoginStep(stores);
      } else {
        setLoginErrorMessage(t("signIn.errorLogin", "Sorry, you entered wrong Username or Password."));
      }
    } catch (errors) {
      const errorMessage = getErrorMessage(errors, "loginError");
      setLoginErrorMessage(t(errorMessage, "Sorry! But you don't have permission on this site."));
    }

    setIsLoginProcessing(false);
  };

  const getUserInfo = (token) => {
    let claims = jwt_decode(token);
    let permissions = [];
    if (claims[claimTypesConstants.permissions]) {
      permissions = JSON.parse(claims[claimTypesConstants.permissions]);
    }
    let user = {
      userId: claims[claimTypesConstants.id],
      accountId: claims[claimTypesConstants.accountId],
      fullName: claims[claimTypesConstants.fullName],
      emailAddress: claims[claimTypesConstants.email],
      accountType: claims[claimTypesConstants.accountType],
      currencyCode: claims[claimTypesConstants.currencyCode],
      currencySymbol: claims[claimTypesConstants.currencySymbol],
      permissionList: permissions,
    };
    return user;
  };

  const setupWorkspaceAsync = async (token, userInfo) => {
    let auth = { token: token, user: userInfo };
    setAuth(auth, token);
    const permissionResponse = await permissionService.getPermissionsAsync();
    const { permissions } = permissionResponse;
    if (permissions.length <= 0) {
      message.error(props.t("signIn.youHaveNoPermissions"));
    } else {
      props.setPermissions(permissions);
    }
  };

  const onSelectStore = (storeId) => {
    const storeInfo = stores?.find((s) => s.id === storeId);
    const { branches } = storeInfo;
    setStoreBranches(branches);
    setCurrentLoginStep(loginStep.selectBranch);
    setSelectedStoreId(storeId);
  };

  const onClickBranchToStartShift = async (branchId) => {
    const loginResponse = await loginDataService.authenticate({
      ...loginAccount,
      branchId: branchId,
    });

    if (loginResponse) {
      const { token } = loginResponse;
      setBranchSelected(branchId);
      let userInfo = getUserInfo(token);
      let auth = { token: token, user: userInfo };
      setAuth(auth, token);
      const shiftInfoData = await shiftDataService.getInitialAmountFromEndShiftByBranchIdAsync(branchId);
      if (shiftInfoData) {
        setInitialAmount(shiftInfoData.initialAmount);
        localStorage.removeItem(localStorageKeys.MATERIAL_INVENTORY_CHECKING);
        setShowModalStartShift(true);
      }

      message.success(pageData.youHaveBeenLoggedInSuccessfully);
    } else {
      message.error(t("signIn.errorLogin", "Sorry, you entered wrong Username or Password."));
    }
  };

  const onStartShift = async (req) => {
    const startShiftResponse = await shiftDataService.startShiftAsync(req);
    setIsClickGreat(true);
    if (startShiftResponse) {
      let userInfo = getUserInfo(startShiftResponse);
      await setupWorkspaceAsync(startShiftResponse, userInfo);
      setIsGreatComponentVisible(true);
      localStorage.removeItem(localStorageKeys.MATERIAL_INVENTORY_CHECKING);
    }

    /// Get store info and store configs
    const storeResponse = await storeDataService.getStoreInformationAsync();
    const { storeInformation } = storeResponse;
    setStoreInfo(storeInformation);
  };

  const checkIsStartShift = (token) => {
    let isAuthenticated = true;
    if (token && token != null) {
      let claims = jwt_decode(token);
      isAuthenticated = JSON.parse(claims[claimTypesConstants.isStartShift].toLowerCase());
    }

    return isAuthenticated;
  };

  const redirectByAccessPermission = () => {
    let kitchenPermission = hasPermission(PermissionKeys.KITCHEN);
    let servicePermission = hasPermission(PermissionKeys.SERVICE);
    let cashierPermission = hasPermission(PermissionKeys.CASHIER);

    if (cashierPermission || (cashierPermission && kitchenPermission && servicePermission)) {
      history.push("/");
      return;
    } else if (kitchenPermission) {
      history.push("/kitchen");
      return;
    } else if (servicePermission) {
      history.push("/");
      return;
    } else {
      history.push("/page-not-permitted");
      return;
    }
  };

  const renderLoginStep = () => {
    switch (currentLoginStep) {
      case screens.login.key:
      default:
        return screens.login.component;

      case screens.store.key:
        return screens.store.component;

      case screens.branch.key:
        return screens.branch.component;
    }
  };

  return (
    <div className="c-authenticator">
      {!checkIsStartShift(token) && !isClickGreat ? (
        <>
          <Redirect to="/" />
        </>
      ) : (
        <>
          {renderLoginStep()}
          <StartShiftComponent
            branchSelected={branchSelected}
            initialAmount={initialAmount}
            isStartShiftModalVisible={showModalStartShift}
            onStartShift={(req) => onStartShift(req)}
            onCloseModal={() => setShowModalStartShift(false)}
          />
          <GreatComponent
            isGreatComponentVisible={isGreatComponentVisible}
            onClickGreat={() => redirectByAccessPermission()}
          />
        </>
      )}
    </div>
  );
};

export default LoginPage;
