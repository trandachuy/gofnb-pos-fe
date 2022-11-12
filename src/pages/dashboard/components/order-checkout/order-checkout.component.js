import { CloseOutlined, MinusOutlined, PercentageOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Modal, Row, Select, Typography } from "antd";
import DeleteConfirmComponent from "components/delete-confirm-component/delete-confirm.component";
import { FnbAlertComponent } from "components/fnb-alert/fnb-alert.component";
import TextDanger from "components/text-danger";
import { Thumbnail } from "components/thumbnail/thumbnail";
import { EmptyId } from "constants/default.constants";
import {
  BagTickIcon,
  CloseModalIcon,
  IconDeleteWhite,
  IconPayment,
  IconVectorRight,
  IconVectorSave,
  ScanIcon,
  SearchIcon,
  ShoppingBagIcon,
  SubtractIcon,
  TrashIcon,
} from "constants/icons.constants";
import { OrderStatus } from "constants/order-status.constants";
import { OrderTypeStatus } from "constants/order-type-status.constants";
import { PromotionType } from "constants/promotion.constants";
import customerDataService from "data-services/customer/customer.service";
import orderDataService from "data-services/order/order-data.service";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TinyGesture from "tinygesture";
import { executeAfter, formatCurrency, formatStringWithParameters, roundNumber } from "utils/helpers";
import CreateCustomerPage from "../../../customer/components/create-customer.page";
import ViewMoreProductComboComponent from "../view-more-product-combo.component";
import "./order-checkout.component.scss";
const { Paragraph, Text } = Typography;
const { Option } = Select;

const { forwardRef, useImperativeHandle } = React;

