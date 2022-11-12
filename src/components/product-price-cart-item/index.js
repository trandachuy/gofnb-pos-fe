import { Col, Row, Typography } from "antd";
import { IconVectorRight } from "constants/icons.constants";
import { executeAfter, formatCurrency } from "utils/helpers";
import "./index.scss";
const { Paragraph } = Typography;

export const ProductPriceCartItem = (props) => {
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
      <div className="product-price-cart-item-style">
        <div className="group-button-and-product-item">
          <div className={`product-item ${(index + 1) % 2 === 0 && "product-item-even"}`} id={`product-item-${index}`}>
            <Row className="order-not-combo">
              <Col span={24} className="margin-top-content"></Col>
              <Col span={24} className="content-product-item">
                <Row>
                  <Col
                    span={3}
                    className={`icon-expand-product-item bold-text ${
                      product.toppings?.length > 0 || product.options?.length > 0 ? "" : "opacity-text"
                    }`}
                  >
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
                        tooltip: product?.itemName,
                      }}
                      className="product-item-name"
                      onClick={() => {
                        // editProduct(product);
                      }}
                    >
                      {product?.itemName}
                    </Paragraph>

                    {product?.priceAfterDiscount !== product?.originalPrice && (
                      <>
                        {product?.promotion?.name && (
                          <>
                            <div className="discount-value-margin"></div>
                            {product?.promotion?.name && (
                              <span className="product-discount">
                                {product?.promotion?.isPercentDiscount
                                  ? product?.promotion?.percentNumber + "%"
                                  : formatCurrency(product?.promotion?.discountValue)}
                              </span>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </Col>
                  <Col span={7} className="modify-amount bold-text">
                    <span className="amount-product-item">{`x${product?.quantity}`}</span>
                  </Col>
                  <Col span={7} className="currency-product-item bold-text">
                    {formatCurrency(product?.priceAfterDiscount)}
                    {(product?.priceAfterDiscount === product?.originalPrice || !product?.isCombo) ? (
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

              {product.toppings?.map((topping, index) => {
                const toppingQuantity = `x${topping?.quantity}`;
                return (
                  <>
                    <Col span={24} className="content-expand-product-item">
                      <br />
                      <Row>
                        <Col span={3} className="icon-expand-product-item bold-text"></Col>
                        <Col span={7} className="product-item-name">
                          {topping?.name}
                        </Col>
                        <Col span={7} className="modify-amount bold-text">
                          {toppingQuantity}
                        </Col>
                      </Row>
                    </Col>
                  </>
                );
              })}

              {product.options?.map((option, index) => {
                return (
                  <>
                    <Col span={24} className="content-expand-product-item">
                      <br />
                      <Row>
                        <Col span={3} className="icon-expand-product-item bold-text"></Col>
                        <Col span={7} className="product-item-name">
                          {option?.optionName}
                        </Col>
                        <Col span={7} className="modify-amount bold-text">
                          {option?.optionLevelName}
                        </Col>
                        <Col span={7} className="currency-product-item bold-text"></Col>
                      </Row>
                    </Col>
                  </>
                );
              })}
              <Col span={24} className="margin-bottom-content"></Col>
            </Row>
          </div>
        </div>
      </div>
    </>
  );
};
