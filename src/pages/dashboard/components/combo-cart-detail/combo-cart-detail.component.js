import { Col, Collapse, Form, Image, Row } from "antd";
import { default as comboImageDefault, default as productImageDefault } from "assets/combo-img-default.png";
import { ArrowDoubleRightIcon, BagIcon, MinusIcon, NoSubstituteItemIcon, PlusIcon } from "constants/icons.constants";
import comboDataService from "data-services/combo/combo-data.service";
import productDataService from "data-services/product/product-data.service";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import orderService from "services/order.service";
import { formatCurrency, formatCurrencyWithSymbol } from "utils/helpers";
import { ProductItemDetailCardComponent } from "../product-item-detail-card/product-item-detail-card.component";
import { ComboProductDetailComponent } from "./combo-product-detail.component";
import ProductOptionComponent from "./product-option.component";

const { Panel } = Collapse;

/// Combo Detail Component
export const ComboCartDetailComponent = React.forwardRef((props, ref) => {
  const [t] = useTranslation();
  const { onAddToCart, addOrderCartCache } = props;

  const [showProductDetailForm, setShowProductDetailForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const productDetailRef = React.useRef();
  const [indexChange, setIndexChange] = useState(null);

  /// init combo detail form
  const [comboDetailData, setComboDetailData] = useState({});

  const pageData = {
    back: t("productDetail.back"),
    add: t("productDetail.add"),
    substituteProduct: t("combo.substituteProduct"),
    noSubtitle: t("combo.noSubtitle"),
    topping: t("Topping"),
    option: t("Option"),
  };

  React.useImperativeHandle(ref, () => ({
    edit(comboDetail, index) {
      setShowProductDetailForm(true);
      setIsEdit(true);
      setIndexChange(index);

      // update data for flexible combo before edit
      const { currentComboProductGroupProductPrices } = comboDetail;
      if (currentComboProductGroupProductPrices?.length > 0) {
        const newComboDetail = updateFlexibleComboData(comboDetail);
        setComboDetailData(newComboDetail);
      }

      const newComboDetail = updateFlexibleComboData(comboDetail);
      setComboDetailData(newComboDetail);

      if (!currentComboProductGroupProductPrices) {
        onEditItemFromExistedOrder(comboDetail);
      }
    },
    open(comboId) {
      setIsEdit(false);
      setIndexChange(null);
      getComboDetailByIdAsync(comboId);
    },
  }));

  const getComboDetailByIdAsync = async (comboId) => {
    const res = await comboDataService.getProductsByComboIdAsync(comboId);
    const { isSuccess, combo } = res;
    if (isSuccess === true && combo) {
      let comboProductGroups = [];
      if (combo?.comboProductGroups?.length > 0) {
        combo?.comboProductGroups?.map((comboProductGroup) => {
          let item = {
            groupId: comboProductGroup?.id,
            comboProductGroupProductPrices: comboProductGroup?.comboProductGroupProductPrices,
          };
          comboProductGroups.push(item);
        });

        /// Get combo product groups
        combo?.comboProductGroups?.map((item) => {
          let defaultGroup = comboProductGroups?.find((comboProductGroup) => comboProductGroup?.groupId == item?.id);
          if (defaultGroup != null) {
            item.comboProductGroupProductPrices = item?.comboProductGroupProductPrices?.filter(
              (i) => i?.productPriceId != defaultGroup?.comboProductGroupProductPrices?.productPriceId
            );
          }
          return item;
        });
      }

      /// Set combo detail to state
      const { comboProductPrices } = combo;
      const isSpecificCombo = comboProductPrices && comboProductPrices !== null && comboProductPrices?.length > 0;
      let currentComboProductGroupProductPrices =
        isSpecificCombo === true
          ? []
          : combo?.comboProductGroups?.map((i) => {
              return {
                groupId: i?.id,
                productCategoryId: i?.productCategoryId,
                productCategoryName: i?.productCategoryName,
                quantity: i?.quantity,
                ...i.comboProductGroupProductPrices[0],
              };
            });

      if (currentComboProductGroupProductPrices.length > 0) {
        //set default options
        currentComboProductGroupProductPrices = currentComboProductGroupProductPrices.map((item) => {
          return {
            ...item,
            options:
              item?.productPrice?.product?.productOptions?.map((o) => {
                return {
                  ...o,
                  isSetDefault: true,
                };
              }) ?? [],
          };
        });
      }

      const comboDetail = {
        ...combo,
        quantity: 1,
        isSpecificCombo: isSpecificCombo,
        currentComboProductGroupProductPrices: currentComboProductGroupProductPrices,
      };

      setComboDetailData({ ...comboDetailData, ...comboDetail });
      setShowProductDetailForm(true);

      return comboDetail;
    }

    return null;
  };

  const onEditItemFromExistedOrder = async (comboDetail) => {
    const { comboId } = comboDetail;
    const comboDetailFromApi = await getComboDetailByIdAsync(comboId);
    const newComboDetail = updateFlexibleComboData({
      ...comboDetailFromApi,
      ...comboDetail,
    });

    setComboDetailData(newComboDetail);
  };

  const updateFlexibleComboData = (comboDetail) => {
    const { currentComboProductGroupProductPrices, comboItems } = comboDetail;
    if (currentComboProductGroupProductPrices?.length > 0) {
      const newCurrentComboProductGroupProductPrices = currentComboProductGroupProductPrices?.map((i) => {
        // find item from combo item match with item in currentComboProductGroupProductPrices
        const item = comboItems?.find((ci) => ci?.productPriceId === i?.productPriceId);
        if (item) {
          return {
            ...i,
            toppings: item?.toppings, // update toppings selected
            options: item?.options ?? [], // update options selected
          };
        }

        return i;
      });

      const newComboDetail = {
        ...comboDetail,
        currentComboProductGroupProductPrices: newCurrentComboProductGroupProductPrices,
      };

      return newComboDetail;
    }

    return comboDetail;
  };

  const onAddComboDetailToCart = (comboDetailData) => {
    const {
      id,
      name,
      quantity,
      sellingPrice,
      comboProductPrices,
      comboPricings,
      currentComboProductGroupProductPrices,
      isSpecificCombo,
    } = comboDetailData;

    //save cache
    addOrderCartCache({
      ...comboDetailData,
      key: id,
    });

    if (isSpecificCombo === true) {
      let originalPrice = 0;
      if (comboProductPrices && comboProductPrices.length > 0) {
        comboProductPrices.forEach((c) => {
          originalPrice += c.priceValue;
        });
      }

      const productPrices = comboProductPrices?.map((comboProductPrice) => {
        const { productPriceId, toppings, options } = comboProductPrice;
        return {
          productPriceId: productPriceId,
          quantity: 1,
          options: options?.map((productOption) => {
            return {
              ...productOption,
            };
          }),
          toppings: toppings,
          productId: comboProductPrice?.productPrice?.productId,
          productName: comboProductPrice?.productPrice?.product?.name,
          priceValue: comboProductPrice?.priceValue,
        };
      });

      let combo = {
        comboId: id,
        comboName: name,
        itemName: name,
        originalPrice: originalPrice,
        sellingPrice: sellingPrice,
        comboItems: productPrices ?? [],
        quantity: quantity,
      };

      onAddToCart(combo, true, indexChange);
    } else {
      /// Handle add flexible combo to cart
      const comboPricing = orderService.getComboProductPricingByProductGroups(
        comboPricings,
        currentComboProductGroupProductPrices
      );

      const { id, comboId, comboName, originalPrice, sellingPrice } = comboPricing;
      const productPrices = currentComboProductGroupProductPrices?.map((comboProductGroupProductPrice) => {
        const { groupId, options, toppings, productPrice, productPriceId } = comboProductGroupProductPrice;

        const { productId, product } = productPrice;
        return {
          comboProductGroupId: groupId,
          productId: productId,
          productName: product?.name,
          productPriceId: productPriceId,
          sellingPrice: sellingPrice,
          options: options?.map((o) => {
            return {
              ...o,
              optionId: o.id || o?.optionId,
              optionName: o?.name || o?.optionName,
              optionLevelId: o?.optionLevelId,
              optionLevelName: o?.optionsSelectName,
            };
          }),
          toppings: toppings,
          priceValue: productPrice?.priceValue,
        };
      });

      let combo = {
        comboId: comboId,
        comboName: name,
        itemName: comboName,
        comboPricingId: id,
        originalPrice: originalPrice,
        sellingPrice: sellingPrice,
        comboItems: productPrices,
        quantity: quantity,
      };

      onAddToCart(combo, true, indexChange);
    }
  };

  const onPlus = () => {
    setComboDetailData({ ...comboDetailData, quantity: comboDetailData.quantity + 1 });
  };

  const onMinus = () => {
    if (comboDetailData?.quantity > 1) {
      setComboDetailData({ ...comboDetailData, quantity: comboDetailData.quantity - 1 });
    }
  };

  /**
   * Click to get product price detail and show dialog to select option and topping
   * @param {*} productId
   * @param {*} productPriceId
   * @param {*} options
   * @param {*} toppings
   */
  function onClickProductPrice(productId, productPriceId, options, toppings) {
    productDataService.getProductDetailByIdAsync(productId).then((res) => {
      if (res) {
        const { productDetail, productToppings } = res;

        if (productDetailRef && productDetailRef.current) {
          /// init data for product detail form
          productDetailRef.current.fetchData({ ...productDetail });
          const productDetailData = {
            selectedToppings: toppings ?? [],
            selectedOptions: options ?? [],
            productPriceIdSelected: productPriceId,
          };
          productDetailRef.current.setData(productDetailData, productToppings);
        }
      }
    });
  }

  const onSelectToppingAndOptionProduct = (comboProductDetailData) => {
    const { productPriceId, toppings, options } = comboProductDetailData;
    let { isSpecificCombo, currentComboProductGroupProductPrices, comboProductPrices } = comboDetailData;
    if (isSpecificCombo === true && comboProductPrices && comboProductPrices.length > 0) {
      let newComboProductPrices = [];
      comboProductPrices.forEach((comboProductPrice) => {
        /// Set options and toppings selected for the specific product combo
        if (comboProductPrice.productPriceId === productPriceId) {
          comboProductPrice.options = options;
          comboProductPrice.toppings = toppings;
          const newComboProductPrice = {
            ...comboProductPrice,
            options: options ?? [],
            toppings: toppings ?? [],
          };
          newComboProductPrices.push(newComboProductPrice);
        } else {
          newComboProductPrices.push(comboProductPrice);
        }
      });

      /// Update state for combo detail data
      setComboDetailData({ ...comboDetailData, comboProductPrices: newComboProductPrices });
    } else if (currentComboProductGroupProductPrices && currentComboProductGroupProductPrices.length > 0) {
      let newCurrentComboProductGroupProductPrices = [];
      currentComboProductGroupProductPrices.forEach((comboProductGroupProductPrice) => {
        /// Set options and toppings selected for combo
        if (comboProductGroupProductPrice?.productPriceId === productPriceId) {
          const newComboProductGroupProductPrice = {
            ...comboProductGroupProductPrice,
            options: options ?? [],
            toppings: toppings ?? [],
          };

          newCurrentComboProductGroupProductPrices.push(newComboProductGroupProductPrice);
        } else {
          newCurrentComboProductGroupProductPrices.push(comboProductGroupProductPrice);
        }
      });

      /// Update state for combo detail data
      setComboDetailData({
        ...comboDetailData,
        currentComboProductGroupProductPrices: newCurrentComboProductGroupProductPrices,
      });
    }
  };

  const getDataSubstituteProducts = () => {
    let substituteProducts = [];
    const { comboProductGroups, currentComboProductGroupProductPrices } = comboDetailData;
    if (comboProductGroups && comboProductGroups.length > 0) {
      comboProductGroups.forEach((comboProductGroup) => {
        const { comboProductGroupProductPrices } = comboProductGroup;
        const productPrices = comboProductGroupProductPrices?.map((comboProductGroupProductPrice) => {
          return {
            ...comboProductGroupProductPrice.productPrice,
            productPriceId: comboProductGroupProductPrice.productPriceId,
          };
        });

        const group = {
          ...comboProductGroup,
          productPrices: productPrices?.filter(
            (productPrice) =>
              !currentComboProductGroupProductPrices?.find((i) => i.productPriceId === productPrice.productPriceId)
          ),
        };

        substituteProducts.push(group);
      });
    }

    return substituteProducts;
  };

  function onChangeProductPriceItemFlexibleCombo(groupId, productPrice) {
    const { currentComboProductGroupProductPrices } = comboDetailData;
    if (currentComboProductGroupProductPrices && currentComboProductGroupProductPrices.length > 0) {
      var newCurrentComboProductGroupProductPrices = [];
      currentComboProductGroupProductPrices.forEach((currentComboProductGroupProductPrice) => {
        if (currentComboProductGroupProductPrice.groupId === groupId) {
          const newComboProductGroupProductPrice = {
            ...currentComboProductGroupProductPrice,
            productPrice: productPrice,
            productPriceId: productPrice.productPriceId,
            toppings: [],
            options: [],
          };
          newCurrentComboProductGroupProductPrices.push(newComboProductGroupProductPrice);
        } else {
          newCurrentComboProductGroupProductPrices.push(currentComboProductGroupProductPrice);
        }
      });

      setComboDetailData({
        ...comboDetailData,
        currentComboProductGroupProductPrices: newCurrentComboProductGroupProductPrices,
      });
    }
  }

  const calculateOriginalPrice = () => {
    if (!comboDetailData) return 0;
    const { isSpecificCombo, comboPricings, currentComboProductGroupProductPrices, comboProductPrices, quantity } =
      comboDetailData;

    const comboPricing = orderService.getComboProductPricingByProductGroups(
      comboPricings,
      currentComboProductGroupProductPrices
    );

    let originalPrice = comboPricing?.originalPrice ?? 0;
    let totalToppingPrice = 0;
    if (isSpecificCombo === true && comboProductPrices && comboProductPrices.length > 0) {
      comboProductPrices.forEach((comboProductPrice) => {
        const { toppings } = comboProductPrice;
        originalPrice += comboProductPrice?.priceValue;
        totalToppingPrice += calculateTotalToppingPrice(toppings);
      });
    } else if (currentComboProductGroupProductPrices && currentComboProductGroupProductPrices.length > 0) {
      currentComboProductGroupProductPrices.forEach((comboProductGroupProductPrice) => {
        if (comboProductGroupProductPrice.toppings && comboProductGroupProductPrice.toppings.length > 0) {
          totalToppingPrice += calculateTotalToppingPrice(comboProductGroupProductPrice.toppings);
        }
      });
    }

    const totalPrice = (originalPrice + totalToppingPrice) * quantity;

    return totalPrice;
  };

  const calculateTotalToppingPrice = (toppings) => {
    let totalPrice = 0;
    if (toppings && toppings.length > 0) {
      toppings.forEach((topping) => {
        const { quantity, priceValue } = topping;
        const toppingPrice = priceValue * quantity;
        totalPrice += toppingPrice;
      });
    }

    return totalPrice;
  };

  const calculateTotalPrice = () => {
    if (comboDetailData) {
      const {
        isSpecificCombo,
        sellingPrice,
        comboPricings,
        currentComboProductGroupProductPrices,
        comboProductPrices,
        quantity,
      } = comboDetailData;
      let currentSellingPrice = sellingPrice;

      const comboPricing = orderService.getComboProductPricingByProductGroups(
        comboPricings,
        currentComboProductGroupProductPrices
      );
      let totalToppingPrice = 0;
      if (isSpecificCombo === true && comboProductPrices && comboProductPrices.length > 0) {
        comboProductPrices.forEach((comboProductPrice) => {
          const { toppings } = comboProductPrice;
          totalToppingPrice += calculateTotalToppingPrice(toppings);
        });
      } else if (currentComboProductGroupProductPrices && currentComboProductGroupProductPrices.length > 0) {
        currentComboProductGroupProductPrices.forEach((comboProductGroupProductPrice) => {
          if (comboProductGroupProductPrice.toppings && comboProductGroupProductPrice.toppings.length > 0) {
            totalToppingPrice += calculateTotalToppingPrice(comboProductGroupProductPrice.toppings);
          }
        });
        currentSellingPrice = comboPricing?.sellingPrice;
      }

      const totalPrice = (currentSellingPrice + totalToppingPrice) * quantity;

      return totalPrice;
    }

    return 0;
  };

  function renderComboProductGroups() {
    const substituteProducts = getDataSubstituteProducts();
    const activeKeys = substituteProducts?.map((group) => group.id);
    return (
      <Collapse className="substitute-collapse" defaultActiveKey={activeKeys}>
        {substituteProducts.map((group) => {
          const { id, productCategoryId, productCategoryName, quantity, productPrices } = group;
          return (
            <Panel header={productCategoryName} key={id}>
              {productPrices?.map((productPrice) => {
                const { productPriceId, product, priceName, priceValue } = productPrice;
                return (
                  <>
                    <div className="group-item" onClick={() => onChangeProductPriceItemFlexibleCombo(id, productPrice)}>
                      <Image
                        width={104}
                        preview={false}
                        src={product?.thumbnail ?? "error"}
                        fallback={productImageDefault}
                      />
                      <div className="group-item-info">
                        <h2>{product?.name}</h2>
                        <p>{priceName}</p>
                      </div>
                    </div>
                  </>
                );
              })}
            </Panel>
          );
        })}
      </Collapse>
    );
  }

  function renderFlexibleComboProductPrice(currentComboProductGroupProductPrices) {
    const groupIds = currentComboProductGroupProductPrices?.map((group) => {
      return group.groupId;
    });

    if (!groupIds) return <></>;

    return (
      <>
        <Collapse className="collapse w-100" defaultActiveKey={groupIds} ghost>
          {currentComboProductGroupProductPrices?.map((comboProductGroupProductPrice) => {
            const { productPrice, productPriceId } = comboProductGroupProductPrice;
            const { product, priceName, productId } = productPrice;
            const options = comboProductGroupProductPrice?.options?.map((option) => {
              const { name, optionLevelName, optionName, isSetDefault } = option;
              return {
                isSetDefault: isSetDefault,
                name: name || optionName,
                value: optionLevelName,
              };
            });

            const toppings = comboProductGroupProductPrice?.toppings?.map((topping) => {
              const { name, quantity } = topping;
              return {
                name: name,
                value: `x${quantity}`,
              };
            });

            const isDefaultOptions = options?.filter((o) => o?.isSetDefault === true)?.length === options?.length;
            const notOptionDefault = options?.filter((o) => o.isSetDefault !== true);
            const renderOption =
              isDefaultOptions === true ? (
                <></>
              ) : (
                <ProductOptionComponent
                  className={`${options?.length > 0 && (!toppings || toppings?.length == 0) ? "last" : ""}`}
                  title={pageData.option}
                  details={notOptionDefault}
                />
              );

            return (
              <Panel
                header={<span>{comboProductGroupProductPrice?.productCategoryName}</span>}
                key={comboProductGroupProductPrice?.groupId}
                className="panel w-100"
              >
                <ProductItemDetailCardComponent
                  className="product-item"
                  expand={
                    (options && options?.length > 0 && isDefaultOptions === false) || (toppings && toppings?.length > 0)
                  }
                  body={
                    <>
                      <div
                        className="product-info pointer"
                        onClick={() => {
                          const { options, toppings } = comboProductGroupProductPrice;
                          onClickProductPrice(productId, productPriceId, options, toppings);
                        }}
                      >
                        <Image preview={false} src={product?.thumbnail ?? "error"} fallback={productImageDefault} />
                        <div className="product-name">
                          <div className="text-product-price">
                            <h2>{product?.name}</h2>
                            <p>{priceName}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  }
                  description={
                    <>
                      {renderOption}
                      <ProductOptionComponent className="last" title={pageData.topping} details={toppings} />
                      <div className="product-panel-footer"></div>
                    </>
                  }
                />
              </Panel>
            );
          })}
        </Collapse>
      </>
    );
  }

  function renderSpecificComboProductPrices(productPrices) {
    return (
      <>
        <Row>
          {productPrices?.map((item) => {
            const { priceName, priceValue, productPrice, productPriceId, options, toppings } = item;
            const productOptions = options?.map((o) => {
              return {
                name: o?.name,
                value: o?.optionLevelName,
              };
            });
            return (
              <>
                <></>
                <Col span={12}>
                  <ProductItemDetailCardComponent
                    className="product-item"
                    expand={(options && options?.length > 0) || (toppings && toppings?.length > 0)}
                    body={
                      <>
                        <div
                          className="product-info pointer"
                          onClick={() => {
                            onClickProductPrice(productPrice?.productId, productPriceId, options, toppings);
                          }}
                        >
                          <div>
                            <Image
                              className="product-image"
                              preview={false}
                              src={productPrice?.product?.thumbnail ?? "error"}
                              fallback={comboImageDefault}
                            />
                          </div>
                          <div className="product-name">
                            <div className="text-product-price">
                              <h2 className="text-line-clamp-3">{productPrice?.product?.name}</h2>
                              <p>{priceName}</p>
                            </div>
                          </div>
                        </div>
                      </>
                    }
                    description={
                      <>
                        <div className="description-header"></div>
                        <ProductOptionComponent
                          className={`${
                            productOptions?.length > 0 && (!toppings || toppings?.length == 0) ? "last" : ""
                          }`}
                          title={pageData.option}
                          details={productOptions}
                        />
                        <ProductOptionComponent className="last" title={pageData.topping} details={toppings} />
                        <div className="product-panel-footer"></div>
                      </>
                    }
                  />
                </Col>
              </>
            );
          })}
        </Row>
      </>
    );
  }

  function renderComboProductPriceDetail() {
    return (
      showProductDetailForm && (
        <div className="w-100 combo-product-price">
          {comboDetailData.isSpecificCombo === true
            ? renderSpecificComboProductPrices(comboDetailData.comboProductPrices)
            : renderFlexibleComboProductPrice(comboDetailData.currentComboProductGroupProductPrices)}
        </div>
      )
    );
  }

  return (
    <>
      <Form>
        <div className="combo-cart-detail-container">
          <input type="checkbox" id="active" className="d-none" checked={showProductDetailForm}></input>
          <div class="wrapper">
            <label
              for="active"
              onClick={() => {
                if (productDetailRef && productDetailRef.current) {
                  productDetailRef.current.close();
                }

                setShowProductDetailForm(false);
              }}
            >
              <div class="menu-btn">
                <ArrowDoubleRightIcon className="close-icon" />
              </div>
            </label>
            <div className="body">
              <div className="combo-detail-left">
                {/* BEGIN Combo quantity */}
                <Row className="float-right cart-item-quantity">
                  <div className="btn-minus">
                    <button onClick={onMinus} type="button">
                      <MinusIcon className="btn-icon" />
                    </button>
                  </div>
                  <div className="item-quantity">
                    <span>{comboDetailData?.quantity}</span>
                  </div>
                  <div className="btn-plus">
                    <button onClick={onPlus} type="button">
                      <PlusIcon className="btn-icon" />
                    </button>
                  </div>
                </Row>
                {/* END combo quantity */}
                <Row className="combo-content">
                  <Col span={24}>
                    <h2 className="title">{comboDetailData?.name}</h2>
                  </Col>

                  <Col span={24} className="description">
                    <Image
                      className="image"
                      preview={false}
                      src={comboDetailData?.thumbnail ?? "error"}
                      fallback={productImageDefault}
                    />
                    <p>{comboDetailData?.description}</p>
                  </Col>

                  {renderComboProductPriceDetail()}
                </Row>
              </div>

              <div className="combo-substitute-right h-100">
                <div className="form-list-group">
                  <p className="lbl-render-combo">{pageData.substituteProduct}</p>
                  {comboDetailData?.comboProductGroups?.length > 1 ? (
                    <>{renderComboProductGroups()}</>
                  ) : (
                    <>
                      <div className="d-flex h-100">
                        <div className="no-subtitle m-auto">
                          <div className="d-flex">
                            <NoSubstituteItemIcon className="m-auto" />
                          </div>
                          <p className="lbl-render-combo">{pageData.noSubtitle}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Row className="footer">
              <Col span={24}>
                <div
                  className="btn-add-product"
                  onClick={() => {
                    onAddComboDetailToCart(comboDetailData);
                    setShowProductDetailForm(false);
                  }}
                >
                  <div className="combo-price">
                    <div className="selling-price">{formatCurrency(calculateTotalPrice())}</div>
                    <div className="original-price">{formatCurrencyWithSymbol(calculateOriginalPrice())}</div>
                  </div>

                  <div className="add-icon">
                    <span className="uppercase">{pageData.add}</span> <BagIcon />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Form>

      <ComboProductDetailComponent
        ref={productDetailRef}
        onAdd={(comboProductDetailData) => {
          onSelectToppingAndOptionProduct(comboProductDetailData);
        }}
      />
    </>
  );
});
