import React from "react";
import "./great.component.scss";
import { Modal, Row } from "antd";

const GreatComponent = (props) => {
  const { showModal, title, text, buttonComponent } = props;

  return (
    <Modal width={1146} centered closable={false} visible={showModal} footer={(null, null)} className="payment-success-modal">
      <Row className="justify-content-center">
        <h1 className="great-text mb-0"> {title}</h1>
      </Row>
      <Row className="justify-content-center">
        <p className="success-text mb-0">{text}</p>
      </Row>
      <Row className="justify-content-center btn-row">{buttonComponent}</Row>
    </Modal>
  );
};

export default GreatComponent;
