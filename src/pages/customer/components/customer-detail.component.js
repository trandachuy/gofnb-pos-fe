import { Button, Col, DatePicker, Form, Image, Input, message, Modal, Radio, Row } from "antd";
import { FnbSelectSingle } from "components/fnb-select-single/fnb-select-single";
import { FnbTextArea } from "components/fnb-text-area/fnb-text-area.component";
import { CalendarNewIcon } from "constants/icons.constants";
import { ClassicMember, DatetimeFormat } from "constants/string.constants";
import customerDataService from "data-services/customer/customer.service";
import storeDataService from "data-services/store/store-data.service";
import moment from "moment";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatTextNumber, getCurrencyWithSymbol, getShortName, getValidationMessages } from "utils/helpers";
import "./customer-detail.component.scss";

const { forwardRef, useImperativeHandle } = React;
export const CustomerDetail = forwardRef((props, ref) => {
  const [t] = useTranslation();
  const { handleCancel, showDetailCustomer } = props;

  const pageData = {
    btnCancel: t("button.cancel"),
    btnUpdate: t("button.update"),
    btnSave: t("button.save"),
    allowedLetterAndNumber: t("form.allowedLetterAndNumber"),
    code: t("table.code"),
    mustBeBetweenThreeAndFifteenCharacters: t("form.mustBeBetweenThreeAndFifteenCharacters"),
    customerUpdateSuccess: t("customer.updateForm.customerUpdateSuccess"),
    customerUpdateFail: t("customer.updateForm.customerUpdateFail"),
    leaveForm: t("messages.leaveForm"),
    confirmation: t("leaveDialog.confirmation"),
    confirmLeave: t("button.confirmLeave"),
    discard: t("button.discard"),
    firstName: t("customer.addNewForm.firstName"),
    lastName: t("customer.addNewForm.lastName"),
    fullName: t("customer.addNewForm.fullName"),
    phone: t("customer.addNewForm.phone"),
    email: t("customer.addNewForm.email"),
    birthday: t("customer.addNewForm.birthday"),
    male: t("customer.addNewForm.male"),
    note: t("customer.addNewForm.note"),
    firstNamePlaceholder: t("customer.addNewForm.firstNamePlaceholder"),
    lastNamePlaceholder: t("customer.addNewForm.lastNamePlaceholder"),
    emailPlaceholder: t("customer.addNewForm.emailPlaceholder"),
    phonePlaceholder: t("customer.addNewForm.phonePlaceholder"),
    addressPlaceholder: t("customer.addNewForm.addressPlaceholder"),
    firstNameValidation: t("customer.addNewForm.firstNameValidation"),
    lastNameValidation: t("customer.addNewForm.lastNameValidation"),
    fullNameValidation: t("customer.addNewForm.fullNameValidation"),
    phoneValidation: t("customer.addNewForm.phoneValidation"),
    emailValidation: t("customer.addNewForm.emailValidation"),
    address: t("customer.addNewForm.address"),
    mustBeBetweenOneAndFiftyCharacters: t("customer.addNewForm.mustBeBetweenOneAndFiftyCharacters"),
    emailInvalidEmail: t("customer.addNewForm.emailInvalidEmail"),
    birthdayPlaceholder: t("customer.addNewForm.birthdayPlaceholder"),
    allowNumberOnly: t("form.allowNumberOnly"),
    validPhonePattern: t("form.validPhonePattern"),
    province: t("form.province"),
    district: t("form.district"),
    ward: t("form.ward"),
    selectProvince: t("form.selectProvince"),
    stateProvinceRegion: t("form.stateProvinceRegion"),
    selectProvinceStateRegion: t("form.selectProvinceStateRegion"),
    selectDistrict: t("form.selectDistrict"),
    validDistrict: t("form.validDistrict"),
    selectWard: t("form.selectWard"),
    uploadImage: t("productManagement.generalInformation.uploadImage"),
    female: t("customer.addNewForm.female"),
    rank: t("customer.rank"),
    rewardPoint: t("customer.updateForm.rewardPoint"),
    totalOrder: t("customer.updateForm.totalOrder"),
    totalMoney: t("customer.updateForm.totalMoney"),
    btnDelete: t("button.delete"),
    btnIgnore: t("button.ignore"),

    country: t("form.country"),
    customerManagement: t("customer.title"),

    generalInformation: t("customer.generalInformation"),
    gender: t("customer.addNewForm.gender"),

    labelAddress: t("form.address"),
    inputAddress: t("form.inputAddress"),
    validAddress: t("form.validAddress"),
    inputAddressOne: t("form.inputAddressOne"),
    inputAddressTwo: t("form.inputAddressTwo"),
    labelAddressTwo: t("form.addressTwo"),
    labelState: t("form.state"),
    labelZip: t("form.zip"),
    inputZip: t("form.inputZip"),
    validZip: t("form.validZip"),

    labelCity: t("form.city"),
    inputCity: t("form.inputCity"),
    validCity: t("form.validCity"),
  };

  const [form] = Form.useForm();
  const [phonecode, setPhonecode] = useState(null);
  const [isMale, setMale] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [wards, setWards] = useState([]);
  const [wardsByDistrictId, setWardsByDistrictId] = useState([]);
  const [districtsByCityId, setDistrictsByCityId] = useState([]);
  const [customer, setCustomer] = useState({});
  const [defaultCountryId, setDefaultCountryId] = useState(null);
  const [isDefaultCountry, setIsDefaultCountry] = useState(true);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  useImperativeHandle(ref, () => ({
    fetchData(customer) {
      fetchCustomerDetail(customer);
    },
  }));

  const fetchCustomerDetail = async (customer) => {
    if (customer) {
      await getInitDataAsync(customer);
    }
  };

  const getInitDataAsync = async (customerData) => {
    let promises = [];
    promises.push(storeDataService.getPrepareAddressDataAsync());
    promises.push(customerDataService.getCustomerByIdAsync(customerData?.customerId));
    let [prepareAddressDataResponse, customerResponse] = await Promise.all(promises);

    /// Meta data
    const { defaultCountry, cities, districts, wards, defaultCountryStore, countries, states } =
      prepareAddressDataResponse;
    setCities(cities);
    setDistricts(districts);
    setWards(wards);
    setPhonecode(defaultCountryStore?.phonecode);
    setCountries(countries);
    setStates(states);
    setDefaultCountryId(defaultCountry?.id);
    let address1 = null;
    let cityId = null;
    let districtId = null;
    let wardId = null;
    let countryId = null;
    let stateId = null;
    let cityTown = null;
    let address2 = null;

    /// Set customer data
    if (customerResponse) {
      const { customer } = customerResponse;
      address1 = customer?.address?.address1;
      cityId = customer?.address?.city?.id;
      districtId = customer?.address?.district?.id;
      wardId = customer?.address?.ward?.id;
      countryId = customer?.address?.countryId;
      stateId = customer?.address?.state?.id;
      cityTown = customer?.address?.cityTown;
      address2 = customer?.address?.address2;

      setCustomer(customer);
      setMale(customer?.gender);
      setIsDefaultCountry(countryId === defaultCountry?.id ? true : false);
      onChangeCity(cityId);
      onChangeDistrict(districtId);
      let country = countries?.find((item) => item.id === countryId);
      if (country) {
        setPhonecode(country.phonecode);
      }

      const initField = {
        ...customer,
        birthDay: customer?.birthday ? moment.utc(customer?.birthday).local() : null,
        phone: customer?.phoneNumber,
        address: {
          address1: address1,
          cityId: cityId,
          districtId: districtId,
          wardId: wardId,
          countryId: countryId,
          stateId: stateId,
          cityTown: cityTown,
          address2: address2,
        },
      };
      form.setFieldsValue(initField);

      let districtsFilteredByCity = districts?.filter((item) => item.cityId === cityId) ?? [];
      setDistrictsByCityId(districtsFilteredByCity);

      let wardsFilteredByCity = wards?.filter((item) => item.districtId === districtId) ?? [];
      setWardsByDistrictId(wardsFilteredByCity);
    }
  };

  const prefixSelector = <label>+{phonecode}</label>;

  const onFinish = async (values) => {
    const editUserRequestModel = {
      ...values,
      isMale: isMale,
      addressId: customer?.addressId,
      id: customer?.id,
    };
    customerDataService
      .updateCustomerAsync(editUserRequestModel)
      .then((res) => {
        if (res) {
          message.success(pageData.customerUpdateSuccess);
        } else {
          message.error(pageData.customerUpdateFail);
        }
        handleCancel();
      })
      .catch((errs) => {
        form.setFields(getValidationMessages(errs));
      });
  };

  const onGenderChange = (e) => {
    setMale(e.target.value);
  };

  const onChangeCity = (event) => {
    let districtsFilteredByCity = districts?.filter((item) => item.cityId === event) ?? [];
    setDistrictsByCityId(districtsFilteredByCity);

    let formValue = form.getFieldsValue();
    formValue.districtId = null;
    formValue.wardId = null;
    form.setFieldsValue(formValue);
  };

  const onChangeDistrict = (event) => {
    let wardsFilteredByCity = wards?.filter((item) => item.districtId === event) ?? [];
    setWardsByDistrictId(wardsFilteredByCity);

    let formValue = form.getFieldsValue();
    formValue.wardId = null;
    form.setFieldsValue(formValue);
  };

  const onCancel = () => {
    handleCancel();
  };

  return (
    <Modal
      className="customer-detail-modal"
      visible={showDetailCustomer}
      onCancel={() => onCancel()}
      footer={(null, null)}
      width={1143}
    >
      <Form autoComplete="off" name="basic" onFinish={onFinish} form={form}>
        <div className="customer-detail-wrapper">
          <div className="customer-left">
            <div className="customer-avt">
              {customer?.thumbnail ? (
                <Image preview={false} width={171} height={171} src={customer?.thumbnail ?? "error"} />
              ) : (
                <div className="customer-no-avt">
                  <span>{getShortName(customer?.fullName)}</span>
                </div>
              )}
            </div>
            <div className="customer-info">
              <span>{pageData.rank}</span>
              <div className="rank">{customer?.rank ?? ClassicMember}</div>
              <span>{pageData.rewardPoint}</span>
              <span></span>
              <span>{pageData.totalOrder}</span>
              <span className="total">{customer?.totalOrder}</span>
              <span>{pageData.totalMoney}</span>
              <span className="total">{`${formatTextNumber(customer?.totalMoney)}${getCurrencyWithSymbol()}`}</span>
            </div>
          </div>
          <div className="customer-right">
            <Row style={{ display: "grid" }}>
              <Row gutter={[25, 25]} className="form-row">
                <Col sm={24} xs={24} lg={12}>
                  <h4 className="fnb-form-label">
                    {pageData.fullName} <span className="text-danger">*</span>
                  </h4>
                  <Form.Item
                    name={"fullName"}
                    rules={[
                      {
                        required: true,
                        message: pageData.fullNameValidation,
                      },
                      { type: "string", warningOnly: true },
                      {
                        type: "string",
                        max: 50,
                        min: 1,
                        message: `${pageData.firstName} ${pageData.mustBeBetweenOneAndFiftyCharacters}`,
                      },
                    ]}
                  >
                    <Input
                      className="fnb-input-with-count"
                      showCount
                      maxLength={50}
                      size="large"
                      placeholder={pageData.fullNamePlaceholder}
                    />
                  </Form.Item>
                </Col>
                <Col sm={24} xs={24} lg={12}>
                  <h4 className="fnb-form-label">
                    {pageData.phone}
                    <span className="text-danger">*</span>
                  </h4>
                  <Form.Item
                    name={"phone"}
                    rules={[
                      {
                        required: true,
                        message: pageData.phoneValidation,
                      },
                      {
                        pattern: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
                        message: pageData.validPhonePattern,
                      },
                    ]}
                  >
                    <Input
                      maxLength={15}
                      className="fnb-input-addon-before"
                      size="large"
                      placeholder={pageData.phonePlaceholder}
                      addonBefore={prefixSelector}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[25, 25]} className="form-row c-mt-15">
                <Col sm={24} xs={24} lg={12}>
                  <h4 className="fnb-form-label">{pageData.email}</h4>
                  <Form.Item
                    name={"email"}
                    rules={[
                      {
                        required: false,
                        message: pageData.emailValidation,
                      },
                      {
                        type: "email",
                        message: pageData.emailInvalidEmail,
                      },
                    ]}
                  >
                    <Input className="fnb-input" size="large" placeholder={pageData.emailPlaceholder} />
                  </Form.Item>
                </Col>
                <Col sm={24} xs={24} lg={12}>
                  <h4 className="fnb-form-label">{pageData.birthday}</h4>
                  <Form.Item name={"birthDay"}>
                    <DatePicker
                      suffixIcon={<CalendarNewIcon />}
                      className="fnb-date-picker w-100"
                      format={DatetimeFormat.DD_MM_YYYY}
                      placeholder={pageData.birthdayPlaceholder}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[25, 25]} className="form-row c-mt-15">
                <Col sm={24} xs={24} lg={12}>
                  <h4 className="fnb-form-label">{pageData.gender}</h4>
                  <Form.Item>
                    <Radio.Group onChange={onGenderChange} value={isMale} className="gender-group">
                      <Row span={24}>
                        <Col sm={24} xs={24} lg={12}>
                          <Radio value={false}>{pageData.female}</Radio>
                        </Col>
                        <Col sm={24} xs={24} lg={12}>
                          <Radio value={true}>{pageData.male}</Radio>
                        </Col>
                      </Row>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[25, 25]} className="form-row c-mt-15">
                <Col sm={24} xs={24} lg={8}>
                  <h4 className="fnb-form-label">{pageData.country}</h4>
                  <Form.Item
                    initialValue={defaultCountryId}
                    name={["address", "countryId"]}
                    rules={[
                      {
                        required: true,
                        message: pageData.lastNameValidation,
                      },
                    ]}
                  >
                    <FnbSelectSingle
                      defaultValue={defaultCountryId}
                      size="large"
                      placeholder={pageData.selectCountry}
                      onChange={(value) => {
                        if (value && value !== defaultCountryId) {
                          setIsDefaultCountry(false);
                        } else {
                          setIsDefaultCountry(true);
                        }
                        let country = countries?.find((item) => item.id === value);
                        setPhonecode(country.phonecode);
                      }}
                      showSearch
                      autoComplete="none"
                      option={countries?.map((item, index) => ({
                        id: item.id,
                        name: item.nicename,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col sm={24} xs={24} lg={16}>
                  <h4 className="fnb-form-label">{pageData.address}</h4>
                  <Form.Item name={["address", "address1"]}>
                    <Input className="fnb-input" size="large" placeholder={pageData.addressPlaceholder} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[25, 25]} className="form-row c-mt-15">
                <Col sm={24} xs={24} lg={8}>
                  {isDefaultCountry ? (
                    <>
                      <h4 className="fnb-form-label">{pageData.province}</h4>
                      <Form.Item name={["address", "cityId"]}>
                        <FnbSelectSingle
                          size="large"
                          placeholder={pageData.selectProvince}
                          onChange={onChangeCity}
                          showSearch
                          autoComplete="none"
                          option={cities?.map((item, index) => ({
                            id: item.id,
                            name: item.name,
                          }))}
                        />
                      </Form.Item>
                    </>
                  ) : (
                    <>
                      <h4 className="fnb-form-label">{pageData.labelAddressTwo}</h4>
                      <Form.Item name={["address", "address2"]}>
                        <Input className="fnb-input" size="large" placeholder={pageData.inputAddressTwo} />
                      </Form.Item>
                    </>
                  )}
                </Col>
                <Col sm={24} xs={24} lg={8}>
                  {isDefaultCountry ? (
                    <>
                      <h4 className="fnb-form-label">{pageData.district}</h4>
                      <Form.Item name={["address", "districtId"]}>
                        <FnbSelectSingle
                          size="large"
                          placeholder={pageData.selectDistrict}
                          onChange={onChangeDistrict}
                          showSearch
                          autoComplete="none"
                          option={districtsByCityId?.map((item, index) => ({
                            id: item.id,
                            name: item.name,
                          }))}
                        />
                      </Form.Item>
                    </>
                  ) : (
                    <>
                      <h4 className="fnb-form-label">{pageData.labelCity}</h4>
                      <Form.Item name={["address", "cityTown"]} rules={[{ required: true }]}>
                        <Input className="fnb-input" placeholder={pageData.inputCity} />
                      </Form.Item>
                    </>
                  )}
                </Col>
                <Col sm={24} xs={24} lg={8}>
                  {isDefaultCountry ? (
                    <>
                      <h4 className="fnb-form-label">{pageData.ward}</h4>
                      <Form.Item name={["address", "wardId"]}>
                        <FnbSelectSingle
                          size="large"
                          placeholder={pageData.selectWard}
                          showSearch
                          option={wardsByDistrictId?.map((item, index) => ({
                            id: item.id,
                            name: item.name,
                          }))}
                        />
                      </Form.Item>
                    </>
                  ) : (
                    <>
                      <h4 className="fnb-form-label">{pageData.labelState}</h4>
                      <Form.Item name={["address", "stateId"]}>
                        <FnbSelectSingle
                          placeholder={pageData.selectProvinceStateRegion}
                          option={states?.map((item) => ({
                            id: item.id,
                            name: item.name,
                          }))}
                          showSearch
                        />
                      </Form.Item>
                    </>
                  )}
                </Col>
              </Row>
              <Row gutter={[25, 25]} className="form-row c-mt-15">
                <Col sm={24} xs={24} lg={24}>
                  <h4 className="fnb-form-label">{pageData.note}</h4>
                  <Form.Item
                    name={"note"}
                    rules={[
                      {
                        max: 1000,
                        message: pageData.descriptionMaximum,
                      },
                    ]}
                  >
                    <FnbTextArea showCount maxLength={1000} rows={4}></FnbTextArea>
                  </Form.Item>
                </Col>
              </Row>
              <div className="customer-button">
                <a className="c-cancel-btn" onClick={() => onCancel()}>
                  {pageData.btnCancel}
                </a>
                <Button htmlType="submit" type="primary" className="c-update-btn">
                  {pageData.btnUpdate}
                </Button>
              </div>
            </Row>
          </div>
        </div>
        <Form.Item hidden name={"id"}></Form.Item>
      </Form>
    </Modal>
  );
});
