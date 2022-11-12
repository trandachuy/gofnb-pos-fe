import "./product-option.component.scss";

export default function ProductOptionComponent(props) {
  const { className, title, details } = props;
  function renderDetail() {
    return details?.map((detail, index) => {
      return (
        <div key={index} className="detail-wrapper">
          <div className="detail">
            <div className="name">{detail?.name}</div>
            <span className="value">{detail?.value}</span>
          </div>
        </div>
      );
    });
  }

  return (
    <>
      {details && details?.length > 0 && (
        <div className={`${className ?? ""} product-option`}>
          <div className="title uppercase">
            <span>{title}</span>
          </div>
          <div className="detail-list">{renderDetail(details)}</div>
        </div>
      )}
    </>
  );
}
