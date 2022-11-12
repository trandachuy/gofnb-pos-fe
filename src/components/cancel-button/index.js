/**
 * params
 * visible: bool | default: false
 * message: string | default: Do you want to delete this?
 * callBack: function | default: null
 */

import { compose } from "redux";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";

import React from "react";
import { Popconfirm, Button } from "antd";

function CancelButton(props) {
  const { t, className } = props;
  const [visible, setVisible] = React.useState(props.visible || false);
  const [deleteConfirmLoading, setDeleteConfirmLoading] = React.useState(
    props.deleteConfirmLoading || false
  );
  const showPopconfirm = () => {
    setVisible(true);
  };
  const handleOk = () => {
    setVisible(false);
    setDeleteConfirmLoading(false);
    if (props.callBack) props?.callBack();
  };
  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <Popconfirm
      title={props?.message ?? t("leaveDialog.confirmLeave")}
      visible={visible}
      onConfirm={() => handleOk()}
      okButtonProps={{ loading: deleteConfirmLoading }}
      onCancel={() => handleCancel()}
      okText={props?.okText ?? t("leaveDialog.confirmation")}
      cancelText={props?.cancelText ?? t("leaveDialog.discard")}
    >
      <Button className={className} onClick={() => showPopconfirm()}>
        {props?.buttonName ?? t("button.cancel")}
      </Button>
    </Popconfirm>
  );
}

export default compose(withTranslation("translations"))(CancelButton);
