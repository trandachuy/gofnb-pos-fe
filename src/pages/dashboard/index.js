import { compose } from "redux";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import { DashboardPage } from "./dashboard.page";

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state?.session?.auth?.token ? true : false,
  };
};

export default compose(
  withTranslation("translations"),
  connect(mapStateToProps, null),
  withRouter
)(DashboardPage);
