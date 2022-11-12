import { Image, message } from "antd";
import productImageDefault from "assets/product-img-default.png";
import { SubtractIcon } from "constants/icons.constants";
import { useTranslation } from "react-i18next";
import { formatCurrencyWithSymbol } from "utils/helpers";

export function ProductCardComponent(props) {
  const { initData, onAddToCart, onProductItemClick } = props;
  const { t } = useTranslation();

  const onClickProductAddToCard = (product) => {
    if (product.productPrices.length > 0) {
      const { productOptions } = product;
      let options = [];
      productOptions?.forEach((option) => {
        const defaultOptionLevel = option?.optionLevels?.find((ol) => ol?.isSetDefault === true);
        if (defaultOptionLevel) {
          const option = {
            optionId: defaultOptionLevel?.optionId,
            optionLevelId: defaultOptionLevel?.id,
          };
          options.push(option);
        }
      });

      const orderItem = {
        quantity: 1,
        productId: product?.id,
        productPriceId: product?.productPrices[0]?.id,
        options: options,
      };

      onAddToCart(orderItem);
    } else {
      message.warning(t("messages.priceOfProductDoesNotExist"));
    }
  };

  return (
    <>
      <div className="product-card-dashboard-wrapper">
        <div
          className="product-card-dashboard"
          onClick={() => {
            if (onProductItemClick) {
              onProductItemClick(initData?.id);
            }
          }}
        >
          <div className="product-card-img">
            <Image preview={false} src={initData?.thumbnail ?? "error"} fallback={productImageDefault} />
            {initData?.isHasPromotion === true && (
              <div
                className={
                  initData?.isPromotionProductCategory == true
                    ? "discount-percent-product-category"
                    : "discount-percent"
                }
              >
                {initData?.isDiscountPercent === true ? (
                  <span>{initData?.discountValue}%</span>
                ) : (
                  <span>{formatCurrencyWithSymbol(initData?.discountValue)}</span>
                )}
              </div>
            )}
          </div>
          <div className="product-card-content">
            <h3 className="text-line-clamp-2" title={initData?.name}>
              {initData?.name}
            </h3>
            {initData?.productPrices[0].priceName !== null && (
              <span className="price-default">{initData?.productPrices[0].priceName}</span>
            )}
            <div className="product-card-content-footer">
              {initData?.isHasPromotion === true ? (
                <>
                  <span className="price">{formatCurrencyWithSymbol(initData?.productPrices[0]?.priceValue)}</span>
                  <span className="price-line-through">
                    {formatCurrencyWithSymbol(initData?.productPrices[0]?.originalPrice)}
                  </span>
                </>
              ) : (
                <>
                  <span className="price">{formatCurrencyWithSymbol(initData?.productPrices[0]?.priceValue)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="add-to-card-btn">
          <button onClick={() => onClickProductAddToCard(initData)} type="button">
            <SubtractIcon />
          </button>
        </div>
      </div>
    </>
  );
}
