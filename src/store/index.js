import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";
import { applyMiddleware, compose, createStore } from "redux";
import thunk from "redux-thunk";
import persistStore from "redux-persist/es/persistStore";
import rootReducer from "./index.reducers";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancer = composeEnhancers(applyMiddleware(thunk));

const configureStore = () => {
  const persistConfig = {
    key: "root",
    storage,
    timeout: null,
    whitelist: ["session"],
  };
  const persistedReducer = persistReducer(persistConfig, rootReducer);
  const store = createStore(persistedReducer, enhancer);
  const persister = persistStore(store);
  return { persister, store };
};

export const { persister, store } = configureStore();
