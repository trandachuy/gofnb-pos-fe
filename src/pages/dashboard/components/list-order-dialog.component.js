import { Checkbox, message, Modal } from "antd";
import orderBroadcast from "broadcast-channels/order-broadcast-channel";
import { ReceiptTemplateComponent } from "components/fnb-receipt/fnb-receipt-component";
import NotificationComponent from "components/notification/notification.component";
import { BroadcastActions } from "constants/broadcast-actions.constants";
import {
  AddressPosOrder,
  CloseModalCheckoutOrderIcon,
  DeliveryPosOrder,
  DishPosOrder,
  EditFillIcon,
  InStorePosOrder,
  LocationPosOrder,
  NoDataFoundIcon,
  PayPosOrder,
  PrintPosOrder,
  SearchPosIcon,
  TakeAwayPosOrder,
  TimePosOrder,
  TotalBillPosOrder,
  ToConfirmPosOrder,
  GoFnBAppPosOrder,
} from "constants/icons.constants";
import { OrderItemStatus } from "constants/order-item-status.constant";
import { OrderPaymentStatus } from "constants/order-payment-status.constants";
import { OrderStatus } from "constants/order-status.constants";
import { OrderTypeStatus } from "constants/order-type-status.constants";
import { DatetimeFormat } from "constants/string.constants";
import orderDataService from "data-services/order/order-data.service";
import PaymentMethod from "pages/dashboard/components/payment/payment-method.component";
import { OrderDetailComponent } from "pages/order/components/order-detail.component";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { executeAfter, formatCurrency, formatDate } from "utils/helpers";
import "./list-order-dialog.scss";
import { OrderPlatform } from "constants/order-platform.constants";

