import { AppstoreOutlined, ShopOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Layout, message, Modal, Row } from "antd";
import orderBroadcast from "broadcast-channels/order-broadcast-channel";
import DeleteConfirmComponent from "components/delete-confirm-component/delete-confirm.component";
import { FnbAlertComponent } from "components/fnb-alert/fnb-alert.component";
import { ReceiptTemplateComponent } from "components/fnb-receipt/fnb-receipt-component";
import GreatComponent from "components/greate-modal/great.component";
import { BroadcastActions } from "constants/broadcast-actions.constants";
import { EmptyId } from "constants/default.constants";
import { MessageConstants } from "constants/message.constants";
import { OrderStatus } from "constants/order-status.constants";
import { OrderTypes, OrderTypeStatus } from "constants/order-type-status.constants";
import { PaymentMethodConstants } from "constants/payment-method.constants";
import { PermissionKeys } from "constants/permission-key.constants";
import { printStampType } from "constants/printStamp.constants";
import customerDataService from "data-services/customer/customer.service";
import feeDataService from "data-services/fee/fee-data.service";
import orderDataService from "data-services/order/order-data.service";
import productDataService from "data-services/product/product-data.service";
import storeDataService from "data-services/store/store-data.service";
import { CustomerDetail } from "pages/customer/components/customer-detail.component";
import TableCustomer from "pages/customer/components/table-customer.component";
import PaymentMethod from "pages/dashboard/components/payment/payment-method.component";
import PosOrderManagement from "pages/dashboard/components/pos-order-management/pos-order-management.component";
import PosTableManagement from "pages/dashboard/components/pos-table-management.component";
import { FeeManagementComponent } from "pages/fee/components/fee-management.component";
import { StampTemplateComponent } from "pages/order/components/stamp-template.component";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { getStoreConfigs } from "services/sessionService";
import { hasPermission } from "utils/helpers";
import LeftMenuComponent from "../../components/left-menu/left-menu.component";
import { ComboCartDetailComponent } from "./components/combo-cart-detail/combo-cart-detail.component";
import { DeliveryOrder } from "./components/delivery-order/delivery-order.component";
import { OrderCheckoutComponent } from "./components/order-checkout/order-checkout.component";
import OrderContentComponent from "./components/order-content.component";
import SelectTableComponent from "./components/order-select-table.component";
import OrderTypeComponent from "./components/order-type.component";
import { ProductCartDetailComponent } from "./components/product-cart-detail/product-cart-detail.component";
import TableOrderManagement from "./components/table-orders.component";

import "./dashboard.scss";

const { Header } = Layout;
const { Search } = Input;

