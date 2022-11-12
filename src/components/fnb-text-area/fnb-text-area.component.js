import { Input } from "antd";
/**
 * FnbTextArea component custom from antd text area
 * @param {value, onChange, className, showCount, maxLength, rows, defaultValue, allowClear } props
 * Params are used as same as antd text area, visit link https://ant.design/components/input/
 * @returns
 */
export function FnbTextArea(props) {
  const { value, onChange, className, showCount, maxLength, rows, defaultValue, allowClear, placeholder } = props;

  return (
    <Input.TextArea
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => {
        onChange(e);
      }}
      id="text-area-scroll"
      showCount={showCount}
      maxLength={maxLength}
      className={`fnb-text-area-with-count note ${className}`}
      rows={rows}
      allowClear={allowClear}
      placeholder={placeholder}
    ></Input.TextArea>
  );
}
