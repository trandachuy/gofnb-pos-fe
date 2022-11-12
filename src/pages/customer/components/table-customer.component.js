import React, { useState } from "react";
import { List, Skeleton, Row, Col, Space, Input, AutoComplete, Button } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import customerDataService from "data-services/customer/customer.service";
import { Percent, ClassicMember } from "constants/string.constants";
import { UserAddOutlined } from "@ant-design/icons";
import CreateCustomerPage from "./create-customer.page";
import { useTranslation } from "react-i18next";

export default function TableCustomer(props) {
  const [t] = useTranslation();
  const {
    onSelectCustomer,
    setCustomerPhone,
    setCustomerDiscountPercent,
    setCustomerRank,
    customer,
    customerAutoComplete,
    setCustomer,
    setCustomerAutoComplete,
    totalPriceOnBill,
    setCustomerName,
    setCustomerDiscount,
    setShowCustomer,
    showCreateCustomer,
    setShowCreateCustomer,
    fetchCustomerDataAsync,
  } = props;

  const [keySearch, setKeySearch] = useState(null);
  const pageData = {
    searchPlaceholder: t("customer.searchbyNamePhone"),
    createCustomerTitle: t("customer.addNewForm.titleAddNew"),
  };

  const onSelect = searchText => {
    customerDataService.getPosCustomersAsync(searchText).then(res => {
      let dataAuto = [];
      setCustomer(res.customer);
      res.customer.map(item => {
        dataAuto.push({ value: item?.customerName, label: item?.customerName });
      });
      setCustomerAutoComplete(dataAuto);
    });
  };

  const onChange = searchText => {
    setKeySearch(searchText);
    customerDataService.getPosCustomersAsync(searchText).then(res => {
      let dataAuto = [];
      setCustomer(res.customer);
      res.customer.map(item => {
        dataAuto.push({ value: item?.customerName, label: item?.customerName });
      });
      setCustomerAutoComplete(dataAuto);
    });
  };

  const selectCustomer = customerId => {
    var customerSelect = customer.find(x => x.id === customerId);
    setCustomerName(customerSelect?.customerName);
    let discount = (customerSelect?.discount * totalPriceOnBill) / 100;
    if (customerSelect?.maximumDiscount) {
      if (discount > customerSelect?.maximumDiscount) {
        setCustomerDiscount(customerSelect?.maximumDiscount);
      } else {
        setCustomerDiscount(discount);
      }
    } else {
      setCustomerDiscount(discount);
    }
    setShowCustomer(false);
    setCustomerDiscountPercent(customerSelect?.discount);
    setCustomerRank(customerSelect?.memberShip ?? ClassicMember);
    setCustomerPhone(customerSelect?.customerPhone);
    setKeySearch(null);
    onSelectCustomer(customerId);
  };

  const createCustomer = () => {
    setShowCreateCustomer(true);
  };

  return (
    <>
      <Row>
        <Col span={24}>
          <Space className="float-left mb-3">
            <AutoComplete
              options={customerAutoComplete}
              style={{ width: 550 }}
              onSelect={onSelect}
              onChange={onChange}
              value={keySearch}
            >
              <Input.Search size="medium" placeholder={pageData.searchPlaceholder} enterButton />
            </AutoComplete>
            <Button type="primary" icon={<UserAddOutlined />} onClick={() => createCustomer()}>
              {pageData.createCustomerTitle}
            </Button>
          </Space>
        </Col>
      </Row>
      {showCreateCustomer === false ? (
        <div
          id="scrollableDiv"
          style={{
            height: 400,
            overflow: "auto",
            border: "1px solid rgba(140, 140, 140, 0.35)",
          }}
        >
          <InfiniteScroll
            dataLength={customer.length}
            loader={
              <Skeleton
                avatar
                paragraph={{
                  rows: 1,
                }}
                active
              />
            }
            scrollableTarget="scrollableDiv"
          >
            <List
              dataSource={customer}
              renderItem={item => (
                <List.Item
                  key={item?.id}
                  onClick={() => selectCustomer(item?.id)}
                  className="pointer record-customer pl-3 pr-3"
                >
                  <List.Item.Meta title={item?.customerName} />
                  <List.Item.Meta title={item?.customerPhone} />
                  <List.Item.Meta
                    title={
                      item?.memberShip
                        ? item?.memberShip + " (" + item?.discount + " " + Percent + " )"
                        : ClassicMember + " (" + item?.discount + " " + Percent + " )"
                    }
                  />
                </List.Item>
              )}
            />
          </InfiniteScroll>
        </div>
      ) : (
        <CreateCustomerPage
          setShowCreateCustomer={setShowCreateCustomer}
          fetchCustomerDataAsync={fetchCustomerDataAsync}
        />
      )}
    </>
  );
}
