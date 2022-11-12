import { Card, Modal, Row, Tabs } from "antd";
import { CardProfileIcon, CardTimeIcon, CloseModalEndShiftIcon } from "constants/icons.constants";
import { DatetimeFormat } from "constants/string.constants";
import areaDataService from "data-services/area/area-data.service";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./style.scss";

const { TabPane } = Tabs;

export default function SelectTableComponent(props) {
  const [t] = useTranslation();
  const { handleCancel, onSelectTable } = props;
  const [areaData, setAreaData] = useState();

  const pageData = {
    selectTable: t("tableOder.selectTable"),
    pay: t("button.pay"),
    inUse: t("tableOder.inUse"),
    available: t("tableOder.available"),
    inUseColor: "#ff9838",
    availableColor: "#52c41a",
    badgeInUse: "badge-text-in-use",
    badgeAvailable: "badge-text-available",
    inactive: t("tableOder.inactive"),
    dish: t("tableOder.dish"),
    location: t("tableOder.location"),
    time: t("tableOder.time"),
    seats: t("tableOder.seats"),
    numOfSeat: t("tableOder.numOfSeat"),
    free: t("tableOder.free"),
  };

  useEffect(() => {
    props.tableFuncs.current = getInitDataAsync;
  }, []);

  const getInitDataAsync = () => {
    areaDataService.getAllAreasActivatedAsync().then((res) => {
      if (res.areas) {
        setAreaData(res.areas);
      }
    });
  };

  //content of card
  const renderOrderTable = (table) => {
    return (
      <>
        <div className={table?.orders?.length > 0 ? "card-content" : "card-content selectable"}>
          <div className="header-table-card">
            {table?.orders?.length > 0 && <span className="cr-text cr-text--start">★</span>}
            <span title={table?.name} className="cr-text">
              {table?.name}
            </span>

            <div className="cr-text-wrapper">
              {table?.orders?.length > 0 ? (
                <div className="cr-text cr-text--is-in-used cr-text--border">
                  <span className="chill">•</span>
                  <span className="chill">{pageData.inUse}</span>
                </div>
              ) : (
                <div className="cr-text cr-text--is-in-used cr-text--border">
                  <span className="chill">•</span>
                  <span className="chill">{pageData.available}</span>
                </div>
              )}
            </div>
          </div>

          <div className="content-table-card spacing">
            <div className="ir">
              <span className="irblock">
                <span className="ire ire--left ire--icon">
                  <CardProfileIcon />
                </span>
                <span className="ire ire--left ire--text">{pageData.numOfSeat}</span>
              </span>
              <span className="ire ire--right ire--info">
                {table?.numberOfSeat} {pageData.seats}
              </span>
            </div>

            <div className="ir">
              <span className="irblock">
                <span className="ire ire--left ire--icon">
                  <CardTimeIcon />
                </span>
                <span className="ire ire--left ire--text">{pageData.time}</span>
              </span>
              <span className="ire ire--right ire--info">
                {table?.orderCreateDate
                  ? moment.utc(table?.orderCreateDate).local().format(DatetimeFormat.HH_MM_SS)
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  };
  const selectTable = (table, area) => {
    // If table is not in use then can be selected
    if (!table?.orders?.length) {
      let tableData = {
        id: table?.id,
        name: `${table?.name}-${area?.name}`,
      };
      onSelectTable(tableData);
    }
  };
  return (
    <Modal
      className="c-modal-table-order"
      title={pageData.selectTable}
      visible={props.isModalVisible}
      footer={(null, null)}
      onCancel={handleCancel}
      width={1279}
      style={{ maxHeight: "860px" }}
      closeIcon={<CloseModalEndShiftIcon />}
    >
      <Tabs defaultActiveKey="0" tabPosition={"left"} className="tabs">
        {areaData?.map((area, areaIndex) => {
          return (
            <TabPane className="tab-pane" tab={<span className="pannel-title">{area.name}</span>} key={areaIndex}>
              <Row className="area-header">
                <span className="area-title">{area.name}:&nbsp;</span>
                <span className="table-title">
                  {pageData.free}&nbsp;
                  <span className="total-available-table">{area?.totalAvailableTable}</span>/{area?.totalTable}{" "}
                  {pageData.table}
                </span>
              </Row>
              <div className="site-card-wrapper mt-3">
                <div className="table-content-wraper">
                  {area?.areaTables.map((table, tableIndex) => {
                    return table.isActive ? (
                      <div
                        key={tableIndex}
                        className={
                          table?.orders?.length > 0
                            ? "table-card table-card--in-use card-disable"
                            : "table-card table-card--available"
                        }
                      >
                        <Card bordered={false} className={"t-card"} onClick={() => selectTable(table, area)}>
                          <div className="table-card-content">{renderOrderTable(table)}</div>
                        </Card>
                      </div>
                    ) : (
                      ""
                    );
                  })}
                </div>
              </div>
            </TabPane>
          );
        })}
      </Tabs>
    </Modal>
  );
}
