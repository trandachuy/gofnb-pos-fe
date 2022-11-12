import React, { useEffect, useState } from "react";
import { Form, Input, Space, Select, Divider, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Text, Link } = Typography;

export default function SelectEditComponent(props) {
  const {
    placeholder,
    pleaseEnterName,
    nameExisted,
    btnAddNew,
    listOption,
    onChangeOption,
    onNameChange,
    addNewItem,
    isNameExisted,
    name,
    isEditProduct,
  } = props;

  const [value, setValue] = useState(null);

  useEffect(() => {
    if (isEditProduct) {
      props.functions.current = setValue;
    }

  }, [])

  return (
    <Select
      value={value}
      autoBlur={false}
      className="w-100"
      onChange={onChangeOption}
      placeholder={placeholder}
      dropdownRender={(menu) => (
        <>
          <Space align="center" style={{ padding: "0 8px 4px" }}>
            <Input
              style={{ width: "400px" }}
              maxLength={50}
              placeholder={pleaseEnterName}
              value={name}
              onChange={onNameChange}
            />
            {isNameExisted && <Text type="danger">{nameExisted}</Text>}
            <Link disabled={isNameExisted} onClick={addNewItem} style={{ whiteSpace: "nowrap" }}>
              <PlusOutlined /> {btnAddNew}
            </Link>
          </Space>
          <Divider style={{ margin: "8px 0" }} />
          {menu}
        </>
      )}
    >
      {listOption?.map((item) => (
        <Option key={item.id} value={item.id}>{item.name}</Option>
      ))}
    </Select>
  );
}
