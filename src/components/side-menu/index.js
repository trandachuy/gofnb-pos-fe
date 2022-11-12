import React, { useState, useEffect } from "react";
import { Layout, Menu } from "antd";
import { compose } from "redux";
import { withRouter, Link } from "react-router-dom";
import "./index.scss";
import { hasPermission } from "utils/helpers";

import { store } from "store";
import { DefaultConstants } from "constants/string.constants";

const { Sider } = Layout;
const { SubMenu } = Menu;

function SideMenu(props) {
  const { t, menuItems, route, isChild, parentKey } = props;
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [currentSubMenuKeys, setCurrentSubMenuKeys] = useState([]);

  useEffect(() => {
    if (route.focus) {
      setSelectedKey(route.focus);
    } else {
      setSelectedKey(route.key);
    }

    if (isChild) {
      setCurrentSubMenuKeys([parentKey]);
    }
  }, [route]);
  const onCollapse = collapsed => {
    setCollapsed(collapsed);
  };

  const onOpenChange = items => {
    setCurrentSubMenuKeys(items);
  };

  const renderMenusItems = () => {
    const { session } = store.getState();
    const { user } = session?.auth;

    const html = menuItems.map(item => {
      if (item.child && item.child.length > 0) {
        const childs = item.child;
        let isAccess = false;
        childs.forEach(child => {
          if (hasPermission(child.permission) === true) {
            isAccess = true;
          }
        });
        if (isAccess === true) {
          return (
            <SubMenu key={item.key} icon={item.icon} title={t(item.name)}>
              {childs.map(child => {
                var isShow = child?.permission && hasPermission(child.permission);
                if (child.isMenu === true && isShow === true)
                  return (
                    <Menu.Item key={child.key}>
                      <Link to={child.path} />
                      {t(child.name)}
                    </Menu.Item>
                  );
              })}
            </SubMenu>
          );
        }
      } else {
        var isShow = item?.permission && hasPermission(item.permission);
        /// If item is menu, then check if it has permission
        if (item.isMenu === true && isShow === true) {
          return (
            <Menu.Item key={item.key} icon={item.icon}>
              <Link to={item.path} />
              {t(item.name)}
            </Menu.Item>
          );
        } else if (!item?.permission && user?.accountType === DefaultConstants.ADMIN_ACCOUNT) {
          /// If item is menu, then check if it has not permission
          return (
            <Menu.Item key={item.key} icon={item.icon}>
              <Link to={item.path} />
              {t(item.name)}
            </Menu.Item>
          );
        }
      }
    });
    return html;
  };
  return (
    <Sider
      style={{
        overflowY: "auto",
        overflowX: "hidden",
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
      }}
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
    >
      <div className="mt-3 mb-3">
        <h2 className="mb-0 logo">GO F&B</h2>
        <p className="logo">Admin</p>
      </div>
      <Menu
        theme="dark"
        selectedKeys={[selectedKey]}
        openKeys={currentSubMenuKeys}
        mode="inline"
        onOpenChange={e => onOpenChange(e)}
      >
        {renderMenusItems()}
      </Menu>
    </Sider>
  );
}

export default compose(withRouter)(SideMenu);
