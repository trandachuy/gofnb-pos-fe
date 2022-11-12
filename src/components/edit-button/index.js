import React from "react";
import { EditOutlined } from "@ant-design/icons";
import { hasPermission } from "utils/helpers";

export function EditButton(props) {
  const { className, onClick, permission } = props;

  return (
    <>
      {hasPermission(permission) && (
        <a className={className} onClick={() => onClick()}>
          <EditOutlined className="icon-edit" />
        </a>
      )}
    </>
  );
}
