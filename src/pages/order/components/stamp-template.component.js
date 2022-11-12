import React, { useState, useRef } from "react";
import { StampType } from "constants/stamp-type.constants";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import { formatDate } from "utils/helpers";

const { forwardRef, useImperativeHandle } = React;

/** Params for StampTemplateComponent
 * @warning IF YOU CHANGE THIS FILE, YOU MUST CHANGE IT IN **SETTINGS/STORE/STAMP/COMPONENT/STAMP-TEMPLATE.COMPONENT.JS** ADMIN PROJECT
 * @param { stampConfig, stampData } from props
 * stampConfig = { stampType, isShowLogo, isShowTime, isShowNumberOfItem, isShowNote };
 * stampData = { code, logo, createdTime, itemList };
 * itemList = [{ no, name, note, options, current }];
 * options = [{ name, value }];
 *
 * @exportFunctions
 * render(stampConfig, stampData), print()
 */
export const StampTemplateComponent = forwardRef((props, ref) => {
  const [t] = useTranslation();
  const [stamp, setStamp] = useState(null);
  const [stampType, setStampType] = useState(StampType.mm50x30);
  const templateRef = useRef();

  useImperativeHandle(ref, () => ({
    render(stampConfig, stampData, isPrintAllItems, quantityPrint) {
      renderStampTemplate(stampConfig, stampData, isPrintAllItems, quantityPrint);
    },
    print() {
      printTemplate();
    },
  }));

  const renderStampTemplate = (stampConfig, stampData, isPrintAllItems, quantityPrint) => {
    const { stampType } = stampConfig;

    let newStampData = { ...stampData };
    if (isPrintAllItems && isPrintAllItems === true) {
      newStampData = {
        ...stampData,
        itemList: stampData?.itemList?.map((stampValue) => {        
          return {
            ...stampValue,
            current: true,          
          };
        }),
      };
    }

    const stampTemplate = buildStampTemplate(stampConfig, newStampData, isPrintAllItems, quantityPrint);
    const stamp = buildStampSize(stampType, stampTemplate);

    setStamp(stamp);
  };

  const printTemplate = useReactToPrint({
    content: () => templateRef.current,
    copyStyles: true,
  });

  const buildStampTemplate = (stampConfig, stampData, isPrintAllItems, quantityPrint) => {
    const { isShowLogo, isShowTime, isShowNumberOfItem, isShowNote } = stampConfig;
    const { code, logo, createdTime, note, itemList } = stampData;
    const time = formatDate(createdTime, "hh:mm A");
    const totalItem = itemList?.length ?? 0;
    const currentItems = itemList?.filter((item) => item.current === true);

    const stampTemplate = (currentItem) => {
      return (
        <>
          {isShowLogo ? (
            <>
              <tr>
                <td>{isShowLogo && <div><img style={styles.logoSession} src={logo} /></div>}</td>
                <td>
                  <strong style={styles.headerTitle}>{code}</strong>
                  <br />
                  <div style={styles.contentRight}>{isShowTime && <span>{time}</span>}</div>
                </td>
              </tr>
            </>
          ) : stampType == StampType.mm40x25 ? (
            <>
              <tr>
                <td>
                  <div style={styles.headerTitle40x25}>
                    <strong>{code}</strong>
                  </div>
                  <div style={styles.contentTitle40x25}>
                    <div>{isShowTime && <span>{time}</span>}</div>
                  </div>
                </td>
              </tr>
            </>
          ) : (
            <>
              <tr style={styles.trContent}>
                <td style={styles.left}>
                  <strong style={styles.headerTitleLeft}>{code}</strong>
                </td>
                <td style={styles.right}>
                  <div style={styles.contentTitleRight}>
                    <div>{isShowTime && <span>{time}</span>}</div>
                  </div>
                </td>
              </tr>
            </>
          )}
          <tr>
            <td colSpan={2}>
              {itemList
                ?.filter((i) => i.current === true)
                .map((item, index) => {
                  const { no, name, note, options } = item;
                  if (no !== currentItem?.no) return <></>;

                  return (
                    <>
                      <tr style={styles.trContent}>
                        <td>
                          <strong style={styles.title}>{name}</strong>
                        </td>
                        <td style={styles.titleRight}>
                          <div>
                            {isShowNumberOfItem && (
                              isPrintAllItems? (
                                <strong>
                                ({currentItem?.no}/{totalItem})
                              </strong>
                              ):
                              (
                                <strong>
                                ({quantityPrint})
                              </strong>
                              )
                              
                            )}
                          </div>
                        </td>
                      </tr>

                      {options?.map((option, index) => {
                        const { name, value } = option;
                        return (
                          <tr style={styles.trContent}>
                            <td style={styles.contentLeft}>
                              <span>{name}</span>
                            </td>
                            <td style={styles.contentRight}>
                              <span>{value}</span>
                            </td>
                          </tr>
                        );
                      })}

                      <tr>
                        {isShowNote && (
                          <td>
                            <strong style={styles.title}>Note</strong>
                          </td>
                        )}
                      </tr>
                      <tr>{isShowNote && <td style={styles.contentLeft}>{note}</td>}</tr>
                    </>
                  );
                })}
            </td>
          </tr>
        </>
      );
    };

    return currentItems?.map((currentItem) => {
      return <div style={styles.stampWrapper}>{stampTemplate(currentItem)}</div>;
    });
  };

  const buildStampSize = (stampType, stampTemplate) => {
    let template = <></>;
    setStampType(stampType);
    switch (stampType) {
      case StampType.mm40x25:
        template = <table style={styles.mm40x25}>{stampTemplate}</table>;
        break;
      case StampType.mm50x30:
        template = <table style={styles.mm50x30}>{stampTemplate}</table>;
        break;
      case StampType.mm50x40:
      default:
        template = <table style={styles.mm50x40}>{stampTemplate}</table>;
        break;
    }

    return (
      <div ref={templateRef} className="template-stamp">
        {template}
      </div>
    );
  };

  return <>{stamp}</>;
});

