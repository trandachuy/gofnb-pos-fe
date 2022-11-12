import { Button, Modal } from "antd";
import React, { useState } from "react";

import { InfoCircleFilled } from "@ant-design/icons";

import "./fnb-alert.component.scss";

const dialogType = {
  warning: "warning",
};

export const FnbAlertComponent = props => {
  const {className, visible, type, title, content, onOk, okText, footer } = props;

  const renderHeader = () => {
    let header = <></>;
    switch (type) {
      case dialogType.warning:
      default:
        header = (
          <>
            <InfoCircleFilled className="mr-2" />
            {title}
          </>
        );
        break;
    }

    return <>{header}</>;
  };

  const renderFooter = () => {
    if (footer) {
      return footer;
    }

    if (okText) {
      return (
        <div className="text-center">
          <Button key="back" onClick={onOk}>
            {okText}
          </Button>
        </div>
      );
    }
  };

  return (
    <>
      <Modal
        className={`fnb-alert-${type} ${className??""}`}
        visible={visible}
        title={renderHeader()}
        footer={renderFooter()}
        closable={false}
        maskClosable={false}
        centered
      >
        {content}
      </Modal>
    </>
  );
};
