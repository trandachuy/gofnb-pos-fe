import { Button, Col, Form, Modal, Row, Space, Tooltip } from "antd";
import { FnbTextArea } from "components/fnb-text-area/fnb-text-area.component";
import { TrashFill } from "constants/icons.constants";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { hasPermission } from "utils/helpers";
import "./cancel-confirm.component.scss";

export default function CancelConfirmComponent(props) {
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
    centered,
    okButtonProps,
    cancelButtonProps,
  } = props;

  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const pageData = {
    btnIgnore: t("button.ignore"),
    cancelOrder: t("posOrder.detail.cancelOrder"),
  };

  if (buttonType == undefined) {
    buttonType = "ICON";
  }

  buttonType = buttonType ?? "ICON";

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    if (onCancel) {
      onCancel();
    }
  };

  const onFinish = (values) => {
    setIsModalVisible(false);
    if (onOk) {
      onOk(values);
      form.resetFields();
    }
  };

  const renderModal = () => {
    return (
      <Modal
        className="cancel-confirm-modal"
        title={title}
        visible={isModalVisible || visible}
        okText={okText}
        okType={okType ? okType : "danger"}
        closable={canClose ? canClose : false}
        cancelText={cancelText}
        onCancel={handleCancel}
        centered={centered}
        okButtonProps={okButtonProps}
        cancelButtonProps={cancelButtonProps}
        footer={(null, null)}
      >
        <Form autoComplete="off" name="basic" form={form} onFinish={onFinish}>
          <Row className="cancel-reason-order">
            <Col span={24} className="cancel-text">
              <span dangerouslySetInnerHTML={{ __html: content }}></span>
            </Col>
            <Col span={24} className="reason-text">
              {t("inventoryChecking.table.reason")}
              <span>*</span>
            </Col>
            <Col span={24} className="reason-text-area">
              <Form.Item
                name={"reason"}
                rules={[{ required: true, message: t("inventoryChecking.table.requiredCancelReason") }]}
              >
                <FnbTextArea
                  showCount
                  maxLength={255}
                  rows={3}
                  placeholder={t("inventoryChecking.table.reasonPlaceholder")}
                ></FnbTextArea>
              </Form.Item>
            </Col>
          </Row>
          <Row className="cancel-footer">
            <Button className="btn-cancel" key="back" onClick={() => handleCancel()}>
              {pageData.btnIgnore}
            </Button>
            <Button type="primary" className="cancel-order-btn" htmlType="submit">
              {okText}
            </Button>
          </Row>
        </Form>
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
