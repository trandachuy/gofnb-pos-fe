import { HomeIcon, KitchenIcon, ServiceIcon } from "./icons.constants";
import { PermissionKeys } from "./permission-key.constants";

export const LeftMenuItemIndex = {
  Home: 1,
  Kitchen: 2,
  Service: 3,
};

export const LeftMenuItemList = [
  {
    index: LeftMenuItemIndex.Home,
    path: "/",
    label: "leftMenu.home",
    icon: <HomeIcon />,
    permission: [PermissionKeys.CASHIER, PermissionKeys.SERVICE],
  },
  {
    index: LeftMenuItemIndex.Kitchen,
    path: "/kitchen",
    label: "leftMenu.kitchen",
    icon: <KitchenIcon />,
    permission: [PermissionKeys.KITCHEN],
  },
  // {
  //   index: LeftMenuItemIndex.Service,
  //   path: "/service",
  //   label: "leftMenu.service",
  //   icon: <ServiceIcon />,
  //   permission: [PermissionKeys.SERVICE],
  // },
];