export const OrderCheckoutComponent = forwardRef((props, ref) => {
  const [t] = useTranslation();
  const {
    onRemoveProduct,
    onChangeItemQuantity,
    originalPrice,
    totalPriceOnBill,
    totalFee,
    totalDiscountAmount,
    totalTax,
    onSaveOrder,
    onSaveDraftOrder,
    onSaveToConfirmOrder,
    openPaymentMethod,
    onShowFeeManagementDialog,
    onProductItemClick,
    editComboClick,
    onSelectCustomer,
    onDeSelectCustomer,
    handleShowDetailCustomer,
    currentOrderType,
    setCustomerInfo,
    cartItems,
    clearAllItems,
    clearAllItemsWhenEdit,
    isDiscountOnTotal,
    customerDiscountAmount,
  } = props;

  const customerRef = React.useRef();
  const [order, setOrder] = useState({});
  const [products, setProducts] = React.useState([]);
  const [showModalViewComboDetail, setModalViewComboDetail] = useState(false);
  const [productComboValue, setProductComboValue] = useState([]);
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [contentModalConfirm, setContentModalConfirm] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [isShowSearchCustomer, setIsShowSearchCustomer] = useState(true);
  const [selectCustomer, setSelectCustomer] = useState(null);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [messageConfirmForAddProductToOrder, setMessageConfirmForAddProductToOrder] = useState(null);
  const [showConfirmAddToCard, setShowConfirmAddToCard] = useState(false);
  const [dataChangeQuantity, setDataChangeQuantity] = useState({});
  const [isAllowOutOfMaterial, setIsAllowOutOfMaterial] = useState(false);
  const [isSaveDraffAndContinue, setIsSaveDraffAndContinue] = useState(false);
  const [editOrder, setEditOrder] = useState(false);

  const pageData = {
    subtotalText: t("orderCheckout.subtotalText"),
    subTotalDetail: "orderCheckout.subTotalDetail",
    discountText: t("orderCheckout.discountText"),
    feeText: t("orderCheckout.feeText"),
    totalText: t("orderCheckout.totalText"),
    placeholderSearchCustomer: t("orderCheckout.placeholderSearchCustomer"),
    orderNo: t("orderCheckout.orderNo"),
    confirmationOrderItemContent: t("messages.confirmEditOrderItem"),
    confirmationOrderItemTitle: t("messages.confirmEditOrderItemTitle"),
    buttonConfirmText: t("button.confirm"),
    customerAddNew: t("customer.addNewForm.titleAddNew"),
    placeOrder: t("orderDelivery.placeOrder"),
    percent: "%",
    buttonIGotIt: t("form.buttonIGotIt"),
    notificationTitle: t("form.notificationTitle"),
    messages: {
      allowOutOfMaterial: t("messages.allowOutOfMaterial"),
      doNotAllowOutOfMaterial: t("messages.doNotAllowOutOfMaterial"),
    },
    confirmAddToCardTitle: t("messages.confirmEditOrderItemTitle"),
    btnAddToCard: t("button.addToOrder"),
    btnIgnore: t("button.ignore"),
    btnIGotIt: t("form.buttonIGotIt"),
    saveDraft: t("posOrder.saveDraft"),
    saveAndConfirm: t("posOrder.saveAndConfirm"),
    createOrder: t("posOrder.createOrder"),
    save: t("posOrder.save"),
    clearAll: t("posOrder.clearAll"),
    tax: t("orderDelivery.tax"),
  };

  useEffect(() => {
    fetchCustomerDataAsync(false);
  }, []);

  useEffect(() => {
    document.querySelectorAll(".product-item").forEach(onTouchMoveProductItem);
  }, [products]);

  // The component instance will be extended
  // with whatever you return from the callback passed
  // as the second argument
  useImperativeHandle(ref, () => ({
    setProducts(products) {
      setProducts(products);
    },
    setOrder(order, isSaveDraffAndContinue) {
      setOrder(order);
      setEditOrder(true);
      setIsSaveDraffAndContinue(isSaveDraffAndContinue);
    },
    onDeSelectCustomer() {
      if (isShowSearchCustomer !== true) {
        setIsShowSearchCustomer(true);
      }
      if (selectCustomer) {
        setSelectCustomer(null);
        setCustomerInfo(null);
      }
    },
    onReset() {
      setProducts([]);
      setOrder({});
      setEditOrder(false);
      setIsSaveDraffAndContinue(false);

      if (isShowSearchCustomer !== true) {
        setIsShowSearchCustomer(true);
      }

      if (selectCustomer) {
        setSelectCustomer(null);
        setCustomerInfo(null);
      }
    },
  }));

  const expandProductItem = (index) => {
    let iconControl = document.getElementById(`icon-expand-${index}`);
    if (iconControl) {
      let expandClass = iconControl.classList.contains("product-expand");
      let collapseClass = iconControl.classList.contains("product-collapse");
      let productItemDiv = document.getElementById(`product-item-${index}`);
      let expandContent = productItemDiv.querySelectorAll(".content-expand-product-item");

      if (expandClass) {
        iconControl.classList.remove("product-expand");
        iconControl.classList.remove("stop-animation");
        iconControl.classList.add("product-collapse");
        executeAfter(300, async () => {
          iconControl.classList.add("stop-animation");
          productItemDiv.classList.remove("product-item-border");
          expandContent.forEach((item) => {
            item.classList.remove("expand-product-content");
          });
        });
      }
      if (collapseClass) {
        iconControl.classList.remove("product-collapse");
        iconControl.classList.remove("stop-animation");
        iconControl.classList.add("product-expand");
        executeAfter(300, async () => {
          iconControl.classList.add("stop-animation");
          productItemDiv.classList.add("product-item-border");
          expandContent.forEach((item) => {
            item.classList.add("expand-product-content");
          });
        });
      }
      if (expandClass === false && collapseClass === false) {
        iconControl.classList.remove("stop-animation");
        iconControl.classList.add("product-expand");
        executeAfter(300, async () => {
          iconControl.classList.add("stop-animation");
          productItemDiv.classList.add("product-item-border");
          expandContent.forEach((item) => {
            item.classList.add("expand-product-content");
          });
        });
      }
    }
  };

  const onTouchMoveProductItem = (target) => {
    let swiped = false;
    let startOffset = 0;
    const decelerationOnOverflow = 4;
    const buttonDeleteWidth = 80;
    const snapWidth = buttonDeleteWidth / 1.5;
    let controlId = target.id;
    if (controlId) controlId = controlId.split("-")[2] ?? null;
    else controlId = null;
    let btnDelete = document.getElementById(`btn-delete-product-item-${controlId}`);

    const gesture = new TinyGesture(target);
    gesture.on("panmove", (event) => {
      if (gesture.animationFrame) {
        return;
      }
      gesture.animationFrame = window.requestAnimationFrame(() => {
        let getX = (x) => {
          if (x < -buttonDeleteWidth) {
            return (x + buttonDeleteWidth) / decelerationOnOverflow - buttonDeleteWidth;
          }
        };
        const newX = getX(startOffset + gesture.touchMoveX);
        target.style.transform = "translateX(" + newX + "px)";
        if (newX >= snapWidth || newX <= -snapWidth) {
          resetSelectDelete(controlId);
          swiped = newX < 0 ? -buttonDeleteWidth : buttonDeleteWidth;
          btnDelete.style.zIndex = 0;
        } else {
          swiped = false;
          btnDelete.style.zIndex = -1;
        }
        window.requestAnimationFrame(() => {
          target.style.transition = null;
        });
        gesture.animationFrame = null;
      });

      gesture.on("panend", () => {
        window.cancelAnimationFrame(gesture.animationFrame);
        gesture.animationFrame = null;
        window.requestAnimationFrame(() => {
          target.style.transition = "transform .2s ease-in";
          resetSelectDelete(controlId);
          if (!swiped) {
            startOffset = 0;
            target.style.transform = null;
          } else {
            startOffset = swiped;
            target.style.transform = "translateX(" + swiped + "px)";
            btnDelete.style.zIndex = 0;
          }
        });
      });

      // reset on tap
      gesture.on("doubletap", (event) => {
        // we could also use 'doubletap' here
        window.requestAnimationFrame(() => {
          target.style.transition = "transform .2s ease-in";
          swiped = false;
          startOffset = 0;
          target.style.transform = null;
          btnDelete.style.zIndex = -1;
        });
      });
    });
  };

  const onClickProductComboViewMore = (combo) => {
    setProductComboValue(combo);
    setModalViewComboDetail(true);
  };

  const onCloseModalViewComboDetail = () => {
    setProductComboValue([]);
    setModalViewComboDetail(false);
  };

  const onChangeQuantity = (product, quantity, isDecrease, indexChange) => {
    if (product?.orderId === EmptyId) {
      onChangeItemQuantity(indexChange, quantity, product?.orderId);
    } else if (product?.orderId !== undefined && product?.orderId !== null && product?.orderId !== "") {
      if (isDecrease === true) {
        orderDataService
          .checkPreparedStatusForOrderItemByOrderIdAsync(product?.orderId, product?.productId)
          .then((response) => {
            const { totalItemCompleted } = response;
            // If total item completed larger than current item quantity, show dialog and do not decrease quantity
            if (totalItemCompleted > quantity) {
              setShowModalConfirm(true);
              const contentModal = formatStringWithParameters(pageData.confirmationOrderItemContent, product?.itemName);
              setContentModalConfirm(contentModal);
              return;
            }

            onChangeItemQuantity(indexChange, quantity, product?.orderId, true);
          })
          .catch((errors) => {
            console.log("Get orderItemStatus error >>", errors);
          });
      } else {
        onChangeItemQuantity(indexChange, quantity, product?.orderId, true);
      }
    } else {
      onChangeItemQuantity(indexChange, quantity, product?.orderId);
    }
  };

  const renderDialogRemoveItemMessageContent = () => {
    return (
      <div className="text-center">
        <div dangerouslySetInnerHTML={{ __html: contentModalConfirm }}></div>
      </div>
    );
  };

  const calculateDiscountPercentageValue = (combo) => {
    let percentage = ((combo?.originalPrice - combo?.sellingPrice) / combo?.originalPrice) * 100;
    return percentage;
  };

  //#region Combo calculation
  const calculateOriginalPriceComboIncludeTopping = (combo) => {
    let totalPrice = combo?.originalPrice ?? 0;
    let toppingSellingPriceValue = 0;
    combo?.comboItems?.forEach((comboItem) => {
      comboItem?.toppings?.forEach((topping) => {
        toppingSellingPriceValue += topping?.priceAfterDiscount * topping?.quantity;
      });
    });

    totalPrice = (totalPrice + toppingSellingPriceValue) * combo?.quantity;

    return totalPrice;
  };

  const calculateSellingPriceComboIncludeTopping = (combo) => {
    let totalPrice = combo?.sellingPrice ?? 0;
    let toppingSellingPriceValue = 0;
    combo?.comboItems?.forEach((comboItem) => {
      comboItem?.toppings?.forEach((topping) => {
        toppingSellingPriceValue += topping?.priceAfterDiscount * topping?.quantity;
      });
    });

    totalPrice = (totalPrice + toppingSellingPriceValue) * combo?.quantity;

    return totalPrice;
  };
  //#endregion Combo calculation

  //#region Product calculation
  const calculateOriginalPriceProductIncludeTopping = (product) => {
    let toppingOriginalPriceValue = 0;
    let originalPrice = product?.originalPrice * product?.quantity;
    product?.toppings?.forEach((topping) => {
      // the topping price has been included in the quantity of topping
      toppingOriginalPriceValue += topping?.originalPrice * product.quantity;
    });

    return originalPrice + toppingOriginalPriceValue;
  };

  //#endregion Product calculation

  const fetchCustomerDataAsync = (isCreate) => {
    customerDataService.getPosCustomersAsync("").then((res) => {
      setCustomers(res.customer);
      if (isCreate) {
        setSelectCustomer(res.customer[0]);
        setCustomerInfo(res.customer[0]);
        setIsShowSearchCustomer(false);
        onSelectCustomer(res.customer[0]?.id);
      }
    });
  };

  const omSelectCustomer = (value, option) => {
    if (value) {
      if (value !== -1) {
        let customer = customers.find((x) => x.id === option?.key);
        setSelectCustomer(customer);
        setCustomerInfo(customer);
        setIsShowSearchCustomer(false);
        onSelectCustomer(option?.key);
      } else {
        setShowCreateCustomer(true);
        if (customerRef && customerRef.current) {
          customerRef.current();
        }
      }
    }
  };

  const onDeSelectCustomerClick = (e) => {
    setIsShowSearchCustomer(true);
    setSelectCustomer(null);
    setCustomerInfo(null);
    onDeSelectCustomer();
    e.stopPropagation();
  };

  const onCancelCreateCustomer = () => {
    setShowCreateCustomer(false);
    setSelectCustomer(null);
    setCustomerInfo(null);
  };

  function renderProductPriceCartItem(product, index) {
    const defaultOptions = product.options?.filter((option) => option?.isSetDefault === true);
    const hasExpandIcon =
      product.toppings?.length > 0 ||
      (product.options?.length > 0 && defaultOptions?.length !== product.options?.length);
    return (
      <div className="group-button-and-product-item">
        <div className="product-item" id={`product-item-${index}`}>
          <Row className="order-not-combo">
            <Col span={24} className="margin-top-content"></Col>
            <Col span={24} className="content-product-item">
              <Row>
                <Col
                  span={3}
                  className={`icon-expand-product-item bold-text ${hasExpandIcon === true ? "" : "opacity-text"}`}
                >
                  {hasExpandIcon && (
                    <IconVectorRight
                      className="icon-expand"
                      id={`icon-expand-${index}`}
                      onClick={() => expandProductItem(index)}
                    />
                  )}
                </Col>
                <Col span={7} className="product-item-name bold-text">
                  <Paragraph
                    ellipsis={{
                      rows: 2,
                      tooltip: product?.itemName,
                    }}
                    className="product-item-name"
                    onClick={() => {
                      onProductItemClick(product?.productId, product, index);
                    }}
                  >
                    {product?.itemName}
                  </Paragraph>
                  <span className="price-name-default">{product?.productPriceName}</span>
                </Col>
                <div className="ant-col ant-col-14 quantity-number-price">
                  <Col span={7} className="modify-amount bold-text">
                    <Button
                      size="large"
                      icon={<MinusOutlined />}
                      className={`btn-decrease-product-item ${product.quantity <= 1 ? "disable-minus-btn" : ""}`}
                      disabled={product?.quantity <= 1 ? true : false}
                      onClick={() => checkMaterialProduct(product, product?.quantity - 1, true, index)}
                    ></Button>
                    <span className="amount-product-item">{product?.quantity}</span>
                    <Button
                      size="large"
                      icon={<PlusOutlined />}
                      className="btn-increase-product-item"
                      onClick={() => checkMaterialProduct(product, product?.quantity + 1, false, index)}
                    ></Button>
                  </Col>
                  <Col span={7} className="currency-product-item bold-text">
                    {formatCurrency(product?.totalPriceAfterDiscount)}
                    <br />
                    <span className="price-discount-value">
                      {product?.promotion?.promotionTypeId !== PromotionType.DiscountTotal &&
                        product?.originalPrice !== product?.priceAfterDiscount &&
                        formatCurrency(calculateOriginalPriceProductIncludeTopping(product))}
                    </span>
                  </Col>
                </div>
              </Row>
            </Col>

            {product.toppings?.map((topping, index) => {
              const toppingQuantity = `x${topping?.quantity}`;
              return (
                <>
                  <Col span={24} className="content-expand-product-item">
                    <br />
                    <Row>
                      <Col span={3} className="icon-expand-product-item bold-text"></Col>
                      <Col span={7} className="product-item-name">
                        {topping?.name}
                      </Col>
                      <Col span={7} className="modify-amount bold-text">
                        {toppingQuantity}
                      </Col>
                    </Row>
                  </Col>
                </>
              );
            })}

            {product.options?.map((option, index) => {
              if (option?.isSetDefault === true) return <></>;

              return (
                <>
                  <Col span={24} className="content-expand-product-item">
                    <br />
                    <Row>
                      <Col span={3} className="icon-expand-product-item bold-text"></Col>
                      <Col span={7} className="product-item-name">
                        {option?.optionName}
                      </Col>
                      <Col span={7} className="modify-amount bold-text">
                        {option?.optionLevelName}
                      </Col>
                      <Col span={7} className="currency-product-item bold-text"></Col>
                    </Row>
                  </Col>
                </>
              );
            })}
            <Col span={24} className="margin-bottom-content"></Col>
          </Row>
        </div>
        <Button
          size="large"
          icon={<IconDeleteWhite />}
          className="btn-delete-product-item"
          type="button"
          onClick={() => removeProduct(product, index)}
          id={`btn-delete-product-item-${index}`}
        ></Button>
      </div>
    );
  }

  const onClickClearAllOrderItemWhenEdit = async () => {
    const orderId = order?.cartItems[0]?.orderId;
    if (orderId) {
      const response = await orderDataService.checkOrderItemStatusFromKitchenByOrderIdAsync(orderId);
      if (response) {
        const { isAllowToRemoveOrderItem } = response;
        if (isAllowToRemoveOrderItem) {
          clearAllItemsWhenEdit();
        } else {
          setShowModalConfirm(true);
          const contentModal = formatStringWithParameters(pageData.confirmationOrderItemContent, "");
          setContentModalConfirm(contentModal);
        }
      }
    }
  };

  const removeProduct = (product, index) => {
    ///Check remove product when edit order
    if (product?.orderId !== undefined && product?.orderId !== null && product?.orderId !== "") {
      orderDataService
        .checkPreparedStatusForOrderItemByOrderIdAsync(product?.orderId, product?.productId)
        .then((response) => {
          const { totalItemCompleted } = response;
          // If total item completed greater than 0, show dialog and do not remove this item
          if (totalItemCompleted > 0) {
            setShowModalConfirm(true);
            let contentModal = formatStringWithParameters(pageData.confirmationOrderItemContent, product?.itemName);
            setContentModalConfirm(contentModal);
            return;
          } else {
            onRemoveProduct(index);
          }
        })
        .catch((errors) => {
          console.log("Get orderItemStatus error >>", errors);
        });
    } else {
      onRemoveProduct(index);
    }

    let btnDelete = document.getElementById(`btn-delete-product-item-${index}`);
    let divProduct = document.getElementById(`product-item-${index}`);
    if (btnDelete && divProduct) {
      btnDelete.style.zIndex = -1;
      divProduct.style = null;
    }
  };

  const resetSelectDelete = (id) => {
    for (let i = 0; i < products.length; i++) {
      if (i == id) continue;
      let target = document.getElementById(`product-item-${i}`);
      if (!target) break;
      let btnDelete = document.getElementById(`btn-delete-product-item-${i}`);
      target.style.transform = null;
      btnDelete.style.zIndex = -1;
    }
  };

  function renderComboCartItem(cartItem, index) {
    return (
      <div key={index} className="group-button-and-product-item">
        <div className={`product-item-combo product-item`} id={`product-item-${index}`}>
          <Row className="combo-group">
            <Col span={24} className="content-product-item margin-top-content">
              <Row>
                <Col span={3} className={`icon-expand-product-item bold-text`}>
                  <IconVectorRight
                    className="icon-expand"
                    id={`icon-expand-${index}`}
                    onClick={() => expandProductItem(index)}
                  />
                </Col>
                <Col span={7} className="product-item-name bold-text">
                  <Paragraph
                    ellipsis={{
                      rows: 2,
                      tooltip: cartItem?.combo?.comboName,
                    }}
                    className="product-item-name"
                    onClick={() => editComboClick(cartItem, index)}
                  >
                    <span>{cartItem?.combo?.comboName}</span>
                  </Paragraph>
                  {calculateDiscountPercentageValue(cartItem?.combo) > 0 && (
                    <div className="promotion-value">
                      {roundNumber(calculateDiscountPercentageValue(cartItem?.combo))}
                      <PercentageOutlined />
                    </div>
                  )}
                </Col>
                <div className="ant-col ant-col-14 quantity-number-price">
                  <Col span={7} className="modify-amount bold-text">
                    <Button
                      size="large"
                      icon={<MinusOutlined />}
                      className={`btn-decrease-product-item ${cartItem?.combo?.quantity <= 1 && "disable-minus-btn"}`}
                      disabled={cartItem?.combo?.quantity <= 1 ? true : false}
                      onClick={() => checkMaterialProduct(cartItem, cartItem?.combo?.quantity - 1, true, index)}
                    ></Button>
                    <span className="amount-product-item">{cartItem?.combo?.quantity}</span>
                    <Button
                      size="large"
                      icon={<PlusOutlined />}
                      className="btn-increase-product-item"
                      onClick={() => checkMaterialProduct(cartItem, cartItem?.combo?.quantity + 1, false, index)}
                    ></Button>
                  </Col>
                  <Col span={7} className="currency-product-item bold-text">
                    {formatCurrency(calculateSellingPriceComboIncludeTopping(cartItem?.combo))}
                    <br />
                    <span className="price-discount-value">
                      {calculateSellingPriceComboIncludeTopping(cartItem?.combo) !==
                        calculateOriginalPriceComboIncludeTopping(cartItem?.combo) &&
                        formatCurrency(calculateOriginalPriceComboIncludeTopping(cartItem?.combo))}
                    </span>
                  </Col>
                </div>
              </Row>
            </Col>

            {cartItem?.combo?.comboItems.map((comboItem, index) => {
              const defaultOptions = comboItem.options?.filter((option) => option?.isSetDefault === true);
              const hasExpandIcon =
                comboItem.toppings?.length > 0 ||
                (comboItem.options?.length > 0 && defaultOptions?.length !== comboItem.options?.length);

              if (index < 2) {
                return (
                  <>
                    <Col span={24} className="content-expand-product-item">
                      <br />
                      <Row gutter={[0, 16]}>
                        <Col span={3}></Col>
                        <Col span={21} className="content-topping">
                          <Row className={`product-combo-group ${hasExpandIcon === true ? "border-top" : ""}`}>
                            <Col span={24} className="product-item-name pl-3">
                              <Paragraph
                                ellipsis={{
                                  rows: 2,
                                  tooltip: comboItem?.itemName,
                                }}
                                className="product-item-name product-item-name-combo"
                              >
                                {comboItem?.itemName}
                              </Paragraph>
                            </Col>
                          </Row>
                          {hasExpandIcon === true && (
                            <Row gutter={[0, 16]} className={`group-option-topping`}>
                              {comboItem?.toppings?.map((comboItemTopping, index) => {
                                return (
                                  <>
                                    <Col key={index} span={24} className="content-expand-product-item">
                                      <Row className="option-topping">
                                        <Col span={12} className="product-item-name pl-3">
                                          {comboItemTopping?.name}
                                        </Col>
                                        <Col span={12} className="modify-amount bold-text">
                                          x{comboItemTopping?.quantity}
                                        </Col>
                                      </Row>
                                    </Col>
                                  </>
                                );
                              })}

                              {comboItem?.options?.map((comboItemOption, index) => {
                                if (comboItemOption && comboItemOption?.isSetDefault === true) return <></>;
                                return (
                                  <>
                                    <Col key={index} span={24} className="content-expand-product-item">
                                      <Row className="option-topping">
                                        <Col span={12} className="product-item-name pl-3">
                                          {comboItemOption?.optionName}
                                        </Col>
                                        <Col span={12} className="modify-amount bold-text">
                                          {comboItemOption?.optionLevelName}
                                        </Col>
                                      </Row>
                                    </Col>
                                  </>
                                );
                              })}
                            </Row>
                          )}
                        </Col>
                      </Row>
                    </Col>
                  </>
                );
              }
              if (index === 2) {
                return (
                  <>
                    <Col span={24} className="content-expand-product-item">
                      <Row gutter={[0, 16]}>
                        <Col span={3}></Col>
                        <Col span={21} className="btn-view-more">
                          <div
                            className="view-more-combo-detail"
                            onClick={() => onClickProductComboViewMore(cartItem?.combo)}
                          >
                            ...
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </>
                );
              }
            })}
            <Col span={24} className="margin-bottom-content"></Col>
          </Row>
        </div>
        <Button
          size="large"
          icon={<IconDeleteWhite />}
          className="btn-delete-product-item"
          type="button"
          onClick={() => removeProduct(cartItem, index)}
          id={`btn-delete-product-item-${index}`}
        ></Button>
      </div>
    );
  }

  function renderSelectCustomer() {
    return (
      <Col span={24}>
        <Card className="card-order-checkout card-search-customer">
          {isShowSearchCustomer ? (
            <>
              <Select
                value={null}
                placeholder={pageData.placeholderSearchCustomer}
                showSearch
                className="search-customer-information"
                suffixIcon={<SearchIcon />}
                defaultActiveFirstOption={false}
                dropdownStyle={{ borderRadius: "16px" }}
                listItemHeight={5}
                listHeight={594}
                bordered={false}
                onChange={(value, option) => omSelectCustomer(value, option)}
                filterOption={(input, option) => {
                  const inputStr = input.removeVietnamese();
                  const productName = option?.value !== -1 ? option.value?.removeVietnamese() : null;
                  return productName?.trim().toLowerCase().indexOf(inputStr.trim().toLowerCase()) >= 0;
                }}
              >
                {customers?.map((item, index) => {
                  return (
                    <>
                      {index === 0 && (
                        <Option key={-1} value={-1} className="create-customer-option">
                          <Row>
                            <Col span={1}></Col>
                            <SubtractIcon width={21} height={21} />
                            <Col span={1}></Col>
                            <Col span={20} className="create-customer-option-text">
                              {pageData.customerAddNew}
                            </Col>
                          </Row>
                        </Option>
                      )}
                      <Option key={item?.id} value={item?.customerName} className="select-customer-option">
                        <Row>
                          <Col span={3}>
                            <Thumbnail width={66} height={66} src={item?.thumbnail} />
                          </Col>
                          <Col span={21}>
                            <Row className="group-information-customer">
                              <Col span={14} className="item-information-customer full-name-phone-group">
                                <Row>
                                  <Col span={24} className="item-customer-end">
                                    <Paragraph
                                      style={{ maxWidth: "inherit" }}
                                      placement="top"
                                      ellipsis={{ tooltip: item?.customerName }}
                                      color="#50429B"
                                    >
                                      <span> {item?.customerName}</span>
                                    </Paragraph>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col span={24} className="item-customer-phone-end">
                                    <Text strong>{item?.customerPhone}</Text>
                                  </Col>
                                </Row>
                              </Col>
                              <Col span={10} className="item-information-customer rank-discount-group">
                                <Row className="group-customer-rank">
                                  <Col
                                    span={24}
                                    className="justify-center item-customer-rank"
                                    style={{ textAlign: "center" }}
                                  >
                                    <Text>{item?.memberShip}</Text>
                                  </Col>
                                </Row>
                                <Row className="group-customer-discount">
                                  <Col
                                    span={24}
                                    className="justify-center item-customer-discount"
                                    style={{ textAlign: "center" }}
                                  >
                                    <Text>{`${item?.discount}${pageData.percent}`}</Text>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Option>
                    </>
                  );
                })}
                {customers.length === 0 && (
                  <Option key={-1} value={-1} className="create-customer-option">
                    <Row>
                      <Col span={1}></Col>
                      <SubtractIcon width={21} height={21} />
                      <Col span={1}></Col>
                      <Col span={20} className="create-customer-option-text">
                        {pageData.customerAddNew}
                      </Col>
                    </Row>
                  </Option>
                )}
              </Select>
              <div className="icon-search-customer">
                <SearchIcon />
              </div>
              <div className="icon-scan-customer">
                <ScanIcon style={{ width: "32px", height: "32px", marginTop: "13px" }} />
              </div>
            </>
          ) : (
            <Row onClick={() => handleShowDetailCustomer(selectCustomer?.id)} className="customer-info">
              <Col span={3}>
                <Thumbnail width={66} height={66} src={selectCustomer?.thumbnail} />
              </Col>
              <Col span={21}>
                <Row className="group-information-customer">
                  <Col span={12} className="item-information-customer full-name-phone-group">
                    <Row>
                      <Col span={24} className="item-customer-end">
                        <Paragraph
                          style={{ maxWidth: "inherit" }}
                          placement="top"
                          ellipsis={{ tooltip: selectCustomer?.customerName }}
                          color="#50429B"
                        >
                          <span> {selectCustomer?.customerName}</span>
                        </Paragraph>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24} className="item-customer-phone-end">
                        <Text strong>{selectCustomer?.customerPhone}</Text>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={10} className="item-information-customer rank-discount-group">
                    <Row className="group-customer-rank">
                      <Col span={24} className="justify-center item-customer-rank" style={{ textAlign: "center" }}>
                        <Text>{selectCustomer?.memberShip}</Text>
                      </Col>
                    </Row>
                    <Row className="group-customer-select-discount">
                      <Col span={24} className="justify-center item-customer-discount" style={{ textAlign: "center" }}>
                        <Text>{`${selectCustomer?.discount}${pageData.percent}`}</Text>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={1}></Col>
                  <Col span={1} className="customer-deselect-text">
                    <CloseOutlined onClick={(e) => onDeSelectCustomerClick(e)} className="customer-deselect-icon " />
                  </Col>
                </Row>
              </Col>
            </Row>
          )}
        </Card>
      </Col>
    );
  }

  const checkMaterialProduct = async (productChange, quantity, isDecrease, indexChange) => {
    let productEdit = cartItems[indexChange];
    productEdit = {
      ...productEdit,
      quantity: quantity,
    };
    let productListData = [];
    if (productEdit?.isCombo) {
      productEdit?.combo?.comboItems?.forEach((combo) => {
        let productItem = {
          productId: combo?.productId,
        };
        productListData.push(productItem);
        combo?.toppings.forEach((topping) => {
          let productItem = {
            productId: topping?.toppingId,
          };
          productListData.push(productItem);
        });
      });
    } else {
      let productItem = {
        productId: productEdit?.productId,
      };
      productListData.push(productItem);
      productEdit?.toppings?.forEach((topping) => {
        let quantityTopping = quantity * topping.quantity;
        productItem = {
          productId: topping?.toppingId,
          quantity: quantityTopping,
        };
        productListData.push(productItem);
      });
    }

    let cartItemsCopy = [...cartItems];
    cartItemsCopy.splice(indexChange, 1, productEdit);
    let dataSubmit = {
      productList: productListData,
      cartItems: cartItemsCopy,
    };

    const checkProductAddToCardResult = await orderDataService.checkAddProductForOrder(dataSubmit);
    if (checkProductAddToCardResult?.productInformationListResponse.length <= 0) {
      onChangeQuantity(productChange, quantity, isDecrease, indexChange);
    } else {
      let productName = [];
      checkProductAddToCardResult?.productInformationListResponse?.forEach((product) => {
        productName.push(product?.productName);
      });
      setDataChangeQuantity({
        product: productChange,
        quantity: quantity,
        isDecrease: isDecrease,
        indexChange: indexChange,
      });
      setIsAllowOutOfMaterial(checkProductAddToCardResult.isAllowOutOfMaterial);
      if (checkProductAddToCardResult.isAllowOutOfMaterial) {
        setMessageConfirmForAddProductToOrder(
          t("messages.allowOutOfMaterial", {
            productList: productName.join(", "),
          })
        );
      } else {
        setMessageConfirmForAddProductToOrder(
          t("messages.doNotAllowOutOfMaterial", {
            productList: productName.join(", "),
          })
        );
      }
      setShowConfirmAddToCard(true);
    }
  };

  const handleCancel = () => {
    setShowConfirmAddToCard(false);
  };

  const onFinish = () => {
    setShowConfirmAddToCard(false);
    onChangeQuantity(
      dataChangeQuantity?.product,
      dataChangeQuantity?.quantity,
      dataChangeQuantity?.isDecrease,
      dataChangeQuantity?.indexChange
    );
  };

  const renderActionButtons = () => {
    if (
      isSaveDraffAndContinue === true ||
      (editOrder === true &&
        order?.orderStatusId !== OrderStatus.Draft &&
        order?.orderStatusId !== OrderStatus.ToConfirm)
    ) {
      return (
        <>
          <Button size="large" icon={<IconVectorSave />} className="btn btn-save-order btn-save" onClick={onSaveOrder}>
            {pageData.save}
          </Button>
        </>
      );
    }
    // Edit ToConfirm Order
    else if (editOrder === true && order?.orderStatusId === OrderStatus.ToConfirm) {
      return (
        <>
          <Button
            size="large"
            icon={<ShoppingBagIcon className="icon-place-order" />}
            className="btn-payment-order ml-0"
            onClick={onSaveToConfirmOrder}
          >
            {pageData.saveAndConfirm}
          </Button>
        </>
      );
    } else {
      return (
        <>
          <Button
            size="large"
            icon={<IconVectorSave />}
            className="btn btn-save-order"
            onClick={() => onSaveDraftOrder(true)}
          >
            {order?.orderStatusId === OrderStatus.Draft ? pageData.save : pageData.saveDraft}
          </Button>
          <Button
            size="large"
            icon={
              currentOrderType?.id === OrderTypeStatus.Delivery ? (
                <BagTickIcon className="icon-place-order" />
              ) : (
                <IconPayment className="icon-payment" />
              )
            }
            className="btn-payment-order"
            onClick={openPaymentMethod}
          >
            {currentOrderType?.id === OrderTypeStatus.Delivery ? pageData.placeOrder : pageData.createOrder}
          </Button>
        </>
      );
    }
  };

  return (
    <>
      <div className="order-check-out-container">
        <Row gutter={[0, 20]}>
          {renderSelectCustomer()}

          <Col span={24}>
            <Card className="card-order-checkout card-order-checkout-list">
              <div className="order-number">
                <Row>
                  <Col span={12} className="order-number-text">
                    <span>{pageData.orderNo}</span>
                    <span className="order-number-value">{order?.orderCode ?? "-"}</span>
                  </Col>
                  <Col span={12}>
                    {products && products.length > 0 && (
                      <div
                        className="float-right d-flex clear-all-item"
                        onClick={editOrder === true ? onClickClearAllOrderItemWhenEdit : clearAllItems}
                      >
                        <TrashIcon className="mr-2" /> <TextDanger text={pageData.clearAll} />
                      </div>
                    )}
                  </Col>
                </Row>
              </div>
              <div className="order-product-item">
                <Row>
                  <Col span={24} className="order-number-text" onTouchMove={onTouchMoveProductItem}>
                    {products.map((product, index) => {
                      return (
                        <>
                          {product?.isCombo === false
                            ? renderProductPriceCartItem(product, index)
                            : renderComboCartItem(product, index)}
                        </>
                      );
                    })}
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>

          <Col span={24}>
            <Card className="card-order-checkout card-total-order-checkout">
              <div className="subtotal">
                <Row>
                  <Col span={12} className="text-subtotal">
                    <span className="mr-2">{pageData.subtotalText}</span>
                    {products?.length > 0 && <span>{t(pageData.subTotalDetail, { number: products.length })}</span>}
                  </Col>
                  <Col span={12} className="price price-subtotal">
                    {formatCurrency(originalPrice)}
                  </Col>
                </Row>
              </div>
              {(currentOrderType?.id === OrderTypeStatus.InStore ||
                currentOrderType?.id === OrderTypeStatus.Delivery) && (
                <div className="discount">
                  <Row>
                    <Col span={12} className="text-discount">
                      {pageData.tax}
                    </Col>
                    <Col span={12} className="price price-discount">
                      + {formatCurrency(totalTax)}
                    </Col>
                  </Row>
                </div>
              )}
              <div className="discount">
                <Row>
                  <Col span={12} className="text-discount">
                    {pageData.discountText}
                    {isDiscountOnTotal && totalDiscountAmount > 0 && (
                      <span className="label-discount-total">
                        {formatCurrency(totalDiscountAmount + customerDiscountAmount)}
                      </span>
                    )}
                  </Col>
                  <Col span={12} className="price price-discount">
                    - {formatCurrency(totalDiscountAmount + customerDiscountAmount)}
                  </Col>
                </Row>
              </div>
              <div className="fee">
                <Row>
                  <Col span={12} className="text-fee" onClick={() => onShowFeeManagementDialog(true)}>
                    {pageData.feeText}
                  </Col>
                  <Col span={12} className="price price-fee">
                    {formatCurrency(totalFee)}
                  </Col>
                </Row>
              </div>
              <div className="total">
                <Row>
                  <Col span={12} className="text-total">
                    {pageData.totalText}
                  </Col>
                  <Col span={12} className="price price-total">
                    {currentOrderType?.id === OrderTypeStatus.InStore ||
                    currentOrderType?.id === OrderTypeStatus.Delivery
                      ? formatCurrency(totalPriceOnBill + totalTax + totalFee - customerDiscountAmount)
                      : formatCurrency(totalPriceOnBill + totalFee - customerDiscountAmount)}
                  </Col>
                </Row>
              </div>
              <div className="group-action-payment">{renderActionButtons()}</div>
            </Card>
          </Col>
        </Row>
      </div>
      <ViewMoreProductComboComponent
        isModalVisible={showModalViewComboDetail}
        productComboValue={productComboValue}
        onCloseModalViewComboDetail={onCloseModalViewComboDetail}
      />

      <FnbAlertComponent
        className="modal-noti-remove-order-item"
        visible={showModalConfirm}
        type={"warning"}
        title={pageData.notificationTitle}
        content={renderDialogRemoveItemMessageContent()}
        onOk={() => setShowModalConfirm(false)}
        okText={pageData.buttonIGotIt}
      />

      <Modal
        width={1138}
        centered
        visible={showCreateCustomer}
        footer={(null, null)}
        onCancel={() => onCancelCreateCustomer()}
        className="create-createcustomer-modal"
        closeIcon={
          <div className="close-customer-modal-icon">
            <CloseModalIcon width={24} height={24} />
          </div>
        }
      >
        <CreateCustomerPage
          setShowCreateCustomer={setShowCreateCustomer}
          fetchCustomerDataAsync={fetchCustomerDataAsync}
          tableFuncs={customerRef}
        />
      </Modal>

      <div hidden={true}>
        <DeleteConfirmComponent
          title={pageData.confirmAddToCardTitle}
          visible={showConfirmAddToCard}
          onCancel={handleCancel}
          cancelText={pageData.btnIgnore}
          okText={isAllowOutOfMaterial ? pageData.btnAddToCard : pageData.btnIGotIt}
          onOk={isAllowOutOfMaterial ? onFinish : handleCancel}
          content={messageConfirmForAddProductToOrder}
          okType="primary"
          centered={true}
          cancelButtonProps={!isAllowOutOfMaterial && { style: { display: "none" } }}
        ></DeleteConfirmComponent>
      </div>
    </>
  );
});
