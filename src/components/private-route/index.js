import ChangeLanguage from "components/change-language/change-language.component";
import { claimTypesConstants } from "constants/claim-types.constants";
import shiftDataService from "data-services/shift/shift-data.service";
import jwt_decode from "jwt-decode";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { connect, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Link, Route, withRouter } from "react-router-dom";
import { resetSession } from "store/modules/session/session.actions";
import { hasPermission } from "utils/helpers";
import { getStorage, localStorageKeys } from "utils/localStorage.helpers";
import "./index.scss";

function PrivateRoute(props) {
  const {
    route,
    routes,
    computedMatch,
    component: Component,
    key,
    path,
    auth,
    isChild,
    parentKey,
    isComponent,
    signedInUser,
    token,
    signOut,
    ...rest
  } = props;

  const [t] = useTranslation();

  const pageData = {
    endShift: t("shift.subMenuEndShift"),
    extraFees: t("fee.extraFees"),
    feeTitle: t("fee.title"),
  };

  const history = useHistory();
  const sessionPermissions = useSelector((state) => state?.session?.permissions);

  const [showModalEndShift, setShowModalEndShift] = useState(false);
  const [infoEndShift, setInfoEndShift] = useState(null);
  const [isVisibleDropdown, setIsVisibleDropdown] = useState(true);

  useEffect(() => {
    const { permission } = route;
    var token = getStorage(localStorageKeys.TOKEN);
    if (token === null || token == "" || (sessionPermissions && sessionPermissions?.length === 0)) {
      history.push("/login");
    }

    // Navigate to RESTRICTED Page whether user has not permission
    var storagePermissions = getStorage(localStorageKeys.PERMISSIONS);
    if (!storagePermissions || storagePermissions === null) {
      history.push("/login");
    } else {
      if (permission && !hasPermission(permission)) {
        history.push("/page-not-permitted");
      }
    }
  }, []);

  const showAndHideLanguageBox = (value) => {
    setIsVisibleDropdown(value);
  };

  const checkIsStartShift = (token) => {
    let isAuthenticated = true;
    if (token && token != null) {
      let claims = jwt_decode(token);
      isAuthenticated = JSON.parse(claims[claimTypesConstants.isStartShift].toLowerCase());
    }
    return isAuthenticated;
  };

  const getMenuItems = () => {
    var items = routes
      .filter((r) => r.isMenu == true)
      ?.map((r) => {
        return {
          label: (
            <>
              <Link to={r?.path} key={r.key} /> {r.name}
            </>
          ),
          key: r.key,
        };
      });

    items.push({
      label: <a onClick={onShowEndShiftComponent}>{pageData.endShift}</a>,
      key: "app.endShift.1",
    });
    items.push({
      label: <ChangeLanguage showAndHideLanguageBox={showAndHideLanguageBox} visible={isVisibleDropdown} />,
      key: "app.changeLanguage.1",
    });

    return items;
  };

  const onShowEndShiftComponent = () => {
    shiftDataService.getInfoEndShiftByBranchIdAsync().then((res) => {
      setInfoEndShift(res);
      setShowModalEndShift(true);
    });
  };

  const onCloseEndShift = () => {
    setShowModalEndShift(false);
  };

  const onEndShift = (req) => {
    shiftDataService.endShiftAsync(req).then((res) => {
      if (res) {
        signOut().then(() => {
          history.push("/login");
        });
      }
    });
  };

  return (
    <div className="app-container">
      <Route t={props.t} key={key} path={path} component={Component} {...rest} />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    token: state?.session?.auth?.token,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    signOut: () => dispatch(resetSession()),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps, null, { pure: false })(PrivateRoute));
