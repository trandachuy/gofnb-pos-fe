import { Button, Col, Form, Input, InputNumber, Modal, Row, Typography } from "antd";
import FnbSelectMaterialComponent from "components/fnb-select-material/fnb-select-material.component";
import { FnbTable } from "components/fnb-table/fnb-table";
import { TrashIcon } from "constants/icons.constants";
import { useTranslation } from "react-i18next";
import { formatNumber } from "utils/helpers";
import "./inventory-checking.component.scss";

const { Text, Paragraph } = Typography;

const InventoryCheckingComponent = (props) => {
  const [t] = useTranslation();
  const {
    isStepStartShift,
    isInventoryCheckingModalVisible,
    onCloseModalInventoryChecking,
    materials,
    currentMaterials,
    onSelectMaterial,
    selectedMaterials,
    onChangeRecordMaterial,
    onInventoryChecking,
    onAddItemMaterial,
  } = props;

  const [form] = Form.useForm();
  const pageData = {
    inventoryChecking: t("inventoryChecking.title"),
    btnConfirm: t("button.confirm"),
    btnCancel: t("button.cancel"),
    table: {
      material: t("inventoryChecking.table.material"),
      unit: t("inventoryChecking.table.unit"),
      originalQuantity: t("inventoryChecking.table.originalQuantity"),
      inventoryQuantity: t("inventoryChecking.table.inventoryQuantity"),
      max: 999999999,
      deviant: t("inventoryChecking.table.deviant"),
      reason: t("inventoryChecking.table.reason"),
      reasonPlaceholder: t("inventoryChecking.table.reasonPlaceholder"),
      used: t("inventoryChecking.table.used"),
      action: t("inventoryChecking.table.action"),
      maxLengthReason: 255,
      search: t("inventoryChecking.search"),
    },
  };

  const onFinish = (formValues) => {
    onInventoryChecking();
  };

  const getColumns = () => {
    let columns = [
      {
        title: pageData.table.material,
        dataIndex: "name",
        width: isStepStartShift ? "20%" : "20%",
        className: "grid-name-column",
        render: (_, record, index) => (
          <Form.Item name={["materials", index, "materialId"]} className="form-item-material">
            <div className="text-overflow">
              <Paragraph
                className="paragraph-style"
                placement="top"
                ellipsis={{ tooltip: record?.name }}
                color="#50429B"
              >
                <span className="text-name">{record.name}</span>
              </Paragraph>
            </div>
          </Form.Item>
        ),
      },
      {
        title: pageData.table.unit,
        dataIndex: "unitName",
        width: isStepStartShift ? "10%" : "10%",
        className: "grid-text-column",
        render: (_, record, index) => (
          <Form.Item name={["materials", index, "unitName"]} className="form-item-material">
            <span className="text-name">{record.unitName}</span>
          </Form.Item>
        ),
      },
      {
        title: pageData.table.originalQuantity,
        dataIndex: "quantity",
        width: isStepStartShift ? "10%" : "10%",
        className: "grid-text-column",
        render: (_, record, index) => (
          <Form.Item name={["materials", index, "quantity"]} className="form-item-material">
            <div>{record?.quantity ? formatNumber(record?.quantity) : 0}</div>
          </Form.Item>
        ),
      },
      {
        title: pageData.table.inventoryQuantity,
        dataIndex: "inventoryQuantity",
        width: isStepStartShift ? "20%" : "10%",
        render: (_, record, index) => (
          <Form.Item name={["materials", index, "inventoryQuantity"]} className="form-item-material">
            <InputNumber
              className="fnb-input-number w-100"
              min={0}
              max={pageData.table.max}
              onChange={(value) => onChangeRecord(index, "inventoryQuantity", value)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              defaultValue={record.inventoryQuantity}
            />
          </Form.Item>
        ),
      },
      {
        title: pageData.table.deviant,
        dataIndex: "deviant",
        width: isStepStartShift ? "10%" : "10%",
        className: "grid-text-column",
        render: (_, record, index) => (
          <Form.Item name={["materials", index, "deviant"]} className="form-item-material">
            {renderDeviant(record)}            
          </Form.Item>
        ),
      },
      {
        title: pageData.table.reason,
        dataIndex: "reason",
        width: isStepStartShift ? "20%" : "20%",
        render: (_, record, index) => (
          <Form.Item name={["materials", index, "reason"]} className="form-item-material">
            <Input
              className="fnb-input w-100"
              placeholder={pageData.table.reasonPlaceholder}
              defaultValue={record.reason}
              onChange={(e) => onChangeRecord(index, "reason", e)}
              max={pageData.table.maxLengthReason}
            />
          </Form.Item>
        ),
      },
      {
        title: pageData.table.action,
        dataIndex: "action",
        width: isStepStartShift ? "10%" : "10%",
        align: "center",
        render: (_, record, index) => (
          <a onClick={() => onRemoveMaterial(record?.id, index)}>
            <TrashIcon />
          </a>
        ),
      },
    ];

    if (!isStepStartShift) {
      const usedColumn = {
        title: pageData.table.used,
        dataIndex: "used",
        width: "10%",
        className: "grid-text-column",
        render: (_, record, index) => (
          <Form.Item name={["materials", index, "used"]} className="form-item-material">
            <div>{record?.used ? formatNumber(record?.used) : 0}</div>
          </Form.Item>
        ),
      };
      columns.splice(3, 0, usedColumn);
    }

    return columns;
  };

  const onChangeRecord = (index, column, value) => {
    selectedMaterials?.map((item, i) => {
      if (i === index) {
        if (column === "inventoryQuantity") {
          item.inventoryQuantity = value;
          item.deviant = value - (item?.quantity - (item.used ?? 0));
        } else {
          item.reason = value?.target?.value;
        }
      }
    });
    onChangeRecordMaterial(selectedMaterials);
  };

  const onRemoveMaterial = (materialId, index) => {
    let listMaterial = selectedMaterials.filter((m) => m.id !== materialId);
    onChangeRecordMaterial(listMaterial);
    let materialIds = listMaterial.map((m) => m.id);
    let newMaterials = materials.filter((m) => !materialIds?.includes(m.id));
    onAddItemMaterial(newMaterials);

    let formValue = form.getFieldsValue();
    formValue.materials.splice(index, 1);
    form.setFieldsValue(formValue);
  };

  const renderDeviant = (record) => {
    let deviant = record.inventoryQuantity - (record?.quantity - (record?.used ?? 0));
    return (
      <Text type={(record?.deviant < 0 || deviant < 0) && "danger"}>
        {formatNumber(deviant)}
    </Text>
    )
  };

  return (
    <Modal
      width={1146}
      centered
      visible={isInventoryCheckingModalVisible}
      footer={(null, null)}
      closable={false}
      className="inventory-checking-modal"
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
        className="w-100"
        form={form}
      >
        <Row className="justify-content-center">
          <h1 className="title-text mb-0">{pageData.inventoryChecking}</h1>
        </Row>
        <Row className="select-material-box">
          <Col span={24}>
            <FnbSelectMaterialComponent
              materialList={currentMaterials}
              onChangeEvent={(value) => onSelectMaterial(value)}
              t={t}
            />
          </Col>
        </Row>
        <Row className="material-table-box">
          <Col span={24}>
            <FnbTable
              className="selected-material-table"
              dataSource={selectedMaterials}
              columns={getColumns()}
              total={selectedMaterials.length}
              scrollY={96 * 5}
              width={880}
            />
          </Col>
        </Row>
        <Row className="btn-inventory-checking-group">
          <Col span={24}>
            <Button onClick={onCloseModalInventoryChecking} className="btn-cancel">
              {pageData.btnCancel}
            </Button>
            <Button htmlType="submit" className="btn-confirm">
              {pageData.btnConfirm}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default InventoryCheckingComponent;
