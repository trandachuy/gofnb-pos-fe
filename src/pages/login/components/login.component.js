import { Button, Form, Image, Input, Row, Select, Space } from "antd";
import "antd/dist/antd.css";
import foodBeverageLogo from "assets/go-fnb-pos-text-logo.png";
import {
  ArrowDown,
  EarthIcon,
  EyeIcon,
  EyeOpenIcon,
  HeadphoneIcon,
  LockIcon,
  TabletIcon,
  UserNameIcon,
} from "constants/icons.constants";
import { listDefaultLanguage } from "constants/language.constants";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import languageService from "services/language/language.service";
import i18n from "utils/i18n";
import "../../../stylesheets/main.scss";

const { Option } = Select;

const LoginComponent = ({ onLogin, isLoginProcessing, loginErrorMessage, onChange }) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();

  const beforeLanguage = languageService.getLang() ?? listDefaultLanguage[0]?.key;
  const [defaultLanguage, setDefaultLanguage] = useState(beforeLanguage);
  const [languageList, setLanguageList] = useState([]);

  const pageData = {
    titleLogin: t("signIn.text"),
    pleaseInputYourUsername: t("signIn.pleaseInputYourUsername"),
    username: t("signIn.username"),
    pleaseInputYourPassword: t("signIn.pleaseInputYourPassword"),
    password: t("signIn.password"),
    loginHere: t("signIn.loginHere"),
    emailOrPhoneNumber: t("signIn.emailOrPhoneNumber"),
    forgotPassword: t("signIn.forgotPassword"),
    gosell: "www.gosell.vn",
    csGnB: "cs@gofnb.com",
    hotline: "028 7303 0800",
  };

  useEffect(() => {
    getInitData();
  }, []);

  const getInitData = () => {
    setLanguageList(listDefaultLanguage);
    onChangeLang(defaultLanguage);
  };

  const onChangeLang = (selectedLang) => {
    languageService.setLang(selectedLang);
    i18n.changeLanguage(selectedLang);
    setDefaultLanguage(selectedLang);
  };

  return (
    <>
      <div className="form-logo">
        <div>
          <Image preview={false} src={foodBeverageLogo} width={300} />
        </div>
      </div>
      <div className="login-contain login-contain__right">
        <Form
          onChange={onChange}
          form={form}
          className="login-form login-inner login-inner__spacing"
          name="basic"
          autoComplete="off"
          onFinish={({ userName, password }) => {
            onLogin({ userName, password });
          }}
        >
          <div className="frm-content">
            <Row className="form-lang">
              <Select
                suffixIcon={<ArrowDown />}
                dropdownClassName="select-language-dropdown"
                value={t(defaultLanguage)}
                onChange={(languageCode) => onChangeLang(languageCode)}
              >
                {languageList?.map((item) => {
                  return (
                    <Option key={item.key}>
                      <span className="flag">{item?.flag}</span>
                      <span>{t(item?.lang)}</span>
                    </Option>
                  );
                })}
              </Select>
            </Row>

            {loginErrorMessage && (
              <div className="error-field">
                <p>{loginErrorMessage}</p>
              </div>
            )}

            <h1 className="label-login">{pageData.titleLogin}</h1>
            <h4 className="label-input">{pageData.emailOrPhoneNumber}</h4>
            <Form.Item
              name="userName"
              rules={[
                {
                  required: true,
                  message: `${pageData.pleaseInputYourUsername}`,
                },
              ]}
              normalize={(value) => value.trim()}
            >
              <Input prefix={<UserNameIcon />} placeholder={pageData.username} />
            </Form.Item>
            <h4 className="label-input">{pageData.password}</h4>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: `${pageData.pleaseInputYourPassword}`,
                },
              ]}
            >
              <Input.Password
                prefix={<LockIcon />}
                iconRender={(visible) => (visible ? <EyeOpenIcon /> : <EyeIcon />)}
                placeholder={pageData.password}
              />
            </Form.Item>

            <Row className="forgot-password">
              <a className="login-form-forgot" href="">
                {pageData.forgotPassword}
              </a>
            </Row>

            <Form.Item className="login-btn">
              <Button loading={isLoginProcessing} type="primary" htmlType="submit" className="login-form-button">
                {pageData.loginHere}
              </Button>
            </Form.Item>

            <div className="content-bottom">
              <Space direction="vertical">
                <a href="https://gosell.vn/" target="_blank">
                  <EarthIcon />
                  <br />
                  {pageData.gosell}
                </a>
              </Space>
              <Space direction="vertical">
                <a href="mailto:cs@gofnb.com">
                  <HeadphoneIcon />
                  <br />
                  {pageData.csGnB}
                </a>
              </Space>
              <Space direction="vertical">
                <a href="tel:19001009">
                  <TabletIcon />
                  <br />
                  {pageData.hotline}
                </a>
              </Space>
            </div>
          </div>
        </Form>
      </div>
    </>
  );
};

export default LoginComponent;
