import React, { useState } from "react";
import { Avatar, Layout, Popover } from "antd";
import { useTranslation } from "react-i18next";
const { Header } = Layout;

function TopBar(props) {
  const [t] = useTranslation();
  const { signedInUser, signOut, history } = props;
  const [isVisiblePopover, setIsVisiblePopover] = useState(false);

  const logOut = () => {
    const { userId } = signedInUser;
    var request = { userId: userId };
    signOut(request).then(() => {
      history.push("/login");
    });
  };

  const getShortName = name => {
    const names = name?.split(" ") ?? "";
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    if (names.length === 1) {
      return names[0][0];
    }
    return names;
  };

  const showAndHideLanguageBox = value => {
    setIsVisiblePopover(value);
  };

  const renderContent = (
    <div>
      <p>
        <a onClick={() => logOut()}>{t("topBar.logOut")}</a>
      </p>
    </div>
  );

  return (
    <>
      <Header
        style={{
          position: "fixed",
          zIndex: 1,
          width: "100%",
          backgroundColor: "#d6d6d6",
          justifyContent: "flex-end",
          alignItems: "center",
          display: "flex",
        }}
      >
        <div
          style={{
            fontSize: "50px",
            color: "#08c",
            borderRadius: "30px",
            height: "50px",
            width: "50px",
            display: "flex",
            alignItems: "center",
            marginRight: "150px",
            cursor: "pointer",
          }}
        >
          <Popover content={renderContent} title={signedInUser?.fullName} trigger="click" placement="bottomRight">
            <Avatar style={{ color: "#f56a00", backgroundColor: "#fde3cf" }}>
              {getShortName(signedInUser?.fullName)}
            </Avatar>
          </Popover>
        </div>
      </Header>
    </>
  );
}

export default TopBar;
