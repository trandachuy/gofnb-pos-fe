import { LoadingOutlined } from "@ant-design/icons";
import { Col, Pagination, Row, Table } from "antd";
import { FolderIcon } from "constants/icons.constants";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { hasPermission } from "utils/helpers";
import "./fnb-table.scss";

export function FnbTable(props) {
  const [t] = useTranslation();
  const {
    columns, // define columns
    dataSource, // define dataSource
    currentPageNumber, // number of current page
    pageSize, // number of record per page
    total, // total number of record
    onChangePage,
    rowSelection,
    className,
    editPermission,
    deletePermission,
    tableId,
    bordered,
    scrollY,
    footerMessage,
    loading,
    width,
  } = props;

  const pageData = {
    noDataFound: t("table.noDataFound"),
    filterButtonTitle: "Filter",
  };

  useEffect(() => {}, []);

  const getTableColumns = () => {
    // If not define permission to edit or delete, return default column
    if (!editPermission || !deletePermission) {
      return columns;
    }

    // If user has permission to edit or delete, return default column
    if (hasPermission(editPermission) || hasPermission(deletePermission)) {
      return columns;
    } else {
      // If user has no permission to edit or delete, then remove action column
      return columns;
    }
  };

  const renderPagination = () => {
    const hasPagination = total > pageSize;
    const currentView = dataSource?.length;

    if (hasPagination) {
      let showingMessage = t("table.showingRecordMessage", { showingRecords: currentView, totalRecords: total });
      if (footerMessage) {
        showingMessage = t(footerMessage, { showingRecords: currentView, totalRecords: total });
      }
      return (
        <div className="fnb-tbl-pagination">
          <div className="info-pagination">
            <div className="table-text-footer" dangerouslySetInnerHTML={{ __html: showingMessage }}></div>
          </div>
          <div className="fnb-pagination">
            <Pagination current={currentPageNumber} total={total} defaultPageSize={pageSize} onChange={onChangePage} />
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <div className="fnb-table-wrapper hide-pagination-options">
        <Row>
          <Col span={24}>
            <Table
              loading={{
                spinning: loading || loading === true,
                indicator: <LoadingOutlined />,
              }}
              locale={{
                emptyText: (
                  <>
                    <p className="text-center" style={{ marginBottom: "12px", marginTop: "105px" }}>
                      <FolderIcon />
                    </p>
                    <p className="text-center body-2" style={{ marginBottom: "181px", color: "#858585" }}>
                      {pageData.noDataFound}
                    </p>
                  </>
                ),
              }}
              scroll={{ x: width ?? 900, y: scrollY }}
              className={`fnb-table form-table ${className}`}
              columns={getTableColumns()}
              dataSource={dataSource}
              rowSelection={rowSelection}
              pagination={false}
              bordered={bordered}
              id={tableId}
            />
            {renderPagination()}
          </Col>
        </Row>
      </div>
    </>
  );
}
