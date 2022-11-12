import { Col, Image, message, Row } from "antd";
import foodBeverageLogo from "assets/go-fnb-pos-logo.png";
import LeftMenuComponent from "components/left-menu/left-menu.component";
import {
  AlarmWhiteIcon,
  ArrowRightKitchenIcon,
  BowlFoodIcon,
  CircleOutlineIcon,
  KitchenCheckedIcon,
  OrderTypeDeliveryIcon,
  OrderTypeInStoreIcon,
  OrderTypeTakeAwayIcon,
  ReserveIcon,
  ShowMoreIcon,
  TickCircleIcon,
  TimeFillSmallIcon,
} from "constants/icons.constants";
import { images } from "constants/images.constants";
import { OrderItemStatus } from "constants/order-item-status.constant";
import { OrderTypeStatus } from "constants/order-type-status.constants";
import { PermissionKeys } from "constants/permission-key.constants";
import { printStampType } from "constants/printStamp.constants";
import kitchenDataService from "data-services/kitchen/kitchen-data.service";
import orderDataService from "data-services/order/order-data.service";
import storeDataService from "data-services/store/store-data.service";
import { StampTemplateComponent } from "pages/order/components/stamp-template.component";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
import { getUserInfo } from "services/auth.service";
import kitchenSocket from "sockets/kitchen-socket";
import { hasPermission } from "utils/helpers";
import { SessionTimer } from "./components/session-timer.component";
import "./style.scss";

