import React, { useEffect, useState } from "react";
import { Upload, message } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";

const urlServer = "https://www.mocky.io/v2/5cc8019d300000980a055e76";
export default function UploadImage(props) {
  const {
    buttonText,
    className,
    onChange,
    initData,
    debug,
    fileSizeLimitMessage,
    fileTypeMessage,
  } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [urlStoredServer, setUrlStoredServer] = useState(urlServer);
  const [file, setFile] = useState({
    name: "",
    previewTitle: "",
    url: "",
    preview: "",
  });

  useEffect(() => {
    if (initData) {
      setFile(initData);
    }
  }, []);

  /** Validate image upload
   * file types: image/jpeg || image/png
   * file size: <= 5mb
   * */
  const validateBeforeUpload = file => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      const messageError = fileTypeMessage || "You can only upload JPG/PNG file!";
      message.error(messageError);
      return;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      const errorMessage = fileSizeLimitMessage || "Image must smaller than 5MB!";
      message.error(errorMessage);
      return;
    }
    return isJpgOrPng && isLt5M;
  };

  /** Convert image to base 64 */
  const getBase64Async = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        resolve(reader.result);
      });
      reader.readAsDataURL(file);
      reader.onerror = error => reject(error);
    });
  };

  /** Upload image to server */
  const handleUploadAsync = async info => {
    info.fileList = [];
    if (debug === true) console.log("uploading >> ", info);

    if (info.file.status === "uploading") {
      setIsLoading(true);
      return;
    }

    if (info.file.status !== "uploading") {
      file.url = await getBase64Async(info.file.originFileObj);
      file.name = file.previewTitle =
        info.file.name || info.file.url.substring(file.url.lastIndexOf("/") + 1);
      setFile(file);
      setIsLoading(false);

      if (onChange) {
        onChange(file);
      }
    }
  };

  /** Render upload button */
  const uploadButton = (
    <div>
      {isLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>{buttonText || "Upload"}</div>
    </div>
  );
  return (
    <>
      <Upload
        listType="picture-card"
        className={className}
        action={urlStoredServer}
        showUploadList={false}
        beforeUpload={validateBeforeUpload}
        onChange={handleUploadAsync}
      >
        {file?.url ? <img src={file?.url} alt="avatar" style={{ width: "100%" }} /> : uploadButton}
      </Upload>
    </>
  );
}
