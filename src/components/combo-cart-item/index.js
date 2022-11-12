import { Col, Row, Typography } from "antd";
import { IconVectorRight } from "constants/icons.constants";
import { executeAfter, formatCurrency } from "utils/helpers";
import "./index.scss";
const { Paragraph } = Typography;

export const ComboCartItem = (props) => {
  const { product, index } = props;
  const expandProductItem = (index) => {
    let iconControl = document.getElementById(`icon-expand-${index}`);
    if (iconControl) {
      let expandClass = iconControl.classList.contains("product-expand");
      let collapseClass = iconControl.classList.contains("product-collapse");
      let productItemDiv = document.getElementById(`product-item-${index}`);
      let expandContent = productItemDiv.querySelectorAll(".content-expand-product-item");

      if (expandClass) {
        iconControl.classList.remove("product-expand");
        iconControl.classList.remove("stop-animation");
        iconControl.classList.add("product-collapse");
        executeAfter(300, async () => {
          iconControl.classList.add("stop-animation");
          productItemDiv.classList.remove("product-item-border");
          expandContent.forEach((item) => {
            item.classList.remove("expand-product-content");
          });
        });
      }
      if (collapseClass) {
        iconControl.classList.remove("product-collapse");
        iconControl.classList.remove("stop-animation");
        iconControl.classList.add("product-expand");
        executeAfter(300, async () => {
          iconControl.classList.add("stop-animation");
          productItemDiv.classList.add("product-item-border");
          expandContent.forEach((item) => {
            item.classList.add("expand-product-content");
          });
        });
      }
      if (expandClass === false && collapseClass === false) {
        iconControl.classList.remove("stop-animation");
        iconControl.classList.add("product-expand");
        executeAfter(300, async () => {
          iconControl.classList.add("stop-animation");
          productItemDiv.classList.add("product-item-border");
          expandContent.forEach((item) => {
            item.classList.add("expand-product-content");
          });
        });
      }
    }
  };

  return (
    <>
      <div className="combo-cart-item-style">
        <div key={index} className="group-button-and-product-item">
          <div
            className={`product-item-combo product-item ${(index + 1) % 2 === 0 && "product-item-even"}`}
            id={`product-item-${index}`}
          >
            <Row className="combo-group">
              <Col span={24} className="content-product-item margin-top-content">
                <Row>
                  <Col span={3} className={`icon-expand-product-item bold-text`}>
                    <IconVectorRight
                      className="icon-expand"
                      id={`icon-expand-${index}`}
                      onClick={() => expandProductItem(index)}
                    />
                  </Col>
                  <Col span={7} className="product-item-name bold-text">
                    <Paragraph
                      ellipsis={{
                        rows: 2,
                        tooltip: product?.comboName,
                      }}
                      className="product-item-name"
                    >
                      <span>{product?.comboName}</span>
                    </Paragraph>
                    {product?.priceAfterDiscount !== product?.originalPrice && (
                      <>
                        <div className="discount-value-margin"></div>
                        {product?.promotion?.name && (
                          <span className="product-discount">
                            {product?.promotion?.isPercentDiscount
                              ? formatCurrency(product?.promotion?.discountValue)
                              : product?.promotion?.percentNumber + "%"}
                          </span>
                        )}
                      </>
                    )}
                  </Col>
                  <Col span={7} className="modify-amount bold-text">
                    <span className="amount-product-item">{`x${product?.quantity}`}</span>
                  </Col>
                  <Col span={7} className="currency-product-item bold-text">
                    {formatCurrency(product?.priceAfterDiscount)}
                    {product?.priceAfterDiscount === product?.originalPrice ? (
                      ""
                    ) : (
                      <>
                        <br />
                        <span className="price-discount-value">{formatCurrency(product?.originalPrice)}</span>
                      </>
                    )}
                  </Col>
                </Row>
              </Col>

              {product?.comboItems.map((comboItem, index) => {
                if (index < 2) {
                  return (
                    <>
                      <Col span={24} className="content-expand-product-item">
                        <br />
                        <Row gutter={[0, 16]}>
                          <Col span={3}></Col>
                          <Col span={21} className="content-topping">
                            <Row
                              className={`product-combo-group ${
                                comboItem?.toppings?.length > 0 || comboItem?.options?.length > 0 ? "border-top" : ""
                              }`}
                            >
                              <Col span={24} className="product-item-name pl-3">
                                <Paragraph
                                  ellipsis={{
                                    rows: 2,
                                    tooltip: comboItem?.itemName,
                                  }}
                                  className="product-item-name product-item-name-combo"
                                >
                                  {comboItem?.itemName}
                                </Paragraph>
                              </Col>
                            </Row>
                            {(comboItem?.toppings?.length > 0 || comboItem?.options?.length > 0) && (
                              <Row gutter={[0, 16]} className={`group-option-topping`}>
                                {comboItem?.toppings?.map((comboItemTopping, index) => {
                                  return (
                                    <>
                                      <Col key={index} span={24} className="content-expand-product-item">
                                        <Row className="option-topping">
                                          <Col span={12} className="product-item-name pl-3">
                                            {comboItemTopping?.name}
                                          </Col>
                                          <Col span={12} className="modify-amount bold-text">
                                            x{comboItemTopping?.quantity}
                                          </Col>
                                        </Row>
                                      </Col>
                                    </>
                                  );
                                })}
                                {comboItem?.options?.map((comboItemOption, index) => {
                                  return (
                                    <>
                                      <Col key={index} span={24} className="content-expand-product-item">
                                        <Row className="option-topping">
                                          <Col span={12} className="product-item-name pl-3">
                                            {comboItemOption?.optionName}
                                          </Col>
                                          <Col span={12} className="modify-amount bold-text">
                                            {comboItemOption?.optionLevelName}
                                          </Col>
                                        </Row>
                                      </Col>
                                    </>
                                  );
                                })}
                              </Row>
                            )}
                          </Col>
                        </Row>
                      </Col>
                    </>
                  );
                }
              })}
              <Col span={24} className="margin-bottom-content"></Col>
            </Row>
          </div>
        </div>
      </div>
    </>
  );
};
