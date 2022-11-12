import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import "./style.scss";

export default function PageNotPermitted(props) {
  const history = useHistory();
  const [t] = useTranslation();
  const pageData = {
    opps: t("pageNotFound.opps"),
    pageNotPermitted: t("pageNotFound.pageNotPermitted"),
    NotPermittedMessage: t("pageNotFound.notPermittedMessage"),
    backToHomePage: t("pageNotFound.backToHomePage"),
  };

  return (
    <div className="page-not-permitted">
      <div className="page-background">
        <div className="img-background">
          <div className="box-center">
            <div className="head-text">
              {pageData.opps}
              <span className="exclamation-point">!</span>
            </div>
            <div className="error-text">{pageData.pageNotPermitted}</div>
            <div className="message-text">{pageData.NotPermittedMessage}</div>
            <div className="back-home-btn">
              <button className="button-bg" onClick={() => history.push("/")}>
                <span className="button-text">{pageData.backToHomePage}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
