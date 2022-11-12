import React, { useEffect } from "react";

import { PlusSquareOutlined, MinusSquareOutlined } from "@ant-design/icons";

import { Col, Input, Row } from "antd";



export function InputPlusMinus(props) {

  const { onChange, value } = props;

  return (

    <>

      <Row gutter={[16, 16]}>

        <Col span={4} className="">

          <MinusSquareOutlined

            onClick={() => {

              if (onChange) {

                onChange(value - 1);

              }

            }}

            className="fs-25"

          />

        </Col>

        <Col span={10} className="text-center">

          <span>{value}</span>

        </Col>

        <Col span={4} className="">

          <PlusSquareOutlined

            onClick={() => {

              if (onChange) {

                onChange(value + 1);

              }

            }}

            className="fs-25 text-left"

          />

        </Col>

      </Row>

    </>

  );

}