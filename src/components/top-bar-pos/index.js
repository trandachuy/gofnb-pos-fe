import { compose } from "redux";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import TopBarPosComponent from "./top-bar-pos.component";

export default compose(withTranslation("translations"), connect(null, null), withRouter)(TopBarPosComponent);
