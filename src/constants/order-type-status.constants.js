import { DeliveryIcon, InStoreIcon, TakeAwayIcon } from "./icons.constants";

/**
 * This file is constant file for order type status
 * mapping to EnumOrderType in Backend
 */
export const OrderTypeStatus = {
  /// <summary>
  /// Instore
  /// </summary>
  InStore: 0,

  /// <summary>
  /// Delivery
  /// </summary>
  Delivery: 1,

  /// <summary>
  /// Take Away
  /// </summary>
  TakeAway: 2,

  /// <summary>
  /// Online
  /// </summary>
  Online: 3,
};

export const OrderTypes = [
  {
    id: OrderTypeStatus.InStore,
    name: "In-Store",
    icon: <InStoreIcon />,
  },
  {
    id: OrderTypeStatus.TakeAway,
    name: "Take Away",
    icon: <TakeAwayIcon />,
  },
  {
    id: OrderTypeStatus.Delivery,
    name: "Delivery",
    icon: <DeliveryIcon />,
  },
];
