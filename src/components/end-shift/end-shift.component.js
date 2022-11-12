import { Button, Col, Form, InputNumber, message, Modal, Row, Space } from "antd";
import InventoryCheckingComponent from "components/inventory-checking/inventory-checking.component";
import {
  BoxTimeIcon,
  CloseModalEndShiftIcon,
  ProductFillIcon,
  RevenueIcon,
  StaffUserFillIcon,
  TimeFillIcon,
} from "constants/icons.constants";
import { currency, DatetimeFormat } from "constants/string.constants";
import materialDataService from "data-services/material/material-data.service";
import moment from "moment";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency, getCurrency } from "utils/helpers";
import { getStorage, localStorageKeys, setStorage } from "utils/localStorage.helpers";
import "./end-shift.scss";

const EndShiftComponent = (props) => {
  const [t] = useTranslation();
  const { isEndShiftModalVisible, onCloseModal, onEndShift, infoEndShift } = props;
  const [form] = Form.useForm();
  const pageData = {
    titleEndShift: t("shift.titleEndShift"),
    staff: t("shift.staff"),
    checkIn: t("shift.checkIn"),
    checkOut: t("shift.checkOut"),
    orderSuccess: t("shift.orderSuccess"),
    orderCanceled: t("shift.orderCanceled"),
    initialAmount: t("shift.initialAmount"),
    discount: t("shift.discount"),
    revenue: t("shift.revenue"),
    withdrawalAmount: t("shift.withdrawalAmount"),
    remain: t("shift.remain"),
    titleWithdrawalAmount: t("shift.titleWithdrawalAmount"),
    min: 0,
    max: 999999999,
    pleaseInputAmount: t("shift.pleaseInputAmount"),
    endShift: t("shift.endShift"),
    inventoryChecking: t("inventoryChecking.text"),
    inputWithdrawalAmount: t("shift.inputWithdrawalAmount"),
    errorEndShift: t("shift.errorEndShift"),
  };

  const [materials, setMaterials] = useState([]);
  const [currentMaterials, setCurrentMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [checkOutDateTime, setCheckOutDateTime] = useState(moment());
  const [isInventoryCheckingModalVisible, setIsInventoryCheckingModalVisible] = useState(false);

  const onFinish = (formValues) => {
    if (formValues?.withdrawalAmount == null) {
      message.error(pageData.inputWithdrawalAmount);
      return;
    }

    if (formValues?.withdrawalAmount > infoEndShift?.remain) {
      message.error(pageData.errorEndShift);
    } else {
      const materialInventoryChecking = JSON.parse(getStorage(localStorageKeys.MATERIAL_INVENTORY_CHECKING));
      let req = {
        id: infoEndShift?.shiftId,
        withdrawalAmount: formValues.withdrawalAmount,
        checkOutDateTime: checkOutDateTime,
        materialInventoryCheckings: materialInventoryChecking?.materials,
      };
      onEndShift(req);
    }
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
          material.deviant = selectedMaterial?.deviant;
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

  const getMaterials = async () => {
    let res = await materialDataService.getMaterialsFromOrdersCurrentShiftAsync();
    return res.materials;
  };

  const onSelectMaterial = (materialId) => {
    let material = materials.find((m) => m.id === materialId);
    material.inventoryQuantity = 0;
    let listMaterial = currentMaterials.filter((m) => m.id !== materialId);
    setCurrentMaterials(listMaterial);
    setSelectedMaterials([...selectedMaterials, material]);
  };

  const onCloseModalInventoryChecking = () => {
    setSelectedMaterials([]);
    setCurrentMaterials([]);
    setIsInventoryCheckingModalVisible(false);
  };

  const onInventoryChecking = async () => {
    let req = {
      materials: selectedMaterials,
    };
    setStorage(localStorageKeys.MATERIAL_INVENTORY_CHECKING, JSON.stringify(req));
    onCloseModalInventoryChecking();
  };

  return (
    <Modal
      visible={isEndShiftModalVisible}
      footer={(null, null)}
      onCancel={onCloseModal}
      width={1146}
      centered
      className="end-shift-modal"
      closeIcon={<CloseModalEndShiftIcon />}
    >
      <Form
        autoComplete="off"
        name="basic"
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
          <p className="end-shift-text">{pageData.titleEndShift}</p>
        </Row>
        <Row gutter={[32, 32]} className="card-row">
          <Col span={13}>
            <div className="left-card">
              <div className="left-card-header">
                <div className="header-text-box">
                  <p className="header-text">
                    {"#"}
                    {infoEndShift?.code}
                  </p>
                </div>
              </div>
              <div className="left-card-body">
                <div className="left-card-body-container">
                  <div className="staff-box display-inline-text">
                    <span className="icon">
                      <StaffUserFillIcon />
                    </span>
                    <span className="text-left ml-19">{pageData.staff}</span>
                    <span className="text-right">{infoEndShift?.nameStaff} </span>
                  </div>
                  <div className="checkin-box display-inline-text">
                    <span className="icon">
                      <TimeFillIcon />
                    </span>
                    <span className="text-left ml-19">{pageData.checkIn}:</span>
                    <span className="text-right">
                      {moment.utc(infoEndShift?.checkInDateTime).local().format(DatetimeFormat.HH_MM_DD_MM_YYYY)}{" "}
                    </span>
                  </div>
                  <div className="checkout-box display-inline-text">
                    <span className="text-left ml-52">{pageData.checkOut}:</span>
                    <span className="text-right">{moment().format(DatetimeFormat.HH_MM_DD_MM_YYYY)} </span>
                  </div>
                  <div className="success-order-box display-inline-text">
                    <span className="icon">
                      <ProductFillIcon />
                    </span>
                    <span className="text-left ml-19">{pageData.orderSuccess}:</span>
                    <span className="text-right">{infoEndShift?.numberOrderSuccess}</span>
                  </div>
                  <div className="cancel-order-box display-inline-text">
                    <span className="text-left ml-52">{pageData.orderCanceled}:</span>
                    <span className="text-right">{infoEndShift?.numberOrderCanceled}</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col span={11}>
            <div className="right-card">
              <div className="right-card-header">
                <div className="header-text-box">
                  <RevenueIcon />
                  <p className="header-text">{formatCurrency(infoEndShift?.revenue)}</p>
                </div>
              </div>
              <Row className="right-card-body" gutter={[16, 16]}>
                <Col span={12}>
                  <Space direction="vertical" className="left-space">
                    <p className="text-left">{pageData.initialAmount}</p>
                    <p className="text-left"> {pageData.revenue}</p>
                    <p className="text-left">{pageData.discount}</p>
                    <p className="text-left">{pageData.withdrawalAmount}</p>
                    <p className="text-left">{pageData.remain}</p>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" className="right-space">
                    <p className="text-right">{formatCurrency(infoEndShift?.initialAmount)}</p>
                    <p className="text-right">{formatCurrency(infoEndShift?.revenue)}</p>
                    <p className="text-right">{formatCurrency(infoEndShift?.discount)}</p>
                    <p className="text-right">{formatCurrency(infoEndShift?.withdrawalAmount)}</p>
                    <p className="text-right">{formatCurrency(infoEndShift?.remain)}</p>
                  </Space>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
        <Row>
          <Space direction="vertical" className="w-100">
            <p className="withdrawal-amount-text">{pageData.titleWithdrawalAmount}</p>
            <Form.Item className="mb-0" name={"withdrawalAmount"}>
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
          <Button
            className="btn-inventory-checking background-white"
            onClick={onShowModalInventoryChecking}
            icon={<BoxTimeIcon />}
          >
            {pageData.inventoryChecking}
          </Button>
        </Row>
        <InventoryCheckingComponent
          isStepStartShift={false}
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

        <Row className="justify-content-center">
          <Button htmlType="submit" type="primary" className="btn-continue">
            {pageData.endShift}
          </Button>
        </Row>
      </Form>
    </Modal>
  );
};

export default EndShiftComponent;
