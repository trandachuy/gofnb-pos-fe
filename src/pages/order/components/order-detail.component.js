import { Button, Col, Form, Layout, message, Popover, Row, Typography } from "antd";
import orderBroadcast from "broadcast-channels/order-broadcast-channel";
import { ComboCartItem } from "components/combo-cart-item/index";
import { ReceiptTemplateComponent } from "components/fnb-receipt/fnb-receipt-component";
import NotificationComponent from "components/notification/notification.component";
import { ProductPriceCartItem } from "components/product-price-cart-item/index";
import { Thumbnail } from "components/thumbnail/thumbnail";
import { BroadcastActions } from "constants/broadcast-actions.constants";
import {
  ArrowDropDownIcon,
  DeliveryPosOrder,
  DollarSquareIcon,
  EditFillIcon,
  GoFnBAppPosOrder,
  IconPayment,
  InStorePosOrder,
  LocationDeliveryIcon,
  OrderArea,
  OrderFeeIcon,
  OrderItemsIcon,
  OrderPaymentIcon,
  OrderTrashIcon,
  PrinterIcon,
  ReceiptDiscountIcon,
  ShippingFeeIcon,
  TakeAwayPosOrder,
  TicketDiscountIcon,
  TimeFillIcon,
  ToConfirmPosOrder,
} from "constants/icons.constants";
import { OrderPaymentStatus } from "constants/order-payment-status.constants";
import { OrderPlatform } from "constants/order-platform.constants";
import { OrderStatus } from "constants/order-status.constants";
import { OrderTypeStatus } from "constants/order-type-status.constants";
import { PermissionKeys } from "constants/permission-key.constants";
import { DatetimeFormat } from "constants/string.constants";
import orderDataService from "data-services/order/order-data.service";
import PaymentMethod from "pages/dashboard/components/payment/payment-method.component";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency, formatDate } from "utils/helpers";
import CancelConfirmComponent from "./cancel-confirm.component";
import "./index.scss";
const { Paragraph } = Typography;

