import branchDataService from "data-services/branch/branch-data.service";
import materialDataService from "data-services/material/material-data.service";
import shiftDataService from "data-services/shift/shift-data.service";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { compose } from "redux";
import {
  setAuth,
  setCurrentUser,
  setPermissions,
  setSelectedStoreId,
  setStoreInfo,
  setToken,
} from "store/modules/session/session.actions";
import loginDataService from "../../data-services/login/login-data.service";
import LoginPage from "./login.page";

const mapStateToProps = (state) => {
  return {
    token: state?.session?.auth?.token,
    infoUser: state?.session?.currentUser,
    selectedStoreId: state?.session?.selectedStoreId,
    permissions: state?.session?.permissions,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loginDataService: loginDataService,
    branchDataService: branchDataService,
    shiftDataService: shiftDataService,
    materialDataService: materialDataService,
    setStoreInfo: (storeInfo) => dispatch(setStoreInfo(storeInfo)),
    setAuth: (auth, token) => {
      dispatch(setAuth(auth));
      dispatch(setToken(token));
    },
    setCurrentUser: (userName) => {
      dispatch(setCurrentUser(userName));
    },
    setSelectedStoreId: (storeId) => {
      dispatch(setSelectedStoreId(storeId));
    },
    setPermissions: (permissions) => dispatch(setPermissions(permissions)),
  };
};

export default compose(
  withTranslation("translations"),
  connect(mapStateToProps, mapDispatchToProps),
  withRouter
)(LoginPage);
