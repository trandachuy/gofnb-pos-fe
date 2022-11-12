import { Button } from "antd";
import React from "react";

export default function VisibleButton(props) {
  const { onClick, text, className, visible } = props;

  return (
    <>
      {visible === false ? (
        <></>
      ) : (
        <Button onClick={onClick} className={className}>
          {text}
        </Button>
      )}
    </>
  );
}
