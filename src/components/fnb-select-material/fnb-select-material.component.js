import React from "react";
import "./fnb-select-material.scss";
import { Col, Row, Select, Typography } from "antd";
import { ImageMaterialDefault, SearchIcon } from "constants/icons.constants";
import { Thumbnail } from "components/thumbnail/thumbnail";
import { formatTextNumber } from "utils/helpers";

const { Option } = Select;
const { Text } = Typography;

export default function FnbSelectMaterialComponent(props) {
  const { t, onChangeEvent, materialList, className } = props;

  const pageData = {
    searchMaterial: t("inventoryChecking.search"),
    table: {
      inventory: t("inventoryChecking.inventory"),
    },
  };

  return (
    <>
      <Select
        value={null}
        placeholder={pageData.searchMaterial}
        showSearch
        onChange={onChangeEvent}
        className={`search-material-information ${className}`}
        suffixIcon=""
        filterOption={(input, option) => {
          return (
            option?.sku?.trim().toLowerCase().indexOf(input.trim().toLowerCase()) >= 0 ||
            option?.name?.trim().toLowerCase().indexOf(input.trim().toLowerCase()) >= 0
          );
        }}
        listHeight={500}
        placement="topLeft"
      >
        {materialList?.map((item) => (
          <Option key={item?.id} sku={item?.sku} name={item?.name} className="material-option-purchase-order">
            <Row>
              <Col xs={9} sm={9} md={9} lg={3}>
                {item?.thumbnail ? (
                  <div className="table-img-box">
                    <Thumbnail src={item?.thumbnail} width={80} height={80} />
                  </div>
                ) : (
                  <ImageMaterialDefault />
                )}
              </Col>
              <Col xs={0} sm={0} md={0} lg={21}>
                <Row className="group-information-material">
                  <Col span={12} className="item-information-material">
                    <Row>
                      <Col span={24} className="item-material-end text-bold">
                        <Text strong>{item?.name}</Text>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24} className="item-material-start text-normal">
                        <Text>{item?.sku}</Text>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={12} className="item-information-material">
                    <Row>
                      <Col span={24} className="item-material-end justify-right text-normal">
                        <Text>{pageData.table.inventory}:</Text>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24} className="item-material-start justify-right text-bold">
                        <Text strong>{`${item?.quantity ? formatTextNumber(item?.quantity) : 0} (${item?.unitName})`}</Text>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
              <Col xs={15} sm={15} md={15} lg={0} style={{ textAlign: "left" }}>
                <Row align="middle" justify="start">
                  <Col span={24}>
                    <Text strong>{item?.name}</Text>
                  </Col>
                </Row>
                <Row align="middle" justify="start">
                  <Col span={24}>
                    <Text italic>{item?.sku}</Text>
                  </Col>
                </Row>
                <Row align="middle" justify="start" className="padding-top">
                  <Col span={24}>
                    <Text>{pageData.table.inventory}:</Text>
                  </Col>
                </Row>
                <Row align="middle" justify="start">
                  <Col span={24}>
                    <Text strong>{`${item?.quantity ? formatTextNumber(item?.quantity) : 0} (${item?.unitName})`}</Text>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Option>
        ))}
      </Select>
      <div className="icon-search-material">
        <SearchIcon />
      </div>
    </>
  );
}
