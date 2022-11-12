import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./secondary-screen-order-detail.scss";
import productImageDefault from "assets/product-img-default.png";
import { formatCurrency, roundNumber } from "utils/helpers";
import { Image } from "antd";

const { forwardRef, useImperativeHandle } = React;

export const SecondaryScreenOrderDetail = forwardRef((props, ref) => {
  const { shoppingCart } = props;
  const [cartItems, setCartItems] = useState([]);
  const [t] = useTranslation();
  const pageData = {
    total: t("secondaryScreen.total"),
    discount: t("secondaryScreen.discount"),
    fee: t("secondaryScreen.fee"),
    tax :t("secondaryScreen.tax"),
    items: t("secondaryScreen.items"),
  };

  useEffect(() => {
    setCartItems(shoppingCart?.cartItems);
  }, [shoppingCart]);

  //#region Product price calculation
  const calculateProductDiscountPercentageValue = (product) => {
    let percentage = ((product?.originalPrice - product?.priceAfterDiscount) / product?.originalPrice) * 100;
    return percentage;
  };
  const calculateOriginalPriceProductIncludeTopping = (product) => {
    let toppingOriginalPriceValue = 0;
    let originalPrice = product?.originalPrice * product?.quantity;
    product?.toppings?.forEach((topping) => {
      // the topping price has been included in the quantity of topping
      toppingOriginalPriceValue += topping?.originalPrice * product.quantity;
    });

    return originalPrice + toppingOriginalPriceValue;
  };

  const calculateSellingPriceProductIncludeTopping = (product) => {
    let toppingSellingPriceValue = 0;
    let sellingPrice = product?.priceAfterDiscount * product?.quantity;
    product?.toppings?.forEach((topping) => {
      // the topping price has been included in the quantity of topping
      toppingSellingPriceValue += topping?.priceAfterDiscount * product.quantity;
    });

    return roundNumber(sellingPrice + toppingSellingPriceValue, 0);
  };
  //#endregion Product price calculation

  //#region Combo price calculation
  const calculateComboDiscountPercentageValue = (combo) => {
    let percentage = ((combo?.originalPrice - combo?.sellingPrice) / combo?.originalPrice) * 100;
    return percentage;
  };

  const calculateOriginalPriceComboIncludeTopping = (combo) => {
    let totalPrice = combo?.originalPrice ?? 0;
    let toppingSellingPriceValue = 0;
    combo?.comboItems?.forEach((comboItem) => {
      comboItem?.toppings?.forEach((topping) => {
        toppingSellingPriceValue += topping?.priceAfterDiscount * topping?.quantity;
      });
    });

    totalPrice = (totalPrice + toppingSellingPriceValue) * combo?.quantity;

    return totalPrice;
  };

  const calculateSellingPriceComboIncludeTopping = (combo) => {
    let totalPrice = combo?.sellingPrice ?? 0;
    let toppingSellingPriceValue = 0;
    combo?.comboItems?.forEach((comboItem) => {
      comboItem?.toppings?.forEach((topping) => {
        toppingSellingPriceValue += topping?.priceAfterDiscount * topping?.quantity;
      });
    });

    totalPrice = (totalPrice + toppingSellingPriceValue) * combo?.quantity;

    return totalPrice;
  };
  //#endregion Combo price calculation

  //#region Render UI
  ///Render total container
  const renderTotalContainer = () => {
    return (
      <>
        <div className="top-content">
          <div className="left-box">
            <div className="total-text-box">
              <span className="total-text">{pageData.total}</span>
              <span className="item-number ml-10">{`(${cartItems ? cartItems.length : 0} ${pageData.items})`}</span>
            </div>
          </div>
          <div className="right-box">
            <div className="total-price-box">
              <span className="total-price-text">
                {formatCurrency(
                  shoppingCart?.totalPriceAfterDiscount + shoppingCart?.totalTax + shoppingCart?.totalFee
                )}
              </span>
            </div>
            </div>
          </div>
        <div className="bottom-content">
          <div className="left-box">
            <div className="discount-text-box">
              <span className="discount-text">{pageData.discount}</span>
            </div>
            <div className="fee-text-box">
              <span className="fee-text">{pageData.fee}</span>
            </div>
            <div className="tax-text-box">
              <span className="tax-text">{pageData.tax}</span>
            </div>
          </div>
          <div className="right-box">
            <div className="discount-amount-box">
              <span className="discount-amount-text">-{formatCurrency(shoppingCart?.totalDiscountAmount)}</span>
            </div>
            <div className="fee-amount-box">
              <span className="fee-amount-text">{formatCurrency(shoppingCart?.totalFee)}</span>
            </div>
            <div className="tax-amount-box">
              <span className="tax-amount-text">{formatCurrency(shoppingCart?.totalTax)}</span>
            </div>
          </div>
        </div>
      </>
    );
  };

  ///Render combo cart item
  const renderComboCartItem = (combo) => {
    const { comboName, quantity, comboItems } = combo;
    return (
      <div className="combo-cart-item-container">
        <div className="combo-info-wrapper">
          <div className="combo-image-container">
            {/* Show promotion badge when exist discount price */}
            {calculateComboDiscountPercentageValue(combo) > 0 && (
              <div className="promotion-badge">
                <span className="promotion-text">{roundNumber(calculateComboDiscountPercentageValue(combo))}%</span>
              </div>
            )}
            <div className="combo-img-box">
              <Image preview={false} src={combo?.thumbnail ?? "error"} fallback={productImageDefault} />
            </div>
          </div>
          <div className="combo-info-box">
            <div className="combo-info-container">
              <div className="combo-name-box">
                <p className="text-info-default combo-name-text-overflow mb-0">{comboName}</p>
              </div>
              <div className="quantity-box">
                <span className="text-info-default">x{quantity}</span>
              </div>
              <div className="price-amount-box">
                <p className="text-info-default mb-0">
                  {formatCurrency(calculateSellingPriceComboIncludeTopping(combo))}
                </p>
                <p className="text-info-default discount-text-price mb-0">
                  <span className="price-discount-value">
                    {calculateSellingPriceComboIncludeTopping(combo) !==
                      calculateOriginalPriceComboIncludeTopping(combo) &&
                      formatCurrency(calculateOriginalPriceComboIncludeTopping(combo))}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  ///Render product cart item
  const renderProductCartItem = (product) => {
    const { itemName, productPriceName, quantity, originalPrice, priceAfterDiscount, options, toppings } = product;
    const canShowOption = options?.find(item => !item.isSetDefault);
    return (
      <>
        <div className="product-image-container">
          {/* Show promotion badge when exist discount price */}
          {calculateProductDiscountPercentageValue(product) > 0 && (
            <div className="promotion-badge">
              <span className="promotion-text">{roundNumber(calculateProductDiscountPercentageValue(product))}%</span>
            </div>
          )}
          <div className="product-img-box">
            <Image preview={false} src={product?.thumbnail ?? "error"} fallback={productImageDefault} />
          </div>
        </div>
        <div className="cart-item-info-container">
          {/* Items have toppings or options */}
          {(options && options.length > 0 && canShowOption) || (toppings && toppings.length > 0) ? (
            <div className="full-product-cart-item-container">
              <div className="product-info-container">
                <div className="product-name-box">
                  <p className="text-info-default product-name-text-overflow mb-0">{itemName}</p>
                </div>
                <div className="price-name-box">
                  <span className="text-info-default">{productPriceName}</span>
                </div>
                <div className="quantity-box">
                  <span className="text-info-default">x{quantity}</span>
                </div>
                <div className="price-amount-box">
                  <p className="text-info-default mb-0">
                    {formatCurrency(calculateSellingPriceProductIncludeTopping(product))}
                  </p>
                  {originalPrice > priceAfterDiscount && (
                    <p className="text-info-default discount-text-price mb-0">
                      {formatCurrency(calculateOriginalPriceProductIncludeTopping(product))}
                    </p>
                  )}
                </div>
              </div>
              {options && options.length > 0 && canShowOption && (
                <div className="option-info-container">
                  {options?.filter(item => !item.isSetDefault).map((option, index) => (
                    <span className={`text-option ${index > 0 && "ml-8"}`}>
                      {option?.optionName} - {option?.optionLevelName}
                    </span>
                  ))}
                </div>
              )}

              <div className="topping-info-container">
                {toppings?.map((topping) => (
                  <p className="mb-0 topping-text topping-text-overflow">
                    <span className="topping-quantity">{topping?.quantity} x</span>
                    <span className="ml-1">{topping?.name}</span>
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="cart-item-default-box">
              <div className="product-name-box">
                <p className="text-info-default product-name-text-overflow mb-0">{itemName}</p>
              </div>
              <div className="price-name-box">
                <span className="text-info-default">{productPriceName}</span>
              </div>
              <div className="quantity-box">
                <span className="text-info-default">x{quantity}</span>
              </div>
              <div className="price-amount-box">
                <p className="text-info-default mb-0">
                  {formatCurrency(calculateSellingPriceProductIncludeTopping(product))}
                </p>
                {originalPrice > priceAfterDiscount && (
                  <p className="text-info-default discount-text-price mb-0">
                    {formatCurrency(calculateOriginalPriceProductIncludeTopping(product))}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </>
    );
  };
  //#endregion Render UI

  return (
    <>
      <div className="order-detail-container">
        <div className="total-container">{renderTotalContainer()}</div>
        <div className="cart-item-container">
          {cartItems && cartItems.length > 0 && (
            <>
              {cartItems?.map((item) => (
                <div className="cart-item-box">
                  {item.isCombo ? <>{renderComboCartItem(item.combo)}</> : <>{renderProductCartItem(item)}</>}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
});
