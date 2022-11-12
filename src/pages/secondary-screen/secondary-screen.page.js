import { Col, Layout, message, Row } from "antd";
import orderBroadcast from "broadcast-channels/order-broadcast-channel";
import { BroadcastActions } from "constants/broadcast-actions.constants";
import { SecondaryScreenTabName } from "constants/secondary-screen-tab-name.constants";
import { VnPayResponseCodes } from "constants/vnpay-response-codes.constants";
import paymentDataService from "data-services/payment/payment-data.service";
import slideshowDataService from "data-services/slideshow/slideshow-data.service";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { executeAfter } from "utils/helpers";
import DefaultBackground from "../../assets/login-pos-bg.jpg";
import CarouselComponent from "./components/carousel.component";
import "./secondary-screen.page.scss";

/**
 * Temporary logo image, it will be removed in the feature,
 * we will load from the cloud such as Azure Store, AWS
 */
import { BannerTypes } from "constants/banner-type.constants";
import { FnbLogo, GoFnBLogoIcon, SecondaryTopLeftBg, SecondaryTopRightBg } from "constants/icons.constants";
import { PaymentMethodTab } from "pages/dashboard/components/payment/payment-method.component";
import { getStorage, removeStorage, setStorage } from "utils/localStorage.helpers";
import logo from "../../assets/food-beverage.png";
import { SecondaryScreenOrderDetail } from "./components/secondary-screen-order-detail.component";

