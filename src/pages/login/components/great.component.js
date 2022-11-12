import React from "react";
import { Modal, Row, Button } from "antd";
import { useTranslation } from "react-i18next";
import "./start-shift.scss";

const GreatComponent = (props) => {
  const [t] = useTranslation();
  const { isGreatComponentVisible, onClickGreat } = props;

  const pageData = {
    great: t("inventoryChecking.great"),
    success: t("inventoryChecking.success"),
    start: t("inventoryChecking.start"),
  };

  return (
    <Modal width={1146} centered closable={false} visible={isGreatComponentVisible} footer={(null, null)} className="great-modal">
      <Row className="justify-content-center">
        <h1 className="great-text mb-0">{pageData.great}</h1>
      </Row>
      <Row className="justify-content-center">
        <p className="wish-text mb-0">{pageData.success}</p>
      </Row>
      <Row className="justify-content-center">
        <Button className="btn-start" type="primary" onClick={onClickGreat}>
          {pageData.start}
        </Button>
      </Row>
    </Modal>
  );
};

export default GreatComponent;
