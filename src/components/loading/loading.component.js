import React from "react";
import "./loading.component.scss";
import spinningIcon from "assets/icons/loading.png";

function SpinIcon() {
  return <img src={spinningIcon} width={45} />;
}

export default function LoadingComponent(props) {
  return (
    <>
      {props.loading && (
        <>
          <div className="div-loader">
            <div className="loader-item">{SpinIcon()}</div>
          </div>
        </>
      )}
    </>
  );
}