export function OrderDetailComponent(props) {
  const [t] = useTranslation();
  const { posOrderDetail, onEdit, setShowOrderDetail, onFetchDataOrder, numberCartItems, saveDraftOrder } = props;
  const { Text } = Typography;
  const { Content } = Layout;
  const pageData = {
    items: t("posOrder.detail.items"),
    promotion: t("posOrder.detail.promotion"),
    editOrder: t("posOrder.detail.editOrder"),
    printBill: t("posOrder.detail.printBill"),
    cancelOrder: t("posOrder.detail.cancelOrder"),
    pay: t("posOrder.detail.pay"),
    confirmOrder: t("posOrder.detail.confirmOrder"),
    fee: t("posOrder.detail.fee"),
    confirmCancel: t("leaveDialog.confirmCancel"),
    confirmCancelContent: t("posOrder.detail.confirmCancelContent"),
    confirmRefundContent: t("posOrder.detail.confirmRefundContent"),
    orderCanceledSuccess: t("order.orderCanceledSuccess"),
    btnConfirmCancel: t("button.confirmCancel"),
    confirmCancelRefund: t("button.confirmCancelRefund"),
    btnIgnore: t("button.ignore"),
    completeOrder: t("posOrder.detail.completeOrder"),
    orderCompletedSuccess: t("order.orderCompletedSuccess"),
    orderHasPaid: t("posOrder.detail.orderHasPaid"),
    orderDelivery: t("posOrder.detail.orderDelivery"),
    orderDraft: t("posOrder.detail.orderDraft"),
    btnSaveDraft: t("posOrder.detail.btnSaveDraft"),
    paymentMethod: t("payment.method"),
    total: t("invoice.total"),
    cancelOder: t("posOrder.detail.cancelOderText"),
    subtotal: t("posOrder.detail.subtotal"),
    shippingFee: t("posOrder.detail.shippingFee"),
    deliveryAddress: t("posOrder.detail.deliveryAddress"),
    orderPaidNotify: t("posOrder.orderPaidNotify"),
    btnIGotIt: t("form.buttonIGotIt"),
    tax: t("orderDelivery.tax"),
    cancelOrderPaidNotify: t("posOrder.detail.cancelOrderPaidNotify"),
  };

  const billTemplateRef = React.useRef(null);
  const oderPayment = useRef(null);
  const [form] = Form.useForm();
  const [isChangeForm, setIsChangeForm] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [isConfirmCancel, setIsConfirmCancel] = useState(false);
  const [isShowNotification, setIsShowNotification] = useState(false);
  const [contentNotification, setContentNotification] = useState("");
  const [isShowSaveDraft, setIsShowSaveDraft] = useState(false);
  const [showWarningEditOrder, setShowWarningEditOrder] = useState(false);

  const onEditOrder = (orderId) => {
    setIsShowSaveDraft(false);
    if (posOrderDetail?.orderPaymentStatusId === OrderPaymentStatus.Paid) {
      setShowWarningEditOrder(true);
      return;
    }

    if (
      posOrderDetail?.orderTypeId === OrderTypeStatus.Delivery &&
      (posOrderDetail?.orderStatusId === OrderStatus.Processing ||
        posOrderDetail?.orderStatusId === OrderStatus.Delivering ||
        posOrderDetail?.orderStatusId === OrderStatus.Completed)
    ) {
      setContentNotification(pageData.orderDelivery);
      setIsShowNotification(true);
    } else if (posOrderDetail?.orderPaymentStatusId === OrderPaymentStatus.Paid) {
      setContentNotification(pageData.orderHasPaid);
      setIsShowNotification(true);
    } else {
      if (numberCartItems > 0) {
        setContentNotification(pageData.orderDraft);
        setIsShowSaveDraft(true);
        setIsShowNotification(true);
      } else {
        onEdit(orderId, false);
      }
    }
  };

  const onCancelOrder = () => {
    setIsConfirmCancel(true);
  };

  const openPaymentMethod = () => {
    setShowPaymentMethod(true);
    oderPayment.current({
      id: posOrderDetail?.id,
      isRefresh: true,
    });
  };

  const onCompletedPayment = () => {
    setShowPaymentMethod(false);
    setShowOrderDetail(false);
    onFetchDataOrder();
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

  const handleCancelOrder = (values) => {
    const currentOrder = {
      orderId: posOrderDetail?.id,
      orderStatusId: OrderStatus.Canceled,
      reason: values?.reason,
    };
    orderDataService.updateOrderStatusAsync(currentOrder).then((res) => {
      if (res) {
        message.success(pageData.orderCanceledSuccess);
        setShowOrderDetail(false);
        setIsConfirmCancel(false);
        onFetchDataOrder();
      }
    });
  };

  const handleCompleteOrder = () => {
    const currentOrder = {
      orderId: posOrderDetail?.id,
      orderStatusId: OrderStatus.Completed,
    };
    orderDataService.updateOrderStatusAsync(currentOrder).then((res) => {
      if (res) {
        message.success(pageData.orderCompletedSuccess);
        setShowOrderDetail(false);
        onFetchDataOrder();
      }
    });
    orderBroadcast?.postMessage({
      action: BroadcastActions.ShowThanks,
    });
  };

  const handleConfirmOrder = () => {
    const currentOrder = {
      orderId: posOrderDetail?.id,
      orderStatusId: OrderStatus.Processing,
    };
    orderDataService.updateOrderStatusAsync(currentOrder).then((res) => {
      if (res) {
        setShowOrderDetail(false);
        onFetchDataOrder();
      }
    });
  };

  const contentFee = (
    <>
      {posOrderDetail?.fees?.map((fee) => {
        var check = posOrderDetail?.orderFeeIds.find((x) => x === fee.id);
        if (check) {
          return (
            <>
              <span className="title-detail">{`${fee?.name}${fee.isPercentage ? "(-" + fee.value + "%)" : ""}`}</span>
              <span className="detail-value">
                {fee.isPercentage === true
                  ? formatCurrency((fee.value * posOrderDetail?.originalPrice) / 100)
                  : formatCurrency(fee.value)}{" "}
              </span>
              <br />
            </>
          );
        }
      })}
    </>
  );

  const contentDelivery = (
    <>
      <div className="title-delivery-address">
        <LocationDeliveryIcon />
        <span> {pageData.deliveryAddress}</span>
      </div>
      <br />
      <span className="title-delivery">{posOrderDetail?.receiverInfo}</span>
      <div className="title-delivery">
        <span>{posOrderDetail?.receiverAddress}</span>
      </div>
    </>
  );

  const contentPromotion = (
    <>
      {
        <>
          {posOrderDetail?.discountTotalPromotion?.name && (
            <>
              <span className="title-detail">{posOrderDetail?.discountTotalPromotion?.name}</span>
              <span className="detail-value">
                {formatCurrency(
                  posOrderDetail?.discountTotalPromotion?.discountValue >
                    posOrderDetail?.discountTotalPromotion?.maximumDiscountAmount
                    ? posOrderDetail?.discountTotalPromotion?.maximumDiscountAmount
                    : posOrderDetail?.discountTotalPromotion?.discountValue
                )}
              </span>
              <br />
            </>
          )}
        </>
      }
      {posOrderDetail?.cartItems?.map((cartItem, index) => {
        return (
          <>
            {cartItem?.promotion?.name && (
              <>
                <span className="title-detail">{`${cartItem?.promotion?.name}${
                  cartItem?.promotion?.isPercentDiscount ? "(-" + cartItem?.promotion?.percentNumber + "%)" : ""
                }`}</span>
                <span className="detail-value">{formatCurrency(cartItem?.promotion?.discountValue)}</span>
                <br />
              </>
            )}
          </>
        );
      })}
    </>
  );

  const calTotalDiscountItems = () => {
    let discountCombo = 0;
    if (posOrderDetail?.orderTypeId === OrderTypeStatus.Online) {
      return posOrderDetail?.totalDiscountAmount;
    }

    posOrderDetail?.cartItems?.map((item) => {
      if (item?.isCombo) {
        discountCombo += (item?.originalPrice - item?.priceAfterDiscount) * item?.quantity;
      }
    });

    const totalDiscount = posOrderDetail?.promotionDiscountValue + discountCombo;
    return totalDiscount > 0 ? totalDiscount : posOrderDetail?.totalDiscountAmount;
  };

  const onSaveDraft = () => {
    saveDraftOrder();
    onEdit(posOrderDetail?.id, true);
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

  return (
    <>
      <NotificationComponent
        isModalVisible={showWarningEditOrder}
        handleCancel={() => setShowWarningEditOrder(false)}
        content={pageData.orderHasPaid}
        hideIgnoreBtn
        textBtnSave={pageData.btnIGotIt}
        onSave={() => setShowWarningEditOrder(false)}
      />
      {renderPaymentMethod()}
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
      <Form
        autoComplete="off"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 24,
        }}
        onFieldsChange={() => {
          if (!isChangeForm) setIsChangeForm(true);
        }}
        form={form}
        className="order-detail-form-style"
      >
        <div className="title-order-detail-modal">#{posOrderDetail?.orderCode}</div>
        <div className="header-order-detail-modal">
          {OrderTypeStatus.InStore === posOrderDetail?.orderTypeId ? (
            <>
              <div className="order-header">
                <div className="order-type">
                  <InStorePosOrder />
                  <span className="order-text-header">{posOrderDetail?.orderType}</span>
                </div>
                <div className="order-time">
                  <TimeFillIcon />
                  <span className="order-text-header">
                    {formatDate(posOrderDetail?.orderTime, DatetimeFormat.HH_MM_SS)}
                  </span>
                </div>
                <div className="order-total-items">
                  <OrderItemsIcon />
                  <span className="order-text-header">
                    {posOrderDetail?.cartItems?.reduce((total, currentValue) => total + currentValue.quantity, 0)}{" "}
                    {pageData.items}
                  </span>
                </div>
                {posOrderDetail?.areaTable?.areaName && (
                  <div className="order-area">
                    <OrderArea />
                    <span className="order-text-header">
                      {posOrderDetail?.areaTable?.areaName
                        ? posOrderDetail?.areaTable?.tableName
                          ? `${posOrderDetail?.areaTable?.areaName}-${posOrderDetail?.areaTable?.tableName}`
                          : posOrderDetail?.areaTable?.areaName
                        : ""}
                    </span>
                  </div>
                )}
                <div className="order-current-status">
                  <span
                    className="order-status"
                    style={{
                      color: posOrderDetail?.orderStatusColor,
                      backgroundColor: posOrderDetail?.orderStatusBackgroundColor,
                    }}
                  >
                    {posOrderDetail?.orderStatusName}
                  </span>
                </div>
              </div>
            </>
          ) : OrderTypeStatus.Delivery === posOrderDetail?.orderTypeId ? (
            <>
              <div className="order-header-delivery">
                <div className="order-type">
                  <DeliveryPosOrder />
                  <span className="order-text-header">{posOrderDetail?.orderType}</span>
                </div>
                <div className="order-time">
                  <TimeFillIcon />
                  <span className="order-text-header">
                    {formatDate(posOrderDetail?.orderTime, DatetimeFormat.HH_MM_SS)}
                  </span>
                </div>
                <div className="order-total-items">
                  <OrderItemsIcon />
                  <span className="order-text-header">
                    {posOrderDetail?.cartItems?.reduce((total, currentValue) => total + currentValue.quantity, 0)}{" "}
                    {pageData.items}
                  </span>
                </div>
                <div className="order-current-status">
                  <span
                    className="order-status"
                    style={{
                      color: posOrderDetail?.orderStatusColor,
                      backgroundColor: posOrderDetail?.orderStatusBackgroundColor,
                    }}
                  >
                    {posOrderDetail?.orderStatusName}
                  </span>
                </div>
              </div>
            </>
          ) : posOrderDetail?.orderTypeId === OrderTypeStatus.Online ? (
            <div className="order-header-delivery">
              <div className="order-type">
                <GoFnBAppPosOrder />
                <span className="order-text-header">{OrderPlatform.GoFnBApp.name}</span>
              </div>
              <div className="order-time">
                <TimeFillIcon />
                <span className="order-text-header">
                  {formatDate(posOrderDetail?.orderTime, DatetimeFormat.HH_MM_SS)}
                </span>
              </div>
              <div className="order-total-items">
                <OrderItemsIcon />
                <span className="order-text-header">
                  {posOrderDetail?.cartItems?.reduce((total, currentValue) => total + currentValue.quantity, 0)}{" "}
                  {pageData.items}
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="order-header-delivery">
                <div className="order-type">
                  <TakeAwayPosOrder />
                  <span className="order-text-header">{posOrderDetail?.orderType}</span>
                </div>
                <div className="order-time">
                  <TimeFillIcon />
                  <span className="order-text-header">
                    {formatDate(posOrderDetail?.orderTime, DatetimeFormat.HH_MM_SS)}
                  </span>
                </div>
                <div className="order-total-items">
                  <OrderItemsIcon />
                  <span className="order-text-header">
                    {posOrderDetail?.orderTotalItems} {pageData.items}
                  </span>
                </div>
                <div className="order-current-status">
                  <span
                    className="order-status"
                    style={{
                      color: posOrderDetail?.orderStatusColor,
                      backgroundColor: posOrderDetail?.orderStatusBackgroundColor,
                    }}
                  >
                    {posOrderDetail?.orderStatusName}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        <Content>
          <Row>
            <Col span={11}>
              <div className="order-detail-items-scroll">
                {posOrderDetail?.cartItems?.map((cartItem, index) => {
                  return (
                    <>
                      {cartItem.isCombo ? (
                        <ComboCartItem product={cartItem} index={index + 1000} />
                      ) : (
                        <ProductPriceCartItem product={cartItem} index={index + 1000} />
                      )}
                      <div style={{ height: 10 }}></div>
                    </>
                  );
                })}
              </div>
            </Col>
            <Col span={1}></Col>
            <Col span={12}>
              {posOrderDetail?.customerName ? (
                <div className="order-detail-customer-info">
                  <Row>
                    <Col span={3}>
                      <Thumbnail width={66} height={66} src={posOrderDetail?.customerThumbnail} />
                    </Col>
                    <Col span={21}>
                      <Row className="group-information-customer">
                        <Col span={12} className="item-information-customer">
                          <Row>
                            <Col span={24} className="item-customer-end">
                              <Paragraph
                                style={{ maxWidth: "inherit" }}
                                placement="top"
                                ellipsis={{ tooltip: posOrderDetail?.customerName }}
                                color="#50429B"
                              >
                                <span> {posOrderDetail?.customerName}</span>
                              </Paragraph>
                            </Col>
                          </Row>
                          <Row>
                            <Col span={24} className="item-customer-phone-end">
                              <Text strong>{posOrderDetail?.customerPhone}</Text>
                            </Col>
                          </Row>
                        </Col>
                        <Col span={3}></Col>
                        <Col span={8} className="item-information-customer">
                          <Row className="group-customer-rank">
                            <Col
                              span={24}
                              className="justify-center item-customer-rank"
                              style={{ textAlign: "center" }}
                            >
                              <Text>{posOrderDetail?.customerMemberShipLevel}</Text>
                            </Col>
                          </Row>
                          <Row className="group-customer-select-discount">
                            <Col
                              span={24}
                              className="justify-center item-customer-discount"
                              style={{ textAlign: "center" }}
                            >
                              <Text>{`-${posOrderDetail?.customerPercent}%`}</Text>
                            </Col>
                          </Row>
                        </Col>
                        <Col span={1}></Col>
                      </Row>
                    </Col>
                  </Row>
                </div>
              ) : (
                ""
              )}
              <div className="order-detail-info">
                <Row className="order-sub-total">
                  <Col span={12}>
                    <div>
                      <DollarSquareIcon />
                      <span className="order-sub-total-text">{pageData.subtotal}</span>
                    </div>
                  </Col>
                  <Col span={12}>
                    <span className="order-sub-total-value">{formatCurrency(posOrderDetail?.originalPrice)}</span>
                  </Col>
                </Row>
                {posOrderDetail?.orderTypeId === OrderTypeStatus.Delivery ||
                posOrderDetail?.orderTypeId === OrderTypeStatus.InStore ||
                posOrderDetail?.orderTypeId === OrderTypeStatus.Online ? (
                  <Row className="order-tax">
                    <Col span={10}>
                      <div className="order-tax-text">
                        <ReceiptDiscountIcon /> <span>{pageData.tax}</span>
                      </div>
                    </Col>
                    <Col span={6}></Col>
                    <Col span={8}>
                      <span className="order-tax-value">
                        {"+"}
                        {formatCurrency(posOrderDetail?.totalTax)}
                      </span>
                    </Col>
                  </Row>
                ) : (
                  <Row className="order-tax-take-away"> </Row>
                )}
                <Row className="order-promotion">
                  <Col span={10}>
                    <div className="order-promotion-text">
                      <TicketDiscountIcon /> <span>{pageData.promotion}</span>
                      <Popover
                        placement="bottomLeft"
                        content={contentPromotion}
                        overlayClassName="order-detail-popover"
                        trigger={["click"]}
                      >
                        {posOrderDetail?.promotionDiscountValue > 0 && <ArrowDropDownIcon className="arrow-icon" />}
                      </Popover>
                    </div>
                  </Col>
                  <Col span={6}></Col>
                  <Col span={8}>
                    <span className="order-promotion-value">
                      {"-"}
                      {formatCurrency(calTotalDiscountItems())}
                    </span>
                  </Col>
                </Row>
                <Row className="order-fee">
                  <Col span={10}>
                    <div className="order-fee-text">
                      <OrderFeeIcon /> <span>{pageData.fee}</span>
                      <Popover
                        content={contentFee}
                        placement="bottomLeft"
                        overlayClassName="order-detail-popover"
                        trigger={["click"]}
                      >
                        {posOrderDetail?.totalFee > 0 && <ArrowDropDownIcon className="arrow-icon" />}
                      </Popover>
                    </div>
                  </Col>
                  <Col span={6}></Col>
                  <Col span={8}>
                    <span className="order-fee-value">
                      {"+"}
                      {formatCurrency(posOrderDetail?.totalFee)}
                    </span>
                  </Col>
                </Row>
                <Row className="order-payment">
                  <Col span={10}>
                    <div>
                      <OrderPaymentIcon /> <span className="order-payment-text">{pageData.paymentMethod}</span>
                    </div>
                  </Col>
                  <Col span={6}></Col>
                  <Col span={8}>
                    <div className="order-payment-value">
                      <div className="payment-text"> {posOrderDetail?.paymentMethod} </div>
                      {posOrderDetail?.orderPaymentStatusId === OrderPaymentStatus.Paid ? (
                        <>
                          <div className="paid">
                            <div className="paid-text">{posOrderDetail?.orderPaymentStatus}</div>
                          </div>
                        </>
                      ) : posOrderDetail?.orderPaymentStatusId === OrderPaymentStatus.Refunded ? (
                        <div className="refunded">
                          <div className="refunded-text"> {posOrderDetail?.orderPaymentStatus}</div>
                        </div>
                      ) : (
                        <>
                          {posOrderDetail?.orderPaymentStatus && (
                            <div className="unpaid">
                              <div className="unpaid-text"> {posOrderDetail?.orderPaymentStatus}</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </Col>
                </Row>
                {OrderTypeStatus.Delivery === posOrderDetail?.orderTypeId && (
                  <Row
                    className="order-shipping"
                    style={
                      posOrderDetail?.orderPaymentStatusId === OrderPaymentStatus.Unpaid && {
                        marginTop: "22px",
                      }
                    }
                  >
                    <Col span={10}>
                      <div className="order-shipping-text">
                        <ShippingFeeIcon />{" "}
                        <span className="delivery-title">
                          {pageData.shippingFee}
                          <Popover
                            content={contentDelivery}
                            placement="bottomLeft"
                            overlayClassName="order-detail-popover"
                            trigger={["click"]}
                          >
                            <ArrowDropDownIcon className="arrow-icon" />
                          </Popover>
                        </span>
                        <br />
                        <span className="delivery-method">{posOrderDetail?.deliveryMethod}</span>
                      </div>
                    </Col>
                    <Col span={6}></Col>
                    <Col span={8}>
                      <span className="order-shipping-value">
                        {"+"}
                        {formatCurrency(posOrderDetail?.deliveryFee)}
                      </span>
                    </Col>
                  </Row>
                )}
                {posOrderDetail?.orderTypeId === OrderTypeStatus.Online && (
                  <Row
                    className="order-shipping"
                    style={
                      posOrderDetail?.orderPaymentStatusId === OrderPaymentStatus.Unpaid && {
                        marginTop: "22px",
                      }
                    }
                  >
                    <Col span={10}>
                      <div className="order-shipping-text">
                        <ShippingFeeIcon /> <span className="delivery-title">{pageData.shippingFee}</span>
                        <br />
                        <span className="delivery-method">{posOrderDetail?.deliveryMethod}</span>
                      </div>
                    </Col>
                    <Col span={6}></Col>
                    <Col span={8}>
                      <span className="order-shipping-value">
                        {"+"}
                        {formatCurrency(posOrderDetail?.deliveryFee)}
                      </span>
                    </Col>
                  </Row>
                )}
                <Row className="order-total">
                  <Col span={10}>
                    <span className="order-total-text">{pageData.total}</span>
                  </Col>
                  <Col span={6}></Col>
                  <Col span={8}>
                    <span className="order-total-value">
                      {posOrderDetail?.orderTypeId === OrderTypeStatus.Delivery ||
                      posOrderDetail?.orderTypeId === OrderTypeStatus.Online
                        ? formatCurrency(
                            posOrderDetail?.totalPriceAfterDiscount +
                              posOrderDetail?.totalTax +
                              posOrderDetail?.totalFee +
                              posOrderDetail?.deliveryFee -
                              posOrderDetail?.customerDiscountAmount
                          )
                        : formatCurrency(
                            posOrderDetail?.totalPriceAfterDiscount +
                              posOrderDetail?.totalTax +
                              posOrderDetail?.totalFee -
                              posOrderDetail?.customerDiscountAmount
                          )}
                    </span>
                  </Col>
                </Row>
              </div>
              <div className="oder-group-button">
                {posOrderDetail?.orderStatusId === OrderStatus.ToConfirm ? (
                  <>
                    <div
                      className="order-button-draft order-button-cancel"
                      onClick={() => onEditOrder(posOrderDetail?.id)}
                    >
                      <EditFillIcon className="edit-icon-style" /> <span>{pageData.editOrder}</span>
                    </div>
                    {posOrderDetail?.orderPaymentStatusId === OrderPaymentStatus.Unpaid && (
                      <div className="order-button-draft order-button-cancel" onClick={() => onCancelOrder(true)}>
                        <OrderTrashIcon /> <span>{pageData.cancelOder}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {OrderStatus.Canceled === posOrderDetail?.orderStatusId ? (
                      <>
                        <div className="order-button order-button-cancel" onClick={() => printBill(posOrderDetail?.id)}>
                          <PrinterIcon className="print-icon-style " /> <span>{pageData.printBill}</span>
                        </div>
                      </>
                    ) : OrderStatus.Draft === posOrderDetail?.orderStatusId ? (
                      <>
                        <div
                          className="order-button-draft order-button-cancel"
                          onClick={() => onEditOrder(posOrderDetail?.id)}
                        >
                          <EditFillIcon className="edit-icon-style" /> <span>{pageData.editOrder}</span>
                        </div>
                      </>
                    ) : OrderStatus.Completed === posOrderDetail?.orderStatusId ? (
                      <>
                        {posOrderDetail?.orderPaymentStatusId === OrderPaymentStatus.Paid ? (
                          <div
                            className="order-button order-button-cancel"
                            onClick={() => printBill(posOrderDetail?.id)}
                          >
                            <PrinterIcon className="print-icon-style " /> <span>{pageData.printBill}</span>
                          </div>
                        ) : (
                          <>
                            <div className="order-button" onClick={() => onEditOrder(posOrderDetail?.id)}>
                              <EditFillIcon className="edit-icon-style" /> <span>{pageData.editOrder}</span>
                            </div>
                            <div className="order-button" onClick={() => onCancelOrder(true)}>
                              <OrderTrashIcon /> <span>{pageData.cancelOder}</span>
                            </div>
                            <div className="order-button" onClick={() => printBill(posOrderDetail?.id)}>
                              <PrinterIcon className="print-icon-style " /> <span>{pageData.printBill}</span>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="order-button" onClick={() => onEditOrder(posOrderDetail?.id)}>
                          <EditFillIcon className="edit-icon-style" /> <span>{pageData.editOrder}</span>
                        </div>
                        <div className="order-button" onClick={() => onCancelOrder(true)}>
                          <OrderTrashIcon /> <span>{pageData.cancelOder}</span>
                        </div>
                        <div className="order-button" onClick={() => printBill(posOrderDetail?.id)}>
                          <PrinterIcon className="print-icon-style " /> <span>{pageData.printBill}</span>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
              {posOrderDetail?.orderStatusId === OrderStatus.ToConfirm ? (
                <>
                  <div className="group-action-payment">
                    <Button
                      size="large"
                      icon={<ToConfirmPosOrder className="icon-payment" />}
                      className="btn-payment-order"
                      onClick={handleConfirmOrder}
                    >
                      {pageData.confirmOrder}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {OrderStatus.Canceled !== posOrderDetail?.orderStatusId &&
                    OrderStatus.Completed !== posOrderDetail?.orderStatusId &&
                    (posOrderDetail?.orderPaymentStatusId === OrderPaymentStatus.Paid ? (
                      <div className="group-action-payment">
                        <Button
                          size="large"
                          icon={<IconPayment className="icon-payment" />}
                          className="btn-payment-order"
                          onClick={() => handleCompleteOrder()}
                        >
                          {pageData.completeOrder}
                        </Button>
                      </div>
                    ) : (
                      OrderStatus.Draft !== posOrderDetail?.orderStatusId && (
                        <div className="group-action-payment">
                          <Button
                            size="large"
                            icon={<IconPayment className="icon-payment" />}
                            className="btn-payment-order"
                            onClick={openPaymentMethod}
                          >
                            {pageData.pay}
                          </Button>
                        </div>
                      )
                    ))}
                  {OrderStatus.Completed === posOrderDetail?.orderStatusId &&
                    posOrderDetail?.orderPaymentStatusId === OrderPaymentStatus.Unpaid && (
                      <div className="group-action-payment">
                        <Button
                          size="large"
                          icon={<IconPayment className="icon-payment" />}
                          className="btn-payment-order"
                          onClick={openPaymentMethod}
                        >
                          {pageData.pay}
                        </Button>
                      </div>
                    )}
                </>
              )}
              <div hidden>
                <CancelConfirmComponent
                  title={pageData.confirmCancel}
                  content={
                    posOrderDetail?.orderPaymentStatusId === OrderPaymentStatus.Paid
                      ? pageData.confirmRefundContent
                      : pageData.confirmCancelContent
                  }
                  okText={
                    posOrderDetail?.orderPaymentStatusId === OrderPaymentStatus.Paid
                      ? pageData.confirmCancelRefund
                      : pageData.btnConfirmCancel
                  }
                  cancelText={pageData.btnIgnore}
                  buttonText={pageData.cancelOrder}
                  buttonType="TEXT"
                  permission={PermissionKeys.CANCEL_ORDER}
                  onOk={(values) => handleCancelOrder(values)}
                  onCancel={() => setIsConfirmCancel(false)}
                  visible={isConfirmCancel}
                  centered={true}
                />
              </div>
            </Col>
          </Row>
        </Content>
      </Form>
      <div className="d-none">
        <ReceiptTemplateComponent ref={billTemplateRef} />
      </div>
    </>
  );
}
