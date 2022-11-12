import ChangeLanguage from "components/change-language/change-language.component";
import EndShiftComponent from "components/end-shift/end-shift.component";
import { EndShiftIcon, OrderIcon, ShowLessIcon, ShowMoreIcon } from "constants/icons.constants";
import { LeftMenuItemList } from "constants/left-menu.constants";
import { PermissionKeys } from "constants/permission-key.constants";
import shiftDataService from "data-services/shift/shift-data.service";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";
import { resetSession } from "store/modules/session/session.actions";
import { hasPermission } from "utils/helpers";
import { localStorageKeys } from "utils/localStorage.helpers";

import "./left-menu.component.scss";

export default function LeftMenuComponent(props) {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { isOpenMenu, setIsOpenMenu, setShowPOSOrderDialog, isOpenFromKitchen, setShowTableManagement } = props;
  const sessionUserInfo = useSelector((state) => state?.session?.auth?.user);
  const sessionPermissions = useSelector((state) => state?.session?.permissions);
  const sessionStoreInfo = useSelector((state) => state?.session?.storeInfo);

  const [menuList, setMenuList] = useState([]);
  const [infoEndShift, setInfoEndShift] = useState(null);
  const [showModalEndShift, setShowModalEndShift] = useState(false);
  const [first, setFirst] = useState(true);

  const pageData = {
    endShift: t("shift.subMenuEndShift"),
    order: t("posOrder.order"),
    tableManagement: t("tableOder.tableManagement"),
  };

  useEffect(() => {
    if (isOpenMenu) {
      setFirst(false);
    }
  }, [isOpenMenu]);

  useEffect(() => {
    if (sessionPermissions?.length > 0) {
      let menuItems = [];
      LeftMenuItemList?.forEach((menu) => {
        const validPermission = hasPermission(menu.permission);
        if (validPermission === true) {
          menuItems.push(menu);
        }
      });

      setMenuList(menuItems);
    }
  }, [sessionPermissions]);

  const onCloseEndShift = () => {
    setShowModalEndShift(false);
  };

  const onOpenSecondaryScreen = () => {
    var strWindowFeatures = `location=yes,height=${window.innerHeight}px,width=${window.innerWidth}px`;
    window.open("/secondary-screen", "_blank", strWindowFeatures);
  };

  const onEndShift = async (req) => {
    await shiftDataService.endShiftAsync(req);
    localStorage.removeItem(localStorageKeys.MATERIAL_INVENTORY_CHECKING);
    dispatch(resetSession());

    window.location.href = "/login";
  };

  const onShowEndShiftComponent = async () => {
    const response = await shiftDataService.getInfoEndShiftByBranchIdAsync();
    setInfoEndShift(response);
    setShowModalEndShift(true);
  };

  return (
    <div className={`left-menu-container ${isOpenMenu ? "open-left-menu" : first ? "" : "close-menu-left"}`}>
      <div className="user-info-box">
        <div className="user-avatar">
          <img
            src="https://i.pinimg.com/originals/c4/2c/98/c42c983e8908fdbd6574c2135212f7e4.jpg"
            alt={sessionUserInfo?.fullName}
            title={sessionUserInfo?.fullName}
          />
          <span className="user-online-status"></span>
        </div>

        <div className="user-info">
          <span className="user-label">{t("leftMenu.account")}</span>
          <span className="user-name">{sessionUserInfo?.fullName}</span>
        </div>
      </div>
      <div className="menu-item-box">
        <ul>
          {menuList.map((menu, key) => (
            <li key={key}>
              <NavLink
                to={menu?.path}
                activeClassName={isOpenFromKitchen ? (menu?.path === "/" ? "" : "active-link") : "active-link"}
              >
                {menu.icon}
                <span>{t(menu.label)}</span>
              </NavLink>
            </li>
          ))}

          {hasPermission(PermissionKeys.CASHIER) && !isOpenFromKitchen && (
            <>
              <li>
                <a onClick={() => setShowPOSOrderDialog(true)}>
                  <OrderIcon />
                  <span>{t(pageData.order)}</span>
                </a>
              </li>
              <li>
                <a href={"/secondary-screen"} target={"_blank"} rel="noreferrer">
                  <EndShiftIcon />
                  <span>Secondary</span>
                </a>
              </li>
            </>
          )}

          <li>
            <a onClick={onShowEndShiftComponent}>
              <EndShiftIcon />
              <span>{t(pageData.endShift)}</span>
            </a>
          </li>
        </ul>
      </div>

      <EndShiftComponent
        infoEndShift={infoEndShift}
        isEndShiftModalVisible={showModalEndShift}
        onEndShift={onEndShift}
        onCloseModal={onCloseEndShift}
      />

      <div className="control-box">
        <div className="language-control">
          <ChangeLanguage />
        </div>

        <div onClick={() => setIsOpenMenu(!isOpenMenu)} className="expand-control">
          {isOpenMenu ? <ShowLessIcon /> : <ShowMoreIcon />}
        </div>
      </div>
    </div>
  );
}
