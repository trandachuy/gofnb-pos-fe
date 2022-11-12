import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { DatetimeFormat } from "constants/string.constants";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getUserInfo } from "services/auth.service";
import kitchenSocket from "sockets/kitchen-socket";
import dishSound from "../../../assets/sounds/kitchen-notification-sound.wav";

export default function OrderContentHeaderComponent(props) {
  const { t } = useTranslation();
  const loggedUserInfo = getUserInfo();

  const { currentOrderType, openSelectTableComponent, setShowPOSOrderDialog, selectedTable, setShowTableManagement } =
    props;

  const date = moment().format(DatetimeFormat.dddd_DD_MMM_YYYY);

  const pageData = {
    btnOrderManagement: t("button.orderManagement"),
    btnSelectTable: t("button.selectTable"),
    tableManagement: t("tableOder.tableManagement"),
    dishCompleted: t("kitchenManagement.dishCompleted"),
    itemInOrder: t("kitchenManagement.itemInOrder"),
    hasBeenSuccessfullyPrepared: t("kitchenManagement.hasBeenSuccessfullyPrepared"),
  };

  const [isShowToastMessageFromKitchen, setIsShowToastMessageFromKitchen] = useState(false);
  const [orderCodeSessions, setOrderCodeSessions] = useState(null);

  useEffect(() => {
    initKitchenToCashierSocket();
  }, []);

  const initKitchenToCashierSocket = async () => {
    try {
      if (loggedUserInfo) {
        let userInfo = {
          BranchId: loggedUserInfo?.branchId,
          AccountId: loggedUserInfo?.accountId,
        };

        kitchenSocket.on("Cashier", (data) => {
          setOrderCodeSessions(data);
          setIsShowToastMessageFromKitchen(true);
        });

        await kitchenSocket.start();
        await kitchenSocket.invoke("JoinRoom", userInfo);
      }
    } catch (error) {}
  };

  const renderToastMessageFromKitchen = (orderId) => {
    setTimeout(() => {
      setIsShowToastMessageFromKitchen(false);
    }, 4000);

    return (
      <div className="toast-message-from-kitchen">
        <span className="title">{pageData.dishCompleted}</span>
        <span className="content">
          {pageData.itemInOrder} <span>#{orderId}</span> {pageData.hasBeenSuccessfullyPrepared}
        </span>
      </div>
    );
  };

  const renderSound = () => {
    const audio = new Audio(dishSound);
    audio.oncanplaythrough = () => {
      audio.play();
    };
  };

  return (
    <div className="order-content-header-container occ-margin-b">
      <div className="order-content-header-date-info">
        <span className="header-date-info-title">{currentOrderType?.name}</span>
        <span className="header-date-info-string">{date}</span>
      </div>

      {currentOrderType?.id === 0 && (
        <div className="order-content-header-control">
          <Button className="second-button" onClick={() => setShowTableManagement(true)}>
            {pageData.tableManagement}
          </Button>
          <Button
            className="primary-button"
            onClick={openSelectTableComponent}
            icon={<PlusOutlined className="icon-btn-add-option" />}
          >
            {selectedTable?.id ? selectedTable.name : pageData.btnSelectTable}
          </Button>
        </div>
      )}

      {/* Toast message and sound from Kitchen */}
      {isShowToastMessageFromKitchen && renderToastMessageFromKitchen(orderCodeSessions)}
      {isShowToastMessageFromKitchen && renderSound()}
    </div>
  );
}
