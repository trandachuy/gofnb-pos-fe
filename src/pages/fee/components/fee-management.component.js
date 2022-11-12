import { useTranslation } from "react-i18next";
import { formatCurrency } from "utils/helpers";
import "./fee-management.scss";

export function FeeManagementComponent(props) {
  const [t] = useTranslation();
  const {
    totalInput,
    feesActive,
    feesDeActive,
    onSelectFee,
    setFeesDeActive,
    currencyAmount,
    percentAmount,
    setCurrencyAmount,
    setPercentAmount,
    totalFee,
    setTotalFee,
    setIsLoadFee,
  } = props;

  const pageData = {
    percent: "%",
    feeAmount: t("fee.feeAmount"),
    remove: t("fee.remove"),
    apply: t("fee.apply"),
    seeMore: t("fee.seeMore"),
    extraFees: t("fee.extraFees"),
  };

  const onUnSelectFee = async (fee) => {
    let totalAfter = 0;
    let tempPercent = percentAmount;
    let tempCurrency = currencyAmount;

    if (fee?.isPercentage === true) {
      tempPercent = tempPercent - fee?.value;
      setPercentAmount(tempPercent);
    } else {
      tempCurrency = tempCurrency - fee?.value;
      setCurrencyAmount(tempCurrency);
    }

    if (tempPercent > 0) {
      totalAfter = totalAfter + (totalInput * tempPercent) / 100;
    }
    if (tempCurrency > 0) {
      totalAfter = totalAfter + tempCurrency;
    }
    setTotalFee(totalAfter);
    setIsLoadFee(false);
    let restFees = feesActive.filter((o) => o !== fee);
    onSelectFee(restFees);

    feesDeActive.push(fee);
  };

  const onAddFee = (fee) => {
    let totalAfter = 0;
    let tempPercent = percentAmount;
    let tempCurrency = currencyAmount;
    if (fee?.isPercentage === true) {
      tempPercent = tempPercent + fee?.value;
      setPercentAmount(tempPercent);
    } else {
      tempCurrency = tempCurrency + fee?.value;
      setCurrencyAmount(tempCurrency);
    }

    if (tempPercent > 0) {
      totalAfter = totalAfter + (totalInput * tempPercent) / 100;
    }
    if (tempCurrency > 0) {
      totalAfter = totalAfter + tempCurrency;
    }
    setTotalFee(totalAfter);
    setIsLoadFee(false);
    let restFees = feesDeActive.filter((o) => o !== fee);
    setFeesDeActive(restFees);

    feesActive.push(fee);

    onSelectFee(feesActive);
  };

  return (
    <>
      <div className="fee-wrapper">
        <div className="fee-header">{pageData.extraFees}</div>
        <div className="fee-activate">
          <div className="fee-activate-content">
            <div className="content-wrapper">
              {feesActive?.map((item, index) => {
                return (
                  <div className="fee-activate-card" key={index}>
                    <div className="detail-card">
                      <div className="detail-card-header">
                        <h2 className="title">{item?.name}</h2>
                        <span className="discount">
                          {item?.isPercentage === true ? (
                            <>
                              {item?.value}
                              {pageData.percent}
                            </>
                          ) : (
                            <>{formatCurrency(item?.value)}</>
                          )}
                        </span>
                      </div>
                      <div class="clear"></div>
                      <span className="description text-line-clamp-3">{item?.description}</span>
                    </div>
                    <div className="extra-fee-btn remove-btn" onClick={() => onUnSelectFee(item)}>
                      {pageData.remove}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="fee-amount">
            <div className="fee-amount-card">
              <span className="title">{pageData.feeAmount}</span>
              <span className="amount">+{formatCurrency(totalFee)}</span>
            </div>
          </div>
        </div>
        <div className="fee-non-activate">
          {feesDeActive?.map((item, index) => {
            return (
              <div className="fee-non-activate-card" key={index}>
                <div className="detail-card">
                  <div className="detail-card-header">
                    <h2 className="title">{item?.name}</h2>
                    <div className="discount">
                      {item?.isPercentage === true ? (
                        <>
                          {item?.value}
                          {pageData.percent}
                        </>
                      ) : (
                        <>{formatCurrency(item?.value)}</>
                      )}
                    </div>
                  </div>
                  <div class="clear"></div>
                  <span className="description text-line-clamp-3">{item?.description}</span>
                </div>
                <div className="extra-fee-btn apply-btn" onClick={() => onAddFee(item)}>
                  {pageData.apply}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
