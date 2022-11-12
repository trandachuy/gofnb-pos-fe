import i18n from "utils/i18n";
import "./change-language.scss";
import { useEffect, useState } from "react";
import Flags from "country-flag-icons/react/1x1";
import { useTranslation } from "react-i18next";
import {
  setLanguageSession,
  callbackLanguage,
} from "./../../store/modules/session/session.actions";
import { useSelector, useDispatch } from "react-redux";
import { useOnOutsideClick } from "hooks/use-on-outside-click";
import languageService from "services/language/language.service";
import { ArrowDownLanguageIcon } from "constants/icons.constants";
import languageDataService from "data-services/language/language-data.service";

function ChangeLanguage() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const languageSession = useSelector(
    (state) => state.session?.languageSession
  );

  const [openLanguageBox, setOpenLanguageBox] = useState(false);
  const [languageList, setLanguageList] = useState([]);
  const [defaultLanguage, setDefaultLanguage] = useState(null);
  const { innerBorderRef } = useOnOutsideClick(() => setOpenLanguageBox(false));

  useEffect(() => {
    if (!languageSession) {
      loadLanguage();
      dispatch(callbackLanguage(loadLanguage));
    } else {
      let defaultLanguageCode = languageService.getLang();
      let language = languageSession.list.find(
        (lang) => lang.languageCode === defaultLanguageCode
      );

      setDefaultLanguage(language ?? languageSession.default);
      setLanguageList(languageSession.list);
    }
  }, []);

  const loadLanguage = () => {
    languageDataService
      .getListLanguageByStoreIdAndIsPublishAsync()
      .then((jsonObject) => {
        setLanguageList(jsonObject.languages);

        let defaultLanguageCode = languageService.getLang();
        let language = jsonObject.languages.find(
          (lang) => lang.languageCode === defaultLanguageCode
        );
        setDefaultLanguage(language);
        dispatch(
          setLanguageSession({ default: language, list: jsonObject.languages })
        );
      });
  };

  const onChangeLang = (selectedLang) => {
    languageService.setLang(selectedLang);
    i18n.changeLanguage(selectedLang);

    let language = languageList?.find(
      (lang) => lang.languageCode === selectedLang
    );

    setOpenLanguageBox(false);
    setDefaultLanguage(language);
  };

  const getFlag = (lang, index) => {
    var Flag = Flags[lang?.emoji];
    return (
      <div
        key={`language-item-with-index-${index}`}
        onClick={() => onChangeLang(lang?.languageCode)}
        className="language-item-flag-item-box"
      >
        <span className="wrap-flag-icon">
          <Flag title={t(lang?.name)} className="flag" />
        </span>

        <span>{t(lang?.name)}</span>
      </div>
    );
  };

  const getDefaultFlag = (languageCode, title) => {
    var Flag = Flags[languageCode];
    return (
      <div className="language-item-box">
        <span className="wrap-flag-icon">
          <Flag title={t(title)} className="flag" />
        </span>
        <span>{t(title)}</span>
      </div>
    );
  };

  const languageBoxToggle = () => {
    setOpenLanguageBox(!openLanguageBox);
  };

  return (
    <div ref={innerBorderRef} className="pos-language-box">
      {openLanguageBox && (
        <div className="popover-language-item">
          {languageList?.map((item, index) => getFlag(item, index))}
        </div>
      )}

      <div onClick={languageBoxToggle} className="pos-language-wrapper">
        {defaultLanguage &&
          getDefaultFlag(defaultLanguage.emoji, defaultLanguage.name)}{" "}
        <ArrowDownLanguageIcon />
      </div>
    </div>
  );
}

export default ChangeLanguage;
