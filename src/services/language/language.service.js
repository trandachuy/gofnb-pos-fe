import localeEN from "antd/es/date-picker/locale/en_US";
import localeVI from "antd/es/date-picker/locale/vi_VN";
import localeKR from "antd/es/date-picker/locale/ko_KR";
import localeJP from "antd/es/date-picker/locale/ja_JP";
import localeCN from "antd/es/date-picker/locale/zh_CN";
import localeTH from "antd/es/date-picker/locale/th_TH";
import localeMY from "antd/es/date-picker/locale/ms_MY";
import localeID from "antd/es/date-picker/locale/id_ID";
class LanguageService {
  setLang = langCode => {
    localStorage.setItem("i18nextLng", langCode);
  };

  getLang = () => {
    var langCode = localStorage.getItem("i18nextLng");
    return langCode ?? null;
  };

  getLocale = () => {
    var langCode = localStorage.getItem("i18nextLng");
    switch (langCode) {
      case "vi":
        return localeVI;
      case "en":
        return localeEN;
      case "ko":
        return localeKR;
      case "ja":
        return localeJP;
      case "zh":
        return localeCN;
      case "th":
        return localeTH;
      case "ms":
        return localeMY;
      case "id":
        return localeID;
      default:
        return localeEN;
    }
  };
}

const languageService = new LanguageService();
export default languageService;
