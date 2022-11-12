import { compose } from "redux";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import SecondaryScreenPage from "./secondary-screen.page";
import areaDataService from "data-services/area/area-data.service";
import orderDataService from "data-services/order/order-data.service";

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state?.session?.auth?.token ? true : false,
    storeLogo: state?.session?.storeInfo?.logo,
  };
};

const mapDispatchToProps = () => {
  return {
    areaDataService: areaDataService,
    orderDataService: orderDataService,
  };
};

export default compose(
  withTranslation("translations"),
  connect(mapStateToProps, mapDispatchToProps),
  withRouter
)(SecondaryScreenPage);
