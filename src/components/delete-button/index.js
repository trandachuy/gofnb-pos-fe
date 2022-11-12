import React from "react";
import { compose } from "redux";
import { withTranslation } from "react-i18next";
import { DeleteOutlined } from "@ant-design/icons";

function DeleteButton(props) {
  const { className, onClick } = props;
  return <DeleteOutlined onClick={onClick} className={className} />;
}

export default compose(withTranslation("translations"))(DeleteButton);
