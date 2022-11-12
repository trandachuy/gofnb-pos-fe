import { Button, Col, Form, InputNumber, message, Modal, Row, Space } from "antd";
import { BoxTimeIcon, CloseModalIcon, ExclamationTriangleIcon } from "constants/icons.constants";
import { currency } from "constants/string.constants";
import materialDataService from "data-services/material/material-data.service";
import moment from "moment";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency, getCurrency } from "utils/helpers";
import { getStorage, localStorageKeys, setStorage } from "utils/localStorage.helpers";
import InventoryCheckingComponent from "../../../components/inventory-checking/inventory-checking.component";
import "./start-shift.scss";

const StartShiftComponent = (props) => {
  const [t] = useTranslation();
  const { isStartShiftModalVisible, onCloseModal, branchSelected, onStartShift, initialAmount } = props;

  const [form] = Form.useForm();
  const [isInventoryCheckingModalVisible, setIsInventoryCheckingModalVisible] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [currentMaterials, setCurrentMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [requestData, setRequestData] = useState(null);

  const pageData = {
    welcomeBack: t("shift.welcomeBack"),
    inputInitialAmount: t("shift.inputInitialAmount"),
    initialAmount: t("shift.initialAmount"),
    pleaseInputInitialAmount: t("shift.pleaseInputInitialAmount"),
    lastShift: t("shift.lastShift"),
    confirmation: t("shift.confirmation"),
    previousShift: t("shift.previousShift"),
    continueStart: t("shift.continueStart"),
    differenceNumberEnter: t("shift.differenceNumberEnter"),
    likeToContinue: t("shift.likeToContinue"),
    cancel: t("shift.cancel"),
    ok: t("shift.ok"),
    continue: t("shift.continue"),
    start: t("shift.start"),
    inventoryChecking: t("inventoryChecking.text"),
    max: 999999999,
    min: 0,
  };

  const onFinish = (formValues) => {
    const materialInventoryChecking = JSON.parse(getStorage(localStorageKeys.MATERIAL_INVENTORY_CHECKING));
    var currentDate = moment();
    let req = {
      branchId: branchSelected,
      initialAmount: formValues.initialAmount,
      checkInDateTime: currentDate,
      materialInventoryCheckings: materialInventoryChecking?.materials,
    };

    if (formValues.initialAmount == null) {
      message.error(pageData.pleaseInputInitialAmount);
      return;
    }

    if (formValues.initialAmount === initialAmount) {
      onStartShift(req);
    } else {
      onShowConfirm(req);
    }
  };

  const getMaterials = async () => {
    let res = await materialDataService.getMaterialsByBranchIdAsync(branchSelected);
    return res.materials;
  };

  const onShowModalInventoryChecking = async () => {
    const materialInventoryChecking = JSON.parse(getStorage(localStorageKeys.MATERIAL_INVENTORY_CHECKING));
    let listMaterial = await getMaterials();
    setMaterials(listMaterial);
    if (materialInventoryChecking != null && materialInventoryChecking?.materials?.length > 0) {
      let materialIds = materialInventoryChecking?.materials.map((m) => m.id);
      let currentMaterials = listMaterial.filter((m) => !materialIds?.includes(m.id));
      let selectedMaterials = listMaterial.filter((m) => materialIds?.includes(m.id));
      selectedMaterials?.map((material) => {
        let selectedMaterial = materialInventoryChecking?.materials?.find((item) => item?.id == material?.id);
        if (selectedMaterial != null) {
          material.inventoryQuantity = selectedMaterial?.inventoryQuantity;
          material.reason = selectedMaterial?.reason;
        }
        return material;
      });
      setSelectedMaterials(selectedMaterials);
      setCurrentMaterials(currentMaterials);
    } else {
      setCurrentMaterials(listMaterial);
    }
    setIsInventoryCheckingModalVisible(true);
  };

  const onSelectMaterial = (materialId) => {
    let material = materials.find((m) => m.id === materialId);
    material.inventoryQuantity = 0;
    let listMaterial = currentMaterials.filter((m) => m.id !== materialId);
    setCurrentMaterials(listMaterial);
    setSelectedMaterials([...selectedMaterials, material]);
  };

  const onInventoryChecking = async () => {
    let req = {
      materials: selectedMaterials,
    };
    setStorage(localStorageKeys.MATERIAL_INVENTORY_CHECKING, JSON.stringify(req));
    onCloseModalInventoryChecking();
  };

  const onCloseModalInventoryChecking = () => {
    setSelectedMaterials([]);
    setCurrentMaterials([]);
    setIsInventoryCheckingModalVisible(false);
  };

  const onShowConfirm = (data) => {
    setIsShowConfirm(true);
    setRequestData(data);
  };

  const onConfirmStartShift = () => {
    onStartShift(requestData);
  };

  const onCancelConfirm = () => {
    setIsShowConfirm(false);
    setRequestData(null);
  };

  //Render confirm modal when click continue
  const renderConfirmModal = () => {
    return (
      <>
        <Modal width={674} centered className="confirm-modal" visible={isShowConfirm} footer={(null, null)} closeIcon>
          <Row className="justify-content-center mb-0">
            <div>
              <ExclamationTriangleIcon />
            </div>
          </Row>
          <Row className="justify-content-center">
            <Col span={24}>
              <p className="text-style previous-shift-text mb-0">
                {pageData.previousShift}
                <span className="font-weight-bold ml-2">{formatCurrency(initialAmount)}</span>
              </p>
              <p className="text-style difference-number-text mb-0">{pageData.differenceNumberEnter}</p>
              <p className="text-style continue-text mb-0">{pageData.likeToContinue}</p>
            </Col>
          </Row>
          <Row className="justify-content-center btn-group">
            <Button className="btn-cancel" onClick={() => onCancelConfirm()}>
              {pageData.cancel}
            </Button>
            <Button className="btn-ok" onClick={() => onConfirmStartShift()}>
              {pageData.ok}
            </Button>
          </Row>
        </Modal>
      </>
    );
  };

  return (
    <>
      {renderConfirmModal()}
      {/* Modal start shift */}
      <Modal
        width={1146}
        centered
        visible={isStartShiftModalVisible}
        footer={(null, null)}
        onCancel={onCloseModal}
        className="start-shift-modal"
        closeIcon={<CloseModalIcon />}
      >
        <Form
          autoComplete="off"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 24,
          }}
          onFinish={onFinish}
          form={form}
        >
          <Row className="justify-content-center">
            <p className="welcome-text">{pageData.welcomeBack}</p>
          </Row>
          <Row className="justify-content-center">
            <p className="lets-input-text">{pageData.inputInitialAmount}</p>
          </Row>
          <Row>
            <Space direction="vertical" className="w-100">
              <p className="initial-amount-text">{pageData.initialAmount}</p>
              <Form.Item className="mb-0" name="initialAmount">
                <InputNumber
                  className="w-100 input-initial-amount"
                  addonAfter={getCurrency()}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  max={pageData.max}
                  min={pageData.min}
                  precision={getCurrency() === currency.vnd ? 0 : 2}
                />
              </Form.Item>
            </Space>
          </Row>
          <Row>
            <Col span={24}>
              <p className="last-shift-remain-text float-right">
                {pageData.lastShift}: <span className="ml-1 font-weight-bold">{formatCurrency(initialAmount)}</span>
              </p>
              <Button
                className="btn-inventory-checking background-white"
                onClick={onShowModalInventoryChecking}
                icon={<BoxTimeIcon />}
              >
                {pageData.inventoryChecking}
              </Button>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Button htmlType="submit" type="primary" className="btn-continue">
              {pageData.continue}
            </Button>
          </Row>
          <InventoryCheckingComponent
            isStepStartShift={true}
            isInventoryCheckingModalVisible={isInventoryCheckingModalVisible}
            materials={materials}
            currentMaterials={currentMaterials}
            selectedMaterials={selectedMaterials}
            onSelectMaterial={onSelectMaterial}
            onCloseModalInventoryChecking={onCloseModalInventoryChecking}
            onChangeRecordMaterial={(data) => setSelectedMaterials([...data])}
            onInventoryChecking={onInventoryChecking}
            onAddItemMaterial={(newMaterials) => setCurrentMaterials([...newMaterials])}
          />
        </Form>
      </Modal>
    </>
  );
};

export default StartShiftComponent;
