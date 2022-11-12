import { Col, Form, Input, message, Modal, Row } from "antd";
import orderBroadcast from "broadcast-channels/order-broadcast-channel";
import { FnbPrintBillComponent } from "components/fnb-order-bill/fnb-print-bill.component";
import { BroadcastActions } from "constants/broadcast-actions.constants";
import {
  CloseModalCheckoutOrderIcon,
  PaymentMethodCashIcon,
  QrCodeScanIcon,
  QrCodeScanWhiteIcon,
  UpcScanIcon,
  UpcScanWhiteIcon,
} from "constants/icons.constants";
import { images } from "constants/images.constants";
import { languageCode } from "constants/language.constants";
import { momoPaymentResponseCode } from "constants/momo-payment-response-code.constants";
import { VNPayPaymentMethod } from "constants/payment-method.constants";
import { SecondaryScreenTabName } from "constants/secondary-screen-tab-name.constants";
import orderDataService from "data-services/order/order-data.service";
import paymentDataService from "data-services/payment/payment-data.service";
import React, { useEffect, useState } from "react";
import BarcodeReader from "react-barcode-reader";
import { useTranslation } from "react-i18next";
import languageService from "services/language/language.service";
import { formatCurrencyWithSymbol } from "utils/helpers";
import CalculatorKeyboard from "./calculator-keyboard.component";
import "./payment-method.component.scss";

export const PaymentMethodTab = {
  Cash: 0,
  VnPay: 1,
  CreditDebit: 3,
  Momo: 4,
};

