import "./fnb-corner-button.scss";

export function FnbCornerButton(props) {
  const { icon, onClick } = props;
  return (
    <div className="fnb-corner-button">
      <button type="button" onClick={onClick}>
        {icon}
      </button>
    </div>
  );
}
