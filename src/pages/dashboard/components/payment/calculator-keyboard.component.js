import { Col, Form, Input, message, Row } from "antd";
import orderBroadcast from "broadcast-channels/order-broadcast-channel";
import { BroadcastActions } from "constants/broadcast-actions.constants";
import { CardTickIcon, TagCrossIcon } from "constants/icons.constants";
import { PaymentMethodConstants } from "constants/payment-method.constants";
import oderService from "data-services/order/order-data.service";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency, formatTextNumber } from "utils/helpers";
import "./payment-method.component.scss";

export default function CalculatorKeyboardComponent(props) {
  const tabKeyEnum = {
    cash: 1,
    vnPay: 2,
    moMo: 3,
  };
  const [t] = useTranslation();
  const { oder, onCompleted, callBack, tabKey } = props;
  const [receivedMoney, setReceivedMoney] = useState(0);
  const [form] = Form.useForm();

  const pageData = {
    btnClear: t("button.clear"),
    orderCode: t("order.code"),
    amount: t("order.amount"),
    paymentInformation: t("payment.paymentInformation"),
    receivedMoney: t("payment.receivedMoney"),
    payMoney: t("payment.payMoney"),
    changeMoney: t("payment.changeMoney"),
    paySuccess: t("payment.paySuccess"),
    btnPay: t("payment.btnPay"),
    cashAmountEnter: t("payment.cashAmountEnter"),
    cashAmountInvalid: t("payment.cashAmountInvalid"),
    orderNo: t("payment.orderNo"),
  };

  useEffect(() => {
    props.tableFuncs.current = onClear;
    eventListenerKeyDown();
  }, []);

  const eventListenerKeyDown = () => {
    document.addEventListener("keydown", (event) => {
      if (event.keyCode === 13 && tabKey === tabKeyEnum.cash) {
        document.getElementById("btn-pay-checkout").focus();
      } else {
        document.getElementById("checkout-order-input").focus();
      }
    });
  };

  const onClickButton = (number) => {
    eventListenerKeyDown();
    let formValue = form.getFieldsValue();
    let newValue = formValue?.amount ? formValue?.amount?.replaceAll(",", "").toString().concat(number) : number;
    let valueAsNumber = +newValue;
    let tempValueAsText = valueAsNumber.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
    let valueAsText = tempValueAsText.substring(0, tempValueAsText.length - 3);
    const setTextValue = {
      amount: valueAsText,
    };
    form.setFieldsValue(setTextValue);
    setReceivedMoney(valueAsNumber);
  };

  ///Backspace button
  const onRemoveText = () => {
    let formValue = form.getFieldsValue();
    var textInput = formValue?.amount?.replaceAll(",", "");
    let removeText = textInput?.substring(0, textInput.length - 1);
    let textValue = parseInt(removeText) ? parseInt(removeText) : "";
    const setTextValue = {
      amount: formatTextNumber(removeText),
    };
    form.setFieldsValue(setTextValue);
    setReceivedMoney(textValue);
  };

  ///Clear button
  const onClear = () => {
    const setTextValue = {
      amount: "",
    };
    form.setFieldsValue(setTextValue);
    setReceivedMoney(0);
  };

  const onChangeTextValue = (e) => {
    var textInput = e.target.value?.replaceAll(",", "");
    var textValue = parseInt(textInput) ? parseInt(textInput) : "";
    const setTextValue = {
      amount: formatTextNumber(textValue),
    };
    form.setFieldsValue(setTextValue);
    setReceivedMoney(textValue);
  };

  const onFinish = () => {
    let formValue = form.getFieldsValue();
    if (!formValue?.amount || !receivedMoney) {
      message.error(pageData.cashAmountEnter);
      return;
    }

    if (receivedMoney && receivedMoney - oder?.price < 0) {
      message.error(pageData.cashAmountInvalid);
      return;
    }

    let request = {
      orderId: oder?.id,
      paymentMethod: PaymentMethodConstants.Cash,
      receivedAmount: receivedMoney,
      change: receivedMoney - oder?.price,
    };

    /// Update order
    oderService.payOrderAsync(request).then((res) => {
      if (res) {
        message.success(pageData.paySuccess);
        onCompleted(oder?.id);
        if (callBack) {
          callBack();
        }
      }
    });

    orderBroadcast?.postMessage({
      action: BroadcastActions.ShowThanks,
      data: undefined,
    });
  };

  return (
    <div className="calculator-keyboard-container">
      <Form autoComplete="off" name="basic" className="w-100" form={form}>
        <Row gutter={[16, 16]}>
          <Col span={14}>
            <Form.Item
              name={"amount"}
              className="text-left w-100 mb-0"
              onChange={(value) => {
                onChangeTextValue(value);
              }}
            >
              <Input className="fnb-input checkout-order-input" id="checkout-order-input" />
            </Form.Item>
            <Row className="keyboard-box">
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <button className="abacus-button" onClick={() => onClickButton("1")}>
                      1
                    </button>
                  </Col>
                  <Col span={8}>
                    <button className="abacus-button" onClick={() => onClickButton("2")}>
                      2
                    </button>
                  </Col>
                  <Col span={8}>
                    <button className="abacus-button" onClick={() => onClickButton("3")}>
                      3
                    </button>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <button className="abacus-button" onClick={() => onClickButton("4")}>
                      4
                    </button>
                  </Col>
                  <Col span={8}>
                    <button className="abacus-button" onClick={() => onClickButton("5")}>
                      5
                    </button>
                  </Col>
                  <Col span={8}>
                    <button className="abacus-button" onClick={() => onClickButton("6")}>
                      6
                    </button>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <button className="abacus-button" onClick={() => onClickButton("7")}>
                      7
                    </button>
                  </Col>
                  <Col span={8}>
                    <button className="abacus-button" onClick={() => onClickButton("8")}>
                      8
                    </button>
                  </Col>
                  <Col span={8}>
                    <button className="abacus-button" onClick={() => onClickButton("9")}>
                      9
                    </button>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <button className="abacus-button" onClick={() => onClickButton("0")}>
                      0
                    </button>
                  </Col>
                  <Col span={8}>
                    <button className="abacus-button" onClick={() => onClickButton("00")}>
                      00
                    </button>
                  </Col>
                  <Col span={8}>
                    <button className="abacus-button" onClick={() => onClickButton("000")}>
                      000
                    </button>
                  </Col>
                </Row>
              </Col>
              <Col span={6}>
                <button className="abacus-button backspace-button" onClick={onRemoveText}>
                  <TagCrossIcon />
                </button>
                <button className="abacus-button clear-button" onClick={onClear}>
                  {pageData.btnClear}
                </button>
              </Col>
            </Row>
          </Col>
          <Col span={10}>
            <div className="order-code-box">
              <span className="text-left">{pageData.orderNo}</span>
              <span className="text-right"> #{oder?.code} </span>
            </div>
            <div className="order-description-box">
              <div className="pay-box">
                <span className="text-pay">{pageData.payMoney}</span>
                <span className="text-amount">{formatCurrency(oder?.price)}</span>
              </div>
              <div className="receive-money-box">
                <span className="text-receive">{pageData.receivedMoney}</span>
                <span className="text-amount">{formatCurrency(receivedMoney)}</span>
              </div>
              <div className="separation-line"></div>
              <div className="change-money-box">
                <span className="text-change">{pageData.changeMoney}</span>
                <span className="text-amount">{formatCurrency(receivedMoney - oder?.price)}</span>
              </div>
              <div className="btn-pay-box">
                <button className="btn-pay" id="btn-pay-checkout" onClick={() => onFinish()}>
                  <span className="icon-pay">
                    <CardTickIcon />
                  </span>
                  <span className="text-pay">{pageData.btnPay}</span>
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
