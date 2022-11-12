import actionTypes from "./processing.type";

export function startDataServiceProcessing() {
  return { type: actionTypes.START_DATASERVICE_PROCESSING };
}

export function stopDataServiceProcessing() {
  return { type: actionTypes.STOP_DATASERVICE_PROCESSING };
}

export function calculateUsedTime() {
  return { type: actionTypes.CALCULATE_USED_TIME };
}
