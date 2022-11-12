import { Col, Modal, Radio, Row } from "antd";
import { Content } from "antd/lib/layout/layout";
import { OrderStatus } from "constants/order-status.constants";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ListOrderDialogComponent } from "../list-order-dialog.component";
import "./pos-order-management.component.scss";
import orderDataService from "data-services/order/order-data.service";
import { OrderTypeStatus } from "constants/order-type-status.constants";
import { MaxTotalOrderToConfirmMessage } from "constants/order-platform.constants";
/**
 * POS Order management dialog
 * @param {*} props
 * @returns
 */
export default function PosOrderManagement(props) {
  const [t] = useTranslation();
  const { isModalVisible, handleCancel, onEditOrder, numberCartItems, saveDraftOrder } = props;
  const [totalToConfirmOrder, setTotalToConfirmOrder] = useState(0);

  const pageData = {
    toConfirm: t("posOrder.toConfirm"),
    serving: t("posOrder.serving"),
    completed: t("posOrder.completed"),
    cancelled: t("posOrder.cancelled"),
    draft: t("posOrder.draft"),
    posOrder: t("posOrder.posOrder"),
    pay: t("posOrder.pay"),
  };

  let screens = {
    serving: {
      key: 1,
      component: (
        <ListOrderDialogComponent
          orderStatus={OrderStatus.New}
          onEditOrder={onEditOrder}
          numberCartItems={numberCartItems}
          saveDraftOrder={saveDraftOrder}
          onloadTotalOrderConfirm={() => getTotalOrderToConfirm()}
        />
      ),
    },
    completed: {
      key: 2,
      component: (
        <ListOrderDialogComponent
          orderStatus={OrderStatus.Completed}
          onEditOrder={onEditOrder}
          numberCartItems={numberCartItems}
          saveDraftOrder={saveDraftOrder}
          onloadTotalOrderConfirm={() => getTotalOrderToConfirm()}
        />
      ),
    },
    cancelled: {
      key: 3,
      component: (
        <ListOrderDialogComponent
          orderStatus={OrderStatus.Canceled}
          onEditOrder={onEditOrder}
          numberCartItems={numberCartItems}
          saveDraftOrder={saveDraftOrder}
          onloadTotalOrderConfirm={() => getTotalOrderToConfirm()}
        />
      ),
    },
    draft: {
      key: 4,
      component: (
        <ListOrderDialogComponent
          orderStatus={OrderStatus.Draft}
          onEditOrder={onEditOrder}
          numberCartItems={numberCartItems}
          saveDraftOrder={saveDraftOrder}
          onloadTotalOrderConfirm={() => getTotalOrderToConfirm()}
        />
      ),
    },
    toConfirm: {
      key: 5,
      component: (
        <ListOrderDialogComponent
          orderStatus={OrderStatus.ToConfirm}
          onEditOrder={onEditOrder}
          numberCartItems={numberCartItems}
          saveDraftOrder={saveDraftOrder}
          onloadTotalOrderConfirm={() => getTotalOrderToConfirm()}
        />
      ),
    }
  };
  const [activeScreen, setActiveScreen] = useState(screens.serving.key);

  useEffect(() => {
    getTotalOrderToConfirm();
  }, [])

  const renderScreenContent = () => {
    switch (activeScreen) {
      case screens.completed.key:
        return screens.completed.component;
      case screens.cancelled.key:
        return screens.cancelled.component;
      case screens.draft.key:
        return screens.draft.component;
      case screens.toConfirm.key:
          return screens.toConfirm.component;
      case screens.serving.key:
      default:
        return screens.serving.component;
    }
  };

  const changeTab = (screen) => {
    setActiveScreen(screen);
    getTotalOrderToConfirm();
  }

  const getTotalOrderToConfirm = async () => {
    let orderParam = {
      orderStatus: OrderStatus.ToConfirm,
      keySearch: '',
      orderType: [],
      platform: [],
      serviceType: [OrderTypeStatus.Online],
    };

    orderDataService.getAllPosOrderByBranchAsync(orderParam).then((res) => {
      if (res?.posOrders) {
        setTotalToConfirmOrder(res?.posOrders?.length);
      }
    });
  }

  return (
    isModalVisible && (
      <Modal
        className="pos-order-modal"
        width={1261}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={(null, null)}
      >
        <Row className="pos-order-header">
          <Col span={7}></Col>
          <Col span={10}>
            <h3>{pageData.posOrder}</h3>
          </Col>
          <Col span={7}></Col>
        </Row>
        <Row className="pos-order-menu">
          <Col span={24}>
            <Content style={{ overflow: "initial" }}>
              <Radio.Group value={activeScreen} onChange={(e) => changeTab(e.target.value)}>
              <Radio.Button value={screens.toConfirm.key} className="tabToConfirm">
                  <span className="item-text">{pageData.toConfirm}</span>
                </Radio.Button>
                {totalToConfirmOrder > 0 &&
                  <div className="totalOrderConfirm">
                    <div className="totalOrderConfirmBlock">
                      {totalToConfirmOrder > MaxTotalOrderToConfirmMessage ? `${MaxTotalOrderToConfirmMessage}+` : totalToConfirmOrder}
                    </div>
                  </div>
                }
                <Radio.Button value={screens.serving.key} className="tabServing">
                  <span className="item-text">{pageData.serving}</span>
                </Radio.Button>
                <Radio.Button value={screens.completed.key}>
                  <span className="item-text">{pageData.completed}</span>
                </Radio.Button>
                <Radio.Button value={screens.cancelled.key}>
                  <span className="item-text">{pageData.cancelled}</span>
                </Radio.Button>
                <Radio.Button value={screens.draft.key} className="tabDraft">
                  <span className="item-text">{pageData.draft}</span>
                </Radio.Button>
              </Radio.Group>
            </Content>
          </Col>
        </Row>
        <Row className="text-center">
          <Col span={24}>
            <div>{renderScreenContent()}</div>
          </Col>
        </Row>
      </Modal>
    )
  );
}
