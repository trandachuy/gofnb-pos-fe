import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { Avatar, Layout, Popover } from "antd";

const { Header, Sider, Content } = Layout;

export default function TopBarPosComponent(props) {
  const { i18n, t, signedInUser, signOut, history } = props;
  const [isVisiblePopover, setIsVisiblePopover] = useState(false);

  return (
    <>
      <Header className="site-layout-background" style={{ padding: 0 }}>
        {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
          className: "trigger",
          onClick: this.toggle,
        })}
      </Header>
    </>
  );
}
