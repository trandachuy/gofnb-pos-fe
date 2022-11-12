import { Col, Form, Input, message, Modal, Popover, Radio, Row } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { GoogleMapComponent } from "components/fnb-google-map/google-map.component";
import { FnbPrintBillComponent } from "components/fnb-order-bill/fnb-print-bill.component";
import { FnbSelectSingle } from "components/fnb-select-single/fnb-select-single";
import { AhamoveRequestConstants } from "constants/ahamove-request.constants";
import { EnumDeliveryMethod } from "constants/delivery-method.constants";
import {
  ArrowDropdownIcon,
  BagTickIcon,
  CloseCircleIcon,
  CloseModalEndShiftIcon,
  PurpleDotIcon,
} from "constants/icons.constants";
import { OrderStatus } from "constants/order-status.constants";
import { PaymentMethodConstants } from "constants/payment-method.constants";
import { DefaultCountryISO } from "constants/string.constants";
import deliveryMethodService from "data-services/delivery-method/delivery-method-data.service";
import orderDataService from "data-services/order/order-data.service";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "utils/helpers";
import "./delivery-order.scss";
import { PlacesAutocomplete } from "./places-auto-complete.component";

const { forwardRef, useImperativeHandle } = React;

export const DeliveryOrder = forwardRef((props, ref) => {
  const [t] = useTranslation();
  const billRef = React.useRef();
  const [form] = Form.useForm();
  const { isModalVisible, handleCancel, onCompleted } = props;
  const [listDeliveryMethod, setListDeliveryMethod] = useState([]);
  const [defaultDeliveryMethodId, setDefaultDeliveryMethodId] = useState(null);
  const [currentDeliveryMethod, setCurrentDeliveryMethod] = useState(null);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState(null);
  const [phoneCode, setPhoneCode] = useState(null);
  const [storeCountry, setStoreCountry] = useState(null);
  const [branchAddress, setBranchAddress] = useState(null);
  const [branchLocation, setBranchLocation] = useState(null);
  const [storeBankAccountInfo, setStoreBankAccountInfo] = useState(null);
  const [receiverLocation, setReceiverLocation] = useState(null);
  const [distance, setDistance] = useState({
    text: "0 km",
    value: 0,
  });
  const [shippingFee, setShippingFee] = useState(0);
  const [subtotal, setSubtotal] = useState(null);
  const [feeAmount, setFeeAmount] = useState(null);
  const [numberOfItems, setNumberOfItems] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [orderRequest, setOrderRequest] = useState(null);
  const [taxAmount, setTaxAmount] = useState(null);
  const [isDisabledCompleteButton, setIsDisabledCompleteButton] = useState(null);
  const autoCompleteRef = useRef();
  const googleMapRef = useRef();

  const prefixSelector = <label>+{phoneCode}</label>;
  const pageData = {
    title: t("orderDelivery.title"),
    receiverInfo: t("orderDelivery.receiverInfo"),
    name: {
      title: t("orderDelivery.name.title"),
      placeholder: t("orderDelivery.name.placeholder"),
      errorMessage: t("orderDelivery.name.errorMessage"),
    },
    phone: {
      title: t("orderDelivery.phone.title"),
      placeholder: t("orderDelivery.phone.placeholder"),
      errorMessage: t("orderDelivery.phone.errorMessage"),
      allowNumberOnly: t("orderDelivery.phone.allowNumberOnly"),
    },
    deliveryType: t("orderDelivery.deliveryType"),
    selfDelivery: t("orderDelivery.selfDelivery"),
    paymentType: t("orderDelivery.paymentType"),
    paymentMethod: t("orderDelivery.paymentMethod"),
    cash: t("orderDelivery.cash"),
    receiverAddress: {
      title: t("orderDelivery.receiverAddress.title"),
      placeholder: t("orderDelivery.receiverAddress.placeholder"),
      errorMessage: t("orderDelivery.receiverAddress.errorMessage"),
    },
    distance: t("orderDelivery.distance"),
    shippingFee: t("orderDelivery.shippingFee"),
    placeOrder: t("orderDelivery.placeOrder"),
    total: t("orderDelivery.total"),
    subtotal: t("orderDelivery.subtotal"),
    item: t("orderDelivery.item"),
    discount: t("orderDelivery.discount"),
    tax: t("orderDelivery.tax"),
    fee: t("orderDelivery.fee"),
    cod: t("orderDelivery.cod"),
    bankTransfer: t("orderDelivery.bankTransfer"),
    note: t("orderDelivery.note"),
    complete: t("orderDelivery.complete"),
    cashNote: t("orderDelivery.cashNote"),
    bankTransferDetail: {
      cardHolder: t("orderDelivery.bankTransferDetail.cardHolder"),
      accountNumber: t("orderDelivery.bankTransferDetail.accountNumber"),
      bankName: t("orderDelivery.bankTransferDetail.bankName"),
      branchName: t("orderDelivery.bankTransferDetail.branchName"),
      content: t("orderDelivery.bankTransferDetail.content"),
      swiftCode: t("orderDelivery.bankTransferDetail.swiftCode"),
      routingNumber: t("orderDelivery.bankTransferDetail.routingNumber"),
      contentNote: t("orderDelivery.bankTransferDetail.contentNote"),
    },
    createOrderSuccess: t("orderDelivery.createOrderSuccess"),
    ahamoveNotSupport: t("orderDelivery.ahamoveNotSupport"),
  };

  useImperativeHandle(ref, () => ({
    //Initial store data
    setInitData(data) {
      const { deliveryMethods, storeBankAccount, storeInformation } = data;

      //Set default form data
      setShippingFee(0);
      setDistance({ text: "0 km", value: 0 });

      //Delivery methods
      setListDeliveryMethod(deliveryMethods);
      if (deliveryMethods && deliveryMethods?.length > 0) {
        const defaultId = deliveryMethods[0]?.id;
        setDefaultDeliveryMethodId(defaultId);
        setIsDisabledCompleteButton(false);

        setCurrentDeliveryMethod(deliveryMethods[0]?.enumId);
        if (deliveryMethods[0]?.enumId === EnumDeliveryMethod.SelfDelivery) {
          setCurrentPaymentMethod(PaymentMethodConstants.COD);
        } else {
          setCurrentPaymentMethod(PaymentMethodConstants.Cash);
        }

        //Set init form values
        let formValue = form.getFieldsValue();
        formValue.deliveryMethodId = defaultId;
        form.setFieldsValue(formValue);
      } else {
        setDefaultDeliveryMethodId(null);
        setCurrentDeliveryMethod(null);
        setCurrentPaymentMethod(null);
        setIsDisabledCompleteButton(true);
      }

      //Store bank info
      setStoreBankAccountInfo(storeBankAccount);

      //Store info
      setPhoneCode(storeInformation?.phoneCode);
      setStoreCountry(storeInformation?.countryIso);
      setBranchAddress(storeInformation?.branchAddress);
      setBranchLocation(storeInformation?.branchLocation);
    },

    //Order request
    setOrderRequest(request) {
      setOrderRequest(request);
    },

    //Order data
    setBillingData(data) {
      if (data) {
        const subtotal = data?.originalPrice;
        setSubtotal(subtotal);
        setNumberOfItems(data?.numberOfItems);

        const discountAmount = data?.discountAmount;
        setDiscountAmount(discountAmount);
        const feeAmount = data?.feeAmount;
        setFeeAmount(feeAmount);
        const taxAmount = data?.totalTax;
        setTaxAmount(taxAmount);
        calculateTotalPrice(subtotal, feeAmount, shippingFee, discountAmount, taxAmount);
      }
    },

    //Customer info
    setCustomerInfo(customer) {
      if (customer) {
        //Set init form values
        let formValue = form.getFieldsValue();
        formValue.receiverName = customer?.customerName;
        formValue.receiverPhone = customer?.customerPhone;
        form.setFieldsValue(formValue);
      }
    },
  }));

  //Render bank transfer info
  const renderBankTransferInfo = () => {
    return (
      <>
        <div className="info-box">
          <span>
            <span className="dot-icon">
              <PurpleDotIcon />
            </span>
            <span className="text-left">{pageData.bankTransferDetail.cardHolder}: </span>
          </span>
          <span className="text-right">{storeBankAccountInfo?.accountHolder}</span>
        </div>
        <div className="info-box">
          <span>
            <span className="dot-icon">
              <PurpleDotIcon />
            </span>
            <span className="text-left">{pageData.bankTransferDetail.accountNumber}: </span>
          </span>
          <span className="text-right">{storeBankAccountInfo?.accountNumber}</span>
        </div>
        <div className="info-box">
          <span>
            <span className="dot-icon">
              <PurpleDotIcon />
            </span>
            <span className="text-left">{pageData.bankTransferDetail.bankName}: </span>
          </span>
          <span className="text-right">{storeBankAccountInfo?.bankName}</span>
        </div>
        <div className="info-box">
          <span>
            <span className="dot-icon">
              <PurpleDotIcon />
            </span>
            <span className="text-left">{pageData.bankTransferDetail.branchName}: </span>
          </span>
          <span className="text-right">{storeBankAccountInfo?.bankBranchName}</span>
        </div>

        {storeCountry !== DefaultCountryISO.vn && (
          <>
            <div className="info-box">
              <span>
                <span className="dot-icon">
                  <PurpleDotIcon />
                </span>
                <span className="text-left">{pageData.bankTransferDetail.swiftCode}: </span>
              </span>
              <span className="text-right">{storeBankAccountInfo?.swiftCode}</span>
            </div>
            <div className="info-box">
              <span>
                <span className="dot-icon">
                  <PurpleDotIcon />
                </span>
                <span className="text-left">{pageData.bankTransferDetail.routingNumber}: </span>
              </span>
              <span className="text-right">{storeBankAccountInfo?.routingNumber}</span>
            </div>
          </>
        )}

        <div className="info-box">
          <span>
            <span className="dot-icon">
              <PurpleDotIcon />
            </span>
            <span className="text-left">{pageData.bankTransferDetail.content}: </span>
          </span>
          <span className="text-right">{pageData.bankTransferDetail.contentNote}</span>
        </div>
      </>
    );
  };

  const onChangeDeliveryMethod = (value) => {
    const method = listDeliveryMethod?.find((x) => x.id === value)?.enumId;
    setCurrentDeliveryMethod(method);

    //Set shipping fee
    if (receiverLocation) {
      if (method === EnumDeliveryMethod.SelfDelivery) {
        setCurrentPaymentMethod(PaymentMethodConstants.COD);
        calculateSelfDeliveryShippingFee(distance.value);
      } else {
        setCurrentPaymentMethod(PaymentMethodConstants.Cash);
        calculateAhamoveShippingFee(receiverLocation);
      }
    }
  };

  const onChangePaymentMethod = (e) => {
    const value = e.target.value;
    setCurrentPaymentMethod(value);
  };

  const onSelectLocation = (location) => {
    setReceiverLocation(location);

    //Set google map marker
    if (googleMapRef && googleMapRef.current) {
      googleMapRef.current.setCenter(location.center);
    }
    if (autoCompleteRef && autoCompleteRef.current) {
      autoCompleteRef.current.setIsError(false);
    }

    calculateRoute(location);
  };

  //Calculate distance and duration between customer address and store address
  const calculateRoute = async (location) => {
    const directionService = new window.google.maps.DirectionsService();
    const results = await directionService.route({
      origin: branchLocation ?? branchAddress,
      destination: location.center,
      travelMode: window.google.maps.TravelMode.DRIVING,
    });

    //Set new distance
    const newDistance = {
      text: results.routes[0].legs[0].distance.text,
      value: results.routes[0].legs[0].distance.value,
    };
    setDistance(newDistance);

    //Set shipping fee
    if (currentDeliveryMethod === EnumDeliveryMethod.SelfDelivery) {
      calculateSelfDeliveryShippingFee(newDistance.value);
    } else {
      calculateAhamoveShippingFee(location);
    }
  };

  //Calculate Self delivery shipping fee
  const calculateSelfDeliveryShippingFee = async (distance) => {
    const result = await deliveryMethodService.calculateStoreShippingFeeRequestAsync({ distance: distance });
    if (result) {
      const shippingFee = result.shippingFee;
      setShippingFee(shippingFee);
      calculateTotalPrice(subtotal, feeAmount, shippingFee, discountAmount, taxAmount);
    }
  };

  //Calculate Ahamove shipping fee
  const calculateAhamoveShippingFee = async (location) => {
    let request = {
      estimateOrderAhamoveRequest: {
        orderTime: AhamoveRequestConstants.ORDER_TIME,
        serviceId: AhamoveRequestConstants.SERVICE_ID,
        senderAddress: {
          address: branchAddress,
        },
        receiverAddress: {
          address: location?.address,
          lat: location?.center?.lat,
          lng: location?.center?.lng,
        },
      },
    };

    const result = await deliveryMethodService.estimateAhamoveShippingFeeRequestAsync(request);
    if (result) {
      const { estimatedOrderFeeResponse } = result;
      const shippingFee = estimatedOrderFeeResponse.total_price;
      setShippingFee(shippingFee);
      calculateTotalPrice(subtotal, feeAmount, shippingFee, discountAmount, taxAmount);
    }
  };

  //Calculate total price
  const calculateTotalPrice = (subtotal, feeAmount, shippingFee, discountAmount, taxAmount) => {
    setTotalPrice(subtotal + feeAmount + shippingFee - discountAmount + taxAmount);
  };

  const onFinish = async () => {
    const values = await form.validateFields();

    //Check order Ahamove when distance is too far
    if (currentDeliveryMethod === EnumDeliveryMethod.AhaMove && shippingFee === 0) {
      message.error(pageData.ahamoveNotSupport);
      return;
    }

    //Check if empty address
    if (!receiverLocation) {
      message.error(pageData.receiverAddress.errorMessage);
      if (autoCompleteRef && autoCompleteRef.current) {
        autoCompleteRef.current.setIsError(true);
      }
      return;
    } else {
      if (autoCompleteRef && autoCompleteRef.current) {
        autoCompleteRef.current.setIsError(false);
      }
    }

    //Get order status
    const orderStatus =
      currentDeliveryMethod === EnumDeliveryMethod.SelfDelivery ? OrderStatus.Delivering : OrderStatus.Processing;

    //Get payment status
    const isPaid =
      currentDeliveryMethod === EnumDeliveryMethod.SelfDelivery
        ? currentPaymentMethod === PaymentMethodConstants.COD
          ? false
          : true
        : true;

    const createOrderRequest = {
      ...orderRequest,
      ...values,
      isDeliveryOrder: true,
      deliveryFee: shippingFee,
      orderStatus: orderStatus,
      enumPaymentMethodId:
        currentDeliveryMethod === EnumDeliveryMethod.AhaMove ? PaymentMethodConstants.Cash : currentPaymentMethod,
      paid: isPaid,
      totalTax: taxAmount,
      receiverAddress: {
        address: receiverLocation?.address,
        lat: receiverLocation?.center?.lat,
        lng: receiverLocation?.center?.lng,
      },
    };

    const response = await orderDataService.createPOSOrderAsync(createOrderRequest);
    if (response) {
      const { success, data } = response;
      if (success) {
        message.success(pageData.createOrderSuccess);
        if (data?.orderId) {
          printBill(data?.orderId);
        }
        onCompleteOrder();
      } else {
        message.error(response?.message);
      }
    }
  };

  const printBill = (orderId) => {
    // print bill
    if (billRef && billRef.current) {
      billRef.current.printBill(orderId);
    }
  };

  //Clear location data after cancel or completed order
  const onSetEmptyLocation = () => {
    setReceiverLocation(null);
  };

  const onResetFields = () => {
    if (autoCompleteRef && autoCompleteRef.current) {
      autoCompleteRef.current.clearCurrentLocation();
    }
    form.resetFields();
    onSetEmptyLocation();
  };

  const onCompleteOrder = () => {
    onResetFields();
    onCompleted();
  };

  const onCancel = () => {
    onResetFields();
    handleCancel();
  };

  return (
    <>
      <FnbPrintBillComponent ref={billRef} />
      <Modal
        visible={isModalVisible}
        footer={(null, null)}
        onCancel={onCancel}
        width={1289}
        centered
        className="delivery-order-modal"
        closeIcon={<CloseModalEndShiftIcon />}
      >
        <Form autoComplete="off" form={form}>
          <Row className="justify-content-center">
            <p className="title-text">{pageData.title}</p>
          </Row>
          <Row gutter={[32, 32]} className="info-wrapper">
            <Col span={12}>
              <div className="receiver-info-wrapper">
                <p className="label-text">{pageData.receiverInfo}</p>
                <div className="receiver-info-container">
                  <div className="receiver-info-content">
                    <p className="form-text">
                      {pageData.name.title}
                      <span className="text-danger">*</span>
                    </p>
                    <Form.Item
                      name={"receiverName"}
                      rules={[
                        {
                          required: true,
                          message: pageData.name.errorMessage,
                        },
                      ]}
                    >
                      <Input
                        className="fnb-input mt-12"
                        maxLength={100}
                        placeholder={pageData.name.placeholder}
                        allowClear={{ clearIcon: <CloseCircleIcon /> }}
                      ></Input>
                    </Form.Item>
                    <p className="form-text mt-40">
                      {pageData.phone.title}
                      <span className="text-danger">*</span>
                    </p>
                    <Form.Item
                      name={"receiverPhone"}
                      rules={[
                        {
                          required: true,
                          message: pageData.phone.errorMessage,
                        },
                        {
                          pattern: /^\d+$/g,
                          message: pageData.phone.allowNumberOnly,
                        },
                      ]}
                    >
                      <Input
                        className="fnb-input-addon-before mt-12"
                        size="large"
                        placeholder={pageData.phone.placeholder}
                        addonBefore={prefixSelector}
                        maxLength={15}
                      />
                    </Form.Item>
                  </div>
                </div>
                <p className="label-text mt-40">{pageData.deliveryType}</p>
                <div className="mt-22">
                  <Form.Item name={"deliveryMethodId"}>
                    <FnbSelectSingle
                      onChange={onChangeDeliveryMethod}
                      defaultValue={isDisabledCompleteButton ? null : defaultDeliveryMethodId}
                      option={listDeliveryMethod?.map((item) => ({
                        id: item.id,
                        name: item.enumId === EnumDeliveryMethod.SelfDelivery ? pageData.selfDelivery : item.name,
                      }))}
                      showSearch
                    ></FnbSelectSingle>
                  </Form.Item>
                </div>

                {listDeliveryMethod && listDeliveryMethod?.length > 0 && (
                  <>
                    <p className="label-text mt-34">{pageData.paymentMethod}</p>
                    <div className="mt-22">
                      <Form.Item className="mb-0">
                        {currentDeliveryMethod === EnumDeliveryMethod.SelfDelivery ? (
                          <Radio.Group
                            defaultValue={PaymentMethodConstants.COD}
                            onChange={(e) => onChangePaymentMethod(e)}
                            value={currentPaymentMethod}
                          >
                            <Radio value={PaymentMethodConstants.COD}>{pageData.cod}</Radio>
                            <Radio value={PaymentMethodConstants.BankTransfer}>
                              <div className="d-flex">
                                {pageData.bankTransfer}
                                {currentPaymentMethod === PaymentMethodConstants.BankTransfer && (
                                  <Popover
                                    content={renderBankTransferInfo()}
                                    overlayClassName="bank-transfer-info"
                                    trigger={["click"]}
                                  >
                                    <div className="bank-transfer-icon-box">
                                      <span>
                                        <ArrowDropdownIcon />
                                      </span>
                                    </div>
                                  </Popover>
                                )}
                              </div>
                            </Radio>
                          </Radio.Group>
                        ) : (
                          <Radio checked="checked" value={PaymentMethodConstants.Cash} className="mb-0">
                            <span>{pageData.cash}</span>
                            <br></br>
                            <span className="note-text">{pageData.cashNote}</span>
                          </Radio>
                        )}
                      </Form.Item>
                    </div>
                  </>
                )}

                <p
                  className={`label-text ${
                    currentDeliveryMethod === EnumDeliveryMethod.SelfDelivery ? "mt-34" : "mt-18"
                  }`}
                >
                  {pageData.note}
                </p>
                <Form.Item name={"note"}>
                  <TextArea maxLength={255} className="fnb-text-area mt-22 no-resize h-84" />
                </Form.Item>
              </div>
            </Col>
            <Col span={12}>
              <div className="address-total-info-wrapper">
                <p className="label-text">{pageData.receiverAddress.title}</p>
                <div className="google-map-container">
                  <PlacesAutocomplete
                    ref={autoCompleteRef}
                    onSelectLocation={onSelectLocation}
                    onEmptyLocation={onSetEmptyLocation}
                  ></PlacesAutocomplete>
                  <GoogleMapComponent ref={googleMapRef} className="google-map-box"></GoogleMapComponent>
                </div>
                <div className="total-info-container">
                  <div className="total-info-box">
                    <div className="subtotal-box display-inline-text">
                      <span className="text-left">{`${pageData.subtotal} (${numberOfItems} ${pageData.item})`}</span>
                      <span className="text-right"> {formatCurrency(subtotal)}</span>
                    </div>
                    <div className="tax-box display-inline-text">
                      <span className="text-left">{pageData.tax}</span>
                      <span className="text-right">+ {formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="discount-box display-inline-text">
                      <span className="text-left">{pageData.discount}</span>
                      <span className="text-right">- {formatCurrency(discountAmount)}</span>
                    </div>
                    <div className="fee-box display-inline-text">
                      <span className="text-left">{pageData.fee}</span>
                      <span className="text-right">{formatCurrency(feeAmount)}</span>
                    </div>
                    <div className="delivery-fee-box display-inline-text">
                      <span className="text-left">
                        {pageData.shippingFee} {`(${distance.text})`}
                      </span>
                      <span className="text-right">
                        {shippingFee && shippingFee > 0 ? formatCurrency(shippingFee) : "-"}
                      </span>
                    </div>
                    <div className="total-box display-inline-text">
                      <span className="text-left">{pageData.total}</span>
                      <span className="text-right">{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <div className="btn-complete-box">
              <button
                type="button"
                className={`btn-complete ${isDisabledCompleteButton && "btn-complete-disabled"}`}
                onClick={onFinish}
                disabled={isDisabledCompleteButton}
              >
                <span className="icon-complete">
                  <BagTickIcon />
                </span>
                <span className="text-complete">{pageData.complete}</span>
              </button>
            </div>
          </Row>
        </Form>
      </Modal>
    </>
  );
});
