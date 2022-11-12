import { compose } from "redux";
import { withTranslation } from "react-i18next";

import React from "react";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

function WarningDialog(props) {
  const { t, isVisible } = props;

  const confirm = () => {
    Modal.confirm({
      title: props?.title,
      icon: <ExclamationCircleOutlined />,
      content: props?.content,
      okText: props?.okText,
      cancelText: props?.cancelText,
    });
  };
  return <>{isVisible && confirm()}</>;
}

export default compose(withTranslation("translations"))(WarningDialog);
