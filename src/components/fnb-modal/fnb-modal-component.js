import React from "react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import "./fnb-modal-component.scss";

export function FnbModal(props) {
  const [t] = useTranslation();
  const {
    width,
    visible,
    title,
    cancelText,
    handleCancel,
    okText,
    onOk,
    content,
    footer,
  } = props;

  return (
    <Modal
      width={width}
      className="modal-component"
      closeIcon
      visible={visible}
      title={title}
      cancelText={cancelText}
      onCancel={handleCancel}
      okText={okText}
      onOk={onOk}
      footer={footer}
    >
      {content}
    </Modal>
  );
}
