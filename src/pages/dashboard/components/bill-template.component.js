import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { formatCurrencyWithoutSymbol } from "utils/helpers";
import { useTranslation } from "react-i18next";

const { forwardRef, useImperativeHandle } = React;

const billFrameSizeKey = {
  small: 0,
  medium: 1,
};
export const BillTemplate = forwardRef((props, ref) => {
  const { className, orderData } = props;
  const [t] = useTranslation();
  const [templateSetting, setTemplateSetting] = useState(null);
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
  };
  useImperativeHandle(ref, () => ({
    renderTemplate(billConfiguration) {
      renderTemplate(billConfiguration);
    },
    printTemplate() {
      printTemplate();
    },
  }));

  const printTemplate = useReactToPrint({
    content: () => componentRef.current,
    copyStyles: true,
  });

  const mediumFrameStyle = {
    logo: {
      width: "50px",
      height: "50px",
      border: "solid 1px black",
    },
    card: {
      width: "302.3px",
      border: "0.5px solid",
      padding: "5px",
      background: "white",
      fontSize: "14px",
      color: "black",
    },
    table_fullWidth: {
      width: "100%",
    },
    hr: {
      border: "dashed 1px black",
    },
    row: {
      display: "flex",
    },
    title: {
      textAlign: "center",
      width: "200px",
    },
    th_border: {
      borderBottom: "1px solid",
    },
    th_left: {
      textAlign: "left",
    },
    th_right: {
      textAlign: "right",
    },
    td_left: {
      textAlign: "left",
    },
    td_right: {
      textAlign: "right",
    },
    td_center: {
      textAlign: "center",
    },
    td_productWidth: {
      width: "110px",
    },
  };

  const smallFrameStyle = {
    logo: {
      width: "50px",
      height: "50px",
      border: "solid 1px black",
    },
    card: {
      width: "215.4px",
      border: "0.5px solid",
      padding: "5px",
      background: "white",
      fontSize: "14px",
      color: "black",
    },
    table_fullWidth: {
      width: "100%",
    },
    hr: {
      border: "dashed 1px black",
    },
    row: {
      display: "flex",
    },
    title: {
      textAlign: "center",
      width: "100%",
    },
    th_border: {
      borderBottom: "1px solid",
    },
    th_right: {
      textAlign: "right",
      width: "100px",
    },
    th_left: {
      width: "125px",
      textAlign: "left",
    },
    td_left: {
      textAlign: "left",
    },
    td_right: {
      textAlign: "right",
    },
    td_center: {
      textAlign: "center",
      width: "200px",
    },
    td_data_right: {
      textAlign: "right",
      width: "89px",
    },
    li: {
      width: "130px",
    },
  };

  const renderTemplate = (billConfiguration) => {
    if (billConfiguration) {
      setTemplateSetting(billConfiguration);
    }
  };

  const renderMediumTemplate = (templateSetting) => {
    return (
      <>
        <div ref={componentRef} className={className} style={mediumFrameStyle.card} bordered={true}>
          <table style={mediumFrameStyle.table_fullWidth}>
            <tr>
              {templateSetting?.isShowLogo && (
                <td rowSpan={2}>
                  {/* Logo will be replaced by img tag in future */}
                  <div style={mediumFrameStyle.logo}>Logo</div>
                </td>
              )}
              <th style={smallFrameStyle.title}>{orderData?.storeName}</th>
            </tr>
            {templateSetting?.isShowAddress && (
              <tr>
                <td style={mediumFrameStyle.title}>{orderData?.branchAddress}</td>
              </tr>
            )}
          </table>
          <hr />
          <table style={mediumFrameStyle.table_fullWidth}>
            <tr>
              <th colSpan={2}>{pageData.paymentInvoice}</th>
            </tr>
            <tr>
              <td style={mediumFrameStyle.td_left}>
                {pageData.orderCode}: {orderData?.orderCode}
              </td>
              {templateSetting?.isShowOrderTime && (
                <td style={mediumFrameStyle.td_left}>
                  {pageData.orderTime}: {orderData?.orderTime}
                </td>
              )}
            </tr>

            {templateSetting?.isShowCashierName && (
              <tr>
                <td colSpan={2} style={mediumFrameStyle.td_left}>
                  {pageData.cashierName}: {orderData?.cashierName}
                </td>
              </tr>
            )}
            {templateSetting?.isShowCustomerName && (
              <tr>
                <td colSpan={2} style={mediumFrameStyle.td_left}>
                  {pageData.customerName}: {orderData?.customerName}
                </td>
              </tr>
            )}
          </table>
          <hr />
          <table style={mediumFrameStyle.table_fullWidth}>
            <tr style={mediumFrameStyle.th_border}>
              <td>No</td>
              <td style={mediumFrameStyle.td_productWidth}>{pageData.product}</td>
              <td style={mediumFrameStyle.td_right}>{pageData.quantity}</td>
              <td style={mediumFrameStyle.td_right}>{pageData.price}</td>
              <td style={mediumFrameStyle.td_right}>{pageData.total}</td>
            </tr>
            {orderData?.productList.map((item, index) => {
              return (
                <>
                  <tr>
                    <td>{index + 1}</td>
                    <td>{item?.productName}</td>
                    <td style={mediumFrameStyle.td_right}>{item?.quantity}</td>
                    <td style={mediumFrameStyle.td_right}>
                      {formatCurrencyWithoutSymbol(item?.price)}
                    </td>
                    <td style={mediumFrameStyle.td_right}>
                      {formatCurrencyWithoutSymbol(item?.totalPrice)}
                    </td>
                  </tr>
                  {(templateSetting?.isShowToping || templateSetting?.isShowOption) && (
                    <>
                      {templateSetting?.isShowToping &&
                        item?.toppings.map((tItem, tIndex) => {
                          return (
                            <tr>
                              <td></td>
                              <td>&#8226; {tItem?.toppingName}</td>
                              <td style={mediumFrameStyle.td_right}>{tItem?.quantity}</td>
                              <td style={mediumFrameStyle.td_right}>
                                {formatCurrencyWithoutSymbol(tItem?.price)}
                              </td>
                              <td></td>
                            </tr>
                          );
                        })}
                      {templateSetting?.isShowOption &&
                        item?.options.map((tItem, tIndex) => {
                          return (
                            <tr>
                              <td></td>
                              <td>&#8226; {`${tItem?.optionName}`}</td>
                              <td></td>
                              <td></td>
                              <td></td>
                            </tr>
                          );
                        })}
                    </>
                  )}
                </>
              );
            })}
          </table>
          <hr style={mediumFrameStyle.hr} />
          <table style={mediumFrameStyle.table_fullWidth}>
            <tr>
              <th style={mediumFrameStyle.th_left}>{pageData.tempTotal}</th>
              <th style={mediumFrameStyle.th_right}>
                {formatCurrencyWithoutSymbol(orderData?.originalTotalPrice)}
              </th>
            </tr>
            <tr>
              <td style={mediumFrameStyle.td_left}>{pageData.discount}</td>
              <td style={mediumFrameStyle.td_right}>
                {formatCurrencyWithoutSymbol(orderData?.discount)}
              </td>
            </tr>
            <tr>
              <td style={mediumFrameStyle.td_left}>{pageData.feeAndTax}</td>
              <td style={mediumFrameStyle.td_right}>
                {formatCurrencyWithoutSymbol(orderData?.feeAndTax)}
              </td>
            </tr>
          </table>
          <hr />
          <table style={mediumFrameStyle.table_fullWidth}>
            <tr>
              <th style={mediumFrameStyle.th_left}>{pageData.total}</th>
              <th style={mediumFrameStyle.th_right}>
                {formatCurrencyWithoutSymbol(orderData?.totalAmount)}
              </th>
            </tr>
            <tr>
              <td style={mediumFrameStyle.td_left}>{pageData.receivedAmount}</td>
              <td style={mediumFrameStyle.td_right}>
                {formatCurrencyWithoutSymbol(orderData?.receivedAmount)}
              </td>
            </tr>
            <tr>
              <td style={mediumFrameStyle.td_left}>{pageData.change}</td>
              <td style={mediumFrameStyle.td_right}>
                {formatCurrencyWithoutSymbol(orderData?.change)}
              </td>
            </tr>
            <tr>
              <td style={mediumFrameStyle.td_left}>{pageData.paymentMethod}</td>
              <td style={mediumFrameStyle.td_right}>
                {formatCurrencyWithoutSymbol(orderData?.paymentMethod)}
              </td>
            </tr>
          </table>
          <hr />
          <table style={mediumFrameStyle.table_fullWidth}>
            {templateSetting?.isShowThanksMessage && (
              <tr>
                <th style={mediumFrameStyle.td_center} colSpan={2}>
                  {templateSetting?.thanksMessageData}
                </th>
              </tr>
            )}
            {templateSetting?.isShowWifi && (
              <tr>
                <td style={mediumFrameStyle.td_center} colSpan={2}>
                  {pageData.wifi}: {templateSetting?.wifiData}
                </td>
              </tr>
            )}
            {templateSetting?.isShowPassword && (
              <tr>
                <td style={mediumFrameStyle.td_center} colSpan={2}>
                  {pageData.password}: {templateSetting?.passwordData}
                </td>
              </tr>
            )}
          </table>
        </div>
      </>
    );
  };

  const renderSmallTemplate = (templateSetting) => {
    return (
      <>
        <div ref={componentRef} className={className} style={smallFrameStyle.card} bordered={true}>
          <table style={smallFrameStyle.table_fullWidth}>
            <tr>
              {templateSetting?.isShowLogo && (
                <td rowSpan={2}>
                  {/* Logo will be replaced by img tag in future */}
                  <div style={smallFrameStyle.logo}>Logo</div>
                </td>
              )}
              <th style={smallFrameStyle.title}>{orderData?.storeName}</th>
            </tr>

            {templateSetting?.isShowAddress && (
              <tr>
                <td>
                  <div style={smallFrameStyle.title}>{orderData?.branchAddress}</div>
                </td>
              </tr>
            )}
          </table>
          <hr />
          <table style={smallFrameStyle.table_fullWidth}>
            <tr>
              <th colSpan={2}>{pageData.paymentInvoice}</th>
            </tr>
            <tr>
              <td>{pageData.orderCode}</td>
              <td style={smallFrameStyle.td_right}>{orderData?.orderCode}</td>
            </tr>
            {templateSetting?.isShowOrderTime && (
              <tr>
                <td>{pageData.orderTime}</td>
                <td style={smallFrameStyle.td_right}>{orderData?.orderTime}</td>
              </tr>
            )}
            {templateSetting?.isShowCashierName && (
              <tr>
                <td>{pageData.cashierName}</td>
                <td style={smallFrameStyle.td_right}>{orderData?.cashierName}</td>
              </tr>
            )}
            {templateSetting?.isShowCustomerName && (
              <tr>
                <td>{pageData.customerName}</td>
                <td style={smallFrameStyle.td_right}>{orderData?.customerName}</td>
              </tr>
            )}
          </table>
          <hr />
          <table style={smallFrameStyle.table_fullWidth}>
            <tr style={smallFrameStyle.th_border}>
              <th style={smallFrameStyle.th_left}>{pageData.product}</th>
              <th style={smallFrameStyle.th_right}>{pageData?.total}</th>
            </tr>
            {orderData?.productList.map((item, index) => {
              return (
                <>
                  <tr>
                    <td>{item?.productName}</td>
                    <td style={smallFrameStyle.td_right} rowSpan="2">
                      {formatCurrencyWithoutSymbol(item?.totalPrice)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={smallFrameStyle.td_data_left}
                    >{`(${item?.quantity}x${item?.price})`}</td>
                    <td></td>
                  </tr>
                  {(templateSetting?.isShowToping || templateSetting?.isShowOption) && (
                    <tr>
                      <td colSpan="2">
                        {item?.toppings?.map((tItem, tIndex) => {
                          return (
                            <ul>
                              {templateSetting?.isShowToping && (
                                <li
                                  style={smallFrameStyle.li}
                                >{`${tItem?.toppingName} (${tItem?.quantity}x${tItem?.price})`}</li>
                              )}
                            </ul>
                          );
                        })}
                        {item?.options?.map((tItem, tIndex) => {
                          return (
                            <ul>
                              {templateSetting?.isShowOption && (
                                <li style={smallFrameStyle.li}>{tItem?.optionName}</li>
                              )}
                            </ul>
                          );
                        })}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </table>
          <hr style={smallFrameStyle.hr} />
          <table>
            <tr>
              <td style={smallFrameStyle.th_left}>
                <strong>{pageData.tempTotal}</strong>
              </td>
              <td style={smallFrameStyle.td_data_right}>
                <strong>{formatCurrencyWithoutSymbol(orderData?.originalTotalPrice)}</strong>
              </td>
            </tr>
            <tr>
              <td style={smallFrameStyle.th_left}>{pageData.discount}</td>
              <td style={smallFrameStyle.td_data_right}>
                {formatCurrencyWithoutSymbol(orderData?.discount)}
              </td>
            </tr>
            <tr>
              <td style={smallFrameStyle.th_left}>{pageData.feeAndTax}</td>
              <td style={smallFrameStyle.td_data_right}>
                {formatCurrencyWithoutSymbol(orderData?.feeAndTax)}
              </td>
            </tr>
          </table>
          <hr />
          <table>
            <tr>
              <td style={smallFrameStyle.th_left}>
                <strong>{pageData.total}</strong>
              </td>
              <td style={smallFrameStyle.td_data_right}>
                <strong>{formatCurrencyWithoutSymbol(orderData?.totalAmount)}</strong>
              </td>
            </tr>
            <tr>
              <td style={smallFrameStyle.th_left}>{pageData.receivedAmount}</td>
              <td style={smallFrameStyle.td_data_right}>
                {formatCurrencyWithoutSymbol(orderData?.receivedAmount)}
              </td>
            </tr>
            <tr>
              <td style={smallFrameStyle.th_left}>{pageData.change}</td>
              <td style={smallFrameStyle.td_data_right}>
                {formatCurrencyWithoutSymbol(orderData?.change)}
              </td>
            </tr>
            <tr>
              <td style={smallFrameStyle.th_left}>{pageData.paymentMethod}</td>
              <td style={smallFrameStyle.td_data_right}>
                {formatCurrencyWithoutSymbol(orderData?.paymentMethod)}
              </td>
            </tr>
          </table>
          <hr />
          <table>
            {templateSetting?.isShowThanksMessage && (
              <tr>
                <th style={smallFrameStyle.td_center} colSpan={2}>
                  {templateSetting?.thanksMessageData}
                </th>
              </tr>
            )}
            {templateSetting?.isShowWifi && (
              <tr>
                <td style={smallFrameStyle.td_center} colSpan={2}>
                  {pageData.wifi}: {templateSetting?.wifiData}
                </td>
              </tr>
            )}
            {templateSetting?.isShowPassword && (
              <tr>
                <td style={smallFrameStyle.td_center} colSpan={2}>
                  {pageData.password}: {templateSetting?.passwordData}
                </td>
              </tr>
            )}
          </table>
        </div>
      </>
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
