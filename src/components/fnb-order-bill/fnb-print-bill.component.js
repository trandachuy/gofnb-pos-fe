import { ReceiptTemplateComponent } from "components/fnb-receipt/fnb-receipt-component";
import orderDataService from "data-services/order/order-data.service";
import React from "react";
import { useTranslation } from "react-i18next";
const { forwardRef, useImperativeHandle } = React;

export const FnbPrintBillComponent = forwardRef((props, ref) => {
  const [t] = useTranslation();
  const billTemplateRef = React.useRef();

  useImperativeHandle(ref, () => ({
    printBill(orderId) {
      orderDataService.getOrderDetailToPrint(orderId).then((res) => {
        const { detailOrderToPrint, billConfiguration } = res;
        if (billTemplateRef && billTemplateRef.current) {
          billTemplateRef.current.renderTemplate(billConfiguration, detailOrderToPrint);
          billTemplateRef.current.printTemplate();
        }
      });
    },
  }));

  return (
    <>
      <div className="d-none">
        <ReceiptTemplateComponent ref={billTemplateRef} />
      </div>
    </>
  );
});
