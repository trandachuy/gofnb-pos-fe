import React, { useEffect, useState } from "react";
import { Badge } from "antd";

export function BadgeStatus(props) {
  const { status } = props;
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    if (status?.id !== 0) {
      setIsActivated(true);
    }
  }, []);
  return (
    <>
      {isActivated ? (
        <Badge status="success" size="small" text={status?.name} />
      ) : (
        <Badge status="default" size="small" text={status?.name} />
      )}
    </>
  );
}
