import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Space, Tooltip } from "antd";
import { TrashFill } from "constants/icons.constants";
import { hasPermission } from "utils/helpers";
import { Button } from "antd";
import "./delete-confirm.component.scss";

export default function DeleteConfirmComponent(props) {
  const [t] = useTranslation();
  var {
    className,
    title,
    content,
    okText,
    cancelText,
    onOk,
    onCancel,
    permission,
    okType,
    buttonIcon,
    canClose,
    visible,
    skipPermission,
    buttonText,
    buttonType,
    tooltipTitle,
  } = props;

  const [isModalVisible, setIsModalVisible] = useState(false);

  if (buttonType == undefined) {
    buttonType = "ICON";
  }

  buttonType = buttonType ?? "ICON";

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    if (onOk) {
      onOk();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    if (onCancel) {
      onCancel();
    }
  };

  const renderModal = () => {
    return (
      <Modal
        className="delete-confirm-modal"
        title={title}
        visible={isModalVisible || visible}
        okText={okText}
        okType={okType ? okType : "danger"}
        closable={canClose ? canClose : false}
        cancelText={cancelText}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <span dangerouslySetInnerHTML={{ __html: content }}></span>
      </Modal>
    );
  };

  const renderWithText = () => {
    return (!permission || hasPermission(permission) || skipPermission) &&
      buttonText !== "" &&
      buttonText !== undefined ? (
      <>
        <Button onClick={() => showModal()} className="action-delete">
          {buttonText ?? ""}
        </Button>
        {renderModal()}
      </>
    ) : (
      <></>
    );
  };

  const renderWithIcon = () => {
    return !permission || hasPermission(permission) || skipPermission ? (
      <>
        <Space wrap className={className}>
          {!skipPermission && (
            <a onClick={showModal}>
              {buttonIcon ? (
                tooltipTitle ? (
                  <Tooltip placement="top" title={tooltipTitle}>
                    {buttonIcon}
                  </Tooltip>
                ) : (
                  { buttonIcon }
                )
              ) : (
                <div className="fnb-table-action-icon">
                  <Tooltip placement="top" title={t("button.delete")} color="#50429B">
                    <TrashFill className="icon-svg-hover" />
                  </Tooltip>
                </div>
              )}
            </a>
          )}
          {renderModal()}
        </Space>
      </>
    ) : (
      <></>
    );
  };

  return (buttonType ?? "ICON") === "ICON" ? renderWithIcon() : renderWithText();
}
