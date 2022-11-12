import React from "react";
import { compose } from "redux";
import { withTranslation } from "react-i18next";
import { Typography } from "antd";
const { Title } = Typography;

function PageTitle(props) {
  return <Title level={3}>{props?.content?.toUpperCase()}</Title>;
}

export default compose(withTranslation("translations"))(PageTitle);
