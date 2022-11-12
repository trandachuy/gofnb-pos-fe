import { RightCircleOutlined } from "@ant-design/icons";
import { Card, message, Modal, Tabs } from "antd";
import { ReceiptTemplateComponent } from "components/fnb-receipt/fnb-receipt-component";
import { OrderPaymentStatus } from "constants/order-payment-status.constants";
import { OrderStatus } from "constants/order-status.constants";
import areaDataService from "data-services/area/area-data.service";
import orderDataService from "data-services/order/order-data.service";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  CardFoodIcon,
  CardProfileIcon,
  CardTimeIcon,
  CloseModalIcon,
  IconPayment,
  PrintIcon,
} from "constants/icons.constants";
import { formatDate } from "utils/helpers";
import PaymentMethod from "./payment/payment-method.component";
import "./style.scss";
const { TabPane } = Tabs;
export default function PosTableManagement(props) {
  const [areaData, setAreaData] = useState();
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [t] = useTranslation();
  const billTemplateRef = React.useRef(null);
  const oderPayment = useRef(null);
  const { isModalVisible, handleCancel } = props;
  const pageData = {
    selectTable: t("tableOder.selectTable"),
    pay: t("button.pay"),
    inUse: t("tableOder.inUse"),
    available: t("tableOder.available"),
    inUseColor: "#ff9838",
    availableColor: "#52c41a",
    badgeInUse: "badge-text-in-use",
    badgeAvailable: "badge-text-available",
    inactive: t("tableOder.inactive"),
    dish: t("tableOder.dish"),
    location: t("tableOder.location"),
    time: t("tableOder.time"),
    tableManagement: t("tableOder.tableManagement"),
    seats: t("tableOder.seats"),
    completeOrder: t("posOrder.detail.completeOrder"),
    orderCompletedSuccess: t("order.orderCompletedSuccess"),
  };

  useEffect(() => {
    props.tableFuncs.current = fetchData;
  }, []);

  const fetchData = () => {
    areaDataService.getAllAreasActivatedAsync().then((res) => {
      if (res.areas) {
        setAreaData(res.areas);
      }
    });
  };

  const printBill = (orderId) => {
    orderDataService.getOrderDetailToPrint(orderId).then((res) => {
      const { detailOrderToPrint, billConfiguration } = res;
      if (billTemplateRef && billTemplateRef.current) {
        billTemplateRef.current.renderTemplate(billConfiguration, detailOrderToPrint);
        billTemplateRef.current.printTemplate();
      }
    });
  };

  const handleCompleteOrder = (orderId) => {
    const currentOrder = {
      orderId: orderId,
      orderStatusId: OrderStatus.Completed,
    };
    orderDataService.updateOrderStatusAsync(currentOrder).then((res) => {
      if (res) {
        message.success(pageData.orderCompletedSuccess);
        fetchData();
      }
    });
  };

  const openPaymentMethod = (orderId) => {
    setShowPaymentMethod(true);
    oderPayment.current({
      id: orderId,
      isRefresh: true,
    });
  };

  const renderPaymentMethod = () => {
    return (
      <PaymentMethod
        orderDataService={orderDataService}
        isModalVisible={showPaymentMethod}
        handleCancel={() => setShowPaymentMethod(false)}
        onCompleted={() => onCompletedPayment()}
        tableFuncs={oderPayment}
      />
    );
  };

  const onCompletedPayment = () => {
    setShowPaymentMethod(false);
    fetchData();
  };

  const renderOrderTable = (table) => {
    return (
      <>
        <div className="card-content">
          <div className="header-table-card">
            {table?.orders?.length > 0 && <span className="cr-text cr-text--start">★</span>}
            <span title={table?.name} className="cr-text">
              {table?.name}
            </span>
          </div>

          <div className="content-table-card spacing">
            <div className="ir">
              <span className="irblock">
                <span className="ire ire--left ire--icon">
                  <CardProfileIcon />
                </span>
                <span className="ire ire--left ire--text">{pageData.location}</span>
              </span>
              <span className="ire ire--right ire--info">
                {table?.numberOfSeat} {pageData.seats}
              </span>
            </div>

            <div className="ir">
              <span className="irblock">
                <span className="ire ire--left ire--icon">
                  <CardFoodIcon />
                </span>
                <span className="ire ire--left ire--text">{pageData.dish}</span>
              </span>
              <span className="ire ire--right ire--info">{table?.numberOfStep}</span>
            </div>
            <div className="ir">
              <span className="irblock">
                <span className="ire ire--left ire--icon">
                  <CardTimeIcon />
                </span>
                <span className="ire ire--left ire--text">{pageData.time}</span>
              </span>
              <span className="ire ire--right ire--info">
                {table?.orders[0]?.createdTime ? formatDate(table?.orders[0]?.createdTime, "HH:mm:ss") : "-"}
              </span>
            </div>
            {table?.orders?.length > 0 && (
              <div className="btn-action">
                {OrderStatus.Canceled !== table?.orders[0]?.orderStatusId &&
                  OrderStatus.Completed !== table?.orders[0]?.orderStatusId &&
                  (table?.orders[0]?.orderPaymentStatusId === OrderPaymentStatus.Paid ? (
                    <p
                      className="action action--payment-order"
                      onClick={() => handleCompleteOrder(table?.orders[0]?.id)}
                    >
                      <span className="btn-text btn-text--icon">
                        <IconPayment />
                      </span>
                      <span className="btn-text ">{pageData.completeOrder}</span>
                    </p>
                  ) : (
                    <p className="action action--payment-order" onClick={() => openPaymentMethod(table?.orders[0]?.id)}>
                      <span className="btn-text btn-text--icon">
                        <IconPayment />
                      </span>
                      <span className="btn-text ">{table?.priceAfterDiscount.toLocaleString()}</span>
                    </p>
                  ))}
                <p className="action action--print-order" onClick={() => printBill(table?.orders[0]?.id)}>
                  <span className="btn-text btn-text--icon">
                    <PrintIcon />
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };
  return (
    isModalVisible && (
      <>
        {renderPaymentMethod()}
        <Modal
          className="c-modal-table-order"
          title={pageData.tableManagement}
          visible={props.isModalVisible}
          footer={(null, null)}
          onCancel={() => handleCancel(false)}
          width={1279}
          style={{ maxHeight: "860px" }}
          closeIcon={<CloseModalIcon />}
        >
          <Tabs defaultActiveKey="0" tabPosition={"left"} className="tabs">
            {areaData?.map((area, areaIndex) => {
              return (
                <TabPane
                  className="tab-pane"
                  tab={
                    <span className="pannel-title">
                      <RightCircleOutlined />
                      {area.name}
                    </span>
                  }
                  key={areaIndex}
                >
                  <div className="site-card-wrapper">
                    <div className="table-content-wraper">
                      {area?.areaTables.map((table, tableIndex) => {
                        return table.isActive ? (
                          <div
                            key={tableIndex}
                            className={
                              table?.orders?.length > 0
                                ? "table-card table-card--in-use"
                                : "table-card table-card--available"
                            }
                          >
                            <Card bordered={false} className={"t-card"}>
                              <div className="table-card-content">{renderOrderTable(table)}</div>
                            </Card>
                          </div>
                        ) : (
                          ""
                        );
                      })}
                    </div>
                  </div>
                </TabPane>
              );
            })}
          </Tabs>
        </Modal>
        <div className="d-none">
          <ReceiptTemplateComponent ref={billTemplateRef} />
        </div>
      </>
    )
  );
}
