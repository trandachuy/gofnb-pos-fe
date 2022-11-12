import { Col, Modal, Row, Typography } from "antd";
import React, { useState } from "react";
import "./view-more-product-combo.scss";
import { ClosePopupIcon } from "../../../constants/icons.constants";
import { formatCurrency } from "utils/helpers";

export default function ViewMoreProductComboComponent(props) {
  const { isModalVisible, productComboValue, onCloseModalViewComboDetail } = props;
  const { Paragraph } = Typography;

  return (
    <>
      <Modal
        visible={isModalVisible}
        footer={(null, null)}
        closable={false}
        centered
        className="modal-view-combo-detail"
      >
        <Row className="header-detail-combo">
          <Col span={21} className="name-combo">
            {productComboValue?.comboName}
          </Col>
          <Col span={3}>
            <ClosePopupIcon className="icon-close" onClick={onCloseModalViewComboDetail} />
          </Col>
        </Row>
        <Row className="content-detail-combo">
          <Col span={24} className="item-combo">
            <p className="selling-price">{formatCurrency(productComboValue?.sellingPrice)}</p>
            {productComboValue?.sellingPrice !== productComboValue?.originalPrice && (
              <p className="original-price">{formatCurrency(productComboValue?.originalPrice)}</p>
            )}
          </Col>
          {productComboValue?.comboItems?.map((item, index) => {
            return (
              <>
                <Col
                  span={24}
                  className={`item-combo product-combo-name ${(index + 1) % 2 !== 0 && "product-item-even"}`}
                >
                  <Paragraph
                    ellipsis={{
                      rows: 2,
                      tooltip: item.itemName,
                    }}
                  >
                    {item.itemName}
                  </Paragraph>
                </Col>
              </>
            );
          })}
        </Row>
      </Modal>
    </>
  );
}
