import { Image, Space } from "antd";
import foodBeverageLogo from "assets/go-fnb-pos-text-logo.png";
import branchDefault from "assets/store-default.jpg";
import { BackToIcon } from "constants/icons.constants";
import { useTranslation } from "react-i18next";

const ListBranchComponent = (props) => {
  const [t] = useTranslation();
  const { storeBranches, onSelectBranch, onBackStore } = props;

  const pageData = {
    selectBranch: t("signIn.selectBranch"),
    back: t("button.back"),
  };

  return (
    <>
      <div className="form-logo">
        <div>
          <Image preview={false} src={foodBeverageLogo} width={300} />
        </div>
      </div>
      <div className="div-form login-contain login-contain__right">
        <div className="select-store-form login-form login-inner login-inner__spacing">
          <div className="content-inner">
            <a onClick={onBackStore}>
              <span>
                <BackToIcon />
              </span>
              {pageData.back}
            </a>
            <h1 className="label-store">{pageData.selectBranch}</h1>
            <div className="store-form list-item">
              {storeBranches?.map((branch, key) => {
                return (
                  <div
                    key={key}
                    className="store-detail-form item-option pointer"
                    onClick={() => onSelectBranch(branch?.id)}
                  >
                    <Space>
                      <Image className="item-image-logo" preview={false} src={branchDefault} width={100} />
                      <span>{branch?.name}</span>
                    </Space>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListBranchComponent;
