import { combineReducers } from "redux";
import sessionReducer from "./modules/session/session.reducers";
import processingReducer from "./modules/processing/processing.reducers";

const rootReducer = combineReducers({
  session: sessionReducer,
  processing: processingReducer,
});

export default rootReducer;
