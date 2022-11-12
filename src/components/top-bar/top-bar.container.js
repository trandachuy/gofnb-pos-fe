import { compose } from "redux";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import { resetSession } from "../../store/modules/session/session.actions";
import TopBar from "./top-bar.component";

const mapStateToProps = state => {
  return {
    signedInUser: state.session?.auth?.user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    signOut: () => dispatch(resetSession()),
  };
};

export default compose(
  withTranslation("translations"),
  connect(mapStateToProps, mapDispatchToProps),
  withRouter
)(TopBar);
