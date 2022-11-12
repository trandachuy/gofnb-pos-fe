import React, { useEffect, useState } from "react";
import { Modal, Tabs, Row, Col, Card, Button } from "antd";
import {
  TeamOutlined,
  PrinterOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  RightCircleOutlined,
} from "@ant-design/icons";
import { formatCurrency, formatDate } from "utils/helpers";
import { useTranslation } from "react-i18next";
import areaDataService from "data-services/area/area-data.service";
const { TabPane } = Tabs;

export default function TableOrderManagement(props) {
  const [t] = useTranslation();
  const { handleCancel } = props;

  const pageData = {
    title: t("tableOder.title"),
    pay: t("button.pay"),
    orderCreationDate: "30/05/2022",
  };
  const [areaData, setAreaData] = useState();

  useEffect(() => {
    props.tableFuncs.current = getInitDataAsync;
  }, []);

  const getInitDataAsync = () => {
    areaDataService.getAllAreasInUseAsync().then(res => {
      if (res.areas) {
        setAreaData(res.areas);
      }
    });
  };

  const renderActionButtons = orders => {
    let actionButtons = [
      <PrinterOutlined key="print" />,
      <Button type="primary" block className="w-80">
        {pageData.pay}
      </Button>,
    ];
    return orders?.length ? actionButtons : [];
  };

  const renderOrderTable = table => {
    return (
      <>
        <Col span={12}>
          <ClockCircleOutlined className="mt-2" />{" "}
          {table?.orders?.length ? formatDate(table?.orders[0].createdTime, "hh:mm") : ""}
        </Col>
        <Col span={12}>
          <DollarOutlined className="mt-2" />{" "}
          {table?.orders?.length ? formatCurrency(table?.orders[0].totalAmount) : ""}
        </Col>
      </>
    );
  };

  return (
    <Modal
      className="modal-add-language"
      title={pageData.title}
      visible={props.isModalVisible}
      footer={(null, null)}
      width={1000}
      onCancel={handleCancel}
    >
      <Tabs defaultActiveKey="0" tabPosition={"left"}>
        {areaData?.map((area, areaIndex) => {
          return (
            <TabPane
              tab={
                <span>
                  <RightCircleOutlined />
                  {area.name}
                </span>
              }
              key={areaIndex}
            >
              <div className="site-card-wrapper">
                <Row gutter={[16, 16]}>
                  {area?.areaTables.map((table, tableIndex) => {
                    return (
                      <Col span={8} key={tableIndex}>
                        <Card
                          title={table?.name}
                          bordered={true}
                          actions={renderActionButtons(table?.orders)}
                          className="h-100"
                        >
                          <Row>
                            <Col span={12}>
                              <TeamOutlined /> {table?.numberOfSeat}
                            </Col>
                          </Row>
                          <Row>{renderOrderTable(table)}</Row>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            </TabPane>
          );
        })}
      </Tabs>
    </Modal>
  );
}
