import { FolderIcon } from "constants/icons.constants";
import { useTranslation } from "react-i18next";
import "./no-data-found.component.scss";

export function NoDataFoundComponent(props) {
  const [t] = useTranslation();
  return (
    <>
      <div className="no-data-found-wrapper">
        <FolderIcon />
        <div>{t("table.noDataFound")}</div>
      </div>
    </>
  );
}
