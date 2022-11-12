import { Card } from "antd";
import { FnbCornerButton } from "components/fnb-corner-button/fnb-corner-button";
import { ArrowDownBottom } from "constants/icons.constants";
import { useState } from "react";

import "./product-item-detail-card.component.scss";

/**
 * @component PRODUCT ITEM COMPONENT
 * @return Product name, product image, toppings and options
 */
export function ProductItemDetailCardComponent(props) {
  const { className, body, description, expand } = props;
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className={className}>
      <input type="checkbox" id="card-description-active" className="d-none" checked={expanded} />
      {expand && expand === true && (
        <label
          for="active"
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          <FnbCornerButton icon={<ArrowDownBottom />} />
        </label>
      )}

      {body}
      <div className="description-wrapper">{description}</div>
    </Card>
  );
}