export default function PaymentMethod(props) {
  const tabKeyEnum = {
    cash: 1,
    vnPay: 2,
    moMo: 3,
  };

  const buttonPaymentMomoKeyEnum = {
    default: 0,
    qrCode: 1,
    scan: 2,
  };

  const [t] = useTranslation();
  const billRef = React.useRef();
  const refreshInput = React.useRef(null);
  const { handleCancel, onCompleted, isModalVisible, callBack } = props;
  const [orderData, setOrderData] = useState();
  const [formScanCodeMomoPos] = Form.useForm();
  const [barcode, setBarcode] = React.useState("");
  const [isShowMomoPayment, setIsShowMomoPayment] = useState(false);
  const [isShowVnPayPayment, setIsShowVnPayPayment] = useState(false);
  const [showCancelButton, setShowCancelButton] = useState(false);
  const [showCancelButtonMomo, setShowCancelButtonMomo] = useState(false);
  const [isShowCashPayment, setIsShowCashPayment] = useState(false);
  const [tabKey, setTabKey] = useState(tabKeyEnum.cash);
  const [buttonPaymentMomoActive, setButtonPaymentMomoActive] = useState(null);
  const [buttonPaymentVnPayActive, setButtonPaymentVnPayActive] = useState(false);

  const pageData = {
    saveDraftOrderNotify: t("posOrder.saveDraftOrderNotify"),
    btnPay: t("button.pay"),
    method: t("payment.method"),
    cash: t("payment.cash"),
    visa: t("payment.visa"),
    momo: t("payment.momo"),
    vnPay: t("payment.vnPay"),
    paymentInformation: t("payment.paymentInformation"),
    receivedMoney: t("payment.receivedMoney"),
    payMoney: t("payment.payMoney"),
    changeMoney: t("payment.changeMoney"),
    paySuccess: t("payment.paySuccess"),
    scanCustomerPaymentCode: t("payment.scanCustomerPaymentCode"),
    createQRCodeForPayment: t("payment.createQRCodeForPayment"),
    paymentSuccessful: t("payment.paymentSuccessful"),
    paymentUnsuccessful: t("payment.paymentUnsuccessful"),
    paymentForOrder: t("payment.paymentForOrder"),
    scanPersonalQRCode: t("payment.scanPersonalQRCode"),
    createPOSPayment: t("payment.createPOSPayment"),
    cancelPayment: t("payment.cancelPayment"),
    amount: t("order.amount"),
    checkoutOrder: t("payment.checkoutOrder"),
    orderNo: t("payment.orderNo"),
  };

  useEffect(() => {
    props.tableFuncs.current = getInitDataAsync;

    if (isModalVisible) {
      setShowCancelButton(false);
      setShowCancelButtonMomo(false);
    } else {
      orderBroadcast?.postMessage({
        action: BroadcastActions.ClearScreen,
      });
    }
  }, [isModalVisible]);

  const getInitDataAsync = (data) => {
    if (data.isRefresh) {
      if (refreshInput.current) {
        refreshInput.current(true);
      }
    }

    orderDataService.getPOSOrderByIdForPaymentAsync(data.id).then((res) => {
      if (res) {
        const { id, code, price, originalCode, isShowMomoPayment, isShowVnPayPayment, isShowPaymentByCash } = res;
        setOrderData({
          id,
          code,
          price,
          originalCode,
        });
        setIsShowMomoPayment(isShowMomoPayment);
        setIsShowVnPayPayment(isShowVnPayPayment);
        setIsShowCashPayment(isShowPaymentByCash);

        if (isShowPaymentByCash) {
          setTabKey(tabKeyEnum.cash);
        } else if (isShowVnPayPayment) {
          setTabKey(tabKeyEnum.vnPay);
        } else if (isShowMomoPayment) {
          setTabKey(tabKeyEnum.moMo);
        }
      }
    });
  };

  //Handle momo payment
  //--> Create QR code for payment (MoMo)
  const handlePaymentUsingMoMoPaymentMethod = () => {
    if (!showCancelButtonMomo) {
      setButtonPaymentMomoActive(buttonPaymentMomoKeyEnum.qrCode);
      let currentDomain = window.location.origin;
      let values = {
        amount: orderData?.price,
        orderInfo: `${orderData?.code}`,
        redirectUrl: `${currentDomain}/secondary-screen/${SecondaryScreenTabName.Momo}`,
        orderId: orderData?.id,
      };

      paymentDataService.createNormalPaymentAsync(values).then((res) => {
        const { resultCode } = res;
        if (resultCode === 0) {
          orderBroadcast?.postMessage({
            action: BroadcastActions.RedirectMomo,
            data: {
              ...res,
              orderInfo: {
                ...res.orderInfo,
                originalCode: orderData?.originalCode,
              },
              paymentMethod: PaymentMethodTab.Momo,
            },
          });
          setShowCancelButtonMomo(true);
        }
      });
    }
  };

  const onCancelMomoPayment = () => {
    orderBroadcast?.postMessage({
      action: BroadcastActions.CancelMomoPayment,
    });
    onCancel();
  };

  //--> Scan customer payment code
  const onReceiveScan = (event) => {
    if (event && event.charCode === 13 && tabKey === tabKeyEnum.moMo) {
      formScanCodeMomoPos.setFieldsValue({
        PaymentCode: barcode,
      });
      onSubmitScanCustomerPaymentCode(barcode);
      setBarcode("");
    } else {
      let newBarcode = barcode + event.key;
      setBarcode(newBarcode);
    }
  };

  const updatePaymentCode = (value) => {
    setBarcode(value);
    formScanCodeMomoPos.setFieldsValue({
      PaymentCode: value,
    });
  };

  const onCancel = () => {
    if (props.saveDraftOrder && props.saveDraftOrder === true) {
      message.info(t(pageData.saveDraftOrderNotify, { orderCode: orderData?.code }));
    }

    setTabKey(tabKeyEnum.cash);
    setButtonPaymentMomoActive(buttonPaymentMomoKeyEnum.default);
    setButtonPaymentVnPayActive(false);
    setShowCancelButtonMomo(false);
    setShowCancelButton(false);
    handleCancel();
  };

  const onSubmitScanCustomerPaymentCode = (barcode) => {
    let langCode = languageService.getLang();
    if (langCode !== languageCode.vi) {
      langCode = languageCode.en;
    }

    const dataValues = {
      amount: orderData?.price,
      orderInfo: `${pageData.paymentForOrder} ${orderData?.code}`,
      paymentCode: barcode,
      lang: langCode,
      orderId: orderData?.id,
    };

    paymentDataService.createPosPaymentAsync(dataValues).then((res) => {
      const { status } = res;
      if (status === momoPaymentResponseCode.success) {
        orderBroadcast?.postMessage({
          action: BroadcastActions.PaymentSuccessfully,
        });
        setShowCancelButtonMomo(true);
      } else {
        message.error(pageData.paymentUnsuccessful);
        orderBroadcast?.postMessage({
          action: BroadcastActions.PaymentUnsuccessfully,
        });
      }
      updatePaymentCode("");
    });
  };

  /**
   * This function is used to handle data when the staff clicks on the button Create VNPAY QR Code.
   */
  const handlePaymentUsingVnPayPaymentMethod = async () => {
    if (!showCancelButton) {
      setButtonPaymentVnPayActive(true);
      let currentDomain = window.location.origin;
      let formData = {
        amount: orderData?.price,
        orderInfo: `${orderData?.code}`,
        redirectUrl: `${currentDomain}/secondary-screen/${SecondaryScreenTabName.VnPay}`,
        VNPayBankCode: VNPayPaymentMethod.qrCode,
        orderId: orderData?.id,
      };

      let result = await paymentDataService.createVNPayPaymentAsync(formData);
      if (result) {
        orderBroadcast?.postMessage({
          action: BroadcastActions.RedirectVnPay,
          data: {
            ...result,
            orderInfo: {
              ...result.orderInfo,
              originalCode: orderData?.originalCode,
            },
            paymentMethod: PaymentMethodTab.VnPay,
          },
        });
        setShowCancelButton(true);
      }
    }
  };

  /**
   * This function will be called when the staff clicks on the button Cancel Payment.
   */
  const onCancelPayment = () => {
    orderBroadcast?.postMessage({
      action: BroadcastActions.CancelPayment,
    });
    onCancel();
  };

  /**
   * This function is used to handle data when the staff clicks on the button Scan Customer Payment Code.
   * It will be built in the future.
   */
  const onPaymentWithBankAccountOnVnPay = () => {};

  // Change payment method
  const onChangePaymentMethod = (key) => {
    orderBroadcast?.postMessage({
      action: BroadcastActions.ChangePaymentMethod,
      data: undefined,
    });
    setTabKey(key);
    setButtonPaymentMomoActive(buttonPaymentMomoKeyEnum.default);
    setButtonPaymentVnPayActive(false);
    setShowCancelButton(false);
    setShowCancelButtonMomo(false);
  };

  const onPaymentCompleted = (orderId) => {
    // callback to parent
    if (onCompleted) {
      onCompleted(orderId);
    }

    // print bill
    if (billRef && billRef.current) {
      billRef.current.printBill(orderId);
    }
  };

  return (
    <>
      <FnbPrintBillComponent ref={billRef} />

      {props.isModalVisible && (
        <>
          <Modal
            className="modal-payment-method"
            visible={props.isModalVisible}
            footer={(null, null)}
            width={1036}
            centered
            onCancel={onCancel}
            maskClosable={false}
            closeIcon={<CloseModalCheckoutOrderIcon />}
          >
            <Row className="justify-content-center">
              <p className="title-text mb-0">{pageData.checkoutOrder}</p>
            </Row>
            <div className="wrapper-content">
              <div className="payment-method-option-box">
                <div className="payment-method-button-container">
                  {/* Cash */}
                  {isShowCashPayment && (
                    <button
                      className={`payment-method-button ${
                        tabKey === tabKeyEnum.cash && "payment-method-button-active"
                      }`}
                      onClick={() => onChangePaymentMethod(tabKeyEnum.cash)}
                    >
                      <Row>
                        <Col span={24}>
                          <PaymentMethodCashIcon />
                        </Col>
                      </Row>
                      <Row className="btn-text-row">
                        <Col span={24}>
                          <span className={`btn-text ${tabKey === tabKeyEnum.cash && "text-white"}`}>
                            {pageData.cash}
                          </span>
                        </Col>
                      </Row>
                    </button>
                  )}

                  {/* VnPay */}
                  {isShowVnPayPayment && (
                    <button
                      className={`payment-method-button ${
                        tabKey === tabKeyEnum.vnPay && "payment-method-button-active"
                      }`}
                      onClick={() => onChangePaymentMethod(tabKeyEnum.vnPay)}
                    >
                      <Row>
                        <Col span={24}>
                          <img src={images.paymentMethodVnPayImg} alt="VnPay"></img>
                        </Col>
                      </Row>
                      <Row className="btn-text-row">
                        <Col span={24}>
                          <span className={`btn-text ${tabKey === tabKeyEnum.vnPay && "text-white"}`}>
                            {pageData.vnPay}
                          </span>
                        </Col>
                      </Row>
                    </button>
                  )}

                  {/* Momo */}
                  {isShowMomoPayment && (
                    <button
                      className={`payment-method-button ${
                        tabKey === tabKeyEnum.moMo && "payment-method-button-active"
                      }`}
                      onClick={() => onChangePaymentMethod(tabKeyEnum.moMo)}
                    >
                      <Row>
                        <Col span={24}>
                          <img src={images.paymentMethodMomoImg} alt="MoMo"></img>
                        </Col>
                      </Row>
                      <Row className="btn-text-row">
                        <Col span={24}>
                          <span className={`btn-text ${tabKey === tabKeyEnum.moMo && "text-white"}`}>
                            {pageData.momo}
                          </span>
                        </Col>
                      </Row>
                    </button>
                  )}
                </div>
              </div>
              <div className="payment-method-content-box">
                <div>
                  {/* Cash */}
                  {tabKey === tabKeyEnum.cash && isShowCashPayment && (
                    <>
                      <CalculatorKeyboard
                        callBack={callBack}
                        tableFuncs={refreshInput}
                        oder={orderData}
                        onCompleted={onPaymentCompleted}
                        tabKey={tabKey}
                      />
                    </>
                  )}
                  {/* VnPay */}
                  {tabKey === tabKeyEnum.vnPay && (
                    <>
                      <div className="payment-method-vnpay-box">
                        <div className="order-box">
                          <div className="order-code-box">
                            <p className="order-no-text mb-0">{pageData.orderNo}</p>
                            <p className="order-code-text mb-0">#{orderData?.code}</p>
                          </div>
                          <div className="order-amount-box">
                            <span className="order-amount-text">{formatCurrencyWithSymbol(orderData?.price)}</span>
                          </div>
                        </div>
                        <Row className="payment-method-btn-box justify-content-center">
                          <button
                            className={`pay-btn ${buttonPaymentVnPayActive && "btn-active-background-vnpay"}`}
                            onClick={handlePaymentUsingVnPayPaymentMethod}
                          >
                            <div>
                              <QrCodeScanIcon />
                            </div>
                            <div className={`pay-btn-text`}>
                              <span>{pageData.createQRCodeForPayment}</span>
                            </div>
                          </button>
                        </Row>
                        <Row className="cancel-payment-btn-box justify-content-center">
                          {showCancelButton && (
                            <button className="btn-cancel-payment" onClick={onCancelPayment}>
                              {pageData.cancelPayment}
                            </button>
                          )}
                        </Row>
                      </div>
                    </>
                  )}
                  {/* Momo */}
                  {tabKey === tabKeyEnum.moMo && (
                    <>
                      <div className="payment-method-momo-box">
                        <div className="order-box">
                          <div className="order-code-box">
                            <p className="order-no-text mb-0">{pageData.orderNo}</p>
                            <p className="order-code-text mb-0">#{orderData?.code}</p>
                          </div>
                          <div className="order-amount-box">
                            <span className="order-amount-text">{formatCurrencyWithSymbol(orderData?.price)}</span>
                          </div>
                        </div>
                        <div className="payment-method-btn-box">
                          <button
                            className={`pay-btn ${
                              buttonPaymentMomoActive === buttonPaymentMomoKeyEnum.qrCode &&
                              "btn-active-background-momo"
                            }`}
                            onClick={handlePaymentUsingMoMoPaymentMethod}
                          >
                            <div>
                              {buttonPaymentMomoActive === buttonPaymentMomoKeyEnum.qrCode ? (
                                <QrCodeScanWhiteIcon />
                              ) : (
                                <QrCodeScanIcon />
                              )}
                            </div>
                            <div
                              className={`pay-btn-text ${
                                buttonPaymentMomoActive === buttonPaymentMomoKeyEnum.qrCode && "text-white"
                              }`}
                            >
                              <span>{pageData.createQRCodeForPayment}</span>
                            </div>
                          </button>
                          <button
                            className={`pay-btn ml-41 ${
                              buttonPaymentMomoActive === buttonPaymentMomoKeyEnum.scan && "btn-active-background-momo"
                            }`}
                            onClick={() => {
                              setButtonPaymentMomoActive(buttonPaymentMomoKeyEnum.scan);
                            }}
                          >
                            <div>
                              {buttonPaymentMomoActive === buttonPaymentMomoKeyEnum.scan ? (
                                <UpcScanWhiteIcon />
                              ) : (
                                <UpcScanIcon />
                              )}
                            </div>

                            <div
                              className={`pay-btn-text ${
                                buttonPaymentMomoActive === buttonPaymentMomoKeyEnum.scan && "text-white"
                              }`}
                            >
                              <span>{pageData.scanCustomerPaymentCode}</span>
                            </div>
                          </button>
                        </div>
                        <Row className="cancel-payment-btn-box justify-content-center">
                          {showCancelButtonMomo && (
                            <button className="btn-cancel-payment" onClick={onCancelMomoPayment}>
                              {pageData.cancelPayment}
                            </button>
                          )}
                        </Row>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Modal>

          {/* Scan barcode information*/}
          <div className="d-none">
            <Row>
              <Col span={24}>
                <BarcodeReader timeBeforeScanTest={1000} onReceive={onReceiveScan} />

                <Form form={formScanCodeMomoPos} layout="vertical">
                  <Form.Item
                    initialValue={orderData?.price}
                    label="Amount"
                    name={"Amount"}
                    rules={[{ required: true }]}
                  >
                    <Input min={1000} disabled />
                  </Form.Item>
                  <Form.Item
                    initialValue={`${pageData.paymentForOrder} ${orderData?.code}`}
                    label="OrderInfo"
                    name={"OrderInfo"}
                    rules={[{ required: true }]}
                  >
                    <Input disabled />
                  </Form.Item>
                  <Form.Item label="PaymentCode" name={"PaymentCode"} rules={[{ required: true }]}>
                    <Input placeholder={pageData.scanCustomerPaymentCode} disabled />
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </div>
        </>
      )}
    </>
  );
}
