import React from "react";
import { compose } from "redux";
import { withTranslation } from "react-i18next";
import { Button } from "antd";
import { hasPermission } from "utils/helpers";

function PrivateButton(props) {
  const { onClick, icon, type, className, text, permission } = props;
  return (
    <>
      {hasPermission(permission) && (
        <Button className={className} type={type} icon={icon} onClick={onClick}>
          {text}
        </Button>
      )}
    </>
  );
}

export default compose(withTranslation("translations"))(PrivateButton);
