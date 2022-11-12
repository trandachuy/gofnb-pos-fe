import { Col, Collapse, Form, Image, Input, Radio, Row } from "antd";
import productImageDefault from "assets/product-img-default.png";
import { ArrowDoubleRightIcon, BagIcon, MinusIcon, PlusIcon, SmallCircleDotIcon } from "constants/icons.constants";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "utils/helpers";
import "./combo-product-detail.component.scss";

/// Product detail dialog for combo product
export const ComboProductDetailComponent = React.forwardRef(({ onAdd }, ref) => {
  const [t] = useTranslation();

  const [form] = Form.useForm();
  const [toppings, setToppings] = useState([]);
  const [product, setProduct] = useState({});
  const [visible, setVisible] = useState(false);

  const [productPriceIdSelected, setProductPriceIdSelected] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const pageData = {
    back: t("productDetail.back"),
    add: t("productDetail.add"),
    price: {
      title: t("productDetail.price"),
    },
    option: {
      title: t("productDetail.option"),
    },
    topping: {
      title: t("productDetail.topping"),
    },
    note: t("productDetail.note"),
  };

  /**
   * Forward function to ref
   */
  React.useImperativeHandle(ref, () => ({
    // Initialize data for product detail dialog
    fetchData(data) {
      fetchProductDetail(data);
    },
    // Set state for combo product detail and show dialog
    setData(productDetailData, productToppings) {
      const { selectedToppings, selectedOptions, productPriceIdSelected } = productDetailData;
      setToppings(productToppings);
      setSelectedToppings(selectedToppings);
      setSelectedOptions(selectedOptions);

      const formValues = form.getFieldsValue();
      if (formValues?.options) {
        const newFormValues = {
          ...formValues,
          options: selectedOptions?.map((o) => ({
            optionName: o.name ?? null,
            optionId: o.id ?? null,
            optionLevelId: o.optionLevelId ?? null,
          })),
        };

        form.setFieldsValue(newFormValues);
      }

      setProductPriceIdSelected(productPriceIdSelected);
      setVisible(true);
    },
    close() {
      setVisible(false);
    },
  }));

  function fetchProductDetail(productInfo) {
    if (productInfo) {
      initialFormData(productInfo);
    }
  }

  function initialFormData(productInfo) {
    setProduct(productInfo);

    if (selectedOptions?.length > 0) {
      const formValues = {
        id: productInfo?.id,
        quantity: 1,
        productPriceId: null,
        options: selectedOptions?.map((o) => ({
          optionName: o.name ?? null,
          optionId: o.id ?? null,
          optionLevelId: o.optionLevelId ?? null,
        })),
      };

      form.setFieldsValue(formValues);

      return formValues;
    } else {
      const formValues = {
        id: productInfo?.id,
        quantity: 1,
        productPriceId: null,
        options: productInfo?.productOptions?.map((o) => ({
          optionName: o.name ?? null,
          optionId: o.id ?? null,
          optionLevelId: o.optionLevels[0]?.id ?? null,
        })),
      };

      form.setFieldsValue(formValues);
      return formValues;
    }
  }

  function onAddToppingsOptions() {
    const { productOptions } = product;
    const formValues = form.getFieldsValue();

    // mapping options from form to option models
    let options = [];
    formValues?.options?.forEach((item) => {
      const optionSelected = productOptions?.find((o) => o.optionLevels.find((ol) => ol.id === item.optionLevelId));
      const optionLevelSelected = optionSelected?.optionLevels.find((ol) => ol.id === item.optionLevelId);
      if (optionSelected && optionLevelSelected) {
        const option = {
          ...optionLevelSelected,
          id: optionSelected?.id,
          name: optionSelected?.name,
          optionLevelId: optionLevelSelected?.id,
          optionLevelName: optionLevelSelected?.name,
        };

        options.push(option);
      }
    });

    let toppingAndOption = {
      productPriceId: productPriceIdSelected,
      toppings: selectedToppings?.filter((t) => t.quantity > 0),
      options: options,
    };

    if (onAdd) {
      onAdd(toppingAndOption);
      setVisible(false);
      form.resetFields();
    }
  }

  //#region Handle add topping to order item
  function onPlusTopping(item) {
    let newSelectedToppings = [];
    let newTopping = {
      ...item,
      quantity: 1,
    };

    let toppingExisted = selectedToppings?.find((x) => x.toppingId === item.toppingId);
    if (toppingExisted) {
      newTopping = {
        ...toppingExisted,
        quantity: toppingExisted.quantity + 1,
      };
      newSelectedToppings = selectedToppings?.map((i) => (i.toppingId === item.toppingId ? newTopping : i));
    } else {
      newSelectedToppings = [...selectedToppings, newTopping];
    }

    const arrayUniqueByKey = newSelectedToppings.distinctBy("toppingId");
    setSelectedToppings(arrayUniqueByKey);
  }

  function onMinusTopping(item) {
    let newSelectedToppings = [];
    let newTopping = {
      ...item,
      quantity: 0,
    };

    let toppingExisted = selectedToppings?.find((x) => x.toppingId === item.toppingId);
    if (toppingExisted && toppingExisted.quantity > 0) {
      newTopping = {
        ...toppingExisted,
        quantity: toppingExisted.quantity - 1,
      };
      newSelectedToppings = selectedToppings?.map((i) => (i.toppingId === item.toppingId ? newTopping : i));
    } else {
      newSelectedToppings = [...selectedToppings, newTopping];
    }

    const arrayUniqueByKey = newSelectedToppings.distinctBy("toppingId");
    setSelectedToppings(arrayUniqueByKey);
  }
  //#endregion

  const calculateToppingsTotalPrice = () => {
    if (selectedToppings) {
      let totalPrice = 0;
      selectedToppings.forEach((t) => {
        totalPrice += t.quantity * t.priceValue;
      });

      return totalPrice;
    }

    return 0;
  };

  const panels = {
    option: 2,
    topping: 3,
  };

  const renderOptions = (product) => {
    return (
      <div>
        {product?.productOptions?.map((option, indexOption) => {
          const { id, name, optionLevels } = option;
          const defaultOptionLevel = optionLevels?.find((level) => level?.isSetDefault === true);
          return (
            <div className="option-item">
              <Form.Item hidden name={["options", indexOption, "optionId"]} initialValue={option?.id}>
                <Input />
              </Form.Item>
              <div className="option-name">
                <span>{name}</span>
              </div>
              <div className="list-option-level">
                <Form.Item name={["options", indexOption, "optionLevelId"]}>
                  <Radio.Group buttonStyle="solid" defaultValue={defaultOptionLevel?.id.toLowerCase()}>
                    {optionLevels?.map((optionLevel) => {
                      return (
                        <>
                          <Radio.Button className="option-level-item" value={optionLevel?.id}>
                            <div className="btn-option-content">
                              <span className="option-level-active-icon">
                                <SmallCircleDotIcon />
                              </span>
                              <span className="option-level-name">{optionLevel?.name}</span>
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

  function renderProductToppings() {
    const renderQuantityControl = (topping, quantity) => {
      if (quantity > 0) {
        return (
          <>
            <button
              className="btn-topping minus"
              type="button"
              onClick={() => {
                onMinusTopping(topping);
              }}
            >
              <MinusIcon className="btn-icon" />
            </button>
            <span className="topping-quantity">{quantity}</span>
            <button
              className="btn-topping plus"
              type="button"
              onClick={() => {
                onPlusTopping(topping);
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
                onPlusTopping(topping);
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
        {toppings?.map((topping, index) => {
          const { toppingId, name, priceValue } = topping;
          const toppingItemStyle = index % 2 !== 0 ? "topping-item-bg" : "";
          const currentQuantity = selectedToppings?.find((t) => t.toppingId === toppingId)?.quantity ?? 0;
          return (
            <Row className={`topping-item ${toppingItemStyle}`}>
              <Col className="topping-name" span={10}>
                <span>{name}</span>
              </Col>
              <Col className="topping-price" span={6}>
                <span>{formatCurrency(priceValue)}</span>
              </Col>
              <Col className="topping-select-quantity" span={8}>
                {renderQuantityControl(topping, currentQuantity)}
              </Col>
            </Row>
          );
        })}
      </div>
    );
  }

  return (
    <Form form={form} className="combo-product">
      <div className="product-cart-detail-container">
        <input type="checkbox" id="active" className="d-none" checked={visible}></input>
        <div class="wrapper">
          <label for="active" onClick={() => setVisible(false)}>
            <div class="menu-btn">
              <ArrowDoubleRightIcon className="close-icon" />
            </div>
          </label>
          <div className="wrapper-body-scroll">
            <Row className="product">
              <Col span={24}>
                <h2 className="name">{product?.name}</h2>
              </Col>
              <Col span={24} className="description">
                <Image
                  className="image"
                  preview={false}
                  src={product?.thumbnail ?? "error"}
                  fallback={productImageDefault}
                />
                <p>{product?.description}</p>
              </Col>
            </Row>
            <Row>
              <Collapse className="collapse" defaultActiveKey={[panels.option, panels.topping]} ghost>
                <Collapse.Panel header={<span>{t("productDetail.option")}</span>} key={panels.option} className="panel">
                  {renderOptions(product)}
                </Collapse.Panel>
                <Collapse.Panel
                  header={<span>{t("productDetail.topping")}</span>}
                  key={panels.topping}
                  className="panel"
                >
                  {renderProductToppings()}
                </Collapse.Panel>
              </Collapse>
            </Row>
          </div>

          <Row className="footer">
            <Col span={24}>
              <button type="button" className="btn-add-product" onClick={onAddToppingsOptions}>
                <span className="price">{formatCurrency(calculateToppingsTotalPrice())}</span>
                <div className="add-icon">
                  <span className="uppercase">{pageData.add}</span> <BagIcon />
                </div>
              </button>
            </Col>
          </Row>
        </div>
      </div>
    </Form>
  );
});
