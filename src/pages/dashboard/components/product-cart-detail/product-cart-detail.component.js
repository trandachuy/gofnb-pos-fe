import { Col, Collapse, Form, Image, Input, Radio, Row } from "antd";
import productImageDefault from "assets/product-img-default.png";
import { ArrowDoubleRightIcon, BagIcon, MinusIcon, PlusIcon, SmallCircleDotIcon } from "constants/icons.constants";
import productDataService from "data-services/product/product-data.service";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "utils/helpers";
import "./product-cart-detail.component.scss";

const { Panel } = Collapse;
export const ProductCartDetailComponent = React.forwardRef((props, ref) => {
  const { onAddToCart } = props;

  const [t] = useTranslation();
  const [formItemDetail] = Form.useForm();
  const [showProductDetailForm, setShowProductDetailForm] = useState(false);
  const [productToppings, setProductToppings] = useState([]); // all topping of current product
  const [productItemDetail, setProductItemDetail] = useState({}); // product detail from cart to edit

  const [quantity, setQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [indexChange, setIndexChange] = useState(null);
  const [isChangedForm, setIsChangedForm] = useState(false); // flag to render after change form value

  React.useImperativeHandle(ref, () => ({
    open(productId, editData, index) {
      getProductDetail(productId, editData);
      if (editData) {
        setIndexChange(index); // the index of item in cart to edit
      } else {
        setIndexChange(null);
      }
    },
  }));

  const pageData = {
    btnAdd: t("button.add"),
    messages: {
      allowOutOfMaterial: t("messages.allowOutOfMaterial"),
      doNotAllowOutOfMaterial: t("messages.doNotAllowOutOfMaterial"),
    },
    confirmAddToCardTitle: t("messages.confirmEditOrderItemTitle"),
    btnAddToCard: t("button.addToOrder"),
    btnIgnore: t("button.ignore"),
  };

  useEffect(() => {
    initData();
  }, []);

  const getProductDetail = async (productId, editData) => {
    onResetData();

    // get product detail from api
    const productDetailResponse = await productDataService.getProductDetailByIdAsync(productId);
    if (productDetailResponse) {
      const { productToppings, productDetail } = productDetailResponse;
      const { id, name, description, thumbnail, productOptions, productPrices } = productDetail;

      // set list options to show on dialog
      setProductToppings(productToppings ?? []);

      const getDefaultOptions = (allOptions) => {
        let options = [];
        allOptions?.forEach((option) => {
          const defaultOptionLevel = option?.optionLevels?.find((ol) => ol?.isSetDefault === true);
          if (defaultOptionLevel) {
            const option = {
              optionId: defaultOptionLevel?.optionId,
              optionLevelId: defaultOptionLevel?.id,
            };
            options.push(option);
          }
        });

        return options;
      };

      let productItem = {
        id: id,
        name: name,
        thumbnail: thumbnail,
        description: description,
        prices: productPrices?.map((price) => {
          return {
            id: price.id,
            name: price.priceName,
            priceValue: price.priceValue,
          };
        }),
        allOptions: productOptions?.map((option) => {
          return {
            optionId: option?.id,
            optionName: option?.name,
            optionLevels: option?.optionLevels?.map((level) => {
              return {
                optionLevelId: level?.id,
                optionLevelName: level?.name,
                isDefault: level?.isSetDefault,
              };
            }),
          };
        }),
        options: getDefaultOptions(productOptions),
      };

      if (productPrices && productPrices.length > 0) {
        const productPrice = productPrices[0];
        productItem = {
          ...productItem,
          productPriceId: editData?.productPriceId ?? productPrice.id,
          quantity: editData?.quantity ?? 1,
          productId: id,
        };

        setTotalPrice(editData?.originalPrice ?? productPrice.priceValue);

        // if edit order item
        if (editData !== null && editData !== undefined) {
          // mapping product toppings
          if (editData?.toppings?.length > 0) {
            let toppings = [];
            editData?.toppings?.forEach((topping) => {
              let toppingItem = {
                ...topping,
                priceValue: topping.price,
              };
              toppings.push(toppingItem);
            });

            productItem = {
              ...productItem,
              toppings: toppings,
            };
          }

          // mapping product options
          const { options } = editData;
          const newOptions =
            options.map((o) => {
              return {
                optionId: o.optionId,
                optionLevelId: o.optionLevelId,
              };
            }) ?? [];

          productItem = {
            ...productItem,
            options: newOptions,
          };

          setQuantity(editData.quantity);
        }

        // set form values
        formItemDetail.setFieldsValue(productItem);

        // set stage and re-render
        setProductItemDetail(productItem);
      }

      if (showProductDetailForm === false) {
        // show dialog
        setShowProductDetailForm(true);
      }
    }
  };

  const initData = () => {
    setQuantity(1);
    formItemDetail.setFieldsValue({
      quantity: 1,
    });

    updateState(formItemDetail);
  };

  const onResetData = () => {
    formItemDetail.resetFields();
    initData();
  };

  const onChangeProductPrice = (e) => {
    const { value } = e.target;
    formItemDetail.setFieldsValue({
      productPriceId: value,
    });
    updateState(formItemDetail);
  };

  const onChangeProductQuantity = (quantity) => {
    setQuantity(quantity);
    formItemDetail.setFieldsValue({
      quantity: quantity,
    });

    updateState(formItemDetail);
  };

  /// continue here
  const onChangeProductToppingQuantity = (toppingId, quantity) => {
    const { toppings } = formItemDetail.getFieldsValue();
    let existedTopping = toppings?.find((topping) => topping.toppingId === toppingId); // get from current product's toppings
    let newToppings = [];
    if (existedTopping) {
      existedTopping.quantity += quantity;
      newToppings.push(existedTopping);
    } else {
      let existedTopping = productToppings?.find((topping) => topping.toppingId === toppingId); // get from all toppings
      existedTopping.quantity += quantity;
      newToppings.push(existedTopping);
    }

    // distinct toppings and remove invalid data
    const selectedToppings = [...toppings, ...newToppings].distinctBy("toppingId")?.filter((t) => t.toppingId);
    formItemDetail.setFieldsValue({
      toppings: selectedToppings,
    });

    updateState(formItemDetail);
    setIsChangedForm(!isChangedForm); // re-render
  };

  const updateState = (form) => {
    const newFormValues = form.getFieldsValue();
    updateTotalPrice(newFormValues);
  };

  const updateTotalPrice = (formValues) => {
    const { prices } = productItemDetail;
    const { productPriceId, quantity, toppings } = formValues;
    const currentProductPrice = prices?.find((x) => x.id === productPriceId);
    let totalPrice = 0;
    if (currentProductPrice) {
      totalPrice = currentProductPrice.priceValue;
    }

    // calculate price for selectedToppings
    toppings?.forEach((topping) => {
      if (topping.quantity > 0) {
        totalPrice += topping.priceValue * topping.quantity;
      }
    });

    totalPrice = totalPrice * quantity;
    setTotalPrice(totalPrice);
  };

  const onAddProductItem = () => {
    const formValues = formItemDetail.getFieldsValue();
    const { toppings } = formValues;
    const productItem = {
      ...formValues,
      toppings: toppings?.filter((t) => t.quantity > 0),
    };

    if (onAddToCart) {
      onAddToCart(productItem, false, indexChange);
      setShowProductDetailForm(false);
    }
  };

  const renderProductItemDetail = () => {
    const panels = {
      price: 1,
      option: 2,
      topping: 3,
    };

    const { prices, allOptions } = productItemDetail;
    const isMultiplePrice = prices?.length > 1;

    const renderSinglePrice = () => {
      if (prices) {
        const { id, name, priceValue } = prices[0];
        return (
          <>
            <Row>
              <Col span={24} className="mt-3">
                <Form.Item hidden name="productPriceId" initialValue={id}>
                  <Input />
                </Form.Item>
                <span className="single-price">{formatCurrency(priceValue)}</span>
              </Col>
            </Row>
          </>
        );
      }

      return <></>;
    };

    const renderMultiplePrices = (
      <Form.Item name="productPriceId">
        <Radio.Group className="w-100" onChange={onChangeProductPrice}>
          {prices?.map((price, index) => {
            const stylePriceItem = index % 2 === 0 ? "product-price-item-1" : "product-price-item-2";
            const { id, name, priceValue } = price;
            return (
              <Radio value={id} className={`product-price-item ${stylePriceItem}`}>
                <Row className="product-price">
                  <Col span={12} className="price-name">
                    <span>{name}</span>
                  </Col>
                  <Col span={12} className="price-value">
                    <span>{formatCurrency(priceValue)}</span>
                  </Col>
                </Row>
              </Radio>
            );
          })}
        </Radio.Group>
      </Form.Item>
    );

    const renderOptions = () => {
      return (
        <div>
          {allOptions?.map((option, indexOption) => {
            const { optionId, optionName, optionLevels } = option;
            const defaultOptionLevel = optionLevels?.find((level) => level?.isDefault);
            return (
              <div className="option-item">
                <div className="option-name">
                  <span>{optionName}</span>
                </div>
                <Form.Item hidden name={["options", indexOption, "optionId"]}>
                  <Input />
                </Form.Item>
                <div className="list-option-level">
                  <Form.Item name={["options", indexOption, "optionLevelId"]}>
                    <Radio.Group buttonStyle="solid">
                      {optionLevels?.map((level) => {
                        const { optionLevelId, optionLevelName, isDefault } = level;
                        return (
                          <>
                            <Radio.Button className="option-level-item" value={optionLevelId}>
                              <div className="btn-option-content">
                                <span className="option-level-active-icon">
                                  <SmallCircleDotIcon />
                                </span>
                                <span className="option-level-name">{optionLevelName}</span>
                              </div>
                            </Radio.Button>
                          </>
                        );
                      })}
                    </Radio.Group>
                  </Form.Item>
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    const renderProductToppings = () => {
      const { toppings } = formItemDetail.getFieldsValue();
      const renderQuantityControl = (toppingId, quantity) => {
        if (quantity > 0) {
          return (
            <>
              <button
                className="btn-topping minus"
                onClick={() => {
                  onChangeProductToppingQuantity(toppingId, -1);
                }}
              >
                <MinusIcon className="btn-icon" />
              </button>
              <span className="topping-quantity">{quantity}</span>
              <button
                className="btn-topping plus"
                onClick={() => {
                  onChangeProductToppingQuantity(toppingId, 1);
                }}
              >
                <PlusIcon className="btn-icon" />
              </button>
            </>
          );
        } else {
          return (
            <>
              <button type="button" className="btn-topping minus btn-none"></button>
              <span className="topping-quantity"></span>
              <button
                type="button"
                className="btn-topping plus"
                onClick={() => {
                  onChangeProductToppingQuantity(toppingId, 1);
                }}
              >
                <PlusIcon className="btn-icon" />
              </button>
            </>
          );
        }
      };

      return (
        <div>
          {productToppings?.map((topping, index) => {
            const { toppingId, name, priceValue } = topping;
            const toppingItemStyle = index % 2 !== 0 ? "topping-item-bg" : "";
            const currentQuantity = toppings?.find((t) => t.toppingId === toppingId)?.quantity ?? 0;
            return (
              <Row className={`topping-item ${toppingItemStyle}`}>
                <Col className="topping-name" span={10}>
                  <span>{name}</span>
                </Col>
                <Col className="topping-price" span={6}>
                  <span>{formatCurrency(priceValue)}</span>
                </Col>
                <Col className="topping-select-quantity" span={8}>
                  {renderQuantityControl(toppingId, currentQuantity)}
                </Col>

                <Form.Item hidden name={["toppings", index, "toppingId"]} initialValue={toppingId}></Form.Item>
                <Form.Item hidden name={["toppings", index, "name"]} initialValue={name}></Form.Item>
                <Form.Item hidden name={["toppings", index, "priceValue"]} initialValue={priceValue}></Form.Item>
                <Form.Item hidden name={["toppings", index, "quantity"]} initialValue={0}></Form.Item>
              </Row>
            );
          })}
        </div>
      );
    };

    return (
      <>
        <Form.Item hidden name="productId">
          <Input />
        </Form.Item>
        <Row className="product">
          <Col span={24}>
            <h2 className="name">{productItemDetail?.name}</h2>
          </Col>
          <Col span={24} className="description">
            <Image
              className="image"
              preview={false}
              src={productItemDetail?.thumbnail ?? "error"}
              fallback={productImageDefault}
            />
            <p>{productItemDetail?.description}</p>
          </Col>
        </Row>
        {!isMultiplePrice && renderSinglePrice()}
        <Row>
          <Collapse className="collapse" defaultActiveKey={[panels.price, panels.option, panels.topping]} ghost>
            {isMultiplePrice && (
              <Panel header={<span>{t("productDetail.price")}</span>} key={panels.price} className="panel">
                {renderMultiplePrices}
              </Panel>
            )}
            <Panel header={<span>{t("productDetail.option")}</span>} key={panels.option} className="panel">
              {renderOptions()}
            </Panel>
            <Panel header={<span>{t("productDetail.topping")}</span>} key={panels.topping} className="panel">
              {renderProductToppings()}
            </Panel>
          </Collapse>
        </Row>
      </>
    );
  };

  return (
    <>
      <Form form={formItemDetail}>
        <div className="product-cart-detail-container">
          <input type="checkbox" id="active" className="d-none" checked={showProductDetailForm}></input>
          <div class="wrapper">
            <label for="active" onClick={() => setShowProductDetailForm(false)}>
              <div class="menu-btn">
                <ArrowDoubleRightIcon className="close-icon" />
              </div>
            </label>
            <Row className="float-right cart-item-quantity">
              <div className="btn-minus">
                <button
                  type="button"
                  onClick={() => {
                    if (quantity > 1) {
                      onChangeProductQuantity(quantity - 1);
                    }
                  }}
                >
                  <MinusIcon className="btn-icon" />
                </button>
              </div>
              <div className="item-quantity">
                <Form.Item hidden name="quantity">
                  <Input />
                </Form.Item>
                <span>{quantity}</span>
              </div>
              <div className="btn-plus">
                <button type="button" onClick={() => onChangeProductQuantity(quantity + 1)}>
                  <PlusIcon className="btn-icon" />
                </button>
              </div>
            </Row>
            <div className="wrapper-body-scroll">{renderProductItemDetail()}</div>
            <Row className="footer">
              <Col span={24}>
                <button type="button" className="btn-add-product" onClick={onAddProductItem}>
                  <span className="price">{formatCurrency(totalPrice)}</span>
                  <div className="add-icon">
                    <span className="uppercase">{pageData.btnAdd}</span> <BagIcon />
                  </div>
                </button>
              </Col>
            </Row>
          </div>
        </div>
      </Form>
    </>
  );
});