const styles = {
  headerTitle40x25: {
    fontStyle: "normal",
    fontWeight: 700,
    fontSize: "10px",
    lineHeight: "13px",
    color: "#000000",
    paddingTop: "8px",
    paddingLeft: "8px",
  },
  contentTitle40x25: {
    paddingLeft: "8px",
  },
  headerTitle: {
    fontStyle: "normal",
    fontWeight: 700,
    fontSize: "10px",
    lineHeight: "13px",
    textAlign: "right",
    color: "#000000",
    paddingTop: "8px",
    paddingRight: "8px",
    float: "right",
  },
  headerTitleLeft: {
    float: "left",
    fontStyle: "normal",
    fontWeight: 700,
    fontSize: "10px",
    lineHeight: "13px",
    color: "#000000",
    paddingTop: "8px",
    paddingLeft: "8px",
  },
  title: {
    paddingLeft: "8px",
    fontStyle: "normal",
    fontWeight: 700,
    fontSize: "9px",
    lineHeight: "11px",
  },
  titleRight: {
    paddingRight: "8px",
    float: "right",
  },
  contentLeft: {
    paddingLeft: "19px",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: "9px",
    lineHeight: "11px",
  },
  contentTitleRight: {
    paddingTop: "8px",
    paddingRight: "8px",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: "9px",
    lineHeight: "11px",
  },
  contentRight: {
    paddingRight: "8px",
    float: "right",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: "9px",
    lineHeight: "11px",
  },
  right: {
    float: "right",
  },
  left: {
    float: "left",
  },
  trContent: {
    display: "table",
    width: "100%",
  },
  textRight: {
    textAlign: "right",
  },
  logoSession: {
    marginTop: "4px",
    marginLeft: "8px",
    border: "1px solid #000",
    height: "32px",
    width: "32px",
  },
  mm50x40: {
    width: "50mm",
    height: "40mm",
    fontSize: "11px",
  },
  mm50x30: {
    width: "50mm",
    height: "30mm",
    fontSize: "11px",
  },
  mm40x25: {
    width: "40mm",
    height: "25mm",
    fontSize: "11px",
  },
};