export function KitchenManagementPage(props) {
  const [t] = useTranslation();
  const history = useHistory();
  const loggedUserInfo = getUserInfo();
  const stampRef = React.useRef();
  const [kitchenSessions, setKitchenSessions] = useState([]);
  const [autoPrintStamp, setAutoPrintStamp] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isShowToastMessage, setIsShowToastMessage] = useState(false);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(null);
  const [orderItemDetail, setOrderItemDetail] = useState(null);

  const pageData = {
    title: t("kitchenManagement.title"),
    order: t("kitchenManagement.order"),
    dish: t("kitchenManagement.dish"),
    completeAll: t("kitchenManagement.completeAll"),
    cancel: t("kitchenManagement.cancel"),
    completed: t("kitchenManagement.completed"),
    completeOrder: t("kitchenManagement.completeOrder"),
    position: t("kitchenManagement.position"),
    duration: t("kitchenManagement.duration"),
    item: t("kitchenManagement.item"),
    finish: t("kitchenManagement.finish"),
  };

  useEffect(() => {
    const kitchenPermission = hasPermission(PermissionKeys.KITCHEN);
    if (kitchenPermission === true) {
      initKitchenSocket();
      initSessionData();
      getStoreKitchenConfig();
    } else {
      history.push("/");
    }
  }, []);

  const getStoreKitchenConfig = () => {
    storeDataService.getStoreKitchenConfigByStoreIdAsync().then((res) => {
      if (res) {
        if (res.isStoreHasKitchen && res.isAutoPrintStamp) {
          setAutoPrintStamp(true);
        }
      }
    });
  };

  const initKitchenSocket = async () => {
    try {
      if (loggedUserInfo) {
        let userInfo = {
          BranchId: loggedUserInfo?.branchId,
          AccountId: loggedUserInfo?.accountId,
        };

        kitchenSocket.on("Kitchen", (data, orderId) => {
          var obj = JSON.parse(data);
          setKitchenSessions(obj.kitchenOrderSessions);

          // Auto print stamp when complete order
          if (orderId && orderId !== "") {
            printStamp(orderId, null, printStampType.ALL_ORDER_ITEMS);
          }
        });

        await kitchenSocket.start();
        await kitchenSocket.invoke("JoinRoom", userInfo);
      }
    } catch (error) {}
  };

  const printStamp = (orderId, orderItemId, type, quantityPrint = null) => {
    if (autoPrintStamp) {
      let printStampRequest = {};
      switch (type) {
        case printStampType.ALL_ORDER_ITEMS:
          printStampRequest = {
            orderId: orderId,
            printStampType: printStampType.ALL_ORDER_ITEMS,
          };
          break;
        case printStampType.ORDER_ITEM:
          printStampRequest = {
            orderId: orderId,
            orderItemId: orderItemId,
            printStampType: printStampType.ORDER_ITEM,
          };
          break;
        default:
          break;
      }

      orderDataService.printOrderStampDataAsync(printStampRequest).then((responseData) => {
        if (responseData) {
          const { stampConfig, stampData } = responseData;
          if (stampRef && stampRef.current) {
            stampRef.current.render(stampConfig, stampData, type === printStampType.ALL_ORDER_ITEMS, quantityPrint);
            stampRef.current.print();
          }
        }
      });
    }
  };

  const initSessionData = () => {
    kitchenDataService.getKitchenOrderSessionAsync().then((res) => {
      if (res) {
        setKitchenSessions(res.kitchenOrderSessions);
        if (res.kitchenOrderSessions?.length > 0) {
          res.kitchenOrderSessions.forEach((session, index) => {
            let { totalOrderItem, totalOrderItemCanceled, totalOrderItemCompleted } = session;
            let currentTotalOrderItem = totalOrderItem - totalOrderItemCanceled;

            let itemsHaveBeenCompleted = session?.orderItems.filter(
              (item) => item?.statusId === OrderItemStatus.Completed
            );

            if (
              totalOrderItemCompleted === currentTotalOrderItem ||
              session?.orderItems?.length === itemsHaveBeenCompleted?.length
            ) {
              onClickFinish(session, index);
            }
          });
        }
      }
    });
  };

  const onClickOrderItem = (session, orderItem, itemIndex, sessionIndex) => {
    var newSessions = kitchenSessions?.map((session, sIndex) => {
      if (sIndex === sessionIndex) {
        let newOrderItems = session.orderItems?.map((item, index) => {
          if (index === itemIndex) {
            return {
              ...item,
              currentQuantity: item.currentQuantity - 1,
            };
          } else {
            return {
              ...item,
            };
          }
        });

        let newSession = {
          ...session,
          currentOrderItemFinish: session.currentOrderItemFinish + 1,
          orderItems: [...newOrderItems],
        };
        return newSession;
      } else {
        return {
          ...session,
        };
      }
    });

    setCurrentSessionIndex(sessionIndex);

    setOrderItemDetail(orderItem);

    setKitchenSessions(newSessions);

    setIsShowToastMessage(true);

    /// Update when click orderItem
    kitchenDataService
      .updateOrderItemStatusAsync({
        sessionId: session.sessionId,
        orderItemId: orderItem.orderItemId,
        productId: orderItem.productId,
        createdTime: orderItem.createdTime,
        orderComboProductPriceItemId: orderItem?.orderComboProductPriceItemId,
        orderCode: session.orderCode,
      })
      .then((res) => {
        if (res) {
          initSessionData();
        }
      });

    /// Print stamp after complete order session
    /**
     * Show quantity order of products
     * @defaultQuantity {*} total products
     * @currentQuantity {*} the number of products left after each click completes the product, start from the total product and decrease gradually
     * @1 increase the finished product by 1
     * ex: when you click the finished product for the first time: 5(defaultQuantity) - 5(currentQuantity) + 1
     */
    let quantityPrint = orderItem.defaultQuantity - orderItem.currentQuantity + 1 + "/" + orderItem.defaultQuantity;
    printStamp(session?.orderId, orderItem?.orderItemId, printStampType.ORDER_ITEM, quantityPrint);
  };

  const onClickFinish = (session, sessionIndex) => {
    var newSessions = kitchenSessions?.map((session, sIndex) => {
      if (sIndex === sessionIndex) {
        let newOrderItems = session.orderItems?.map((item) => {
          if (item.statusId !== OrderItemStatus.Canceled) {
            return {
              ...item,
              currentQuantity: 0,
            };
          } else {
            return {
              ...item,
            };
          }
        });

        let newSession = {
          ...session,
          currentOrderItemFinish: session.totalOrderItem - session.totalCancelOrderItem,
          orderItems: [...newOrderItems],
        };
        return newSession;
      } else {
        return {
          ...session,
        };
      }
    });

    setKitchenSessions(newSessions);

    /// Update when click complete session
    kitchenDataService
      .updateOrderSessionStatusAsync({
        sessionId: session.sessionId,
        orderCode: session.orderCode,
      })
      .then((res) => {
        if (res) {
          initSessionData();
          message.success(
            pageData.completeOrder + session.sessionCode + " " + (session.sessionIndex ? session.sessionIndex : "")
          );
        }
      });

    /// Print stamp after complete order session
    printStamp(session?.orderId, null, printStampType.ALL_ORDER_ITEMS);
  };

  const renderToastMessage = (orderItem) => {
    setTimeout(() => {
      setIsShowToastMessage(false);
    }, 4000);

    return (
      <div className="toast-message">
        <div className="left-message-column">
          <KitchenCheckedIcon />
        </div>
        <div className="right-message-column">
          <p className="text-message mb-0">
            <span>{orderItem?.productName}</span>
            <span>{orderItem?.productPriceName ? " - " + orderItem.productPriceName : ""}</span>
            <span>{pageData.finish}</span>
          </p>
        </div>
      </div>
    );
  };

  const renderSession = () => {
    const sessions = kitchenSessions?.map((session, index) => {
      const { totalOrderItem, totalOrderItemCanceled, totalOrderItemCompleted } = session;
      const currentTotalOrderItem = totalOrderItem - totalOrderItemCanceled;
      return (
        <div className="session-card">
          <div className="session-content-wrapper">
            {/* Order type */}
            <div className="order-type-box display-inline">
              <div className="icon-box">
                <span className="icon">
                  {session.orderTypeId === OrderTypeStatus.InStore && <OrderTypeInStoreIcon />}
                  {session.orderTypeId === OrderTypeStatus.TakeAway && <OrderTypeTakeAwayIcon />}
                  {session.orderTypeId === OrderTypeStatus.Delivery && <OrderTypeDeliveryIcon />}
                </span>
                <span className="order-type-text ml-13">{session.orderTypeName}</span>
              </div>
              <div>
                <span className="order-type-text mr-16">
                  {session.sessionCode}
                  <span className="text-index ml-1">{session?.sessionIndex} </span>
                </span>
              </div>
            </div>

            {/* Toast message when complete order item */}
            {isShowToastMessage && currentSessionIndex === index && renderToastMessage(orderItemDetail)}

            {/* Order item list */}
            <div className="order-item-wrapper">
              <div className="order-item-container">{renderSessionOrderItems(session, session.orderItems, index)}</div>
            </div>

            {/* Information box */}
            <div className="info-wrapper">
              {session.orderTypeId === OrderTypeStatus.InStore && (
                <div className="display-inline info-box">
                  <div className="left-box">
                    <span className="icon-arrow">
                      <ArrowRightKitchenIcon />
                    </span>
                    <span className="info-text">{pageData.position}</span>
                  </div>
                  <div>
                    <span className="text-right font-weight-bold">
                      {session.areaName} - {session.tableName}
                    </span>
                  </div>
                </div>
              )}

              <div
                className={`display-inline info-box ${
                  session.orderTypeId === OrderTypeStatus.InStore ? "mt-10" : "mt-16"
                }`}
              >
                <div className="left-box">
                  <span className="icon-time">
                    <TimeFillSmallIcon />
                  </span>
                  <span className="info-text">{pageData.duration}</span>
                </div>
                <div>
                  <span className="text-right">
                    <SessionTimer startTime={session.createdTime} />
                  </span>
                </div>
              </div>
              <div className="display-inline info-box mt-10">
                <div className="left-box">
                  <span className="icon-bowl">
                    <BowlFoodIcon />
                  </span>
                  <span className="info-text">{pageData.item}</span>
                </div>
                <div>
                  <span className="text-right font-weight-bold">
                    {totalOrderItemCompleted}/{currentTotalOrderItem}
                  </span>
                </div>
              </div>
            </div>

            {/* Button complete */}
            <div className="btn-box">
              <button type="button" className="btn-completed" onClick={() => onClickFinish(session, index)}>
                <span className="icon-completed">
                  <TickCircleIcon />
                </span>
                <span className="text-completed">{pageData.completeAll}</span>
              </button>
            </div>
          </div>
        </div>
      );
    });

    return sessions;
  };

  const renderSessionOrderItems = (session, orderItems, sessionIndex) => {
    const canShowOption = orderItems?.options?.find((item) => !item.isSetDefault);
    const orderItem = orderItems?.map((item, itemIndex) => {
      return (
        <div
          className="order-item-box"
          onClick={
            item.statusId !== OrderItemStatus.Canceled && item.currentQuantity > 0
              ? () => onClickOrderItem(session, item, itemIndex, sessionIndex)
              : () => null
          }
        >
          <div className="left-column">
            <div>
              <p className="order-item-text mb-0">
                <span>{item.productName}</span>
                <span>{item.productPriceName ? " - " + item.productPriceName : ""}</span>
              </p>
            </div>

            {((item.orderItemOptions && item.orderItemOptions.length > 0 && canShowOption) ||
              (item.orderItemToppings && item.orderItemToppings.length > 0)) && <div className="border-div"></div>}

            <div className="option-topping-box">
              {item.orderItemOptions
                ?.filter((item) => !item.isSetDefault)
                .map((option) => {
                  return (
                    <div className="option-topping-detail display-inline">
                      <span className="text-detail">{option.optionName}</span>
                      <span className="text-detail ml-2"> {option.optionLevelName}</span>
                    </div>
                  );
                })}

              {item.orderItemToppings?.map((topping) => {
                return (
                  <div className="option-topping-detail display-inline">
                    <span className="text-detail">{topping.toppingName}</span>
                    <span className="text-detail ml-2">x{topping.quantity}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="right-column">
            {/* Canceled */}
            {item.statusId === OrderItemStatus.Canceled ? (
              <>
                <div className="badge-status status-canceled">
                  <span className="text-status">{pageData.cancel}</span>
                </div>
              </>
            ) : (
              <>
                {/* Completed */}
                {item.currentQuantity === 0 && (
                  <>
                    <div className="badge-status status-completed">
                      <span className="text-status">{pageData.completed}</span>
                    </div>
                  </>
                )}

                {/* Not complete */}
                {item.currentQuantity >= 1 && (
                  <>
                    <div className="badge-quantity">
                      <span className="text-quantity">
                        {item.defaultQuantity - item.currentQuantity + "/" + item.defaultQuantity}
                      </span>
                    </div>
                    <div className="icon-check-box">
                      <span>
                        <CircleOutlineIcon></CircleOutlineIcon>
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      );
    });

    return orderItem;
  };

  return (
    <>
      <div className="kitchen-container">
        {/* Sidebar left menu */}
        <div className="left-content-wrapper">
          <Link to={`/`} className="logo-container">
            <Image preview={false} src={foodBeverageLogo} width={"80%"} />
          </Link>
          <div className="expand-icon-container" onClick={() => setIsOpenMenu(!isOpenMenu)}>
            <ShowMoreIcon />
          </div>
        </div>

        {/* Session content */}
        <div className="right-content-wrapper">
          <div className="right-content-container">
            {/* Title box */}
            <div className="title-container">
              <h3 className="title mb-0">{pageData.title}</h3>
            </div>

            {/* Menu box */}
            <div className="menu-container">
              <div className="button-container">
                <Row gutter={[32, 32]}>
                  <Col span={12}>
                    <button type="button" className="menu-button menu-button-active">
                      <span>
                        <AlarmWhiteIcon />
                      </span>
                      <span className="menu-button-text">{pageData.order}</span>
                    </button>
                  </Col>
                  <Col span={12}>
                    <button type="button" className="menu-button">
                      <span>
                        <ReserveIcon />
                      </span>
                      <span className="menu-button-text">{pageData.dish}</span>
                    </button>
                  </Col>
                </Row>
              </div>
            </div>
            {/* Session box */}
            <div className="session-wrapper">
              {kitchenSessions && kitchenSessions.length > 0 ? (
                <div className="session-container">{renderSession()}</div>
              ) : (
                <>
                  <img src={images.kitchenNoOrderImg} alt="No Order"></img>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Left menu expand */}
      <LeftMenuComponent isOpenMenu={isOpenMenu} setIsOpenMenu={setIsOpenMenu} isOpenFromKitchen={true} />

      {/* Print stamp template */}
      <div className="d-none">
        <StampTemplateComponent ref={stampRef} />
      </div>
    </>
  );
}
