import { Button, Col, Modal, Row } from "antd";
import { useTranslation } from "react-i18next";
import "./notification.component.scss";

export default function NotificationComponent(props) {
  const [t] = useTranslation();
  const { isModalVisible, handleCancel, content, isShowSave, textBtnSave, onSave, hideIgnoreBtn } = props;
  const pageData = {
    buttonIGotIt: t("form.buttonIGotIt"),
    ignore: t("button.ignore"),
    delete: t("button.delete"),
    deleteMaterialNotificationMessage: t("messages.deleteMaterialNotificationMessage"),
    deleteMaterialMessage: t("messages.deleteMaterialMessage"),
    confirmDelete: t("leaveDialog.confirmDelete"),
    btnDelete: t("button.delete"),
    btnIgnore: t("button.ignore"),
    titleModal: t("form.notificationTitle"),
  };

  const onCancel = () => {
    handleCancel();
  };

  return (
    <>
      <Modal
        width={600}
        className="notification-confirm-modal"
        title={pageData.titleModal}
        closeIcon
        visible={isModalVisible}
        footer={(null, null)}
        centered
      >
        <Row>
          <Col span={24}>
            <>
              <div
                dangerouslySetInnerHTML={{
                  __html: content,
                }}
              ></div>
            </>
          </Col>
        </Row>
        {isShowSave === false ? (
          <Row className="btn-i-got-it">
            <Button type="primary" onClick={() => onCancel()}>
              {pageData.buttonIGotIt}
            </Button>
          </Row>
        ) : (
          <Row className="modal-footer">
            {!hideIgnoreBtn && (
              <Button className="mr-2" onClick={() => onCancel()}>
                {pageData.ignore}
              </Button>
            )}

            <Button
              type="primary"
              onClick={() => {
                onSave();
              }}
            >
              {textBtnSave}
            </Button>
          </Row>
        )}
      </Modal>
    </>
  );
}