const MOMO_REQUEST_ID = "MOMO_REQUEST_ID";
const VNPAY_REQUEST_ID = "VNPAY_REQUEST_ID";
export default function SecondaryScreenPage(props) {
  const { t } = useTranslation();
  const { search } = useLocation();
  const [shoppingCart, setShoppingCart] = useState([]);
  const [currentTab, setCurrentTab] = useState(SecondaryScreenTabName.Default);
  const [currentWindow, setCurrentWindow] = useState();
  const [currentOrder, setCurrentOrder] = useState();
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState(null);

  //SliderType 0 is full screen, 1 is left screen
  const [slideshow, setSlideshow] = useState([]);
  const [fullscreenBanner, setFullScreenBanner] = useState([]);
  const [screenSaverTimeout, setScreenSaverTimeout] = useState(0);
  const [playScreenSaver, setPlayScreenSaver] = useState(false);
  const [storeLogo, setStoreLogo] = useState(props?.storeLogo);

  const pageData = {
    thanks: t("payment.thanks"),
    paymentUnsuccessful: t("payment.paymentUnsuccessful"),
    greatModal: {
      title: t("greatModal.title"),
    },
    secondaryScreen: {
      welcome: t("secondaryScreen.welcome"),
    },
  };

  useEffect(() => {
    getBannerLeftSide();
    getBannerFullScreen();
  }, []);

  useEffect(() => {
    const { tab } = props?.match?.params || {};
    if (tab) {
      setCurrentTab(tab);
    }

    if (shoppingCart != null) {
      setScreenSaverTimeout(5000);
      setPlayScreenSaver(false);
    } else {
      setTimeout(() => {
        setPlayScreenSaver(true);
      }, screenSaverTimeout);
    }
  }, [shoppingCart]);

  /**
   * The method is used to register an event that listens for all messages, it will be called when the Broadcast posts a message.
   * @param  {any} event the event is passed from the Dashboard page, it contains data to display on this view.
   * @description Received cart item data changed from the dashboard page
   * */
  orderBroadcast.onmessage = (event) => {
    let result = event.data;
    switch (result.action) {
      // This action will be fired when the staff clicks on the product item on the POS Dashboard page.
      case BroadcastActions.Cart: {
        clearTimeout(window.searchTimeout);
        setCurrentTab(SecondaryScreenTabName.ShoppingCart);
        setCurrentPaymentMethod(null);
        if (result.data) {
          setShoppingCart(result.data);
          const { cartItems } = result.data;
          /// If cart item is empty => after 10s redirect to default page
          if (cartItems && cartItems?.length === 0) {
            executeAfter(10 * 1000, () => {
              resetTab();
            });
          }
        } else {
          resetTab();
        }
        break;
      }
      // This action will be fired when the staff clicks on the button Create VNPAY QR Code on the Payment Method modal.
      case BroadcastActions.RedirectVnPay: {
        setCurrentPaymentMethod(PaymentMethodTab.VnPay);
        if (result?.data.paymentMethod !== currentPaymentMethod && currentPaymentMethod !== null) {
          currentWindow?.close();
        }
        setCurrentOrder(result.data.orderInfo);
        let windowToPay = window.open(result.data.paymentUrl, "_blank");
        setCurrentWindow(windowToPay);
        break;
      }
      // This action will be fired when the staff clicks on the Cancel Payment button on the Payment Method modal.
      case BroadcastActions.CancelPayment: {
        setCurrentPaymentMethod(null);
        currentWindow?.close();
        resetTab();
        break;
      }
      // This action will be fired when the payment on the VNPAY website has been completed or the user clicks on the Cancel button.
      case BroadcastActions.ResponseFromVnPay: {
        setCurrentPaymentMethod(null);
        currentWindow?.close();

        // lock duplicate
        const requestId = result.data.vnp_TxnRef;
        const requestIdChecked = getStorage(VNPAY_REQUEST_ID);
        if (!requestIdChecked || requestId !== requestIdChecked) {
          setStorage(VNPAY_REQUEST_ID, requestId);
          let flag = result.data.vnp_ResponseCode === VnPayResponseCodes.paymentWasSuccessful;
          if (flag) {
            let formData = {
              amount: result.data.vnp_Amount,
              bankCode: result.data.vnp_BankCode,
              orderCode: currentOrder?.originalCode,
              orderInfo: result.data.vnp_OrderInfo,
              payDate: result.data.vnp_PayDate,
              responseCode: result.data.vnp_ResponseCode,
              secureHash: result.data.vnp_SecureHash,
              terminalId: result.data.vnp_TmnCode,
              transactionNo: result.data.vnp_TransactionNo,
              transactionStatus: result.data.vnp_TransactionStatus,
              txnRef: result.data.vnp_TxnRef,
              vnPayCreateDate: currentOrder.vnPayCreateDate,
              urlForDebugging: window.location.href,
            };

            setCurrentOrder(undefined);
            setCurrentWindow(undefined);

            // Call the server to check this order.
            paymentDataService.updateVnPayPaymentAsync(formData).then((result) => {
              if (result.isSuccess) {
                setCurrentTab(SecondaryScreenTabName.Thanks);
              } else {
                resetTab();
                message.warn(t(result.message));
              }
              // Notify for the Dashboard page that the current order has been paid and completed.
              postMessage(BroadcastActions.PaymentHasBeenCompleted, result.isSuccess);
            });
          } else {
            resetTab();
            message.warn(pageData.paymentUnsuccessful);
            postMessage(BroadcastActions.PaymentHasBeenCompleted, false);
          }
        }
        break;
      }
      //Create QR code for Momo payment
      case BroadcastActions.RedirectMomo: {
        setCurrentPaymentMethod(PaymentMethodTab.Momo);
        if (result?.data.paymentMethod !== currentPaymentMethod && currentPaymentMethod !== null) {
          currentWindow?.close();
        }
        setCurrentOrder(result.data.orderInfo);
        let windowToPay = window.open(result.data.payUrl, "_blank");
        setCurrentWindow(windowToPay);
        break;
      }
      //Cancel Momo Payment
      case BroadcastActions.CancelMomoPayment: {
        setCurrentPaymentMethod(null);
        currentWindow?.close();
        resetTab();
        break;
      }
      // This action will be fired when the payment on the MOMO website has been completed or the user clicks on the Cancel button.
      case BroadcastActions.ResponseFromMomo: {
        currentWindow?.close();
        const { requestId, orderId, amount } = result.data;
        const requestIdChecked = getStorage(MOMO_REQUEST_ID); // lock duplicate
        if (!requestIdChecked || requestId !== requestIdChecked) {
          setStorage(MOMO_REQUEST_ID, requestId);
          paymentDataService.getOrderStatusAsync(requestId, orderId, amount).then((responseData) => {
            if (responseData.resultCode === 0) {
              postMessage(BroadcastActions.PaymentHasBeenCompleted, responseData.resultCode === 0);
              setCurrentTab(SecondaryScreenTabName.Thanks);
            } else {
              postMessage(BroadcastActions.PaymentHasBeenCompleted, false);
              message.warn(t(pageData.paymentUnsuccessful));
            }
          });
        }

        setCurrentPaymentMethod(null);
        resetTab();
        break;
      }
      ///Payment success
      case BroadcastActions.PaymentSuccessfully:
        setCurrentPaymentMethod(null);
        setCurrentTab(SecondaryScreenTabName.Thanks);
        postMessage(BroadcastActions.PaymentSuccessfully, false);
        break;
      ///Payment fail
      case BroadcastActions.PaymentUnsuccessfully:
        setCurrentPaymentMethod(null);
        resetTab();
        break;
      case BroadcastActions.ShowThanks: {
        setCurrentPaymentMethod(null);
        setCurrentTab(SecondaryScreenTabName.Thanks);
        executeAfter(5 * 1000, () => {
          resetTab();
          removeStorage(MOMO_REQUEST_ID);
          removeStorage(VNPAY_REQUEST_ID);
        });
        break;
      }
      case BroadcastActions.ChangePaymentMethod: {
        currentWindow?.close();
        break;
      }
      case BroadcastActions.ClearScreen: {
        currentWindow?.close();
        setCurrentPaymentMethod(null);
        setCurrentTab(SecondaryScreenTabName.Default);
        break;
      }
      default:
        setCurrentPaymentMethod(null);
        setCurrentTab(SecondaryScreenTabName.Default);
        break;
    }
  };

  /**
   * This function is used to send messages to any page.
   * @param  {const} action This action defined on the BroadcastActions file.
   * @param  {any} data Any data you want to send to any page.
   */
  const postMessage = (action, data) => {
    orderBroadcast?.postMessage({ action, data });
  };

  /**
   * This function is used to set the default tab.
   */
  const resetTab = () => {
    setShoppingCart([]);
    setCurrentTab(SecondaryScreenTabName.Default);
  };

  const renderBoxLeft = (_images = []) => {
    var result = (
      <Col className="boxLeft" span={24}>
        <img alt="F&B Logo" src={logo} />
      </Col>
    );

    if (_images.length > 0) {
      var imagesLeft = _images.filter((x) => x.type == 1);
      if (imagesLeft.length > 0) {
        return (
          <Col className="boxLeft c-carousel-box" span={24}>
            <CarouselComponent initData={imagesLeft} playSpeed={3000} autoPlay={true} />
          </Col>
        );
      }
    } else {
      return (
        <Col className="boxLeft" span={24}>
          <img alt="F&B Logo" src={logo} />
        </Col>
      );
    }

    return result;
  };

  /**
   * This function is used to render the cart item.
   */
  const renderCartItems = () => {
    return (
      <>
        {shoppingCart?.cartItems?.length === 0 || shoppingCart?.cartItems?.length === undefined ? (
          <>{renderDefaultPage()}</>
        ) : (
          <>
            <div className="secondary-screen-order-detail-container">
              <div className="left-content-wrapper">{renderBoxLeft(slideshow)}</div>
              <div className="right-content-wrapper">
                <SecondaryScreenOrderDetail shoppingCart={shoppingCart}></SecondaryScreenOrderDetail>
              </div>
            </div>
          </>
        )}
      </>
    );
  };

  /**
   * This function is used to render the message Thank You when the order has been completed successfully.
   */
  const renderThanks = () => {
    return (
      <Row className="thank-container">
        <div className="thank-box-left">
          <div className="left-image-container"></div>
        </div>

        <div className="thank-box-right">
          <div className="right-image-container">
            <div className="thank-box">
              <p className="title">{pageData.greatModal.title}</p>
              <p className="thank-text">{pageData.thanks}</p>
            </div>
          </div>
        </div>
      </Row>
    );
  };

  /**
   * This function is used to render content of the page by the current tab.
   */
  const renderContent = () => {
    if (playScreenSaver === true && slideshow.length > 0) {
      var images = slideshow.filter((x) => x.type === 0);
      if (images.length > 0) {
        return (
          <div className="c-carousel-box c-carousel-box--fullscreen">
            <CarouselComponent initData={images} playSpeed={5000} autoPlay={true} />
          </div>
        );
      }
    }

    switch (currentTab) {
      case SecondaryScreenTabName.ShoppingCart:
        return renderCartItems();
      case SecondaryScreenTabName.VnPay: {
        const query = new URLSearchParams(search);
        const vnPayForm = Object.fromEntries(query);
        postMessage(BroadcastActions.ResponseFromVnPay, vnPayForm);
        break;
      }
      case SecondaryScreenTabName.Thanks:
        return renderThanks();
      case SecondaryScreenTabName.Momo:
        const query = new URLSearchParams(search);
        const momoForm = Object.fromEntries(query);
        postMessage(BroadcastActions.ResponseFromMomo, momoForm);
        break;
      case SecondaryScreenTabName.Default:
      default:
        return renderDefaultPage();
    }
  };

  const renderDefaultPage = () => {
    return (
      <Row className="secondary">
        {fullscreenBanner?.length > 0 ? (
          <CarouselComponent initData={fullscreenBanner} playSpeed={7000} autoPlay={true} />
        ) : (
          <Col span="24">
            <div className="fnb-logo">
              <div className="content">
                <div className="c-icon">
                  {storeLogo ? (
                    <img width="323" height="227" src={storeLogo} alt="" className="store-logo" />
                  ) : (
                    <GoFnBLogoIcon />
                  )}
                </div>
                <div className="c-label">
                  <FnbLogo />
                </div>
              </div>
            </div>

            <div className="bg">
              <SecondaryTopLeftBg className="bg-top-left" />
              <SecondaryTopRightBg className="bg-top-right" />
              <img src={DefaultBackground} loading="lazy" />
            </div>
          </Col>
        )}
      </Row>
    );
  };

  /**
   * Get Banners Full screen
   */
  const getBannerFullScreen = async () => {
    const res = await slideshowDataService.getStoreBannersAsync(BannerTypes.FullScreen);
    if (res) {
      setFullScreenBanner(res.banners);
    }
  };

  /**
   * Get Banners Left side
   */
  const getBannerLeftSide = async () => {
    const res = await slideshowDataService.getStoreBannersAsync(BannerTypes.LeftSide);
    if (res) {
      setSlideshow(res.banners);
    }
  };

  return <Layout className="c-secondary-screen-page">{renderContent()}</Layout>;
}
