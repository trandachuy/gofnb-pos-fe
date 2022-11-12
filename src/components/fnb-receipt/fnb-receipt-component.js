import { OrderTypeStatus } from "constants/order-type-status.constants";
import { PaymentMethodConstants } from "constants/payment-method.constants";
import { DatetimeFormat } from "constants/string.constants";
import moment from "moment";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import { formatCurrencyWithSymbol } from "utils/helpers";
import "./fnb-receipt-component.scss";
const { forwardRef, useImperativeHandle } = React;

const billFrameSizeKey = {
  small: 0,
  medium: 1,
};

export const ReceiptTemplateComponent = forwardRef((props, ref) => {
  const [t] = useTranslation();
  const [templateSetting, setTemplateSetting] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const componentRef = useRef();

  const pageData = {
    paymentInvoice: t("invoice.paymentInvoice"),
    orderCode: t("invoice.orderCode"),
    orderTime: t("invoice.orderTime"),
    cashierName: t("invoice.cashierName"),
    customerName: t("invoice.customerName"),
    no: t("invoice.no"),
    product: t("invoice.product"),
    quantity: t("invoice.quantity"),
    price: t("invoice.price"),
    total: t("invoice.total"),
    tempTotal: t("invoice.tempTotal"),
    discount: t("invoice.discount"),
    feeAndTax: t("invoice.feeAndTax"),
    receivedAmount: t("invoice.receivedAmount"),
    change: t("invoice.change"),
    paymentMethod: t("invoice.paymentMethod"),
    wifi: t("invoice.wifi"),
    password: t("invoice.password"),
    cash: t("invoice.cash"),
    shippingFee: t("invoice.shippingFee"),
  };
  useImperativeHandle(ref, () => ({
    renderTemplate(billConfiguration, orderData) {
      renderTemplate(billConfiguration, orderData);
    },
    printTemplate() {
      printTemplate();
    },
  }));

  const printTemplate = useReactToPrint({
    content: () => componentRef.current,
    copyStyles: true,
  });

  const renderTemplate = (billConfiguration, orderData) => {
    setTemplateSetting(billConfiguration);
    setOrderData(orderData);
  };

  const sumPrice = (orderItems) => {
    const productPrice = orderItems?.totalPrice;
    const toppingPrice = orderItems?.orderItemToppings.reduce((accumulator, object) => {
      return accumulator + object.totalPrice;
    }, 0);

    return productPrice + toppingPrice;
  };

  const renderMediumTemplate = (templateSetting) => {
    return (
      <div ref={componentRef} className="medium-template" bordered={true}>
        <div className="template-header">
          <table>
            <tr>
              {templateSetting?.isShowLogo && (
                <td rowSpan={2}>
                  {/* Logo will be replaced by img tag in future */}
                  <div>
                    <img src={templateSetting.logoData} />
                  </div>
                </td>
              )}
              <th className="store-name">{orderData?.storeName}</th>
            </tr>
            {templateSetting?.isShowAddress && (
              <tr>
                <td className="branch-address">{orderData?.fullAddress}</td>
              </tr>
            )}
          </table>
        </div>

        <hr className="bill-line" />
        <div className="template-invoice">
          <table>
            <tr>
              <th className="invoice-title" colSpan={2}>
                {pageData.paymentInvoice}
              </th>
            </tr>
            <tr>
              <td
                style={{
                  textAlign: "left",
                  width: "50%",
                }}
              >
                {pageData.orderCode}
              </td>
              <td
                className="order-code"
                style={{
                  textAlign: "right",
                  width: "50%",
                }}
              >
                {`#${orderData?.orderCode}`}
              </td>
            </tr>
            {templateSetting?.isShowOrderTime && (
              <tr>
                <td
                  style={{
                    textAlign: "left",
                    width: "50%",
                  }}
                >
                  {pageData.orderTime}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    width: "50%",
                  }}
                >
                  {moment.utc(orderData?.orderTime).local().format(DatetimeFormat.HH_MM_DD_MM_YYYY)}
                </td>
              </tr>
            )}
            {templateSetting?.isShowCashierName && (
              <>
                {orderData?.cashierName && (
                  <tr>
                    <td
                      style={{
                        textAlign: "left",
                        width: "50%",
                      }}
                    >
                      {pageData.cashierName}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        width: "50%",
                      }}
                    >
                      {orderData?.cashierName}
                    </td>
                  </tr>
                )}
              </>
            )}
            {templateSetting?.isShowCustomerName && (
              <>
                {orderData?.customerName && (
                  <tr>
                    <td
                      style={{
                        textAlign: "left",
                        width: "50%",
                      }}
                    >
                      {pageData.customerName}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        width: "50%",
                      }}
                    >
                      {orderData?.customerName}
                    </td>
                  </tr>
                )}
              </>
            )}
          </table>
        </div>

        <table className="template-table-product">
          <tr className="tr-header-table">
            <th
              style={{
                width: "40%",
                textAlign: "left",
                paddingLeft: "9px",
              }}
            >
              {pageData.product}
            </th>
            <th
              style={{
                width: "25%",
                textAlign: "right",
                paddingRight: "5%",
              }}
            >
              {pageData.price}
            </th>
            <th
              style={{
                width: "10%",
                textAlign: "center",
              }}
            >
              {pageData.quantity}
            </th>
            <th
              style={{
                width: "25%",
                textAlign: "right",
                paddingRight: "9px",
              }}
            >
              {pageData.total}
            </th>
          </tr>
          <div style={{ height: "7px" }}></div>
          {orderData?.orderItems.map((item, index) => {
            return (
              <>
                {item?.isCombo ? (
                  <>
                    <tr>
                      <td
                        style={{
                          width: "40%",
                          textAlign: "left",
                          paddingLeft: "9px",
                        }}
                      >
                        {`${index + 1}.  ${item?.orderComboItem?.comboName}`}
                      </td>
                      <td
                        style={{
                          width: "25%",
                          textAlign: "right",
                          paddingRight: "5%",
                        }}
                      >
                        {formatCurrencyWithSymbol(item?.price)}
                      </td>
                      <td
                        style={{
                          width: "10%",
                          textAlign: "center",
                        }}
                      >
                        {item?.quantity}
                      </td>
                      <td
                        style={{
                          width: "25%",
                          textAlign: "right",
                          paddingRight: "9px",
                        }}
                      >
                        {formatCurrencyWithSymbol(sumPrice(item))}
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td
                        style={{
                          width: "40%",
                          textAlign: "left",
                          paddingLeft: "9px",
                        }}
                      >
                        {item?.priceName ? (
                          <>{`${index + 1}.  ${item?.productName} (${item?.priceName})`}</>
                        ) : (
                          <>{`${index + 1}.  ${item?.productName}`}</>
                        )}
                      </td>
                      <td
                        style={{
                          width: "25%",
                          textAlign: "right",
                          paddingRight: "5%",
                        }}
                      >
                        {formatCurrencyWithSymbol(item?.price)}
                      </td>
                      <td
                        style={{
                          width: "10%",
                          textAlign: "center",
                        }}
                      >
                        {item?.quantity}
                      </td>
                      <td
                        style={{
                          width: "25%",
                          textAlign: "right",
                          paddingRight: "9px",
                        }}
                      >
                        {formatCurrencyWithSymbol(sumPrice(item))}
                      </td>
                    </tr>
                    {(templateSetting?.isShowToping || templateSetting?.isShowOption) && (
                      <>
                        {templateSetting?.isShowToping && (
                          <>
                            {item?.orderItemToppings?.map((tItem, tIndex) => {
                              return (
                                <>
                                  {templateSetting?.isShowToping && (
                                    <tr>
                                      <td
                                        style={{
                                          width: "40%",
                                          textAlign: "left",
                                          paddingLeft: "20px",
                                        }}
                                      >
                                        {tItem?.toppingName}
                                      </td>
                                      <td
                                        style={{
                                          width: "25%",
                                          textAlign: "right",
                                          paddingRight: "5%",
                                        }}
                                      >
                                        {formatCurrencyWithSymbol(tItem?.price)}
                                      </td>
                                      <td
                                        style={{
                                          width: "10%",
                                          textAlign: "center",
                                        }}
                                      >
                                        {tItem?.quantity}
                                      </td>
                                      <td
                                        style={{
                                          width: "25%",
                                          textAlign: "right",
                                          paddingRight: "20px",
                                        }}
                                      ></td>
                                    </tr>
                                  )}
                                </>
                              );
                            })}
                          </>
                        )}
                        {templateSetting?.isShowOption && (
                          <>
                            {item?.orderItemOptions?.map((tItem, tIndex) => {
                              return (
                                <>
                                  {templateSetting?.isShowOption && (
                                    <tr>
                                      <td
                                        colSpan={4}
                                        style={{
                                          width: "30%",
                                          textAlign: "left",
                                          paddingLeft: "20px",
                                        }}
                                      >
                                        {`${tItem?.optionName} (${tItem?.optionValue})`}
                                      </td>
                                    </tr>
                                  )}
                                </>
                              );
                            })}
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            );
          })}
        </table>

        <div className="template-temporary">
          <hr className="bill-line" />
          <div style={{ height: "7px" }}></div>
          <table>
            <tr>
              <td
                style={{
                  width: "60%",
                  textAlign: "left",
                }}
              >
                {pageData.tempTotal}
              </td>
              <td
                style={{
                  width: "40%",
                  textAlign: "right",
                }}
              >
                {formatCurrencyWithSymbol(orderData?.totalPrice)}
              </td>
            </tr>
            {orderData?.discount > 0 && (
              <tr>
                <td
                  style={{
                    width: "60%",
                    textAlign: "left",
                  }}
                >
                  {pageData.discount}
                </td>
                <td
                  style={{
                    width: "40%",
                    textAlign: "right",
                  }}
                >
                  {formatCurrencyWithSymbol(orderData?.discount)}
                </td>
              </tr>
            )}

            {orderData?.feeAndTax > 0 && (
              <tr>
                <td
                  style={{
                    width: "60%",
                    textAlign: "left",
                  }}
                >
                  {pageData.feeAndTax}
                </td>
                <td
                  style={{
                    width: "40%",
                    textAlign: "right",
                  }}
                >
                  {formatCurrencyWithSymbol(orderData?.feeAndTax)}
                </td>
              </tr>
            )}

            {/* if order type is delivery => show shipping fee */}
            {orderData?.orderTypeId == OrderTypeStatus.Delivery && (
              <tr>
                <td
                  style={{
                    width: "60%",
                    textAlign: "left",
                  }}
                >
                  {pageData.shippingFee}
                </td>
                <td
                  style={{
                    width: "40%",
                    textAlign: "right",
                  }}
                >
                  {formatCurrencyWithSymbol(orderData?.deliveryFee)}
                </td>
              </tr>
            )}
          </table>
        </div>

        <table className="template-final-price">
          <tr className="tr-header-table">
            <th
              style={{
                width: "50%",
                textAlign: "left",
                paddingLeft: "9px",
              }}
            >
              {pageData.total}
            </th>
            <th
              style={{
                width: "50%",
                textAlign: "right",
                paddingRight: "9px",
              }}
            >
              {formatCurrencyWithSymbol(orderData?.finalPrice)}
            </th>
          </tr>

          {orderData?.paymentMethodId !== undefined && orderData?.paymentMethodId === PaymentMethodConstants.Cash && (
            <>
              <div style={{ height: "7px" }}></div>
              <tr>
                <td
                  style={{
                    width: "60%",
                    textAlign: "left",
                    paddingLeft: "9px",
                  }}
                >
                  {pageData.receivedAmount}
                </td>
                <td
                  style={{
                    width: "40%",
                    textAlign: "right",
                    paddingRight: "9px",
                  }}
                >
                  {formatCurrencyWithSymbol(orderData?.receivedAmount)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    width: "60%",
                    textAlign: "left",
                    paddingLeft: "9px",
                  }}
                >
                  {pageData.change}
                </td>
                <td
                  style={{
                    width: "40%",
                    textAlign: "right",
                    paddingRight: "9px",
                  }}
                >
                  {formatCurrencyWithSymbol(orderData?.change)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    width: "60%",
                    textAlign: "left",
                    paddingLeft: "9px",
                  }}
                >
                  {pageData.paymentMethod}
                </td>
                <td
                  style={{
                    width: "40%",
                    textAlign: "right",
                    paddingRight: "9px",
                  }}
                >
                  {pageData.cash}
                </td>
              </tr>
            </>
          )}
        </table>

        <div className="template-footer">
          <table style={{ width: "100%" }}>
            {templateSetting?.isShowThanksMessage && (
              <>
                <tr>
                  <th className="thanks-message" colSpan={2}>
                    {templateSetting?.thanksMessageData}
                  </th>
                </tr>
                <div style={{ height: "7px" }}></div>
              </>
            )}
            {templateSetting?.isShowWifiAndPassword && (
              <>
                <tr>
                  <td
                    style={{
                      width: "100%",
                      textAlign: "center",
                    }}
                    colSpan={2}
                  >
                    {pageData.wifi}: {templateSetting?.wifiData}
                  </td>
                </tr>
                {templateSetting?.passwordData && (
                  <tr>
                    <td
                      style={{
                        width: "100%",
                        textAlign: "center",
                      }}
                      colSpan={2}
                    >
                      {pageData.password}: {templateSetting?.passwordData}
                    </td>
                  </tr>
                )}
              </>
            )}
            {templateSetting?.isShowQRCode && (
              <>
                <tr>
                  <td colSpan={2} align={"center"}>
                    <img src={templateSetting?.qrCodeThumbnail} />
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    {templateSetting?.qrCodeData}
                  </td>
                </tr>
              </>
            )}
          </table>
        </div>
      </div>
    );
  };

  const renderSmallTemplate = (templateSetting) => {
    return (
      <div ref={componentRef} className="small-template" bordered={true}>
        <div className="template-header">
          <table>
            <tr>
              {templateSetting?.isShowLogo && (
                <td rowSpan={2}>
                  {/* Logo will be replaced by img tag in future */}
                  <div>
                    <img src={templateSetting.logoData} />
                  </div>
                </td>
              )}
              <th
                className="store-name"
                style={{
                  textAlign: "center",
                }}
              >
                {orderData?.storeName}
              </th>
            </tr>

            {templateSetting?.isShowAddress && (
              <tr>
                <td>
                  <div
                    className="branch-address"
                    style={{
                      textAlign: "center",
                    }}
                  >
                    {orderData?.fullAddress}
                  </div>
                </td>
              </tr>
            )}
          </table>
        </div>

        <hr className="bill-line" />
        <div className="template-invoice">
          <table>
            <tr>
              <th
                style={{
                  textAlign: "center",
                }}
                colSpan={2}
              >
                {pageData.paymentInvoice}
              </th>
            </tr>
            <div style={{ height: "7px" }}></div>
            <tr>
              <td
                style={{
                  textAlign: "left",
                }}
              >
                {pageData.orderCode}
              </td>
              <td
                style={{
                  textAlign: "right",
                }}
              >
                {`#${orderData?.orderCode}`}
              </td>
            </tr>
            {templateSetting?.isShowOrderTime && (
              <tr>
                <td
                  style={{
                    textAlign: "left",
                    width: "30%",
                  }}
                >
                  {pageData.orderTime}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    width: "70%",
                  }}
                >
                  {moment.utc(orderData?.orderTime).local().format(DatetimeFormat.HH_MM_DD_MM_YYYY)}
                </td>
              </tr>
            )}
            {templateSetting?.isShowCashierName && (
              <>
                {orderData?.cashierName && (
                  <tr>
                    <td
                      style={{
                        textAlign: "left",
                      }}
                    >
                      {pageData.cashierName}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                      }}
                    >
                      {orderData?.cashierName}
                    </td>
                  </tr>
                )}
              </>
            )}
            {templateSetting?.isShowCustomerName && (
              <>
                {orderData?.customerName && (
                  <tr>
                    <td
                      style={{
                        textAlign: "left",
                      }}
                    >
                      {pageData.customerName}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                      }}
                    >
                      {orderData?.customerName}
                    </td>
                  </tr>
                )}
              </>
            )}
          </table>
        </div>

        <table className="template-table-product">
          <tr className="tr-header-table">
            <th
              style={{
                width: "60%",
                textAlign: "left",
                paddingLeft: "5px",
              }}
            >
              {pageData.product}
            </th>
            <th
              style={{
                width: "10%",
                textAlign: "center",
              }}
            >
              {pageData.quantity}
            </th>
            <th
              style={{
                width: "30%",
                textAlign: "right",
                paddingRight: "5px",
              }}
            >
              {pageData.total}
            </th>
          </tr>
          <div style={{ height: "7px" }}></div>
          {orderData?.orderItems.map((item, index) => {
            return (
              <>
                {item?.isCombo ? (
                  <>
                    <tr>
                      <td
                        style={{
                          width: "60%",
                          textAlign: "left",
                          paddingLeft: "5px",
                        }}
                      >
                        {`${index + 1}.  ${item?.orderComboItem?.comboName}`}
                      </td>
                      <td
                        style={{
                          width: "10%",
                          textAlign: "center",
                        }}
                      >
                        {item?.quantity}
                      </td>
                      <td
                        style={{
                          width: "30%",
                          textAlign: "right",
                          paddingRight: "5px",
                        }}
                      >
                        {formatCurrencyWithSymbol(sumPrice(item))}
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td
                        colSpan={3}
                        style={{
                          width: "60%",
                          textAlign: "left",
                          paddingLeft: "5px",
                        }}
                      >
                        {item?.priceName ? (
                          <>{`${index + 1}.  ${item?.productName} (${item?.priceName})`}</>
                        ) : (
                          <>{`${index + 1}.  ${item?.productName}`}</>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          width: "60%",
                          textAlign: "left",
                          paddingLeft: "16px",
                        }}
                      >
                        {formatCurrencyWithSymbol(item?.price)}
                      </td>
                      <td
                        style={{
                          width: "10%",
                          textAlign: "center",
                        }}
                      >
                        {item?.quantity}
                      </td>
                      <td
                        style={{
                          width: "30%",
                          textAlign: "right",
                          paddingRight: "5px",
                        }}
                      >
                        {formatCurrencyWithSymbol(sumPrice(item))}
                      </td>
                    </tr>
                    {(templateSetting?.isShowToping || templateSetting?.isShowOption) && (
                      <>
                        <div style={{ height: "7px" }}></div>
                        {templateSetting?.isShowToping && (
                          <>
                            {item?.orderItemToppings?.map((tItem, tIndex) => {
                              return (
                                <>
                                  {templateSetting?.isShowToping && (
                                    <tr className="tr-topping-option">
                                      <td
                                        style={{
                                          width: "60%",
                                          textAlign: "left",
                                          paddingLeft: "16px",
                                        }}
                                      >
                                        {tItem?.toppingName}
                                      </td>
                                      <td
                                        style={{
                                          width: "10%",
                                          textAlign: "center",
                                        }}
                                      >
                                        {tItem?.quantity}
                                      </td>
                                      <td
                                        style={{
                                          width: "30%",
                                          textAlign: "right",
                                          paddingRight: "5px",
                                        }}
                                      >
                                        {formatCurrencyWithSymbol(tItem?.price)}
                                      </td>
                                    </tr>
                                  )}
                                </>
                              );
                            })}
                          </>
                        )}
                        {templateSetting?.isShowOption && (
                          <>
                            {item?.orderItemOptions?.map((tItem, tIndex) => {
                              return (
                                <>
                                  {templateSetting?.isShowOption && (
                                    <tr className="tr-topping-option">
                                      <td
                                        colSpan={3}
                                        style={{
                                          width: "60%",
                                          textAlign: "left",
                                          paddingLeft: "16px",
                                        }}
                                      >
                                        {`${tItem?.optionName} (${tItem?.optionValue})`}
                                      </td>
                                    </tr>
                                  )}
                                </>
                              );
                            })}
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            );
          })}
        </table>

        <div className="template-temporary">
          <hr className="bill-line" />
          <div style={{ height: "12px" }}></div>
          <table>
            <tr>
              <td
                style={{
                  width: "70%",
                  textAlign: "left",
                }}
              >
                {pageData.tempTotal}
              </td>
              <td
                style={{
                  width: "30%",
                  textAlign: "right",
                }}
              >
                {formatCurrencyWithSymbol(orderData?.totalPrice)}
              </td>
            </tr>
            {orderData?.discount > 0 && (
              <tr>
                <td
                  style={{
                    width: "60%",
                    textAlign: "left",
                  }}
                >
                  {pageData.discount}
                </td>
                <td
                  style={{
                    width: "40%",
                    textAlign: "right",
                  }}
                >
                  {formatCurrencyWithSymbol(orderData?.discount)}
                </td>
              </tr>
            )}
            {orderData?.feeAndTax > 0 && (
              <tr>
                <td
                  style={{
                    width: "60%",
                    textAlign: "left",
                  }}
                >
                  {pageData.feeAndTax}
                </td>
                <td
                  style={{
                    width: "40%",
                    textAlign: "right",
                  }}
                >
                  {formatCurrencyWithSymbol(orderData?.feeAndTax)}
                </td>
              </tr>
            )}

            {/* if order type is delivery => show shipping fee */}
            {orderData?.orderTypeId == OrderTypeStatus.Delivery && (
              <tr>
                <td
                  style={{
                    width: "60%",
                    textAlign: "left",
                  }}
                >
                  {pageData.shippingFee}
                </td>
                <td
                  style={{
                    width: "40%",
                    textAlign: "right",
                  }}
                >
                  {formatCurrencyWithSymbol(orderData?.deliveryFee)}
                </td>
              </tr>
            )}
          </table>
        </div>

        <div style={{ height: "7px" }}></div>
        <table className="template-final-price">
          <tr
            style={{
              height: "24px",
              background: "#B3B3B3",
            }}
          >
            <th
              style={{
                width: "50%",
                textAlign: "left",
                paddingLeft: "5px",
              }}
            >
              {pageData.total}
            </th>
            <th
              style={{
                width: "50%",
                textAlign: "right",
                paddingRight: "5px",
              }}
            >
              {formatCurrencyWithSymbol(orderData?.finalPrice)}
            </th>
          </tr>

          {orderData?.paymentMethodId !== undefined && orderData?.paymentMethodId === PaymentMethodConstants.Cash && (
            <>
              <div style={{ height: "12px" }}></div>
              <tr>
                <td
                  style={{
                    width: "60%",
                    textAlign: "left",
                    paddingLeft: "5px",
                  }}
                >
                  {pageData.receivedAmount}
                </td>
                <td
                  style={{
                    width: "40%",
                    textAlign: "right",
                    paddingRight: "5px",
                  }}
                >
                  {formatCurrencyWithSymbol(orderData?.receivedAmount)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    width: "60%",
                    textAlign: "left",
                    paddingLeft: "5px",
                  }}
                >
                  {pageData.change}
                </td>
                <td
                  style={{
                    width: "40%",
                    textAlign: "right",
                    paddingRight: "5px",
                  }}
                >
                  {formatCurrencyWithSymbol(orderData?.change)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    width: "60%",
                    textAlign: "left",
                    paddingLeft: "5px",
                  }}
                >
                  {pageData.paymentMethod}
                </td>
                <td
                  style={{
                    width: "40%",
                    textAlign: "right",
                    paddingRight: "5px",
                  }}
                >
                  {pageData.cash}
                </td>
              </tr>
            </>
          )}
        </table>

        <div style={{ height: "7px" }}></div>
        <div className="template-footer">
          <table>
            {templateSetting?.isShowThanksMessage && (
              <>
                <tr>
                  <th className="thanks-message" colSpan={2}>
                    {templateSetting?.thanksMessageData}
                  </th>
                </tr>
                <div style={{ height: "7px" }}></div>
              </>
            )}

            {templateSetting?.isShowWifiAndPassword && (
              <>
                <tr>
                  <td
                    style={{
                      width: "100%",
                      textAlign: "center",
                    }}
                    colSpan={2}
                  >
                    {pageData.wifi}: {templateSetting?.wifiData}
                  </td>
                </tr>
                {templateSetting?.passwordData && (
                  <tr>
                    <td
                      style={{
                        width: "100%",
                        textAlign: "center",
                      }}
                      colSpan={2}
                    >
                      {pageData.password}: {templateSetting?.passwordData}
                    </td>
                  </tr>
                )}
                <div style={{ height: "7px" }}></div>
              </>
            )}

            {templateSetting?.isShowQRCode && (
              <>
                <tr>
                  <td colSpan={2} align={"center"}>
                    <img src={templateSetting?.qrCodeThumbnail} />
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    {templateSetting?.qrCodeData}
                  </td>
                </tr>
              </>
            )}
          </table>
        </div>
      </div>
    );
  };

  const renderBillTemplate = () => {
    let template = <></>;
    if (!templateSetting) return template;

    const { billFrameSize } = templateSetting;
    switch (billFrameSize) {
      case billFrameSizeKey.small:
        template = renderSmallTemplate(templateSetting);
        break;
      case billFrameSizeKey.medium:
      default:
        template = renderMediumTemplate(templateSetting);
        break;
    }
    return template;
  };

  return <>{renderBillTemplate()}</>;
});
