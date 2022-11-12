import React, { useEffect, useState } from "react";
import { Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { hasPermission } from "utils/helpers";

export function EditDeleteActionButton(props) {
  const { onEdit, onRemove, record, editPermission, deletePermission } = props;

  return (
    <Space size="middle">
      {hasPermission(editPermission) && (
        <a onClick={() => onEdit(record)}>
          <EditOutlined className="icon-edit" />
        </a>
      )}

      {hasPermission(deletePermission) && (
        <a onClick={() => onRemove(record)}>
          <DeleteOutlined className="icon-del" />
        </a>
      )}
    </Space>
  );
}
