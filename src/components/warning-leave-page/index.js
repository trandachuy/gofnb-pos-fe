import { compose } from "redux";
import { withTranslation } from "react-i18next";
import { Prompt } from "react-router";
import React from "react";

function WarningLeavePageComponent(props) {
  const { t, when } = props;
  return <Prompt when={when} message={t("messages.leaveForm")} />;
}

export default compose(withTranslation("translations"))(WarningLeavePageComponent);
