import actionTypes from "./processing.type";
import Moment from "moment";
import { localStorageKeys, setStorage } from "utils/localStorage.helpers";

const processingInitialState = {
  isDataServiceProcessing: false,
  startUsingTime: Moment.utc(),
  usedTime: 0,
};

const processingReducer = (state = processingInitialState, action) => {
  switch (action.type) {
    case actionTypes.START_DATASERVICE_PROCESSING:
      return { ...state, isDataServiceProcessing: true };
    case actionTypes.STOP_DATASERVICE_PROCESSING:
      return { ...state, isDataServiceProcessing: false };
    case actionTypes.CALCULATE_USED_TIME:
      const usedTime = Moment.utc().diff(state.startUsingTime, "seconds");
      if (usedTime > 0) {
        setStorage(localStorageKeys.USED_TIME, usedTime);
        return { ...state, usedTime: usedTime, startUsingTime: Moment.utc() };
      }
      return state;
    default:
      return state;
  }
};

export default processingReducer;
