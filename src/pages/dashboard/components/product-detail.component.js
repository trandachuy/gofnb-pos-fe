import { ArrowLeftOutlined, CloseOutlined, MinusSquareOutlined, PlusSquareOutlined } from "@ant-design/icons";
import { Badge, Button, Col, Form, Image, Input, InputNumber, Modal, Radio, Row } from "antd";
import productImageDefault from "assets/product-img-default.png";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "utils/helpers";
import "./style.scss";

const { forwardRef, useImperativeHandle } = React;
export const ProductDetail = forwardRef((props, ref) => {
  const [t] = useTranslation();
  const { productDataService, isModalVisible, handleCancel, onAddToCart } = props;
  const [form] = Form.useForm();
  const [toppings, setToppings] = useState([]);
  const [product, setProduct] = useState({});
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
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
  useImperativeHandle(ref, () => ({
    fetchData(data) {
      fetchProductDetail(data);
    },
  }));

  const fetchProductDetail = (productInfo) => {
    if (productInfo) {
      fetchDataProductToppings(productInfo);
      initialFormData(productInfo).then((formValues) => {
        updateTotalPrice(formValues, productInfo);
      });
    }
  };

  const fetchDataProductToppings = (productInfo) => {
    productDataService.getToppingsByProductIdAsync(productInfo?.id).then((res) => {
      if (res) {
        setToppings(res?.productToppings ?? []);
      }
    });
  };

  const initialFormData = async (productInfo) => {
    setProduct(productInfo);

    const formValues = {
      id: productInfo?.id,
      quantity: 1,
      productPriceId: productInfo?.productPrices[0]?.id ?? null,
      options: productInfo?.productOptions?.map((o) => ({
        optionId: o.id ?? null,
        optionLevelId: o.optionLevels[0]?.id ?? null,
        optionName: o.optionLevels[0]?.name ?? null,
      })),
      toppings: [],
    };
    form.setFieldsValue(formValues);

    return formValues;
  };

  /**
   * Handle add order to cart
   */
  const onClickAddOrderItem = () => {
    let orderItem = form.getFieldsValue();
    onAddToCart(orderItem);
    onCancelAddOrderItem();
  };

  /**
   * Handle cancel modal add order item
   */
  const onCancelAddOrderItem = () => {
    setSelectedToppings([]);
    handleCancel();
  };
  //#region Handle change order item quantity

  const onPlus = () => {
    let formValues = form.getFieldsValue();
    let { quantity } = formValues;
    quantity = quantity + 1;

    const newFormValues = { ...formValues, quantity };
    form.setFieldsValue(newFormValues);

    updateTotalPrice(newFormValues, product);
  };

  const onMinus = () => {
    let formValues = form.getFieldsValue();
    let { quantity } = formValues;
    if (quantity > 1) {
      quantity = quantity - 1;

      const newFormValues = { ...formValues, quantity };
      form.setFieldsValue(newFormValues);

      updateTotalPrice(newFormValues, product);
    }
  };
  //#endregion

  /**
   * Handle click add topping to order item
   * @param {*} item
   */
  const onClickAddTopping = (item) => {
    let formValues = form.getFieldsValue();
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

    setSelectedToppings(newSelectedToppings);

    const newFormValues = { ...formValues, toppings: newSelectedToppings };
    form.setFieldsValue(newFormValues);

    updateTotalPrice(newFormValues, product);
  };

  const onDeleteTopping = (item) => {
    let restToppings = selectedToppings.filter((x) => x.toppingId !== item.toppingId);
    setSelectedToppings(restToppings);

    let formValues = form.getFieldsValue();

    const newFormValues = { ...formValues, toppings: restToppings };
    form.setFieldsValue(newFormValues);

    updateTotalPrice(newFormValues, product);
  };

  //#region Handle add topping to order item
  const onPlusTopping = (index) => {
    let formValues = form.getFieldsValue();
    let { toppings } = formValues;
    if (toppings) {
      toppings[index].quantity = toppings[index].quantity + 1;

      setSelectedToppings(toppings);

      const newFormValues = { ...formValues, toppings: toppings };
      form.setFieldsValue(newFormValues);

      updateTotalPrice(newFormValues, product);
    }
  };

  const onMinusTopping = (index) => {
    let formValues = form.getFieldsValue();
    let { toppings } = formValues;
    if (toppings) {
      if (toppings[index].quantity > 1) {
        toppings[index].quantity = toppings[index].quantity - 1;

        setSelectedToppings(toppings);

        const newFormValues = { ...formValues, toppings: toppings };
        form.setFieldsValue(newFormValues);

        updateTotalPrice(newFormValues, product);
      }
    }
  };
  //#endregion

  /**
   * Select product price
   * @param {*} e
   */
  const onChangeProductPrice = (e) => {
    let productPriceId = e.target.value;
    let formValues = form.getFieldsValue();

    const newFormValues = { ...formValues, productPriceId: productPriceId };
    form.setFieldsValue(newFormValues);

    updateTotalPrice(newFormValues, product);
  };

  const updateTotalPrice = (formValues, productInfo) => {
    const { productPrices } = productInfo;
    const { productPriceId, quantity } = formValues;
    const currentProductPrice = productPrices.find((x) => x.id === productPriceId);
    let totalPrice = 0;
    if (currentProductPrice) {
      totalPrice = currentProductPrice.priceValue;
    }

    if (formValues.toppings) {
      /// find toppings from form values toppings by topping id
      let selectedToppings = [];
      toppings.forEach((topping) => {
        let toppingExisted = formValues.toppings.find((x) => x.toppingId === topping.toppingId);
        if (toppingExisted) {
          selectedToppings.push({
            ...topping,
            quantity: toppingExisted.quantity,
          });
        }
      });

      // calculate price for selectedToppings
      selectedToppings.forEach((topping) => {
        let currentTopping = toppings.find((x) => x.toppingId === topping.toppingId);
        if (currentTopping) {
          totalPrice += currentTopping.priceValue * topping.quantity;
        }
      });
    }

    totalPrice = totalPrice * quantity;
    setTotalPrice(totalPrice);
  };

  const onChangOption = (e, indexOption) => {
    let optionId = e.target.value;
    let formValues = form.getFieldsValue();
    let optionSelected = product?.productOptions[indexOption]?.optionLevels.filter((a) => a.id === optionId);
    const newFormValues = {
      ...formValues,
      options: product?.productOptions?.map((o) => ({
        optionId: optionSelected[0].optionId ?? null,
        optionLevelId: optionSelected[0]?.id ?? null,
        optionName: optionSelected[0]?.name ?? null,
        name: optionSelected[0]?.name ?? null,
      })),
    };
    form.setFieldsValue(newFormValues);

    updateTotalPrice(newFormValues, product);
  };

  return (
    <Modal closeIcon visible={isModalVisible} footer={(null, null)} width={"80%"}>
      <Form form={form}>
        <Row gutter={[24, 24]}>
          <Col span={16}>
            <div>
              <h3 onClick={() => onCancelAddOrderItem()}>
                <ArrowLeftOutlined />
                <span className="ml-1">{pageData.back}</span>
              </h3>
            </div>
            <div className="mt-3">
              <Row gutter={[16, 16]} className="ml-2">
                <Col span={6}>
                  <Image
                    width={150}
                    preview={false}
                    src={product?.thumbnail ?? "error"}
                    fallback={productImageDefault}
                  />
                  <div className="mt-3">
                    <Row gutter={[16, 16]}>
                      <Col span={4}>
                        <MinusSquareOutlined onClick={onMinus} className="fs-25" />
                      </Col>
                      <Col span={10} className="text-center">
                        <Form.Item name={["quantity"]}>
                          <InputNumber readOnly className="border-none antd-input-text-center"></InputNumber>
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <PlusSquareOutlined onClick={onPlus} className="fs-25 text-left" />
                      </Col>
                    </Row>
                  </div>
                </Col>
                <Col span={18}>
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                </Col>
              </Row>
            </div>
            <div className="mt-3">
              <h2>{pageData.price.title}</h2>
              <Row gutter={[16, 16]} className="ml-2">
                <Form.Item name={["productPriceId"]}>
                  <Radio.Group buttonStyle="solid">
                    {product.productPrices?.map((price) => {
                      return (
                        <Radio.Button value={price.id} onChange={(e) => onChangeProductPrice(e)}>
                          {price.priceName && price.priceName !== "" ? price?.priceName + " - " : ""}
                          {formatCurrency(price?.priceValue)}
                        </Radio.Button>
                      );
                    })}
                  </Radio.Group>
                </Form.Item>
              </Row>
            </div>
            {(product.productOptions && product.productOptions.length) > 0 && (
              <div className="mt-3">
                <h2>{pageData.option.title}</h2>
                <Row gutter={[16, 16]} className="ml-2">
                  {product.productOptions?.map((option, indexOption) => {
                    return (
                      <>
                        <Col span={4}>
                          <h3>{option?.name}</h3>
                        </Col>
                        <Col span={20}>
                          <Row gutter={[16, 16]}>
                            <Form.Item hidden name={["options", indexOption, "optionId"]}>
                              <Input hidden value={option.id}></Input>
                            </Form.Item>
                            <Form.Item hidden name={["options", indexOption, "name"]}>
                              <Input hidden value={option.name}></Input>
                            </Form.Item>
                            <Form.Item name={["options", indexOption, "optionLevelId"]}>
                              <Radio.Group buttonStyle="solid">
                                {option?.optionLevels?.map((level) => {
                                  return (
                                    <Radio.Button
                                      className="radio-style"
                                      value={level.id}
                                      onChange={(e) => onChangOption(e, indexOption)}
                                    >
                                      {level?.isSetDefault && <Badge status="warning" size="large" />}
                                      {level?.name}
                                    </Radio.Button>
                                  );
                                })}
                              </Radio.Group>
                            </Form.Item>
                          </Row>
                        </Col>
                      </>
                    );
                  })}
                </Row>
              </div>
            )}
          </Col>
          <Col span={8}>
            <h2 className="text-center">{pageData.topping.title}</h2>
            <div className="topping-list">
              {toppings?.map((item) => {
                return (
                  <h4 className="bd-c pointer mt-2" onClick={() => onClickAddTopping(item)}>
                    <span className="ml-2">{item.name}</span>
                    <span className="float-right mr-2">{formatCurrency(item.priceValue)}</span>
                  </h4>
                );
              })}
            </div>
            {selectedToppings && selectedToppings.length > 0 && <div className="float-center mt-2 bd-c-t"></div>}
            <div>
              {selectedToppings?.map((item, index) => {
                let renderTopping = (
                  <>
                    <h4 className="ml-2">
                      <Row>
                        <Col span={10}>
                          <span>{item.name}</span>
                        </Col>
                        <Col span={12}>
                          <div className="ml-1">
                            <Row gutter={[16, 16]}>
                              <Col span={4}>
                                <MinusSquareOutlined onClick={() => onMinusTopping(index)} className="fs-25" />
                              </Col>
                              <Col span={10} className="text-center">
                                <Form.Item name={["toppings", index, "quantity"]}>
                                  <InputNumber
                                    style={{ width: "50px" }}
                                    readOnly
                                    className="border-none antd-input-text-center"
                                  ></InputNumber>
                                </Form.Item>
                              </Col>
                              <Col span={4}>
                                <PlusSquareOutlined onClick={() => onPlusTopping(index)} className="fs-25 text-left" />
                              </Col>
                            </Row>

                            <Form.Item hidden name={["toppings", index, "toppingId"]}></Form.Item>
                            <Form.Item hidden name={["toppings", index, "name"]}></Form.Item>
                            <Form.Item hidden name={["toppings", index, "priceValue"]}></Form.Item>
                          </div>
                        </Col>
                        <Col className="pointer" span={2} onClick={() => onDeleteTopping(item)}>
                          <CloseOutlined className="fs-16 color-red" />
                        </Col>
                      </Row>
                    </h4>
                  </>
                );
                return renderTopping;
              })}
            </div>
          </Col>
        </Row>
        <Row className="float-center mt-2 bd-c-t"></Row>
        <Row>
          <Col span={24}>
            <Button className="float-right" type="primary" onClick={() => onClickAddOrderItem()} danger>
              {totalPrice && totalPrice > 0 ? (
                <>
                  {formatCurrency(totalPrice)}
                  <span className="ml-2">- {pageData.add}</span>
                </>
              ) : (
                <span className="ml-2">{pageData.add}</span>
              )}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
});