export function DashboardPage(props) {
  const [t] = useTranslation();
  const history = useHistory();

  const stampRef = React.useRef();
  const areaFuncs = React.useRef();
  const selectTableFuncs = React.useRef();
  const orderManagementFuncs = React.useRef();
  const oderPayment = React.useRef();
  const billTemplateRef = useRef();
  const customerDetailRef = React.useRef();
  const productShoppingCartComponentRef = useRef();
  const productDetailRef = React.useRef();
  const comboDetailRef = React.useRef();
  const deliveryOrderRef = React.useRef();
  const [form] = Form.useForm();
  const [showTableOrderManagement, setShowTableOrderManagement] = useState(false);
  const [showSelectTable, setShowSelectTable] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [cartItems, setCartItems] = React.useState([]);
  const [showPOSOrderDialog, setShowPOSOrderDialog] = useState(false); /// Show - hide POS ORDER dialog
  const [showFee, setShowFee] = useState(false);
  const [totalInput, setTotalInput] = useState(0);
  const [allFees, setAllFees] = useState([]);
  const [feesAutoApplied, setFeesAutoApplied] = useState([]);
  const [feesActive, setFeesActive] = useState([]);
  const [feesDeActive, setFeesDeActive] = useState([]);
  const [currencyAmount, setCurrencyAmount] = useState(0);
  const [percentAmount, setPercentAmount] = useState(0);
  const [showCustomer, setShowCustomer] = useState(false);
  const [customer, setCustomer] = useState([]);
  const [customerAutoComplete, setCustomerAutoComplete] = useState([]);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [customerName, setCustomerName] = useState(null);
  const [customerDiscount, setCustomerDiscount] = useState(-1); //Amount Discount Of Customer on TotalBill
  const [customerDiscountPercent, setCustomerDiscountPercent] = useState(0); // Percent of Discount
  const [customerPhone, setCustomerPhone] = useState(null);
  const [customerRank, setCustomerRank] = useState(null);
  const [isLoadFee, setIsLoadFee] = useState(true);
  const [customerId, setCustomerId] = useState(null);
  const [showDetailCustomer, setShowDetailCustomer] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState();
  const [selectedTableName, setSelectedTableName] = useState();
  const [customerInfo, setCustomerInfo] = useState(null);
  /// Order information
  const [order, setOrder] = useState(null); /// This is order id has value when user click on save order success
  const [orderId, setOrderId] = useState(null); /// This is order id has value when user click on save order success
  const [orderIdForPaymentMethod, setOrderIdForPaymentMethod] = useState(null); /// This is order id has value when user click payment button
  const [originalPrice, setOriginalPrice] = useState(0); /// Total price of Order
  const [totalPriceAfterDiscount, setTotalPriceAfterDiscount] = useState(0); /// Total price of Order
  const [totalPriceOnBill, setTotalPriceOnBill] = useState(0); /// Total price after discount of Order
  const [totalFee, setTotalFee] = useState(0); /// Total fee of Order
  const [customerDiscountAmount, setCustomerDiscountAmount] = useState(0); /// Total discount by membership of Order
  const [showGreatComponent, setShowGreatComponent] = useState(false);
  const [currentOrderType, setCurrentOrderType] = useState();
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [removeOrderItemName, setRemoveOrderItemName] = useState("");
  const [isDiscountOnTotal, setIsDiscountOnTotal] = useState(false);
  const [maximumDiscountAmount, setMaximumDiscountAmount] = useState(0);
  const [messageConfirmForAddProductToOrder, setMessageConfirmForAddProductToOrder] = useState(null);
  const [showConfirmAddToCard, setShowConfirmAddToCard] = useState(false);
  const [dataAddToCard, setDataAddToCard] = useState({});
  const [isAllowOutOfMaterial, setIsAllowOutOfMaterial] = useState(false);
  const [isCallbackOnEditOrder, setIsCallbackOnEditOrder] = useState(false);
  // cache order cart data
  const [orderCartData, setOrderCartData] = useState([]);
  // order totalDiscountAmount
  const [totalDiscountAmount, seTotalDiscountAmount] = useState(0);
  //table management
  const [showTableManagement, setShowTableManagement] = useState(false);
  ///Delivery order
  const [showDeliveryOrder, setShowDeliveryOrder] = useState(false);
  const [numberCartItems, setNumberCartItems] = useState(0);
  const [totalTax, setTotalTax] = useState(0);

  const pageData = {
    saveDraftSuccess: t("posOrder.saveDraftSuccess"),
    extraFees: t("fee.extraFees"),
    feeTitle: t("fee.title"),
    customer: t("customer.title"),
    selectTable: t("tableOder.selectTable"),
    greatModal: {
      title: t("greatModal.title"),
      paymentText: t("greatModal.paymentText"),
    },
    newOrder: t("button.newOrder"),
    paymentUnsuccessful: t("payment.paymentUnsuccessful"),
    errorPlaceOrderDelivery: t("orderDelivery.errorPlaceOrder"),
    messages: {
      allowOutOfMaterial: t("messages.allowOutOfMaterial"),
      doNotAllowOutOfMaterial: t("messages.doNotAllowOutOfMaterial"),
    },
    confirmAddToCardTitle: t("messages.confirmEditOrderItemTitle"),
    btnAddToCard: t("button.addToOrder"),
    btnIgnore: t("button.ignore"),
    btnIGotIt: t("form.buttonIGotIt"),
    createOrderSuccess: t("orderDelivery.createOrderSuccess"),
    confirmOrderSuccess: t("posOrder.confirmOrderSuccess"),
  };

  useEffect(() => {
    redirectByAccessPermission();
    initCartFormData();
    const fetchData = async () => {
      var orderTypeInStore = OrderTypes.find((item) => item.id === OrderTypeStatus.InStore);
      await initFeesActiveAsync(orderTypeInStore?.id);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!showPaymentMethod) {
      orderBroadcast?.postMessage({
        action: BroadcastActions.ShowThanks,
        data: undefined,
      });
    }
  }, [showPaymentMethod]);

  // call back to calculate order cart
  useEffect(() => {
    if (isCallbackOnEditOrder === true) {
      setIsCallbackOnEditOrder(false);
      onRefreshCartItems(cartItems);
    }
  }, [isCallbackOnEditOrder]);

  const redirectByAccessPermission = () => {
    let kitchenPermission = hasPermission(PermissionKeys.KITCHEN);
    let cashierPermission = hasPermission(PermissionKeys.CASHIER);

    if (cashierPermission) {
      return;
    }

    if (kitchenPermission) {
      history.push("/kitchen");
      return;
    }
  };

  const addOrderCartCache = (data) => {
    orderCartData.push(data);
    setOrderCartData(orderCartData);
  };

  const resetOrderCartCache = () => {
    setOrderCartData([]);
  };

  /**
   * Initial form data and set default value
   */
  const initCartFormData = () => {
    let orderType = OrderTypes.find((item) => item.id === OrderTypeStatus.InStore);
    setCurrentOrderType(orderType);
    form.setFieldsValue({
      orderTypeId: OrderTypeStatus.InStore,
      tableId: 1,
    });

    setOrder({});
    setOrderId(null);
    setOriginalPrice(0);
    setTotalPriceOnBill(0);
    setTotalFee(0);
    seTotalDiscountAmount(0);

    setCustomerName(null);
    setCustomerDiscount(-1);
    setCustomerDiscountAmount(0);
    setCustomerId(null);
    setIsLoadFee(true);

    setCartItems([]);
    setNumberCartItems(0);

    setTotalTax(0);

    resetOrderCartCache();
    productShoppingCartComponentRef?.current?.onReset();
    if (currentOrderType) {
      initFeesActiveAsync(currentOrderType?.id);
    }
  };

  const clearFees = () => {
    setAllFees([]);
    setFeesActive([]);
    setFeesDeActive([]);
    setFeesAutoApplied([]);
  };

  const onClearAllItems = () => {
    resetOrderCartCache();
    setCartItems([]);
    setTotalFee(0);
    setTotalPriceOnBill(0);
    setTotalTax(0);
    setOriginalPrice(0);
    setNumberCartItems(0);
    seTotalDiscountAmount(0);

    productShoppingCartComponentRef?.current?.onReset();

    orderBroadcast?.postMessage({
      action: BroadcastActions.Cart,
      data: undefined,
    });
  };

  const onClearAllItemsWhenEdit = () => {
    updateCartItems([]);
    calculateCartItems([]);
  };

  const onResetOrderCart = () => {
    setOrder({});
    setOrderId(null);
    setCustomerName(null);
    setCustomerDiscount(-1);
    setCustomerDiscountAmount(0);
    setCustomerId(null);
    setIsLoadFee(true);
    onClearAllItems();
    resetOrderCartCache();
    clearFees();
  };

  /**
   * Add item to cart - callback function from another child's component
   * @param {*} object product
   * @param {*} bool isCombo
   * @param {*} int indexChange
   */
  const onAddToCart = async (product, isCombo, indexChange) => {
    setIsAllowOutOfMaterial(false);
    let productListData = [];
    if (isCombo === true) {
      product?.comboItems?.forEach((combo) => {
        let productItem = {
          productId: combo?.productId,
        };
        productListData.push(productItem);
        combo?.toppings?.forEach((topping) => {
          let toppingItem = {
            productId: topping?.toppingId,
          };
          productListData.push(toppingItem);
        });
      });
    } else {
      let productItem = {
        productId: product?.productId,
      };
      productListData.push(productItem);
      product?.toppings?.forEach((topping) => {
        let toppingItem = {
          productId: topping?.toppingId,
        };
        productListData.push(toppingItem);
      });
    }

    const toppings =
      product.toppings?.map((item) => {
        return {
          ...item,
          toppingId: item.toppingId,
        };
      }) ?? [];

    let item = {
      productPriceId: product?.productPriceId,
      quantity: product?.quantity,
      toppings: toppings,
      isCombo: false,
      combo: null,
      options: product?.options,
      productId: product?.productId,
    };

    if (isCombo === true) {
      item.isCombo = true;
      item.combo = product;
    }

    // Edit cart item
    // Check indexChange value is not null and greater than 0
    if (indexChange?.toString().length > 0 && indexChange >= 0) {
      // replace object in index with item
      let cartItemsCopy = [...cartItems];
      cartItemsCopy.splice(indexChange, 1, item);
      const checkMaterial = await handleCheckMaterial(cartItemsCopy, product, indexChange, productListData);
      if (checkMaterial) {
        let newCartItems = [...cartItems];
        newCartItems.splice(indexChange, 1, item);
        calculateCartItems(newCartItems);
      }
    } else {
      // add item into cart items
      const listCartItems = [...cartItems, item];
      const checkMaterial = await handleCheckMaterial(listCartItems, product, indexChange, productListData);
      if (checkMaterial) {
        const listCartItems = [...cartItems, item];
        calculateCartItems(listCartItems);
      }
    }
  };

  /**
   * Add item to cart and call api to calculate order cart
   * @param {*} product item to add to cart
   * @param {*} isCombo bool: item is combo or product
   * @param {*} indexChange position item in cart - use for edit case only
   */
  const handleAddToCard = (product, isCombo, indexChange) => {
    const toppings =
      product.toppings?.map((item) => {
        return {
          ...item,
          toppingId: item.toppingId,
        };
      }) ?? [];

    let item = {
      orderItemId: product?.orderItemId ?? null,
      productPriceId: product?.productPriceId,
      quantity: product?.quantity,
      toppings: toppings,
      isCombo: false,
      combo: null,
      options: product?.options,
      productId: product?.productId,
    };

    if (isCombo === true) {
      item.isCombo = true;
      item.combo = product;
    }

    // Edit cart item if this has index change
    if (indexChange !== undefined && indexChange !== null) {
      let newCartItems = [...cartItems];
      newCartItems.splice(indexChange, 1, item); // replace object in index with item
      calculateCartItems(newCartItems);
    } else {
      // add item into cart items
      const listCartItems = [...cartItems, item];
      calculateCartItems(listCartItems);
    }
  };

  /**
   * Update cart items
   * @param {*} cartItems
   * @param {*} selectedCustomerId
   */
  const calculateCartItems = (cartItems, selectedCustomerId, skipCheckOrderItems) => {
    const listCartItems = mappingCartItemForCalculateRequest(cartItems);
    const selectedFeeIds = feesActive?.map((item) => item.id) ?? [];
    var request = {
      cartItems: listCartItems,
      orderFeeIds: selectedFeeIds,
      customerId: customerId,
      skipCheckOrderItems: skipCheckOrderItems ?? false,
    };
    if (selectedCustomerId) {
      request.customerId = selectedCustomerId;
    }

    handleCalculateProductCartItem(request);
  };

  const printStamp = async (orderId) => {
    const printStampRequest = {
      orderId: orderId,
      printStampType: printStampType.ALL_ORDER_ITEMS,
    };

    const printStampResult = await orderDataService.printOrderStampDataAsync(printStampRequest);
    if (printStampResult) {
      const { stampConfig, stampData } = printStampResult;
      if (stampRef && stampRef.current) {
        stampRef.current.render(stampConfig, stampData, true);
        stampRef.current.print();
      }
    }
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

  const handleCalculateProductCartItem = (request) => {
    productDataService
      .calculateProductCartItemAsync(request)
      .then((res) => {
        const {
          cartItems,
          originalPrice,
          totalPriceAfterDiscount,
          totalFee,
          customerDiscountAmount,
          totalDiscountAmount,
          totalTax,
        } = res;

        setTotalPriceAfterDiscount(totalPriceAfterDiscount);
        seTotalDiscountAmount(totalDiscountAmount);
        updateCartItems(cartItems);
        setTotalPriceOnBill(totalPriceAfterDiscount);
        setOriginalPrice(originalPrice);
        setTotalFee(totalFee);
        setCustomerDiscountAmount(customerDiscountAmount);
        setIsDiscountOnTotal(res?.isDiscountOnTotal);
        setMaximumDiscountAmount(res?.discountTotalPromotion?.maximumDiscountAmount);
        setTotalTax(totalTax);
        orderBroadcast?.postMessage({
          action: BroadcastActions.Cart,
          data: res,
        });
        setNumberCartItems(cartItems.length);
      })
      .catch((err) => {
        if (err && err.length > 0) {
          const messages = err
            ?.filter((i) => i.type === MessageConstants.DIALOG_MESSAGE)
            .map((i) => i?.message)
            .join();
          setShowAlert(true);
          setRemoveOrderItemName(messages);
        }
      });
  };

  /**
   * Mapping cart items to request model
   * @param {*} cartItems
   * @returns
   */
  const mappingCartItemForCalculateRequest = (cartItems) => {
    const result = cartItems.map((cartItem) => {
      const { isCombo, combo } = cartItem;
      if (isCombo === true) {
        return {
          orderItemId: cartItem?.orderItemId,
          isCombo: true,
          combo: {
            comboId: combo.comboId,
            comboPricingId: combo.comboPricingId,
            comboName: combo.comboName,
            itemName: combo.itemName,
            originalPrice: combo.originalPrice,
            sellingPrice: combo.sellingPrice,
            quantity: combo.quantity,
            comboItems: combo?.comboItems?.map((i) => {
              return {
                productPriceId: i?.productPriceId,
                itemName: i?.itemName,
                quantity: i?.quantity,
                productId: i?.productId,
                options: i.options?.map((option) => {
                  return {
                    optionId: option.optionId,
                    optionName: option.optionName,
                    optionLevelId: option.optionLevelId,
                    optionLevelName: option.optionLevelName,
                  };
                }),
                toppings: i.toppings?.map((topping) => {
                  return {
                    toppingId: topping.toppingId,
                    name: topping?.name,
                    priceValue: topping?.priceValue,
                    quantity: topping.quantity,
                  };
                }),
              };
            }),
          },
          quantity: combo.quantity,
        };
      }

      return {
        orderId: cartItem?.orderId ?? null,
        orderItemId: cartItem?.orderItemId ?? null,
        productPriceId: cartItem.productPriceId,
        quantity: cartItem.quantity,
        options: cartItem.options,
        toppings: cartItem.toppings,
        productId: cartItem.productId,
        promotionId: cartItem.promotionId,
        promotionName: cartItem.promotionName,
        promotionValue: cartItem.promotionValue,
        isPercentDiscount: cartItem.isPercentDiscount,
      };
    });

    return result;
  };

  const onChangeItemQuantity = (indexChange, quantity, orderId = null, skipCheckOrderItem) => {
    const item = cartItems.find((_, index) => index === indexChange);
    if (item) {
      let newItem = null;
      if (item.isCombo) {
        newItem = {
          ...item,
          combo: {
            ...item.combo,
            quantity: quantity,
          },
          orderId: orderId,
        };
      } else {
        newItem = {
          ...item,
          quantity: quantity,
          orderId: orderId,
        };
      }

      cartItems.splice(indexChange, 1, newItem);
      onRefreshCartItems(cartItems, skipCheckOrderItem);
    }
  };

  /**
   * Remove a product from list product selected
   * @param {*} productId
   */
  const onRemoveProduct = (index) => {
    cartItems.splice(index, 1);
    onRefreshCartItems(cartItems);
  };

  /**
   * Call API to calculate product price
   * @param {array} updateSelectedProducts
   */
  const onRefreshCartItems = (updateSelectedProducts, skipCheckOrderItems) => {
    if (updateSelectedProducts) {
      updateCartItems(updateSelectedProducts);
      calculateCartItems(updateSelectedProducts, null, skipCheckOrderItems);
    } else {
      updateCartItems(cartItems);
      calculateCartItems(cartItems);
    }
  };

  /**
   * Update selected product formatted in state
   * @param {*} products
   */
  const updateCartItems = (products) => {
    if (products?.length === 0) {
      seTotalDiscountAmount(0);
    }

    setCartItems(products);
    productShoppingCartComponentRef.current.setProducts(products);
    return products;
  };

  /**
   * Handle cancel order
   */
  const onCancelOrder = () => {
    /// TODO: Handle cancel order
  };

  const onEditOrder = async (orderId, isSaveDraffAndContinue) => {
    setOrderId(orderId);
    setShowPOSOrderDialog(false);
    const res = await orderDataService.getPrepareOrderEditDataRequestAsync(orderId);
    if (res) {
      const {
        cartItems,
        customerDiscountAmount,
        originalPrice,
        totalFee,
        totalPriceAfterDiscount,
        customerId,
        orderFeeIds,
        fees,
        customerName,
        totalTax,
        totalDiscountAmount,
      } = res;
      const listFees = fees.filter((f) => orderFeeIds.includes(f.id));
      productShoppingCartComponentRef.current.setOrder(res, isSaveDraffAndContinue);
      setCustomerId(customerId);

      let formattedProducts = [];
      cartItems?.forEach((product) => {
        let productItem = {};
        if (product.isCombo) {
          productItem = {
            orderItemId: product?.orderItemId ?? null,
            combo: {
              ...product,
              sellingPrice: product?.combo.sellingPrice,
              originalPrice: product?.combo.originalPrice,
            },
            isCombo: true,
            isProductFromOrder: true,
          };
        } else {
          productItem = {
            ...product,
            totalPriceAfterDiscount: product?.priceAfterDiscount,
            isProductFromOrder: true,
          };
        }
        formattedProducts.push(productItem);
      });

      // update cart items
      updateCartItems(formattedProducts);

      setTotalPriceOnBill(totalPriceAfterDiscount);
      setOriginalPrice(originalPrice);
      setTotalFee(totalFee);
      setTotalTax(totalTax);
      setCustomerDiscountAmount(customerDiscountAmount);
      setCustomerName(customerName);
      seTotalDiscountAmount(totalDiscountAmount);
      setFeesActive(listFees);
      setNumberCartItems(cartItems.length);
      setIsCallbackOnEditOrder(true); // set flag to call back to calculate order cart - line 219
    }
  };

  /**
   * Handle submit order
   */
  const onSaveOrder = async () => {
    const listCartItems = mappingCartItemForCalculateRequest(cartItems);
    const selectedFeeIds = feesActive?.map((item) => item.id);

    const createOrderRequest = {
      orderId: orderId,
      customerId: customerId,
      tableId: selectedTableId,
      enumOrderTypeId: currentOrderType?.id,
      enumPaymentMethodId: PaymentMethodConstants.Cash, // set default payment method is cash
      orderFeeIds: selectedFeeIds, //list fee selected
      cartItems: listCartItems,
      totalTax: totalTax,
      orderStatus: OrderStatus.Processing,
    };

    let res = await orderDataService.createPOSOrderAsync(createOrderRequest);
    if (res?.success === true) {
      if (orderId) {
        message.success("Update order success");
        // setOrderId(null);
      } else {
        message.success("Create order success");
      }
      /// Reset data
      onResetOrderCart();
      setNumberCartItems(0);
      initFeesActiveAsync(currentOrderType?.id);
      onResetTable();

      orderBroadcast?.postMessage({
        action: BroadcastActions.ShowThanks,
      });
    } else {
      message.error("Create order failed");
    }
  };

  /**
   * Handle save ToConfirm Order
   */
  const onSaveToConfirmOrder = async () => {
    const currentOrder = {
      orderId: orderId,
      orderStatusId: OrderStatus.Processing,
    };

    let res = await orderDataService.updateOrderStatusAsync(currentOrder);
    if (res) {
      message.success(pageData.confirmOrderSuccess);
      onSaveOrder();
      setShowPOSOrderDialog(true);
    }
  };

  /**
   * Handle order payment
   */
  const createOrderAndOpenPaymentMethod = async () => {
    const listCartItems = mappingCartItemForCalculateRequest(cartItems);
    if (listCartItems && listCartItems.length < 1) {
      message.error("Please select item before payment");
      return;
    }

    const storeConfigs = getStoreConfigs();
    const { isPaymentLater } = storeConfigs;
    const selectedFeeIds = feesActive?.map((item) => item.id);
    const createOrderRequest = {
      orderId: orderId,
      customerId: customerId,
      tableId: selectedTableId,
      enumOrderTypeId: currentOrderType?.id,
      enumPaymentMethodId: PaymentMethodConstants.Cash, // set default payment method is cash
      orderFeeIds: selectedFeeIds, //list fee selected
      cartItems: listCartItems,
      orderStatus: isPaymentLater === true ? OrderStatus.Processing : OrderStatus.Draft,
      totalTax: totalTax,
      isDraftOrderPublished: true, // A flag use for transferring draft order into normal
    };

    let res = await orderDataService.createPOSOrderAsync(createOrderRequest);
    if (res?.success === true) {
      let data = res?.data;
      setOrderId(null);

      // check store config to show payment method
      executePayment();
      const { orderId } = data;
      oderPayment.current({
        id: orderId,
        isRefresh: true,
      });
      setOrderIdForPaymentMethod(orderId);
      initFeesActiveAsync(currentOrderType?.id);
      setNumberCartItems(0);

      orderBroadcast?.postMessage({
        action: BroadcastActions.ShowThanks,
      });
    } else {
      message.error(res?.message);
    }
  };

  /**
   * Handle Save Draft Order
   */
  const saveDraftOrder = async (resetCart) => {
    const listCartItems = mappingCartItemForCalculateRequest(cartItems);
    if (listCartItems && listCartItems.length < 1) {
      message.error("Please select item before payment");
      return;
    }

    const selectedFeeIds = feesActive?.map((item) => item.id);
    const createOrderRequest = {
      orderId: orderId,
      customerId: customerId, /// TODO: get customerId
      tableId: selectedTableId,
      enumOrderTypeId: currentOrderType?.id, // TODO: get orderTypeId
      enumPaymentMethodId: 3, /// TODO: get payment method
      orderFeeIds: selectedFeeIds, //list fee selected
      cartItems: listCartItems,
      orderStatus: OrderStatus.Draft,
      totalTax: totalTax,
      isDraftOrderPublished: false, // A flag use for transferring draft order into normal
    };

    let res = await orderDataService.createPOSOrderAsync(createOrderRequest);
    if (res?.success === true) {
      message.success(pageData.saveDraftSuccess);

      if (resetCart === true) {
        setOrderId(null);
        onResetOrderCart();
        setNumberCartItems(0);
        initFeesActiveAsync(currentOrderType?.id);
        onResetTable();
      }

      orderBroadcast?.postMessage({
        action: BroadcastActions.ShowThanks,
      });
    } else {
      message.error(res?.message);
    }
  };

  /**
   * Handle delivery order payment
   */
  const openDeliveryOrder = async () => {
    const listCartItems = mappingCartItemForCalculateRequest(cartItems);
    if (listCartItems && listCartItems.length < 1) {
      message.error(pageData.errorPlaceOrderDelivery);
      return;
    }

    const createOrderRequest = {
      enumOrderTypeId: currentOrderType?.id, // TODO: get orderTypeId
      orderFeeIds: feesActive?.map((item) => item.id),
      cartItems: listCartItems,
      customerId: customerId,
    };

    const billingData = {
      originalPrice: originalPrice,
      numberOfItems: cartItems.length,
      feeAmount: totalFee,
      discountAmount: totalDiscountAmount,
      totalTax: totalTax,
    };

    const res = await storeDataService.getPrepareStoreDataForOrderDeliveryAsync();
    if (res) {
      if (deliveryOrderRef && deliveryOrderRef.current) {
        deliveryOrderRef.current.setInitData(res);
        deliveryOrderRef.current.setOrderRequest(createOrderRequest);
        deliveryOrderRef.current.setBillingData(billingData);
        if (customerInfo) {
          deliveryOrderRef.current.setCustomerInfo(customerInfo);
        }
      }
      setShowDeliveryOrder(true);
    }
  };

  const renderDeliveryOrder = () => {
    return (
      <DeliveryOrder
        ref={deliveryOrderRef}
        isModalVisible={showDeliveryOrder}
        handleCancel={() => setShowDeliveryOrder(false)}
        onCompleted={onCompletedCreateDeliveryOrder}
      />
    );
  };

  const initCartFormDataDeliveryOrder = () => {
    setOrder({});
    setOrderId(null);
    setOriginalPrice(0);
    setTotalPriceOnBill(0);
    setTotalFee(0);
    seTotalDiscountAmount(0);

    setCustomerName(null);
    setCustomerDiscount(-1);
    setCustomerDiscountAmount(0);
    setCustomerId(null);
    setIsLoadFee(true);

    setCartItems([]);
    setNumberCartItems(0);

    setTotalTax(0);

    resetOrderCartCache();
    productShoppingCartComponentRef?.current?.onReset();
    if (currentOrderType) {
      initFeesActiveAsync(currentOrderType?.id);
    }
  };

  const onCompletedCreateDeliveryOrder = () => {
    initCartFormDataDeliveryOrder();
    setShowDeliveryOrder(false);
  };

  /**
   * Select and add customer to order
   * @param {*} customerId
   */
  const onSelectCustomer = (customerId) => {
    setCustomerId(customerId);
    updateCartItems(cartItems);
    calculateCartItems(cartItems, customerId);
  };

  /**
   * Remove customer from order
   */
  const onDeSelectCustomer = () => {
    setCustomerName(null);
    setCustomerDiscount(-1);
    setCustomerDiscountAmount(0);
    setCustomerId(null);
    updateCartItems(cartItems);

    calculateCartItems(cartItems, EmptyId);
  };

  /**
   * Handle edit customer
   * @param {*} id
   */
  const onEditCustomer = (id) => {
    if (customerDetailRef && customerDetailRef.current) {
      customerDetailRef.current.fetchData({ customerId: id });
    }
    setShowDetailCustomer(true);
  };

  const onSelectFee = (fees) => {
    setFeesActive(fees);

    const listCartItems = mappingCartItemForCalculateRequest(cartItems);
    const selectedFeeIds = fees?.map((item) => item.id);
    var request = {
      cartItems: listCartItems,
      orderFeeIds: selectedFeeIds,
      customerId: customerId,
    };

    handleCalculateProductCartItem(request);
  };

  const onRemoveAllFeeSelected = () => {
    setTotalFee(0);
    setIsLoadFee(true);

    const listCartItems = mappingCartItemForCalculateRequest(cartItems);
    var request = {
      cartItems: listCartItems,
      orderFeeIds: [],
      customerId: customerId,
    };

    handleCalculateProductCartItem(request);
    setFeesActive([]);
    setFeesDeActive([]);
  };

  const fetchCustomerDataAsync = () => {
    customerDataService.getPosCustomersAsync("").then((res) => {
      setCustomer(res.customer);
      let dataAuto = [];
      res.customer.map((item) => {
        dataAuto.push({ value: item?.customerName, label: item?.customerName });
      });
      setCustomerAutoComplete(dataAuto);
    });
  };

  const onShowCustomerManagementDialog = () => {
    fetchCustomerDataAsync();
    setShowCustomer(true);
  };

  /**
   * Fetch fee data and auto select fee apply today
   */
  const onShowFeeManagementDialog = (openFee) => {
    getFeesActiveAsync();
    setShowFee(openFee);
  };

  const getFeesActiveAsync = async () => {
    if (feesActive.length >= 0 && allFees.length > 0) {
      let listFeeInActive = [];
      let listFeeActive = [];
      allFees?.forEach((f) => {
        const feeActive = feesActive?.find((item) => item.id === f.id);
        if (!feeActive) {
          listFeeInActive.push(f);
        } else {
          listFeeActive.push(f);
        }
      });

      setFeesActive(listFeeActive);
      setFeesDeActive(listFeeInActive);
    } else {
      const activeFeeResponse = await feeDataService.getFeesActiveAsync(currentOrderType?.id);
      setFeesActive(activeFeeResponse?.feesAutoApplied);
      setAllFees(activeFeeResponse?.allFeesActive);
      setFeesDeActive(activeFeeResponse?.feesDeActive);
    }
  };

  const initFeesActiveAsync = async (orderType) => {
    if (feesActive.length === 0 || feesAutoApplied.length === 0) {
      const activeFeeResponse = await feeDataService.getFeesActiveAsync(orderType);
      setFeesAutoApplied(activeFeeResponse?.feesAutoApplied);
      setFeesActive(activeFeeResponse?.feesAutoApplied);
      setFeesDeActive(activeFeeResponse?.feesDeActive);
    }
  };

  const openTableOrderManagement = () => {
    setShowTableOrderManagement(true);
    if (areaFuncs.current) areaFuncs.current();
  };

  /**
   * This code is used to clear data from the Order Details page (Secondary Screen)
   */
  window.addEventListener("beforeunload", function (e) {
    orderBroadcast?.postMessage({
      action: BroadcastActions.Cart,
      data: undefined,
    });
  });

  /**
   * This function is used to hide the Payment Method modal and clear data on the Order Details (Secondary Screen)
   */
  const paymentWithPaymentMethodHasBeenCompleted = (orderId) => {
    setShowPaymentMethod(false);
    initCartFormData();
    onResetTable();
    orderBroadcast?.postMessage({
      action: BroadcastActions.ShowThanks,
      data: undefined,
    });

    storeDataService.getStoreKitchenConfigByStoreIdAsync().then((res) => {
      if (res) {
        if (!res.isStoreHasKitchen) {
          printStamp(orderId);
        }
      }
    });
  };

  const openSelectTableComponent = () => {
    setShowSelectTable(true);
    if (selectTableFuncs.current) selectTableFuncs.current();
  };

  const openOrderManagementComponent = () => {
    setShowTableManagement(true);
    if (orderManagementFuncs.current) orderManagementFuncs.current();
  };

  /**
   * These lines are used to register a listener, which always listens for all events from the Broadcast pipeline.
   * @param  {event} event The event is passed from the Message Pipeline.
   */
  orderBroadcast.onmessage = (event) => {
    let result = event.data;
    switch (result.action) {
      case BroadcastActions.PaymentHasBeenCompleted: {
        if (result.data === true) {
          setShowGreatComponent(true);
          printBill(orderIdForPaymentMethod);
          paymentWithPaymentMethodHasBeenCompleted(orderIdForPaymentMethod);
        } else {
          message.warn(pageData.paymentUnsuccessful);
        }
        break;
      }
      case BroadcastActions.PaymentSuccessfully: {
        setShowGreatComponent(true);
        printBill(orderIdForPaymentMethod);
        paymentWithPaymentMethodHasBeenCompleted(orderIdForPaymentMethod);
        break;
      }
      default:
        break;
    }
  };

  const renderFeeModal = () => {
    return (
      <Modal
        className="fee-management-modal"
        visible={showFee}
        onCancel={() => setShowFee(false)}
        footer={(null, null)}
        width={1146}
      >
        <FeeManagementComponent
          onSelectFee={onSelectFee}
          currencyAmount={currencyAmount}
          percentAmount={percentAmount}
          setCurrencyAmount={setCurrencyAmount}
          setPercentAmount={setPercentAmount}
          totalInput={totalInput}
          feesActive={feesActive}
          feesDeActive={feesDeActive}
          setFeesDeActive={setFeesDeActive}
          setTotalFee={setTotalFee}
          totalFee={totalFee}
          setIsLoadFee={setIsLoadFee}
        />
      </Modal>
    );
  };

  const renderTableOrder = () => {
    return (
      <TableOrderManagement
        isModalVisible={showTableOrderManagement}
        handleCancel={() => setShowTableOrderManagement(false)}
        tableFuncs={areaFuncs}
      />
    );
  };

  const renderPaymentMethod = () => {
    return (
      <PaymentMethod
        saveDraftOrder={showPaymentMethod}
        orderDataService={orderDataService}
        isModalVisible={showPaymentMethod}
        handleCancel={() => {
          setShowPaymentMethod(false);
        }}
        onCompleted={paymentWithPaymentMethodHasBeenCompleted}
        tableFuncs={oderPayment}
      />
    );
  };

  const renderHeaderDashboard = () => {
    return (
      <Header className="site-layout-background fnb-pos-header">
        <Row className="ml-4" gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col span={24} className="gutter-row">
            <h2 className="text-center">
              <span className="mr-5 pointer" onClick={() => setShowPOSOrderDialog(true)}>
                <ShopOutlined /> ORDER
              </span>
              <span className="pointer" onClick={openTableOrderManagement}>
                <AppstoreOutlined /> TABLE
              </span>
            </h2>
          </Col>
        </Row>
        <Row>
          <Col span={18} xxl={12} className="m-auto">
            <Search placeholder="Search" />
          </Col>
        </Row>
      </Header>
    );
  };

  const renderCustomerDetailModal = () => {
    return (
      <CustomerDetail
        handleCancel={() => setShowDetailCustomer(false)}
        ref={customerDetailRef}
        showDetailCustomer={showDetailCustomer}
        setCustomerName={setCustomerName}
      ></CustomerDetail>
    );
  };

  const renderPosCustomerManagement = () => {
    return (
      <Modal
        className="modal-pos-large"
        title={pageData.customer}
        visible={showCustomer}
        onCancel={() => setShowCustomer(false)}
        footer={(null, null)}
        width={"50%"}
      >
        <TableCustomer
          setCustomerPhone={setCustomerPhone}
          setCustomerDiscountPercent={setCustomerDiscountPercent}
          setCustomerRank={setCustomerRank}
          onSelectCustomer={onSelectCustomer}
          isModalVisible={showCustomer}
          setCustomerName={setCustomerName}
          setCustomerDiscount={setCustomerDiscount}
          totalPriceOnBill={totalPriceOnBill ?? 0}
          setCustomer={setCustomer}
          setCustomerAutoComplete={setCustomerAutoComplete}
          customer={customer}
          customerAutoComplete={customerAutoComplete}
          handleCancel={() => setShowCustomer(false)}
          setShowCustomer={setShowCustomer}
          showCreateCustomer={showCreateCustomer}
          setShowCreateCustomer={setShowCreateCustomer}
          fetchCustomerDataAsync={fetchCustomerDataAsync}
        />
      </Modal>
    );
  };

  const renderPosOrderModal = () => {
    return (
      <PosOrderManagement
        isModalVisible={showPOSOrderDialog}
        handleCancel={() => setShowPOSOrderDialog(false)}
        onEditOrder={onEditOrder}
        numberCartItems={numberCartItems}
        saveDraftOrder={saveDraftOrder}
      />
    );
  };

  const renderTableManagement = () => {
    return (
      <>
        <PosTableManagement
          isModalVisible={showTableManagement}
          handleCancel={setShowTableManagement}
          tableFuncs={orderManagementFuncs}
        />
      </>
    );
  };

  const renderSelectTableComponent = () => {
    return (
      <SelectTableComponent
        isModalVisible={showSelectTable}
        handleCancel={() => setShowSelectTable(false)}
        tableFuncs={selectTableFuncs}
        onSelectTable={(data) => onSelectTable(data)}
      />
    );
  };

  const onSelectTable = (table) => {
    setShowSelectTable(false);
    setSelectedTableId(table?.id);
    setSelectedTableName(table?.name);
  };

  const onResetTable = () => {
    setSelectedTableId(null);
    setSelectedTableName(null);
  };

  /**
   * This function will be fired when the staff clicks on the button New Order.
   */
  const onNewOrder = () => {
    orderBroadcast?.postMessage({
      action: BroadcastActions.Cart,
      data: undefined,
    });

    if (window?.location?.href?.endsWith("dashboard")) {
      history.push("/");
    } else {
      history.push("/dashboard");
    }
  };

  const setOrderTypeId = (value) => {
    let orderType = OrderTypes.find((item) => item.id === value);
    setCurrentOrderType(orderType);
    let formData = form.getFieldsValue();
    formData.orderTypeId = value;

    form.setFieldsValue(formData);
    feeDataService.getFeesActiveAsync(orderType?.id).then((data) => {
      setFeesActive(data?.feesAutoApplied);
      setFeesDeActive(data?.feesDeActive);
      onSelectFee(data?.feesAutoApplied);
    });
  };

  /**
   * Handle edit product cart item
   * @param {*} productId
   * @param {*} isEdit
   */
  const onProductItemClick = (productId, product, index) => {
    if (productDetailRef && productDetailRef.current) {
      productDetailRef.current.open(productId, product, index);
    }
  };

  /**
   * Handle edit combo cart item
   */
  const editComboClick = (cartItem, indexChange) => {
    const { combo } = cartItem;
    if (comboDetailRef && comboDetailRef.current) {
      // find edit combo data from cache
      let editCombo = orderCartData?.find((i) => i?.key === combo?.comboId) ?? null;
      if (editCombo === null) {
        const editCartItem = cartItems?.find((i) => i.isCombo === true && cartItem?.orderItemId === i?.orderItemId);
        editCombo = editCartItem?.combo;
      }

      comboDetailRef.current.edit({ ...editCombo, ...combo }, indexChange);
    }
  };

  /**
   * This modal will be displayed when the payment has been paid successfully.
   */
  const renderGreatComponent = () => {
    return (
      <GreatComponent
        showModal={showGreatComponent}
        title={pageData.greatModal.title}
        text={pageData.greatModal.paymentText}
        buttonComponent={
          <Button onClick={onNewOrder} type="primary" className="btn-new-order">
            {pageData.newOrder}
          </Button>
        }
      />
    );
  };

  const renderDialogRemoveItemMessageContent = () => {
    return (
      <div className="text-center">
        <div>Cannot remove item</div>
        <div>The product {removeOrderItemName} has been prepared successfully!</div>
      </div>
    );
  };

  const onCancelAddToCart = () => {
    setShowConfirmAddToCard(false);
  };

  const onConfirmAddToCart = () => {
    setShowConfirmAddToCard(false);
    handleAddToCard(dataAddToCard?.product, dataAddToCard?.isCombo, dataAddToCard?.indexChange);
  };

  const executePayment = () => {
    const storeConfigs = getStoreConfigs();
    const { isPaymentLater } = storeConfigs;
    if (isPaymentLater === true) {
      message.success(pageData.createOrderSuccess);
      setNumberCartItems(0);
      initCartFormData();
      onResetTable();
    } else {
      setShowPaymentMethod(true);
    }
  };

  const handleCheckMaterial = async (items, productCallback, indexChange, productList) => {
    const listCartItems = getRequestModel(items);
    let dataSubmit = { cartItems: listCartItems, productList: productList };
    const checkResult = await orderDataService.checkAddProductForOrder(dataSubmit);
    if (checkResult?.productInformationListResponse?.length <= 0) {
      return true;
    } else {
      let productName = [];
      checkResult?.productInformationListResponse?.forEach((product) => {
        productName.push(product?.productName);
      });

      // set data for callback model
      setDataAddToCard({
        product: productCallback,
        isCombo:
          (productCallback?.comboId && productCallback?.comboItems && productCallback?.comboItems.length > 0) || false,
        indexChange: indexChange,
      });

      setIsAllowOutOfMaterial(checkResult.isAllowOutOfMaterial);
      if (checkResult.isAllowOutOfMaterial) {
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
      return false;
    }
  };

  /**
   * Mapping cart items to request model
   * @param {*} items
   * @returns
   */
  const getRequestModel = (items) => {
    const result = items.map((item) => {
      const { isCombo, combo } = item;
      if (isCombo === true) {
        return {
          isCombo: true,
          combo: {
            comboId: combo.comboId,
            comboPricingId: combo.comboPricingId,
            comboName: combo.comboName,
            itemName: combo.itemName,
            originalPrice: combo.originalPrice,
            sellingPrice: combo.sellingPrice,
            quantity: combo.quantity,
            comboItems: combo?.comboItems?.map((i) => {
              return {
                productPriceId: i?.productPriceId,
                itemName: i?.itemName,
                quantity: i?.quantity,
                productId: i?.productId,
                options: i.options?.map((option) => {
                  return {
                    optionId: option.optionId,
                    optionName: option.optionName,
                    optionLevelId: option.optionLevelId,
                    optionLevelName: option.optionLevelName,
                  };
                }),
                toppings: i.toppings?.map((topping) => {
                  return {
                    toppingId: topping.toppingId,
                    name: topping?.name,
                    priceValue: topping?.priceValue,
                    quantity: topping.quantity,
                  };
                }),
              };
            }),
          },
          quantity: combo.quantity,
        };
      }

      return {
        orderId: item?.orderId,
        orderItemId: item?.orderItemId,
        productPriceId: item.productPriceId,
        quantity: item.quantity,
        options: item.options,
        toppings: item.toppings,
        productId: item.productId,

        promotionId: item.promotionId,
        promotionName: item.promotionName,
        promotionValue: item.promotionValue,
        isPercentDiscount: item.isPercentDiscount,
      };
    });

    return result;
  };

  return (
    <>
      <div className="d-none">
        <StampTemplateComponent ref={stampRef} />
        <ReceiptTemplateComponent ref={billTemplateRef} />
      </div>

      <FnbAlertComponent
        visible={showAlert}
        type={"warning"}
        title={"NOTIFICATION"}
        content={renderDialogRemoveItemMessageContent()}
        onOk={() => setShowAlert(false)}
        okText={pageData.btnIGotIt}
      />

      <LeftMenuComponent
        isOpenMenu={isOpenMenu}
        setIsOpenMenu={setIsOpenMenu}
        setShowPOSOrderDialog={setShowPOSOrderDialog}
        setShowTableManagement={setShowTableManagement}
      />

      <Form form={form} className="c-dashboard">
        <div className="dashboard-wrapper">
          <Form.Item hidden={true} name="orderTypeId">
            <Input type="hidden" />
          </Form.Item>
          <div className="dashboard-container prevent-select">
            <OrderTypeComponent setOrderTypeId={setOrderTypeId} isOpenMenu={isOpenMenu} setIsOpenMenu={setIsOpenMenu} />

            <OrderContentComponent
              onProductItemClick={onProductItemClick}
              comboDetailRef={comboDetailRef}
              onAddToCart={onAddToCart}
              currentOrderType={currentOrderType}
              setShowPOSOrderDialog={setShowPOSOrderDialog}
              openSelectTableComponent={openSelectTableComponent}
              selectedTable={{ id: selectedTableId, name: selectedTableName }}
              setShowTableManagement={openOrderManagementComponent}
              addOrderCartCache={addOrderCartCache}
            />

            <OrderCheckoutComponent
              ref={productShoppingCartComponentRef}
              order={order}
              onRemoveProduct={onRemoveProduct}
              onChangeItemQuantity={onChangeItemQuantity}
              totalPriceOnBill={totalPriceOnBill}
              originalPrice={originalPrice}
              totalFee={totalFee}
              totalDiscountAmount={totalDiscountAmount}
              totalTax={totalTax}
              onSaveOrder={onSaveOrder}
              onSaveDraftOrder={saveDraftOrder}
              onSaveToConfirmOrder={onSaveToConfirmOrder}
              openPaymentMethod={
                currentOrderType?.id === OrderTypeStatus.Delivery ? openDeliveryOrder : createOrderAndOpenPaymentMethod
              }
              currentOrderType={currentOrderType}
              onCancelOrder={onCancelOrder}
              onShowFeeManagementDialog={onShowFeeManagementDialog}
              onProductItemClick={onProductItemClick}
              editComboClick={editComboClick}
              onDeSelectCustomer={onDeSelectCustomer}
              handleShowDetailCustomer={(id) => onEditCustomer(id)}
              onSelectCustomer={onSelectCustomer}
              setCustomerInfo={setCustomerInfo}
              cartItems={cartItems}
              clearAllItems={onClearAllItems}
              clearAllItemsWhenEdit={onClearAllItemsWhenEdit}
              getFeesActiveAsync={getFeesActiveAsync}
              isDiscountOnTotal={isDiscountOnTotal}
              customerDiscountAmount={customerDiscountAmount}
            />
          </div>
        </div>
      </Form>

      <ProductCartDetailComponent ref={productDetailRef} onAddToCart={onAddToCart} />

      <ComboCartDetailComponent ref={comboDetailRef} onAddToCart={onAddToCart} addOrderCartCache={addOrderCartCache} />

      <div hidden={true}>
        <DeleteConfirmComponent
          title={pageData.confirmAddToCardTitle}
          visible={showConfirmAddToCard}
          onCancel={onCancelAddToCart}
          cancelText={pageData.btnIgnore}
          okText={isAllowOutOfMaterial ? pageData.btnAddToCard : pageData.btnIGotIt}
          onOk={isAllowOutOfMaterial ? onConfirmAddToCart : onCancelAddToCart}
          content={messageConfirmForAddProductToOrder}
          okType="primary"
          centered={true}
          cancelButtonProps={!isAllowOutOfMaterial && { style: { display: "none" } }}
        ></DeleteConfirmComponent>
      </div>

      {renderPaymentMethod()}
      {renderTableOrder()}
      {renderFeeModal()}
      {renderPosOrderModal()}
      {renderCustomerDetailModal()}
      {renderSelectTableComponent()}
      {renderGreatComponent()}
      {renderTableManagement()}
      {renderDeliveryOrder()}
    </>
  );
}