export function ListOrderDialogComponent(props) {
  const [t] = useTranslation();
  const { orderStatus, onEditOrder, numberCartItems, saveDraftOrder, onloadTotalOrderConfirm } = props;
  const pageData = {
    completeOrder: t("posOrder.completeOrder"),
    confirmOrder: t("posOrder.confirmOrder"),
    editOrder: t("posOrder.editOrder"),
    pay: t("posOrder.pay"),
    inStore: t("posOrder.inStore"),
    takeAway: t("posOrder.takeAway"),
    delivery: t("posOrder.delivery"),
    online: t("posOrder.online"),
    location: t("posOrder.location"),
    address: t("posOrder.address"),
    dish: t("posOrder.dish"),
    time: t("posOrder.time"),
    totalBill: t("posOrder.totalBill"),
    noDataFound: t("posOrder.noDataFound"),
    printBill: t("posOrder.detail.printBill"),
    searchByNumberOrder: t("posOrder.searchByNumberOrder"),
    orderCompletedSuccess: t("order.orderCompletedSuccess"),
    btnIGotIt: t("form.buttonIGotIt"),
    orderHasPaid: t("posOrder.detail.orderHasPaid"),
    orderDelivery: t("posOrder.detail.orderDelivery"),
    orderDraft: t("posOrder.detail.orderDraft"),
    btnSaveDraft: t("posOrder.detail.btnSaveDraft"),
  };
  const billTemplateRef = React.useRef(null);
  const [orderType, setOrderType] = useState([]);
  const [listOrder, setListOrder] = useState([]);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [posOrderDetail, setPosOrderDetail] = useState({});
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [keySearch, setKeySearch] = useState("");
  const [contentNotification, setContentNotification] = useState("");
  const [isShowSaveDraft, setIsShowSaveDraft] = useState(false);
  const [isShowNotification, setIsShowNotification] = useState(false);
  const [orderIdSaveDraft, setOrderIdSaveDraft] = useState(null);
  const [showClearBtn, setShowClearBtn] = useState(false);
  const oderPayment = useRef(null);
  const searchRef = useRef();
  const [orderPlatform, setOrderPlatform] = useState([]);

  useEffect(() => {
    fetchData();
  }, [orderStatus]);

  useEffect(() => {
    if (keySearch.length > 0) {
      setShowClearBtn(true);
    } else {
      setShowClearBtn(false);
    }
  }, [keySearch]);

  const orderPlatformSearch = () => {
    return (orderStatus === OrderStatus.ToConfirm) ? orderPlatform : [];
  }

  const orderTypeSearch = () => {
    return (orderStatus === OrderStatus.ToConfirm || orderStatus === OrderStatus.Draft) ? [] : orderType;
  }

  const fetchData = () => {
    getInitDataAsync(orderStatus, keySearch, orderTypeSearch(), orderPlatformSearch());
  };

  const renderOrderDetailModal = () => {
    return (
      <Modal
        className="pos-order-detail-modal"
        width={1289}
        visible={showOrderDetail}
        onCancel={() => setShowOrderDetail(false)}
        footer={(null, null)}
      >
        <OrderDetailComponent
          posOrderDetail={posOrderDetail}
          orderStatus={orderStatus}
          setShowOrderDetail={setShowOrderDetail}
          onEdit={(orderId, isSaveDraffAndContinue) => {
            setShowOrderDetail(false);
            onEditOrder(orderId, isSaveDraffAndContinue);
          }}
          onFetchDataOrder={() => fetchData()}
          numberCartItems={numberCartItems}
          saveDraftOrder={saveDraftOrder}
        />
      </Modal>
    );
  };

  const getOrderDetail = (orderId) => {
    orderDataService.getPrepareOrderEditDataRequestAsync(orderId).then((res) => {
      const order = {
        ...res,
        id: orderId,
      };
      setPosOrderDetail(order);
    });
  };

  const onShowOrderDetail = (orderId) => {
    getOrderDetail(orderId);
    setShowOrderDetail(true);
  };

  const getInitDataAsync = (orderStatus, keySearch, orderType, orderPlatform) => {
    let orderParam = {
      orderStatus: orderStatus,
      keySearch: keySearch,
      orderType: orderType,
      platform: orderPlatform,
    };
    orderDataService.getAllPosOrderByBranchAsync(orderParam).then((res) => {
      if (res?.posOrders) {
        setListOrder(res?.posOrders);
      }
    });

    // On load Total Order Confirm
    onloadTotalOrderConfirm();
  };

  const onSearchOrder = (event) => {
    executeAfter(1000, async () => {
      setKeySearch(event.target.value);
      getInitDataAsync(orderStatus, event.target.value, orderType);
    });
  };

  const onChangeOrderType = (data) => {
    setOrderType(data);
    getInitDataAsync(orderStatus, keySearch, data, orderPlatformSearch());
  };

  const onChangeOrderPlatform = (data) => {
    setOrderPlatform(data);
    getInitDataAsync(orderStatus, keySearch, orderTypeSearch(), data);
  };

  const openPaymentMethod = (orderId) => {
    setShowPaymentMethod(true);
    oderPayment.current({
      id: orderId,
      isRefresh: true,
    });
  };

  const onPaymentComplete = () => {
    orderBroadcast?.postMessage({
      action: BroadcastActions.ShowThanks,
      data: undefined,
    });
    setShowPaymentMethod(false);
  };

  const renderPaymentMethod = () => {
    return (
      <PaymentMethod
        callBack={fetchData}
        orderDataService={orderDataService}
        isModalVisible={showPaymentMethod}
        handleCancel={() => setShowPaymentMethod(false)}
        onCompleted={onPaymentComplete}
        tableFuncs={oderPayment}
      />
    );
  };

  const renderOrderType = (orderTypeId) => {
    switch (orderTypeId) {
      case OrderTypeStatus.InStore:
        return <InStorePosOrder />;
      case OrderTypeStatus.Delivery:
        return <DeliveryPosOrder />;
      case OrderTypeStatus.Online:
        return <GoFnBAppPosOrder />;
      default:
        return <TakeAwayPosOrder />;
    }
  };

  const renderOrderTypeName = (orderTypeName, orderTypeId, platformId) => {
    if (orderTypeId === OrderTypeStatus.Online) {
      switch (platformId.toUpperCase()) {
        case OrderPlatform.GoFnBApp.id:
          return OrderPlatform.GoFnBApp.name;
      }
    }

    return orderTypeName;
  }

  const handlePosOrderSearch = () => {
    let posOrderSearchBtn = document.getElementById("pos-order-search-btn");
    posOrderSearchBtn.parentElement.classList.toggle("open");
    posOrderSearchBtn.nextElementSibling.focus();
  };

  const handlePosOrderClear = () => {
    document.getElementById("pos-order-search-input").value = "";
    setKeySearch("");
    getInitDataAsync(orderStatus, "", orderType);
    searchRef.current.focus();
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

  const onCompleteOrder = (orderId) => {
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

  const onConfirmOrder = (orderId) => {
    const currentOrder = {
      orderId: orderId,
      orderStatusId: OrderStatus.Processing,
    };
    orderDataService.updateOrderStatusAsync(currentOrder).then((res) => {
      if (res) {
        fetchData();
      }
    });
  };

  const onHandelEditOrder = (orderId, orderTypeId, orderPaymentStatusId) => {
    setIsShowSaveDraft(false);
    if (orderTypeId === OrderTypeStatus.Delivery) {
      setContentNotification(pageData.orderDelivery);
      setIsShowNotification(true);
    } else if (orderPaymentStatusId === OrderPaymentStatus.Paid) {
      setContentNotification(pageData.orderHasPaid);
      setIsShowNotification(true);
    } else {
      if (numberCartItems > 0) {
        setContentNotification(pageData.orderDraft);
        setOrderIdSaveDraft(orderId);
        setIsShowSaveDraft(true);
        setIsShowNotification(true);
      } else {
        onEditOrder(orderId, false);
      }
    }
  };

  const onSaveDraft = () => {
    saveDraftOrder();
    onEditOrder(orderIdSaveDraft, true);
  };

  const getTotalOrderItemNumber = (order) => {
    const { orderItems } = order;
    return orderItems?.length ?? 0;
  };

  const displayDish = (order) => {
    const { orderItems } = order;

    if (orderStatus === OrderStatus.ToConfirm) {
      var totalItemsToConfirm = orderItems?.reduce((item, obj) => (item + obj.quantity), 0);
      return (<span>
        {totalItemsToConfirm}
      </span>)
    }

    const totalItemCompleted = orderItems?.filter((oi) => oi.statusId === OrderItemStatus.Completed)?.length ?? 0;
    const totalItems = orderItems?.length ?? 0;
    return (
      <span>
        {totalItemCompleted}/{totalItems}
      </span>
    );
  };

  return (
    <>
      <NotificationComponent
        isModalVisible={isShowNotification}
        handleCancel={() => {
          setIsShowNotification(false);
        }}
        content={contentNotification}
        isShowSave={isShowSaveDraft}
        textBtnSave={pageData.btnSaveDraft}
        onSave={onSaveDraft}
      />
      {renderOrderDetailModal()}
      {renderPaymentMethod()}
      <div className="pos-order-search">
        <div id="pos-order-search-btn" className="pos-order-search-btn" onClick={() => handlePosOrderSearch()}>
          <SearchPosIcon />
        </div>
        <input
          ref={searchRef}
          placeholder={pageData.searchByNumberOrder}
          className="pos-order-search-input"
          id="pos-order-search-input"
          onChange={onSearchOrder}
        />
        {showClearBtn && (
          <div className="clear-btn" onClick={() => handlePosOrderClear()}>
            <CloseModalCheckoutOrderIcon />
          </div>
        )}
      </div>
      <div className="pos-order-type-list">
        {orderStatus === OrderStatus.ToConfirm ?
          (
            <>
              <Checkbox.Group onChange={onChangeOrderPlatform}>
                <div className="pos-order-type">
                  <Checkbox value={OrderPlatform.GoFnBApp.id}>{OrderPlatform.GoFnBApp.name}</Checkbox>
                </div>
                <div className="pos-order-type">
                  <Checkbox value={OrderPlatform.Web.id}>{OrderPlatform.Web.name}</Checkbox>
                </div>
                <div className="pos-order-type">
                  <Checkbox value={OrderPlatform.App.id}>{OrderPlatform.App.name}</Checkbox>
                </div>
              </Checkbox.Group>
            </>
          ) : (
            <>
              <Checkbox.Group onChange={onChangeOrderType}>
                <div className="pos-order-type">
                  <Checkbox value={OrderTypeStatus.InStore}>{pageData.inStore}</Checkbox>
                </div>
                <div className="pos-order-type">
                  <Checkbox value={OrderTypeStatus.TakeAway}>{pageData.takeAway}</Checkbox>
                </div>
                <div className="pos-order-type">
                  <Checkbox value={OrderTypeStatus.Delivery}>{pageData.delivery}</Checkbox>
                </div>
                {orderStatus !== OrderStatus.Draft && (
                <div className="pos-order-type">
                  <Checkbox value={OrderTypeStatus.Online}>{pageData.online}</Checkbox>
                </div>)}
              </Checkbox.Group>
            </>)}
      </div>
      
      <div className="pos-order-list">
        {listOrder?.length > 0 ? (
          <div className="pos-order-wrapper">
            {listOrder?.map((item) => (
              <>
                <div className="order-content-card">
                  <div className="order-content-header">
                    <div className="order-code" onClick={() => onShowOrderDetail(item?.id)}>
                      #{item?.stringCode}
                    </div>
                    <div className="order-type">
                      {renderOrderType(item?.orderTypeId)}
                      {renderOrderTypeName(item?.orderTypeName, item?.orderTypeId, item?.platform?.id)}
                    </div>
                  </div>
                  <div className="order-content">
                    {item?.orderTypeId == OrderTypeStatus.InStore && (
                      <div className="location">
                        <span className="icon-text">
                          <LocationPosOrder />
                          {pageData.location}
                        </span>
                        <span className="order-content-text">
                          {item?.areaName ? `${item?.areaName} - ${item?.areaTableName}` : "__"}
                        </span>
                      </div>
                    )}
                    {item?.orderTypeId == OrderTypeStatus.TakeAway && <div className="location"></div>}
                    {(item?.orderTypeId == OrderTypeStatus.Delivery
                      || item?.orderTypeId == OrderTypeStatus.Online) && (
                      <div className="address">
                        <span className="icon-text">
                          <AddressPosOrder />
                          {pageData.address}
                        </span>
                        <span className="order-content-text text-line-clamp-1 ml-5">
                          {item?.receiverAddress ? item?.receiverAddress : "__"}
                        </span>
                      </div>
                    )}
                    <div className="dish">
                      <span className="icon-text">
                        <DishPosOrder />
                        {pageData.dish}
                      </span>
                      <span className="order-content-text">{displayDish(item)}</span>
                    </div>
                    <div className="time">
                      <span className="icon-text">
                        <TimePosOrder />
                        {pageData.time}
                      </span>
                      <span className="order-content-text">
                        {formatDate(item?.createdTime, DatetimeFormat.HH_MM_SS)}
                      </span>
                    </div>

                    {(orderStatus === OrderStatus.Completed || orderStatus === OrderStatus.Canceled || orderStatus === OrderStatus.ToConfirm) && (
                      <div className="total-bill">
                        <span className="icon-text">
                          <TotalBillPosOrder />
                          {pageData.totalBill}
                        </span>
                        <span className="order-content-text">
                          {formatCurrency(item?.priceAfterDiscount + item?.totalTax + item?.totalFee + item?.deliveryFee)}
                        </span>
                      </div>
                    )}

                    <div className="order-content-footer">
                      {orderStatus === OrderStatus.Draft && (
                        <div
                          className="btn-print-completed pointer"
                          onClick={() => onHandelEditOrder(item?.id, item?.orderTypeId, item?.orderPaymentStatusId)}
                        >
                          <EditFillIcon />
                          <span>{pageData.editOrder}</span>
                        </div>
                      )}
                      {orderStatus === OrderStatus.Completed ? (
                        item?.orderPaymentStatusId === OrderPaymentStatus.Paid ? (
                          <div className="btn-print-completed pointer" onClick={() => printBill(item?.id)}>
                            <PrintPosOrder />
                            {pageData.printBill}
                          </div>
                        ) : (
                          <div className="btn-pay p-0 m-0 pointer w-100" onClick={() => openPaymentMethod(item?.id)}>
                            <div className="m-auto d-flex">
                              <PayPosOrder />
                              <span className="m-auto">{pageData.pay}</span>
                            </div>
                          </div>
                        )
                      ) : (
                        orderStatus !== OrderStatus.Canceled &&
                        orderStatus !== OrderStatus.Draft &&
                        orderStatus !== OrderStatus.ToConfirm && (
                          <>
                            {item?.orderPaymentStatusId === OrderPaymentStatus.Paid && (
                              <div className="btn-pay p-0 pointer" onClick={() => onCompleteOrder(item?.id)}>
                                <div className="m-auto d-flex">
                                  <PayPosOrder />
                                  <span className="m-auto">{pageData.completeOrder}</span>
                                </div>
                              </div>
                            )}
                            {item?.orderPaymentStatusId === OrderPaymentStatus.Unpaid && (
                              <div className="btn-pay p-0 pointer" onClick={() => openPaymentMethod(item?.id)}>
                                <div className="m-auto d-flex">
                                  <PayPosOrder />
                                  <span className="m-auto">{pageData.pay}</span>
                                </div>
                              </div>
                            )}
                            <div className="btn-print pointer" onClick={() => printBill(item?.id)}>
                              <PrintPosOrder />
                            </div>
                          </>
                        )
                      )}
                      {
                        orderStatus == OrderStatus.ToConfirm &&
                        <div className="btn-confirm p-0 pointer w-100" onClick={() => onConfirmOrder(item?.id)}>
                          <div className="m-auto d-flex">
                            <ToConfirmPosOrder />
                            <span className="m-auto">{pageData.confirmOrder}</span>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
                <div className="d-none">
                  <ReceiptTemplateComponent ref={billTemplateRef} />
                </div>
              </>
            ))}
          </div>
        ) : (
          <div className="no-data-found">
            <NoDataFoundIcon />
            <span>No Data Found</span>
          </div>
        )}
      </div>
    </>
  );
}
