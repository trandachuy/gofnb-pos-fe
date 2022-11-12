import { store } from "store";

export function getStoreConfigs() {
  const { session } = store.getState();
  return session?.storeInfo ?? null;
}
