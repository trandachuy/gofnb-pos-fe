import { EllipsisOutlined } from "@ant-design/icons";
import { Col, Image, Modal, Row } from "antd";
import comboImageDefault from "assets/combo-img-default.png";
import { ComboType } from "constants/combo.constants";
import { SubtractIcon } from "constants/icons.constants";
import comboDataService from "data-services/combo/combo-data.service";
import React, { useState } from "react";
import { formatCurrencyWithSymbol } from "utils/helpers";

const maxNumberToShowProduct = 2;

export const ComboCardComponent = React.forwardRef((props, ref) => {
  const { initData, onAddToCart, comboDetailRef, addOrderCartCache } = props;
  const [showViewMoreDetail, setShowViewMoreDetail] = useState(false);
  const [dataModal, setDataModal] = useState({});

  /// Get combo detail
  const onClickCombo = (comboId) => {
    if (comboDetailRef && comboDetailRef.current) {
      comboDetailRef.current.open(comboId);
    }
  };

  /// Handle quick add combo to cart from plus icon
  const onClickAddDefaultComboToCard = (data) => {
    comboDataService
      .getProductsByComboIdAsync(data?.id)
      .then((result) => {
        //save cache
        /// Set combo detail to state
        const { comboProductPrices } = result?.combo;
        const isSpecificCombo = comboProductPrices && comboProductPrices !== null && comboProductPrices?.length > 0;
        let currentComboProductGroupProductPrices =
          isSpecificCombo === true
            ? []
            : result?.combo?.comboProductGroups?.map((i) => {
                return {
                  groupId: i?.id,
                  productCategoryId: i?.productCategoryId,
                  productCategoryName: i?.productCategoryName,
                  quantity: i?.quantity,
                  ...i.comboProductGroupProductPrices[0],
                };
              });
        const comboDetail = {
          ...result?.combo,
          quantity: 1,
          isSpecificCombo: isSpecificCombo,
          currentComboProductGroupProductPrices: currentComboProductGroupProductPrices,
        };
        addOrderCartCache({
          ...comboDetail,
          key: result?.combo?.id,
        });
        if (result.isSuccess) {
          // handle for Flexible combo
          if (result?.combo?.comboPricings.length > 0 && result?.combo?.comboProductPrices?.length <= 0) {
            let comboItemsGroup = [];
            let comboProductGroups = result?.combo?.comboProductGroups;
            comboProductGroups.forEach((productGroup) => {
              let comboProductGroupProductPrices = productGroup?.comboProductGroupProductPrices[0];
              let productInfo = {
                priceValue: comboProductGroupProductPrices?.productPrice?.priceValue,
                productId: comboProductGroupProductPrices?.productPrice?.productId,
                productName: comboProductGroupProductPrices?.productPrice?.product?.name,
                productPriceId: comboProductGroupProductPrices?.productPriceId,
                options: comboProductGroupProductPrices?.productPrice?.product?.productOptions?.map((option) => {
                  return {
                    optionId: option?.optionId,
                    optionLevelId: option?.optionLevelId,
                  };
                }),
              };

              comboItemsGroup.push(productInfo);
            });

            let orderItem = {
              comboId: result?.combo?.id,
              comboName: result?.combo?.name,
              quantity: 1,
              comboItems: comboItemsGroup,
              originalPrice: result?.combo?.originalPrice,
              sellingPrice: result?.combo?.sellingPrice,
              comboPricingId: result?.combo?.comboPricingId,
            };

            onAddToCart(orderItem, true);
          }

          // handle for Specific combo
          if (result?.combo?.comboProductPrices?.length > 0 && result?.combo?.comboPricings.length <= 0) {
            let comboItemsPrices = [];
            let productPrices = result?.combo?.comboProductPrices;
            let originalPrice = 0;
            productPrices.forEach((item) => {
              originalPrice += item?.priceValue;
              let productInfo = {
                priceValue: item?.priceValue,
                productId: item?.productPrice?.productId,
                productName: item?.productPrice?.product?.name,
                productPriceId: item?.productPriceId,
                options: item?.productPrice?.product?.productOptions?.map((option) => {
                  return {
                    optionId: option?.optionId,
                    optionLevelId: option?.optionLevelId,
                  };
                }),
              };
              comboItemsPrices.push(productInfo);
            });
            let orderItemPrices = {
              comboId: result?.combo?.id,
              comboName: result?.combo?.name,
              quantity: 1,
              comboItems: comboItemsPrices,
              itemName: productPrices?.comboName,
              originalPrice: originalPrice,
              sellingPrice: result?.combo?.sellingPrice,
            };
            onAddToCart(orderItemPrices, true);
          }
        }
      })
      .catch((er) => {
        console.log("error >>", er);
      });
  };

  const calculatorOriginalPriceComboSpecific = (comboProductPrices) => {
    const originalPrice = comboProductPrices?.reduce((a, v) => (a = a + v.priceValue), 0);
    return originalPrice;
  };

  const renderButtonShowProduct = (id) => {
    return (
      <button
        type="button"
        id={`btn-show-more-${id}`}
        onClick={(e) => showMoreDetailDialog(e)}
        className="btn-show-more"
      >
        <EllipsisOutlined />
      </button>
    );
  };

  const showMoreDetailDialog = (e) => {
    e.stopPropagation();
    setShowViewMoreDetail(true);

    const data = mappingModalData();
    setDataModal(data);
  };

  const hideMoreDetailDialog = () => {
    setShowViewMoreDetail(false);
    setDataModal({});
  };

  const mappingModalData = () => {
    let originalPrice;
    let sellingPrice;

    if (initData?.comboTypeId === 1) {
      sellingPrice = initData?.sellingPrice;
      originalPrice = calculatorOriginalPriceComboSpecific(initData?.comboProductPrices);
    } else {
      sellingPrice = initData?.comboPricings[0]?.sellingPrice;
      originalPrice = initData?.comboPricings[0]?.originalPrice;
    }

    let dataSource = {
      name: initData?.name,
      originalPrice: originalPrice,
      sellingPrice: sellingPrice,
      products: [],
    };
    if (initData?.comboTypeId === ComboType.Specific) {
      initData?.comboProductPrices?.map((item) => {
        let data = {
          productName: "",
        };
        if (item?.priceName) {
          data.productName = `${item?.productPrice?.product?.name} (${item?.priceName})`;
        } else {
          data.productName = item?.productPrice?.product?.name;
        }
        dataSource.products.push(data);
      });
    } else {
      initData?.comboProductGroups?.map((item) => {
        item?.comboProductGroupProductPrices?.map((item2) => {
          let data = {
            productName: "",
          };

          if (item2?.productPrice?.priceName) {
            data.productName = `${item2?.productPrice?.product?.name} (${item2?.productPrice?.priceName})`;
          } else {
            data.productName = item2?.productPrice?.product?.name;
          }
          dataSource.products.push(data);
        });
      });
    }
    return dataSource;
  };

  function renderViewMoreDetailComponent() {
    return (
      <Modal
        className="product-in-combo-modal"
        title={
          <Row>
            <Col className="header-title-modal" span={20}>
              {dataModal?.name}
            </Col>
          </Row>
        }
        visible={showViewMoreDetail}
        footer={null}
        onCancel={hideMoreDetailDialog}
      >
        <Row className="modal-price-info">
          <Col span={24} className="selling-price">
            {formatCurrencyWithSymbol(dataModal?.sellingPrice)}
          </Col>
          <Col span={24} className="original-price">
            {formatCurrencyWithSymbol(dataModal?.originalPrice)}
          </Col>
        </Row>
        <Row className="modal-product-info">
          <Col span={24}>
            <ul className="list-product-in-combo">
              {dataModal?.products?.map((item) => {
                return (
                  <li className="product-in-combo">
                    <span>{item?.productName}</span>
                  </li>
                );
              })}
            </ul>
          </Col>
        </Row>
      </Modal>
    );
  }

  return (
    <>
      <div className="product-card-dashboard-wrapper">
        <div className="product-card-dashboard" onClick={() => onClickCombo(initData?.id)}>
          <div className="product-card-img">
            <Image preview={false} src={initData?.thumbnail ?? "error"} fallback={comboImageDefault} />
          </div>
          <div className="product-card-content">
            <h3 className="text-line-clamp-2 combo-name">{initData?.name}</h3>
            {initData?.comboTypeId === 1 ? (
              <ul className="list-product-default-in-combo">
                {initData?.comboProductPrices?.map((item, index) => {
                  if (index < maxNumberToShowProduct) {
                    return (
                      <>
                        {item?.priceName ? (
                          <li className="product-default-item">{`${item?.productPrice?.product?.name} (${item?.priceName})`}</li>
                        ) : (
                          <li className="product-default-item">{`${item?.productPrice?.product?.name}`}</li>
                        )}
                      </>
                    );
                  }
                })}
                {initData?.comboProductPrices?.length > maxNumberToShowProduct && renderButtonShowProduct(initData?.id)}
              </ul>
            ) : (
              <ul className="list-product-default-in-combo">
                {initData?.comboPricings[0]?.comboName?.split(" | ").map((item, index) => {
                  if (index < maxNumberToShowProduct) {
                    return <li className="product-default-item">{item}</li>;
                  }
                })}
                {initData?.comboPricings?.length > maxNumberToShowProduct && renderButtonShowProduct(initData?.id)}
              </ul>
            )}
            <div className="product-card-content-footer">
              {initData?.comboTypeId === 1 ? (
                <>
                  <span className="price">{formatCurrencyWithSymbol(initData?.sellingPrice)}</span>
                  <span className="price-line-through">
                    {formatCurrencyWithSymbol(calculatorOriginalPriceComboSpecific(initData?.comboProductPrices))}
                  </span>
                </>
              ) : (
                <>
                  <span className="price">{formatCurrencyWithSymbol(initData?.sellingPrice)}</span>
                  <span className="price-line-through">{formatCurrencyWithSymbol(initData?.originalPrice)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="add-to-card-btn">
          <button onClick={() => onClickAddDefaultComboToCard(initData)} type="button">
            <SubtractIcon />
          </button>
        </div>
      </div>

      {renderViewMoreDetailComponent()}
    </>
  );
});
