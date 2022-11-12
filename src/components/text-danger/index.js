import { Typography } from "antd";
const { Text } = Typography;

export default function TextDanger(props) {
  return (
    <>
      <Text className={props?.className} type="danger">
        {props.text}
      </Text>
    </>
  );
}
