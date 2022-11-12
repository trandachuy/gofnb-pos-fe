import { Link } from "react-router-dom";
import {
  OrderTypes,
  OrderTypeStatus,
} from "constants/order-type-status.constants";
import React, { useEffect, useState } from "react";
import { Image } from "antd";
import { ShowMoreIcon } from "constants/icons.constants";
import foodBeverageLogo from "assets/go-fnb-pos-text-logo.png";

export default function OrderTypeComponent(props) {
  const { setOrderTypeId, isOpenMenu, setIsOpenMenu } = props;
  const [leftMenuList, setLeftMenuList] = useState([]);

  useEffect(() => {
    let orderTypeList = OrderTypes.map((item, index) => ({
      value: item.id,
      label: item.name,
      icon: item.icon,
      activeLink: item.id === OrderTypeStatus.InStore,
      index,
    }));

    setLeftMenuList(orderTypeList);
    setVerticalSelector();
  }, []);

  const onChangeMenu = (currentIndex) => {
    let orderTypeList = [...leftMenuList];

    if (!orderTypeList[currentIndex].activeLink) {
      for (let index = 0; index < orderTypeList?.length; index++) {
        if (currentIndex === index) {
          orderTypeList[index].activeLink = true;
          setOrderTypeId(orderTypeList[index].value);
        } else {
          orderTypeList[index].activeLink = false;
        }
      }
      setLeftMenuList(orderTypeList);
      setVerticalSelector();
    }
  };

  /**
   * This function is used to calculate and apply a curve mask to the active item.
   */
  const setVerticalSelector = () => {
    setTimeout(() => {
      let ulTag = document.getElementById("pos-order-type-list");
      let verticalSelector = ulTag.querySelector("div.vertical-selector");
      let liTagIsActivated = ulTag.querySelector("li.order-type-is-activated");

      var currentActivePosition = liTagIsActivated.getBoundingClientRect();
      verticalSelector.style.top = `${currentActivePosition.top}px`;
      verticalSelector.style.height = `${currentActivePosition.height}px`;
    }, 100);
  };

  const renderOrderTypes = () => {
    return (
      <ul id="pos-order-type-list" className="pos-navbar-nav">
        <div class="vertical-selector">
          <div class="left">
            <div class="over-left"></div>
            <div class="over-right"></div>
          </div>
          <div class="right">
            <div class="over-left"></div>
            <div class="over-right"></div>
          </div>
        </div>
        {leftMenuList?.map((item, index) => (
          <li
            className={`nav-item ${
              item?.activeLink && "order-type-is-activated"
            }`}
          >
            <div className="curved-border-box">
              <div class="curved-border-left">
                <div class="curved-border-over-left"></div>
                <div class="curved-border-over-right"></div>
              </div>
              <div class="curved-border-right">
                <div class="curved-border-over-left"></div>
                <div class="curved-border-over-right"></div>
              </div>
            </div>

            <Link
              onClick={() => onChangeMenu(index)}
              to={`/`}
              className="nav-link"
            >
              {item.icon}
              <span className="order-type-name">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="order-type-container">
      <div className="order-type-separator"></div>

      <nav className="navbar">
        <Link className="navbar-logo" href="#">
          <Image preview={false} src={foodBeverageLogo} width={"80%"} />
        </Link>

        <div className="navbar-item-box">{renderOrderTypes()}</div>
      </nav>

      <div
        onClick={() => setIsOpenMenu(!isOpenMenu)}
        className="expand-control"
      >
        <ShowMoreIcon />
      </div>
    </div>
  );
}
